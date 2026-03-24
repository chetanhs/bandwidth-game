import { create } from 'zustand';
import type {
  PlayerStats,
  ActionItem,
  GameScreen,
  Level,
  CareerTrack,
  ChaosEvent,
  ChaosEventType,
  TutorialState,
  PendingTutorial,
  ToolItem,
  ToolItemType,
  CycleSummary,
  CompanyType,
  ThemeId,
  AvatarId,
  PerkId,
  Perk,
  DirectReport,
  AlumniUpgradeId,
} from './types';
import { LEVEL_CONFIGS, COMPANY_MODIFIERS, THEMES, AVATARS, JUNIOR_NAMES, ALUMNI_UPGRADES } from './types';
import { generateActionItems } from './data/actionItems';
import { samplePerks } from './data/perks';

// ─── Helpers ──────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Returns store patch if MGB just crossed below 50 for the first time this cycle */
function checkMgbWarning(
  newMgb: number,
  state: Pick<GameState, 'mgbWarning1on1SeenThisCycle' | 'screen'>
): Partial<GameState> {
  if (
    newMgb < 50 &&
    !state.mgbWarning1on1SeenThisCycle &&
    state.screen === 'dashboard'
  ) {
    return { mgbWarning1on1Active: true, mgbWarning1on1SeenThisCycle: true };
  }
  return {};
}

/** Build a fresh roster of 3 Junior Devs for L5 gameplay */
function buildJuniorRoster(): DirectReport[] {
  const shuffled = [...JUNIOR_NAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((name, i) => ({
    id: `junior-${i}-${Date.now()}`,
    name,
    assignedTaskId: null,
  }));
}

const DEFAULT_STATS: PlayerStats = {
  bandwidth: 100,
  maxBandwidth: 100,
  burnout: 0,
  autonomy: 80,
  debt: 0,
  levelXP: 0,
  pendingXP: 0,
  netWorth: 0,
  managerGoodBooks: 80,
  inventory: [],
};

const DEFAULT_COMPANY_TYPE: CompanyType = 'corp';

// Tool definitions
const TOOL_DEFS: Record<ToolItemType, { cost: number; name: string }> = {
  'noise-canceling-headphones': { cost: 3000, name: 'Noise Canceling Headphones' },
  'chatgpt-plus': { cost: 2000, name: 'ChatGPT Plus Subscription' },
  'offline-update': { cost: 2500, name: 'Offline Update' },
  'review-buddy': { cost: 3500, name: 'Review Buddy' },
  'battery-pack': { cost: 1500, name: 'Battery Pack' },
  'vacation': { cost: 0, name: 'Hawaii Vacation' },
};

// Events blockable by Noise Canceling Headphones
export const HEADPHONE_BLOCKABLE: ChaosEventType[] = ['mandatory-meeting', 'pm-status-update', 'standup'];
const OFFLINE_UPDATE_BLOCKABLE: ChaosEventType[] = ['standup'];
const ALL_TOOL_TYPES: ToolItemType[] = [
  'noise-canceling-headphones',
  'chatgpt-plus',
  'offline-update',
  'review-buddy',
  // 'battery-pack' excluded — not a loot drop, only purchasable
];

// ─── Store Interface ────────────────────────────────────────────────────────

const DEFAULT_TUTORIAL_STATE: TutorialState = {
  seenWelcome: false,
  seenGrind: false,
  seenRush: false,
  seenDebt: false,
};

interface GameState {
  screen: GameScreen;
  playerName: string;
  track: CareerTrack;
  level: Level;
  cycleNumber: number;
  company: string;
  currentCompanyType: CompanyType;
  activeTheme: ThemeId;
  unlockedThemes: ThemeId[];
  activeAvatar: AvatarId;
  unlockedAvatars: AvatarId[];
  stats: PlayerStats;
  actionItems: ActionItem[];
  pendingChaos: ChaosEvent | null;
  tutorialState: TutorialState;
  pendingTutorial: PendingTutorial | null;
  burnoutCrash: boolean;
  shopOpen: boolean;
  toolBlockedMessage: string | null;
  cycleSummaryOpen: boolean;
  cycleSummary: CycleSummary | null;
  helpRequestCount: number;
  chaosEventsThisCycle: number;
  chattyManagerMessage: string | null;
  consultModalOpen: boolean;
  activePerks: PerkId[];
  pendingPerkDraft: Perk[] | null;
  directReports: DirectReport[];
  careerNetWorth: number;
  alumniUpgrades: AlumniUpgradeId[];
  activeBuffs: ToolItem[];
  hasSeenTutorial: boolean;
  unplannedMeetingUsedThisCycle: boolean;
  clientCallUsedThisCycle: boolean;
  unscheduled1on1UsedThisCycle: boolean;
  tasksCompletedThisLevel: number;
  totalTaskCostThisLevel: number;
  mgbWarning1on1Active: boolean;
  mgbWarning1on1SeenThisCycle: boolean;

  // Actions
  startGame: (name: string, track: CareerTrack) => void;
  acceptOfferLetter: () => void;
  dismissChattyManager: () => void;
  workOnTask: (id: string) => void;
  grindTask: (id: string) => void;
  dismissChaos: () => void;
  rushTask: (id: string) => void;
  escalateTask: (id: string) => void;
  completeReview: (id: string) => void;
  useReviewBuddy: (id: string) => void;
  endCycle: () => void;
  startNextCycle: () => void;
  advanceFromReview: (passed: boolean) => void;
  resetGame: () => void;
  drinkCoffee: () => void;
  seniorConsult: () => void;
  closeConsultModal: () => void;
  freeConsult: () => void;
  premiumConsult: () => void;
  takeSeverance: () => void;
  joinCompany: (tier: CompanyType) => void;
  dismissCrash: () => void;
  dismissTutorial: () => void;
  openShop: () => void;
  closeShop: () => void;
  buyPerk: (perkId: 'mental-health-day' | 'hawaii-vacation') => void;
  buyTool: (toolType: ToolItemType) => void;
  useHeadphones: () => void;
  clearToolBlocked: () => void;
  buyTheme: (themeId: ThemeId) => void;
  setTheme: (themeId: ThemeId) => void;
  buyAvatar: (avatarId: AvatarId) => void;
  setAvatar: (avatarId: AvatarId) => void;
  draftPerk: (perkId: PerkId) => void;
  assignJunior: (juniorId: string, taskId: string) => void;
  unassignJunior: (juniorId: string) => void;
  juniorTick: (taskId: string) => void;
  clearBlocker: (taskId: string) => void;
  openAlumniNetwork: () => void;
  goToJobBoard: () => void;
  buyAlumniUpgrade: (upgradeId: AlumniUpgradeId) => void;
  activateHeadphones: () => void;
  useVacation: () => void;
  useOfflineUpdate: () => void;
  triggerChaosEvent: (type: ChaosEventType, taskId?: string) => void;
  perkCooldowns: PerkId[];
  playPerk: (perkId: PerkId) => void;
  completeTutorial: () => void;
  acceptUnplannedMeeting: () => void;
  skipUnplannedMeeting: () => void;
  resolveMiniGame: (outcome: 'survived' | 'caught') => void;
  acceptClientCall: () => void;
  triggerFightPM: () => void;
  resolveFistFight: (outcome: 'victory' | 'defeat') => void;
  acceptUnscheduled1on1: () => void;
  triggerDuel: () => void;
  resolveDuel: (outcome: 'win' | 'lose') => void;
  resolveMgrOneOnOne: (outcome: 'win' | 'lose' | 'draw') => void;
}

// ─── localStorage Persistence ──────────────────────────────────────────────

const STORAGE_KEY = 'bandwidth-game-state';

function loadPersistedState(): Partial<GameState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<GameState>;
  } catch {
    return null;
  }
}

