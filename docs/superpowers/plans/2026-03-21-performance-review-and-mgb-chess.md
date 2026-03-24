# Performance Review Fix + MGB 1:1 Chess Interrupt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the performance review to require completed task volume and complexity (not just XP), and add a fullscreen manager 1:1 interrupt with a timed chess mini-game when MGB drops below 50.

**Architecture:** Two independent features wired through the Zustand store (`store.ts`). Feature 1 adds two counters (`tasksCompletedThisLevel`, `totalTaskCostThisLevel`) that feed new promotion gates. Feature 2 adds a reactive MGB threshold check that triggers `mgbWarning1on1Active`, rendering a fullscreen `ManagerOneOnOne` component that launches `ManagerChess` — a React DOM chess board with a pure-function engine and a random-legal-move manager AI.

**Tech Stack:** React 19, TypeScript (strict), Tailwind CSS v4, Zustand v5. Build: `npm run build` from `bandwidth/`. E2E tests: Playwright (`npx playwright test` from `bandwidth/`).

---

## File Map

| File | Action | What changes |
|---|---|---|
| `src/types.ts` | Modify | Add `reviewGates` field to `LevelConfig` interface; populate for all 5 levels |
| `src/store.ts` | Modify | Add 4 new state fields; update 6 actions; add `checkMgbWarning` helper; add `resolveMgrOneOnOne` |
| `src/components/PerformanceReview.tsx` | Modify | Update `buildPassResult`, `buildManagerDialogue`, stats bar (2 new columns) |
| `src/components/Dashboard.tsx` | Modify | Import new components; add 2 local state vars; update `timerActive`; add 2 overlays |
| `src/components/ManagerOneOnOne.tsx` | **Create** | Fullscreen 1:1 interrupt with typewriter text, stakes panel, chess launch button |
| `src/components/ManagerChess.tsx` | **Create** | Chess engine (pure fns) + React DOM board + manager AI + 5-min timer + outcome overlays |
| `tests/mgb-chess.spec.ts` | **Create** | Playwright E2E tests for both features |

---

## Task 1: Types — Add Review Gates to LevelConfig

**Files:**
- Modify: `src/types.ts`

Context: `LevelConfig` is defined at `types.ts:271`. `LEVEL_CONFIGS` is at `types.ts:280`. We're adding a `reviewGates` field that `PerformanceReview.tsx` and `store.ts` will both read.

- [ ] **Step 1: Add `reviewGates` to the `LevelConfig` interface**

In `src/types.ts`, find the `LevelConfig` interface (around line 271) and add the new field:

```ts
export interface LevelConfig {
  level: Level;
  cyclesTotal: number;
  impactGoal: number;
  label: string;
  nextLabel: string;
  salary: number;
  reviewGates: {
    minTasksCompleted: number;
    minAvgTaskCost: number;
  };
}
```

- [ ] **Step 2: Populate `reviewGates` in every `LEVEL_CONFIGS` entry**

Update each level entry in `LEVEL_CONFIGS` to include the new field:

```ts
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
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/sonaliprabhu/Codebase/sakkathguru/bandwidth && npm run build 2>&1 | head -30
```

Expected: build succeeds (no errors about `reviewGates`). If you see "Property 'reviewGates' is missing" errors, you missed a level entry — fix them.

---

## Task 2: Store — Performance Review Counters

**Files:**
- Modify: `src/store.ts`

Context: `GameState` interface is at `store.ts:88`. The store object initialisation is around line 233. Actions `completeReview` (line 564), `useReviewBuddy` (line 578), `advanceFromReview` (line 681), `startNextCycle` (line 617), `resetGame` (~line 800), `startGame` (~line 271) all need updates.

`persistState` destructuring is at lines 199–222 — new state fields that ARE serializable do NOT go in the exclusion list (they should be persisted).

- [ ] **Step 1: Add new fields to `GameState` interface**

Find the `interface GameState` block (line 88). After the existing `unscheduled1on1UsedThisCycle: boolean;` line, add:

```ts
tasksCompletedThisLevel: number;
totalTaskCostThisLevel: number;
```

- [ ] **Step 2: Initialise new fields in the store object**

In the `create<GameState>((set, get) => ({` block (around line 233), after `unscheduled1on1UsedThisCycle: false,` add:

```ts
tasksCompletedThisLevel: (persisted as Partial<GameState>)?.tasksCompletedThisLevel ?? 0,
totalTaskCostThisLevel: (persisted as Partial<GameState>)?.totalTaskCostThisLevel ?? 0,
```

- [ ] **Step 3: Increment counters in `completeReview`**

Find `completeReview: (id) => {` (line 564). After `const newItems = ...` and the `xpGain` computation, update the stats assignment to also increment the counters. The completed item's `cost` field is the task complexity. Change:

```ts
const newStats: PlayerStats = { ...stats, pendingXP: stats.pendingXP + xpGain };
```

to:

```ts
const newStats: PlayerStats = { ...stats, pendingXP: stats.pendingXP + xpGain };
```

And add after `const newStats`:

```ts
const state = get();
const next = {
  stats: newStats,
  actionItems: newItems,
  tasksCompletedThisLevel: state.tasksCompletedThisLevel + 1,
  totalTaskCostThisLevel: state.totalTaskCostThisLevel + item.cost,
};
set(next);
persistState({ ...state, ...next } as GameState);
```

Replace the existing `set` and `persistState` calls at the bottom of `completeReview` with the above (they were doing `set({ stats: newStats, actionItems: newItems })`).

- [ ] **Step 4: Increment counters in `useReviewBuddy`**

Find `useReviewBuddy: (id) => {` (line ~578). Apply the same pattern — after setting `newStats`, update the `next` object:

```ts
const state = get();
const next = {
  stats: newStats,
  actionItems: newItems,
  tasksCompletedThisLevel: state.tasksCompletedThisLevel + 1,
  totalTaskCostThisLevel: state.totalTaskCostThisLevel + item.cost,
};
set(next);
persistState({ ...state, ...next } as GameState);
```

Replace the two existing `set`/`persistState` calls at the bottom of `useReviewBuddy`.

- [ ] **Step 5: Reset counters in `advanceFromReview`**

In `advanceFromReview` (line 681), when moving to a new level the counters must reset. Find where `next` is constructed (around line 714) and add the two fields:

```ts
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
```

- [ ] **Step 6: Reset counters in `startGame` and `resetGame`**

