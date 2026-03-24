// ─── Alumni Network ───────────────────────────────────────────────────────

export type AlumniUpgradeId = 'ivy-league' | 'teflon' | 'golden-parachute';

export interface AlumniUpgrade {
  id: AlumniUpgradeId;
  name: string;
  description: string;
  cost: number;
}

export const ALUMNI_UPGRADES: Record<AlumniUpgradeId, AlumniUpgrade> = {
  'ivy-league': {
    id: 'ivy-league',
    name: 'Ivy League Degree',
    description: 'Start new jobs at L4 instead of L3.',
    cost: 50000,
  },
  'teflon': {
    id: 'teflon',
    name: 'Teflon',
    description: 'Burnout caps at 90%, preventing the crash cycle.',
    cost: 30000,
  },
  'golden-parachute': {
    id: 'golden-parachute',
    name: 'Golden Parachute',
    description: 'Severance grants an extra +$50,000.',
    cost: 20000,
  },
};

// ─── Automation System (L5+) ─────────────────────────────────────────────

export interface DirectReport {
  id: string;
  name: string;
  assignedTaskId: string | null;
}

export const JUNIOR_NAMES = [
  'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley',
  'Taylor', 'Quinn', 'Avery', 'Blake', 'Drew',
];

// ─── Perk System ─────────────────────────────────────────────────────────

export type PerkId =
  | 'caffeine-addict'
  | 'blame-shifter'
  | '10x-dev'
  | 'rubber-duck'
  | 'dark-patterns';

export interface PerkModifierEffects {
  /** Multiplier applied to BW gained from drinkCoffee (default 1) */
  coffeeBWMultiplier?: number;
  /** Multiplier applied to burnout gained from drinkCoffee (default 1) */
  coffeeBurnoutMultiplier?: number;
  /** If true, rushTask adds 0 debt (Blame Shifter) */
  rushZeroDebt?: boolean;
  /** Flat MGB drain on rushTask (Blame Shifter) */
  rushMGBDrain?: number;
  /** Multiplier applied to chaos probability in grindTask (default 1) */
  grindChaosMultiplier?: number;
  /** Multiplier applied to task cost at generation time (default 1) */
  taskCostMultiplier?: number;
  /** Flat BW restored each cycle start (Rubber Duck) */
  cycleStartBWBonus?: number;
  /** Multiplier applied to debt added by any action (Dark Patterns) */
  debtMultiplier?: number;
  /** Multiplier applied to XP earned (Dark Patterns) */
  xpMultiplier?: number;
}

export interface Perk {
  id: PerkId;
  name: string;
  description: string;
  modifierEffects: PerkModifierEffects;
}

// ─── Cosmetics ────────────────────────────────────────────────────────────

export type ThemeId = 'default' | 'hacker' | 'vaporwave';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  cost: number;
  bgClass: string;
  textClass: string;
  accentClass: string;
  borderClass: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  default: {
    id: 'default',
    name: 'Default (Dark)',
    cost: 0,
    bgClass: 'bg-zinc-900',
    textClass: 'text-zinc-100',
    accentClass: 'text-blue-400',
    borderClass: 'border-zinc-700',
  },
  hacker: {
    id: 'hacker',
    name: 'Hacker Green',
    cost: 5000,
    bgClass: 'bg-green-950',
    textClass: 'text-green-300',
    accentClass: 'text-green-400',
    borderClass: 'border-green-800',
  },
  vaporwave: {
    id: 'vaporwave',
    name: 'Vaporwave',
    cost: 8000,
    bgClass: 'bg-purple-950',
    textClass: 'text-pink-300',
    accentClass: 'text-pink-400',
    borderClass: 'border-purple-700',
  },
};

export type AvatarId = 'default' | 'ninja' | 'robot';

export interface AvatarConfig {
  id: AvatarId;
  name: string;
  cost: number;
  emoji: string;
}

export const AVATARS: Record<AvatarId, AvatarConfig> = {
  default: { id: 'default', name: 'Default', cost: 0, emoji: '🧑‍💻' },
  ninja:   { id: 'ninja',   name: 'Code Ninja', cost: 3000, emoji: '🥷' },
  robot:   { id: 'robot',   name: 'Robot Mode', cost: 4000, emoji: '🤖' },
};

// ─── Tutorial System ──────────────────────────────────────────────────────

export interface TutorialState {
  seenWelcome: boolean;
  seenGrind: boolean;
  seenRush: boolean;
  seenDebt: boolean;
}

export type PendingTutorial = 'welcome' | 'grind' | 'risks' | 'debt';

// ─── Tool Chest ───────────────────────────────────────────────────────────

export type ToolItemType =
  | 'noise-canceling-headphones'
  | 'chatgpt-plus'
  | 'offline-update'
  | 'review-buddy'
  | 'battery-pack'
  | 'vacation';

