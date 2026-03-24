export type SpotlitElement = 'topnav' | 'board' | 'sidebar' | 'toolbar' | 'none';

interface Step {
  spotlight: SpotlitElement;
  title: string;
  body: string;
}

export const ONBOARDING_STEPS: Step[] = [
  {
    spotlight: 'topnav',
    title: 'THE SPRINT CLOCK',
    body: 'Welcome to your new role. Sprints happen in real-time. You have 90 seconds to complete your tickets before the cycle ends. Watch the clock.',
  },
  {
    spotlight: 'board',
    title: 'THE GRIND',
    body: "Click 'Work' to push code. It costs Bandwidth, but earns XP for your next promotion.",
  },
  {
    spotlight: 'sidebar',
    title: 'COST OF BUSINESS',
    body: "If Bandwidth hits 0, you can't work. If Burnout hits 100%, you will be placed on a PIP and fired. Manage your energy.",
  },
  {
    spotlight: 'toolbar',
    title: 'THE LIFELINES',
    body: 'Need a boost? Drink coffee or consult your manager. But be careful—every corporate lifeline comes with a toxic trade-off.',
  },
  {
    spotlight: 'none',
    title: 'ONE LAST THING',
    body: "Watch out for unannounced 'Quick Syncs' from your PM. Good luck. Don't disappoint the shareholders.",
  },
];

interface Props {
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
  onStart: () => void;
}

export function OnboardingTour({ currentStep, onNext, onSkip, onStart }: Props) {
  const step = ONBOARDING_STEPS[currentStep];
  const isLast = currentStep === ONBOARDING_STEPS.length - 1;
  const filled = '█'.repeat(currentStep + 1);
  const empty = '░'.repeat(ONBOARDING_STEPS.length - currentStep - 1);

  return (
    <>
      {/* Backdrop — z-50 dims background; spotlit elements at z-60 poke through */}
      <div className="fixed inset-0 z-50 bg-black/80 pointer-events-none" />

      {/* Dialog — z-70, always above spotlit elements and backdrop */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[70] w-full max-w-md px-4">
        <div
          className="bg-zinc-950 border border-zinc-700 rounded p-5 font-mono"
          style={{ boxShadow: '0 0 40px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.04)' }}
        >
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-500" style={{ fontSize: '10px', letterSpacing: '2px' }}>
              {filled}{empty}
            </span>
            <span className="text-zinc-600 font-mono" style={{ fontSize: '9px' }}>
              {currentStep + 1}/{ONBOARDING_STEPS.length}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-amber-400 uppercase tracking-widest mb-2 font-retro"
            style={{ fontSize: '8px' }}
          >
            {step.title}
          </h3>

          {/* Body */}
          <p className="text-zinc-300 text-sm leading-relaxed mb-4">{step.body}</p>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={onSkip}
              className="text-zinc-600 hover:text-zinc-400 transition-colors font-retro cursor-pointer"
              style={{ fontSize: '8px' }}
            >
              Skip Tutorial
            </button>
            {isLast ? (
              <button
                onClick={onStart}
                className="font-retro px-5 py-2 rounded border border-green-500 bg-green-950 text-green-200 hover:bg-green-900 hover:border-green-400 transition-colors cursor-pointer"
                style={{
                  fontSize: '9px',
                  boxShadow: '0 0 12px rgba(34,197,94,0.35)',
                }}
              >
                [ Start Sprint ]
              </button>
            ) : (
              <button
                onClick={onNext}
                className="font-retro px-5 py-2 rounded border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 transition-colors cursor-pointer"
                style={{ fontSize: '9px' }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
