# Performance Review Fix + MGB 1:1 Chess Interrupt — Design

**Date:** 2026-03-21
**Status:** Approved

---

## Overview

Two independent features:

1. **Performance Review Fix** — Promotion now requires passing three gates (XP, tasks completed, avg complexity), not just XP. This closes the exploit where a player accumulates XP via escalation/grinding without completing tasks.

2. **MGB 1:1 + Chess Mini-Game** — When Manager Good Books (MGB) drops below 50 for the first time in a cycle, a fullscreen 1:1 interrupts gameplay. The manager delivers typewriter-style negative feedback, then offers the player a chance to challenge them to a simplified timed chess game.

---

## Feature 1: Performance Review Fix

### Problem

`buildPassResult()` in `PerformanceReview.tsx` currently checks only:
```ts
stats.levelXP >= config.impactGoal && stats.managerGoodBooks > 40
```
A player can accumulate XP via `escalateTask` (gives full reward, no work) or `grindTask` on a single task repeatedly, hitting the XP goal without completing meaningful volume or complexity of work.

### New Tracked State

Add to `GameState` in `store.ts`:
```ts
tasksCompletedThisLevel: number;   // increments each time a task reaches 'done'
totalTaskCostThisLevel: number;    // sum of cost for each completed task
```

These are incremented in `completeReview` and `useReviewBuddy` (the two task-completion paths). They reset to `0` in `advanceFromReview` when progressing to the next level, and in `resetGame`.

### Promotion Gates

| Gate | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| XP | ≥ 100 | ≥ 300 | ≥ 600 | ≥ 1000 | ≥ 2000 |
| Tasks completed | ≥ 3 | ≥ 4 | ≥ 5 | ≥ 6 | ≥ 8 |
| Avg task cost | ≥ 6 | ≥ 25 | ≥ 30 | ≥ 35 | ≥ 40 |

L2 avg cost gate is 25 (not 30) — the L2 pool has costs 20–50 with a ~39 mean, but players grinding cheap tasks could miss a gate of 30. 25 is achievable with normal play while still blocking pure low-cost grinding. L3–L5 pools and gates are defined here but task pool expansion for L3+ is deferred (actionItems.ts currently only covers L1/L2).

`avgTaskCost = totalTaskCostThisLevel / tasksCompletedThisLevel` (or 0 if no tasks completed).

Gate config is co-located with `LEVEL_CONFIGS` in `types.ts` as a new `reviewGates` field on `LevelConfig`.

### Updated `buildPassResult`

```ts
function buildPassResult(stats: PlayerStats, level: Level): boolean {
  const config = LEVEL_CONFIGS[level];
  const xpOk = stats.levelXP >= config.impactGoal;
  const volumeOk = stats.tasksCompletedThisLevel >= config.reviewGates.minTasksCompleted;
  const avgCost = stats.tasksCompletedThisLevel > 0
    ? stats.totalTaskCostThisLevel / stats.tasksCompletedThisLevel
    : 0;
  const complexityOk = avgCost >= config.reviewGates.minAvgTaskCost;
  return xpOk && volumeOk && complexityOk;
}
```

### Review Screen Changes

The existing 4-column stats bar gains two new columns:
- **Tasks Done** — `tasksCompletedThisLevel / reviewGates.minTasksCompleted`, pass if met
- **Avg Complexity** — `avgTaskCost / reviewGates.minAvgTaskCost`, pass if met

Manager dialogue in `buildManagerDialogue` adds two new failure branches (checked before existing ones):
- Volume failure: *"Impact numbers are fine, but you only closed out [N] tasks this cycle. Volume matters. I need to see you shipping, not just grinding one thing."*
- Complexity failure: *"You completed tasks, but nothing that moved the needle. I need to see you taking on harder problems."*

---

## Feature 2: MGB 1:1 Interrupt + Chess Mini-Game

### Trigger Logic

New state in `GameState`:
```ts
mgbWarning1on1Active: boolean;       // renders the fullscreen overlay
mgbWarning1on1SeenThisCycle: boolean; // prevents re-triggering in same cycle
```

After any action that can reduce MGB, add a check in the store helper:
```ts
function checkMgbWarning(stats: PlayerStats, prev: GameState): Partial<GameState> {
  if (
    stats.managerGoodBooks < 50 &&
    !prev.mgbWarning1on1SeenThisCycle &&
    prev.screen === 'dashboard'
  ) {
    return { mgbWarning1on1Active: true, mgbWarning1on1SeenThisCycle: true };
  }
  return {};
}
```

