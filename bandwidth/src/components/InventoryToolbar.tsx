import { useState } from 'react';
import type { ToolItem, ToolItemType, PerkId, ChaosEventType } from '../types';
import { PixelSprite } from './PixelSprite';
import {
  SPRITE_HEADPHONES,
  SPRITE_PALM_TREE,
  SPRITE_COFFEE_CUP,
  SPRITE_CONSULT,
  SPRITE_RUBBER_DUCK,
  SPRITE_BLAME_SHIFTER,
  SPRITE_LIGHTNING,
  SPRITE_CAFFEINE_PERK,
  SPRITE_SKULL,
} from '../data/SpriteLibrary';

interface Props {
  inventory: ToolItem[];
  activeBuffs: ToolItem[];
  onUseTool: (type: ToolItemType) => void;
  onDrinkCoffee: () => void;
  onSeniorConsult: () => void;
  // Perk props (Epic 2)
  activePerks: PerkId[];
  perkCooldowns: PerkId[];
  pendingChaosType: ChaosEventType | null;
  onPlayPerk: (perkId: PerkId) => void;
  isSpotlit?: boolean;
}

// ─── Tool config ───────────────────────────────────────────────────────────

const TOOL_TOOLTIPS: Partial<Record<ToolItemType, string>> = {
  'noise-canceling-headphones': 'Activate → auto-blocks the next Meeting or PM Status Update event (charges shown)',
  'chatgpt-plus': 'Passive: Grind actions cost 1 less Bandwidth this cycle',
  'offline-update': 'Single use: Blocks the next Standup event with no penalty',
  'review-buddy': 'Single use: Instantly approves one In Review task → Done',
  'battery-pack': 'Recharges Noise Canceling Headphones to 3 charges',
  'vacation': 'Use: Resets Burnout to 0',
};

const TOOL_EMOJI: Partial<Record<ToolItemType, string>> = {
  'chatgpt-plus': '🤖',
  'offline-update': '📴',
  'review-buddy': '👥',
  'battery-pack': '🔋',
};

function ToolIcon({ type }: { type: ToolItemType }) {
  if (type === 'noise-canceling-headphones') {
    return <PixelSprite matrix={SPRITE_HEADPHONES} pixelSize={3} label="Headphones" />;
  }
  if (type === 'vacation') {
    return <PixelSprite matrix={SPRITE_PALM_TREE} pixelSize={3} label="Vacation" />;
  }
  return <span className="text-lg">{TOOL_EMOJI[type] ?? '🔧'}</span>;
}

// ─── Perk config ───────────────────────────────────────────────────────────

const PERK_SPRITES: Partial<Record<PerkId, string[][]>> = {
  'rubber-duck':    SPRITE_RUBBER_DUCK,
  'blame-shifter':  SPRITE_BLAME_SHIFTER,
  '10x-dev':        SPRITE_LIGHTNING,
  'caffeine-addict': SPRITE_CAFFEINE_PERK,
  'dark-patterns':  SPRITE_SKULL,
};

const PERK_LABELS: Partial<Record<PerkId, string>> = {
  'rubber-duck':    'Rubber Duck',
  'blame-shifter':  'Blame Shifter',
  '10x-dev':        '10x Dev',
  'caffeine-addict': 'Caffeine Addict',
  'dark-patterns':  'Ship Dirty',
};

const PERK_TOOLTIPS: Partial<Record<PerkId, string>> = {
  'rubber-duck':    'Rubber Duck: Counters Bug in Prod events. Passive: +20 BW at cycle start.',
  'blame-shifter':  'Blame Shifter: Counters Scope Creep events. Passive: Ship Dirty adds 0 Debt.',
  '10x-dev':        '10x Dev: Counters Re-Org events. Passive: Task complexity -30%.',
  'caffeine-addict': 'Caffeine Addict: Counters Mandatory Meeting events. Passive: Coffee gives 2× BW.',
  'dark-patterns':  'Ship Dirty: Passive: All XP gains 1.5×, but Debt gains 1.5× too.',
};

