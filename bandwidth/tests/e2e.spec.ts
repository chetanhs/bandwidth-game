/**
 * E2E Tests 12–16: Phase 10 Deep Systems
 *
 * Test 12: Perk Draft & Modifier Engine
 * Test 13: L5 Auto-Battler & Timer Isolation (page.clock)
 * Test 14: Faction Politics & Triage
 * Test 15: Faction Ultimatum (The 20% Trigger)
 * Test 16: True Meta-Progression (Cross-Session Persistence via localStorage reload)
 */

import { test, expect, type Page } from '@playwright/test';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function clearStorage(page: Page) {
  await page.evaluate(() => localStorage.removeItem('bandwidth-game-state'));
}

async function dismissTutorial(page: Page) {
  const btn = page.getByRole('button', { name: /understood/i });
  if (await btn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(150);
  }
}

type StoreHandle = {
  getState: () => Record<string, unknown>;
  setState: (s: Record<string, unknown>) => void;
};

/** Seed localStorage and reload, then optionally patch store state */
async function seedState(page: Page, state: Record<string, unknown>, patch?: Record<string, unknown>) {
  await page.evaluate((s) => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify(s));
  }, state);
  await page.reload();
  if (patch) {
    await page.evaluate((p) => {
      const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
      store.setState(p);
    }, patch);
  }
}

const BASE_STATE = {
  screen: 'dashboard',
  playerName: 'Tester',
  track: 'engineering',
  level: 1,
  cycleNumber: 1,
  company: 'NovaTech Corp',
  currentCompanyType: 'corp',
  isProUser: false,
  activeTheme: 'default',
  unlockedThemes: ['default'],
  activeAvatar: 'default',
  unlockedAvatars: ['default'],
  activePerks: [],
  stats: {
    bandwidth: 100,
    maxBandwidth: 100,
    burnout: 0,
    autonomy: 80,
    debt: 0,
    totalXP: 0,
    pendingXP: 0,
    netWorth: 5000,
    managerGoodBooks: 80,
    inventory: [],
  },
  tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
  helpRequestCount: 0,
  factions: { product: 50, engineering: 50, sales: 50 },
  careerNetWorth: 0,
  alumniUpgrades: [],
};

// ─── Test 12: Perk Draft & Modifier Engine ────────────────────────────────────

test('Test 12: Perk Draft & Modifier Engine', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);

  await seedState(page, {
    ...BASE_STATE,
    activePerks: ['caffeine-addict'],
    stats: { ...BASE_STATE.stats, bandwidth: 50, pendingXP: 50 },
  });
  await dismissTutorial(page);

  // ── Part A: Verify perk draft UI ──
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    store.setState({
      cycleSummaryOpen: true,
      cycleSummary: {
        xpEarned: 50,
        salaryEarned: 5000,
        bandwidthBefore: 80,
        maxBandwidth: 100,
        lootDrop: null,
      },
      pendingPerkDraft: [
        { id: 'caffeine-addict', name: 'Caffeine Addict', description: 'Double BW/burnout from coffee', modifierEffects: {} },
        { id: 'blame-shifter',   name: 'Blame Shifter',   description: 'Rush adds 0 debt',             modifierEffects: {} },
        { id: '10x-dev',         name: '10x Dev',         description: '3x chaos chance',              modifierEffects: {} },
      ],
      activePerks: [],
    });
  });

  await expect(page.getByTestId('cycle-summary')).toBeVisible({ timeout: 5_000 });
  await expect(page.getByTestId('perk-card-caffeine-addict')).toBeVisible();
  await expect(page.getByTestId('perk-card-blame-shifter')).toBeVisible();
  await expect(page.getByTestId('perk-card-10x-dev')).toBeVisible();

  const ctaBtn = page.getByTestId('start-next-cycle-btn');
  await expect(ctaBtn).toBeDisabled();

  await page.getByTestId('perk-card-caffeine-addict').click();
  await expect(ctaBtn).toBeEnabled();

  await ctaBtn.scrollIntoViewIfNeeded();
  await ctaBtn.click();
  await expect(page.getByTestId('cycle-summary')).not.toBeVisible({ timeout: 5_000 });

  // ── Part B: Caffeine Addict doubles BW gain ──
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    const state = store.getState();
    store.setState({ stats: { ...(state.stats as object), bandwidth: 50 } });
  });

  await page.getByRole('button', { name: /coffee/i }).click();

  const bwAfter = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState().stats as { bandwidth: number }).bandwidth;
  });
  expect(bwAfter).toBe(Math.min(50 + 50, 100));
});

// ─── Test 13: L5 Auto-Battler & Timer Isolation ───────────────────────────────

