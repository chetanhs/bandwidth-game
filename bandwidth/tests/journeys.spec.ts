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

// ─── Test 1: Onboarding & The Grind Loop ──────────────────────────────────

test('Test 1: Onboarding & The Grind Loop', async ({ page }) => {
  await startGame(page);

  // 2. Welcome tutorial must be visible; dismiss it
  await expect(page.getByText('Welcome to the Grind')).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: /understood/i }).click();

  // 3. Click Work on the first To-Do card
  await page.getByRole('button', { name: /^Work/i }).first().click();

  // 4. The Grind tutorial must appear; dismiss it
  await expect(page.getByText('The Grind')).toBeVisible({ timeout: 3_000 });
  await page.getByRole('button', { name: /understood/i }).click();

  // 5. Disable chaos RNG so grind ticks are deterministic
  await page.evaluate(() => { Math.random = () => 1.0; });

  // Grind until Done (4 clicks × +25 progress each = 100%)
  for (let i = 0; i < 10; i++) {
    if (await page.getByText('DONE', { exact: true }).isVisible()) break;
    const grind = page.getByRole('button', { name: /^Grind/i }).first();
    if (!await grind.isVisible()) break;
    await grind.click();
    await page.waitForTimeout(150);
  }

  await expect(page.getByText('DONE', { exact: true })).toBeVisible({ timeout: 15_000 });

  // Impact stat should no longer read exactly "0 / 100" (use exact to avoid substring matches)
  await expect(page.getByText('0 / 100', { exact: true })).not.toBeVisible({ timeout: 3_000 });
});

// ─── Test 2: The Burnout Crash Mechanic ───────────────────────────────────

test('Test 2: The Burnout Crash Mechanic', async ({ page }) => {
  await startGame(page);

  // Dismiss initial Welcome tutorial
  await dismissTutorial(page);

  // 2. Click Coffee until Burnout reaches 100% (7 clicks: 0→15→30→45→60→75→90→100)
  for (let i = 0; i < 8; i++) {
    if (await page.getByText('Burnout Crash').isVisible().catch(() => false)) break;
    await page.getByRole('button', { name: /coffee/i }).click();
    await page.waitForTimeout(100);
  }

  // 3. Burnout Crash modal appears
  await expect(page.getByText('Burnout Crash')).toBeVisible({ timeout: 3_000 });

  // 4. Acknowledge the crash
  await page.getByRole('button', { name: /accept.*continue/i }).click();

  // 5. Cycle counter has incremented (was "Cycle 1 / 5", now "Cycle 2 / 5")
  await expect(page.getByText(/Cycle 2/)).toBeVisible({ timeout: 5_000 });

  // 6. Bandwidth bar is now at 50 (crash penalty)
  await expect(page.getByText('50 / 100')).toBeVisible({ timeout: 3_000 });
});
