import { test, type Page } from '@playwright/test';
import * as fs from 'fs';

async function startGame(page: Page) {
  await page.getByRole('textbox').fill('Tester');
  await page.getByRole('button', { name: /start career/i }).click();
  await page.getByRole('button', { name: /accept offer/i }).click();
  await page.waitForSelector('text=/Cycle \\d+/', { timeout: 10_000 });
}

async function dismissTutorial(page: Page) {
  const btn = page.getByRole('button', { name: /understood/i });
  if (await btn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(200);
  }
}

test('Capture all game states for AI UX Review', async ({ page }) => {
  fs.mkdirSync('ux-screenshots', { recursive: true });
  await page.setViewportSize({ width: 1280, height: 800 });

  // 1. Start Screen
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('bandwidth-game-state'));
  await page.reload();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'ux-screenshots/01-start-screen.png' });

  // 2. Offer Letter Screen
  await page.getByRole('textbox').fill('Tester');
  await page.getByRole('button', { name: /start career/i }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'ux-screenshots/02-offer-letter.png' });

  // 3. Mid-Cycle Dashboard
  await page.getByRole('button', { name: /accept offer/i }).click();
  await page.waitForSelector('text=/Cycle \\d+/', { timeout: 10_000 });
  await dismissTutorial(page);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'ux-screenshots/03-mid-cycle.png' });

  // 4. Chaos Event (RNG Interruption) — force via store
  await page.evaluate(() => {
    const store = (window as any).__bandwidthStore;
    if (store) {
      store.setState({ activeInterruption: { type: 'meeting', title: 'Quick Sync?', message: 'Got a sec? The PM wants to align on some synergies.' } });
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'ux-screenshots/04-chaos-modal.png' });

  // Dismiss chaos event
  await page.evaluate(() => {
    const store = (window as any).__bandwidthStore;
    if (store) store.setState({ activeInterruption: null });
  });
  await page.waitForTimeout(300);

  // 5. Performance Review — force via localStorage
  await page.evaluate(() => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify({
      screen: 'performance-review',
      playerName: 'Tester',
      track: 'engineering',
      level: 1,
      cycleNumber: 3,
      company: 'Acme Corp',
      stats: {
        bandwidth: 100, maxBandwidth: 100, burnout: 20, autonomy: 80,
        debt: 0, totalXP: 1500, pendingXP: 200, netWorth: 5000,
        managerGoodBooks: 75, inventory: [],
      },
      tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
      helpRequestCount: 0,
    }));
  });
  await page.reload();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'ux-screenshots/05-performance-review.png' });

  // 6. Job Board
  await page.evaluate(() => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify({
      screen: 'job-board',
      playerName: 'Tester',
      track: 'engineering',
      level: 1,
      cycleNumber: 3,
      company: 'Acme Corp',
      stats: {
        bandwidth: 100, maxBandwidth: 100, burnout: 90, autonomy: 80,
        debt: 0, totalXP: 2000, pendingXP: 0, netWorth: 10000,
        managerGoodBooks: 80, inventory: [],
      },
      tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
      helpRequestCount: 0,
    }));
  });
  await page.reload();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'ux-screenshots/06-job-board.png' });
});