function persistState(state: GameState) {
  try {
    const {
      startGame: _s, workOnTask: _w, grindTask: _g, dismissChaos: _dc,
      rushTask: _r, escalateTask: _e, completeReview: _cr, useReviewBuddy: _urb,
      endCycle: _ec, startNextCycle: _snc, advanceFromReview: _a,
      resetGame: _rg, drinkCoffee: _drc, seniorConsult: _sc,
      closeConsultModal: _ccm, freeConsult: _fc, premiumConsult: _pc2,
      takeSeverance: _ts, joinCompany: _jc, dismissCrash: _drcsh, dismissTutorial: _dt,
      openShop: _os, closeShop: _cs, buyPerk: _bp, buyTool: _bt, useHeadphones: _uh, clearToolBlocked: _ctb,
      buyTheme: _bth, setTheme: _sth, buyAvatar: _bav, setAvatar: _sav,
      pendingChaos: _pc, pendingTutorial: _pt, burnoutCrash: _bc, shopOpen: _so,
      toolBlockedMessage: _tbm, cycleSummaryOpen: _cso, cycleSummary: _cs2,
      chattyManagerMessage: _cmm, consultModalOpen: _cmo,
      acceptOfferLetter: _aol, dismissChattyManager: _dcm,
      pendingPerkDraft: _ppd,
      draftPerk: _dp, assignJunior: _aj, unassignJunior: _uj, juniorTick: _jt, clearBlocker: _cb,
      openAlumniNetwork: _oan, buyAlumniUpgrade: _bau, goToJobBoard: _gtjb,
      activateHeadphones: _ah, useVacation: _uv, useOfflineUpdate: _uou, triggerChaosEvent: _tce,
      playPerk: _pp, completeTutorial: _ctut,
      acceptUnplannedMeeting: _aum, skipUnplannedMeeting: _sum, resolveMiniGame: _rmg,
      acceptClientCall: _acc, triggerFightPM: _tfpm, resolveFistFight: _rff,
      resolveMgrOneOnOne: _rmgo,
      ...serializable
    } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // ignore
  }
}

// ─── Store ────────────────────────────────────────────────────────────────

const persisted = loadPersistedState();