test('Test 13: L5 Auto-Battler & Timer Isolation', async ({ page }) => {
  await page.clock.install({ time: 0 });
  await page.goto('/');
  await clearStorage(page);

  await page.evaluate(() => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify({
      screen: 'dashboard',
      playerName: 'Tester',
      track: 'engineering',
      level: 5,
      cycleNumber: 1,
      company: 'NovaTech Corp',
      currentCompanyType: 'corp',
      isProUser: true,
      activeTheme: 'default',
      unlockedThemes: ['default'],
      activeAvatar: 'default',
      unlockedAvatars: ['default'],
      activePerks: [],
      stats: {
        bandwidth: 100, maxBandwidth: 100, burnout: 0, autonomy: 80,
        debt: 0, totalXP: 0, pendingXP: 0, netWorth: 50000,
        managerGoodBooks: 80, inventory: [],
      },
      tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
      helpRequestCount: 0,
      factions: { product: 50, engineering: 50, sales: 50 },
      careerNetWorth: 0,
      alumniUpgrades: [],
    }));
  });
  await page.reload();

  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    store.setState({
      actionItems: [{
        id: 'clock-task-1', title: 'Clock Test Task', cost: 10, reward: 20,
        debtRisk: 5, status: 'todo', progress: 0, isBlocked: false,
      }],
      directReports: [
        { id: 'jr-clock-0', name: 'Alex', assignedTaskId: null },
        { id: 'jr-clock-1', name: 'Jordan', assignedTaskId: null },
      ],
    });
  });

  // Grind button absent at L5
  await expect(page.locator('[data-testid^="grind-btn-"]')).toHaveCount(0, { timeout: 3_000 });

  // Assign junior → task in-progress
  const select = page.getByTestId('junior-select-clock-task-1');
  await expect(select).toBeVisible({ timeout: 3_000 });
  await select.selectOption({ value: 'jr-clock-0' });

  await expect(async () => {
    const status = await page.evaluate(() => {
      const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
      return (store.getState().actionItems as Array<{ id: string; status: string }>)
        .find((a) => a.id === 'clock-task-1')?.status;
    });
    expect(status).toBe('in-progress');
  }).toPass({ timeout: 3_000 });

  // Fast-forward 2s → progress increases
  await page.clock.fastForward(2000);
  await page.waitForTimeout(50);

  const progressAfterTick = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState().actionItems as Array<{ id: string; progress: number }>)
      .find((a) => a.id === 'clock-task-1')?.progress ?? 0;
  });
  expect(progressAfterTick).toBeGreaterThan(0);

  // Inject blocker → progress frozen
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    const items = store.getState().actionItems as Array<Record<string, unknown>>;
    store.setState({ actionItems: items.map((a) => a.id === 'clock-task-1' ? { ...a, isBlocked: true } : a) });
  });

  const progressBeforeBlockedTick = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState().actionItems as Array<{ id: string; progress: number }>)
      .find((a) => a.id === 'clock-task-1')?.progress ?? 0;
  });

  await page.clock.fastForward(2000);
  await page.waitForTimeout(50);

  const progressAfterBlockedTick = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState().actionItems as Array<{ id: string; progress: number }>)
      .find((a) => a.id === 'clock-task-1')?.progress ?? 0;
  });
  expect(progressAfterBlockedTick).toBe(progressBeforeBlockedTick);

  // Clear blocker → costs 10 BW
  const clearBtn = page.getByTestId('clear-blocker-btn-clock-task-1');
  await expect(clearBtn).toBeVisible({ timeout: 3_000 });

  const bwBeforeClear = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState().stats as { bandwidth: number }).bandwidth;
  });

  await clearBtn.click();

  const bwAfterClear = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState().stats as { bandwidth: number }).bandwidth;
  });
  expect(bwAfterClear).toBe(bwBeforeClear - 10);

  // Progress resumes after unblock
  await page.clock.fastForward(2000);
  await page.waitForTimeout(50);

  const progressAfterUnblock = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState().actionItems as Array<{ id: string; progress: number }>)
      .find((a) => a.id === 'clock-task-1')?.progress ?? 0;
  });
  expect(progressAfterUnblock).toBeGreaterThan(progressAfterBlockedTick);

  // Cycle timer independent of junior ticks
  const cycleNumber = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState() as { cycleNumber: number }).cycleNumber;
  });
  expect(cycleNumber).toBe(1);
});

// ─── Test 14: Faction Politics & Triage ──────────────────────────────────────

