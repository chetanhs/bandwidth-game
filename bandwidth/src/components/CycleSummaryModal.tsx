import { useEffect, useState } from 'react';
import type { CycleSummary, Perk, PerkId } from '../types';
import { PixelSprite } from './PixelSprite';
import { SPRITE_TROPHY } from '../data/SpriteLibrary';

interface Props {
  summary: CycleSummary;
  currentTotalXP: number;
  pendingPerkDraft: Perk[] | null;
  onDraftPerk: (perkId: PerkId) => void;
  onStartNextCycle: () => void;
}

export function CycleSummaryModal({ summary, currentTotalXP, pendingPerkDraft, onDraftPerk, onStartNextCycle }: Props) {
  const { xpEarned, salaryEarned, bandwidthBefore, maxBandwidth, lootDrop } = summary;

  // Track which perk the player has selected (null = none yet)
  const [selectedPerk, setSelectedPerk] = useState<PerkId | null>(null);
  const hasDraft = pendingPerkDraft && pendingPerkDraft.length > 0;
  const canProceed = !hasDraft || selectedPerk !== null;

  // ── Bandwidth bar animation ───────────────────────────────────────────────
  const [bwPct, setBwPct] = useState((bandwidthBefore / maxBandwidth) * 100);
  useEffect(() => {
    const t = setTimeout(() => setBwPct(100), 250);
    return () => clearTimeout(t);
  }, []);

  // ── XP count-up animation ─────────────────────────────────────────────────
  const targetXP = currentTotalXP + xpEarned;
  const [displayedXP, setDisplayedXP] = useState(currentTotalXP);
  useEffect(() => {
    if (xpEarned === 0) return;
    const steps = 40;
    const interval = 1200 / steps; // finish in ~1.2s
    const increment = xpEarned / steps;
    let current = currentTotalXP;
    const id = setInterval(() => {
      current = Math.min(current + increment, targetXP);
      setDisplayedXP(Math.round(current));
      if (current >= targetXP) clearInterval(id);
    }, interval);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Staggered reveal ──────────────────────────────────────────────────────
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      data-testid="cycle-summary"
      className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-950 overflow-y-auto pt-10"
    >
      {/* Subtle scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
        }}
      />

      <div
        className={`relative w-full max-w-md mx-6 my-8 transition-all duration-500 ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Header with trophy */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <PixelSprite matrix={SPRITE_TROPHY} pixelSize={7} label="Cycle Complete" />
          </div>
          <h1
            className="text-zinc-100 font-retro tracking-tight"
            style={{ fontSize: '11px' }}
          >
            Cycle Complete
          </h1>
          <p className="text-zinc-500 text-xs font-mono mt-1">end of sprint summary</p>
        </div>

        {/* Stats card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden mb-4">

          {/* XP row */}
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-300 uppercase tracking-widest font-mono mb-0.5">Total XP</p>
              <p
                className="text-2xl font-mono font-bold tabular-nums text-amber-400"
              >
                {displayedXP.toLocaleString('en-US')}
              </p>
            </div>
            {xpEarned > 0 && (
              <div className="text-right">
                <p className="text-xs text-zinc-300 font-mono mb-0.5">this cycle</p>
                <p
                  data-testid="cycle-xp-earned"
                  className="text-base font-mono font-semibold text-green-400 tabular-nums"
                >
                  +{xpEarned.toLocaleString('en-US')} XP
                </p>
              </div>
            )}
          </div>

          {/* Salary row */}
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-300 uppercase tracking-widest font-mono mb-0.5">Salary Deposited</p>
            </div>
            <p className="text-base font-mono font-semibold text-amber-400 tabular-nums">
              +${salaryEarned.toLocaleString('en-US')}
            </p>
          </div>

          {/* Bandwidth restore row */}
          <div className="px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-zinc-300 uppercase tracking-widest font-mono">Bandwidth Restored</p>
              <span className="text-xs font-mono tabular-nums text-blue-400">
                {bandwidthBefore} → <span className="text-zinc-200 font-semibold">100</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${bwPct}%` }}
              />
            </div>
          </div>

          {/* Loot drop row */}
          <div className="px-5 py-4">
            <p className="text-xs text-zinc-300 uppercase tracking-widest font-mono mb-2">Reward Drop</p>
            {lootDrop ? (
              <div className="flex items-center gap-3 bg-zinc-800 border border-green-900 rounded px-3 py-2.5">
                <span className="text-green-400 text-base">🎁</span>
                <div>
                  <p className="text-xs font-mono font-medium text-green-300">{lootDrop.name}</p>
                  <p className="text-xs font-mono text-zinc-500 mt-0.5">added to Tool Chest</p>
                </div>
              </div>
            ) : (
              <p className="text-xs font-mono text-zinc-700 italic">No drop this cycle.</p>
            )}
          </div>
        </div>

        {/* Perk Draft */}
        {hasDraft && (
          <div className="mb-4">
            <p className="text-xs text-zinc-300 uppercase tracking-widest font-mono mb-3 text-center">
              ✨ Pick a Perk
            </p>
            <div className="flex flex-col gap-2">
              {pendingPerkDraft!.map((perk) => {
                const isSelected = selectedPerk === perk.id;
                return (
                  <button
                    key={perk.id}
                    data-testid={`perk-card-${perk.id}`}
                    onClick={() => setSelectedPerk(perk.id)}
                    className={[
                      'w-full text-left px-4 py-3 rounded border font-mono transition-all cursor-pointer focus:ring-2 focus:ring-amber-500 focus:outline-none',
                      isSelected
                        ? 'border-amber-500 bg-amber-950 text-amber-200'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800',
                    ].join(' ')}
                  >
                    <p className="text-xs font-semibold mb-0.5">{perk.name}</p>
                    <p className="text-xs text-zinc-400 leading-snug">{perk.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA button */}
        <button
          data-testid="start-next-cycle-btn"
          onClick={() => {
            if (!canProceed) return;
            if (selectedPerk) onDraftPerk(selectedPerk);
            else onStartNextCycle();
          }}
          disabled={!canProceed}
          className={[
            'w-full py-3.5 rounded border font-retro transition-colors',
            canProceed
              ? 'border-zinc-600 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-500 text-zinc-200 cursor-pointer'
              : 'border-zinc-800 bg-zinc-900 text-zinc-700 cursor-not-allowed',
          ].join(' ')}
          style={{ fontSize: '9px' }}
        >
          {hasDraft && !selectedPerk ? 'Pick a Perk to Continue' : 'Start Next Cycle →'}
        </button>
      </div>
    </div>
  );
}
