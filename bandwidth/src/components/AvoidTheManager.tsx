import { useEffect, useRef, useState } from 'react';
import { PixelSprite } from './PixelSprite';
import { PLAYER_STRESSED, MANAGER_ANGRY } from '../data/SpriteLibrary';

const GRID = 20;
const GAME_DURATION = 10;
const MANAGER_TICK_MS = 400;

interface Pos { row: number; col: number; }
type GamePhase = 'playing' | 'caught' | 'survived';

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

// ── Cubicle Office Map ──────────────────────────────────────────────────────
// Wall blocks (1) appear at intersections of wall-row-bands and wall-col-bands.
// This creates a cubicle-farm grid with 1-cell-wide hallways between 2x2 blocks.

const WALL_ROWS = new Set([2, 3, 6, 7, 10, 11, 14, 15, 17, 18]);
const WALL_COLS = new Set([2, 3, 6, 7, 10, 11, 14, 15, 17, 18]);

const CUBICLE_MAP: number[][] = Array.from({ length: GRID }, (_, r) =>
  Array.from({ length: GRID }, (_, c) =>
    WALL_ROWS.has(r) && WALL_COLS.has(c) ? 1 : 0
  )
);

function isWalkable(r: number, c: number): boolean {
  if (r < 0 || r >= GRID || c < 0 || c >= GRID) return false;
  return CUBICLE_MAP[r][c] === 0;
}

// ── BFS Pathfinding ─────────────────────────────────────────────────────────
// Returns the first step the manager should take toward the player, respecting walls.

function bfsNextStep(start: Pos, goal: Pos): Pos | null {
  const key = (p: Pos) => `${p.row},${p.col}`;
  const visited = new Set<string>([key(start)]);
  const queue: Array<{ pos: Pos; first: Pos | null }> = [{ pos: start, first: null }];

  while (queue.length > 0) {
    const { pos, first } = queue.shift()!;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as [number, number][]) {
      const next = { row: pos.row + dr, col: pos.col + dc };
      if (!isWalkable(next.row, next.col)) continue;
      if (visited.has(key(next))) continue;
      const nextFirst = first ?? next;
      if (next.row === goal.row && next.col === goal.col) return nextFirst;
      visited.add(key(next));
      queue.push({ pos: next, first: nextFirst });
    }
  }
  return null;
}

// ── Component ───────────────────────────────────────────────────────────────

interface Props {
  onComplete: (outcome: 'win' | 'lose') => void;
}

