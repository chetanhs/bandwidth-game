import type { ActionItem, CareerTrack, Level } from '../types';

// ─── Engineering Track ─────────────────────────────────────────────────────

const ENGINEERING_L1: Omit<ActionItem, 'id' | 'status' | 'progress'>[] = [
  { title: 'Fix docs typo on public README', cost: 3, reward: 5, debtRisk: 0 },
  { title: 'Review and merge a teammate\'s PR', cost: 5, reward: 10, debtRisk: 0 },
  { title: 'Add loading skeleton to dashboard page', cost: 7, reward: 12, debtRisk: 5 },
  { title: 'Write unit tests for auth service', cost: 10, reward: 20, debtRisk: 10 },
  { title: 'Set up local dev environment for new service', cost: 10, reward: 15, debtRisk: 5 },
  { title: 'Patch CVE-2024-0001 in dependency', cost: 8, reward: 20, debtRisk: 15 },
  { title: 'Add pagination to /api/users endpoint', cost: 10, reward: 18, debtRisk: 8 },
  { title: 'Refactor duplicated API call logic', cost: 12, reward: 22, debtRisk: 10 },
  { title: 'Investigate Sentry alert: null pointer in prod', cost: 12, reward: 25, debtRisk: 12 },
  { title: 'Resolve TypeScript errors in legacy module', cost: 15, reward: 25, debtRisk: 20 },
];

const ENGINEERING_L2: Omit<ActionItem, 'id' | 'status' | 'progress'>[] = [
  { title: 'Build 10 internal utility tools over the weekend', cost: 50, reward: 60, debtRisk: 40 },
  { title: 'Refactor core schema: users → accounts migration', cost: 45, reward: 55, debtRisk: 50 },
  { title: 'Implement distributed tracing across 3 services', cost: 40, reward: 50, debtRisk: 30 },
  { title: 'Lead incident response for P0 outage', cost: 35, reward: 45, debtRisk: 20 },
  { title: 'Architect new event-driven notification system', cost: 50, reward: 65, debtRisk: 35 },
  { title: 'Write RFC for API versioning strategy', cost: 30, reward: 35, debtRisk: 0 },
  { title: 'Reduce CI pipeline from 18min → 6min', cost: 40, reward: 45, debtRisk: 25 },
  { title: 'Mentor new hire through onboarding project', cost: 20, reward: 30, debtRisk: 0 },
  { title: 'Ship feature flag system to unblock product team', cost: 45, reward: 55, debtRisk: 30 },
  { title: 'Audit and clean up 200+ stale feature flags', cost: 30, reward: 35, debtRisk: 10 },
  { title: 'Implement zero-downtime deployment strategy', cost: 50, reward: 60, debtRisk: 40 },
  { title: 'Set up SLO/SLA dashboards for all critical paths', cost: 35, reward: 40, debtRisk: 15 },
];

// ─── Generator ────────────────────────────────────────────────────────────

function shuffleSlice<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

let idCounter = 0;
function genId(): string {
  return `task-${++idCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateActionItems(
  level: Level,
  _track: CareerTrack,
  _cycle: number
): ActionItem[] {
  // Only engineering is enabled for now
  const pool = level === 1 ? ENGINEERING_L1 : ENGINEERING_L2;
  const count = level === 1 ? 4 : 5;
  const selected = shuffleSlice(pool, count);
  return selected.map((item) => ({
    ...item,
    id: genId(),
    status: 'todo' as const,
    progress: 0,
  }));
}