In `startGame` (around line 271), add to the `next` object:
```ts
tasksCompletedThisLevel: 0,
totalTaskCostThisLevel: 0,
```

In `resetGame` (find it by searching for `resetGame:`), add the same two fields to whatever `next` object it constructs.

- [ ] **Step 7: Verify TypeScript compiles**

```bash
cd /Users/sonaliprabhu/Codebase/sakkathguru/bandwidth && npm run build 2>&1 | head -30
```

Expected: clean build.

---

## Task 3: Performance Review UI — Two New Gates

**Files:**
- Modify: `src/components/PerformanceReview.tsx`

Context: The full file was read. `buildPassResult` is at line 32. `buildManagerDialogue` is at line 14. The stats bar is the `grid grid-cols-4` div at line 86 (currently 4 columns). `Props` interface at line 6 needs two new fields. `PerformanceReview` component receives `stats` and `level` as props — we need to also pass `tasksCompletedThisLevel` and `totalTaskCostThisLevel` from the store.

- [ ] **Step 1: Update `Props` to include the new counters**

```ts
interface Props {
  stats: PlayerStats;
  level: Level;
  onResult: (passed: boolean) => void;
  tasksCompletedThisLevel: number;
  totalTaskCostThisLevel: number;
}
```

- [ ] **Step 2: Update `buildPassResult` to check all three gates**

Replace the current function:

```ts
function buildPassResult(
  stats: PlayerStats,
  level: Level,
  tasksCompleted: number,
  totalTaskCost: number,
): boolean {
  const config = LEVEL_CONFIGS[level];
  const xpOk = stats.levelXP >= config.impactGoal;
  const volumeOk = tasksCompleted >= config.reviewGates.minTasksCompleted;
  const avgCost = tasksCompleted > 0 ? totalTaskCost / tasksCompleted : 0;
  const complexityOk = avgCost >= config.reviewGates.minAvgTaskCost;
  return xpOk && volumeOk && complexityOk;
}
```

- [ ] **Step 3: Update `buildManagerDialogue` with new failure branches**

Replace the current function with one that checks volume and complexity failures first:

```ts
function buildManagerDialogue(
  stats: PlayerStats,
  level: Level,
  tasksCompleted: number,
  totalTaskCost: number,
): string {
  const config = LEVEL_CONFIGS[level];
  const xpPassed = stats.levelXP >= config.impactGoal;
  const mgbPassed = stats.managerGoodBooks > 40;
  const volumePassed = tasksCompleted >= config.reviewGates.minTasksCompleted;
  const avgCost = tasksCompleted > 0 ? totalTaskCost / tasksCompleted : 0;
  const complexityPassed = avgCost >= config.reviewGates.minAvgTaskCost;

  if (!volumePassed) {
    return `Impact numbers are fine, but you only closed out ${tasksCompleted} task${tasksCompleted === 1 ? '' : 's'} this cycle. Volume matters. I need to see you shipping, not just grinding one thing.`;
  }
  if (!complexityPassed) {
    return `You completed tasks, but nothing that moved the needle. I need to see you taking on harder problems — the average complexity of your work was too low for this level.`;
  }
  if (!xpPassed) {
    return `I appreciate the effort this cycle. Let's talk about where you landed. Impact is the primary metric, and honestly — it's not where it needs to be for a promotion discussion right now.`;
  }
  if (!mgbPassed) {
    return `You hit your impact numbers, I'll give you that. But there are concerns beyond the metrics. Our working relationship has been strained this cycle, and leadership reputation matters for promotion decisions. I can't recommend you right now.`;
  }
  if (stats.debt > 60) {
    return `Strong cycle — you hit your impact target and maintained good standing. I do want to flag the tech debt situation; keep that under control. But overall, the committee agreed. Congratulations.`;
  }
  return `Strong cycle. You hit your impact target, closed meaningful work, kept good standing with the team, and showed real ownership. This is exactly what we're looking for at the next level. Congratulations.`;
}
```

- [ ] **Step 4: Update `getWorstStat` to include volume/complexity**

```ts
function getWorstStat(
  stats: PlayerStats,
  level: Level,
  tasksCompleted: number,
  totalTaskCost: number,
): string {
  const config = LEVEL_CONFIGS[level];
  const avgCost = tasksCompleted > 0 ? totalTaskCost / tasksCompleted : 0;
  const issues: { stat: string; severity: number }[] = [
    { stat: 'Tasks Completed', severity: tasksCompleted < config.reviewGates.minTasksCompleted ? (config.reviewGates.minTasksCompleted - tasksCompleted) * 10 : 0 },
    { stat: 'Task Complexity', severity: avgCost < config.reviewGates.minAvgTaskCost ? (config.reviewGates.minAvgTaskCost - avgCost) : 0 },
    { stat: 'Impact', severity: stats.levelXP < config.impactGoal ? (config.impactGoal - stats.levelXP) : 0 },
    { stat: 'Autonomy', severity: stats.autonomy < 60 ? (60 - stats.autonomy) : 0 },
    { stat: 'Project Debt', severity: stats.debt > 40 ? stats.debt - 40 : 0 },
  ];
  const worst = issues.reduce((a, b) => (a.severity > b.severity ? a : b));
  return worst.severity > 0 ? worst.stat : '';
}
```

- [ ] **Step 5: Update the component to use the new props and functions**

In `export function PerformanceReview({ stats, level, onResult, tasksCompletedThisLevel, totalTaskCostThisLevel }: Props)`:

```ts
const passed = buildPassResult(stats, level, tasksCompletedThisLevel, totalTaskCostThisLevel);
const managerText = buildManagerDialogue(stats, level, tasksCompletedThisLevel, totalTaskCostThisLevel);
const worstStat = getWorstStat(stats, level, tasksCompletedThisLevel, totalTaskCostThisLevel);
```

- [ ] **Step 6: Add two new columns to the stats bar**

The current stats bar is a `grid grid-cols-4`. Change it to `grid grid-cols-6` and add two new stat entries after the existing four. Find the array `.map` at line 87:

```tsx
{[
  { label: 'Impact', value: `${stats.levelXP} / ${config.impactGoal}`, ok: stats.levelXP >= config.impactGoal },
  { label: 'Autonomy', value: `${stats.autonomy}%`, ok: stats.autonomy >= 60 },
  { label: 'Project Debt', value: `${stats.debt}%`, ok: stats.debt < 50 },
  { label: 'Burnout', value: `${stats.burnout}%`, ok: stats.burnout < 80 },
  { label: 'Tasks Done', value: `${tasksCompletedThisLevel} / ${config.reviewGates.minTasksCompleted}`, ok: tasksCompletedThisLevel >= config.reviewGates.minTasksCompleted },
  {
    label: 'Avg Complexity',
    value: tasksCompletedThisLevel > 0 ? `${Math.round(totalTaskCostThisLevel / tasksCompletedThisLevel)} / ${config.reviewGates.minAvgTaskCost}` : `0 / ${config.reviewGates.minAvgTaskCost}`,
    ok: tasksCompletedThisLevel > 0 && (totalTaskCostThisLevel / tasksCompletedThisLevel) >= config.reviewGates.minAvgTaskCost,
  },
].map((s, i) => (
  <div key={s.label} className={`px-5 py-4 ${i < 5 ? 'border-r border-zinc-700' : ''}`}>
    ...
  </div>
))}
```

Change the outer div's className from `grid grid-cols-4` to `grid grid-cols-6`.

- [ ] **Step 7: Wire the new props in `App.tsx` or wherever `PerformanceReview` is rendered**

Find where `<PerformanceReview` is rendered (check `src/App.tsx`):

```bash
grep -n "PerformanceReview" /Users/sonaliprabhu/Codebase/sakkathguru/bandwidth/src/App.tsx
```

In `App.tsx`, pull `tasksCompletedThisLevel` and `totalTaskCostThisLevel` from the store and pass them as props:

```tsx
const tasksCompletedThisLevel = useGameStore(s => s.tasksCompletedThisLevel);
const totalTaskCostThisLevel = useGameStore(s => s.totalTaskCostThisLevel);

