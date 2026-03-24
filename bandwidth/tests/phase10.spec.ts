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

/** Force the cycle summary screen with a known perk draft */
async function forceCycleSummary(page: Page, perkIds: string[]) {
  await page.evaluate((perks) => {
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
      stats: {
        bandwidth: 100,
        maxBandwidth: 100,
        burnout: 0,
        autonomy: 80,
        debt: 0,
        totalXP: 0,
        pendingXP: 50,
        netWorth: 5000,
        managerGoodBooks: 80,
        inventory: [],
      },
      tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
      helpRequestCount: 0,
    }));
  }, perkIds);
  await page.reload();

  // Trigger endCycle via store, then override pendingPerkDraft with our fixed set
  await page.evaluate((perks) => {
    const store = (window as unknown as Record<string, {
      getState: () => Record<string, unknown>;
      setState: (s: Record<string, unknown>) => void;
    }>).__bandwidthStore;
    store.getState();
    // Manually open cycle summary with a fixed perk draft
    store.setState({
      cycleSummaryOpen: true,
      cycleSummary: {
        xpEarned: 50,
        salaryEarned: 5000,
        bandwidthBefore: 80,
        maxBandwidth: 100,
        lootDrop: null,
      },
      pendingPerkDraft: perks.map((id: string) => ({
        id,
        name: id,
        description: `Test perk ${id}`,
        modifierEffects: {},
      })),
    });
  }, perkIds);
}

// ─── Test 12: Perk Draft UI blocks "Start Next Cycle" until a perk is chosen ─

test('Test 12: Perk Draft — must pick before proceeding', async ({ page }) => {
  await forceCycleSummary(page, ['caffeine-addict', 'blame-shifter', '10x-dev']);

  // Cycle summary should be visible
  await expect(page.getByTestId('cycle-summary')).toBeVisible({ timeout: 5_000 });

  // "Start Next Cycle" button should be disabled (no perk selected yet)
  const ctaBtn = page.getByTestId('start-next-cycle-btn');
  await expect(ctaBtn).toBeVisible();
  await expect(ctaBtn).toBeDisabled();

  // Perk cards should be visible
  await expect(page.getByTestId('perk-card-caffeine-addict')).toBeVisible();
  await expect(page.getByTestId('perk-card-blame-shifter')).toBeVisible();
  await expect(page.getByTestId('perk-card-10x-dev')).toBeVisible();

  // Select a perk
  await page.getByTestId('perk-card-caffeine-addict').click();

  // CTA should now be enabled
  await expect(ctaBtn).toBeEnabled();
  await ctaBtn.scrollIntoViewIfNeeded();
});

// ─── Test 13: Drafting a perk adds it to activePerks and advances the cycle ─

test('Test 13: Perk Draft — drafting advances cycle and stores perk', async ({ page }) => {
  await forceCycleSummary(page, ['caffeine-addict', 'blame-shifter', '10x-dev']);

  await expect(page.getByTestId('cycle-summary')).toBeVisible({ timeout: 5_000 });

  // Pick caffeine-addict
  await page.getByTestId('perk-card-caffeine-addict').click();
  const ctaBtn2 = page.getByTestId('start-next-cycle-btn');
  await ctaBtn2.scrollIntoViewIfNeeded();
  await ctaBtn2.click();

  // Should navigate away from cycle summary to dashboard
  await expect(page.getByTestId('cycle-summary')).not.toBeVisible({ timeout: 5_000 });

  // activePerks should contain caffeine-addict
  const activePerks = await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { activePerks: string[] };
    }>).__bandwidthStore;
    return store.getState().activePerks;
  });
  expect(activePerks).toContain('caffeine-addict');
});

// ─── Test 14: Caffeine Addict perk doubles BW and Burnout from coffee ────────