export function AvoidTheManager({ onComplete }: Props) {
  // Player: top-left open corner (row 1, col 1 — both open bands)
  // Manager: bottom-right open corner (row 19, col 19 — both open bands)
  const [playerPos, setPlayerPos] = useState<Pos>({ row: 1, col: 1 });
  const [managerPos, setManagerPos] = useState<Pos>({ row: 19, col: 19 });
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

  const playerPosRef = useRef(playerPos);
  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);

  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ── Keyboard control with wall collision ──────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phaseRef.current !== 'playing') return;
      const moves: Record<string, [number, number]> = {
        ArrowUp: [-1, 0], w: [-1, 0], W: [-1, 0],
        ArrowDown: [1, 0], s: [1, 0], S: [1, 0],
        ArrowLeft: [0, -1], a: [0, -1], A: [0, -1],
        ArrowRight: [0, 1], d: [0, 1], D: [0, 1],
      };
      const move = moves[e.key];
      if (!move) return;
      e.preventDefault();
      setPlayerPos(prev => {
        const nr = clamp(prev.row + move[0], 0, GRID - 1);
        const nc = clamp(prev.col + move[1], 0, GRID - 1);
        if (!isWalkable(nr, nc)) return prev; // blocked by wall
        return { row: nr, col: nc };
      });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ── Manager BFS pathfinding — navigates around cubicle walls ─────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      const target = playerPosRef.current;
      setManagerPos(prev => bfsNextStep(prev, target) ?? prev);
    }, MANAGER_TICK_MS);
    return () => clearInterval(id);
  }, [phase]);

  // ── Collision detection ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    if (playerPos.row === managerPos.row && playerPos.col === managerPos.col) {
      setPhase('caught');
    }
  }, [playerPos, managerPos, phase]);

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) return;
    const id = setTimeout(() => {
      setTimeLeft(t => {
        const next = t - 1;
        if (next <= 0) { setPhase('survived'); return 0; }
        return next;
      });
    }, 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 select-none">

      {/* Outcome overlay — caught */}
      {phase === 'caught' && (
        <div className="absolute inset-0 z-10 bg-red-950/95 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <p className="font-retro text-red-400 uppercase tracking-widest mb-3" style={{ fontSize: '9px' }}>
              — CAUGHT —
            </p>
            <p className="font-mono text-red-200 text-lg font-bold mb-2">"We need to talk about your priorities."</p>
            <p className="font-mono text-red-400 text-sm">-25 Manager's Good Books</p>
          </div>
          <button
            onClick={() => onComplete('lose')}
            className="font-retro px-6 py-3 rounded border border-red-600 bg-red-900 text-red-200 hover:bg-red-800 hover:border-red-500 transition-colors cursor-pointer"
            style={{ fontSize: '9px' }}
          >
            [ Return to Desk ]
          </button>
        </div>
      )}

      {/* Outcome overlay — survived */}
      {phase === 'survived' && (
        <div className="absolute inset-0 z-10 bg-green-950/95 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <p className="font-retro text-green-400 uppercase tracking-widest mb-3" style={{ fontSize: '9px' }}>
              — SURVIVED —
            </p>
            <p className="font-mono text-green-200 text-lg font-bold mb-2">You successfully hid in the server room.</p>
            <p className="font-mono text-green-400 text-sm">+30 Bandwidth &nbsp;·&nbsp; -15 Burnout</p>
          </div>
          <button
            onClick={() => onComplete('win')}
            className="font-retro px-6 py-3 rounded border border-green-600 bg-green-900 text-green-200 hover:bg-green-800 hover:border-green-500 transition-colors cursor-pointer"
            style={{ fontSize: '9px' }}
          >
            [ Return to Desk ]
          </button>
        </div>
      )}

      {/* HUD */}
      <div className="flex items-center gap-8 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-xs">SURVIVE FOR</span>
          <span className={`text-2xl font-bold tabular-nums ${timeLeft <= 3 ? 'text-red-400' : 'text-green-400'}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="text-zinc-700 text-xs">·</div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" />
            YOU
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-500" />
            MANAGER
          </span>
        </div>
        <div className="text-zinc-700 text-xs">·</div>
        <span className="text-zinc-600 text-xs">WASD / ↑↓←→</span>
      </div>

      {/* Grid arena */}
      <div
        className="relative border border-zinc-700"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID}, 1fr)`,
          width: '480px',
          height: '480px',
          background: '#0a0a0b',
          boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.5)',
        }}
      >
        {Array.from({ length: GRID * GRID }, (_, i) => {
          const row = Math.floor(i / GRID);
          const col = i % GRID;
          const isPlayer = row === playerPos.row && col === playerPos.col;
          const isManager = row === managerPos.row && col === managerPos.col;
          const isWall = CUBICLE_MAP[row][col] === 1;

          return (
            <div
              key={i}
              className="relative overflow-hidden"
              style={{
                borderRight: '1px solid rgba(63,63,70,0.3)',
                borderBottom: '1px solid rgba(63,63,70,0.3)',
                background: isPlayer
                  ? 'rgba(59,130,246,0.15)'
                  : isManager
                  ? 'rgba(239,68,68,0.15)'
                  : 'transparent',
                boxShadow: isPlayer
                  ? '0 0 6px rgba(59,130,246,0.6)'
                  : isManager
                  ? '0 0 6px rgba(239,68,68,0.6)'
                  : undefined,
              }}
            >
              {/* Wall cell — opaque zinc block with desk-clutter hatch texture */}
              {isWall && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: '#3f3f46',
                    backgroundImage:
                      'repeating-linear-gradient(45deg, rgba(82,82,91,0.7) 0, rgba(82,82,91,0.7) 1px, transparent 0, transparent 50%)',
                    backgroundSize: '4px 4px',
                  }}
                />
              )}

              {/* Player — pixel-art face (PLAYER_STRESSED, 12×12 at pixelSize=2 → 24×24px) */}
              {isPlayer && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <PixelSprite matrix={PLAYER_STRESSED} pixelSize={2} label="Player" />
                </div>
              )}

              {/* Manager — pixel-art face (MANAGER_ANGRY, 12×12 at pixelSize=2 → 24×24px) */}
              {isManager && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <PixelSprite matrix={MANAGER_ANGRY} pixelSize={2} label="Manager" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="font-retro text-zinc-700" style={{ fontSize: '8px' }}>
        DON'T LET THE MANAGER FIND YOU
      </p>
    </div>
  );
}
