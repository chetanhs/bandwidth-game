import { useState } from 'react';
import type { CareerTrack } from '../types';
import { useGameStore } from '../store';

// ─── Track card data ──────────────────────────────────────────────────────

interface TrackOption {
  id: CareerTrack;
  label: string;
  startingRole: string;
  description: string;
  tags: string[];
  enabled: boolean;
}

const TRACKS: TrackOption[] = [
  {
    id: 'engineering',
    label: 'Engineering',
    startingRole: 'L3 Software Engineer',
    description: 'Ship features. Survive oncall. Accumulate tech debt. Avoid the reorg.',
    tags: ['TypeScript', 'System Design', 'Oncall'],
    enabled: true,
  },
  {
    id: 'product',
    label: 'Product',
    startingRole: 'Associate PM',
    description: 'Write PRDs nobody reads. Align 14 stakeholders. Redefine priorities weekly.',
    tags: ['Roadmapping', 'OKRs', 'Stakeholders'],
    enabled: false,
  },
  {
    id: 'sales',
    label: 'Sales',
    startingRole: 'Account Executive',
    description: 'Cold call into the void. Chase quota. Lose deals to procurement.',
    tags: ['CRM', 'Pipeline', 'Commission'],
    enabled: false,
  },
];

// ─── Component ────────────────────────────────────────────────────────────

interface StartScreenProps {
  onOpenArcade: () => void;
}

export function StartScreen({ onOpenArcade }: StartScreenProps) {
  const [name, setName] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<CareerTrack>('engineering');
  const startGame = useGameStore((s) => s.startGame);

  const handleStart = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    startGame(trimmed, selectedTrack);
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #f4f4f5 1px, transparent 1px), linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-500 to-transparent" />

      <div className="relative z-10 w-full max-w-2xl animate-fade-in-up">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded border border-zinc-700 bg-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-glow" />
            <span className="text-xs text-zinc-400 tracking-widest uppercase font-mono">
              v0.1.0-alpha
            </span>
          </div>

          <h1
            className="text-7xl font-semibold tracking-tighter text-zinc-100 mb-3 animate-flicker"
            style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.04em' }}
          >
            BANDWIDTH
          </h1>

          <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
            A corporate career simulator. Manage resources.
            Survive performance reviews. Get promoted.
          </p>
        </div>

        {/* Name input */}
        <div className="mb-8">
          <label className="block text-xs text-zinc-300 uppercase tracking-widest mb-2 font-mono">
            Player Handle
          </label>
          <input
            type="text"
            placeholder="enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-zinc-100 text-sm placeholder-zinc-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/60 transition-colors font-mono"
          />
        </div>

        {/* Track selection */}
        <div className="mb-10">
          <label className="block text-xs text-zinc-300 uppercase tracking-widest mb-3 font-mono">
            Career Track
          </label>
          <div className="grid grid-cols-1 gap-3">
            {TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => track.enabled && setSelectedTrack(track.id)}
                disabled={!track.enabled}
                className={[
                  'w-full text-left px-5 py-4 rounded border transition-all duration-150',
                  'group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-green-500/60',
                  track.enabled
                    ? selectedTrack === track.id
                      ? 'border-zinc-400 bg-zinc-800 hover:border-zinc-300 cursor-pointer'
                      : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/50 cursor-pointer'
                    : 'border-zinc-800 bg-zinc-900/60 opacity-50 cursor-not-allowed grayscale',
                ].join(' ')}
              >
                {/* Selection indicator */}
                {selectedTrack === track.id && track.enabled && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400 rounded-l" />
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-zinc-200">{track.label}</span>
                      <span className="text-xs text-zinc-400 font-mono">·</span>
                      <span className="text-xs text-zinc-400 font-mono">{track.startingRole}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed mb-2">{track.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {track.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded border border-zinc-600 bg-zinc-800 text-zinc-300 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex-shrink-0 mt-0.5" title={!track.enabled ? 'Coming soon' : undefined}>
                    {!track.enabled ? (
                      <span className="text-xs text-zinc-400 font-mono border border-zinc-700 px-1.5 py-0.5 rounded">🔒 LOCKED</span>
                    ) : selectedTrack === track.id ? (
                      <span className="text-xs text-zinc-300 font-mono">SELECTED</span>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={!name.trim()}
          className={[
            'w-full py-3.5 rounded text-sm font-medium tracking-wide transition-all duration-150',
            'border font-mono',
            name.trim()
              ? 'bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-zinc-200 cursor-pointer'
              : 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed',
          ].join(' ')}
        >
          START CAREER →
        </button>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-700 font-mono">
            BANDWIDTH · Corporate Career RPG · All rights reserved by your employer
          </p>
        </div>
      </div>

      {/* Test Labs — bottom-right corner, intentionally subdued */}
      <button
        onClick={onOpenArcade}
        className="absolute bottom-4 right-4 font-mono text-zinc-600 hover:text-zinc-400 text-xs transition-colors cursor-pointer"
      >
        [ Test Labs ]
      </button>
    </div>
  );
}
