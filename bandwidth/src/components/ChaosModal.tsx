import type { ChaosEvent, PerkId } from '../types';
import { PixelSprite } from './PixelSprite';
import {
  SPRITE_WARNING_SIGN,
  SPRITE_TROPHY,
  SPRITE_PM_FACE,
} from '../data/SpriteLibrary';

interface Props {
  event: ChaosEvent;
  onDismiss: () => void;
  canBlockWithHeadphones?: boolean;
  headphoneCharges?: number;
  onUseHeadphones?: () => void;
  canBlockWithOfflineUpdate?: boolean;
  onUseOfflineUpdate?: () => void;
  playablePerk?: { perkId: PerkId; label: string };
  onPlayPerk?: () => void;
  onAcceptUnplannedMeeting?: () => void;
  onSkipUnplannedMeeting?: () => void;
  onAcceptClientCall?: () => void;
  onFightPM?: () => void;
  onAcceptUnscheduled1on1?: () => void;
  onTriggerDuel?: () => void;
}

const CHAOS_CONTENT = {
  'scope-creep': {
    sprite: SPRITE_WARNING_SIGN,
    headline: 'Scope Creep',
    body: 'The PM added a requirement.',
    effect: 'Task progress reduced by 25.',
    effectClass: 'text-red-400',
    borderClass: 'border-orange-700',
    headlineClass: 'text-orange-300',
    scanColor: 'rgba(234,88,12,0.08)',
  },
  'pagerduty': {
    sprite: SPRITE_WARNING_SIGN,
    headline: 'PagerDuty Alert',
    body: 'Prod is down.',
    effect: '-15 Bandwidth.',
    effectClass: 'text-red-400',
    borderClass: 'border-red-700',
    headlineClass: 'text-red-300',
    scanColor: 'rgba(220,38,38,0.08)',
  },
  'mandatory-meeting': {
    sprite: SPRITE_WARNING_SIGN,
    headline: 'Mandatory Team Meeting',
    body: 'Calendar invite: all-hands sync. Attendance required.',
    effect: '-15 Bandwidth.',
    effectClass: 'text-red-400',
    borderClass: 'border-orange-700',
    headlineClass: 'text-orange-300',
    scanColor: 'rgba(234,88,12,0.08)',
  },
  'optional-outing': {
    sprite: SPRITE_TROPHY,
    headline: 'Optional Team Outing',
    body: 'Happy hour at the rooftop bar. You went anyway.',
    effect: "-10 Bandwidth, +5% Manager's Good Books.",
    effectClass: 'text-amber-400',
    borderClass: 'border-yellow-700',
    headlineClass: 'text-yellow-300',
    scanColor: 'rgba(202,138,4,0.08)',
  },
  'pm-status-update': {
    sprite: SPRITE_WARNING_SIGN,
    headline: 'PM Status Update',
    body: '"Can you just update the tracker real quick?" — 45 min later.',
    effect: '-10 Bandwidth.',
    effectClass: 'text-red-400',
    borderClass: 'border-orange-700',
    headlineClass: 'text-orange-300',
    scanColor: 'rgba(234,88,12,0.08)',
  },
  're-org': {
    sprite: SPRITE_WARNING_SIGN,
    headline: 'Re-Org Announcement',
    body: 'Leadership has restructured priorities. Everything shifts.',
    effect: 'All To-Do tasks reshuffled (+5 complexity each).',
    effectClass: 'text-purple-400',
    borderClass: 'border-purple-700',
    headlineClass: 'text-purple-300',
    scanColor: 'rgba(126,34,206,0.08)',
  },
  'standup': {
    sprite: SPRITE_PM_FACE,
    headline: 'Quick Sync?',
    body: '"It\'ll only take 5 minutes." The PM has pinged you for a standup. There is no escaping this.',
    effect: '-10 Bandwidth.',
    effectClass: 'text-orange-400',
    borderClass: 'border-orange-700',
    headlineClass: 'text-orange-300',
    scanColor: 'rgba(234,88,12,0.08)',
  },
  'unplanned-meeting': {
    sprite: SPRITE_PM_FACE,
    headline: 'Unplanned Team Meeting',
    body: '"Can we grab 5 minutes?" — It\'s now. The PM has called an unplanned sync. Accept and take the hit, or run.',
    effect: 'Accept: -15 BW, +10 Burnout  |  Skip: face the consequences.',
    effectClass: 'text-red-400',
    borderClass: 'border-red-700',
    headlineClass: 'text-red-300',
    scanColor: 'rgba(220,38,38,0.10)',
  },
  'client-call': {
    sprite: SPRITE_PM_FACE,
    headline: 'Client Call Ambush',
    body: '"You\'re on mute." — The PM has pulled you into a live client call. Take the meeting... or settle this in the hallway.',
    effect: 'Accept: -30 BW  |  Combat: challenge the PM to a button-mashing duel.',
    effectClass: 'text-orange-400',
    borderClass: 'border-orange-700',
    headlineClass: 'text-orange-300',
    scanColor: 'rgba(234,88,12,0.10)',
  },
  'unscheduled-1on1': {
    sprite: SPRITE_PM_FACE,
    headline: 'Unscheduled 1:1',
    body: '"Got a minute?" — The manager has ambushed you with an impromptu performance chat. Accept the micromanagement... or duel them for respect.',
    effect: "Accept: -20 BW  |  Duel: fight for Autonomy & Manager's Good Books.",
    effectClass: 'text-purple-400',
    borderClass: 'border-purple-700',
    headlineClass: 'text-purple-300',
    scanColor: 'rgba(147,51,234,0.08)',
  },
} as const;

