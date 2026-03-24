/**
 * E2E Tests: Manager Duel Mini-Game (Phase 24)
 *
 * Test 1: Arcade Mode Mounting
 * Test 2: Game Loop Integration & Timer Pause
 * Test 3: Victory State Math (+30 Autonomy, +15 MGB, timer resumes)
 * Test 4: Defeat State Math (-30 Bandwidth, +20 Burnout)
 *
 * Architecture note: The canvas-based game cannot be driven by Playwright at
 * 60fps. Instead, ManagerDuel exposes window.__DEBUG_RESOLVE_DUEL__(outcome)
 * which freezes the game loop and shows the victory/defeat overlay, letting
 * the test then click [ Return to Desk ] to trigger the onComplete callback.
 */

import { test, expect, type Page } from '@playwright/test';

// ─── Store handle type ────────────────────────────────────────────────────────

type StoreHandle = {
  getState: () => Record<string, unknown>;
  setState: (s: Partial<Record<string, unknown>>) => void;
};

// ─── Seeded dashboard state ───────────────────────────────────────────────────
// Known starting values for math assertions:
//   autonomy: 60, managerGoodBooks: 70, bandwidth: 80, burnout: 20
// After win:  autonomy=90, mgb=85
// After lose: bandwidth=50, burnout=40

const BASE_STATE = {
  screen: 'dashboard',
  playerName: 'Tester',
  track: 'engineering',
  level: 1,
  cycleNumber: 1,
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
  hasSeenTutorial: true,       // suppresses onboarding tour
  unplannedMeetingUsedThisCycle: false,
  clientCallUsedThisCycle: false,
  unscheduled1on1UsedThisCycle: false,
  chaosEventsThisCycle: 0,
  careerNetWorth: 0,
  stats: {
    bandwidth: 80,
    maxBandwidth: 100,
    burnout: 20,
    autonomy: 60,
    debt: 0,
    levelXP: 0,
    pendingXP: 0,
    netWorth: 5000,
    managerGoodBooks: 70,
    inventory: [],
  },
  actionItems: [
    {
      id: 'task-duel-test',
      title: 'Write Unit Tests',
      cost: 10,
      reward: 20,
      debtRisk: 5,
      status: 'in-progress',
      progress: 50,
    },
  ],
  pendingChaos: null,
  tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function seedDashboard(page: Page): Promise<void> {
  await page.evaluate((state) => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify(state));
  }, BASE_STATE);
  await page.reload();
  // Ensure the Zustand store is ready before tests call into it
  await page.waitForFunction(() => typeof (window as Record<string, unknown>).__bandwidthStore !== 'undefined');
}

/** Inject a chaos event directly into the Zustand store (bypasses UI) */
async function injectChaos(page: Page, type: string): Promise<void> {
  await page.evaluate((t) => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    store.setState({ pendingChaos: { type: t } });
  }, type);
}

/** Call the debug hook to freeze the game in the given outcome state */
async function resolveViaHook(page: Page, outcome: 'win' | 'lose'): Promise<void> {
  await page.evaluate((o) => {
    type DebugFn = (outcome: 'win' | 'lose') => void;
    const fn = (window as Window & { __DEBUG_RESOLVE_DUEL__?: DebugFn }).__DEBUG_RESOLVE_DUEL__;
    if (!fn) throw new Error('__DEBUG_RESOLVE_DUEL__ not found — ManagerDuel not mounted?');
    fn(o);
  }, outcome);
}

/** Read stats object directly from the Zustand store */
async function getStats(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return store.getState().stats as Record<string, number>;
  });
}

/** Parse a sprint timer display ("01:29") into total seconds */
function parseTimerSeconds(text: string): number {
  const clean = text.replace(/\s/g, '');
  const [mm, ss] = clean.split(':').map(Number);
  return mm * 60 + ss;
}

// ─── Shared setup ─────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Clear persisted state then reload so every test starts from a known screen
  await page.evaluate(() => localStorage.removeItem('bandwidth-game-state'));
  await page.reload();
  // Wait for the Zustand store to be exposed — the store module sets
  // __bandwidthStore synchronously when the bundle runs, but we need to
  // ensure the bundle has fully executed before tests call into it.
  await page.waitForFunction(() => typeof (window as Record<string, unknown>).__bandwidthStore !== 'undefined');
});

// ─── Test 1: Arcade Mode Mounting ────────────────────────────────────────────

