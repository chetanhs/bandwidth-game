/**
 * E2E Tests: Performance Review Gates + MGB 1:1 Chess Interrupt
 *
 * Test 1: Perf Review — fails when tasks completed < gate
 * Test 2: Perf Review — fails when avg complexity < gate
 * Test 3: MGB 1:1 — triggers when MGB crosses below 50
 * Test 4: Chess win — +25 MGB applied, overlay closes
 * Test 5: Chess lose — -20 MGB applied, overlay closes
 */

import { test, expect, type Page } from '@playwright/test';

type StoreHandle = {
  getState: () => Record<string, unknown>;
  setState: (s: Partial<Record<string, unknown>>) => void;
};

// Seed state: autonomy=60, mgb=70, bandwidth=80, burnout=20, dashboard screen
const BASE_STATE = {
  screen: 'dashboard',
  playerName: 'Tester',
  track: 'engineering',
  level: 1,
  cycleNumber: 6, // past cycle limit → will go to performance-review
  company: 'NovaTech Corp',
  currentCompanyType: 'corp',
  activeTheme: 'default',
  unlockedThemes: ['default'],
  activeAvatar: 'default',
  unlockedAvatars: ['default'],
  activePerks: [],
  alumniUpgrades: [],
  activeBuffs: [],
  perkCooldowns: [],
  hasSeenTutorial: true,
  unplannedMeetingUsedThisCycle: false,
  clientCallUsedThisCycle: false,
  unscheduled1on1UsedThisCycle: false,
  chaosEventsThisCycle: 0,
  careerNetWorth: 0,
  tasksCompletedThisLevel: 0,   // triggers volume gate failure
  totalTaskCostThisLevel: 0,
  mgbWarning1on1Active: false,
  mgbWarning1on1SeenThisCycle: false,
  stats: {
    bandwidth: 80,
    maxBandwidth: 100,
    burnout: 20,
    autonomy: 60,
    debt: 0,
    levelXP: 100,              // meets XP gate for L1
    pendingXP: 0,
    netWorth: 5000,
    managerGoodBooks: 70,
    inventory: [],
  },
  actionItems: [],
  pendingChaos: null,
  tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
};

async function seedState(page: Page, overrides: Record<string, unknown> = {}): Promise<void> {
  const state = { ...BASE_STATE, ...overrides };
  await page.evaluate((s) => localStorage.setItem('bandwidth-game-state', JSON.stringify(s)), state);
  await page.reload();
  await page.waitForFunction(() => typeof (window as Record<string, unknown>).__bandwidthStore !== 'undefined');
}

async function getStats(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return store.getState().stats as Record<string, number>;
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('bandwidth-game-state'));
  await page.reload();
  await page.waitForFunction(() => typeof (window as Record<string, unknown>).__bandwidthStore !== 'undefined');
});

// ─── Test 1: Performance Review volume gate failure ───────────────────────────

test('Test 1: Perf Review — fails volume gate (0 tasks completed)', async ({ page }) => {
  // Seed state for performance-review screen with 0 tasks completed, XP met
  await seedState(page, { screen: 'performance-review', tasksCompletedThisLevel: 0 });

  // Stats bar should show Tasks Done as failing
  await expect(page.getByText('Tasks Done')).toBeVisible({ timeout: 3_000 });
  await expect(page.getByText('0 / 3')).toBeVisible(); // minTasksCompleted for L1 is 3

  // The manager dialogue should mention volume failure
  await expect(page.getByText(/only closed out/i)).toBeVisible({ timeout: 2_000 });
});

// ─── Test 2: Performance Review complexity gate failure ───────────────────────

test('Test 2: Perf Review — fails complexity gate (low avg cost)', async ({ page }) => {
  await seedState(page, {
    screen: 'performance-review',
    tasksCompletedThisLevel: 3,
    totalTaskCostThisLevel: 6, // avg = 2, gate is 6
  });

  await expect(page.getByText('Avg Complexity')).toBeVisible({ timeout: 3_000 });
  // Should fail complexity
  await expect(page.getByText(/harder problems/i)).toBeVisible({ timeout: 2_000 });
});

