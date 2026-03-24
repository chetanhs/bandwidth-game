import { useState } from 'react';
import { AvoidTheManager } from './AvoidTheManager';
import { PmFistFight } from './PmFistFight';
import { ManagerDuel } from './ManagerDuel';

type ActiveGame = 'menu' | 'pacman' | 'fight' | 'duel';

interface Props {
  onExit: () => void;
}

export function ArcadeMode({ onExit }: Props) {
  const [activeGame, setActiveGame] = useState<ActiveGame>('menu');
  const [lastResult, setLastResult] = useState<{ label: string; win: boolean } | null>(null);

  const handleComplete = (gameName: string) => (outcome: 'win' | 'lose') => {
    setLastResult({ label: `${gameName}: ${outcome === 'win' ? 'WIN ✓' : 'LOSE ✗'}`, win: outcome === 'win' });
    setActiveGame('menu');
  };

  // ── Active game views ──────────────────────────────────────────────────────

  if (activeGame === 'pacman') {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 px-6 py-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-retro text-zinc-400 uppercase tracking-widest" style={{ fontSize: '8px' }}>
            TEST LABS — AVOID THE MANAGER
          </span>
          <button
            onClick={() => setActiveGame('menu')}
            className="font-retro text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
            style={{ fontSize: '8px' }}
          >
            ← BACK TO MENU
          </button>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <AvoidTheManager onComplete={handleComplete('Avoid The Manager')} />
        </div>
      </div>
    );
  }

  if (activeGame === 'fight') {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 px-6 py-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-retro text-zinc-400 uppercase tracking-widest" style={{ fontSize: '8px' }}>
            TEST LABS — PM FIST FIGHT
          </span>
          <button
            onClick={() => setActiveGame('menu')}
            className="font-retro text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
            style={{ fontSize: '8px' }}
          >
            ← BACK TO MENU
          </button>
        </div>
        <div className="flex-1 relative overflow-hidden">
          {/* Mock stats: mid-burnout, mid-MGB for representative testing */}
          <PmFistFight
            playerBurnout={40}
            playerMGB={60}
            onComplete={handleComplete('PM Fist Fight')}
          />
        </div>
      </div>
    );
  }

  if (activeGame === 'duel') {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 px-6 py-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-retro text-zinc-400 uppercase tracking-widest" style={{ fontSize: '8px' }}>
            TEST LABS — 1:1 SHOOTING DUEL
          </span>
          <button
            onClick={() => setActiveGame('menu')}
            className="font-retro text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
            style={{ fontSize: '8px' }}
          >
            ← BACK TO MENU
          </button>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <ManagerDuel onComplete={handleComplete('1:1 Shooting Duel')} />
        </div>
      </div>
    );
  }

  // ── Menu view ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-8">
      {/* Subtle scanline grid */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)',
          backgroundSize: '100% 4px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <p
            className="font-retro text-green-500 uppercase tracking-widest mb-2"
            style={{ fontSize: '8px', letterSpacing: '4px' }}
          >
            ▶ TEST LABS
          </p>
          <h1
            className="font-mono text-zinc-100 text-3xl font-bold tracking-tight mb-1"
          >
            ARCADE MODE
          </h1>
          <p className="font-mono text-zinc-600 text-xs">
            Isolated mini-game runner — no stats affected
          </p>
        </div>

        {/* Last result toast */}
        {lastResult && (
          <div
            className={`font-mono text-sm text-center px-4 py-3 rounded border ${
              lastResult.win
                ? 'border-green-700 bg-green-950 text-green-300'
                : 'border-red-700 bg-red-950 text-red-300'
            }`}
          >
            {lastResult.label}
          </div>
        )}

        {/* Game menu */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { setLastResult(null); setActiveGame('pacman'); }}
            className="w-full font-retro px-5 py-4 rounded border border-blue-700 bg-blue-950 text-blue-200 hover:bg-blue-900 hover:border-blue-500 transition-colors cursor-pointer text-left"
            style={{ fontSize: '9px' }}
          >
            <span className="block text-blue-400 mb-1" style={{ fontSize: '7px' }}>MINI-GAME 01</span>
            ▶ Play: Avoid The Manager
          </button>

          <button
            onClick={() => { setLastResult(null); setActiveGame('fight'); }}
            className="w-full font-retro px-5 py-4 rounded border border-orange-700 bg-orange-950 text-orange-200 hover:bg-orange-900 hover:border-orange-500 transition-colors cursor-pointer text-left"
            style={{ fontSize: '9px' }}
          >
            <span className="block text-orange-400 mb-1" style={{ fontSize: '7px' }}>MINI-GAME 02</span>
            ▶ Play: PM Fist Fight
          </button>

          <button
            onClick={() => { setLastResult(null); setActiveGame('duel'); }}
            className="w-full font-retro px-5 py-4 rounded border border-purple-700 bg-purple-950 text-purple-200 hover:bg-purple-900 hover:border-purple-500 transition-colors cursor-pointer text-left"
            style={{ fontSize: '9px' }}
          >
            <span className="block text-purple-400 mb-1" style={{ fontSize: '7px' }}>MINI-GAME 03</span>
            ▶ Play: 1:1 Shooting Duel
          </button>

          <button
            onClick={onExit}
            className="w-full font-retro px-5 py-3 rounded border border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer"
            style={{ fontSize: '9px' }}
          >
            ← Return to Main Menu
          </button>
        </div>

        <p className="font-mono text-zinc-800 text-xs text-center">
          BANDWIDTH · TEST HARNESS v0.1
        </p>
      </div>
    </div>
  );
}
