import { test, expect, type Page } from '@playwright/test';

// ─── Setup ────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('bandwidth-game-state'));
  await page.reload();
});

async function startGame(page: Page) {
  await page.getByRole('textbox').fill('Tester');
  await page.getByRole('button', { name: /start career/i }).click();
  await page.getByRole('button', { name: /accept offer/i }).click();
  await expect(page.getByText(/Cycle \d+/)).toBeVisible({ timeout: 10_000 });
}

async function dismissTutorial(page: Page) {
  const btn = page.getByRole('button', { name: /understood/i });
  if (await btn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(200);
  }
}

// ─── Test 7: Real-Time Clock Auto-End ──────────────────────────────────────

test('Test 7: Real-Time Clock Auto-End', async ({ page }) => {
  // Set a 2-second test cycle so we don't wait 90 seconds in CI
  // (E2E_SPEC.md: "or set a 2-second test timer")
  await page.evaluate(() => {
    (window as unknown as Record<string, number>).__testCycleDuration = 2;
  });

  await startGame(page);
  // Dismiss welcome tutorial — timer starts counting after this
  await dismissTutorial(page);

  // Wait for 2-second test cycle to expire + buffer for React re-render
  await page.waitForTimeout(4_000);

  // CycleSummaryModal must appear automatically (no user clicking End Cycle)
  await expect(page.getByTestId('cycle-summary')).toBeVisible({ timeout: 5_000 });
});

// ─── Test 8: In Review State & Buddy Bypass ────────────────────────────────

test('Test 8: In Review State & Buddy Bypass', async ({ page }) => {
  await startGame(page);
  await dismissTutorial(page);

  // Inject Review Buddy into inventory via exposed store
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { stats: Record<string, unknown> };
      setState: (s: Record<string, unknown>) => void;
    }>).__bandwidthStore;
    const stats = store.getState().stats;
    store.setState({
      stats: {
        ...stats,
        inventory: [{ type: 'review-buddy', name: 'Review Buddy' }],
        bandwidth: 100,
      },
    });
  });

  // Review Buddy appears in Tool Chest
  await expect(page.getByText('Review Buddy').first()).toBeVisible({ timeout: 3_000 });

  // Disable chaos RNG so grind ticks are deterministic
  await page.evaluate(() => { Math.random = () => 1.0; });

  // Click Work on the first card
  await page.getByRole('button', { name: /^Work/i }).first().click();

  // The Grind tutorial appears after clicking Work — dismiss it
  await dismissTutorial(page);

  // Grind until it enters In Review (4 clicks × +25 progress = 100%)
  for (let i = 0; i < 4; i++) {
    const grind = page.getByRole('button', { name: /^Grind/i }).first();
    if (!await grind.isVisible({ timeout: 2_000 }).catch(() => false)) break;
    await grind.click();
    await page.waitForTimeout(100);
  }

  // Assert the task is now "IN REVIEW" (not Done) — use exact to avoid matching the column header "In Review"
  await expect(page.getByText('IN REVIEW', { exact: true })).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText('DONE', { exact: true })).not.toBeVisible();

  // Use the Review Buddy button on the in-review card
  await page.getByRole('button', { name: /review buddy/i }).click();

  // Task instantly moves to Done
  await expect(page.getByText('DONE', { exact: true })).toBeVisible({ timeout: 5_000 });
});

// ─── Test 9: Job Board Meta-Progression ────────────────────────────────────

test('Test 9: Job Board Meta-Progression', async ({ page }) => {
  // Force game state directly into job-board screen with high XP and burnout
  await page.evaluate(() => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify({
      screen: 'job-board',
      playerName: 'Tester',
      track: 'engineering',
      level: 1,
      cycleNumber: 3,
      company: 'Acme Corp',
      stats: {
        bandwidth: 100,
        maxBandwidth: 100,
        burnout: 90,
        autonomy: 80,
        debt: 0,
        totalXP: 2000,
        pendingXP: 0,
        netWorth: 10000,
        managerGoodBooks: 80,
        inventory: [],
      },
      tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
      helpRequestCount: 0,
    }));
  });
  await page.reload();

  // Job Board renders
  await expect(page.getByText('The Job Board')).toBeVisible({ timeout: 5_000 });

  // Select "Crappy Startup (Free)"
  await page.getByTestId('job-startup').click();

  // Dashboard loads
  await expect(page.getByText(/Cycle \d+/)).toBeVisible({ timeout: 5_000 });

  // Burnout is now 0 (read via store)
  const burnout = await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { stats: { burnout: number } };
    }>).__bandwidthStore;
    return store.getState().stats.burnout;
  });
  expect(burnout).toBe(0);

  // XP reduced by exactly 10%: Math.floor(2000 * 0.90) = 1800
  await expect(page.getByTestId('xp-counter')).toContainText('1,800');
});