export function ChaosModal({ event, onDismiss, canBlockWithHeadphones, headphoneCharges, onUseHeadphones, canBlockWithOfflineUpdate, onUseOfflineUpdate, playablePerk, onPlayPerk, onAcceptUnplannedMeeting, onSkipUnplannedMeeting, onAcceptClientCall, onFightPM, onAcceptUnscheduled1on1, onTriggerDuel }: Props) {
  const content = CHAOS_CONTENT[event.type];

  return (
    // Dim backdrop
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Click-away backdrop */}
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px]" />

      {/* Slide-up panel */}
      <div
        className={`animate-slide-up relative w-full max-w-lg mx-4 mb-6 rounded-lg border-2 bg-zinc-900 overflow-hidden ${content.borderClass}`}
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.7)' }}
      >
        {/* Retro scan-line tint */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: content.scanColor }}
        />

        <div className="relative p-5">
          {/* Header row: sprite + text */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 mt-1">
              <PixelSprite matrix={content.sprite} pixelSize={5} label={content.headline} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-zinc-300 uppercase tracking-widest mb-1 font-retro"
                 style={{ fontSize: '7px' }}>
                Random Event
              </p>
              <h2
                className={`font-retro leading-tight mb-2 ${content.headlineClass}`}
                style={{ fontSize: '9px' }}
              >
                {content.headline}
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed font-mono">{content.body}</p>
            </div>
          </div>

          {/* Playable perk button (highest priority counter) */}
          {playablePerk && onPlayPerk && (
            <div className="mb-3">
              <button
                onClick={onPlayPerk}
                className="w-full font-retro px-4 py-3 rounded border-2 border-amber-400 bg-amber-950 text-amber-200 hover:bg-amber-900 hover:border-amber-300 focus:ring-2 focus:ring-amber-400 focus:outline-none transition-colors cursor-pointer"
                style={{
                  fontSize: '9px',
                  boxShadow: '0 0 16px rgba(251,191,36,0.45), 0 0 4px rgba(251,191,36,0.2)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              >
                ⚡ Play Perk: {playablePerk.label} — Negate Event
              </button>
            </div>
          )}

          {/* Tool bypass buttons (contextual) */}
          {(canBlockWithHeadphones || canBlockWithOfflineUpdate) && (
            <div className="mb-3 flex flex-col gap-2">
              {canBlockWithOfflineUpdate && onUseOfflineUpdate && (
                <button
                  onClick={onUseOfflineUpdate}
                  className="w-full font-retro px-4 py-2.5 rounded border-2 border-green-600 bg-green-950 text-green-300 hover:bg-green-900 hover:border-green-500 focus:ring-2 focus:ring-green-400 focus:outline-none transition-colors cursor-pointer"
                  style={{ fontSize: '9px' }}
                >
                  📴 Use Tool: Bypass Event (Offline Update)
                </button>
              )}
              {canBlockWithHeadphones && onUseHeadphones && (
                <button
                  onClick={onUseHeadphones}
                  className="w-full font-retro px-4 py-2.5 rounded border-2 border-green-500 bg-green-950 text-green-200 hover:bg-green-900 hover:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none transition-colors cursor-pointer"
                  style={{ fontSize: '9px', boxShadow: '0 0 10px rgba(34,197,94,0.3)' }}
                >
                  🎧 Put on Headphones ({headphoneCharges ?? 0} charge{(headphoneCharges ?? 0) !== 1 ? 's' : ''} remaining)
                </button>
              )}
            </div>
          )}

          {/* Effect + action row */}
          <div className="pt-3 border-t border-zinc-800">
            <span
              className={`font-retro block mb-3 ${content.effectClass}`}
              style={{ fontSize: '8px' }}
            >
              {content.effect}
            </span>
            {event.type === 'unplanned-meeting' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onSkipUnplannedMeeting}
                  className="flex-1 font-retro px-4 py-2 rounded border border-red-700 bg-red-950 text-red-300 hover:bg-red-900 hover:border-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors cursor-pointer"
                  style={{ fontSize: '8px' }}
                >
                  Skip Meeting →
                </button>
                <button
                  onClick={onAcceptUnplannedMeeting}
                  className="flex-1 font-retro px-4 py-2 rounded border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 focus:ring-2 focus:ring-zinc-400 focus:outline-none transition-colors cursor-pointer"
                  style={{ fontSize: '8px' }}
                >
                  Accept →
                </button>
              </div>
            ) : event.type === 'client-call' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onFightPM}
                  className="flex-1 font-retro px-4 py-2 rounded border border-orange-600 bg-orange-950 text-orange-200 hover:bg-orange-900 hover:border-orange-500 focus:ring-2 focus:ring-orange-400 focus:outline-none transition-colors cursor-pointer"
                  style={{
                    fontSize: '8px',
                    boxShadow: '0 0 10px rgba(234,88,12,0.3)',
                  }}
                >
                  🥊 Challenge PM to Combat
                </button>
                <button
                  onClick={onAcceptClientCall}
                  className="flex-1 font-retro px-4 py-2 rounded border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 focus:ring-2 focus:ring-zinc-400 focus:outline-none transition-colors cursor-pointer"
                  style={{ fontSize: '8px' }}
                >
                  Accept Call [-30 BW]
                </button>
              </div>
            ) : event.type === 'unscheduled-1on1' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onTriggerDuel}
                  className="flex-1 font-retro px-4 py-2 rounded border border-purple-600 bg-purple-950 text-purple-200 hover:bg-purple-900 hover:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-colors cursor-pointer"
                  style={{
                    fontSize: '8px',
                    boxShadow: '0 0 10px rgba(147,51,234,0.3)',
                  }}
                >
                  🔫 Duel Manager
                </button>
                <button
                  onClick={onAcceptUnscheduled1on1}
                  className="flex-1 font-retro px-4 py-2 rounded border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 focus:ring-2 focus:ring-zinc-400 focus:outline-none transition-colors cursor-pointer"
                  style={{ fontSize: '8px' }}
                >
                  Accept [-20 BW]
                </button>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={onDismiss}
                  className="text-xs font-retro px-4 py-2 rounded border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 focus:ring-2 focus:ring-orange-400 focus:outline-none transition-colors cursor-pointer"
                  style={{ fontSize: '8px' }}
                >
                  Acknowledge →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
