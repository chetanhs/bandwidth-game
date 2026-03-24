import { useState } from 'react';
import type { PlayerStats, ToolItemType, ThemeId, AvatarId } from '../types';
import { THEMES, AVATARS } from '../types';

interface Props {
  stats: PlayerStats;
  unlockedThemes: ThemeId[];
  activeTheme: ThemeId;
  unlockedAvatars: AvatarId[];
  activeAvatar: AvatarId;
  onBuyPerk: (perkId: 'mental-health-day' | 'hawaii-vacation') => void;
  onBuyTool: (toolType: ToolItemType) => void;
  onBuyTheme: (themeId: ThemeId) => void;
  onSetTheme: (themeId: ThemeId) => void;
  onBuyAvatar: (avatarId: AvatarId) => void;
  onSetAvatar: (avatarId: AvatarId) => void;
  onClose: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  tag: string;
  tagClass: string;
}

const PERKS: ShopItem[] = [
  {
    id: 'mental-health-day',
    name: 'Mental Health Day',
    description: 'Take a day off. Reduces Burnout by 15%.',
    cost: 2000,
    tag: '-15% Burnout',
    tagClass: 'text-green-400',
  },
  {
    id: 'hawaii-vacation',
    name: 'Hawaii Vacation',
    description: 'Fly far away. Resets Burnout to 0% completely.',
    cost: 15000,
    tag: 'Burnout → 0%',
    tagClass: 'text-green-400',
  },
];

const TOOLS: (ShopItem & { type: ToolItemType })[] = [
  {
    id: 'noise-canceling-headphones',
    type: 'noise-canceling-headphones',
    name: 'Noise Canceling Headphones',
    description: 'Single use. Blocks one Meeting or PM Status Update event.',
    cost: 3000,
    tag: 'Blocks 1 event',
    tagClass: 'text-blue-400',
  },
  {
    id: 'chatgpt-plus',
    type: 'chatgpt-plus',
    name: 'ChatGPT Plus Subscription',
    description: 'Passive for one cycle: Grind actions cost 1 less Bandwidth.',
    cost: 2000,
    tag: 'Grind costs 4 BW (1 cycle)',
    tagClass: 'text-purple-400',
  },
  {
    id: 'offline-update',
    type: 'offline-update' as ToolItemType,
    name: 'Offline Update',
    description: 'Single use. Instantly dismisses a Standup event with no penalty.',
    cost: 2500,
    tag: 'Blocks Standup',
    tagClass: 'text-orange-400',
  },
  {
    id: 'review-buddy',
    type: 'review-buddy' as ToolItemType,
    name: 'Review Buddy',
    description: 'Single use. Instantly approves one In Review task, moving it to Done.',
    cost: 3500,
    tag: 'Instant Review',
    tagClass: 'text-purple-400',
  },
  {
    id: 'battery-pack',
    type: 'battery-pack' as ToolItemType,
    name: 'Battery Pack',
    description: 'Recharges your Noise Canceling Headphones to 3 charges. Requires headphones.',
    cost: 1500,
    tag: 'Recharge Headphones',
    tagClass: 'text-blue-400',
  },
];

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US');
}

type Tab = 'perks' | 'cosmetics';

