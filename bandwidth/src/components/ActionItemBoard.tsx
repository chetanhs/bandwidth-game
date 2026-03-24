import type { ActionItem, PlayerStats, DirectReport } from '../types';
import { ActionCard } from './ActionCard';

interface Props {
  items: ActionItem[];
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

type ColumnId = ActionItem['status'];

const COLUMNS: { id: ColumnId; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'in-review', label: 'In Review' },
  { id: 'done', label: 'Done' },
];

export function ActionItemBoard({
  items, stats, level, directReports,
  onWork, onGrind, onRush, onEscalate, onCompleteReview, onUseReviewBuddy,
  onAssignJunior, onUnassignJunior, onJuniorTick, onClearBlocker,
}: Props) {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Board header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-zinc-300 font-mono">Sprint Board</h2>
          <span className="text-xs text-zinc-500 font-mono tabular-nums">
            {items.filter((i) => i.status === 'done').length}/{items.length} completed
          </span>
        </div>
        {items.length > 0 && (
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-600 transition-all duration-500"
              style={{ width: `${(items.filter((i) => i.status === 'done').length / items.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Kanban columns */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        {COLUMNS.map((col, ci) => {
          const colItems = items.filter((i) => i.status === col.id);

          return (
            <div
              key={col.id}
              className={[
                'flex flex-col min-w-0 flex-1 border-zinc-800 overflow-hidden',
                ci < COLUMNS.length - 1 ? 'border-r' : '',
              ].join(' ')}
            >
              {/* Column header */}
              <div className="px-4 py-3 border-b border-zinc-800 flex-shrink-0 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-zinc-200 font-mono">
                  {col.label}
                </span>
                <span className="text-xs text-zinc-500 font-mono tabular-nums">
                  {colItems.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {colItems.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-xs text-zinc-400 font-mono border border-dashed border-zinc-700 rounded italic">
                    empty
                  </div>
                ) : (
                  colItems.map((item) => (
                    <ActionCard
                      key={item.id}
                      item={item}
                      stats={stats}
                      level={level}
                      directReports={directReports}
                      onWork={onWork}
                      onGrind={onGrind}
                      onRush={onRush}
                      onEscalate={onEscalate}
                      onCompleteReview={onCompleteReview}
                      onUseReviewBuddy={onUseReviewBuddy}
                      onAssignJunior={onAssignJunior}
                      onUnassignJunior={onUnassignJunior}
                      onJuniorTick={onJuniorTick}
                      onClearBlocker={onClearBlocker}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
