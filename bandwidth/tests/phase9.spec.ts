import { test, expect, type Page } from '@playwright/test';

// ─── Setup ────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('bandwidth-game-state'));
  await page.reload();
});

async function dismissTutorial(page: Page) {
  const btn = page.getByRole('button', { name: /understood/i });
  if (await btn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(200);
  }
}

// ─── Test 10: The Pro Tier Paywall ────────────────────────────────────────

test('Test 10: The Pro Tier Paywall', async ({ page }) => {
  // 1. Force game state to level 4 with enough XP/Autonomy to pass the review
  await page.evaluate(() => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify({
      screen: 'performance-review',
      playerName: 'Tester',
      track: 'engineering',
      level: 4,
      cycleNumber: 12,
      company: 'NovaTech Corp',
      currentCompanyType: 'corp',
      isProUser: false,
      activeTheme: 'default',
      unlockedThemes: ['default'],
      activeAvatar: 'default',
      unlockedAvatars: ['default'],
      stats: {
        bandwidth: 100,
        maxBandwidth: 100,
        burnout: 0,
        autonomy: 90,
        debt: 10,
        totalXP: 1200,
        pendingXP: 0,
        netWorth: 50000,
        managerGoodBooks: 80,
        inventory: [],
      },
      tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
      helpRequestCount: 0,
    }));
  });
  await page.reload();

  // Assert isProUser is false via store
  const isProUser = await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { isProUser: boolean };
    }>).__bandwidthStore;
    return store.getState().isProUser;
  });
  expect(isProUser).toBe(false);

  // 2. Respond to manager dialogue
  await page.getByRole('button', { name: /thank you|understand/i }).first().click();

  // 3. Click the advance button (should pass since XP >= 1000 and autonomy > 60)
  await page.getByRole('button', { name: /start as|accept pip/i }).first().click();

  // 4. ProUnlockModal should appear instead of dashboard
  await expect(page.getByText('Unlock the Endgame')).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText('Pro License Required')).toBeVisible();

  // 5. Click the mock "Buy Full Game" button
  await page.getByTestId('buy-pro-btn').click();

  // 6. isProUser is now true and dashboard loads
  const isProAfter = await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { isProUser: boolean };
    }>).__bandwidthStore;
    return store.getState().isProUser;
  });
  expect(isProAfter).toBe(true);

  // Dashboard (Cycle counter) should be visible
  await expect(page.getByText(/Cycle \d+/)).toBeVisible({ timeout: 5_000 });
});

// ─── Test 11: FAANG Bureaucracy Modifiers ─────────────────────────────────

test('Test 11: FAANG Bureaucracy Modifiers', async ({ page }) => {
  test.setTimeout(60_000);
  // 1. Force player to the job board and join FAANG
  await page.evaluate(() => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify({
      screen: 'job-board',
      playerName: 'Tester',
      track: 'engineering',
      level: 1,
      cycleNumber: 1,
      company: 'Acme Corp',
      currentCompanyType: 'corp',
      isProUser: false,
      activeTheme: 'default',
      unlockedThemes: ['default'],
      activeAvatar: 'default',
      unlockedAvatars: ['default'],
      stats: {
        bandwidth: 100,
        maxBandwidth: 100,
        burnout: 0,
        autonomy: 80,
        debt: 0,
        totalXP: 500,
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

  // 2. Click Join FAANG
  await page.getByTestId('job-faang').click();

  // 3. Assert starting Bandwidth is 150
  await expect(page.getByText(/Cycle \d+/)).toBeVisible({ timeout: 5_000 });
  // Dismiss any tutorial that may appear (retry a few times)
  for (let i = 0; i < 3; i++) {
    await dismissTutorial(page);
    await page.waitForTimeout(300);
  }

  const bw = await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { stats: { bandwidth: number; maxBandwidth: number }; currentCompanyType: string };
    }>).__bandwidthStore;
    const state = store.getState();
    return { bandwidth: state.stats.bandwidth, maxBandwidth: state.stats.maxBandwidth, companyType: state.currentCompanyType };
  });
  expect(bw.maxBandwidth).toBe(150);
  expect(bw.bandwidth).toBe(150);
  expect(bw.companyType).toBe('faang');

  // 4. Disable chaos RNG so grind ticks are deterministic (0.99 = never trigger chaos)
  await page.evaluate(() => { Math.random = () => 0.99; });

  // Click Work on the first card
  await page.getByRole('button', { name: /^Work/i }).first().click();
  await dismissTutorial(page);

  // Grind until In Review (4 clicks × +25 = 100%)
  for (let i = 0; i < 4; i++) {
    const grind = page.getByRole('button', { name: /^Grind/i }).first();
    if (!await grind.isVisible({ timeout: 2_000 }).catch(() => false)) break;
    await grind.click();
    await page.waitForTimeout(100);
  }

  // 5. Assert task is IN REVIEW
  await expect(page.getByText('IN REVIEW', { exact: true })).toBeVisible({ timeout: 5_000 });

  // 6. Assert it stays in review for at least 15 seconds (FAANG review duration)
  // Wait 10s and confirm it's still in review (not done yet)
  await page.waitForTimeout(10_000);
  await expect(page.getByText('IN REVIEW', { exact: true })).toBeVisible({ timeout: 2_000 });
  await expect(page.getByText('DONE', { exact: true })).not.toBeVisible();

  // After 15s total it should auto-complete
  await expect(page.getByText('DONE', { exact: true })).toBeVisible({ timeout: 10_000 });
});