export function PerksShop({
  stats, unlockedThemes, activeTheme, unlockedAvatars, activeAvatar,
  onBuyPerk, onBuyTool, onBuyTheme, onSetTheme, onBuyAvatar, onSetAvatar, onClose,
}: Props) {
  const [tab, setTab] = useState<Tab>('perks');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-700">
          <div>
            <h2 className="text-zinc-100 font-mono font-bold text-sm uppercase tracking-widest">
              Shop
            </h2>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Net Worth: <span className="text-amber-400 font-semibold">{fmt(stats.netWorth)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 font-mono text-lg leading-none transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-700">
          {(['perks', 'cosmetics'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                'flex-1 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer',
                tab === t
                  ? 'text-zinc-100 border-b-2 border-blue-500'
                  : 'text-zinc-400 hover:text-zinc-200',
              ].join(' ')}
            >
              {t === 'perks' ? 'Perks & Tools' : 'Cosmetics'}
            </button>
          ))}
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto">

          {tab === 'perks' && (
            <>
              {/* Recovery */}
              <section>
                <p className="text-xs text-zinc-200 uppercase tracking-widest font-mono mb-3">Recovery</p>
                <div className="space-y-2">
                  {PERKS.map((perk) => {
                    const canAfford = stats.netWorth >= perk.cost;
                    return (
                      <div key={perk.id} className="flex items-center justify-between gap-4 py-3 px-4 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-200 text-sm font-mono font-medium">{perk.name}</p>
                          <p className="text-zinc-300 text-xs font-mono mt-0.5">{perk.description}</p>
                          <p className={`text-xs font-mono mt-1 font-semibold ${perk.tagClass}`}>{perk.tag}</p>
                        </div>
                        <button
                          onClick={() => onBuyPerk(perk.id as 'mental-health-day' | 'hawaii-vacation')}
                          disabled={!canAfford}
                          className={[
                            'flex-shrink-0 text-xs font-mono px-3 py-1.5 rounded border transition-colors cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none',
                            canAfford
                              ? 'border-zinc-500 bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed',
                          ].join(' ')}
                        >
                          {fmt(perk.cost)}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Tools */}
              <section>
                <p className="text-xs text-zinc-200 uppercase tracking-widest font-mono mb-3">Tool Chest</p>
                <div className="space-y-2">
                  {TOOLS.map((tool) => {
                    const canAfford = stats.netWorth >= tool.cost;
                    // battery-pack is never "owned" — it's a consumable that restores headphone charges
                    const owned = tool.type !== 'battery-pack' && stats.inventory.some((t) => t.type === tool.type);
                    // battery-pack requires headphones to exist
                    const batteryPackDisabled = tool.type === 'battery-pack' && !stats.inventory.some((t) => t.type === 'noise-canceling-headphones');
                    return (
                      <div key={tool.id} className="flex items-center justify-between gap-4 py-3 px-4 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-200 text-sm font-mono font-medium">{tool.name}</p>
                          <p className="text-zinc-300 text-xs font-mono mt-0.5">{tool.description}</p>
                          <p className={`text-xs font-mono mt-1 font-semibold ${tool.tagClass}`}>{tool.tag}</p>
                        </div>
                        {owned ? (
                          <span className="flex-shrink-0 text-xs font-mono text-green-500 border border-green-900 px-2 py-1 rounded">
                            Owned
                          </span>
                        ) : (
                          <button
                            onClick={() => onBuyTool(tool.type)}
                            disabled={!canAfford || batteryPackDisabled}
                            className={[
                              'flex-shrink-0 text-xs font-mono px-3 py-1.5 rounded border transition-colors cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none',
                              canAfford && !batteryPackDisabled
                                ? 'border-zinc-500 bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                                : 'border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed',
                            ].join(' ')}
                          >
                            {fmt(tool.cost)}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {tab === 'cosmetics' && (
            <>
              {/* Themes */}
              <section>
                <p className="text-xs text-zinc-200 uppercase tracking-widest font-mono mb-3">UI Themes</p>
                <div className="space-y-2">
                  {(Object.values(THEMES)).map((theme) => {
                    const owned = unlockedThemes.includes(theme.id);
                    const active = activeTheme === theme.id;
                    const canAfford = stats.netWorth >= theme.cost;
                    return (
                      <div key={theme.id} className="flex items-center justify-between gap-4 py-3 px-4 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-zinc-200 text-sm font-mono font-medium">{theme.name}</p>
                          <p className="text-zinc-300 text-xs font-mono mt-0.5">{theme.cost === 0 ? 'Default theme' : fmt(theme.cost)}</p>
                        </div>
                        {active ? (
                          <span className="flex-shrink-0 text-xs font-mono text-blue-400 border border-blue-800 px-2 py-1 rounded">Active</span>
                        ) : owned ? (
                          <button
                            onClick={() => onSetTheme(theme.id)}
                            className="flex-shrink-0 text-xs font-mono px-3 py-1.5 rounded border border-zinc-500 bg-zinc-700 text-zinc-200 hover:bg-zinc-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors cursor-pointer"
                          >
                            Apply
                          </button>
                        ) : (
                          <button
                            onClick={() => onBuyTheme(theme.id)}
                            disabled={!canAfford}
                            className={[
                              'flex-shrink-0 text-xs font-mono px-3 py-1.5 rounded border transition-colors cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none',
                              canAfford
                                ? 'border-zinc-500 bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                                : 'border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed',
                            ].join(' ')}
                          >
                            {fmt(theme.cost)}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Avatars */}
              <section>
                <p className="text-xs text-zinc-200 uppercase tracking-widest font-mono mb-3">Avatars</p>
                <div className="space-y-2">
                  {(Object.values(AVATARS)).map((avatar) => {
                    const owned = unlockedAvatars.includes(avatar.id);
                    const active = activeAvatar === avatar.id;
                    const canAfford = stats.netWorth >= avatar.cost;
                    return (
                      <div key={avatar.id} className="flex items-center justify-between gap-4 py-3 px-4 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl">{avatar.emoji}</span>
                          <div>
                            <p className="text-zinc-200 text-sm font-mono font-medium">{avatar.name}</p>
                            <p className="text-zinc-300 text-xs font-mono mt-0.5">{avatar.cost === 0 ? 'Default avatar' : fmt(avatar.cost)}</p>
                          </div>
                        </div>
                        {active ? (
                          <span className="flex-shrink-0 text-xs font-mono text-blue-400 border border-blue-800 px-2 py-1 rounded">Active</span>
                        ) : owned ? (
                          <button
                            onClick={() => onSetAvatar(avatar.id)}
                            className="flex-shrink-0 text-xs font-mono px-3 py-1.5 rounded border border-zinc-500 bg-zinc-700 text-zinc-200 hover:bg-zinc-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors cursor-pointer"
                          >
                            Equip
                          </button>
                        ) : (
                          <button
                            onClick={() => onBuyAvatar(avatar.id)}
                            disabled={!canAfford}
                            className={[
                              'flex-shrink-0 text-xs font-mono px-3 py-1.5 rounded border transition-colors cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none',
                              canAfford
                                ? 'border-zinc-500 bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                                : 'border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed',
                            ].join(' ')}
                          >
                            {fmt(avatar.cost)}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