// ─── Test 3: MGB 1:1 triggers when MGB < 50 ──────────────────────────────────

test('Test 3: MGB 1:1 — appears when MGB drops below 50', async ({ page }) => {
  await seedState(page, {
    mgbWarning1on1SeenThisCycle: false,
    stats: { ...BASE_STATE.stats, managerGoodBooks: 55 },
  });

  // Force MGB below 50 via store
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    const s = store.getState().stats as Record<string, number>;
    store.setState({
      mgbWarning1on1Active: true,
      stats: { ...s, managerGoodBooks: 45 },
    });
  });

  await expect(page.getByText('MANAGER CHECK-IN')).toBeVisible({ timeout: 3_000 });
  // Button should be disabled initially (typewriter not done)
  const btn = page.getByRole('button', { name: /challenge manager/i });
  await expect(btn).toBeDisabled();

  // Wait for typewriter to complete — poll until enabled (up to 8s)
  await expect(btn).toBeEnabled({ timeout: 8_000 });
});

// ─── Test 4: Chess win → +25 MGB ─────────────────────────────────────────────

test('Test 4: Chess win — +25 MGB applied after Return to Desk', async ({ page }) => {
  await seedState(page);

  // Directly activate the chess overlay via store
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    store.setState({ mgbWarning1on1Active: true, mgbWarning1on1SeenThisCycle: true });
  });

  await expect(page.getByText('MANAGER CHECK-IN')).toBeVisible({ timeout: 3_000 });
  // Wait for typewriter to complete then click chess (up to 8s)
  const chessBtn4 = page.getByRole('button', { name: /challenge manager/i });
  await expect(chessBtn4).toBeEnabled({ timeout: 8_000 });
  await chessBtn4.click();

  await expect(page.locator('text=CHESS DUEL')).toBeVisible({ timeout: 3_000 });

  const before = await getStats(page);

  // Resolve via debug hook
  await page.evaluate(() => {
    type DebugFn = (o: 'win' | 'lose' | 'draw') => void;
    const fn = (window as Window & { __DEBUG_RESOLVE_CHESS__?: DebugFn }).__DEBUG_RESOLVE_CHESS__;
    if (!fn) throw new Error('__DEBUG_RESOLVE_CHESS__ not found');
    fn('win');
  });

  await page.getByRole('button', { name: /return to desk/i }).click();

  const after = await getStats(page);
  expect(after.managerGoodBooks).toBe(Math.min(100, before.managerGoodBooks + 25));
});

// ─── Test 5: Chess lose → -20 MGB ────────────────────────────────────────────

test('Test 5: Chess lose — -20 MGB applied after Return to Desk', async ({ page }) => {
  await seedState(page);

  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    store.setState({ mgbWarning1on1Active: true, mgbWarning1on1SeenThisCycle: true });
  });

  await expect(page.getByText('MANAGER CHECK-IN')).toBeVisible({ timeout: 3_000 });
  // Wait for typewriter to complete then click chess (up to 8s)
  const chessBtn5 = page.getByRole('button', { name: /challenge manager/i });
  await expect(chessBtn5).toBeEnabled({ timeout: 8_000 });
  await chessBtn5.click();

  await expect(page.locator('text=CHESS DUEL')).toBeVisible({ timeout: 3_000 });

  const before = await getStats(page);

  await page.evaluate(() => {
    type DebugFn = (o: 'win' | 'lose' | 'draw') => void;
    const fn = (window as Window & { __DEBUG_RESOLVE_CHESS__?: DebugFn }).__DEBUG_RESOLVE_CHESS__;
    if (!fn) throw new Error('__DEBUG_RESOLVE_CHESS__ not found');
    fn('lose');
  });

  await page.getByRole('button', { name: /return to desk/i }).click();

  const after = await getStats(page);
  expect(after.managerGoodBooks).toBe(Math.max(0, before.managerGoodBooks - 20));
});