export interface ToolItem {
  type: ToolItemType;
  name: string;
  charges?: number;  // for noise-canceling-headphones (max 3)
}

// ─── Core Game Types ───────────────────────────────────────────────────────

export type ActionItemStatus = 'todo' | 'in-progress' | 'in-review' | 'done';

export interface ActionItem {
  id: string;
  title: string;
  cost: number;
  reward: number;
  debtRisk: number;
  status: ActionItemStatus;
  progress: number;
  reviewStartedAt?: number;
  isBlocked?: boolean;
}

// ─── Chaos System ─────────────────────────────────────────────────────────

export type ChaosEventType =
  | 'scope-creep'
  | 'pagerduty'
  | 'mandatory-meeting'
  | 'optional-outing'
  | 'pm-status-update'
  | 're-org'
  | 'standup'
  | 'unplanned-meeting'
  | 'client-call'
  | 'unscheduled-1on1';

export interface ChaosEvent {
  type: ChaosEventType;
  taskId?: string;  // only required for task-specific events (scope-creep)
}

export interface PlayerStats {
  bandwidth: number;
  maxBandwidth: number;
  burnout: number;
  autonomy: number;
  debt: number;
  levelXP: number;
  pendingXP: number;
  netWorth: number;           // personal wealth in $
  managerGoodBooks: number;   // 0–100, reputation metric
  inventory: ToolItem[];
}

export interface CycleSummary {
  xpEarned: number;
  salaryEarned: number;
  bandwidthBefore: number;
  maxBandwidth: number;
  lootDrop: ToolItem | null;
}

export type CareerTrack = 'engineering' | 'product' | 'sales';

export type GameScreen =
  | 'start'
  | 'offer-letter'
  | 'dashboard'
  | 'performance-review'
  | 'job-board'
  | 'alumni-network'
  | 'win'
  | 'game-over';

export type CompanyType = 'startup' | 'corp' | 'faang';

export const COMPANY_MODIFIERS: Record<CompanyType, {
  maxBandwidth: number;
  reviewDurationSeconds: number;
  chaosMultiplier: number;
  label: string;
  modifier: string;
}> = {
  startup: {
    maxBandwidth: 80,
    reviewDurationSeconds: 0,
    chaosMultiplier: 1,
    label: 'Crappy Startup',
    modifier: 'Move Fast, Break Things',
  },
  corp: {
    maxBandwidth: 100,
    reviewDurationSeconds: 5,
    chaosMultiplier: 1,
    label: 'Mid-Tier Corp',
    modifier: 'Standard Agile',
  },
  faang: {
    maxBandwidth: 150,
    reviewDurationSeconds: 15,
    chaosMultiplier: 2,
    label: 'FAANG / Big Tech',
    modifier: 'Golden Handcuffs & Bureaucracy',
  },
};

export type Level = 1 | 2 | 3 | 4 | 5;

export interface LevelConfig {
  level: Level;
  cyclesTotal: number;
  impactGoal: number;
  label: string;
  nextLabel: string;
  salary: number;  // per-cycle earnings
  reviewGates: {
    minTasksCompleted: number;
    minAvgTaskCost: number;
  };
}

export const LEVEL_CONFIGS: Record<Level, LevelConfig> = {
  1: {
    level: 1,
    cyclesTotal: 5,
    impactGoal: 100,
    label: 'L3 Engineer',
    nextLabel: 'L4 Engineer',
    salary: 5000,
    reviewGates: { minTasksCompleted: 3, minAvgTaskCost: 6 },
  },
  2: {
    level: 2,
    cyclesTotal: 8,
    impactGoal: 300,
    label: 'L4 Engineer',
    nextLabel: 'L5 Engineer (Staff)',
    salary: 8000,
    reviewGates: { minTasksCompleted: 4, minAvgTaskCost: 25 },
  },
  3: {
    level: 3,
    cyclesTotal: 10,
    impactGoal: 600,
    label: 'L5 Engineer (Staff)',
    nextLabel: 'L6 Engineer (Principal)',
    salary: 12000,
    reviewGates: { minTasksCompleted: 5, minAvgTaskCost: 30 },
  },
  4: {
    level: 4,
    cyclesTotal: 12,
    impactGoal: 1000,
    label: 'L6 Engineer (Principal)',
    nextLabel: 'L7 Director',
    salary: 18000,
    reviewGates: { minTasksCompleted: 6, minAvgTaskCost: 35 },
  },
  5: {
    level: 5,
    cyclesTotal: 15,
    impactGoal: 2000,
    label: 'L7 Director',
    nextLabel: 'CEO',
    salary: 30000,
    reviewGates: { minTasksCompleted: 8, minAvgTaskCost: 40 },
  },
};
