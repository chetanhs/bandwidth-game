import type { PlayerStats } from '../types';
import { LEVEL_CONFIGS, type Level } from '../types';
import { PixelSprite } from './PixelSprite';
import { getPlayerSprite, getManagerSprite } from '../data/SpriteLibrary';

interface Props {
  stats: PlayerStats;
  level: Level;
  onOpenShop: () => void;
}

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  bgColor: string;
  showPercent?: boolean;
  warning?: boolean;
  pulse?: boolean;
  note?: string;
  pipRisk?: boolean;
  displayValue?: string;
}

function StatBar({ label, value, max, color, bgColor, showPercent, warning, pulse, note, pipRisk, displayValue }: StatBarProps) {
  const pct = Math.round((value / max) * 100);
  const displayed = displayValue ?? (showPercent ? `${pct}%` : `${value} / ${max}`);
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs uppercase tracking-widest font-mono ${warning ? 'text-red-400' : 'text-zinc-400'}`}>
          {label}
        </span>
        <span className={`text-xs font-mono tabular-nums ${warning ? 'text-red-400' : 'text-zinc-300'}`}>
          {displayed}
        </span>
      </div>
      <div className={`h-1.5 rounded-full w-full ${bgColor} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${color} ${pulse ? 'animate-pulse' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {note && (
        <p className="text-xs text-zinc-300 mt-1 font-mono">{note}</p>
      )}
      {pipRisk && (
        <p className="text-xs text-red-400 mt-0.5 font-mono font-medium">⚠ PIP Risk High</p>
      )}
    </div>
  );
}

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

export function StatsPanel({ stats, level, onOpenShop }: Props) {
  const config = LEVEL_CONFIGS[level];
  const burnoutWarning = stats.burnout >= 70;
  const debtDanger = stats.debt > 50;
  const autonomyDanger = stats.autonomy < 50;
  const mgbDanger = stats.managerGoodBooks < 40;

  return (
    <aside className="w-60 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 px-5 py-6 flex flex-col gap-0 min-h-0 overflow-y-auto">

      {/* Role badge + XP Progress */}
      <div className="mb-6 pb-5 border-b border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">Current Role</p>
        <p className="text-sm font-medium text-zinc-200 font-mono">{config.label}</p>
        <p className="text-xs text-zinc-600 font-mono mt-0.5">→ {config.nextLabel}</p>
        {/* XP Progress toward next level */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">XP for {config.nextLabel}</span>
            <span className="text-xs font-mono tabular-nums text-amber-400">
              {stats.levelXP.toLocaleString('en-US')} / {config.impactGoal.toLocaleString('en-US')}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((stats.levelXP / config.impactGoal) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Net Worth + Shop */}
      <div className="mb-5 flex items-center justify-between pb-5 border-b border-zinc-800">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Net Worth</p>
          <p className="text-sm font-mono font-semibold text-amber-400 tabular-nums mt-0.5">
            {fmt(stats.netWorth)}
          </p>
        </div>
        <button
          onClick={onOpenShop}
          className="text-xs font-mono px-2.5 py-1.5 rounded border border-amber-900 bg-amber-950 text-amber-400 hover:bg-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors cursor-pointer"
        >
          $ Shop
        </button>
      </div>

      {/* Stats */}
      <div className="flex-1">
        <StatBar
          label="Bandwidth"
          value={stats.bandwidth}
          max={stats.maxBandwidth}
          color="bg-blue-500"
          bgColor="bg-zinc-800"
          note="Action points remaining this sprint"
        />

        {/* Player Face HUD */}
        {(() => {
          const { matrix, mood } = getPlayerSprite(stats.burnout);
          return (
            <div
              data-testid="player-face"
              data-mood={mood}
              className="flex justify-center mb-2"
            >
              <PixelSprite matrix={matrix} pixelSize={5} label={`Player mood: ${mood}`} />
            </div>
          );
        })()}

        <StatBar
          label="Burnout"
          value={stats.burnout}
          max={100}
          color={burnoutWarning ? 'bg-red-500' : 'bg-red-800'}
          bgColor="bg-zinc-800"
          showPercent
          warning={burnoutWarning}
          note={burnoutWarning ? '⚠ PTO risk > 80%' : undefined}
        />

        {/* Manager Face HUD */}
        {(() => {
          const { matrix, mood } = getManagerSprite(stats.managerGoodBooks);
          return (
            <div
              data-testid="manager-face"
              data-mood={mood}
              className="flex justify-center mb-2"
            >
              <PixelSprite matrix={matrix} pixelSize={5} label={`Manager mood: ${mood}`} />
            </div>
          );
        })()}

        <StatBar
          label="Manager's Good Books"
          value={stats.managerGoodBooks}
          max={100}
          color={mgbDanger ? 'bg-orange-500' : 'bg-teal-600'}
          bgColor="bg-zinc-800"
          showPercent
          warning={mgbDanger}
          note={mgbDanger ? undefined : 'Reputation with manager'}
          pipRisk={mgbDanger}
        />

        <StatBar
          label="Autonomy"
          value={stats.autonomy}
          max={100}
          color={autonomyDanger ? 'bg-amber-500' : 'bg-green-600'}
          bgColor="bg-zinc-800"
          showPercent
          warning={autonomyDanger}
          note={autonomyDanger ? undefined : 'Lowered by Escalate'}
          pipRisk={autonomyDanger}
        />

        <StatBar
          label="Project Debt"
          value={stats.debt}
          max={100}
          color={debtDanger ? 'bg-red-500' : 'bg-orange-900'}
          bgColor="bg-zinc-800"
          showPercent
          warning={debtDanger}
          pulse={debtDanger}
          note={debtDanger ? '⚠ +20% task cost' : undefined}
          pipRisk={debtDanger}
        />

        {/* Faction Reputations moved to CycleSummaryModal (Task 2.3) */}
      </div>

      {/* Tool inventory is now shown in the right-side InventoryToolbar */}
    </aside>
  );
}
