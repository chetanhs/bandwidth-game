import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useGameStore } from './store'

// ─── DEV-only: God Mode Injector for Playwright E2E ───────────────────────
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__bandwidthStore = useGameStore;

  const CHAOS_TYPES = [
    'scope-creep', 'pagerduty', 'mandatory-meeting',
    'optional-outing', 'pm-status-update', 're-org', 'standup',
  ] as const;

  const SAMPLE_PERKS = [
    { id: 'caffeine-addict', name: 'Caffeine Addict', description: '+50 BW per coffee, +30 burnout.', modifierEffects: { coffeeBWMultiplier: 2, coffeeBurnoutMultiplier: 2 } },
    { id: 'blame-shifter',   name: 'Blame Shifter',   description: 'Rushing adds 0 debt. Costs -15 MGB.', modifierEffects: { rushZeroDebt: true, rushMGBDrain: 15 } },
    { id: 'rubber-duck',     name: 'Rubber Duck',     description: '+20 BW at cycle start.', modifierEffects: { cycleStartBWBonus: 20 } },
  ];

  const injector = {
    /** Force any chaos/RNG event modal to appear (respects activeBuffs auto-block) */
    triggerRngEvent(eventName: string) {
      if (!CHAOS_TYPES.includes(eventName as typeof CHAOS_TYPES[number])) {
        console.warn('[E2E_INJECTOR] Unknown event:', eventName, '— valid:', CHAOS_TYPES);
      }
      useGameStore.getState().triggerChaosEvent(eventName as typeof CHAOS_TYPES[number]);
    },

    /** Set specific stats on the player (for E2E testing) */
    setStats(overrides: Partial<{ bandwidth: number; maxBandwidth: number; burnout: number; autonomy: number; debt: number; levelXP: number; pendingXP: number; netWorth: number; managerGoodBooks: number; inventory: unknown[] }>) {
      const s = useGameStore.getState().stats;
      useGameStore.setState({ stats: { ...s, ...overrides } as typeof s });
    },

    /** Force the chatty manager overlay with a specific message */
    triggerChattyManager(message?: string) {
      useGameStore.setState({
        chattyManagerMessage: message ?? "Are you sure you're cut out for this? That's the third time this sprint.",
      });
    },

    /** Force performance review screen.  status: 'promotion' | 'pip' */
    forcePerformanceReview(status: 'promotion' | 'pip' = 'promotion') {
      const s = useGameStore.getState().stats;
      useGameStore.setState({
        screen: 'performance-review',
        stats: status === 'promotion'
          ? { ...s, levelXP: 99999, autonomy: 90, debt: 5,  burnout: 15, managerGoodBooks: 85 }
          : { ...s, levelXP: 0,     autonomy: 20, debt: 80, burnout: 70, managerGoodBooks: 15 },
      });
    },

    /** Open the shop modal. tab: 'perks' | 'cosmetics' (crawler clicks the tab) */
    openShop(_tab: 'perks' | 'cosmetics' = 'perks') {
      useGameStore.setState({ shopOpen: true });
    },

    /** Show the cycle summary interstitial with a specific loot drop */
    triggerCycleDrop(toolType?: string) {
      const lootDrop = toolType
        ? { type: toolType as 'review-buddy', name: 'Review Buddy' }
        : { type: 'review-buddy' as const, name: 'Review Buddy' };
      useGameStore.setState({
        cycleSummaryOpen: true,
        cycleSummary: {
          xpEarned: 150,
          salaryEarned: 5000,
          bandwidthBefore: 45,
          maxBandwidth: 100,
          lootDrop,
        },
        pendingPerkDraft: SAMPLE_PERKS as Parameters<typeof useGameStore.setState>[0] extends { pendingPerkDraft?: infer P } ? P : never,
      });
    },

    /** Max out stress: full burnout, zero MGB, near-zero BW */
    setExtremeStats() {
      const s = useGameStore.getState().stats;
      useGameStore.setState({
        stats: { ...s, burnout: 99, managerGoodBooks: 1, bandwidth: 5, autonomy: 10, debt: 95 },
      });
    },

    /** Jump directly to the Alumni Network meta-progression screen */
    loadAlumniNetwork() {
      useGameStore.setState({ screen: 'alumni-network' });
    },

    /** Force the burnout crash modal */
    forceBurnoutCrash() {
      useGameStore.setState({ burnoutCrash: true });
    },

    /** Force the consult modal open */
    forceConsultModal() {
      useGameStore.setState({ consultModalOpen: true });
    },

    /** Jump to game-over screen */
    forceGameOver() {
      useGameStore.setState({ screen: 'game-over' });
    },

    /** Apply hacker green theme (unlocking it first) */
    forceHackerTheme() {
      useGameStore.setState({
        activeTheme: 'hacker',
        unlockedThemes: ['default', 'hacker', 'vaporwave'],
      });
    },

    /** All valid chaos event names */
    chaosTypes: CHAOS_TYPES,
  };

  (window as unknown as Record<string, unknown>).__E2E_INJECTOR__ = injector;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
