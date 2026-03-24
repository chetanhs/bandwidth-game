/**
 * UX Matrix Crawler — captures screenshots of every game state for AI critique.
 *
 * Uses window.__E2E_INJECTOR__ (DEV-only) to teleport the game into any scenario
 * without relying on RNG or lengthy play-through. All screenshots are written to
 * bandwidth/ux-screenshots/ (cleared at the start of each run).
 */

import { test, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// --- Recreate __dirname for ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Helpers ──────────────────────────────────────────────────────────────

const SCREENSHOT_DIR = path.resolve(__dirname, '../ux-screenshots');

function clearScreenshots() {
  if (fs.existsSync(SCREENSHOT_DIR)) {
    for (const f of fs.readdirSync(SCREENSHOT_DIR)) {
      fs.unlinkSync(path.join(SCREENSHOT_DIR, f));
    }
  } else {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

async function shot(page: Page, name: string) {
  await page.waitForTimeout(400); // let animations settle
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: false });
  console.log(`  ✓ ${name}.png`);
}

/** Wipe state, reload, and return to a clean start screen */
async function freshPage(page: Page) {
  await page.evaluate(() => localStorage.removeItem('bandwidth-game-state'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
}

/** Start the game through to the first dashboard */
async function startToDashboard(page: Page) {
  await page.getByRole('textbox').fill('E2E');
  await page.getByRole('button', { name: /start career/i }).click();
  await page.getByRole('button', { name: /accept offer/i }).click();
  // Dismiss welcome tutorial if present
  const btn = page.getByRole('button', { name: /understood/i });
  if (await btn.isVisible({ timeout: 2_000 }).catch(() => false)) await btn.click();
  await page.waitForSelector('text=/Cycle \\d+/', { timeout: 10_000 });
}

/** Call an injector method via page.evaluate */
async function inject(page: Page, method: string, ...args: unknown[]) {
  await page.evaluate(
    ([m, a]) => {
      const inj = (window as unknown as Record<string, Record<string, (...args: unknown[]) => void>>).__E2E_INJECTOR__;
      if (!inj) throw new Error('__E2E_INJECTOR__ not found — is the dev server running?');
      inj[m](...(a as unknown[]));
    },
    [method, args] as const,
  );
  await page.waitForTimeout(300);
}

/** Inject a full game state via localStorage then reload */
async function injectLocalStorage(page: Page, state: Record<string, unknown>) {
  await page.evaluate((s) => {
    localStorage.setItem('bandwidth-game-state', JSON.stringify(s));
  }, state);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
}

// ─── Base state fixtures ────────────────────────────────────────────────────

const BASE_STATS = {
  bandwidth: 85, maxBandwidth: 100, burnout: 20, autonomy: 75,
  debt: 10, totalXP: 800, pendingXP: 50, netWorth: 25000,
  managerGoodBooks: 70, inventory: [],
};

const TUTORIAL_SEEN = { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true };

const DASHBOARD_BASE = {
  playerName: 'E2E', track: 'engineering', cycleNumber: 2,
  company: 'NovaTech Corp', currentCompanyType: 'corp',
  isProUser: false, activeTheme: 'default', unlockedThemes: ['default'],
  activeAvatar: 'default', unlockedAvatars: ['default'],
  activePerks: [], alumniUpgrades: [], factions: { product: 50, engineering: 50, sales: 50 },
  careerNetWorth: 0, helpRequestCount: 0, tutorialState: TUTORIAL_SEEN,
};

// ─── The Crawler ───────────────────────────────────────────────────────────

test('UX Matrix — capture every game state', async ({ page }) => {
  test.setTimeout(120000);
  clearScreenshots();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  // ── 01: Start Screen ──────────────────────────────────────────────────────
  await freshPage(page);
  await shot(page, '01-start-screen');

  // ── 02: Offer Letter ──────────────────────────────────────────────────────
  await page.getByRole('textbox').fill('E2E');
  await page.getByRole('button', { name: /start career/i }).click();
  await page.waitForSelector('text=/Accept Offer/i', { timeout: 5_000 });
  await shot(page, '02-offer-letter');

  // ── 03: L3 Dashboard (standard) ──────────────────────────────────────────
  await injectLocalStorage(page, {
    ...DASHBOARD_BASE, screen: 'dashboard', level: 1,
    stats: { ...BASE_STATS },
    actionItems: [
      { id: 't1', title: 'Patch CVE-2024-0001 in dependency chain', cost: 8,  reward: 20, debtRisk: 5,  status: 'todo',        progress: 0 },
      { id: 't2', title: 'Refactor AuthService to remove legacy JWT', cost: 15, reward: 35, debtRisk: 10, status: 'todo',        progress: 0 },
      { id: 't3', title: 'Write integration tests for payment flow',  cost: 10, reward: 25, debtRisk: 3,  status: 'in-progress', progress: 50 },
      { id: 't4', title: 'Fix mobile layout regression on iOS 17',    cost: 5,  reward: 15, debtRisk: 2,  status: 'in-review',   progress: 100, reviewStartedAt: Date.now() },
      { id: 't5', title: 'Update OpenAPI spec for v2 endpoints',      cost: 6,  reward: 18, debtRisk: 1,  status: 'done',        progress: 100 },
    ],
    directReports: [],
  });
  await shot(page, '03-l3-dashboard');

  // ── 04: L5 Dashboard (Auto-Battler with Junior Devs) ─────────────────────
  await injectLocalStorage(page, {
    ...DASHBOARD_BASE, screen: 'dashboard', level: 5,
    company: 'Faangla Inc.', currentCompanyType: 'faang',
    stats: { ...BASE_STATS, maxBandwidth: 150, bandwidth: 120 },
    actionItems: [
      { id: 'l5t1', title: 'Define OKRs for Q3 Platform Roadmap',  cost: 30, reward: 80, debtRisk: 5,  status: 'todo',        progress: 0 },
      { id: 'l5t2', title: 'Review Architecture for Payments v3',   cost: 25, reward: 70, debtRisk: 8,  status: 'in-progress', progress: 60 },
      { id: 'l5t3', title: 'Board Meeting Prep — Executive Summary', cost: 40, reward: 100, debtRisk: 0, status: 'todo',        progress: 0 },
      { id: 'l5t4', title: 'Align cross-team on API versioning',    cost: 20, reward: 55, debtRisk: 3,  status: 'in-review',   progress: 100, reviewStartedAt: Date.now() },
    ],
    directReports: [
      { id: 'jr-0', name: 'Alex',   assignedTaskId: 'l5t2' },
      { id: 'jr-1', name: 'Jordan', assignedTaskId: null },
      { id: 'jr-2', name: 'Casey',  assignedTaskId: null },
    ],
  });
  await shot(page, '04-l5-dashboard-junior-devs');

  // ── 05-12: Every Chaos Modal variant ──────────────────────────────────────
  await injectLocalStorage(page, {
    ...DASHBOARD_BASE, screen: 'dashboard', level: 1,
    stats: { ...BASE_STATS },
    actionItems: [{ id: 'cx1', title: 'Sample Task', cost: 5, reward: 10, debtRisk: 2, status: 'in-progress', progress: 30 }],
    directReports: [],
  });

  const chaosEvents = [
    'scope-creep', 'pagerduty', 'flow-state', 'mandatory-meeting',
    'optional-outing', 'pm-status-update', 're-org', 'standup',
  ] as const;

  for (const [idx, eventType] of chaosEvents.entries()) {
    // Reset pendingChaos between shots via store setState
    await page.evaluate(() => {
      const store = (window as unknown as Record<string, { setState: (s: Record<string, unknown>) => void }>).__bandwidthStore;
      store.setState({ pendingChaos: null });
    });
    await page.waitForTimeout(150);
    await inject(page, 'triggerRngEvent', eventType);
    const num = String(idx + 5).padStart(2, '0');
    await shot(page, `${num}-chaos-${eventType}`);
  }

  // ── 13: Chatty Manager Dialogue ───────────────────────────────────────────
  await inject(page, 'triggerRngEvent', 'scope-creep'); // clear any chaos
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, { setState: (s: Record<string, unknown>) => void }>).__bandwidthStore;
    store.setState({ pendingChaos: null });
  });
  await inject(page, 'triggerChattyManager', "Are you sure you're cut out for this? That's the third escalation this sprint.");
  await shot(page, '13-chatty-manager');

  // Close chatty manager
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, { setState: (s: Record<string, unknown>) => void }>).__bandwidthStore;
    store.setState({ chattyManagerMessage: null });
  });

  // ── 14: Burnout Crash Modal ────────────────────────────────────────────────
  await inject(page, 'forceBurnoutCrash');
  await shot(page, '14-burnout-crash-modal');
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, { setState: (s: Record<string, unknown>) => void }>).__bandwidthStore;
    store.setState({ burnoutCrash: false });
  });

  // ── 15: Consult Modal ──────────────────────────────────────────────────────
  await inject(page, 'forceConsultModal');
  await shot(page, '15-consult-modal');
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, { setState: (s: Record<string, unknown>) => void }>).__bandwidthStore;
    store.setState({ consultModalOpen: false });
  });

  // ── 16: Cycle Summary (with loot drop & perk draft) ───────────────────────
  await inject(page, 'triggerCycleDrop', 'review-buddy');
  await shot(page, '16-cycle-summary-loot-drop');
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, { setState: (s: Record<string, unknown>) => void }>).__bandwidthStore;
    store.setState({ cycleSummaryOpen: false, cycleSummary: null, pendingPerkDraft: null });
  });

  // ── 17: Shop — Perks Tab ───────────────────────────────────────────────────
  await inject(page, 'openShop', 'perks');
  await shot(page, '17-shop-perks-tab');

  // ── 18: Shop — Cosmetics Tab ───────────────────────────────────────────────
  // Click the Cosmetics tab button within the open shop
  const cosmeticsTab = page.getByRole('button', { name: /cosmetics/i });
  if (await cosmeticsTab.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await cosmeticsTab.click();
    await page.waitForTimeout(200);
  }
  await shot(page, '18-shop-cosmetics-tab');
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, { setState: (s: Record<string, unknown>) => void }>).__bandwidthStore;
    store.setState({ shopOpen: false });
  });

  // ── 19: Hacker Green Theme Applied ────────────────────────────────────────
  await inject(page, 'forceHackerTheme');
  await shot(page, '19-hacker-green-theme');
  // Reset theme
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, { setState: (s: Record<string, unknown>) => void }>).__bandwidthStore;
    store.setState({ activeTheme: 'default' });
  });

  // ── 20: Extreme Stats (Max Stress UI) ─────────────────────────────────────
  await inject(page, 'setExtremeStats');
  await shot(page, '20-extreme-stats-stress-test');

  // ── 21: Performance Review — Promotion ────────────────────────────────────
  await inject(page, 'forcePerformanceReview', 'promotion');
  await page.waitForSelector('text=/Annual Performance Review/i', { timeout: 5_000 });
  await shot(page, '21-performance-review-promotion');

  // ── 22: Performance Review — PIP ──────────────────────────────────────────
  await inject(page, 'forcePerformanceReview', 'pip');
  await page.waitForTimeout(300);
  await shot(page, '22-performance-review-pip');

  // ── 23: Game Over Screen ───────────────────────────────────────────────────
  await inject(page, 'forceGameOver');
  await page.waitForTimeout(400);
  await shot(page, '23-game-over');

  // ── 24: Job Board ──────────────────────────────────────────────────────────
  await injectLocalStorage(page, {
    ...DASHBOARD_BASE, screen: 'job-board',
    stats: { ...BASE_STATS, totalXP: 2000, netWorth: 15000, burnout: 85 },
    actionItems: [], directReports: [],
  });
  await shot(page, '24-job-board');

  // ── 25: Alumni Network ────────────────────────────────────────────────────
  await injectLocalStorage(page, {
    ...DASHBOARD_BASE, screen: 'alumni-network',
    stats: { ...BASE_STATS, netWorth: 50000 }, careerNetWorth: 80000,
    actionItems: [], directReports: [],
  });
  await shot(page, '25-alumni-network');

  // ── 26: Pro Unlock Modal ──────────────────────────────────────────────────
  await injectLocalStorage(page, {
    ...DASHBOARD_BASE, screen: 'pro-unlock', level: 4, isProUser: false,
    stats: { ...BASE_STATS }, actionItems: [], directReports: [],
  });
  await shot(page, '26-pro-unlock-modal');

  console.log(`\n✅ All screenshots saved to ${SCREENSHOT_DIR}`);
});
