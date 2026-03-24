import type { PendingTutorial } from '../types';

interface Props {
  tutorial: PendingTutorial;
  onDismiss: () => void;
}

const CONTENT: Record<PendingTutorial, { title: string; body: string; emoji: string }> = {
  welcome: {
    emoji: '👋',
    title: 'Welcome to the Grind',
    body: 'Your goal is to reach the Impact target before your last sprint ends. Each action costs Bandwidth — your limited action points per cycle. Manage them carefully or you burn out.',
  },
  grind: {
    emoji: '⚙',
    title: 'The Grind',
    body: 'Click "Grind" repeatedly to make progress on this task. Each grind costs 5 Bandwidth and adds 25% progress. At 100%, the task auto-completes and awards Impact XP.',
  },
  risks: {
    emoji: '⚠',
    title: 'Know Your Options',
    body: '"Drink Coffee" restores 25 Bandwidth but adds 15 Burnout — crash at 100%. "Escalate" lets your manager close a task, but permanently costs 10 Autonomy. Both have lasting consequences.',
  },
  debt: {
    emoji: '📦',
    title: 'Project Debt',
    body: '"Ship it Dirty" rushes tasks instantly but accrues Project Debt. High Debt will hurt your Performance Review score. Rush sparingly — it compounds.',
  },
};

export function TutorialOverlay({ tutorial, onDismiss }: Props) {
  const { emoji, title, body } = CONTENT[tutorial];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8 max-w-sm w-full shadow-2xl">
        <div className="text-3xl mb-4">{emoji}</div>
        <h2 className="text-zinc-100 font-mono font-bold text-base uppercase tracking-widest mb-3">
          {title}
        </h2>
        <p className="text-zinc-400 text-sm font-mono leading-relaxed mb-6">{body}</p>
        <button
          onClick={onDismiss}
          className="w-full bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm font-mono font-medium py-2.5 px-4 rounded transition-colors"
        >
          Understood →
        </button>
      </div>
    </div>
  );
}
