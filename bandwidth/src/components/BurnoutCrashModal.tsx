interface Props {
  onDismiss: () => void;
}

export function BurnoutCrashModal({ onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-red-900 rounded-lg p-8 max-w-sm w-full shadow-2xl">
        <div className="text-3xl mb-4">💀</div>
        <h2 className="text-red-400 font-mono font-bold text-base uppercase tracking-widest mb-3">
          Burnout Crash
        </h2>
        <p className="text-zinc-300 text-sm font-mono leading-relaxed mb-2">
          You pushed too hard and had a complete breakdown. Emergency leave has been filed.
        </p>
        <p className="text-zinc-400 text-xs font-mono mb-6">
          This cycle is forfeited. You return next sprint at <span className="text-red-400 font-semibold">50% Bandwidth</span>.
        </p>
        <button
          onClick={onDismiss}
          className="w-full bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-sm font-mono font-medium py-2.5 px-4 rounded transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          Accept &amp; Continue →
        </button>
      </div>
    </div>
  );
}
