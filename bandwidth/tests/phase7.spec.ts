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

// ─── Test 5: Delayed XP & Interstitial Screen ────────────────────────────

test('Test 5: Delayed XP & Interstitial Screen', async ({ page }) => {
  await startGame(page);
  await dismissTutorial(page);

  // 1. XP in TopNav starts at 0
  const xpCounter = page.getByTestId('xp-counter');
  await expect(xpCounter).toBeVisible({ timeout: 3_000 });
  await expect(xpCounter).toContainText('0');

  // Disable chaos RNG so grinds are deterministic
  await page.evaluate(() => { Math.random = () => 1.0; });

  // 2. Click Work on first task, then Grind until Done (4 × +25 = 100%)
  await page.getByRole('button', { name: /^Work/i }).first().click();
  await dismissTutorial(page); // dismiss grind tutorial if it appears

  for (let i = 0; i < 4; i++) {
    const grind = page.getByRole('button', { name: /^Grind/i }).first();
    if (!await grind.isVisible({ timeout: 1_000 }).catch(() => false)) break;
    await grind.click();
    await page.waitForTimeout(150);
  }

  await expect(page.getByText('DONE', { exact: true })).toBeVisible({ timeout: 15_000 });

  // 3. TopNav XP is STILL 0 — pendingXP hasn't been committed to totalXP yet
  await expect(xpCounter).toContainText('0');

  // 4. Click End Cycle
  await page.getByRole('button', { name: /end cycle/i }).click();

  // 5. CycleSummaryModal appears
  await expect(page.getByTestId('cycle-summary')).toBeVisible({ timeout: 5_000 });

  // 6. Summary displays XP earned from the completed task (should be > 0)
  const xpEarned = page.getByTestId('cycle-xp-earned');
  await expect(xpEarned).toBeVisible({ timeout: 3_000 });
  // The text is "+N XP" where N > 0
  const earnedText = await xpEarned.innerText();
  const earnedValue = parseInt(earnedText.replace(/[^0-9]/g, ''), 10);
  expect(earnedValue).toBeGreaterThan(0);

  // 7. Click Start Next Cycle
  await advanceCycleSummary(page);

  // 8. Modal closes and TopNav XP reflects the updated total (should be > 0)
  await expect(page.getByTestId('cycle-summary')).not.toBeVisible({ timeout: 3_000 });
  await expect(xpCounter).not.toContainText('XP: 0');
});

// ─── Test 6: Evil Re-org Edge Case ───────────────────────────────────────

test('Test 6: Evil Re-org Edge Case', async ({ page }) => {
  await startGame(page);
  await dismissTutorial(page);

  // 1. Programmatically clear all action items (empty the TODO column)
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      setState: (s: Record<string, unknown>) => void;
    }>).__bandwidthStore;
    store.setState({ actionItems: [] });
  });

  // Verify board is empty
  await expect(page.getByRole('button', { name: /^Work/i })).not.toBeVisible({ timeout: 2_000 });

  // 2. Programmatically trigger the "Re-org" chaos event
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      setState: (s: Record<string, unknown>) => void;
    }>).__bandwidthStore;
    store.setState({ pendingChaos: { type: 're-org' } });
  });

  // Chaos modal appears
  await expect(page.getByText(/Re-Org/i)).toBeVisible({ timeout: 3_000 });

  // Dismiss the chaos event — triggers evil re-org logic
  await page.getByRole('button', { name: /acknowledge/i }).click();

  // 3. New "Pivot Strategy" task has been spawned in the To Do column
  await expect(page.getByText(/Pivot Strategy/i)).toBeVisible({ timeout: 3_000 });
});
