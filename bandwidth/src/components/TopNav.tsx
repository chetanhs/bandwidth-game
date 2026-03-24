import { LEVEL_CONFIGS, type Level } from '../types';

interface Props {
  playerName: string;
  company: string;
  level: Level;
  cycleNumber: number;
  levelXP: number;
  cycleTimeLeft: number;
  onEndCycle: () => void;
  onReset: () => void;
}

export function TopNav({ playerName, company, level, cycleNumber, levelXP, cycleTimeLeft, onEndCycle, onReset }: Props) {
  const config = LEVEL_CONFIGS[level];

  return (
    <header className="flex-shrink-0 flex justify-between items-center w-full px-6 py-3 border-b border-zinc-800 bg-zinc-900">

      {/* ── Left: identity ─────────────────────────────────────── */}
      <div className="flex items-center">
        <span
          className="text-sm font-semibold text-zinc-100 tracking-tight"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          BANDWIDTH
        </span>

        <div className="flex items-center gap-2 border-l border-zinc-700 pl-4 ml-4 text-xs text-zinc-500 font-mono">
          <span className="text-zinc-300">{playerName}</span>
          <span>@</span>
          <span className="text-zinc-400">{company}</span>
        </div>

        <div className="border-l border-zinc-700 pl-4 ml-4 text-xs text-zinc-500 font-mono">
          {config.label}
        </div>
      </div>

      {/* ── Middle: cycle + XP ─────────────────────────────────── */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center min-w-[100px]">
          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider leading-none">
            Cycle
          </span>
          <span className="text-xs font-mono tabular-nums text-zinc-300 font-semibold leading-tight mt-0.5">
            {cycleNumber}
            <span className="text-zinc-600 font-normal"> / {config.cyclesTotal}</span>
          </span>
        </div>

        <div className="w-px h-6 bg-zinc-800" />

        <div
          data-testid="xp-counter"
          className="flex flex-col items-center min-w-[160px]"
          title={`XP Target for ${config.nextLabel}`}
        >
          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider leading-none">
            XP → {config.nextLabel}
          </span>
          <span className="text-xs font-mono tabular-nums text-amber-400 font-semibold leading-tight mt-0.5">
            {levelXP.toLocaleString('en-US')}
            <span className="text-zinc-600 font-normal"> / {config.impactGoal.toLocaleString('en-US')}</span>
          </span>
        </div>
      </div>

      {/* ── Right: sprint timer + controls ─────────────────────── */}
      <div className="flex items-center gap-3">
        <a
          href="https://www.clauderules.net/?utm_source=bandwidth_game&utm_medium=web_app&utm_campaign=topnav_link"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-zinc-500 hover:text-amber-400 uppercase tracking-widest transition-colors whitespace-nowrap"
        >
          [ Built with clauderules.net ↗ ]
        </a>

        <div className="w-px h-4 bg-zinc-800" />

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Sprint</span>
          <div
            data-testid="sprint-timer"
            className={[
              'text-xs font-mono tabular-nums font-semibold px-2 py-0.5 rounded border',
              cycleTimeLeft <= 15
                ? 'text-red-400 border-red-900 bg-red-950 animate-pulse'
                : cycleTimeLeft <= 30
                ? 'text-amber-400 border-amber-900 bg-amber-950'
                : 'text-zinc-400 border-zinc-800 bg-zinc-900',
            ].join(' ')}
          >
            {String(Math.floor(cycleTimeLeft / 60)).padStart(2, '0')}:
            {String(cycleTimeLeft % 60).padStart(2, '0')}
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-xs text-zinc-600 hover:text-zinc-400 px-2 py-1 rounded border border-transparent hover:border-zinc-800 transition-colors font-mono cursor-pointer"
        >
          reset
        </button>

        <button
          onClick={onEndCycle}
          className="text-xs font-medium px-4 py-1.5 rounded border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 transition-colors font-mono cursor-pointer"
        >
          End Cycle →
        </button>
      </div>
    </header>
  );
}