test('Test 1: Arcade Mode — canvas mounts and debug hook surfaces overlay', async ({ page }) => {
  // Start from the main start screen (no seeded state needed)
  // The Test Labs button is intentionally subdued — match on its visible text
  await page.getByText('[ Test Labs ]').click();

  // Arcade menu should appear
  await expect(page.getByText('ARCADE MODE')).toBeVisible({ timeout: 3_000 });

  // Launch the duel game
  await page.getByRole('button', { name: /1:1 shooting duel/i }).click();

  // Canvas must be visible — proves the rAF engine mounted successfully
  await expect(page.locator('canvas')).toBeVisible({ timeout: 5_000 });

  // Use the debug hook to trigger the victory overlay
  await resolveViaHook(page, 'win');

  // [ Return to Desk ] button must appear inside the victory overlay
  await expect(page.getByRole('button', { name: /return to desk/i })).toBeVisible({ timeout: 3_000 });
});

// ─── Test 2: Game Loop Integration & Timer Pause ─────────────────────────────

test('Test 2: Game Loop — sprint timer freezes while duel is active', async ({ page }) => {
  await seedDashboard(page);

  // Inject the Unscheduled 1:1 chaos event via the store
  await injectChaos(page, 'unscheduled-1on1');

  // Chaos modal must appear with the duel button
  await expect(page.getByText('Unscheduled 1:1')).toBeVisible({ timeout: 3_000 });
  await expect(page.getByRole('button', { name: /duel manager/i })).toBeVisible({ timeout: 2_000 });

  // Click [ 🔫 Duel Manager ] — triggers triggerDuel() and mounts ManagerDuel
  await page.getByRole('button', { name: /duel manager/i }).click();

  // Duel overlay (canvas) must appear
  await expect(page.locator('canvas')).toBeVisible({ timeout: 5_000 });

  // Read the sprint timer now (it is frozen — duelActive = true)
  // textContent() works even though TopNav is visually hidden behind the overlay
  const t1 = (await page.getByTestId('sprint-timer').textContent()) ?? '';
  expect(t1).toMatch(/^\d{2}:\d{2}$/); // sanity: correct format

  // Wait 2.1 seconds — longer than one timer tick (1000ms)
  await page.waitForTimeout(2_100);

  const t2 = (await page.getByTestId('sprint-timer').textContent()) ?? '';

  // Timer must NOT have advanced during the duel
  expect(t1).toBe(t2);
});

// ─── Test 3: Victory State Math ──────────────────────────────────────────────

test('Test 3: Victory — +30 Autonomy, +15 MGB, timer resumes after Return to Desk', async ({ page }) => {
  await seedDashboard(page);

  // Trigger the duel
  await injectChaos(page, 'unscheduled-1on1');
  await page.getByRole('button', { name: /duel manager/i }).click();
  await expect(page.locator('canvas')).toBeVisible({ timeout: 5_000 });

  // Capture stats before resolution
  const before = await getStats(page);

  // Force win via debug hook — freezes loop and shows victory overlay
  await resolveViaHook(page, 'win');
  await expect(page.getByRole('button', { name: /return to desk/i })).toBeVisible({ timeout: 3_000 });

  // Dismiss the overlay — this fires onComplete('win') → resolveDuel('win')
  await page.getByRole('button', { name: /return to desk/i }).click();

  // Stats must be updated
  const after = await getStats(page);
  expect(after.autonomy).toBe(Math.min(100, before.autonomy + 30));
  expect(after.managerGoodBooks).toBe(Math.min(100, before.managerGoodBooks + 15));

  // Timer must resume — wait 1.5s and verify the display changed
  const timerText1 = (await page.getByTestId('sprint-timer').textContent()) ?? '';
  await page.waitForTimeout(1_500);
  const timerText2 = (await page.getByTestId('sprint-timer').textContent()) ?? '';

  expect(parseTimerSeconds(timerText2)).toBeLessThan(parseTimerSeconds(timerText1));
});

// ─── Test 4: Defeat State Math ───────────────────────────────────────────────

test('Test 4: Defeat — -30 Bandwidth, +20 Burnout', async ({ page }) => {
  await seedDashboard(page);

  // Trigger the duel
  await injectChaos(page, 'unscheduled-1on1');
  await page.getByRole('button', { name: /duel manager/i }).click();
  await expect(page.locator('canvas')).toBeVisible({ timeout: 5_000 });

  // Capture stats before resolution
  const before = await getStats(page);

  // Force loss via debug hook — freezes loop and shows defeat overlay
  await resolveViaHook(page, 'lose');
  await expect(page.getByRole('button', { name: /return to desk/i })).toBeVisible({ timeout: 3_000 });

  // Dismiss the overlay — fires onComplete('lose') → resolveDuel('lose')
  await page.getByRole('button', { name: /return to desk/i }).click();

  // Stats must be updated
  const after = await getStats(page);
  expect(after.bandwidth).toBe(Math.max(0, before.bandwidth - 30));
  expect(after.burnout).toBe(Math.min(100, before.burnout + 20));
});
