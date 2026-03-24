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
    await page.waitForTimeout(100);
  }
}

/** Pick the first available perk card (if draft is shown) then advance the cycle */
async function advanceCycleSummary(page: Page) {
  const firstPerk = page.locator('[data-testid^="perk-card-"]').first();
  if (await firstPerk.isVisible({ timeout: 1_500 }).catch(() => false)) {
    await firstPerk.click();
  }
  const btn = page.getByTestId('start-next-cycle-btn');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
}

// ─── Test 1: Net Worth Accrual & The Shop ──────────────────────────────────

test('Test 1: Net Worth Accrual & The Shop', async ({ page }) => {
  await startGame(page);
  await dismissTutorial(page);

  // 1. Net Worth starts at $0
  await expect(page.getByText('$0')).toBeVisible({ timeout: 3_000 });

  // Build some burnout so Mental Health Day purchase is observable
  await page.getByRole('button', { name: /coffee/i }).click();
  // Burnout = 15%

  // 2. End Cycle (manually, before all tasks done) → opens interstitial
  await page.getByRole('button', { name: /end cycle/i }).click();

  // 3. Cycle summary shows salary earned: $5,000
  await expect(page.getByTestId('cycle-summary')).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText('$5,000')).toBeVisible({ timeout: 3_000 });

  // Advance to next cycle
  await advanceCycleSummary(page);
  await expect(page.getByText(/Cycle 2/)).toBeVisible({ timeout: 5_000 });

  // 4. Open the Perks Shop
  await page.getByRole('button', { name: /\$ shop/i }).click();
  await expect(page.getByText(/Perks & Tools/i)).toBeVisible({ timeout: 3_000 });

  // 5. Buy Mental Health Day ($2,000)
  await page.getByRole('button', { name: /\$2,000/i }).first().click();

  // Net Worth decreased to $3,000 (use first() — appears in StatsPanel, shop header, and tool price button)
  await expect(page.getByText('$3,000').first()).toBeVisible({ timeout: 3_000 });
});

// ─── Test 2: Senior Consult & MGB Penalties ────────────────────────────────

test('Test 2: Senior Consult & MGB Penalties', async ({ page }) => {
  // Inject dashboard state with BW=60 so Senior Consult produces an observable increase
  await page.evaluate(() => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify({
      screen: 'dashboard',
      playerName: 'Tester',
      track: 'engineering',
      level: 1,
      cycleNumber: 1,
      stats: {
        bandwidth: 60,
        maxBandwidth: 100,
        burnout: 0,
        autonomy: 80,
        debt: 0,
        impact: 0,
        netWorth: 0,
        managerGoodBooks: 80,
        inventory: [],
      },
      actionItems: [],
      tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
    }));
  });
  await page.reload();

  // Starting: BW = 60/100, Autonomy = 80%, MGB = 80%
  await expect(page.getByText('60 / 100')).toBeVisible({ timeout: 5_000 });

  // Click Senior Consult
  await page.getByRole('button', { name: /consult/i }).click();

  // ConsultModal opens — click Free Tier
  await expect(page.getByText('Senior Consult')).toBeVisible({ timeout: 3_000 });
  await page.getByRole('button', { name: /take free consult/i }).click();

  // 3. Bandwidth increases: 60 → 80
  await expect(page.getByText('80 / 100')).toBeVisible({ timeout: 3_000 });

  // 4a. Autonomy decreased: 80% → 70%
  await expect(page.getByText('70%')).toBeVisible({ timeout: 3_000 });

  // 4b. MGB decreased: 80% → 75%
  await expect(page.getByText('75%')).toBeVisible({ timeout: 3_000 });
});

// ─── Test 3: Tool Chest Circumvention ──────────────────────────────────────

test('Test 3: Tool Chest Circumvention', async ({ page }) => {
  await startGame(page);
  await dismissTutorial(page);

  // Note starting Bandwidth
  await expect(page.getByText('100 / 100')).toBeVisible();

  // 2. Inject Noise Canceling Headphones into inventory via store
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { stats: Record<string, unknown> };
      setState: (s: Record<string, unknown>) => void;
    }>).__bandwidthStore;
    const stats = store.getState().stats;
    store.setState({
      stats: {
        ...stats,
        inventory: [{ type: 'noise-canceling-headphones', name: 'Noise Canceling Headphones' }],
      },
    });
  });

  // Headphones appear in Tool Chest sidebar
  await expect(page.getByText('Noise Canceling Headphones').first()).toBeVisible({ timeout: 3_000 });

  // 3. Programmatically trigger "Mandatory Team Meeting" chaos event
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      setState: (s: Record<string, unknown>) => void;
    }>).__bandwidthStore;
    store.setState({ pendingChaos: { type: 'mandatory-meeting' } });
  });

  // Chaos modal appears
  await expect(page.getByText(/Mandatory Team Meeting/i)).toBeVisible({ timeout: 3_000 });

  // Dismiss the chaos modal — triggers tool-blocking logic
  await page.getByRole('button', { name: /acknowledge/i }).click();

  // 4. "Blocked by Tool" toast appears
  await expect(page.getByText(/blocked/i)).toBeVisible({ timeout: 3_000 });

  // 5. Bandwidth is unchanged (still 100 / 100, no -15 BW penalty applied)
  await expect(page.getByText('100 / 100')).toBeVisible({ timeout: 3_000 });

  // 6. Headphones consumed — verify via store state
  const inventory = await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { stats: { inventory: unknown[] } };
    }>).__bandwidthStore;
    return store.getState().stats.inventory;
  });
  expect(inventory).toHaveLength(0);
});