test('Test 14: Caffeine Addict — doubles BW and Burnout from drinkCoffee', async ({ page }) => {
  // Set up state with caffeine-addict already active
  await page.evaluate(() => {
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
      activePerks: ['caffeine-addict'],
      stats: {
        bandwidth: 50,
        maxBandwidth: 100,
        burnout: 0,
        autonomy: 80,
        debt: 0,
        totalXP: 0,
        pendingXP: 0,
        netWorth: 5000,
        managerGoodBooks: 80,
        inventory: [],
      },
      tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
      helpRequestCount: 0,
    }));
  });
  await page.reload();
  await dismissTutorial(page);

  // Read stats before coffee
  const before = await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { stats: { bandwidth: number; burnout: number } };
    }>).__bandwidthStore;
    return store.getState().stats;
  });

  // Click "Drink Coffee" button
  await page.getByRole('button', { name: /coffee/i }).click();

  const after = await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { stats: { bandwidth: number; burnout: number } };
    }>).__bandwidthStore;
    return store.getState().stats;
  });

  // With caffeine-addict: +50 BW (2×25), +30 burnout (2×15)
  expect(after.bandwidth).toBe(Math.min(before.bandwidth + 50, 100));
  expect(after.burnout).toBe(before.burnout + 30);
});

// ─── Test 15: Blame Shifter — rush adds 0 debt ───────────────────────────────

test('Test 15: Blame Shifter — rushTask adds 0 debt', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify({
      screen: 'dashboard',
      playerName: 'Tester',
      track: 'engineering',
      level: 2,
      cycleNumber: 1,
      company: 'NovaTech Corp',
      currentCompanyType: 'corp',
      isProUser: false,
      activeTheme: 'default',
      unlockedThemes: ['default'],
      activeAvatar: 'default',
      unlockedAvatars: ['default'],
      activePerks: ['blame-shifter'],
      stats: {
        bandwidth: 100,
        maxBandwidth: 100,
        burnout: 0,
        autonomy: 80,
        debt: 0,
        totalXP: 0,
        pendingXP: 0,
        netWorth: 5000,
        managerGoodBooks: 80,
        inventory: [],
      },
      tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
      helpRequestCount: 0,
    }));
  });
  await page.reload();
  await dismissTutorial(page);

  // Inject a task with known debtRisk via store so we don't depend on generated items
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      setState: (s: Record<string, unknown>) => void;
    }>).__bandwidthStore;
    store.setState({
      actionItems: [{
        id: 'test-task-1',
        title: 'Test Task',
        cost: 10,
        reward: 20,
        debtRisk: 30,
        status: 'todo',
        progress: 0,
      }],
    });
  });

  // Read debt before rush
  const debtBefore = await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { stats: { debt: number } };
    }>).__bandwidthStore;
    return store.getState().stats.debt;
  });

  // Click Work on first task, then Rush it
  await page.getByRole('button', { name: /^Work/i }).first().click();
  await page.getByRole('button', { name: /^Rush/i }).first().click();

  const debtAfter = await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { stats: { debt: number } };
    }>).__bandwidthStore;
    return store.getState().stats.debt;
  });

  // Blame Shifter: debt delta should be 0
  expect(debtAfter).toBe(debtBefore);
});

// ─── Test 16: L5 — Grind absent, junior dropdown present, auto-progress ────────