// ...
<PerformanceReview
  stats={stats}
  level={level}
  onResult={advanceFromReview}
  tasksCompletedThisLevel={tasksCompletedThisLevel}
  totalTaskCostThisLevel={totalTaskCostThisLevel}
/>
```

- [ ] **Step 8: Verify TypeScript compiles**

```bash
cd /Users/sonaliprabhu/Codebase/sakkathguru/bandwidth && npm run build 2>&1 | head -40
```

Expected: clean build.

---

## Task 4: Store — MGB Warning State + `resolveMgrOneOnOne`

**Files:**
- Modify: `src/store.ts`

Context: The `GameState` interface, initialisation block, and `persistState` function were all read in earlier steps.

- [ ] **Step 1: Add new fields to `GameState` interface**

After the `tasksCompletedThisLevel` and `totalTaskCostThisLevel` lines added in Task 2, add:

```ts
mgbWarning1on1Active: boolean;
mgbWarning1on1SeenThisCycle: boolean;
```

Also add the new action signature to the `// Actions` section:

```ts
resolveMgrOneOnOne: (outcome: 'win' | 'lose' | 'draw') => void;
```

- [ ] **Step 2: Initialise new fields in the store object**

After `unscheduled1on1UsedThisCycle: false,` (and after the two counters from Task 2) add:

```ts
mgbWarning1on1Active: false,
mgbWarning1on1SeenThisCycle: false,
```

- [ ] **Step 3: Add `checkMgbWarning` helper function**

Add this pure helper near the top of the store file (after the `clamp` function, around line 29):

```ts
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
```

- [ ] **Step 4: Call `checkMgbWarning` in `grindTask`**

In `grindTask`, after computing `newStats`, find the `set(next)` call. In the `next` object, spread the result of `checkMgbWarning`. The grindTask action computes `newStats` with MGB changes when chaos events fire. Look for where `newStats` is finalized and the `set`/`persistState` pair. Update:

```ts
const mgbPatch = checkMgbWarning(newStats.managerGoodBooks, get());
const next = { stats: newStats, actionItems: newItems, pendingChaos: newPendingChaos, chaosEventsThisCycle: newChaosCount, ...mgbPatch };
```

(The exact variable names differ — search for the `set(` call near the end of `grindTask` and add the spread there.)

- [ ] **Step 5: Call `checkMgbWarning` in `rushTask`**

In `rushTask` (line 506), after computing `newStats`:

```ts
const mgbPatch = checkMgbWarning(newStats.managerGoodBooks, get());
const next = { stats: newStats, actionItems: newItems, ...mgbPatch };
```

Replace the existing `const next = { stats: newStats, actionItems: newItems };` with the above.

- [ ] **Step 6: Call `checkMgbWarning` in `escalateTask`**

In `escalateTask` (line 537), after computing `newStats` (which reduces MGB by 15). Add the same pattern to the `next` object before `set`.

- [ ] **Step 7: Skip `acceptUnplannedMeeting` — it does not reduce MGB**

`acceptUnplannedMeeting` only reduces bandwidth and burnout. Do NOT add `checkMgbWarning` here. No code change needed.

- [ ] **Step 8: Call `checkMgbWarning` in `resolveFistFight` (defeat path)**

Find `resolveFistFight:`. The defeat path reduces MGB. Add `checkMgbWarning` to the `next` for the defeat branch only.

- [ ] **Step 9: Skip `resolveDuel` loss path — it does not reduce MGB**

`resolveDuel` loss reduces bandwidth and burnout only. Do NOT add `checkMgbWarning` here. No code change needed.

- [ ] **Step 10: Reset `mgbWarning1on1SeenThisCycle` in `startNextCycle`**

In `startNextCycle` (line 617), add to the `next` object:

```ts
mgbWarning1on1SeenThisCycle: false,
```

Also reset it in `startGame` and `resetGame` (set to `false`). And always reset `mgbWarning1on1Active: false` in `startGame`/`resetGame`.

- [ ] **Step 11: Add `resolveMgrOneOnOne` action**

At the end of the store actions (after `resolveDuel`), add:

```ts
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
```

- [ ] **Step 12: Add `resolveMgrOneOnOne` to `persistState` exclusion**

In `persistState` (line 199), the destructuring strips action functions. Add:

```ts
resolveMgrOneOnOne: _rmgo,
```

to the destructuring list (alongside the other action function exclusions).

- [ ] **Step 13: Verify TypeScript compiles**

```bash
cd /Users/sonaliprabhu/Codebase/sakkathguru/bandwidth && npm run build 2>&1 | head -40
```

Expected: clean build.

---

## Task 5: `ManagerOneOnOne` Component

**Files:**
- Create: `src/components/ManagerOneOnOne.tsx`