test('Test 14: Faction Politics & Triage', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);

  // Seed at L2 so Rush button is available; factions start at 50
  await seedState(page, {
    ...BASE_STATE,
    level: 2,
    factions: { product: 50, engineering: 50, sales: 50 },
    stats: { ...BASE_STATE.stats, bandwidth: 100 },
  });
  await dismissTutorial(page);

  // ── Assert initial faction values are exactly 50 ──
  const initialFactions = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState() as { factions: { product: number; engineering: number; sales: number } }).factions;
  });
  expect(initialFactions.product).toBe(50);
  expect(initialFactions.engineering).toBe(50);
  expect(initialFactions.sales).toBe(50);

  // Faction bars visible in StatsPanel
  await expect(page.getByTestId('faction-product')).toBeVisible({ timeout: 3_000 });
  await expect(page.getByTestId('faction-engineering')).toBeVisible({ timeout: 3_000 });
  await expect(page.getByTestId('faction-sales')).toBeVisible({ timeout: 3_000 });

  // Inject 3 tasks so cycle doesn't auto-advance after one action
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    store.setState({
      actionItems: [
        { id: 'ft-1', title: 'Task 1', cost: 10, reward: 20, debtRisk: 10, status: 'todo', progress: 0 },
        { id: 'ft-2', title: 'Task 2', cost: 10, reward: 20, debtRisk: 10, status: 'todo', progress: 0 },
        { id: 'ft-3', title: 'Task 3', cost: 10, reward: 20, debtRisk: 10, status: 'todo', progress: 0 },
      ],
    });
  });

  // ── Rush task 1 → +Product, -Engineering ──
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    (store.getState() as { workOnTask: (id: string) => void }).workOnTask('ft-1');
    (store.getState() as { rushTask: (id: string) => void }).rushTask('ft-1');
  });

  const factionsAfterRush = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState() as { factions: { product: number; engineering: number; sales: number } }).factions;
  });
  expect(factionsAfterRush.product).toBeGreaterThan(50);    // +5
  expect(factionsAfterRush.engineering).toBeLessThan(50);   // -5
  expect(factionsAfterRush.sales).toBe(50);                 // unchanged

  // Verify faction bars updated in the DOM
  const productValue = await page.getByTestId('faction-product').getAttribute('data-value');
  expect(Number(productValue)).toBeGreaterThan(50);

  // ── Escalate task 2 → +Engineering, -Sales ──
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    (store.getState() as { workOnTask: (id: string) => void }).workOnTask('ft-2');
    (store.getState() as { escalateTask: (id: string) => void }).escalateTask('ft-2');
  });

  const factionsAfterEscalate = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState() as { factions: { product: number; engineering: number; sales: number } }).factions;
  });
  // Engineering recovered from escalate
  expect(factionsAfterEscalate.engineering).toBeGreaterThan(factionsAfterRush.engineering);
  // Sales decreased
  expect(factionsAfterEscalate.sales).toBeLessThan(50);

  // Verify sales bar updated in DOM
  const salesValue = await page.getByTestId('faction-sales').getAttribute('data-value');
  expect(Number(salesValue)).toBeLessThan(50);
});

// ─── Test 15: Faction Ultimatum (The 20% Trigger) ────────────────────────────

test('Test 15: Faction Ultimatum (The 20% Trigger)', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);

  // Seed with Sales at 21 and totalXP = 1000 so we can verify the -50% penalty
  await seedState(page, {
    ...BASE_STATE,
    level: 2,
    factions: { product: 50, engineering: 50, sales: 21 },
    stats: { ...BASE_STATE.stats, bandwidth: 100, totalXP: 1000 },
  });
  await dismissTutorial(page);

  // Inject 3 tasks so cycle doesn't auto-advance
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    store.setState({
      actionItems: [
        { id: 'ult-task-1', title: 'Ultimatum Task 1', cost: 10, reward: 20, debtRisk: 5, status: 'todo', progress: 0 },
        { id: 'ult-task-2', title: 'Ultimatum Task 2', cost: 10, reward: 20, debtRisk: 5, status: 'todo', progress: 0 },
        { id: 'ult-task-3', title: 'Ultimatum Task 3', cost: 10, reward: 20, debtRisk: 5, status: 'todo', progress: 0 },
      ],
    });
  });

  // ── Escalate task 1 → Sales drops from 21 to 16 (below 20%) ──
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    (store.getState() as { workOnTask: (id: string) => void }).workOnTask('ult-task-1');
    (store.getState() as { escalateTask: (id: string) => void }).escalateTask('ult-task-1');
  });

  // ── Assert Sales dropped below 20 ──
  const factionsAfter = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState() as { factions: { product: number; engineering: number; sales: number } }).factions;
  });
  expect(factionsAfter.sales).toBeLessThan(20);

  // ── Assert ultimatum notification appeared (Client Churn message) ──
  const chattyMsg = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState() as { chattyManagerMessage: string | null }).chattyManagerMessage;
  });
  expect(chattyMsg).not.toBeNull();
  expect(chattyMsg).toMatch(/client churn/i);

  // ChattyManager dialogue should be visible in the DOM
  await expect(page.getByTestId('chatty-manager-dialogue')).toBeVisible({ timeout: 3_000 });

  // ── Assert -50% XP penalty applied ──
  // totalXP was 1000; after -50% it should be 500
  const totalXPAfter = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState().stats as { totalXP: number }).totalXP;
  });
  expect(totalXPAfter).toBe(500);
});