test('Test 16: L5 — junior assignment replaces Grind; task auto-progresses', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify({
      screen: 'dashboard',
      playerName: 'Tester',
      track: 'engineering',
      level: 5,
      cycleNumber: 1,
      company: 'NovaTech Corp',
      currentCompanyType: 'corp',
      isProUser: true,
      activeTheme: 'default',
      unlockedThemes: ['default'],
      activeAvatar: 'default',
      unlockedAvatars: ['default'],
      activePerks: [],
      stats: {
        bandwidth: 100,
        maxBandwidth: 100,
        burnout: 0,
        autonomy: 80,
        debt: 0,
        totalXP: 0,
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

  // Inject a single todo task and 3 junior devs
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      setState: (s: Record<string, unknown>) => void;
    }>).__bandwidthStore;
    store.setState({
      actionItems: [{
        id: 'l5-task-1',
        title: 'L5 Test Task',
        cost: 10,
        reward: 20,
        debtRisk: 5,
        status: 'todo',
        progress: 0,
      }],
      directReports: [
        { id: 'jr-0', name: 'Alex', assignedTaskId: null },
        { id: 'jr-1', name: 'Jordan', assignedTaskId: null },
        { id: 'jr-2', name: 'Casey', assignedTaskId: null },
      ],
    });
  });

  // Grind button should NOT be present for L5 todo tasks
  await expect(page.getByTestId('grind-btn-l5-task-1')).not.toBeVisible({ timeout: 2_000 }).catch(() => {});
  const grindBtns = page.locator('[data-testid^="grind-btn-"]');
  await expect(grindBtns).toHaveCount(0, { timeout: 2_000 });

  // Junior assignment dropdown should be visible
  const select = page.getByTestId('junior-select-l5-task-1');
  await expect(select).toBeVisible({ timeout: 3_000 });

  // Assign Alex to the task
  await select.selectOption({ value: 'jr-0' });

  // Task should move to in-progress
  await expect(async () => {
    const status = await page.evaluate(() => {
      const store = (window as unknown as Record<string, {
        getState: () => { actionItems: Array<{ id: string; status: string }> };
      }>).__bandwidthStore;
      return store.getState().actionItems.find((a) => a.id === 'l5-task-1')?.status;
    });
    expect(status).toBe('in-progress');
  }).toPass({ timeout: 3_000 });

  // Wait for junior tick to advance progress (2s interval, wait up to 8s)
  await expect(async () => {
    const progress = await page.evaluate(() => {
      const store = (window as unknown as Record<string, {
        getState: () => { actionItems: Array<{ id: string; progress: number }> };
      }>).__bandwidthStore;
      return store.getState().actionItems.find((a) => a.id === 'l5-task-1')?.progress ?? 0;
    });
    expect(progress).toBeGreaterThan(0);
  }).toPass({ timeout: 8_000 });
});

// ─── Test 17: L5 — Blocker appears; Clear Blocker costs BW and unblocks ──────

test('Test 17: L5 — Clear Blocker button costs BW and unblocks task', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify({
      screen: 'dashboard',
      playerName: 'Tester',
      track: 'engineering',
      level: 5,
      cycleNumber: 1,
      company: 'NovaTech Corp',
      currentCompanyType: 'corp',
      isProUser: true,
      activeTheme: 'default',
      unlockedThemes: ['default'],
      activeAvatar: 'default',
      unlockedAvatars: ['default'],
      activePerks: [],
      stats: {
        bandwidth: 80,
        maxBandwidth: 100,
        burnout: 0,
        autonomy: 80,
        debt: 0,
        totalXP: 0,
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

  // Inject a blocked in-progress task with a junior assigned
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      setState: (s: Record<string, unknown>) => void;
    }>).__bandwidthStore;
    store.setState({
      actionItems: [{
        id: 'blocked-task-1',
        title: 'Blocked Task',
        cost: 10,
        reward: 20,
        debtRisk: 5,
        status: 'in-progress',
        progress: 30,
        isBlocked: true,
      }],
      directReports: [
        { id: 'jr-0', name: 'Alex', assignedTaskId: 'blocked-task-1' },
      ],
    });
  });

  // Blocked badge should be visible
  await expect(page.getByTestId('blocked-badge-blocked-task-1')).toBeVisible({ timeout: 3_000 });

  // Clear Blocker button should be visible
  const clearBtn = page.getByTestId('clear-blocker-btn-blocked-task-1');
  await expect(clearBtn).toBeVisible({ timeout: 3_000 });

  // Read BW before
  const bwBefore = await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { stats: { bandwidth: number } };
    }>).__bandwidthStore;
    return store.getState().stats.bandwidth;
  });

  // Click Clear Blocker
  await clearBtn.click();

  // BW should decrease by 10
  const bwAfter = await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { stats: { bandwidth: number } };
    }>).__bandwidthStore;
    return store.getState().stats.bandwidth;
  });
  expect(bwAfter).toBe(bwBefore - 10);

  // Task should no longer be blocked
  const isBlocked = await page.evaluate(() => {
    const store = (window as unknown as Record<string, {
      getState: () => { actionItems: Array<{ id: string; isBlocked?: boolean }> };
    }>).__bandwidthStore;
    return store.getState().actionItems.find((a) => a.id === 'blocked-task-1')?.isBlocked;
  });
  expect(isBlocked).toBeFalsy();

  // Blocked badge should be gone
  await expect(page.getByTestId('blocked-badge-blocked-task-1')).not.toBeVisible({ timeout: 2_000 });
});