Context: `getManagerSprite` from `SpriteLibrary.ts` returns `{ matrix: string[][], mood: string }` based on MGB. `PixelSprite` renders a matrix at a given `pixelSize`. Pattern for fullscreen overlays: `fixed inset-0 z-[80] bg-zinc-950 flex flex-col overflow-hidden`.

- [ ] **Step 1: Create the component file**

Create `src/components/ManagerOneOnOne.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { PixelSprite } from './PixelSprite';
import { getManagerSprite } from '../data/SpriteLibrary';

interface Props {
  playerMGB: number;
  onStartChess: () => void;
}

const FEEDBACK_TEXTS = [
  "Your recent output has been... concerning. The team has noticed. Leadership has noticed. I've noticed.",
  "I've been looking at your contributions this sprint. I want to be candid. This isn't the trajectory we discussed.",
  "I don't usually do these check-ins mid-sprint. But here we are. The numbers aren't telling a great story.",
];

export function ManagerOneOnOne({ playerMGB, onStartChess }: Props) {
  const managerSprite = getManagerSprite(playerMGB);
  const fullText = FEEDBACK_TEXTS[Math.floor(Math.random() * FEEDBACK_TEXTS.length)];

  const [displayedText, setDisplayedText] = useState('');
  const [textDone, setTextDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayedText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(id);
        setTextDone(true);
      }
    }, 30);
    return () => clearInterval(id);
  }, [fullText]);

  return (
    <div className="fixed inset-0 z-[80] bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header strip */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-zinc-800 flex items-center gap-3">
        <span className="text-amber-400 text-xs font-mono uppercase tracking-widest">
          ⚠ MANAGER CHECK-IN
        </span>
        <span className="text-zinc-600 text-xs font-mono">— Sprint timer paused</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8 max-w-lg mx-auto w-full">
        {/* Manager sprite */}
        <PixelSprite matrix={managerSprite.matrix} pixelSize={8} label="Manager" />

        {/* Typewriter text */}
        <div className="w-full">
          <p className="font-mono text-zinc-300 text-sm leading-relaxed min-h-[4rem]">
            "{displayedText}
            {!textDone && <span className="animate-pulse text-amber-400">▍</span>}"
          </p>
        </div>

        {/* Stakes panel — slides in after text done */}
        {textDone && (
          <div className="w-full border border-zinc-700 rounded bg-zinc-900 p-4 animate-fade-in-up">
            <p className="font-retro text-zinc-500 uppercase tracking-widest mb-3" style={{ fontSize: '7px' }}>
              STAKES
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="font-retro text-green-400" style={{ fontSize: '8px' }}>WIN</span>
                <span className="font-mono text-zinc-300 text-xs">+25 MGB · Manager respects you</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-retro text-red-400" style={{ fontSize: '8px' }}>LOSE / TIME OUT</span>
                <span className="font-mono text-zinc-300 text-xs">−20 MGB · Manager thinks you're dumb</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-retro text-zinc-500" style={{ fontSize: '8px' }}>DRAW</span>
                <span className="font-mono text-zinc-300 text-xs">±0 MGB · An uneasy truce</span>
              </div>
            </div>
          </div>
        )}

        {/* Chess challenge button */}
        <button
          onClick={onStartChess}
          disabled={!textDone}
          className={[
            'w-full font-retro px-6 py-3 rounded border transition-colors',
            textDone
              ? 'border-amber-600 bg-amber-950 text-amber-200 hover:bg-amber-900 hover:border-amber-500 cursor-pointer'
              : 'border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed',
          ].join(' ')}
          style={{ fontSize: '9px' }}
        >
          ♟ Challenge Manager's Intelligence
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/sonaliprabhu/Codebase/sakkathguru/bandwidth && npm run build 2>&1 | head -40
```

Expected: clean build.

---

## Task 6: `ManagerChess` Component

**Files:**
- Create: `src/components/ManagerChess.tsx`

This is the largest task. The chess engine is implemented as pure functions in the same file. Read the spec at `docs/superpowers/specs/2026-03-21-performance-review-and-mgb-chess-design.md` for the full description. Implement in two parts: engine first, then React component.

- [ ] **Step 1: Create the file with chess types and engine**

Create `src/components/ManagerChess.tsx`. Start with the engine (no React imports needed yet in this step — just get the types right):

