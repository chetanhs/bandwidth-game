import { useGameStore } from '../store';
import { COMPANY_MODIFIERS } from '../types';

export function JobBoard() {
  const { joinCompany, openAlumniNetwork } = useGameStore();

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">Meta-Progression</p>
          <h1 className="text-lg font-semibold text-zinc-100 font-mono mb-2">The Job Board</h1>
          <p className="text-sm text-zinc-400 font-mono">
            Time to land somewhere new. XP resets at each new company — build your net worth instead.
          </p>
        </div>

        {/* Notice */}
        <div className="mb-6 px-4 py-3 bg-zinc-800/60 border border-zinc-700 rounded font-mono text-xs text-center text-zinc-400">
          Joining a new company resets your Level XP to 0. Net Worth carries over.
        </div>

        {/* Company Cards */}
        <div className="grid grid-cols-3 gap-4 items-stretch">
          {/* Crappy Startup */}
          <div className="flex flex-col border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900 min-h-[380px]">
            <div className="px-5 py-4 border-b border-zinc-700">
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest mb-1">Tier 1</p>
              <h2 className="text-sm font-semibold text-zinc-200 font-mono">Crappy Startup</h2>
              <p className="text-xs text-zinc-300 font-mono mt-0.5">Free</p>
            </div>
            <div className="px-5 py-4 flex-1 flex flex-col gap-3">
              <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                Scrappy Startup Inc. Equity TBD. Free snacks. The CEO will Slack you at midnight.
              </p>
              <div className="flex flex-col gap-1.5 text-xs font-mono">
                <span className="text-amber-500 font-semibold">⚡ {COMPANY_MODIFIERS.startup.modifier}</span>
                <span className="text-blue-400">Max BW: {COMPANY_MODIFIERS.startup.maxBandwidth}</span>
                <span className="text-green-500">PR Review Time: Instant</span>
                <span className="text-zinc-300">Start at L3 Engineer</span>
              </div>
              <button
                onClick={() => joinCompany('startup')}
                className="mt-auto text-xs px-4 py-2.5 rounded border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 font-mono font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                data-testid="job-startup"
              >
                Join — Free →
              </button>
            </div>
          </div>

          {/* Mid-Tier Corp */}
          <div className="flex flex-col border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900 min-h-[380px]">
            <div className="px-5 py-4 border-b border-zinc-700">
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest mb-1">Tier 2</p>
              <h2 className="text-sm font-semibold text-zinc-200 font-mono">Mid-Tier Corp</h2>
              <p className="text-xs text-zinc-300 font-mono mt-0.5">Free</p>
            </div>
            <div className="px-5 py-4 flex-1 flex flex-col gap-3">
              <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                NovaTech Corp. Decent benefits. Annual "culture hackathons". Mandatory personality alignment training.
              </p>
              <div className="flex flex-col gap-1.5 text-xs font-mono">
                <span className="text-amber-500 font-semibold">⚡ {COMPANY_MODIFIERS.corp.modifier}</span>
                <span className="text-blue-400">Max BW: {COMPANY_MODIFIERS.corp.maxBandwidth}</span>
                <span className="text-yellow-400">PR Review Time: {COMPANY_MODIFIERS.corp.reviewDurationSeconds}s</span>
                <span className="text-zinc-300">Start at L3 Engineer</span>
              </div>
              <button
                onClick={() => joinCompany('corp')}
                className="mt-auto text-xs px-4 py-2.5 rounded border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 font-mono font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                data-testid="job-mid"
              >
                Join — Free →
              </button>
            </div>
          </div>

          {/* FAANG */}
          <div className="flex flex-col border border-blue-900 rounded-lg overflow-hidden min-h-[380px]" style={{ backgroundColor: '#0c111e' }}>
            <div className="px-5 py-4 border-b border-blue-900">
              <p className="text-xs text-blue-500 font-mono uppercase tracking-widest mb-1">Tier 3</p>
              <h2 className="text-sm font-semibold text-blue-200 font-mono">FAANG</h2>
              <p className="text-xs text-blue-400 font-mono mt-0.5">Free</p>
            </div>
            <div className="px-5 py-4 flex-1 flex flex-col gap-3">
              <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                Faangla Inc. Massive TC. 400-page system design docs. Three rounds of shadow reviews per PR.
              </p>
              <div className="flex flex-col gap-1.5 text-xs font-mono">
                <span className="text-yellow-300 font-bold">⚠ {COMPANY_MODIFIERS.faang.modifier}</span>
                <span className="text-blue-400">Max BW: {COMPANY_MODIFIERS.faang.maxBandwidth}</span>
                <span className="text-red-400">PR Review Time: {COMPANY_MODIFIERS.faang.reviewDurationSeconds}s (slow!)</span>
                <span className="text-red-400 whitespace-nowrap">Meetings: 2× more frequent</span>
                <span className="text-blue-300">Start at L4 Engineer</span>
              </div>
              <button
                onClick={() => joinCompany('faang')}
                className="mt-auto text-xs px-4 py-2.5 rounded border border-blue-700 bg-blue-950 text-blue-300 hover:bg-blue-900 hover:border-blue-600 font-mono font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                data-testid="job-faang"
              >
                Join — Free →
              </button>
            </div>
          </div>

        </div>

        {/* Alumni Network */}
        <div className="mt-6 text-center">
          <button
            data-testid="open-alumni-network"
            onClick={openAlumniNetwork}
            className="text-sm px-8 py-3 rounded border border-purple-800 bg-purple-950 text-purple-300 hover:bg-purple-900 hover:border-purple-700 font-mono font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            🎓 Alumni Network →
          </button>
        </div>
      </div>
    </div>
  );
}
