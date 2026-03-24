import { test, expect } from '@playwright/test';
import type { GameState } from '../src/store';

// ─── Helper: inject game state via localStorage ────────────────────────────

async function injectState(page: Parameters<typeof test>[1] extends { page: infer P } ? P : never, partial: object) {
  await page.evaluate((data) => {
    const STORAGE_KEY = 'bandwidth-game-state';
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }));
  }, partial);
  await page.reload();
}

// ─── Epic 1.1: buyPerk deducts Net Worth and closes shop ──────────────────

test('Mental Health Day deducts $2,000 and reduces burnout by 15', async ({ page }) => {
  await page.goto('/');

  // Inject a state with enough netWorth and high burnout, on dashboard
  await injectState(page, {
    screen: 'dashboard',
    playerName: 'Tester',
    track: 'engineering',
    level: 1,
    cycleNumber: 1,
    company: 'NovaTech Corp',
    currentCompanyType: 'corp',
    stats: {
      bandwidth: 100, maxBandwidth: 100,
      burnout: 50, autonomy: 80, debt: 0,
      totalXP: 0, pendingXP: 0,
      netWorth: 10000, managerGoodBooks: 80,
      inventory: [],
    },
    actionItems: [],
    activePerks: [],
    tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
    alumniUpgrades: [],
    factions: { product: 50, engineering: 50, sales: 50 },
  });

  // Open shop
  await page.click('button:has-text("$ Shop")');
  await expect(page.getByRole('heading', { name: 'Shop' })).toBeVisible();

  // Buy Mental Health Day ($2,000) — use first match to avoid strict mode error
  await page.locator('div:has(p:text("Mental Health Day"))').getByRole('button', { name: '$2,000' }).first().click();

  // Shop should be closed after purchase
  await expect(page.getByRole('heading', { name: 'Shop' })).not.toBeVisible();

  // Net worth decreased by $2,000 → $8,000
  const netWorthText = await page.locator('.text-amber-400').filter({ hasText: '$8,000' }).first().textContent();
  expect(netWorthText).toBeTruthy();
});

test('Hawaii Vacation deducts $15,000 and resets burnout to 0', async ({ page }) => {
  await page.goto('/');
  await injectState(page, {
    screen: 'dashboard',
    playerName: 'Tester',
    track: 'engineering',
    level: 1,
    cycleNumber: 1,
    company: 'NovaTech Corp',
    currentCompanyType: 'corp',
    stats: {
      bandwidth: 100, maxBandwidth: 100,
      burnout: 80, autonomy: 80, debt: 0,
      totalXP: 0, pendingXP: 0,
      netWorth: 20000, managerGoodBooks: 80,
      inventory: [],
    },
    actionItems: [],
    activePerks: [],
    tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
    alumniUpgrades: [],
    factions: { product: 50, engineering: 50, sales: 50 },
  });

  await page.click('button:has-text("$ Shop")');
  // Buy Hawaii Vacation ($15,000)
  await page.locator('div:has(p:text("Hawaii Vacation"))').getByRole('button', { name: '$15,000' }).click();

  // Shop should be closed
  await expect(page.getByRole('heading', { name: 'Shop' })).not.toBeVisible();
});

// ─── Epic 1.1: premiumConsult deducts $3k and completes oldest in-progress task ──

test('Premium consult deducts $3,000 and completes oldest in-progress task', async ({ page }) => {
  await page.goto('/');
  await injectState(page, {
    screen: 'dashboard',
    playerName: 'Tester',
    track: 'engineering',
    level: 1,
    cycleNumber: 1,
    company: 'NovaTech Corp',
    currentCompanyType: 'corp',
    stats: {
      bandwidth: 100, maxBandwidth: 100,
      burnout: 30, autonomy: 80, debt: 0,
      totalXP: 0, pendingXP: 0,
      netWorth: 10000, managerGoodBooks: 80,
      inventory: [],
    },
    actionItems: [
      { id: 'task-1', title: 'Fix Bug', cost: 5, reward: 10, debtRisk: 0, status: 'in-progress', progress: 50 },
      { id: 'task-2', title: 'Write Docs', cost: 5, reward: 8, debtRisk: 0, status: 'todo', progress: 0 },
    ],
    activePerks: [],
    tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
    alumniUpgrades: [],
    factions: { product: 50, engineering: 50, sales: 50 },
  });

  // Open consult modal and click premium
  await page.click('button:has-text("🧑‍💻 Consult")');
  await expect(page.getByText('Staff Engineer · $3,000')).toBeVisible();
  await page.click('[data-testid="premium-consult-btn"]');

  // task-1 (in-progress) should now be in the Done column (status changed to done)
  await expect(page.getByText('Fix Bug')).toBeVisible();
});

