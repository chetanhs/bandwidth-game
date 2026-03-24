import { useGameStore } from '../store';

const COMPANY = 'NEXUS DYNAMICS, INC.';
const COMPANY_SHORT = 'Nexus Dynamics';

export function OfferLetterScreen() {
  const { playerName, track, acceptOfferLetter, resetGame } = useGameStore();

  const role = track === 'engineering' ? 'Software Engineer, Level III' : 'Associate, Level III';
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #f4f4f5 1px, transparent 1px), linear-gradient(to bottom, #f4f4f5 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Faint top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />

      <div className="relative z-10 w-full max-w-2xl animate-fade-in-up">

        {/* Letter card */}
        <div
          className="bg-zinc-900 border border-zinc-700 rounded-sm shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 0 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03)' }}
        >

          {/* Letterhead */}
          <div className="px-10 pt-8 pb-6 border-b border-zinc-800 flex items-start justify-between gap-6">
            <div>
              <p
                className="font-retro text-zinc-100 tracking-widest mb-1"
                style={{ fontSize: '10px' }}
              >
                {COMPANY}
              </p>
              <p className="text-xs text-zinc-600 font-mono">Move Fast. Break People.</p>
            </div>
            <div className="text-right text-xs text-zinc-600 font-mono leading-relaxed">
              <p>1 Unicorn Way</p>
              <p>San Francisco, CA 94105</p>
              <p className="mt-1 text-zinc-700">{today}</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-10 py-8 font-mono text-sm leading-relaxed text-zinc-300 antialiased">

            <p className="mb-5 text-zinc-500 text-xs">
              RE: OFFER OF EMPLOYMENT — CONFIDENTIAL
            </p>

            <p className="mb-5">
              Dear{' '}
              <span className="text-zinc-100 font-semibold">{playerName}</span>,
            </p>

            <p className="mb-4 text-zinc-400">
              We are pleased — genuinely, contractually pleased — to extend this
              offer of employment for the position of{' '}
              <span className="text-zinc-200">{role}</span> at{' '}
              <span className="text-zinc-200">{COMPANY_SHORT}</span>.
              This offer is contingent upon your continued willingness to trade your best
              years for equity that may or may not vest.
            </p>

            {/* Terms grid */}
            <div className="my-6 border border-zinc-800 rounded divide-y divide-zinc-800">
              {[
                { label: 'Base Salary', value: '$180,000 / yr', note: 'payable bi-weekly, net of dreams' },
                { label: 'Equity', value: '0.002%', note: '4-yr cliff, subject to re-org' },
                { label: 'Sprint Bandwidth', value: '100 units / cycle', note: 'non-transferable, expires daily' },
                { label: 'Burnout Insurance', value: 'Not Provided', note: 'see Employee Wellness Myth §4' },
                { label: 'Manager', value: 'Alex Chen', note: 'Engineering Manager · very normal' },
              ].map(({ label, value, note }) => (
                <div key={label} className="flex items-start justify-between px-4 py-3 gap-4">
                  <span className="text-zinc-500 text-xs uppercase tracking-widest w-40 flex-shrink-0 font-semibold">
                    {label}
                  </span>
                  <div className="flex-1 text-right">
                    <span className="text-zinc-200 text-xs">{value}</span>
                    <p className="text-zinc-300 text-xs mt-0.5 italic leading-relaxed">{note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-5 bg-zinc-800/60 border-l-4 border-amber-600 px-4 py-3 rounded-r text-xs text-zinc-300 leading-relaxed font-mono">
              By accepting this offer, you acknowledge that:
              (a) performance will be reviewed cyclically and without mercy;
              (b) &quot;unlimited PTO&quot; is a social construct;
              (c) your bandwidth is your most precious resource and the company bears
              no liability for its depletion;
              (d) any resemblance to your previous employer is intentional.
            </div>

            <p className="text-zinc-400">
              We look forward to your imminent contributions.
            </p>

            <div className="mt-6 flex items-end gap-4">
              <div>
                <div className="h-px w-32 bg-zinc-700 mb-1" />
                <p className="text-zinc-500 text-xs">Alex Chen</p>
                <p className="text-zinc-600 text-xs">Engineering Manager</p>
                <p className="text-zinc-600 text-xs">{COMPANY_SHORT}</p>
              </div>
            </div>
          </div>

          {/* Fine print */}
          <div className="px-10 py-4 border-t border-zinc-800 bg-zinc-950">
            <p className="text-zinc-400 font-mono leading-relaxed" style={{ fontSize: '10px' }}>
              This document contains proprietary information. Unauthorized disclosure
              will be interpreted as a performance issue. Nexus Dynamics reserves the
              right to amend any and all terms, at any time, for any reason, including
              but not limited to: market conditions, management mood, quarterly panic.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={acceptOfferLetter}
            className="flex-1 py-3 rounded border border-zinc-500 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-400 focus:ring-2 focus:ring-zinc-400 focus:outline-none transition-all font-mono text-sm font-medium cursor-pointer"
          >
            Accept Offer &amp; Report for Duty →
          </button>
          <button
            onClick={resetGame}
            className="px-5 py-3 rounded border border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 transition-colors font-mono text-xs cursor-pointer"
          >
            ← Decline
          </button>
        </div>

        <p className="mt-4 text-center text-zinc-700 font-mono" style={{ fontSize: '10px' }}>
          BANDWIDTH · {COMPANY} · All Rights Reserved By Your Employer
        </p>
      </div>
    </div>
  );
}
