import { useState } from 'react';
import type { PlayerStats, Level } from '../types';
import { LEVEL_CONFIGS } from '../types';
import { useGameStore } from '../store';

interface Props {
  stats: PlayerStats;
  level: Level;
  onResult: (passed: boolean) => void;
  tasksCompletedThisLevel: number;
  totalTaskCostThisLevel: number;
}

type DialogueLine = { speaker: 'manager' | 'player'; text: string };

function buildManagerDialogue(
  stats: PlayerStats,
  level: Level,
  tasksCompleted: number,
  totalTaskCost: number,
): string {
  const config = LEVEL_CONFIGS[level];
  const xpPassed = stats.levelXP >= config.impactGoal;
  const mgbPassed = stats.managerGoodBooks > 40;
  const volumePassed = tasksCompleted >= config.reviewGates.minTasksCompleted;
  const avgCost = tasksCompleted > 0 ? totalTaskCost / tasksCompleted : 0;
  const complexityPassed = avgCost >= config.reviewGates.minAvgTaskCost;

  if (!volumePassed) {
    return `Impact numbers are fine, but you only closed out ${tasksCompleted} task${tasksCompleted === 1 ? '' : 's'} this cycle. Volume matters. I need to see you shipping, not just grinding one thing.`;
  }
  if (!complexityPassed) {
    return `You completed tasks, but nothing that moved the needle. I need to see you taking on harder problems — the average complexity of your work was too low for this level.`;
  }
  if (!xpPassed) {
    return `I appreciate the effort this cycle. Let's talk about where you landed. Impact is the primary metric, and honestly — it's not where it needs to be for a promotion discussion right now.`;
  }
  if (!mgbPassed) {
    return `You hit your impact numbers, I'll give you that. But there are concerns beyond the metrics. Our working relationship has been strained this cycle, and leadership reputation matters for promotion decisions. I can't recommend you right now.`;
  }
  if (stats.debt > 60) {
    return `Strong cycle — you hit your impact target and maintained good standing. I do want to flag the tech debt situation; keep that under control. But overall, the committee agreed. Congratulations.`;
  }
  return `Strong cycle. You hit your impact target, closed meaningful work, kept good standing with the team, and showed real ownership. This is exactly what we're looking for at the next level. Congratulations.`;
}

function buildPassResult(
  stats: PlayerStats,
  level: Level,
  tasksCompleted: number,
  totalTaskCost: number,
): boolean {
  const config = LEVEL_CONFIGS[level];
  const xpOk = stats.levelXP >= config.impactGoal;
  const volumeOk = tasksCompleted >= config.reviewGates.minTasksCompleted;
  const avgCost = tasksCompleted > 0 ? totalTaskCost / tasksCompleted : 0;
  const complexityOk = avgCost >= config.reviewGates.minAvgTaskCost;
  return xpOk && volumeOk && complexityOk;
}

function getWorstStat(
  stats: PlayerStats,
  level: Level,
  tasksCompleted: number,
  totalTaskCost: number,
): string {
  const config = LEVEL_CONFIGS[level];
  const avgCost = tasksCompleted > 0 ? totalTaskCost / tasksCompleted : 0;
  const issues: { stat: string; severity: number }[] = [
    { stat: 'Tasks Completed', severity: tasksCompleted < config.reviewGates.minTasksCompleted ? (config.reviewGates.minTasksCompleted - tasksCompleted) * 10 : 0 },
    { stat: 'Task Complexity', severity: avgCost < config.reviewGates.minAvgTaskCost ? (config.reviewGates.minAvgTaskCost - avgCost) : 0 },
    { stat: 'Impact', severity: stats.levelXP < config.impactGoal ? (config.impactGoal - stats.levelXP) : 0 },
    { stat: 'Autonomy', severity: stats.autonomy < 60 ? (60 - stats.autonomy) : 0 },
    { stat: 'Project Debt', severity: stats.debt > 40 ? stats.debt - 40 : 0 },
  ];
  const worst = issues.reduce((a, b) => (a.severity > b.severity ? a : b));
  return worst.severity > 0 ? worst.stat : '';
}