// Which chaos event each perk counters
const PERK_COUNTERS: Partial<Record<PerkId, ChaosEventType>> = {
  'rubber-duck':    'pagerduty',
  'blame-shifter':  'scope-creep',
  '10x-dev':        're-org',
  'caffeine-addict': 'mandatory-meeting',
};

// ─── Hover state type ──────────────────────────────────────────────────────

type HoveredId = ToolItemType | PerkId | 'coffee' | 'consult';

// ─── Component ────────────────────────────────────────────────────────────

export function InventoryToolbar({
  inventory,
  activeBuffs,
  onUseTool,
  onDrinkCoffee,
  onSeniorConsult,
  activePerks,
  perkCooldowns,
  pendingChaosType,
  onPlayPerk,
  isSpotlit,
}: Props) {
  const [hoveredId, setHoveredId] = useState<HoveredId | null>(null);

  const hasInventory = activeBuffs.length > 0 || inventory.length > 0;

  return (
    <div className={`fixed right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 pr-3 ${isSpotlit ? 'z-[60] bg-zinc-900 rounded-l shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'z-40'}`}>

      {/* ── Recovery actions (always visible) ─────────────────── */}
      <div
        className="relative"
        onMouseEnter={() => setHoveredId('coffee')}
        onMouseLeave={() => setHoveredId(null)}
      >
        <button
          onClick={onDrinkCoffee}
          className="w-10 h-10 flex items-center justify-center rounded border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-500 shadow-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          <PixelSprite matrix={SPRITE_COFFEE_CUP} pixelSize={3} label="Coffee" />
        </button>
        {hoveredId === 'coffee' && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2 w-52 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl pointer-events-none">
            <p className="text-xs font-mono font-semibold text-zinc-200 mb-0.5">Coffee</p>
            <p className="text-xs font-mono text-zinc-400 leading-snug">+25 BW, +15 Burnout</p>
            <p className="text-xs font-mono text-blue-400 mt-1">Click to use</p>
          </div>
        )}
      </div>

      <div
        className="relative"
        onMouseEnter={() => setHoveredId('consult')}
        onMouseLeave={() => setHoveredId(null)}
      >
        <button
          onClick={onSeniorConsult}
          className="w-10 h-10 flex items-center justify-center rounded border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-500 shadow-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          <PixelSprite matrix={SPRITE_CONSULT} pixelSize={3} label="Senior Consult" />
        </button>
        {hoveredId === 'consult' && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2 w-52 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl pointer-events-none">
            <p className="text-xs font-mono font-semibold text-zinc-200 mb-0.5">Senior Consult</p>
            <p className="text-xs font-mono text-zinc-400 leading-snug">+20 BW, -10 Autonomy, -5 MGB</p>
            <p className="text-xs font-mono text-blue-400 mt-1">Click to use</p>
          </div>
        )}
      </div>

      {/* ── Active Perks ───────────────────────────────────────── */}
      {activePerks.length > 0 && (
        <>
          <div className="h-px bg-zinc-700 mx-1" />
          {activePerks.map((perkId) => {
            const isCountering = pendingChaosType !== null && PERK_COUNTERS[perkId] === pendingChaosType;
            const isOnCooldown = perkCooldowns.includes(perkId);
            const sprite = PERK_SPRITES[perkId];
            const label = PERK_LABELS[perkId] ?? perkId;

            let btnClass = 'w-10 h-10 flex items-center justify-center rounded border-2 shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2';
            let btnStyle: React.CSSProperties = {};

            if (isOnCooldown) {
              btnClass += ' border-zinc-700 bg-zinc-900 opacity-40 cursor-not-allowed';
            } else if (isCountering) {
              btnClass += ' border-green-400 bg-green-950 animate-pulse focus:ring-green-400';
              btnStyle = { boxShadow: '0 0 12px rgba(34,197,94,0.55)' };
            } else {
              btnClass += ' border-amber-700 bg-amber-950 hover:border-amber-500 hover:bg-amber-900 focus:ring-amber-400';
            }

            const tooltipText = isOnCooldown
              ? `${label} — used this cycle (resets next sprint)`
              : isCountering
              ? `⚡ ${label} counters this event! Click to negate it.`
              : (PERK_TOOLTIPS[perkId] ?? label);

            return (
              <div
                key={perkId}
                className="relative"
                onMouseEnter={() => setHoveredId(perkId)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button
                  onClick={() => !isOnCooldown && isCountering && onPlayPerk(perkId)}
                  disabled={isOnCooldown || !isCountering}
                  className={btnClass}
                  style={btnStyle}
                  aria-label={label}
                >
                  {sprite
                    ? <PixelSprite matrix={sprite} pixelSize={3} label={label} />
                    : <span className="text-xs font-mono text-amber-400">{label.slice(0, 2)}</span>
                  }
                </button>
                {hoveredId === perkId && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 w-56 bg-zinc-900 border border-amber-900 rounded-lg px-3 py-2 shadow-xl pointer-events-none">
                    <p className={`text-xs font-mono font-semibold mb-0.5 ${isCountering ? 'text-green-400' : isOnCooldown ? 'text-zinc-500' : 'text-amber-400'}`}>
                      {label} {isOnCooldown ? '— Cooldown' : isCountering ? '— ACTIVE COUNTER' : '— Perk'}
                    </p>
                    <p className="text-xs font-mono text-zinc-400 leading-snug">{tooltipText}</p>
                    {isCountering && <p className="text-xs font-mono text-green-400 mt-1">Click to play →</p>}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* ── Inventory tools ────────────────────────────────────── */}
      {hasInventory && <div className="h-px bg-zinc-700 mx-1" />}

      {activeBuffs.map((buff) => (
        <div
          key={buff.type}
          data-testid={`toolbar-buff-${buff.type}`}
          className="relative"
          onMouseEnter={() => setHoveredId(buff.type)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div className="w-10 h-10 flex items-center justify-center rounded border-2 border-green-600 bg-green-950 shadow-lg ring-1 ring-green-500/30 relative">
            <ToolIcon type={buff.type} />
            {buff.charges !== undefined && (
              <span className="absolute -bottom-1 -right-1 text-[9px] font-mono font-bold bg-zinc-900 border border-green-700 text-green-400 rounded-full w-4 h-4 flex items-center justify-center">
                {buff.charges}
              </span>
            )}
          </div>
          {hoveredId === buff.type && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 w-52 bg-zinc-900 border border-green-800 rounded-lg px-3 py-2 shadow-xl pointer-events-none">
              <p className="text-xs font-mono font-semibold text-green-400 mb-0.5">{buff.name} — ACTIVE</p>
              <p className="text-xs font-mono text-zinc-400 leading-snug">{TOOL_TOOLTIPS[buff.type]}</p>
            </div>
          )}
        </div>
      ))}

      {inventory.map((tool) => (
        <div
          key={tool.type}
          className="relative"
          onMouseEnter={() => setHoveredId(tool.type)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <button
            data-testid={`toolbar-tool-${tool.type}`}
            onClick={() => onUseTool(tool.type)}
            className="w-10 h-10 flex items-center justify-center rounded border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-500 shadow-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400 relative"
            title={TOOL_TOOLTIPS[tool.type]}
          >
            <ToolIcon type={tool.type} />
            {tool.charges !== undefined && (
              <span className="absolute -bottom-1 -right-1 text-[9px] font-mono font-bold bg-zinc-900 border border-zinc-600 text-zinc-400 rounded-full w-4 h-4 flex items-center justify-center">
                {tool.charges}
              </span>
            )}
          </button>
          {hoveredId === tool.type && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 w-52 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl pointer-events-none">
              <p className="text-xs font-mono font-semibold text-zinc-200 mb-0.5">{tool.name}</p>
              <p className="text-xs font-mono text-zinc-400 leading-snug">{TOOL_TOOLTIPS[tool.type]}</p>
              <p className="text-xs font-mono text-blue-400 mt-1">Click to use</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