Called after every action that reduces MGB: `grindTask`, `rushTask`, `escalateTask`, `acceptUnplannedMeeting`, `resolveFistFight` (defeat), `resolveDuel` (loss). `skipUnplannedMeeting` does NOT reduce MGB so does not trigger this check.

Reset in `startNextCycle`: `mgbWarning1on1SeenThisCycle: false`.
`mgbWarning1on1Active` is cleared by `resolveMgrOneOnOne`.

### Timer Pause

In `Dashboard.tsx`, `timerActive` gains `&& !mgbWarning1on1Active` (same pattern as `duelActive`).

### `ManagerOneOnOne` Component

**File:** `src/components/ManagerOneOnOne.tsx`

**Props:**
```ts
interface Props {
  playerMGB: number;   // used to select manager sprite tier
  onStartChess: () => void;
}
```

**Layout (fullscreen `fixed inset-0 z-[80] bg-zinc-950`):**

```
┌─────────────────────────────────────────────────────┐
│ ⚠ MANAGER CHECK-IN — Sprint timer paused            │  ← top strip, border-b
├─────────────────────────────────────────────────────┤
│                                                     │
│              [Pixel Manager Sprite]                 │  ← getManagerSprite(mgb), pixelSize=8
│                                                     │
│  "Your recent output has been... concerning.        │  ← typewriter text, 30ms/char
│   The team has noticed. Leadership has noticed.     │
│   I've noticed."                                    │
│                                                     │
│  ┌─ Stakes ─────────────────────────────────────┐  │  ← slides in after text done
│  │  WIN:  +25 MGB · Manager respects you        │  │
│  │  LOSE: -20 MGB · Manager thinks you're dumb  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [ ♟ Challenge Manager's Intelligence ]             │  ← disabled until text + stakes shown
└─────────────────────────────────────────────────────┘
```

**Typewriter logic:** `useEffect` with `setInterval` at 30ms, appends one character at a time to `displayedText`. When complete, sets `textDone: true` which shows the stakes panel and enables the button. **There is no close/dismiss button on this screen** — the player cannot escape this interrupt without clicking "Challenge Manager's Intelligence". The chess button is disabled until both the typewriter animation completes AND the stakes panel is visible. Screen stays `'dashboard'` throughout (the overlay renders on top, no screen state change).

**Feedback text pool** (3 variants, selected randomly):
1. *"Your recent output has been... concerning. The team has noticed. Leadership has noticed. I've noticed."*
2. *"I've been looking at your contributions this sprint. I want to be candid. This isn't the trajectory we discussed."*
3. *"I don't usually do these check-ins mid-sprint. But here we are. The numbers aren't telling a great story."*

### Core Chess Engine (in `ManagerChess`)

Note: despite the "simplified" label, a correct chess engine requires non-trivial check detection. Scope is: all 6 piece types, legal moves (including filtering moves that leave own king in check), checkmate and stalemate detection, auto-queen pawn promotion. No castling, no en passant, no move history, no undo, no AI evaluation. Expected implementation: ~150 lines of move logic + ~80 lines of board rendering.

### `ManagerChess` Component

**File:** `src/components/ManagerChess.tsx`

**Props:**
```ts
interface Props {
  onComplete: (outcome: 'win' | 'lose' | 'draw') => void;
}
```

**Chess Engine (pure functions, no library):**

Piece types: `K Q R B N P` (white = player, black = manager).

```ts
type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
type Color = 'white' | 'black';
interface Piece { type: PieceType; color: Color; }
type Board = (Piece | null)[][];  // [row 0..7][col 0..7], row 0 = rank 8 (black back rank)
```

Functions:
- `getInitialBoard(): Board` — standard starting position
- `getLegalMoves(board, from, color): [number, number][]` — returns valid destination squares for a piece, filtering moves that leave own king in check
- `getAllLegalMoves(board, color): Move[]` — all moves for a side
- `isInCheck(board, color): boolean` — king is attacked by opponent
- `isCheckmate(board, color): boolean` — in check and no legal moves
- `isStalemate(board, color): boolean` — not in check but no legal moves
- `applyMove(board, from, to): Board` — returns new board (immutable)
- Pawn: forward move, double-push from starting rank, diagonal capture. Auto-queens on reaching back rank.
- No castling, no en passant.

**State:**
```ts
const [board, setBoard] = useState(getInitialBoard());
const [turn, setTurn] = useState<Color>('white');
const [selected, setSelected] = useState<[number,number] | null>(null);
const [legalMoves, setLegalMoves] = useState<[number,number][]>([]);
const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
const [phase, setPhase] = useState<'playing' | 'win' | 'lose' | 'draw'>('playing');
```