```tsx
import { useEffect, useState, useCallback, useRef } from 'react';

// ─── Chess Engine ────────────────────────────────────────────────────────────

type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
type Color = 'white' | 'black';
interface Piece { type: PieceType; color: Color; }
type Square = Piece | null;
type Board = Square[][];
type Pos = [number, number]; // [row, col]; row 0 = rank 8 (black back rank)

function getInitialBoard(): Board {
  const B = (t: PieceType): Piece => ({ type: t, color: 'black' });
  const W = (t: PieceType): Piece => ({ type: t, color: 'white' });
  const _ = null;
  return [
    [B('R'), B('N'), B('B'), B('Q'), B('K'), B('B'), B('N'), B('R')],
    [B('P'), B('P'), B('P'), B('P'), B('P'), B('P'), B('P'), B('P')],
    [_, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _],
    [W('P'), W('P'), W('P'), W('P'), W('P'), W('P'), W('P'), W('P')],
    [W('R'), W('N'), W('B'), W('Q'), W('K'), W('B'), W('N'), W('R')],
  ];
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function findKing(board: Board, color: Color): Pos {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'K' && p.color === color) return [r, c];
    }
  }
  throw new Error(`King not found for ${color}`);
}

/** Returns raw candidate moves for piece at [r,c] — does NOT check if move leaves own king in check */
function getRawMoves(board: Board, [r, c]: Pos): Pos[] {
  const piece = board[r][c];
  if (!piece) return [];
  const { type, color } = piece;
  const opp = color === 'white' ? 'black' : 'white';
  const moves: Pos[] = [];

  const slide = (drs: number[], dcs: number[]) => {
    for (let i = 0; i < drs.length; i++) {
      let nr = r + drs[i], nc = c + dcs[i];
      while (inBounds(nr, nc)) {
        const sq = board[nr][nc];
        if (sq) {
          if (sq.color === opp) moves.push([nr, nc]); // capture
          break;
        }
        moves.push([nr, nc]);
        nr += drs[i]; nc += dcs[i];
      }
    }
  };

  if (type === 'R') slide([-1, 1, 0, 0], [0, 0, -1, 1]);
  if (type === 'B') slide([-1, -1, 1, 1], [-1, 1, -1, 1]);
  if (type === 'Q') {
    slide([-1, 1, 0, 0], [0, 0, -1, 1]);
    slide([-1, -1, 1, 1], [-1, 1, -1, 1]);
  }
  if (type === 'K') {
    for (const dr of [-1, 0, 1]) for (const dc of [-1, 0, 1]) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.color !== color) moves.push([nr, nc]);
    }
  }
  if (type === 'N') {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]] as Pos[]) {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.color !== color) moves.push([nr, nc]);
    }
  }
  if (type === 'P') {
    const dir = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    // Forward
    if (inBounds(r + dir, c) && !board[r + dir][c]) {
      moves.push([r + dir, c]);
      // Double push from start
      if (r === startRow && !board[r + dir * 2][c]) moves.push([r + dir * 2, c]);
    }
    // Diagonal captures
    for (const dc of [-1, 1]) {
      const nr = r + dir, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.color === opp) moves.push([nr, nc]);
    }
  }
  return moves;
}

function applyMove(board: Board, from: Pos, to: Pos): Board {
  const newBoard: Board = board.map(row => [...row]);
  const piece = newBoard[from[0]][from[1]]!;
  newBoard[to[0]][to[1]] = piece;
  newBoard[from[0]][from[1]] = null;
  // Auto-queen pawns
  if (piece.type === 'P') {
    if (piece.color === 'white' && to[0] === 0) newBoard[to[0]][to[1]] = { type: 'Q', color: 'white' };
    if (piece.color === 'black' && to[0] === 7) newBoard[to[0]][to[1]] = { type: 'Q', color: 'black' };
  }
  return newBoard;
}

function isAttacked(board: Board, [r, c]: Pos, byColor: Color): boolean {
  // Check all opponent pieces to see if any can capture [r,c]
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (!p || p.color !== byColor) continue;
      const raw = getRawMoves(board, [row, col]);
      if (raw.some(([mr, mc]) => mr === r && mc === c)) return true;
    }
  }
  return false;
}

function isInCheck(board: Board, color: Color): boolean {
  const kingPos = findKing(board, color);
  const opp = color === 'white' ? 'black' : 'white';
  return isAttacked(board, kingPos, opp);
}

function getLegalMoves(board: Board, from: Pos): Pos[] {
  const piece = board[from[0]][from[1]];
  if (!piece) return [];
  const raw = getRawMoves(board, from);
  return raw.filter(to => {
    const next = applyMove(board, from, to);
    return !isInCheck(next, piece.color);
  });
}

function getAllLegalMoves(board: Board, color: Color): { from: Pos; to: Pos }[] {
  const result: { from: Pos; to: Pos }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.color !== color) continue;
      const moves = getLegalMoves(board, [r, c]);
      for (const to of moves) result.push({ from: [r, c], to });
    }
  }
  return result;
}

function isCheckmate(board: Board, color: Color): boolean {
  return isInCheck(board, color) && getAllLegalMoves(board, color).length === 0;
}

function isStalemate(board: Board, color: Color): boolean {
  return !isInCheck(board, color) && getAllLegalMoves(board, color).length === 0;
}

// ─── Piece rendering ────────────────────────────────────────────────────────

const PIECE_UNICODE: Record<Color, Record<PieceType, string>> = {
  white: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  black: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
};
```

- [ ] **Step 2: Add the React component**

Continue in the same file, after the engine:

```tsx
type GamePhase = 'playing' | 'win' | 'lose' | 'draw';

interface Props {
  onComplete: (outcome: 'win' | 'lose' | 'draw') => void;
}

export function ManagerChess({ onComplete }: Props) {
  const [board, setBoard] = useState<Board>(() => getInitialBoard());
  const [turn, setTurn] = useState<Color>('white');
  const [selected, setSelected] = useState<Pos | null>(null);
  const [legalMoves, setLegalMoves] = useState<Pos[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Pos; to: Pos } | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [phase, setPhase] = useState<GamePhase>('playing');
  const boardRef = useRef(board);
  boardRef.current = board;

  // Timer — runs on player's turn only
  useEffect(() => {
    if (phase !== 'playing' || turn !== 'white') return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setPhase('lose'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, turn]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Manager AI move
  const makeManagerMove = useCallback((currentBoard: Board) => {
    const moves = getAllLegalMoves(currentBoard, 'black');
    if (moves.length === 0) {
      setPhase(isInCheck(currentBoard, 'black') ? 'win' : 'draw');
      return;
    }
    const { from, to } = moves[Math.floor(Math.random() * moves.length)];
    const nextBoard = applyMove(currentBoard, from, to);
    setBoard(nextBoard);
    setLastMove({ from, to });
    // Check game over for white after manager moves
    if (isCheckmate(nextBoard, 'white')) { setPhase('lose'); return; }
    if (isStalemate(nextBoard, 'white')) { setPhase('draw'); return; }
    setTurn('white');
  }, []);

  const handleSquareClick = (r: number, c: number) => {
    if (phase !== 'playing' || turn !== 'white') return;
    const piece = board[r][c];

    if (selected) {
      // Check if this is a legal destination
      const isLegal = legalMoves.some(([lr, lc]) => lr === r && lc === c);
      if (isLegal) {
        const nextBoard = applyMove(board, selected, [r, c]);
        setBoard(nextBoard);
        setLastMove({ from: selected, to: [r, c] });
        setSelected(null);
        setLegalMoves([]);
        // Check game over for black
        if (isCheckmate(nextBoard, 'black')) { setPhase('win'); return; }
        if (isStalemate(nextBoard, 'black')) { setPhase('draw'); return; }
        setTurn('black');
        setTimeout(() => makeManagerMove(nextBoard), 500);
        return;
      }
      // Clicked own piece — re-select
      if (piece?.color === 'white') {
        const moves = getLegalMoves(board, [r, c]);
        setSelected([r, c]);
        setLegalMoves(moves);
        return;
      }
      // Clicked empty or opponent non-legal — deselect
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    // Nothing selected yet — select own piece
    if (piece?.color === 'white') {
      const moves = getLegalMoves(board, [r, c]);
      setSelected([r, c]);
      setLegalMoves(moves);
    }
  };

  const isSelected = (r: number, c: number) => selected?.[0] === r && selected?.[1] === c;
  const isLegalTarget = (r: number, c: number) => legalMoves.some(([lr, lc]) => lr === r && lc === c);
  const isLastMoveSquare = (r: number, c: number) =>
    (lastMove?.from[0] === r && lastMove?.from[1] === c) ||
    (lastMove?.to[0] === r && lastMove?.to[1] === c);

  const squareBg = (r: number, c: number) => {
    if (isSelected(r, c)) return 'bg-blue-700';
    if (isLegalTarget(r, c)) return (r + c) % 2 === 0 ? 'bg-blue-500/40' : 'bg-blue-400/30';
    if (isLastMoveSquare(r, c)) return (r + c) % 2 === 0 ? 'bg-amber-600/40' : 'bg-amber-500/30';
    return (r + c) % 2 === 0 ? 'bg-zinc-700' : 'bg-zinc-600';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 select-none px-4">
      {/* Victory overlay */}
      {phase === 'win' && (
        <div className="absolute inset-0 z-10 bg-green-950/95 flex flex-col items-center justify-center gap-6">
          <p className="font-retro text-green-400 uppercase tracking-widest" style={{ fontSize: '9px' }}>— CHECKMATE —</p>
          <p className="font-mono text-green-200 text-lg font-bold">Manager sulks back to Jira.</p>
          <p className="font-mono text-green-400 text-sm">+25 Manager's Good Books</p>
          <button onClick={() => onComplete('win')} className="font-retro px-6 py-3 rounded border border-green-600 bg-green-900 text-green-200 hover:bg-green-800 transition-colors cursor-pointer" style={{ fontSize: '9px' }}>[ Return to Desk ]</button>
        </div>
      )}
      {/* Defeat overlay */}
      {(phase === 'lose') && (
        <div className="absolute inset-0 z-10 bg-red-950/95 flex flex-col items-center justify-center gap-6">
          <p className="font-retro text-red-400 uppercase tracking-widest" style={{ fontSize: '9px' }}>— {timeLeft === 0 ? 'TIME OUT' : 'CHECKMATE'} —</p>
          <p className="font-mono text-red-200 text-lg font-bold">Manager CC's your skip-level.</p>
          <p className="font-mono text-red-400 text-sm">−20 Manager's Good Books</p>
          <button onClick={() => onComplete('lose')} className="font-retro px-6 py-3 rounded border border-red-600 bg-red-900 text-red-200 hover:bg-red-800 transition-colors cursor-pointer" style={{ fontSize: '9px' }}>[ Return to Desk ]</button>
        </div>
      )}
      {/* Draw overlay */}
      {phase === 'draw' && (
        <div className="absolute inset-0 z-10 bg-zinc-900/95 flex flex-col items-center justify-center gap-6">
          <p className="font-retro text-zinc-400 uppercase tracking-widest" style={{ fontSize: '9px' }}>— STALEMATE —</p>
          <p className="font-mono text-zinc-200 text-lg font-bold">An uneasy truce.</p>
          <p className="font-mono text-zinc-400 text-sm">±0 Manager's Good Books</p>
          <button onClick={() => onComplete('draw')} className="font-retro px-6 py-3 rounded border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors cursor-pointer" style={{ fontSize: '9px' }}>[ Return to Desk ]</button>
        </div>
      )}

      {/* Timer */}
      <div className="flex items-center gap-4">
        <span className="font-retro text-zinc-500 uppercase tracking-widest" style={{ fontSize: '7px' }}>TIME</span>
        <span className={`font-mono text-2xl tabular-nums font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-zinc-200'}`}>
          {formatTime(timeLeft)}
        </span>
        <span className="font-retro text-zinc-600 uppercase tracking-widest" style={{ fontSize: '7px' }}>
          {turn === 'white' ? '▶ YOUR TURN' : '⏳ MANAGER THINKING'}
        </span>
      </div>

      {/* Board */}
      <div className="relative border border-zinc-700">
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(8, 1fr)', width: 'min(400px, 90vw)', height: 'min(400px, 90vw)' }}
        >
          {Array.from({ length: 8 }, (_, r) =>
            Array.from({ length: 8 }, (_, c) => {
              const piece = board[r][c];
              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex items-center justify-center cursor-pointer relative ${squareBg(r, c)}`}
                  onClick={() => handleSquareClick(r, c)}
                >
                  {isLegalTarget(r, c) && !piece && (
                    <div className="w-3 h-3 rounded-full bg-blue-400/60" />
                  )}
                  {piece && (
                    <span
                      className={`text-2xl leading-none select-none ${piece.color === 'white' ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-zinc-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]'}`}
                      style={{ fontSize: 'min(2.5rem, 10vw)' }}
                    >
                      {PIECE_UNICODE[piece.color][piece.type]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Rank/file labels */}
      <p className="font-mono text-zinc-700 text-xs">White (You) ↑ · Black (Manager) ↓</p>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/sonaliprabhu/Codebase/sakkathguru/bandwidth && npm run build 2>&1 | head -40
```

Expected: clean build.

---

## Task 7: Dashboard Wiring

**Files:**
- Modify: `src/components/Dashboard.tsx`

Context: Dashboard is at `src/components/Dashboard.tsx`. The `timerActive` computation is at line 189. The import list is at lines 1–18. The store destructuring is at lines 21–94. All overlay JSX is after line 267.

- [ ] **Step 1: Add imports**

At the top of `Dashboard.tsx`, add after the existing imports:

```tsx
import { ManagerOneOnOne } from './ManagerOneOnOne';
import { ManagerChess } from './ManagerChess';
```

- [ ] **Step 2: Destructure new store state and action**

In the `useGameStore()` destructuring block, add:

```ts
mgbWarning1on1Active,
resolveMgrOneOnOne,
```

- [ ] **Step 3: Add local chess state**

After the `const [duelActive, setDuelActive] = useState(false);` block, add:

```tsx
// MGB 1:1 + Chess state
const [chessActive, setChessActive] = useState(false);
```

- [ ] **Step 4: Update `timerActive`**

Find the `timerActive` assignment (line 189):

```ts
const timerActive =
  !pendingChaos && !pendingTutorial && !burnoutCrash && !cycleSummaryOpen && !shopOpen && !consultModalOpen && !showOnboarding && miniGamePhase === null && !fightActive && !duelActive;
```

Add `&& !mgbWarning1on1Active && !chessActive` to the end:

```ts
const timerActive =
  !pendingChaos && !pendingTutorial && !burnoutCrash && !cycleSummaryOpen && !shopOpen && !consultModalOpen && !showOnboarding && miniGamePhase === null && !fightActive && !duelActive && !mgbWarning1on1Active && !chessActive;
```

- [ ] **Step 5: Add MGB 1:1 and Chess overlays**

After the `{duelActive && ...}` overlay block (and before the onboarding tour), add:

```tsx
{/* MGB 1:1 interrupt */}
{mgbWarning1on1Active && !chessActive && (
  <ManagerOneOnOne
    playerMGB={stats.managerGoodBooks}
    onStartChess={() => setChessActive(true)}
  />
)}

{/* Chess duel overlay */}
{chessActive && (
  <div className="fixed inset-0 z-[90] bg-zinc-950 flex flex-col overflow-hidden">
    <div className="flex-shrink-0 px-6 py-3 border-b border-zinc-800 flex items-center gap-3">
      <span className="font-mono text-xs text-amber-400 uppercase tracking-widest">
        ♟ CHESS DUEL
      </span>
      <span className="font-mono text-xs text-zinc-600">— Prove your intelligence</span>
    </div>
    <div className="flex-1 relative overflow-hidden">
      <ManagerChess
        onComplete={(outcome) => {
          setChessActive(false);
          resolveMgrOneOnOne(outcome);
        }}
      />
    </div>
  </div>
)}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd /Users/sonaliprabhu/Codebase/sakkathguru/bandwidth && npm run build 2>&1 | head -40
```

Expected: clean build.

- [ ] **Step 7: Smoke test in browser**

```bash
cd /Users/sonaliprabhu/Codebase/sakkathguru/bandwidth && npm run dev
```

Open `http://localhost:5173`. Start a game. Verify:
1. Performance review screen now has 6 columns in the stats bar
2. Dev-test the MGB warning: open browser console and run `window.__bandwidthStore.setState({ stats: { ...window.__bandwidthStore.getState().stats, managerGoodBooks: 49 }, mgbWarning1on1SeenThisCycle: false })` → trigger any MGB-reducing action (e.g. escalate a task). The 1:1 overlay should appear.
3. The typewriter text animates, then stakes panel appears, then chess button enables
4. Chess board renders correctly with all pieces in starting positions
5. Clicking a white piece highlights valid moves
6. Making moves works, manager responds after 500ms
7. Return to Desk after any game outcome

---

## Task 8: Playwright E2E Tests

**Files:**
- Create: `tests/mgb-chess.spec.ts`

Context: Existing test patterns are in `tests/manager-duel.spec.ts`. The `__bandwidthStore` is exposed globally. State is seeded via `localStorage`. The `BASE_STATE` from the duel tests has `managerGoodBooks: 70`. We need MGB to drop below 50 to trigger the interrupt.

Add a `window.__DEBUG_RESOLVE_CHESS__` hook to `ManagerChess.tsx` (same pattern as `__DEBUG_RESOLVE_DUEL__`):

```tsx
// In ManagerChess, add after the state declarations:
useEffect(() => {
  type DebugFn = (outcome: 'win' | 'lose' | 'draw') => void;
  (window as Window & { __DEBUG_RESOLVE_CHESS__?: DebugFn }).__DEBUG_RESOLVE_CHESS__ =
    (outcome) => setPhase(outcome);
  return () => {
    delete (window as Window & { __DEBUG_RESOLVE_CHESS__?: DebugFn }).__DEBUG_RESOLVE_CHESS__;
  };
}, []);
```

- [ ] **Step 1: Add debug hook to `ManagerChess.tsx`**

In `ManagerChess.tsx`, after the `const [phase, setPhase] = useState<GamePhase>('playing');` line, add the `useEffect` for `__DEBUG_RESOLVE_CHESS__` as shown above.

- [ ] **Step 2: Create the test file**

Create `tests/mgb-chess.spec.ts`:

```ts
/**
 * E2E Tests: Performance Review Gates + MGB 1:1 Chess Interrupt
 *
 * Test 1: Perf Review — fails when tasks completed < gate
 * Test 2: Perf Review — fails when avg complexity < gate
 * Test 3: MGB 1:1 — triggers when MGB crosses below 50
 * Test 4: Chess win — +25 MGB applied, overlay closes
 * Test 5: Chess lose — -20 MGB applied, overlay closes
 */

import { test, expect, type Page } from '@playwright/test';

type StoreHandle = {
  getState: () => Record<string, unknown>;
  setState: (s: Partial<Record<string, unknown>>) => void;
};

// Seed state: autonomy=60, mgb=70, bandwidth=80, burnout=20, dashboard screen
const BASE_STATE = {
  screen: 'dashboard',
  playerName: 'Tester',
  track: 'engineering',
  level: 1,
  cycleNumber: 6, // past cycle limit → will go to performance-review
  company: 'NovaTech Corp',
  currentCompanyType: 'corp',
  activeTheme: 'default',
  unlockedThemes: ['default'],
  activeAvatar: 'default',
  unlockedAvatars: ['default'],
  activePerks: [],
  alumniUpgrades: [],
  activeBuffs: [],
  perkCooldowns: [],
  hasSeenTutorial: true,
  unplannedMeetingUsedThisCycle: false,
  clientCallUsedThisCycle: false,
  unscheduled1on1UsedThisCycle: false,
  chaosEventsThisCycle: 0,
  careerNetWorth: 0,
  tasksCompletedThisLevel: 0,   // triggers volume gate failure
  totalTaskCostThisLevel: 0,
  mgbWarning1on1Active: false,
  mgbWarning1on1SeenThisCycle: false,
  stats: {
    bandwidth: 80,
    maxBandwidth: 100,
    burnout: 20,
    autonomy: 60,
    debt: 0,
    levelXP: 100,              // meets XP gate for L1
    pendingXP: 0,
    netWorth: 5000,
    managerGoodBooks: 70,
    inventory: [],
  },
  actionItems: [],
  pendingChaos: null,
  tutorialState: { seenWelcome: true, seenGrind: true, seenRush: true, seenDebt: true },
};

async function seedState(page: Page, overrides: Record<string, unknown> = {}): Promise<void> {
  const state = { ...BASE_STATE, ...overrides };
  await page.evaluate((s) => localStorage.setItem('bandwidth-game-state', JSON.stringify(s)), state);
  await page.reload();
  await page.waitForFunction(() => typeof (window as Record<string, unknown>).__bandwidthStore !== 'undefined');
}

async function getStats(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    return store.getState().stats as Record<string, number>;
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('bandwidth-game-state'));
  await page.reload();
  await page.waitForFunction(() => typeof (window as Record<string, unknown>).__bandwidthStore !== 'undefined');
});

// ─── Test 1: Performance Review volume gate failure ───────────────────────────

test('Test 1: Perf Review — fails volume gate (0 tasks completed)', async ({ page }) => {
  // Seed state for performance-review screen with 0 tasks completed, XP met
  await seedState(page, { screen: 'performance-review', tasksCompletedThisLevel: 0 });

  // Stats bar should show Tasks Done as failing
  await expect(page.getByText('Tasks Done')).toBeVisible({ timeout: 3_000 });
  await expect(page.getByText('0 / 3')).toBeVisible(); // minTasksCompleted for L1 is 3

  // The manager dialogue should mention volume failure
  await expect(page.getByText(/only closed out/i)).toBeVisible({ timeout: 2_000 });
});

// ─── Test 2: Performance Review complexity gate failure ───────────────────────

test('Test 2: Perf Review — fails complexity gate (low avg cost)', async ({ page }) => {
  await seedState(page, {
    screen: 'performance-review',
    tasksCompletedThisLevel: 3,
    totalTaskCostThisLevel: 6, // avg = 2, gate is 6
  });

  await expect(page.getByText('Avg Complexity')).toBeVisible({ timeout: 3_000 });
  // Should fail complexity
  await expect(page.getByText(/harder problems/i)).toBeVisible({ timeout: 2_000 });
});

// ─── Test 3: MGB 1:1 triggers when MGB < 50 ──────────────────────────────────

test('Test 3: MGB 1:1 — appears when MGB drops below 50', async ({ page }) => {
  await seedState(page, {
    mgbWarning1on1SeenThisCycle: false,
    stats: { ...BASE_STATE.stats, managerGoodBooks: 55 },
  });

  // Force MGB below 50 via store
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    const s = store.getState().stats as Record<string, number>;
    store.setState({
      mgbWarning1on1Active: true,
      stats: { ...s, managerGoodBooks: 45 },
    });
  });

  await expect(page.getByText('MANAGER CHECK-IN')).toBeVisible({ timeout: 3_000 });
  // Button should be disabled initially (typewriter not done)
  const btn = page.getByRole('button', { name: /challenge manager/i });
  await expect(btn).toBeDisabled();

  // Wait for typewriter to complete (longest text is ~90 chars × 30ms = ~2.7s)
  await page.waitForTimeout(3_500);
  await expect(btn).toBeEnabled({ timeout: 1_000 });
});

// ─── Test 4: Chess win → +25 MGB ─────────────────────────────────────────────

test('Test 4: Chess win — +25 MGB applied after Return to Desk', async ({ page }) => {
  await seedState(page);

  // Directly activate the chess overlay via store
  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    store.setState({ mgbWarning1on1Active: true, mgbWarning1on1SeenThisCycle: true });
  });

  await expect(page.getByText('MANAGER CHECK-IN')).toBeVisible({ timeout: 3_000 });
  // Wait for text + stakes, then click chess
  await page.waitForTimeout(3_500);
  await page.getByRole('button', { name: /challenge manager/i }).click();

  await expect(page.locator('text=CHESS DUEL')).toBeVisible({ timeout: 3_000 });

  const before = await getStats(page);

  // Resolve via debug hook
  await page.evaluate(() => {
    type DebugFn = (o: 'win' | 'lose' | 'draw') => void;
    const fn = (window as Window & { __DEBUG_RESOLVE_CHESS__?: DebugFn }).__DEBUG_RESOLVE_CHESS__;
    if (!fn) throw new Error('__DEBUG_RESOLVE_CHESS__ not found');
    fn('win');
  });

  await page.getByRole('button', { name: /return to desk/i }).click();

  const after = await getStats(page);
  expect(after.managerGoodBooks).toBe(Math.min(100, before.managerGoodBooks + 25));
});

// ─── Test 5: Chess lose → -20 MGB ────────────────────────────────────────────

test('Test 5: Chess lose — -20 MGB applied after Return to Desk', async ({ page }) => {
  await seedState(page);

  await page.evaluate(() => {
    const store = (window as unknown as Record<string, StoreHandle>).__bandwidthStore;
    store.setState({ mgbWarning1on1Active: true, mgbWarning1on1SeenThisCycle: true });
  });

  await expect(page.getByText('MANAGER CHECK-IN')).toBeVisible({ timeout: 3_000 });
  await page.waitForTimeout(3_500);
  await page.getByRole('button', { name: /challenge manager/i }).click();

  await expect(page.locator('text=CHESS DUEL')).toBeVisible({ timeout: 3_000 });

  const before = await getStats(page);

  await page.evaluate(() => {
    type DebugFn = (o: 'win' | 'lose' | 'draw') => void;
    const fn = (window as Window & { __DEBUG_RESOLVE_CHESS__?: DebugFn }).__DEBUG_RESOLVE_CHESS__;
    if (!fn) throw new Error('__DEBUG_RESOLVE_CHESS__ not found');
    fn('lose');
  });

  await page.getByRole('button', { name: /return to desk/i }).click();

  const after = await getStats(page);
  expect(after.managerGoodBooks).toBe(Math.max(0, before.managerGoodBooks - 20));
});
```

- [ ] **Step 3: Run the tests**

```bash
cd /Users/sonaliprabhu/Codebase/sakkathguru/bandwidth && npx playwright test tests/mgb-chess.spec.ts --reporter=list
```

Expected: All 5 tests pass. Fix any failures before proceeding — tests are the ground truth.

---

## Verification Checklist

Before declaring done, verify all of the following manually in the dev server:

- [ ] L1 performance review shows 6 stat columns
- [ ] With 0 tasks completed and XP met, review fails with volume dialogue
- [ ] With 3 tasks completed but low avg cost, review fails with complexity dialogue
- [ ] With all gates met, review passes and promotes
- [ ] MGB 1:1 does NOT trigger twice in the same cycle (inject a second MGB drop after first trigger)
- [ ] MGB 1:1 DOES trigger in a new cycle after `startNextCycle`
- [ ] Chess timer counts down only on player's turn (verify by waiting during manager "think")
- [ ] Timer at 0 shows lose overlay
- [ ] Stalemate shows draw overlay with 0 MGB change
- [ ] Sprint timer pauses throughout the 1:1 + chess sequence
- [ ] Sprint timer resumes after Return to Desk
- [ ] All 5 Playwright tests pass