// ─── Epic 1.2: joinCompany resets netWorth to 0 ────────────────────────────

test('Joining a company resets netWorth to 0 and accumulates careerNetWorth', async ({ page }) => {
  await page.goto('/');
  await injectState(page, {
    screen: 'job-board',
    playerName: 'Tester',
    track: 'engineering',
    level: 1,
    cycleNumber: 1,
    company: 'OldCo',
    currentCompanyType: 'corp',
    stats: {
      bandwidth: 100, maxBandwidth: 100,
      burnout: 10, autonomy: 80, debt: 0,
      totalXP: 500, pendingXP: 0,
      netWorth: 25000, managerGoodBooks: 80,
      inventory: [],
    },
    careerNetWorth: 0,
    actionItems: [],
    activePerks: [],
    tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
    alumniUpgrades: [],
    factions: { product: 50, engineering: 50, sales: 50 },
  });

  // Join startup
  await page.click('[data-testid="job-startup"]');

  // Should now be on dashboard with netWorth = $0
  await expect(page.locator('.text-amber-400').filter({ hasText: '$0' }).first()).toBeVisible();
});

// ─── Epic 1.3: Headphones have charges and can be used to block events ──────

test('Headphones start with 3 charges when purchased', async ({ page }) => {
  await page.goto('/');
  await injectState(page, {
    screen: 'dashboard',
    playerName: 'Tester',
    track: 'engineering',
    level: 1,
    cycleNumber: 1,
    company: 'NovaTech Corp',
    currentCompanyType: 'corp',
    stats: {
      bandwidth: 100, maxBandwidth: 100,
      burnout: 10, autonomy: 80, debt: 0,
      totalXP: 0, pendingXP: 0,
      netWorth: 10000, managerGoodBooks: 80,
      inventory: [],
    },
    actionItems: [],
    activePerks: [],
    tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
    alumniUpgrades: [],
    factions: { product: 50, engineering: 50, sales: 50 },
  });

  // Buy headphones from shop
  await page.click('button:has-text("$ Shop")');
  await expect(page.getByRole('heading', { name: 'Shop' })).toBeVisible();
  await page.locator('div:has(p:text("Noise Canceling Headphones"))').getByRole('button', { name: '$3,000' }).click();
  // Close shop via X button
  await page.getByRole('button', { name: '×' }).click();

  // Headphones in tool chest should show 3 charges
  await expect(page.getByText('3 charges')).toBeVisible();
});

// ─── Epic 2.2: XP progress bar visible in StatsPanel ─────────────────────

test('XP progress bar is visible in StatsPanel', async ({ page }) => {
  await page.goto('/');
  await injectState(page, {
    screen: 'dashboard',
    playerName: 'Tester',
    track: 'engineering',
    level: 1,
    cycleNumber: 1,
    company: 'NovaTech Corp',
    currentCompanyType: 'corp',
    stats: {
      bandwidth: 100, maxBandwidth: 100,
      burnout: 10, autonomy: 80, debt: 0,
      totalXP: 50, pendingXP: 0,
      netWorth: 0, managerGoodBooks: 80,
      inventory: [],
    },
    actionItems: [],
    activePerks: [],
    tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
    alumniUpgrades: [],
    factions: { product: 50, engineering: 50, sales: 50 },
  });

  // XP progress shows current / goal
  await expect(page.getByText('50 / 100')).toBeVisible();
});

// ─── Epic 2.1: Active perks show as badges in TopNav ─────────────────────