**Timer:** `setInterval` every 1000ms. Timer runs on **player's turn only** — it pauses while the manager AI is "thinking" (during the 500ms delay + move application). This prevents the player being penalized for time the manager consumes. When `timeLeft` reaches 0 on player's turn, game immediately ends as `'lose'`.

**Manager AI turn:** After player move, check game over. If not, `setTimeout(500)` then pick random move from `getAllLegalMoves(board, 'black')` and apply it.

**Board rendering:**
```
Row 0 = rank 8 (black pieces start here)
Row 7 = rank 1 (white pieces start here)
```
8×8 CSS Grid. Each cell: `bg-zinc-700` (light) or `bg-zinc-800` (dark) based on `(row+col) % 2`. Selected piece: `bg-blue-700`. Legal move targets: `bg-blue-500/40` ring. Last move from/to: `bg-amber-600/30`.

Pieces rendered as Unicode: `♙♖♘♗♕♔` (white), `♟♜♞♝♛♚` (black), `font-mono text-2xl`.

**Overlays:**
- Win: green overlay, "+25 MGB · Manager sulks back to Jira", "Return to Desk" button
- Lose/Time: red overlay, "-20 MGB · Manager CC's your skip-level", "Return to Desk" button
- Draw: zinc overlay, "No MGB change · An uneasy truce", "Return to Desk" button

### Store Changes

New action `resolveMgrOneOnOne`:
```ts
resolveMgrOneOnOne: (outcome: 'win' | 'lose' | 'draw') => void;
```

Effects:
- `win`: `managerGoodBooks += 25` (clamped to 100)
- `lose`: `managerGoodBooks -= 20` (clamped to 0), check if this triggers another warning (it won't — `seenThisCycle` is already true)
- `draw`: no change
- Always: `mgbWarning1on1Active: false`

### Dashboard Integration

```tsx
const [chessActive, setChessActive] = useState(false);

// In timerActive computation:
const timerActive = screen === 'dashboard'
  && !pendingChaos && !burnoutCrash && !duelActive
  && !mgbWarning1on1Active && !chessActive
  && cycleNumber <= config.cyclesTotal;

// Overlays (after duelActive overlay, before onboarding tour):
{mgbWarning1on1Active && !chessActive && (
  <ManagerOneOnOne
    playerMGB={stats.managerGoodBooks}
    onStartChess={() => setChessActive(true)}
  />
)}
{chessActive && (
  <div className="fixed inset-0 z-[90] bg-zinc-950 flex flex-col overflow-hidden">
    <div className="flex-shrink-0 px-6 py-3 border-b border-zinc-800 font-mono text-xs text-amber-400 uppercase tracking-widest">
      ♟ CHESS DUEL — Prove your intelligence
    </div>
    <div className="flex-1 relative overflow-hidden">
      <ManagerChess onComplete={(outcome) => {
        setChessActive(false);
        resolveMgrOneOnOne(outcome);
      }} />
    </div>
  </div>
)}
```

---

## File Map

| File | Change |
|---|---|
| `src/types.ts` | Add `reviewGates` to `LevelConfig`; add gate values to `LEVEL_CONFIGS` |
| `src/store.ts` | Add `tasksCompletedThisLevel`, `totalTaskCostThisLevel`, `mgbWarning1on1Active`, `mgbWarning1on1SeenThisCycle` to `GameState` interface and initial state; update `completeReview`, `useReviewBuddy`, `advanceFromReview`, `startNextCycle`, `resetGame`; add `checkMgbWarning` helper; add `resolveMgrOneOnOne` action; add all new actions to `persistState` exclusion destructuring (`resolveMgrOneOnOne: _rmgo`) and add new boolean state fields to serializable output |
| `src/components/PerformanceReview.tsx` | Update `buildPassResult`, `buildManagerDialogue`, stats bar (2 new columns) |
| `src/components/Dashboard.tsx` | Add `mgbWarning1on1Active` + `chessActive` state; update `timerActive`; render overlays |
| `src/components/ManagerOneOnOne.tsx` | **New** — fullscreen interrupt with typewriter text + stakes + chess launch button |
| `src/components/ManagerChess.tsx` | **New** — chess board, engine, AI, timer, overlays |

---

## Out of Scope

- Castling, en passant, pawn promotion choice
- Chess AI evaluation (minimax, piece-square tables)
- Undo move
- Move history display
- Sound effects
