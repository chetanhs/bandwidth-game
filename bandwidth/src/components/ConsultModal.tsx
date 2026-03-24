interface Props {
  onFree: () => void;
  onPremium: () => void;
  onClose: () => void;
}

export function ConsultModal({ onFree, onPremium, onClose }: Props) {
  const handlePremium = () => {
    // Task 1.1: In-game cost of $3,000 — deducted from Net Worth via premiumConsult action
    onPremium();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-xl mx-4 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-widest font-mono mb-0.5">Action</p>
            <h2 className="text-sm font-semibold text-zinc-100 font-mono">Senior Consult</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-300 font-mono text-sm cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Two options */}
        <div className="grid grid-cols-2 divide-x divide-zinc-800">
          {/* Free Tier */}
          <div className="p-6 flex flex-col gap-4">
            <div>
              <p className="text-xs text-zinc-300 uppercase tracking-widest font-mono mb-2">Free Tier</p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Ping a senior teammate on Slack. They help, but the manager notices.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs font-mono">
              <span className="text-blue-400">+20 Bandwidth</span>
              <span className="text-orange-400">−10 Autonomy</span>
              <span className="text-orange-400">−5 Manager's Good Books</span>
            </div>
            <button
              onClick={onFree}
              className="mt-auto text-xs px-4 py-2 rounded border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 font-mono transition-colors cursor-pointer"
            >
              Take Free Consult →
            </button>
          </div>

          {/* Premium */}
          <div className="p-6 flex flex-col gap-4" style={{ backgroundColor: '#16130a' }}>
            <div>
              <p className="text-xs text-amber-400 uppercase tracking-widest font-mono mb-2">Staff Engineer · $3,000</p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                A seasoned Staff Eng pair-programs with you for an hour. Full focus, no awkward dynamics.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs font-mono">
              <span className="text-emerald-300">Instantly completes oldest in-progress task</span>
              <span className="text-orange-400">−$3,000 Net Worth</span>
            </div>
            <button
              data-testid="premium-consult-btn"
              onClick={handlePremium}
              className="mt-auto text-xs px-4 py-2 rounded border border-amber-700 bg-amber-950 text-amber-300 hover:bg-amber-900 hover:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono transition-colors cursor-pointer"
            >
              Hire Staff Eng [$3,000] →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
