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

// ─── Test 4: Dynamic Pixel Faces (Visual State) ────────────────────────────

test('Test 4: Dynamic Pixel Faces (Visual State)', async ({ page }) => {
  await startGame(page);
  await dismissTutorial(page);

  // 2. Assert player face starts as "Happy" (burnout 0%)
  const playerFace = page.locator('[data-testid="player-face"]');
  await expect(playerFace).toBeVisible({ timeout: 3_000 });
  await expect(playerFace).toHaveAttribute('data-mood', 'Happy');

  // 3. Drink Coffee until Burnout exceeds 35% (3 clicks: 0→15→30→45)
  // Each coffee click adds +15 burnout; need > 35% so 3 clicks → 45%
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: /coffee/i }).click();
    await page.waitForTimeout(100);
  }

  // 4. Assert Player Face mood changes to "Stressed"
  await expect(playerFace).toHaveAttribute('data-mood', 'Stressed', { timeout: 3_000 });

  // 5. Click Senior Consult repeatedly to drop MGB below 40%
  // MGB starts at 80; each Consult -5 MGB. Need MGB < 40 → 8+ clicks (80 → 40 = boundary, so need 9 clicks)
  // Each click opens the ConsultModal; we then click "Take Free Consult →" to apply the free-tier effect.
  for (let i = 0; i < 9; i++) {
    await page.getByRole('button', { name: '🧑‍💻 Consult [+20BW]' }).click();
    await page.getByRole('button', { name: /take free consult/i }).click();
    await page.waitForTimeout(100);
  }

  // 6. Assert Manager Face mood changes to "Angry"
  const managerFace = page.locator('[data-testid="manager-face"]');
  await expect(managerFace).toHaveAttribute('data-mood', 'Angry', { timeout: 3_000 });
});