export const useGameStore = create<GameState>((set, get) => ({
  screen: (persisted?.screen as GameScreen) ?? 'start',
  playerName: persisted?.playerName ?? '',
  track: (persisted?.track as CareerTrack) ?? 'engineering',
  level: (persisted?.level as Level) ?? 1,
  cycleNumber: persisted?.cycleNumber ?? 1,
  company: (persisted?.company as string) ?? 'Acme Corp',
  currentCompanyType: (persisted as Partial<GameState>)?.currentCompanyType ?? DEFAULT_COMPANY_TYPE,
  activeTheme: (persisted as Partial<GameState>)?.activeTheme ?? 'default',
  unlockedThemes: (persisted as Partial<GameState>)?.unlockedThemes ?? ['default'],
  activeAvatar: (persisted as Partial<GameState>)?.activeAvatar ?? 'default',
  unlockedAvatars: (persisted as Partial<GameState>)?.unlockedAvatars ?? ['default'],
  stats: persisted?.stats ? { ...DEFAULT_STATS, ...persisted.stats } : { ...DEFAULT_STATS },
  actionItems: persisted?.actionItems ?? [],
  tutorialState: (persisted as Partial<GameState>)?.tutorialState ?? { ...DEFAULT_TUTORIAL_STATE },
  pendingChaos: null,
  pendingTutorial: null,
  burnoutCrash: false,
  shopOpen: false,
  toolBlockedMessage: null,
  cycleSummaryOpen: false,
  cycleSummary: null,
  helpRequestCount: persisted?.helpRequestCount ?? 0,
  chaosEventsThisCycle: 0,
  chattyManagerMessage: null,
  consultModalOpen: false,
  activePerks: (persisted as Partial<GameState>)?.activePerks ?? [],
  pendingPerkDraft: null,
  directReports: [],
  careerNetWorth: (persisted as Partial<GameState>)?.careerNetWorth ?? 0,
  alumniUpgrades: (persisted as Partial<GameState>)?.alumniUpgrades ?? [],
  activeBuffs: (persisted as Partial<GameState>)?.activeBuffs ?? [],
  perkCooldowns: (persisted as Partial<GameState>)?.perkCooldowns ?? [],
  hasSeenTutorial: (persisted as Partial<GameState>)?.hasSeenTutorial ?? false,
  unplannedMeetingUsedThisCycle: false,
  clientCallUsedThisCycle: false,
  unscheduled1on1UsedThisCycle: false,
  tasksCompletedThisLevel: (persisted as Partial<GameState>)?.tasksCompletedThisLevel ?? 0,
  totalTaskCostThisLevel: (persisted as Partial<GameState>)?.totalTaskCostThisLevel ?? 0,
  mgbWarning1on1Active: (persisted as Partial<GameState>)?.mgbWarning1on1Active ?? false,
  mgbWarning1on1SeenThisCycle: (persisted as Partial<GameState>)?.mgbWarning1on1SeenThisCycle ?? false,

  startGame: (name, track) => {
    const items = generateActionItems(1, track, 1);
    const state = get();
    const next: Partial<GameState> = {
      screen: 'offer-letter',
      playerName: name,
      track,
      level: 1,
      cycleNumber: 1,
      currentCompanyType: 'corp',
      stats: { ...DEFAULT_STATS },
      actionItems: items,
      tutorialState: { ...DEFAULT_TUTORIAL_STATE },
      pendingTutorial: null,
      burnoutCrash: false,
      shopOpen: false,
      toolBlockedMessage: null,
      cycleSummaryOpen: false,
      cycleSummary: null,
      helpRequestCount: 0,
      chaosEventsThisCycle: 0,
      chattyManagerMessage: null,
      activePerks: [],
      pendingPerkDraft: null,
      directReports: [] as DirectReport[],
      activeBuffs: [] as ToolItem[],
      perkCooldowns: [] as PerkId[],
      tasksCompletedThisLevel: 0,
      totalTaskCostThisLevel: 0,
      mgbWarning1on1Active: false,
      mgbWarning1on1SeenThisCycle: false,
    };    set(next as GameState);
    persistState({ ...state, ...next } as GameState);
  },

  acceptOfferLetter: () => {
    const state = get();
    const next = { screen: 'dashboard' as GameScreen, pendingTutorial: 'welcome' as PendingTutorial };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  dismissChattyManager: () => set({ chattyManagerMessage: null }),

  workOnTask: (id) => {
    const { actionItems, tutorialState, pendingTutorial } = get();
    const item = actionItems.find((a) => a.id === id);
    if (!item || item.status !== 'todo') return;
    const newItems = actionItems.map((a) =>
      a.id === id ? { ...a, status: 'in-progress' as const } : a
    );
    const triggerGrind = !tutorialState.seenGrind && !pendingTutorial;
    const state = get();
    const next = {
      actionItems: newItems,
      ...(triggerGrind ? { pendingTutorial: 'grind' as PendingTutorial } : {}),
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  grindTask: (id) => {
    const { stats, actionItems, level, currentCompanyType, activePerks, alumniUpgrades, chaosEventsThisCycle, unplannedMeetingUsedThisCycle, clientCallUsedThisCycle, unscheduled1on1UsedThisCycle } = get();
    const item = actionItems.find((a) => a.id === id);
    if (!item || item.status !== 'in-progress') return;

    const baseGrindCost = level === 1 ? 3 : 5;
    const grindCost = stats.inventory.some((t) => t.type === 'chatgpt-plus')
      ? baseGrindCost - 1
      : baseGrindCost;
    if (stats.bandwidth < grindCost) return;

    // Company chaos multiplier + 10x-dev perk
    const modifier = COMPANY_MODIFIERS[currentCompanyType];
    const perkChaosMultiplier = activePerks.includes('10x-dev') ? 3 : 1;
    const chaosChance = 0.15 * modifier.chaosMultiplier * perkChaosMultiplier;
    if (Math.random() < chaosChance) {
      const basePool: ChaosEventType[] = [
        'scope-creep', 'pagerduty',
        'mandatory-meeting', 'optional-outing', 'pm-status-update', 're-org', 'standup',
      ];
      // unplanned-meeting and client-call each have limit:1 per cycle
      const pool: ChaosEventType[] = [
        ...basePool,
        ...(unplannedMeetingUsedThisCycle ? [] : (['unplanned-meeting'] as ChaosEventType[])),
        ...(clientCallUsedThisCycle ? [] : (['client-call'] as ChaosEventType[])),
        ...(unscheduled1on1UsedThisCycle ? [] : (['unscheduled-1on1'] as ChaosEventType[])),
      ];
      const type = pool[Math.floor(Math.random() * pool.length)];

      // All events are now negative — cap at 2/cycle
      if (chaosEventsThisCycle >= 2) {
        // Cap hit — skip event silently and continue with task progress
      } else {
        // Check active headphones buff before showing
        const { activeBuffs } = get();
        const activeHeadphones = activeBuffs.find((t) => t.type === 'noise-canceling-headphones');
        if (activeHeadphones && HEADPHONE_BLOCKABLE.includes(type)) {
          const charges = activeHeadphones.charges ?? 1;
          const remainingCharges = charges - 1;
          const newActiveBuffs = remainingCharges <= 0
            ? activeBuffs.filter((t) => t.type !== 'noise-canceling-headphones')
            : activeBuffs.map((t) =>
                t.type === 'noise-canceling-headphones' ? { ...t, charges: remainingCharges } : t
              );
          const state = get();
          const next = { activeBuffs: newActiveBuffs, toolBlockedMessage: '🎧 Event blocked. Back to coding.' };
          set(next);
          persistState({ ...state, ...next } as GameState);
          return;
        }
        const state = get();
        const next = {
          pendingChaos: { type, taskId: id } as ChaosEvent,
          chaosEventsThisCycle: chaosEventsThisCycle + 1,
        };
        set(next);
        persistState({ ...state, ...next } as GameState);
        return;
      }
    }

    const progressGain = 25;
    const newProgress = item.progress + progressGain;
    const isComplete = newProgress >= 100;
    const newItems = actionItems.map((a) =>
      a.id === id
        ? {
            ...a,
            progress: isComplete ? 100 : newProgress,
            status: isComplete ? ('in-review' as const) : a.status,
            reviewStartedAt: isComplete ? Date.now() : a.reviewStartedAt,
          }
        : a
    );

    const newBW = clamp(stats.bandwidth - grindCost, 0, stats.maxBandwidth);
    // Epic 3.1: Reduce burnout penalty by 30% for L3 and L4 (70% chance of +1 burnout)
    const burnoutPenalty = (level === 3 || level === 4) ? (Math.random() < 0.7 ? 1 : 0) : 1;
    const newStats: PlayerStats = {
      ...stats,
      bandwidth: newBW,
      burnout: clamp(stats.burnout + burnoutPenalty, 0, alumniUpgrades.includes('teflon') ? 90 : 100),
    };

    const { tutorialState, pendingTutorial } = get();
    const triggerRisks = newBW < 30 && !tutorialState.seenRush && !pendingTutorial;
    const mgbPatch = checkMgbWarning(newStats.managerGoodBooks, get());
    const state = get();
    const next = {
      stats: newStats,
      actionItems: newItems,
      ...(triggerRisks ? { pendingTutorial: 'risks' as PendingTutorial } : {}),
      ...mgbPatch,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  dismissChaos: () => {
    const { pendingChaos, stats, actionItems } = get();
    if (!pendingChaos) return;

    // Note: headphone auto-block removed — player must click "Block" in ChaosModal (Task 1.3)
    const hasOfflineUpdate = stats.inventory.some((t) => t.type === 'offline-update');
    if (OFFLINE_UPDATE_BLOCKABLE.includes(pendingChaos.type) && hasOfflineUpdate) {
      const newInventory = stats.inventory.filter((t) => t.type !== 'offline-update');
      const newStats = { ...stats, inventory: newInventory };
      const state = get();
      set({ pendingChaos: null, stats: newStats, toolBlockedMessage: '📴 Offline Update blocked this standup.' });
      persistState({ ...state, pendingChaos: null, stats: newStats } as GameState);
      return;
    }

    let newStats = { ...stats };
    let newItems = actionItems;

    switch (pendingChaos.type) {
      case 'scope-creep':
        newItems = actionItems.map((a) =>
          a.id === pendingChaos.taskId ? { ...a, progress: clamp(a.progress - 25, 0, 100) } : a
        );
        break;
      case 'pagerduty':
        newStats = { ...newStats, bandwidth: clamp(stats.bandwidth - 15, 0, stats.maxBandwidth) };
        break;
      case 'mandatory-meeting':
        newStats = { ...newStats, bandwidth: clamp(stats.bandwidth - 15, 0, stats.maxBandwidth) };
        break;
      case 'optional-outing':
        newStats = {
          ...newStats,
          bandwidth: clamp(stats.bandwidth - 10, 0, stats.maxBandwidth),
          managerGoodBooks: clamp(stats.managerGoodBooks + 5, 0, 100),
        };
        break;
      case 'pm-status-update':
        newStats = { ...newStats, bandwidth: clamp(stats.bandwidth - 10, 0, stats.maxBandwidth) };
        break;
      case 'standup':
        newStats = { ...newStats, bandwidth: clamp(stats.bandwidth - 10, 0, stats.maxBandwidth) };
        break;
      case 'unplanned-meeting':
        // Handled via acceptUnplannedMeeting / skipUnplannedMeeting — no-op here
        break;
      case 'client-call':
        // Handled via acceptClientCall / triggerFightPM — no-op here
        break;
      case 'unscheduled-1on1':
        // Handled via acceptUnscheduled1on1 / triggerDuel — no-op here
        break;
      case 're-org': {
        const todos = actionItems.filter((a) => a.status === 'todo');
        if (todos.length === 0) {
          const newTask: ActionItem = {
            id: `task-reorg-${Date.now()}`,
            title: 'Pivot Strategy for Re-org',
            cost: 30,
            reward: 15,
            debtRisk: 20,
            status: 'todo',
            progress: 0,
          };
          newItems = [...actionItems, newTask];
        } else {
          const rest = actionItems.filter((a) => a.status !== 'todo');
          const reshuffled = [...todos]
            .map((a) => ({ ...a, cost: a.cost + 5 }))
            .sort(() => Math.random() - 0.5);
          newItems = [...reshuffled, ...rest];
        }
        break;
      }
    }

    const state = get();
    const next = { pendingChaos: null as ChaosEvent | null, stats: newStats, actionItems: newItems };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  rushTask: (id) => {
    const { stats, actionItems, activePerks, alumniUpgrades } = get();
    const item = actionItems.find((a) => a.id === id);
    if (!item || item.status === 'done') return;
    const newItems = actionItems.map((a) => a.id === id ? { ...a, status: 'done' as const } : a);

    const blameShifter = activePerks.includes('blame-shifter');
    const darkPatterns = activePerks.includes('dark-patterns');

    const debtDelta = blameShifter ? 0 : item.debtRisk;
    const mgbDelta = blameShifter ? -15 : 0;
    const xpGain = darkPatterns ? Math.round(item.reward * 1.5) : item.reward;
    const debtGain = darkPatterns ? Math.round(debtDelta * 1.5) : debtDelta;

    const newStats: PlayerStats = {
      ...stats,
      pendingXP: stats.pendingXP + xpGain,
      debt: clamp(stats.debt + debtGain, 0, 100),
      burnout: clamp(stats.burnout + 5, 0, alumniUpgrades.includes('teflon') ? 90 : 100),
      managerGoodBooks: clamp(stats.managerGoodBooks + mgbDelta, 0, 100),
    };

    const mgbPatch = checkMgbWarning(newStats.managerGoodBooks, get());
    const state = get();
    const next = {
      stats: newStats,
      actionItems: newItems,
      ...mgbPatch,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  escalateTask: (id) => {
    const { stats, actionItems, helpRequestCount } = get();
    const item = actionItems.find((a) => a.id === id);
    if (!item || item.status === 'done') return;
    const newItems = actionItems.map((a) => a.id === id ? { ...a, status: 'done' as const } : a);
    const newStats: PlayerStats = {
      ...stats,
      managerGoodBooks: clamp(stats.managerGoodBooks - 15, 0, 100),
      autonomy: clamp(stats.autonomy - 15, 0, 100),
      pendingXP: stats.pendingXP + item.reward,
    };

    const newCount = helpRequestCount + 1;
    const triggerWarning = newCount === 3;
    const mgbPatch = checkMgbWarning(newStats.managerGoodBooks, get());
    const state = get();
    const next = {
      stats: newStats,
      actionItems: newItems,
      helpRequestCount: newCount,
      ...(triggerWarning
        ? { chattyManagerMessage: "Are you sure you're cut out for this? That's the third time this sprint you've needed a hand." }
        : {}),
      ...mgbPatch,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  completeReview: (id) => {
    const { stats, actionItems, activePerks } = get();
    const item = actionItems.find((a) => a.id === id);
    if (!item || item.status !== 'in-review') return;
    const newItems = actionItems.map((a) => a.id === id ? { ...a, status: 'done' as const } : a);
    const xpGain = activePerks.includes('dark-patterns') ? Math.round(item.reward * 1.5) : item.reward;
    const newStats: PlayerStats = { ...stats, pendingXP: stats.pendingXP + xpGain };
    const state = get();
    const next = {
      stats: newStats,
      actionItems: newItems,
      tasksCompletedThisLevel: state.tasksCompletedThisLevel + 1,
      totalTaskCostThisLevel: state.totalTaskCostThisLevel + item.cost,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  useReviewBuddy: (id) => {
    const { stats, actionItems } = get();
    const item = actionItems.find((a) => a.id === id);
    if (!item || item.status !== 'in-review') return;
    if (!stats.inventory.some((t) => t.type === 'review-buddy')) return;
    const newItems = actionItems.map((a) => a.id === id ? { ...a, status: 'done' as const } : a);
    const newStats: PlayerStats = {
      ...stats,
      pendingXP: stats.pendingXP + item.reward,
      inventory: stats.inventory.filter((t) => t.type !== 'review-buddy'),
    };
    const state = get();
    const next = {
      stats: newStats,
      actionItems: newItems,
      tasksCompletedThisLevel: state.tasksCompletedThisLevel + 1,
      totalTaskCostThisLevel: state.totalTaskCostThisLevel + item.cost,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  endCycle: () => {
    const { stats, level, activePerks } = get();
    const config = LEVEL_CONFIGS[level];
    let lootDrop: ToolItem | null = null;
    if (Math.random() < 0.5) {
      const available = ALL_TOOL_TYPES.filter((t) => !stats.inventory.some((inv) => inv.type === t));
      if (available.length > 0) {
        const pickedType = available[Math.floor(Math.random() * available.length)];
        lootDrop = { type: pickedType, name: TOOL_DEFS[pickedType].name };
      }
    }
    const summary: CycleSummary = {
      xpEarned: stats.pendingXP,
      salaryEarned: config.salary,
      bandwidthBefore: stats.bandwidth,
      maxBandwidth: stats.maxBandwidth,
      lootDrop,
    };
    // Sample 3 perks for the draft (exclude already-active ones)
    const draft = samplePerks(3, activePerks);
    set({ cycleSummaryOpen: true, cycleSummary: summary, pendingPerkDraft: draft });
  },

  startNextCycle: () => {
    const { stats, level, cycleNumber, track, cycleSummary, activePerks } = get();
    if (!cycleSummary) return;
    const config = LEVEL_CONFIGS[level];

    // Epic 3.2: MGB recovery if player overperformed this cycle
    const perCycleTarget = config.impactGoal / config.cyclesTotal;
    const mgbBonus = stats.pendingXP > perCycleTarget * 1.5 ? 15 : 0;

    let newStats: PlayerStats = {
      ...stats,
      levelXP: stats.levelXP + cycleSummary.xpEarned,
      pendingXP: 0,
      netWorth: stats.netWorth + cycleSummary.salaryEarned,
      managerGoodBooks: clamp(stats.managerGoodBooks + mgbBonus, 0, 100),
    };

    if (cycleSummary.lootDrop && !newStats.inventory.some((t) => t.type === cycleSummary.lootDrop!.type)) {
      newStats = { ...newStats, inventory: [...newStats.inventory, cycleSummary.lootDrop] };
    }

    newStats = { ...newStats, inventory: newStats.inventory.filter((t) => t.type !== 'chatgpt-plus') };

    if (stats.burnout >= 80) {
      newStats = { ...newStats, burnout: clamp(stats.burnout - 40, 0, 100), bandwidth: stats.maxBandwidth };
    } else {
      newStats = { ...newStats, bandwidth: stats.maxBandwidth, burnout: clamp(stats.burnout - 5, 0, 100) };
    }

    // Rubber Duck: +20 BW at cycle start
    if (activePerks.includes('rubber-duck')) {
      newStats = { ...newStats, bandwidth: clamp(newStats.bandwidth + 20, 0, newStats.maxBandwidth) };
    }

    const newCycle = cycleNumber + 1;
    const isLastCycle = cycleNumber >= config.cyclesTotal;
    let newScreen: GameScreen = 'dashboard';
    let newItems = generateActionItems(level, track, newCycle);

    if (isLastCycle) {
      newScreen = 'performance-review';
      newItems = [];
    }

    const state = get();
    const next = {
      stats: newStats,
      cycleNumber: newCycle,
      screen: newScreen,
      actionItems: newItems,
      cycleSummaryOpen: false,
      cycleSummary: null as CycleSummary | null,
      pendingPerkDraft: null as Perk[] | null,
      helpRequestCount: 0,
      chaosEventsThisCycle: 0,
      perkCooldowns: [] as PerkId[],
      unplannedMeetingUsedThisCycle: false,
      clientCallUsedThisCycle: false,
      unscheduled1on1UsedThisCycle: false,
      mgbWarning1on1SeenThisCycle: false,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  advanceFromReview: (passed) => {
    const { level, stats, track } = get();

    if (!passed) {
      const state = get();
      const next = { screen: 'game-over' as GameScreen };
      set(next);
      persistState({ ...state, ...next } as GameState);
      return;
    }

    // Win condition: completing level 5
    if (level === 5) {
      const state = get();
      const next = { screen: 'win' as GameScreen };
      set(next);
      persistState({ ...state, ...next } as GameState);
      return;
    }

    const newLevel = (level + 1) as Level;
    const newItems = generateActionItems(newLevel, track, 1);
    const newStats: PlayerStats = {
      ...stats,
      bandwidth: stats.maxBandwidth,
      burnout: clamp(stats.burnout - 20, 0, 100),
      levelXP: 0,
      pendingXP: 0,
    };

    const { tutorialState } = get();
    const triggerDebt = !tutorialState.seenDebt;
    const state = get();
    const next = {
      level: newLevel,
      cycleNumber: 1,
      screen: 'dashboard' as GameScreen,
      stats: newStats,
      actionItems: newItems,
      directReports: newLevel === 5 ? buildJuniorRoster() : ([] as DirectReport[]),
      tasksCompletedThisLevel: 0,
      totalTaskCostThisLevel: 0,
      ...(triggerDebt ? { pendingTutorial: 'debt' as PendingTutorial } : {}),
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  drinkCoffee: () => {
    const { stats, activePerks, alumniUpgrades } = get();
    const caffeineAddict = activePerks.includes('caffeine-addict');
    const hasTeflon = alumniUpgrades.includes('teflon');
    const burnoutCap = hasTeflon ? 90 : 100;
    const bwGain = caffeineAddict ? 50 : 25;
    const burnoutGain = caffeineAddict ? 30 : 15;
    const newBW = clamp(stats.bandwidth + bwGain, 0, stats.maxBandwidth);
    const newBurnout = clamp(stats.burnout + burnoutGain, 0, burnoutCap);
    const newStats: PlayerStats = { ...stats, bandwidth: newBW, burnout: newBurnout };
    // Teflon prevents crash: burnout can never reach 100
    if (newBurnout >= 100) {
      const state = get();
      set({ stats: newStats, burnoutCrash: true });
      persistState({ ...state, stats: newStats } as GameState);
    } else {
      const state = get();
      set({ stats: newStats });
      persistState({ ...state, stats: newStats } as GameState);
    }
  },

  seniorConsult: () => set({ consultModalOpen: true }),
  closeConsultModal: () => set({ consultModalOpen: false }),

  freeConsult: () => {
    const { stats, helpRequestCount } = get();
    const newStats: PlayerStats = {
      ...stats,
      bandwidth: clamp(stats.bandwidth + 20, 0, stats.maxBandwidth),
      autonomy: clamp(stats.autonomy - 10, 0, 100),
      managerGoodBooks: clamp(stats.managerGoodBooks - 5, 0, 100),
    };
    const newCount = helpRequestCount + 1;
    const triggerWarning = newCount === 3;
    const state = get();
    const next = {
      stats: newStats,
      helpRequestCount: newCount,
      consultModalOpen: false,
      ...(triggerWarning ? { chattyManagerMessage: "Three consults already? I thought you were the senior engineer here." } : {}),
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  // Task 1.1: Premium consult costs $3,000 and instantly completes the oldest in-progress task
  premiumConsult: () => {
    const { stats, actionItems } = get();
    const COST = 3000;
    if (stats.netWorth < COST) return;
    const oldestInProgress = actionItems.find((a) => a.status === 'in-progress');
    const newItems = oldestInProgress
      ? actionItems.map((a) =>
          a.id === oldestInProgress.id ? { ...a, status: 'done' as const, progress: 100 } : a
        )
      : actionItems;
    const newStats: PlayerStats = {
      ...stats,
      netWorth: stats.netWorth - COST,
      pendingXP: oldestInProgress ? stats.pendingXP + oldestInProgress.reward : stats.pendingXP,
    };
    const state = get();
    set({ stats: newStats, actionItems: newItems, consultModalOpen: false });
    persistState({ ...state, stats: newStats, actionItems: newItems } as GameState);
  },

  takeSeverance: () => {
    const { stats, alumniUpgrades } = get();
    const hasGoldenParachute = alumniUpgrades.includes('golden-parachute');
    const newStats = hasGoldenParachute
      ? { ...stats, netWorth: stats.netWorth + 50000 }
      : stats;
    const state = get();
    const next = { screen: 'job-board' as GameScreen, stats: newStats };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  // Task 3.2 & 3.3: Set currentCompanyType and apply bandwidth modifier on join
  joinCompany: (tier) => {
    const { stats, track, alumniUpgrades, careerNetWorth } = get();
    const modifier = COMPANY_MODIFIERS[tier];
    const hasIvyLeague = alumniUpgrades.includes('ivy-league');
    const COMPANIES: Record<CompanyType, { name: string; level: Level }> = {
      startup: { name: 'Scrappy Startup Inc.', level: hasIvyLeague ? 2 : 1 },
      corp:    { name: 'NovaTech Corp',        level: hasIvyLeague ? 2 : 1 },
      faang:   { name: 'Faangla Inc.',         level: hasIvyLeague ? 2 : 2 },
    };
    const co = COMPANIES[tier];
    const newStats: PlayerStats = {
      ...stats,
      burnout: 0,
      levelXP: 0,
      pendingXP: 0,
      bandwidth: modifier.maxBandwidth,
      maxBandwidth: modifier.maxBandwidth,
      autonomy: 80,
      debt: 0,
      netWorth: 0,  // Task 1.2: Reset per-job netWorth after accumulating into careerNetWorth
    };
    const newItems = generateActionItems(co.level, track, 1);
    // Task 1.2: Accumulate career net worth (persists across jobs), then reset per-job counter
    const newCareerNetWorth = careerNetWorth + stats.netWorth;
    const state = get();
    const next = {
      stats: newStats,
      level: co.level,
      company: co.name,
      currentCompanyType: tier,
      cycleNumber: 1,
      screen: 'dashboard' as GameScreen,
      actionItems: newItems,
      helpRequestCount: 0,
      activePerks: [] as PerkId[],
      pendingPerkDraft: null as Perk[] | null,
      directReports: [] as DirectReport[],
      pendingTutorial: null as PendingTutorial | null,
      tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
      careerNetWorth: newCareerNetWorth,
      activeBuffs: [] as ToolItem[],
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  dismissCrash: () => {
    const { stats, level, cycleNumber, track } = get();
    const config = LEVEL_CONFIGS[level];
    const newCycle = cycleNumber + 1;
    const isLastCycle = cycleNumber >= config.cyclesTotal;
    const crashStats: PlayerStats = {
      ...stats,
      bandwidth: 50,
      burnout: 0,
      pendingXP: 0,
      inventory: stats.inventory.filter((t) => t.type !== 'chatgpt-plus'),
    };
    const newScreen: GameScreen = isLastCycle ? 'performance-review' : 'dashboard';
    const newItems = isLastCycle ? [] : generateActionItems(level, track, newCycle);
    const state = get();
    const next = {
      stats: crashStats,
      cycleNumber: newCycle,
      screen: newScreen,
      actionItems: newItems,
      burnoutCrash: false,
      helpRequestCount: 0,
      chaosEventsThisCycle: 0,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  dismissTutorial: () => {
    const { pendingTutorial, tutorialState } = get();
    if (!pendingTutorial) return;
    const keyMap: Record<PendingTutorial, keyof TutorialState> = {
      welcome: 'seenWelcome',
      grind: 'seenGrind',
      risks: 'seenRush',
      debt: 'seenDebt',
    };
    const newTutorialState: TutorialState = { ...tutorialState, [keyMap[pendingTutorial]]: true };
    const state = get();
    const next = { tutorialState: newTutorialState, pendingTutorial: null as PendingTutorial | null };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  openShop: () => set({ shopOpen: true }),
  closeShop: () => set({ shopOpen: false }),

  buyPerk: (perkId) => {
    const { stats } = get();
    const PERKS = {
      'mental-health-day': { cost: 2000, burnoutDelta: -15 },
      'hawaii-vacation':   { cost: 15000, burnoutDelta: -100 }, // instant full reset
    };
    const perk = PERKS[perkId];
    if (stats.netWorth < perk.cost) return;
    const newBurnout = clamp(stats.burnout + perk.burnoutDelta, 0, 100);
    const newStats: PlayerStats = { ...stats, netWorth: stats.netWorth - perk.cost, burnout: newBurnout };
    const toastMsg = perkId === 'hawaii-vacation'
      ? '🌴 Hawaii Vacation: Burnout reset to 0!'
      : '☕ Mental Health Day: Burnout -15%';
    const state = get();
    set({ stats: newStats, shopOpen: false, toolBlockedMessage: toastMsg });
    persistState({ ...state, stats: newStats } as GameState);
  },

  buyTool: (toolType: ToolItemType) => {
    const { stats } = get();
    const tool = TOOL_DEFS[toolType];
    if (stats.netWorth < tool.cost) return;

    // Task 1.3: Battery Pack restores headphone charges instead of adding to inventory
    if (toolType === 'battery-pack') {
      const hasHeadphones = stats.inventory.some((t) => t.type === 'noise-canceling-headphones');
      if (!hasHeadphones) return;
      const newInventory = stats.inventory.map((t) =>
        t.type === 'noise-canceling-headphones' ? { ...t, charges: 3 } : t
      );
      const newStats: PlayerStats = {
        ...stats,
        netWorth: stats.netWorth - tool.cost,
        inventory: newInventory,
      };
      const state = get();
      set({ stats: newStats });
      persistState({ ...state, stats: newStats } as GameState);
      return;
    }

    if (stats.inventory.some((t) => t.type === toolType)) return;
    // Task 1.3: Headphones start with 3 charges
    const newItem: ToolItem = toolType === 'noise-canceling-headphones'
      ? { type: toolType, name: tool.name, charges: 3 }
      : { type: toolType, name: tool.name };
    const newStats: PlayerStats = {
      ...stats,
      netWorth: stats.netWorth - tool.cost,
      inventory: [...stats.inventory, newItem],
    };
    const state = get();
    set({ stats: newStats });
    persistState({ ...state, stats: newStats } as GameState);
  },

  clearToolBlocked: () => set({ toolBlockedMessage: null }),

  // Task 1.3: Manually use headphones to block a HEADPHONE_BLOCKABLE chaos event
  useHeadphones: () => {
    const { pendingChaos, stats } = get();
    if (!pendingChaos) return;
    if (!HEADPHONE_BLOCKABLE.includes(pendingChaos.type)) return;
    const headphones = stats.inventory.find((t) => t.type === 'noise-canceling-headphones');
    if (!headphones) return;
    const currentCharges = headphones.charges ?? 1;
    const newInventory = currentCharges <= 1
      ? stats.inventory.filter((t) => t.type !== 'noise-canceling-headphones')
      : stats.inventory.map((t) =>
          t.type === 'noise-canceling-headphones' ? { ...t, charges: currentCharges - 1 } : t
        );
    const newStats = { ...stats, inventory: newInventory };
    const state = get();
    set({ pendingChaos: null, stats: newStats, toolBlockedMessage: '🎧 Event blocked. Back to coding.' });
    persistState({ ...state, pendingChaos: null, stats: newStats } as GameState);
  },

  // Task 2.2 & 2.3: Theme purchasing
  buyTheme: (themeId: ThemeId) => {
    const { stats, unlockedThemes } = get();
    if (unlockedThemes.includes(themeId)) return;
    const theme = THEMES[themeId];
    if (stats.netWorth < theme.cost) return;
    const newStats = { ...stats, netWorth: stats.netWorth - theme.cost };
    const newUnlocked = [...unlockedThemes, themeId];
    const state = get();
    const next = { stats: newStats, unlockedThemes: newUnlocked, activeTheme: themeId };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  setTheme: (themeId: ThemeId) => {
    const { unlockedThemes } = get();
    if (!unlockedThemes.includes(themeId)) return;
    const state = get();
    const next = { activeTheme: themeId };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  buyAvatar: (avatarId: AvatarId) => {
    const { stats, unlockedAvatars } = get();
    if (unlockedAvatars.includes(avatarId)) return;
    const avatar = AVATARS[avatarId];
    if (stats.netWorth < avatar.cost) return;
    const newStats = { ...stats, netWorth: stats.netWorth - avatar.cost };
    const newUnlocked = [...unlockedAvatars, avatarId];
    const state = get();
    const next = { stats: newStats, unlockedAvatars: newUnlocked, activeAvatar: avatarId };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  setAvatar: (avatarId: AvatarId) => {
    const { unlockedAvatars } = get();
    if (!unlockedAvatars.includes(avatarId)) return;
    const state = get();
    const next = { activeAvatar: avatarId };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  draftPerk: (perkId: PerkId) => {
    const { activePerks, stats, level, cycleNumber, track, cycleSummary } = get();
    if (activePerks.includes(perkId)) return;
    if (!cycleSummary) return;
    const config = LEVEL_CONFIGS[level];

    const newActivePerks = [...activePerks, perkId];

    // Epic 3.2: MGB recovery if player overperformed this cycle
    const perCycleTarget = config.impactGoal / config.cyclesTotal;
    const mgbBonus = stats.pendingXP > perCycleTarget * 1.5 ? 15 : 0;

    // Apply the same cycle-advance logic as startNextCycle, but with the new perk already active
    let newStats: PlayerStats = {
      ...stats,
      levelXP: stats.levelXP + cycleSummary.xpEarned,
      pendingXP: 0,
      netWorth: stats.netWorth + cycleSummary.salaryEarned,
      managerGoodBooks: clamp(stats.managerGoodBooks + mgbBonus, 0, 100),
    };

    if (cycleSummary.lootDrop && !newStats.inventory.some((t) => t.type === cycleSummary.lootDrop!.type)) {
      newStats = { ...newStats, inventory: [...newStats.inventory, cycleSummary.lootDrop] };
    }
    newStats = { ...newStats, inventory: newStats.inventory.filter((t) => t.type !== 'chatgpt-plus') };

    if (stats.burnout >= 80) {
      newStats = { ...newStats, burnout: clamp(stats.burnout - 40, 0, 100), bandwidth: stats.maxBandwidth };
    } else {
      newStats = { ...newStats, bandwidth: stats.maxBandwidth, burnout: clamp(stats.burnout - 5, 0, 100) };
    }

    // Rubber Duck bonus (check new perk list)
    if (newActivePerks.includes('rubber-duck')) {
      newStats = { ...newStats, bandwidth: clamp(newStats.bandwidth + 20, 0, newStats.maxBandwidth) };
    }

    const newCycle = cycleNumber + 1;
    const isLastCycle = cycleNumber >= config.cyclesTotal;
    let newScreen: GameScreen = 'dashboard';
    let newItems = generateActionItems(level, track, newCycle);
    if (isLastCycle) {
      newScreen = 'performance-review';
      newItems = [];
    }

    const state = get();
    const next = {
      activePerks: newActivePerks,
      pendingPerkDraft: null as Perk[] | null,
      stats: newStats,
      cycleNumber: newCycle,
      screen: newScreen,
      actionItems: newItems,
      cycleSummaryOpen: false,
      cycleSummary: null as CycleSummary | null,
      helpRequestCount: 0,
      chaosEventsThisCycle: 0,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  assignJunior: (juniorId, taskId) => {
    const { directReports, actionItems } = get();
    const newReports = directReports.map((j) =>
      j.id === juniorId ? { ...j, assignedTaskId: taskId } : j
    );
    const newItems = actionItems.map((a) =>
      a.id === taskId && a.status === 'todo' ? { ...a, status: 'in-progress' as const } : a
    );
    const state = get();
    const next = { directReports: newReports, actionItems: newItems };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  unassignJunior: (juniorId) => {
    const { directReports } = get();
    const newReports = directReports.map((j) =>
      j.id === juniorId ? { ...j, assignedTaskId: null } : j
    );
    const state = get();
    const next = { directReports: newReports };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  juniorTick: (taskId) => {
    const { actionItems } = get();
    const item = actionItems.find((a) => a.id === taskId);
    if (!item || item.status !== 'in-progress' || item.isBlocked) return;
    const newProgress = item.progress + 10;
    const isComplete = newProgress >= 100;
    // 20% chance to become blocked (only if not already blocked and not completing)
    const becomesBlocked = !isComplete && Math.random() < 0.2;
    const newItems = actionItems.map((a) =>
      a.id === taskId
        ? {
            ...a,
            progress: isComplete ? 100 : newProgress,
            status: isComplete ? ('in-review' as const) : a.status,
            reviewStartedAt: isComplete ? Date.now() : a.reviewStartedAt,
            isBlocked: becomesBlocked ? true : a.isBlocked,
          }
        : a
    );
    const state = get();
    const next = { actionItems: newItems };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  clearBlocker: (taskId) => {
    const { actionItems, stats } = get();
    const item = actionItems.find((a) => a.id === taskId);
    if (!item || !item.isBlocked) return;
    const newItems = actionItems.map((a) =>
      a.id === taskId ? { ...a, isBlocked: false } : a
    );
    const newStats: PlayerStats = {
      ...stats,
      bandwidth: clamp(stats.bandwidth - 10, 0, stats.maxBandwidth),
    };
    const state = get();
    const next = { actionItems: newItems, stats: newStats };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  openAlumniNetwork: () => {
    const state = get();
    const next = { screen: 'alumni-network' as GameScreen };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  goToJobBoard: () => {
    const state = get();
    const next = { screen: 'job-board' as GameScreen };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  buyAlumniUpgrade: (upgradeId: AlumniUpgradeId) => {
    const { careerNetWorth, alumniUpgrades } = get();
    if (alumniUpgrades.includes(upgradeId)) return;
    const upgrade = ALUMNI_UPGRADES[upgradeId];
    if (careerNetWorth < upgrade.cost) return;
    const state = get();
    const next = {
      careerNetWorth: careerNetWorth - upgrade.cost,
      alumniUpgrades: [...alumniUpgrades, upgradeId],
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  // Task 2.2 & 2.3: Use vacation from Tool Chest
  useVacation: () => {
    const { stats } = get();
    const hasVacation = stats.inventory.some((t) => t.type === 'vacation');
    if (!hasVacation) return;
    const newStats: PlayerStats = {
      ...stats,
      burnout: 0,
      inventory: stats.inventory.filter((t) => t.type !== 'vacation'),
    };
    const state = get();
    const next = { stats: newStats, toolBlockedMessage: '🌴 Vacation Used: Burnout Reset!' };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  // Epic 2.3: Consume Offline Update to bypass current chaos event
  useOfflineUpdate: () => {
    const { pendingChaos, stats } = get();
    if (!pendingChaos) return;
    const hasOfflineUpdate = stats.inventory.some((t) => t.type === 'offline-update');
    if (!hasOfflineUpdate) return;
    const newInventory = stats.inventory.filter((t) => t.type !== 'offline-update');
    const newStats = { ...stats, inventory: newInventory };
    const state = get();
    set({ pendingChaos: null, stats: newStats, toolBlockedMessage: '📴 Offline Update: Event bypassed!' });
    persistState({ ...state, pendingChaos: null, stats: newStats } as GameState);
  },

  // Task 3.3: Activate headphones from Tool Chest — moves to activeBuffs
  activateHeadphones: () => {
    const { stats, activeBuffs } = get();
    const headphones = stats.inventory.find((t) => t.type === 'noise-canceling-headphones');
    if (!headphones) return;
    const newInventory = stats.inventory.filter((t) => t.type !== 'noise-canceling-headphones');
    const newStats: PlayerStats = { ...stats, inventory: newInventory };
    const newActiveBuffs = [
      ...activeBuffs.filter((t) => t.type !== 'noise-canceling-headphones'),
      headphones,
    ];
    const state = get();
    const next = {
      stats: newStats,
      activeBuffs: newActiveBuffs,
      toolBlockedMessage: '🎧 Headphones active — will auto-block the next meeting event.',
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  // Task 3.4: Trigger a chaos event, checking activeBuffs first for auto-block
  triggerChaosEvent: (type, taskId) => {
    const { activeBuffs } = get();
    const activeHeadphones = activeBuffs.find((t) => t.type === 'noise-canceling-headphones');
    if (activeHeadphones && HEADPHONE_BLOCKABLE.includes(type)) {
      const charges = activeHeadphones.charges ?? 1;
      const remainingCharges = charges - 1;
      const newActiveBuffs = remainingCharges <= 0
        ? activeBuffs.filter((t) => t.type !== 'noise-canceling-headphones')
        : activeBuffs.map((t) =>
            t.type === 'noise-canceling-headphones' ? { ...t, charges: remainingCharges } : t
          );
      const state = get();
      const next = { activeBuffs: newActiveBuffs, toolBlockedMessage: '🎧 Headphones blocked this event.' };
      set(next);
      persistState({ ...state, ...next } as GameState);
      return;
    }
    const state = get();
    const next = { pendingChaos: { type, taskId } as ChaosEvent };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  resetGame: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      screen: 'start',
      playerName: '',
      track: 'engineering',
      level: 1,
      cycleNumber: 1,
      company: 'Acme Corp',
      currentCompanyType: 'corp',
      activeTheme: 'default',
      unlockedThemes: ['default'],
      activeAvatar: 'default',
      unlockedAvatars: ['default'],
      activePerks: [],
      pendingPerkDraft: null,
      stats: { ...DEFAULT_STATS },
      actionItems: [],
      tutorialState: { ...DEFAULT_TUTORIAL_STATE },
      pendingChaos: null,
      pendingTutorial: null,
      burnoutCrash: false,
      shopOpen: false,
      toolBlockedMessage: null,
      cycleSummaryOpen: false,
      cycleSummary: null,
      helpRequestCount: 0,
      chattyManagerMessage: null,
      consultModalOpen: false,
      careerNetWorth: 0,
      alumniUpgrades: [],
      perkCooldowns: [],
      unplannedMeetingUsedThisCycle: false,
      clientCallUsedThisCycle: false,
      unscheduled1on1UsedThisCycle: false,
      tasksCompletedThisLevel: 0,
      totalTaskCostThisLevel: 0,
      mgbWarning1on1Active: false,
      mgbWarning1on1SeenThisCycle: false,
    });
  },

  playPerk: (perkId) => {
    const { pendingChaos, perkCooldowns } = get();
    if (!pendingChaos) return;
    const PERK_DISPLAY: Partial<Record<PerkId, string>> = {
      'rubber-duck': 'Rubber Duck',
      'blame-shifter': 'Blame Shifter',
      '10x-dev': '10x Dev',
      'caffeine-addict': 'Caffeine Addict',
    };
    const label = PERK_DISPLAY[perkId] ?? perkId;
    const state = get();
    const next = {
      pendingChaos: null as ChaosEvent | null,
      perkCooldowns: [...perkCooldowns, perkId],
      toolBlockedMessage: `⚡ ${label} played — event blocked!`,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  completeTutorial: () => {
    const state = get();
    const next = { hasSeenTutorial: true };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  acceptUnplannedMeeting: () => {
    const { stats } = get();
    const newStats: PlayerStats = {
      ...stats,
      bandwidth: clamp(stats.bandwidth - 15, 0, stats.maxBandwidth),
      burnout: clamp(stats.burnout + 10, 0, 100),
    };
    const state = get();
    const next = {
      pendingChaos: null as ChaosEvent | null,
      stats: newStats,
      unplannedMeetingUsedThisCycle: true,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  skipUnplannedMeeting: () => {
    const state = get();
    const next = {
      pendingChaos: null as ChaosEvent | null,
      unplannedMeetingUsedThisCycle: true,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  resolveMiniGame: (outcome) => {
    const { stats } = get();
    let newStats: PlayerStats = { ...stats };
    if (outcome === 'survived') {
      newStats = {
        ...newStats,
        bandwidth: clamp(stats.bandwidth + 30, 0, stats.maxBandwidth),
        burnout: clamp(stats.burnout - 15, 0, 100),
      };
    } else {
      newStats = {
        ...newStats,
        managerGoodBooks: clamp(stats.managerGoodBooks - 25, 0, 100),
      };
    }
    const state = get();
    const next = { stats: newStats };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  acceptClientCall: () => {
    const { stats } = get();
    const newStats: PlayerStats = {
      ...stats,
      bandwidth: clamp(stats.bandwidth - 30, 0, stats.maxBandwidth),
    };
    const state = get();
    const next = {
      pendingChaos: null as ChaosEvent | null,
      stats: newStats,
      clientCallUsedThisCycle: true,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  triggerFightPM: () => {
    const state = get();
    const next = {
      pendingChaos: null as ChaosEvent | null,
      clientCallUsedThisCycle: true,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  resolveFistFight: (outcome) => {
    const { stats } = get();
    let newStats: PlayerStats = { ...stats };
    if (outcome === 'victory') {
      newStats = {
        ...newStats,
        autonomy: clamp(stats.autonomy + 20, 0, 100),
        bandwidth: clamp(stats.bandwidth + 10, 0, stats.maxBandwidth),
        burnout: clamp(stats.burnout - 10, 0, 100),
      };
    } else {
      newStats = {
        ...newStats,
        bandwidth: clamp(stats.bandwidth - 40, 0, stats.maxBandwidth),
        managerGoodBooks: clamp(stats.managerGoodBooks - 20, 0, 100),
      };
    }
    const mgbPatch = outcome === 'defeat' ? checkMgbWarning(newStats.managerGoodBooks, get()) : {};
    const state = get();
    const next = { stats: newStats, ...mgbPatch };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  acceptUnscheduled1on1: () => {
    const { stats } = get();
    const newStats: PlayerStats = {
      ...stats,
      bandwidth: clamp(stats.bandwidth - 20, 0, stats.maxBandwidth),
    };
    const state = get();
    const next = {
      pendingChaos: null as ChaosEvent | null,
      stats: newStats,
      unscheduled1on1UsedThisCycle: true,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  triggerDuel: () => {
    const state = get();
    const next = {
      pendingChaos: null as ChaosEvent | null,
      unscheduled1on1UsedThisCycle: true,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  resolveDuel: (outcome) => {
    const { stats } = get();
    let newStats: PlayerStats = { ...stats };
    if (outcome === 'win') {
      newStats = {
        ...newStats,
        autonomy: clamp(stats.autonomy + 30, 0, 100),
        managerGoodBooks: clamp(stats.managerGoodBooks + 15, 0, 100),
      };
    } else {
      newStats = {
        ...newStats,
        bandwidth: clamp(stats.bandwidth - 30, 0, stats.maxBandwidth),
        burnout: clamp(stats.burnout + 20, 0, 100),
      };
    }
    const state = get();
    const next = { stats: newStats };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },

  resolveMgrOneOnOne: (outcome) => {
    const { stats } = get();
    const mgbDelta = outcome === 'win' ? 25 : outcome === 'lose' ? -20 : 0;
    const newStats: PlayerStats = {
      ...stats,
      managerGoodBooks: clamp(stats.managerGoodBooks + mgbDelta, 0, 100),
    };
    const state = get();
    const next = {
      stats: newStats,
      mgbWarning1on1Active: false,
    };
    set(next);
    persistState({ ...state, ...next } as GameState);
  },
}));

// Expose store for E2E tests
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__bandwidthStore = useGameStore;
}
