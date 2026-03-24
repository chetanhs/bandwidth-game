import { test, expect } from '@playwright/test';

test('Shop interactions deduct Net Worth and reduce Burnout', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Inject money and burnout
  await page.evaluate(() => (window as any).__E2E_INJECTOR__.setStats({ netWorth: 20000, burnout: 90 }));
  
  // Open shop and buy vacation
  await page.click('text="Shop"');
  await page.click('text="Buy Vacation ($15k)"');
  
  // Assert the math actually worked on the UI
  await expect(page.locator('data-testid="net-worth-display"')).toHaveText('$5,000');
  await expect(page.locator('data-testid="burnout-display"')).toHaveText('0%');
});