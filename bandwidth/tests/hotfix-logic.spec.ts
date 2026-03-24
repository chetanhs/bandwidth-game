import { test, expect, type Page } from '@playwright/test';

// ─── Helper: boot to a fresh dashboard state ─────────────────────────────────

async function bootToDashboard(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('bandwidth-game-state');
    localStorage.setItem('bandwidth-game-state', JSON.stringify({
      screen: 'dashboard',
      playerName: 'Tester',
      track: 'engineering',
      level: 1,
      cycleNumber: 1,
      company: 'NovaTech Corp',
      currentCompanyType: 'corp',
      isProUser: false,
      activeTheme: 'default',
      unlockedThemes: ['default'],
      activeAvatar: 'default',
      unlockedAvatars: ['default'],
      activePerks: [],
      activeBuffs: [],
      factions: { product: 50, engineering: 50, sales: 50 },
      careerNetWorth: 0,
      alumniUpgrades: [],
      stats: {
        bandwidth: 100,
        maxBandwidth: 100,
        burnout: 0,
        autonomy: 80,
        debt: 0,
        totalXP: 0,
        pendingXP: 0,
        netWorth: 0,
        managerGoodBooks: 80,
        inventory: [],
      },
      tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
      helpRequestCount: 0,
    }));
  });
  await page.reload();
}

// ─── Test 1: Faction PIP Trigger ─────────────────────────────────────────────

test('Faction PIP: Engineering < 20% forces PIP regardless of high XP', async ({ page }) => {
  await bootToDashboard(page);

  // Force performance review screen: Engineering = 15%, XP = 9999 (high enough to normally promote)
  await page.evaluate(() => {
    const store = (window as unknown as { __bandwidthStore: { setState: (s: unknown) => void } }).__bandwidthStore;
    store.setState({
      screen: 'performance-review',
      factions: { product: 50, engineering: 15, sales: 50 },
      stats: {
        bandwidth: 100,
        maxBandwidth: 100,
        burnout: 0,
        autonomy: 80,
        debt: 0,
        totalXP: 9999,
        pendingXP: 0,
        netWorth: 0,
        managerGoodBooks: 90,
        inventory: [],
      },
    });
  });

  // With Eng < 20%, the review MUST show PIP badge, not PROMOTED
  await expect(page.getByText('PIP').first()).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('PROMOTED')).not.toBeVisible();
});

// ─── Test 2: Manual Vacation Use ──────────────────────────────────────────────

test('Vacation in Tool Chest resets burnout to 0 and removes itself from inventory', async ({ page }) => {
  await bootToDashboard(page);

  // Inject burnout = 90 and a vacation item in inventory
  await page.evaluate(() => {
    const store = (window as unknown as { __bandwidthStore: { setState: (s: unknown) => void } }).__bandwidthStore;
    store.setState({
      stats: {
        bandwidth: 100,
        maxBandwidth: 100,
        burnout: 90,
        autonomy: 80,
        debt: 0,
        totalXP: 0,
        pendingXP: 0,
        netWorth: 0,
        managerGoodBooks: 80,
        inventory: [{ type: 'vacation', name: 'Hawaii Vacation' }],
      },
    });
  });

  // Click the vacation button in Tool Chest
  await page.getByRole('button', { name: /hawaii vacation/i }).click();

  // Assert burnout is now 0 via store state
  await page.waitForFunction(() => {
    const store = (window as unknown as { __bandwidthStore: { getState: () => { stats: { burnout: number } } } }).__bandwidthStore;
    return store.getState().stats.burnout === 0;
  }, undefined, { timeout: 3000 });

  // Assert inventory is now empty
  await page.waitForFunction(() => {
    const store = (window as unknown as { __bandwidthStore: { getState: () => { stats: { inventory: unknown[] } } } }).__bandwidthStore;
    return store.getState().stats.inventory.length === 0;
  }, undefined, { timeout: 3000 });

  // Assert toast notification appears
  await expect(page.getByText(/vacation used/i)).toBeVisible({ timeout: 3000 });
});

// ─── Test 3: Manual Headphone Activation ─────────────────────────────────────

test('Headphones activate from Tool Chest and auto-block chaos event reducing battery to 2', async ({ page }) => {
  await bootToDashboard(page);

  // Inject headphones (3 charges) into inventory
  await page.evaluate(() => {
    const store = (window as unknown as { __bandwidthStore: { setState: (s: unknown) => void } }).__bandwidthStore;
    store.setState({
      stats: {
        bandwidth: 100,
        maxBandwidth: 100,
        burnout: 0,
        autonomy: 80,
        debt: 0,
        totalXP: 0,
        pendingXP: 0,
        netWorth: 0,
        managerGoodBooks: 80,
        inventory: [{ type: 'noise-canceling-headphones', name: 'Noise Canceling Headphones', charges: 3 }],
      },
      activeBuffs: [],
    });
  });

  // Click Headphones in the Tool Chest to activate them
  await page.getByRole('button', { name: /noise canceling headphones/i }).click();

  // Assert the Active Buffs indicator is now visible
  await expect(page.getByTestId('active-buff-noise-canceling-headphones')).toBeVisible({ timeout: 3000 });

  // Assert headphones are no longer in the inventory (no button)
  await expect(page.getByRole('button', { name: /noise canceling headphones/i })).not.toBeVisible();

  // Trigger a mandatory-meeting chaos event via the injector (goes through triggerChaosEvent which checks activeBuffs)
  await page.evaluate(() => {
    (window as unknown as { __E2E_INJECTOR__: { triggerRngEvent: (e: string) => void } }).__E2E_INJECTOR__.triggerRngEvent('mandatory-meeting');
  });

  // Assert: the chaos modal is NOT visible (event was auto-blocked by headphones)
  await expect(page.getByText('Mandatory Team Meeting')).not.toBeVisible({ timeout: 2000 });

  // Assert: battery life went from 3 down to 2 in activeBuffs
  await page.waitForFunction(() => {
    const store = (window as unknown as { __bandwidthStore: { getState: () => { activeBuffs: Array<{ type: string; charges?: number }> } } }).__bandwidthStore;
    const headphones = store.getState().activeBuffs.find((t) => t.type === 'noise-canceling-headphones');
    return headphones?.charges === 2;
  }, undefined, { timeout: 3000 });

  // Assert the indicator reflects 2 charges remaining
  await expect(page.getByTestId('active-buff-noise-canceling-headphones')).toContainText('2');
});