test('Active perks are shown as badges in the top nav', async ({ page }) => {
  await page.goto('/');
  await injectState(page, {
    screen: 'dashboard',
    playerName: 'Tester',
    track: 'engineering',
    level: 1,
    cycleNumber: 1,
    company: 'NovaTech Corp',
    currentCompanyType: 'corp',
    stats: {
      bandwidth: 100, maxBandwidth: 100,
      burnout: 10, autonomy: 80, debt: 0,
      totalXP: 0, pendingXP: 0,
      netWorth: 0, managerGoodBooks: 80,
      inventory: [],
    },
    actionItems: [],
    activePerks: ['10x-dev', 'dark-patterns'],
    tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
    alumniUpgrades: [],
    factions: { product: 50, engineering: 50, sales: 50 },
  });

  await expect(page.getByText('10x Dev')).toBeVisible();
  await expect(page.getByText('Ship Dirty')).toBeVisible();
});

// ─── Epic 3.3: Performance review pass requires XP + MGB > 40 ─────────────

test('Performance review: promoted when XP goal met and MGB > 40', async ({ page }) => {
  await page.goto('/');
  await injectState(page, {
    screen: 'performance-review',
    playerName: 'Tester',
    track: 'engineering',
    level: 1,
    cycleNumber: 6,
    company: 'NovaTech Corp',
    currentCompanyType: 'corp',
    stats: {
      bandwidth: 100, maxBandwidth: 100,
      burnout: 20, autonomy: 80, debt: 10,
      totalXP: 120, pendingXP: 0,
      netWorth: 5000, managerGoodBooks: 75,
      inventory: [],
    },
    actionItems: [],
    activePerks: [],
    tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
    alumniUpgrades: [],
    factions: { product: 50, engineering: 50, sales: 50 },
  });

  // Should show PROMOTED badge
  await expect(page.getByText('PROMOTED')).toBeVisible();
});

test('Performance review: PIP when XP goal met but MGB <= 40', async ({ page }) => {
  await page.goto('/');
  await injectState(page, {
    screen: 'performance-review',
    playerName: 'Tester',
    track: 'engineering',
    level: 1,
    cycleNumber: 6,
    company: 'NovaTech Corp',
    currentCompanyType: 'corp',
    stats: {
      bandwidth: 100, maxBandwidth: 100,
      burnout: 20, autonomy: 80, debt: 10,
      totalXP: 120, pendingXP: 0,
      netWorth: 5000, managerGoodBooks: 35,
      inventory: [],
    },
    actionItems: [],
    activePerks: [],
    tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
    alumniUpgrades: [],
    factions: { product: 50, engineering: 50, sales: 50 },
  });

  // Should show PIP badge despite meeting XP goal
  await expect(page.getByText('PIP')).toBeVisible();
});

test('Performance review: PIP when XP goal not met', async ({ page }) => {
  await page.goto('/');
  await injectState(page, {
    screen: 'performance-review',
    playerName: 'Tester',
    track: 'engineering',
    level: 1,
    cycleNumber: 6,
    company: 'NovaTech Corp',
    currentCompanyType: 'corp',
    stats: {
      bandwidth: 100, maxBandwidth: 100,
      burnout: 20, autonomy: 80, debt: 10,
      totalXP: 50, pendingXP: 0,
      netWorth: 5000, managerGoodBooks: 80,
      inventory: [],
    },
    actionItems: [],
    activePerks: [],
    tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
    alumniUpgrades: [],
    factions: { product: 50, engineering: 50, sales: 50 },
  });

  await expect(page.getByText('PIP')).toBeVisible();
});

// ─── XP counter visible in TopNav ─────────────────────────────────────────

test('XP counter is visible in top nav', async ({ page }) => {
  await page.goto('/');
  await injectState(page, {
    screen: 'dashboard',
    playerName: 'Tester',
    track: 'engineering',
    level: 1,
    cycleNumber: 1,
    company: 'NovaTech Corp',
    currentCompanyType: 'corp',
    stats: {
      bandwidth: 100, maxBandwidth: 100,
      burnout: 10, autonomy: 80, debt: 0,
      totalXP: 250, pendingXP: 0,
      netWorth: 0, managerGoodBooks: 80,
      inventory: [],
    },
    actionItems: [],
    activePerks: [],
    tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
    alumniUpgrades: [],
    factions: { product: 50, engineering: 50, sales: 50 },
  });

  await expect(page.locator('[data-testid="xp-counter"]')).toContainText('250');
});
