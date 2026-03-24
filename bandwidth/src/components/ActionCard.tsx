import { useEffect, useRef, useState } from 'react';
import type { ActionItem, PlayerStats, DirectReport } from '../types';
import { COMPANY_MODIFIERS } from '../types';
import { useGameStore } from '../store';

interface Props {
  item: ActionItem;
  stats: PlayerStats;
  level: number;
  directReports: DirectReport[];
  onWork: (id: string) => void;
  onGrind: (id: string) => void;
  onRush: (id: string) => void;
  onEscalate: (id: string) => void;
  onCompleteReview: (id: string) => void;
  onUseReviewBuddy: (id: string) => void;
  onAssignJunior: (juniorId: string, taskId: string) => void;
  onUnassignJunior: (juniorId: string) => void;
  onJuniorTick: (taskId: string) => void;
  onClearBlocker: (taskId: string) => void;
}

export function ActionCard({
  item, stats, level, directReports,
  onWork, onGrind, onRush, onEscalate, onCompleteReview, onUseReviewBuddy,
  onAssignJunior, onUnassignJunior, onJuniorTick, onClearBlocker,
}: Props) {
  const { currentCompanyType } = useGameStore();
  const REVIEW_DURATION_SECONDS = COMPANY_MODIFIERS[currentCompanyType].reviewDurationSeconds;
  const isDone = item.status === 'done';
  const isInProgress = item.status === 'in-progress';
  const isInReview = item.status === 'in-review';
  const isTodo = item.status === 'todo';
  const isL5 = level >= 5;

  const baseGrindCost = level === 1 ? 3 : 5;
  const grindCost = stats.inventory?.some((t) => t.type === 'chatgpt-plus')
    ? baseGrindCost - 1
    : baseGrindCost;
  const canGrind = stats.bandwidth >= grindCost && isInProgress;
  const canEscalate = !isDone && !isInReview;
  const showRush = level >= 2;
  const hasReviewBuddy = stats.inventory?.some((t) => t.type === 'review-buddy') ?? false;

  // L5: find which junior (if any) is assigned to this task
  const assignedJunior = directReports.find((j) => j.assignedTaskId === item.id) ?? null;
  const isAssigned = assignedJunior !== null;
  // Available juniors: not assigned to any task
  const availableJuniors = directReports.filter((j) => j.assignedTaskId === null);

  // ── In-Review countdown timer ──────────────────────────────────────────────
  const [reviewTimeLeft, setReviewTimeLeft] = useState<number>(REVIEW_DURATION_SECONDS);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!isInReview || !item.reviewStartedAt) return;

    completedRef.current = false;

    if (REVIEW_DURATION_SECONDS === 0) {
      if (!completedRef.current) {
        completedRef.current = true;
        setTimeout(() => onCompleteReview(item.id), 0);
      }
      return;
    }

    const elapsed = Math.floor((Date.now() - item.reviewStartedAt) / 1000);
    const remaining = Math.max(0, REVIEW_DURATION_SECONDS - elapsed);
    setReviewTimeLeft(remaining);

    if (remaining <= 0) {
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteReview(item.id);
      }
      return;
    }

    const intervalId = setInterval(() => {
      setReviewTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(intervalId);
          if (!completedRef.current) {
            completedRef.current = true;
            onCompleteReview(item.id);
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, item.status, item.reviewStartedAt]);

  // ── L5 Junior automation tick ──────────────────────────────────────────────
  useEffect(() => {
    if (!isL5 || !isInProgress || !isAssigned || item.isBlocked) return;

    const id = setInterval(() => {
      onJuniorTick(item.id);
    }, 2000);

    return () => clearInterval(id);
  }, [isL5, item.id, item.status, item.isBlocked, isAssigned, onJuniorTick]);

  return (
    <div
      className={[
        'rounded border px-4 py-3.5 transition-all duration-200',
        isDone
          ? 'border-zinc-800 bg-zinc-900 opacity-50'
          : isInReview
          ? 'border-amber-800 bg-zinc-900'
          : isInProgress
          ? 'border-blue-800 bg-zinc-900'
          : 'border-zinc-700 hover:border-zinc-500 hover:shadow-md transition-shadow',
      ].join(' ')}
      style={{
        backgroundColor: isDone
          ? undefined
          : isInReview
          ? '#1c1409'
          : isInProgress
          ? '#0f1629'
          : '#1e1e21',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3
          className={`text-sm leading-snug font-medium font-mono flex-1 line-clamp-2 ${
            isDone ? 'line-through text-zinc-500' : 'text-zinc-200'
          }`}
        >
          {item.title}
        </h3>
        {isDone && (
          <span className="flex-shrink-0 text-xs text-green-600 font-mono mt-0.5">DONE</span>
        )}
        {isInProgress && !item.isBlocked && (
          <span className="flex-shrink-0 text-xs text-blue-300 font-mono mt-0.5">IN PROGRESS</span>
        )}
        {isInProgress && item.isBlocked && (
          <span className="flex-shrink-0 text-xs text-red-400 font-mono mt-0.5" data-testid={`blocked-badge-${item.id}`}>🚧 BLOCKED</span>
        )}
        {isInReview && (
          <span className="flex-shrink-0 text-xs text-amber-300 font-mono mt-0.5">IN REVIEW</span>
        )}
      </div>

      {/* Progress bar — only for in-progress cards */}
      {isInProgress && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-300 font-mono">progress</span>
            <span className="text-xs text-blue-400 font-mono tabular-nums">{item.progress} / 100</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* In-Review countdown */}
      {isInReview && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-300 font-mono">awaiting review</span>
            <span className="text-xs text-amber-400 font-mono tabular-nums">
              {reviewTimeLeft}s
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${(reviewTimeLeft / REVIEW_DURATION_SECONDS) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Metadata row */}
      {!isDone && !isInReview && (
        <div className="flex items-center gap-3 mb-3 text-xs font-mono flex-wrap">
          {isTodo && (
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-zinc-400">complexity</span>
              <span className="text-zinc-300 tabular-nums font-semibold">{item.cost}</span>
              <span className="text-zinc-500">pts</span>
            </div>
          )}
          {isInProgress && !isL5 && (
            <div className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-zinc-300">grind cost</span>
              <span className={`tabular-nums font-semibold ${!canGrind ? 'text-red-400' : 'text-blue-400'}`}>{grindCost}</span>
              <span className="text-zinc-500">BW/click</span>
            </div>
          )}
          <span className="text-zinc-800">·</span>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="text-zinc-400">reward</span>
            <span className="text-amber-400 tabular-nums font-semibold">{item.reward}</span>
            <span className="text-zinc-500">XP</span>
          </div>
          {item.debtRisk > 0 && showRush && (
            <>
              <span className="text-zinc-800">·</span>
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="text-zinc-600">rush risk</span>
                <span className="text-orange-500 tabular-nums">+{item.debtRisk}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* In-review reward preview */}
      {isInReview && (
        <div className="flex items-center gap-2 mb-3 text-xs font-mono text-zinc-600">
          <span className="text-amber-700">+{item.reward} XP</span>
          <span>·</span>
          <span>auto-completes in {reviewTimeLeft}s</span>
        </div>
      )}

      {/* Actions */}
      {!isDone && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* ── L5 Todo: junior assignment dropdown ── */}
          {isL5 && isTodo && (
            <select
              data-testid={`junior-select-${item.id}`}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) onAssignJunior(e.target.value, item.id);
              }}
              className="text-xs px-3 py-1.5 rounded border border-blue-700 bg-blue-950 text-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono cursor-pointer"
            >
              <option value="" disabled>Assign Junior →</option>
              {availableJuniors.map((j) => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          )}

          {/* ── L5 In-Progress: blocked state ── */}
          {isL5 && isInProgress && item.isBlocked && (
            <button
              data-testid={`clear-blocker-btn-${item.id}`}
              onClick={() => onClearBlocker(item.id)}
              className="text-xs px-3 py-1.5 rounded border border-red-800 bg-red-950 text-red-300 hover:bg-red-900 hover:border-red-700 font-mono transition-colors cursor-pointer"
            >
              Clear Blocker [-10 BW]
            </button>
          )}

          {/* ── L5 In-Progress: junior working ── */}
          {isL5 && isInProgress && !item.isBlocked && assignedJunior && (
            <>
              <span className="text-xs text-zinc-400 font-mono">👤 {assignedJunior.name} working...</span>
              <button
                data-testid={`unassign-btn-${item.id}`}
                onClick={() => onUnassignJunior(assignedJunior.id)}
                className="text-xs px-3 py-1.5 rounded border border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-mono transition-colors cursor-pointer"
              >
                Unassign
              </button>
            </>
          )}

          {/* ── Non-L5 Todo ── */}
          {!isL5 && isTodo && (
            <button
              onClick={() => onWork(item.id)}
              aria-label={`Start work on: ${item.title}`}
              className="text-xs px-3 py-1.5 rounded border border-blue-700 bg-blue-950 text-blue-300 hover:bg-blue-900 hover:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono transition-colors cursor-pointer"
            >
              Work →
            </button>
          )}

          {/* ── Non-L5 Grind ── */}
          {!isL5 && isInProgress && (
            <button
              onClick={() => onGrind(item.id)}
              disabled={!canGrind}
              data-testid={`grind-btn-${item.id}`}
              className={[
                'text-xs px-3 py-1.5 rounded border font-mono transition-colors cursor-pointer',
                canGrind
                  ? 'border-blue-700 bg-blue-950 text-blue-300 hover:bg-blue-900 hover:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-700 cursor-not-allowed',
              ].join(' ')}
            >
              Grind [-{grindCost} BW]
            </button>
          )}

          {isInReview && hasReviewBuddy && (
            <button
              onClick={() => onUseReviewBuddy(item.id)}
              className="text-xs px-3 py-1.5 rounded border border-purple-800 bg-purple-950 text-purple-300 hover:bg-purple-900 hover:border-purple-700 font-mono transition-colors cursor-pointer"
            >
              🤝 Review Buddy
            </button>
          )}

          {showRush && !isInReview && (
            <button
              onClick={() => onRush(item.id)}
              className="text-xs px-3 py-1.5 rounded border border-orange-900 bg-orange-950 text-orange-400 hover:bg-orange-900 hover:border-orange-700 focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono transition-colors cursor-pointer"
            >
              Rush [+{item.debtRisk}D]
            </button>
          )}

          {canEscalate && (
            <button
              onClick={() => onEscalate(item.id)}
              aria-label={`Escalate task: ${item.title} (costs -15 Autonomy, -15 Manager rep)`}
              className="text-xs px-3 py-1.5 rounded border border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-500 focus:ring-2 focus:ring-zinc-400 focus:outline-none font-mono transition-colors cursor-pointer whitespace-nowrap"
            >
              Escalate [-15A/-15M]
            </button>
          )}
        </div>
      )}
    </div>
  );
}