// ─── Test 16: True Meta-Progression (Cross-Session Persistence) ──────────────

test('Test 16: True Meta-Progression (Cross-Session Persistence)', async ({ page }) => {
  await page.goto('/');
  await clearStorage(page);

  // ── Step 1: Seed job-board with careerNetWorth = $50,000 ──
  // Write directly to localStorage so the store hydrates from it on reload
  await page.evaluate(() => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify({
      screen: 'job-board',
      playerName: 'Tester',
      track: 'engineering',
      level: 1,
      cycleNumber: 1,
      company: 'NovaTech Corp',
      currentCompanyType: 'corp',
      isProUser: false,
      activeTheme: 'default',
      unlockedThemes: ['default'],
      activeAvatar: 'default',
      unlockedAvatars: ['default'],
      activePerks: [],
      stats: {
        bandwidth: 100, maxBandwidth: 100, burnout: 0, autonomy: 80,
        debt: 0, totalXP: 0, pendingXP: 0, netWorth: 5000,
        managerGoodBooks: 80, inventory: [],
      },
      tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
      helpRequestCount: 0,
      factions: { product: 50, engineering: 50, sales: 50 },
      careerNetWorth: 50000,
      alumniUpgrades: [],
    }));
  });
  await page.reload();

  // ── Step 2: Navigate to Alumni Network ──
  const alumniBtn = page.getByTestId('open-alumni-network');
  await expect(alumniBtn).toBeVisible({ timeout: 3_000 });
  await alumniBtn.click();

  await expect(page.getByTestId('career-net-worth')).toBeVisible({ timeout: 3_000 });
  await expect(page.getByTestId('career-net-worth')).toContainText('50,000');

  // ── Step 3: Purchase Ivy League Degree ($50,000) ──
  const buyBtn = page.getByTestId('buy-alumni-upgrade-ivy-league');
  await expect(buyBtn).toBeVisible();
  await buyBtn.click();

  // Verify in-memory state: upgrade owned, careerNetWorth = 0
  const stateAfterBuy = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    const s = store.getState();
    return {
      alumniUpgrades: (s as { alumniUpgrades: string[] }).alumniUpgrades,
      careerNetWorth: (s as { careerNetWorth: number }).careerNetWorth,
    };
  });
  expect(stateAfterBuy.alumniUpgrades).toContain('ivy-league');
  expect(stateAfterBuy.careerNetWorth).toBe(0);

  // ── Step 4: Verify localStorage was written with the upgrade ──
  const lsAfterBuy = await page.evaluate(() => {
    const raw = localStorage.getItem('bandwidth-game-state');
    if (!raw) return null;
    return JSON.parse(raw) as { alumniUpgrades: string[]; careerNetWorth: number };
  });
  expect(lsAfterBuy).not.toBeNull();
  expect(lsAfterBuy!.alumniUpgrades).toContain('ivy-league');
  expect(lsAfterBuy!.careerNetWorth).toBe(0);

  // ── Step 5: RELOAD the page — simulates a fresh browser session ──
  await page.reload();

  // After reload, the store should hydrate from localStorage
  // We should still be on job-board (or alumni-network — wherever the screen was persisted)
  // Navigate back to job-board if needed
  const screenAfterReload = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState() as { screen: string }).screen;
  });

  // If we're on alumni-network after reload, go back to job-board
  if (screenAfterReload === 'alumni-network') {
    await page.getByTestId('back-to-job-board').click();
  }

  // Verify upgrades survived the reload
  const stateAfterReload = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    const s = store.getState();
    return {
      alumniUpgrades: (s as { alumniUpgrades: string[] }).alumniUpgrades,
      careerNetWorth: (s as { careerNetWorth: number }).careerNetWorth,
    };
  });
  expect(stateAfterReload.alumniUpgrades).toContain('ivy-league');
  expect(stateAfterReload.careerNetWorth).toBe(0);

  // ── Step 6: Join a company — Ivy League should start at Level 2 ──
  await expect(page.getByTestId('job-startup')).toBeVisible({ timeout: 3_000 });
  await page.getByTestId('job-startup').click();

  // Assert level is 2 (L4 Engineer) due to Ivy League upgrade persisted across reload
  const newLevel = await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return (store.getState() as { level: number }).level;
  });
  expect(newLevel).toBe(2);

  // ── Step 7: Verify the dashboard shows L4 Engineer ──
  // StatsPanel shows the current role label
  await expect(page.getByRole('complementary').getByText('L4 Engineer')).toBeVisible({ timeout: 3_000 });
});
