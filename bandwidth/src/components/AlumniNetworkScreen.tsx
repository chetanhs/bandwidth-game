import { useGameStore } from '../store';
import { ALUMNI_UPGRADES, type AlumniUpgradeId } from '../types';

export function AlumniNetworkScreen() {
  const { careerNetWorth, alumniUpgrades, buyAlumniUpgrade, goToJobBoard } = useGameStore();

  const upgradeList: AlumniUpgradeId[] = ['ivy-league', 'teflon', 'golden-parachute'];

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-mono text-zinc-300 uppercase tracking-widest mb-2">Meta-Progression</p>
          <h1 className="text-lg font-semibold text-zinc-100 font-mono mb-2">Alumni Network</h1>
          <p className="text-sm text-zinc-300 font-mono">
            Invest your career earnings into permanent advantages that carry across every job.
          </p>
        </div>

        {/* Career Net Worth */}
        <div
          data-testid="career-net-worth"
          className="mb-6 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded font-mono text-xs text-zinc-300 flex items-center justify-between"
        >
          <span>Career Net Worth</span>
          <span className="text-amber-400 tabular-nums font-semibold">
            ${careerNetWorth.toLocaleString('en-US')}
          </span>
        </div>

        {/* Upgrade Cards */}
        <div className="flex flex-col gap-4 mb-8">
          {upgradeList.map((id) => {
            const upgrade = ALUMNI_UPGRADES[id];
            const owned = alumniUpgrades.includes(id);
            const canAfford = careerNetWorth >= upgrade.cost;

            return (
              <div
                key={id}
                data-testid={`alumni-upgrade-${id}`}
                className={[
                  'flex items-center justify-between px-5 py-4 rounded border',
                  owned
                    ? 'border-green-800 bg-green-950'
                    : 'border-zinc-700 bg-zinc-900',
                ].join(' ')}
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-200 font-mono">{upgrade.name}</p>
                  <p className="text-xs text-zinc-300 font-mono mt-0.5">{upgrade.description}</p>
                  <p className="text-xs text-amber-400 font-mono mt-1">
                    Cost: ${upgrade.cost.toLocaleString('en-US')}
                  </p>
                </div>
                {owned ? (
                  <span className="text-xs text-green-400 font-mono ml-4">✓ Owned</span>
                ) : (
                  <button
                    data-testid={`buy-alumni-upgrade-${id}`}
                    onClick={() => buyAlumniUpgrade(id)}
                    disabled={!canAfford}
                    className={[
                      'ml-4 text-xs px-4 py-2 rounded border font-mono transition-colors',
                      canAfford
                        ? 'border-amber-700 bg-amber-950 text-amber-300 hover:bg-amber-900 focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-600 cursor-not-allowed',
                    ].join(' ')}
                  >
                    Buy
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Back to Job Board */}
        <div className="text-center">
          <button
            data-testid="back-to-job-board"
            onClick={goToJobBoard}
            className="text-xs px-6 py-2.5 rounded border border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 focus:ring-2 focus:ring-zinc-400 focus:outline-none font-mono transition-colors cursor-pointer"
          >
            ← Back to Job Board
          </button>
        </div>
      </div>
    </div>
  );
}