export function PerformanceReview({ stats, level, onResult, tasksCompletedThisLevel, totalTaskCostThisLevel }: Props) {
  const config = LEVEL_CONFIGS[level];
  const { takeSeverance } = useGameStore();
  const passed = buildPassResult(stats, level, tasksCompletedThisLevel, totalTaskCostThisLevel);
  const managerText = buildManagerDialogue(stats, level, tasksCompletedThisLevel, totalTaskCostThisLevel);
  const worstStat = getWorstStat(stats, level, tasksCompletedThisLevel, totalTaskCostThisLevel);

  const handleSeverance = () => {
    takeSeverance();
  };

  const [phase, setPhase] = useState<'reading' | 'responded'>('reading');

  const PLAYER_RESPONSES: DialogueLine[] = passed
    ? [
        { speaker: 'player', text: `"Thank you — I'm ready for the challenge."` },
        { speaker: 'manager', text: `Good. HR will reach out about the title change. Congrats, ${config.nextLabel}.` },
      ]
    : [
        { speaker: 'player', text: `"I understand. I'll focus on ${worstStat || 'the gaps'} next cycle."` },
        { speaker: 'manager', text: `I appreciate that. We'll set up a 30-day PIP. The door isn't closed — but we need to see real improvement.` },
      ];

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            {config.label} → Annual Performance Review
          </span>
        </div>

        {/* Main review card */}
        <div className="border border-zinc-700 rounded-lg overflow-hidden">

          {/* Stats summary bar */}
          <div className="grid grid-cols-6 border-b border-zinc-700">
            {[
              { label: 'Impact', value: `${stats.levelXP} / ${config.impactGoal}`, ok: stats.levelXP >= config.impactGoal },
              { label: 'Autonomy', value: `${stats.autonomy}%`, ok: stats.autonomy >= 60 },
              { label: 'Project Debt', value: `${stats.debt}%`, ok: stats.debt < 50 },
              { label: 'Burnout', value: `${stats.burnout}%`, ok: stats.burnout < 80 },
              {
                label: 'Tasks Done',
                value: `${tasksCompletedThisLevel} / ${config.reviewGates.minTasksCompleted}`,
                ok: tasksCompletedThisLevel >= config.reviewGates.minTasksCompleted,
              },
              {
                label: 'Avg Complexity',
                value: tasksCompletedThisLevel > 0
                  ? `${Math.round(totalTaskCostThisLevel / tasksCompletedThisLevel)} / ${config.reviewGates.minAvgTaskCost}`
                  : `0 / ${config.reviewGates.minAvgTaskCost}`,
                ok: tasksCompletedThisLevel > 0 && (totalTaskCostThisLevel / tasksCompletedThisLevel) >= config.reviewGates.minAvgTaskCost,
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`px-5 py-4 ${i < 5 ? 'border-r border-zinc-700' : ''}`}
              >
                <p className="text-xs text-zinc-300 font-mono uppercase tracking-widest mb-1">{s.label}</p>
                <p className={`text-lg font-mono tabular-nums font-semibold ${s.ok ? 'text-zinc-200' : 'text-red-400'}`}>
                  {s.value}
                </p>
                <p className={`text-xs font-mono mt-0.5 ${s.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {s.ok ? '✓ pass' : '✗ fail'}
                </p>
              </div>
            ))}
          </div>

          {/* Dialogue area */}
          <div className="flex min-h-72">
            {/* Manager portrait */}
            <div className="w-48 flex-shrink-0 border-r border-zinc-700 flex flex-col items-center justify-center p-6 gap-3"
              style={{ backgroundColor: '#1a1a1d' }}>
              <div className="w-16 h-16 rounded-full border-2 border-zinc-600 bg-zinc-700 flex items-center justify-center text-2xl">
                🧑‍💼
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-300 font-medium">Alex Chen</p>
                <p className="text-xs text-zinc-400 font-mono">Engineering Manager</p>
              </div>
              <div className={`mt-2 px-2 py-1 rounded text-xs font-mono border ${
                passed
                  ? 'border-green-800 bg-green-950 text-green-400'
                  : 'border-red-900 bg-red-950 text-red-400'
              }`}>
                {passed ? 'PROMOTED' : 'PIP'}
              </div>
            </div>

            {/* Dialogue content */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="flex-1">
                {/* Manager line */}
                <div className="mb-6">
                  <p className="text-xs text-zinc-200 font-mono font-semibold uppercase tracking-widest mb-2">Manager</p>
                  <p className="text-sm text-zinc-300 leading-relaxed pr-6">{managerText}</p>
                </div>

                {/* Player response */}
                {phase === 'responded' && (
                  <div className="mb-4 animate-fade-in-up">
                    {PLAYER_RESPONSES.map((line, i) => (
                      <div key={i} className="mb-3">
                        <p className="text-xs text-zinc-200 font-mono font-semibold uppercase tracking-widest mb-1">
                          {line.speaker === 'player' ? 'You' : 'Manager'}
                        </p>
                        <p className={`text-sm leading-relaxed ${
                          line.speaker === 'player' ? 'text-zinc-300 italic' : 'text-zinc-300'
                        }`}>
                          {line.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {phase === 'reading' ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setPhase('responded')}
                    className="text-xs px-4 py-2 rounded border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 font-mono transition-all duration-200 cursor-pointer"
                  >
                    {passed ? '"Thank you. I\'m ready." →' : '"I understand the feedback." →'}
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => onResult(passed)}
                    className={[
                      'text-xs px-5 py-2.5 rounded border font-mono font-medium transition-colors cursor-pointer',
                      passed
                        ? 'border-green-700 bg-green-900 text-green-300 hover:bg-green-800 focus:ring-2 focus:ring-green-500 focus:outline-none'
                        : 'border-red-900 bg-red-950 text-red-300 hover:bg-red-900 focus:ring-2 focus:ring-red-500 focus:outline-none',
                    ].join(' ')}
                  >
                    {passed ? `→ Start as ${config.nextLabel}` : '→ Accept PIP'}
                  </button>
                  {!passed && (
                    <button
                      onClick={handleSeverance}
                      className="text-xs px-5 py-2.5 rounded border border-amber-800 bg-amber-950 text-amber-300 hover:bg-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono font-medium transition-colors cursor-pointer"
                    >
                      → Take Severance [Net Worth: -10%]
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
