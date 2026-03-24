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
  // If a perk card is visible, pick the first one
  const firstPerk = page.locator('[data-testid^="perk-card-"]').first();
  if (await firstPerk.isVisible({ timeout: 1_500 }).catch(() => false)) {
    await firstPerk.click();
  }
  const btn = page.getByTestId('start-next-cycle-btn');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
}

// ─── Test 3: Escalate Penalty & PIP (Game Over) ───────────────────────────

test('Test 3: Escalate Penalty & PIP (Game Over)', async ({ page }) => {
  await startGame(page);

  // Dismiss Welcome tutorial
  await dismissTutorial(page);

  // 2. Escalate 3 items in Cycle 1: autonomy 80 → 70 → 60 → 50
  for (let i = 0; i < 3; i++) {
    const btn = page.getByRole('button', { name: /escalate/i }).first();
    await expect(btn).toBeEnabled({ timeout: 3_000 });
    await btn.click();
  }

  // End Cycle 1 → Cycle Summary → Cycle 2
  await page.getByRole('button', { name: /end cycle/i }).click();
  await expect(page.getByTestId('cycle-summary')).toBeVisible({ timeout: 5_000 });
  await advanceCycleSummary(page);
  await expect(page.getByText(/Cycle 2/)).toBeVisible({ timeout: 5_000 });

  // Escalate 1 more in Cycle 2: autonomy drops to 40 (below 50%)
  const btn2 = page.getByRole('button', { name: /escalate/i }).first();
  await expect(btn2).toBeEnabled({ timeout: 3_000 });
  await btn2.click();

  // 3. Assert the Autonomy bar has dropped below 50% (PIP risk warning visible)
  await expect(page.getByText(/PIP Risk High/i).first()).toBeVisible({ timeout: 3_000 });

  // 4. End remaining 4 cycles (2→3→4→5→review) to trigger Performance Review
  for (let i = 0; i < 4; i++) {
    const endBtn = page.getByRole('button', { name: /end cycle/i });
    if (!await endBtn.isVisible()) break;
    await endBtn.click();
    // Dismiss cycle summary interstitial
    const nextBtn = page.getByTestId('start-next-cycle-btn');
    if (await nextBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const firstPerk = page.locator('[data-testid^="perk-card-"]').first();
      if (await firstPerk.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await firstPerk.click();
      }
      await nextBtn.scrollIntoViewIfNeeded();
      await nextBtn.click();
    }
    await page.waitForTimeout(200);
  }

  // Wait for Performance Review screen
  await expect(page.getByText(/annual performance review/i)).toBeVisible({ timeout: 10_000 });

  // Navigate the fail dialogue
  await page.getByRole('button', { name: /I understand/i }).click();
  await page.getByRole('button', { name: /accept pip/i }).click();

  // 5. Game Over screen renders
  await expect(page.getByText(/game over/i)).toBeVisible({ timeout: 5_000 });
});

// ─── Test 4: Level 2 & Project Debt ──────────────────────────────────────

test('Test 4: Level 2 & Project Debt', async ({ page }) => {
  // Pin Math.random before page loads so generateActionItems is deterministic
  // With () => 0.5, sort(() => 0) preserves original order → first 5 L2 tasks selected
  // All have high debtRisk (40, 50, 30, 20, 35)
  await page.addInitScript(() => { Math.random = () => 0.5; });

  // Inject a passing Level 1 Performance Review state, with seenDebt=false
  await page.evaluate(() => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify({
      screen: 'performance-review',
      playerName: 'Tester',
      track: 'engineering',
      level: 1,
      cycleNumber: 6,
      stats: {
        bandwidth: 100,
        maxBandwidth: 100,
        burnout: 0,
        autonomy: 80,
        debt: 0,
        totalXP: 150,
        pendingXP: 0,
      },
      actionItems: [],
      tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: false },
    }));
  });
  await page.reload();

  // 1. Performance Review screen is visible
  await expect(page.getByText(/annual performance review/i)).toBeVisible({ timeout: 5_000 });

  // Navigate the pass dialogue → this calls advanceFromReview(true), which sets pendingTutorial='debt'
  await page.getByRole('button', { name: /thank you/i }).click();
  await page.getByRole('button', { name: /start as/i }).click();

  // 2. "Project Debt" tutorial overlay appears
  await expect(page.getByRole('button', { name: /understood/i })).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: /understood/i }).click();

  // 3. Click Work on first task (moves todo → in-progress), then Rush it
  await page.getByRole('button', { name: /^Work/i }).first().click();
  await page.getByRole('button', { name: /^Rush/i }).first().click();

  // 4. Task moves to Done
  await expect(page.getByText('DONE', { exact: true })).toBeVisible({ timeout: 5_000 });

  // 5. Project Debt stat increases — rush more tasks if needed to exceed 50%
  for (let i = 0; i < 4; i++) {
    if (await page.getByText(/PIP Risk High/i).first().isVisible().catch(() => false)) break;
    const rushBtn = page.getByRole('button', { name: /^Rush/i }).first();
    if (!await rushBtn.isVisible()) break;
    await rushBtn.click();
    await page.waitForTimeout(200);
  }

  await expect(page.getByText(/PIP Risk High/i).first()).toBeVisible({ timeout: 3_000 });
});
