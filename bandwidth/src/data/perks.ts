import type { Perk, PerkId } from '../types';

export const ALL_PERKS: Record<PerkId, Perk> = {
  'caffeine-addict': {
    id: 'caffeine-addict',
    name: 'Caffeine Addict',
    description: 'Coffee gives 2× BW — but also 2× Burnout. High risk, high reward.',
    modifierEffects: {
      coffeeBWMultiplier: 2,
      coffeeBurnoutMultiplier: 2,
    },
  },
  'blame-shifter': {
    id: 'blame-shifter',
    name: 'Blame Shifter',
    description: '"Ship it Dirty" adds 0 Project Debt, but drains -15 Manager Good Books.',
    modifierEffects: {
      rushZeroDebt: true,
      rushMGBDrain: 15,
    },
  },
  '10x-dev': {
    id: '10x-dev',
    name: '10x Dev',
    description: 'Task complexity -30%, but RNG interruptions happen 3× more often.',
    modifierEffects: {
      grindChaosMultiplier: 3,
      taskCostMultiplier: 0.7,
    },
  },
  'rubber-duck': {
    id: 'rubber-duck',
    name: 'Rubber Duck',
    description: 'Start each cycle with +20 bonus Bandwidth. Talking to inanimate objects pays off.',
    modifierEffects: {
      cycleStartBWBonus: 20,
    },
  },
  'dark-patterns': {
    id: 'dark-patterns',
    name: 'Dark Patterns',
    description: 'All XP gains are 1.5×, but all Debt gains are also 1.5×. Optimize ruthlessly.',
    modifierEffects: {
      debtMultiplier: 1.5,
      xpMultiplier: 1.5,
    },
  },
};

export const PERK_LIST: Perk[] = Object.values(ALL_PERKS);

/** Pick `count` unique random perks from the full pool */
export function samplePerks(count: number, exclude: PerkId[] = []): Perk[] {
  const pool = PERK_LIST.filter((p) => !exclude.includes(p.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
