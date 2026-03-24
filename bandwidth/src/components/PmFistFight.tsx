import { useEffect, useRef, useState } from 'react';
import { PixelSprite } from './PixelSprite';
import { getPlayerSprite, getManagerSprite } from '../data/SpriteLibrary';

type GamePhase = 'playing' | 'victory' | 'defeat';

interface Props {
  playerBurnout: number;
  playerMGB: number;
  onComplete: (outcome: 'win' | 'lose') => void;
}

export function PmFistFight({ playerBurnout, playerMGB, onComplete }: Props) {
  const [dominance, setDominance] = useState(50);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [isPunching, setIsPunching] = useState(false);

  const phaseRef = useRef<GamePhase>('playing');
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const punchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Player: F/f keydown → +2 dominance ─────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'f' && e.key !== 'F') return;
      if (phaseRef.current !== 'playing') return;

      setDominance(prev => Math.min(100, prev + 2.2));

      // Punch animation: set punching, clear after 150ms
      setIsPunching(true);
      if (punchTimerRef.current) clearTimeout(punchTimerRef.current);
      punchTimerRef.current = setTimeout(() => setIsPunching(false), 150);
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      if (punchTimerRef.current) clearTimeout(punchTimerRef.current);
    };
  }, [phase]);

  // ── PM attack interval — Phase 1 (0-3s): -4 per 100ms, Phase 2 (3s+): -0.5 ─
  useEffect(() => {
    if (phase !== 'playing') return;

    const startTime = Date.now();

    const id = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const attack = elapsed < 3 ? 1.5 : 0.4;
      setDominance(prev => Math.max(0, prev - attack));
    }, 100);

    return () => clearInterval(id);
  }, [phase]);

  // ── Win / loss detection ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    if (dominance >= 100) setPhase('victory');
    else if (dominance <= 0) setPhase('defeat');
  }, [dominance, phase]);

  const playerSprite = getPlayerSprite(playerBurnout);
  const managerSprite = getManagerSprite(playerMGB);

  // Bar fill: player (blue) grows from left, PM (red) shrinks from right
  const playerFill = dominance;
  const pmFill = 100 - dominance;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 select-none px-8">

      {/* Victory overlay */}
      {phase === 'victory' && (
        <div className="absolute inset-0 z-10 bg-green-950/95 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <p className="font-retro text-green-400 uppercase tracking-widest mb-3" style={{ fontSize: '9px' }}>
              — K.O. —
            </p>
            <p className="font-mono text-green-200 text-lg font-bold mb-2">The PM retreats to update Jira.</p>
            <p className="font-mono text-green-400 text-sm">+20 Autonomy &nbsp;·&nbsp; +10 Bandwidth &nbsp;·&nbsp; -10 Burnout</p>
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

      {/* Defeat overlay */}
      {phase === 'defeat' && (
        <div className="absolute inset-0 z-10 bg-red-950/95 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <p className="font-retro text-red-400 uppercase tracking-widest mb-3" style={{ fontSize: '9px' }}>
              — DEFEATED —
            </p>
            <p className="font-mono text-red-200 text-lg font-bold mb-2">You are now sharing your screen on the client call.</p>
            <p className="font-mono text-red-400 text-sm">-40 Bandwidth &nbsp;·&nbsp; -20 Manager's Good Books</p>
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

      {/* Title */}
      <div className="text-center">
        <p className="font-retro text-orange-400 uppercase tracking-widest" style={{ fontSize: '9px' }}>
          PM FIST FIGHT
        </p>
        <p className="font-mono text-zinc-600 text-xs mt-1">Mash <span className="text-zinc-400 font-bold">F</span> to fight back</p>
      </div>

      {/* Arena: avatars + bar */}
      <div className="w-full max-w-2xl flex flex-col gap-6">

        {/* Avatar row */}
        <div className="flex items-end justify-between gap-4">
          {/* Player avatar */}
          <div className="flex flex-col items-center gap-2">
            <p className="font-retro text-blue-400 uppercase tracking-widest" style={{ fontSize: '7px' }}>YOU</p>
            <div
              style={{
                transform: isPunching ? 'translateX(8px) scale(1.08)' : 'translateX(0) scale(1)',
                transition: 'transform 80ms ease-out',
              }}
            >
              <PixelSprite matrix={playerSprite.matrix} pixelSize={7} label="Player" />
            </div>
          </div>

          {/* DOMINANCE label — center */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <p className="font-retro text-zinc-500 uppercase tracking-widest" style={{ fontSize: '7px' }}>
              DOMINANCE
            </p>
            <p className="font-mono text-zinc-300 text-2xl font-bold tabular-nums">
              {Math.round(dominance)}
            </p>
          </div>

          {/* PM avatar — flipped horizontally */}
          <div className="flex flex-col items-center gap-2">
            <p className="font-retro text-red-400 uppercase tracking-widest" style={{ fontSize: '7px' }}>PM</p>
            <div style={{ transform: 'scaleX(-1)' }}>
              <PixelSprite matrix={managerSprite.matrix} pixelSize={7} label="PM" />
            </div>
          </div>
        </div>

        {/* Tug-of-war bar */}
        <div className="relative w-full h-8 rounded overflow-hidden border border-zinc-700 bg-zinc-900">
          {/* Player fill (blue, from left) */}
          <div
            className="absolute left-0 top-0 h-full bg-blue-600 transition-all duration-75"
            style={{ width: `${playerFill}%` }}
          />
          {/* PM fill (red, from right) */}
          <div
            className="absolute right-0 top-0 h-full bg-red-700 transition-all duration-75"
            style={{ width: `${pmFill}%` }}
          />
          {/* Center divider / cursor */}
          <div
            className="absolute top-0 h-full w-1 bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] transition-all duration-75"
            style={{ left: `calc(${playerFill}% - 2px)` }}
          />
          {/* Labels */}
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
            <span className="font-retro text-blue-300" style={{ fontSize: '7px' }}>PLAYER</span>
            <span className="font-retro text-red-300" style={{ fontSize: '7px' }}>PM</span>
          </div>
        </div>

        {/* Phase hint */}
        <div className="text-center">
          <p className="font-mono text-zinc-700 text-xs">
            {phase === 'playing' && dominance < 50
              ? '⚠ The PM has Synergy Surge — keep mashing!'
              : phase === 'playing'
              ? '💪 The PM is tiring out — finish them!'
              : null}
          </p>
        </div>
      </div>
    </div>
  );
}
