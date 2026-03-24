// ─── Color palette ────────────────────────────────────────────────────────────
const T = 'transparent';
const K = '#18181b'; // dark outline
const S = '#fbbf24'; // skin (warm amber)
const H = '#92400e'; // hair (dark brown)
const E = '#1e3a8a'; // eye pupil (deep blue)
const W = '#bfdbfe'; // sweat drop / whites
const M = '#dc2626'; // mouth / accent red
const R = '#ef4444'; // angry red skin flush
const G = '#a1a1aa'; // gray (skeleton/neutral)
const D = '#d97706'; // dark skin shadow / bruise
const C = '#6b21a8'; // dark circles / exhaustion
const N = '#737373'; // neutral skin tone
const A = '#fef08a'; // star / trophy gold
const O = '#ea580c'; // warning orange
const L = '#6b7280'; // skull gray

// ─── Player Faces (12×12) ─────────────────────────────────────────────────────

/** Burnout 0–30 % */
export const PLAYER_HAPPY: string[][] = [
  [T, T, H, H, H, H, H, H, H, H, T, T],
  [T, H, H, S, S, S, S, S, S, H, H, T],
  [H, H, S, S, S, S, S, S, S, S, H, H],
  [K, S, S, E, S, S, S, S, E, S, S, K],
  [K, S, S, E, S, S, S, S, E, S, S, K],
  [K, S, S, S, S, S, S, S, S, S, S, K],
  [K, S, S, S, S, S, S, S, S, S, S, K],
  [K, S, M, S, S, S, S, S, S, M, S, K],
  [K, S, S, M, M, M, M, M, M, S, S, K],
  [K, S, S, S, S, S, S, S, S, S, S, K],
  [T, K, S, S, S, S, S, S, S, S, K, T],
  [T, T, K, K, K, K, K, K, K, K, T, T],
];

/** Burnout 31–70 % */
export const PLAYER_STRESSED: string[][] = [
  [T, T, H, H, H, H, H, H, H, H, T, T],
  [T, H, H, S, S, S, S, S, S, H, H, T],
  [H, H, K, S, S, S, S, S, S, K, H, H],
  [K, S, K, E, S, S, S, S, E, K, S, K],
  [K, S, S, E, S, S, S, S, E, S, W, K],
  [K, S, S, S, S, S, S, S, S, S, W, K],
  [K, S, S, S, S, S, S, S, S, S, S, K],
  [K, S, S, S, M, M, M, M, S, S, S, K],
  [K, S, S, S, S, S, S, S, S, S, S, K],
  [K, S, S, S, S, S, S, S, S, S, S, K],
  [T, K, S, S, S, S, S, S, S, S, K, T],
  [T, T, K, K, K, K, K, K, K, K, T, T],
];

/** Burnout 71–99 % */
export const PLAYER_EXHAUSTED: string[][] = [
  [T, T, H, H, H, H, H, H, H, H, T, T],
  [T, H, H, S, S, S, S, S, S, H, H, T],
  [H, H, S, C, S, S, S, S, C, S, H, H],
  [K, S, C, E, S, S, S, S, E, C, S, K],
  [K, S, K, K, S, S, S, S, K, K, S, K],
  [K, S, S, S, S, S, S, S, S, S, S, K],
  [K, S, S, S, S, S, S, S, S, S, S, K],
  [K, S, S, M, S, S, S, S, M, S, S, K],
  [K, S, S, S, M, M, M, M, S, S, S, K],
  [K, D, D, S, S, S, S, S, S, D, D, K],
  [T, K, S, S, S, S, S, S, S, S, K, T],
  [T, T, K, K, K, K, K, K, K, K, T, T],
];

/** Burnout 100 % (Fired/Skeleton) */
export const PLAYER_SKELETON: string[][] = [
  [T, T, L, L, L, L, L, L, L, L, T, T],
  [T, L, L, G, G, G, G, G, G, L, L, T],
  [L, L, G, G, G, G, G, G, G, G, L, L],
  [K, G, G, K, G, G, G, G, K, G, G, K],
  [K, G, G, K, G, G, G, G, K, G, G, K],
  [K, G, G, G, K, G, G, K, G, G, G, K],
  [K, G, G, G, G, G, G, G, G, G, G, K],
  [K, G, K, G, K, G, G, K, G, K, G, K],
  [K, G, K, G, K, G, G, K, G, K, G, K],
  [K, G, G, G, G, G, G, G, G, G, G, K],
  [T, K, G, G, G, G, G, G, G, G, K, T],
  [T, T, K, K, K, K, K, K, K, K, T, T],
];

// ─── Manager Faces (12×12) ────────────────────────────────────────────────────

/** MGB 80–100 % */
export const MANAGER_SMILING: string[][] = [
  [T, T, K, K, K, K, K, K, K, K, T, T],
  [T, K, K, N, N, N, N, N, N, K, K, T],
  [K, K, N, N, N, N, N, N, N, N, K, K],
  [K, N, N, E, N, N, N, N, E, N, N, K],
  [K, N, N, E, N, N, N, N, E, N, N, K],
  [K, N, N, N, N, N, N, N, N, N, N, K],
  [K, N, N, N, N, N, N, N, N, N, N, K],
  [K, N, M, N, N, N, N, N, N, M, N, K],
  [K, N, N, M, M, M, M, M, M, N, N, K],
  [K, N, N, N, N, N, N, N, N, N, N, K],
  [T, K, N, N, N, N, N, N, N, N, K, T],
  [T, T, K, K, K, K, K, K, K, K, T, T],
];

/** MGB 40–79 % */
export const MANAGER_NEUTRAL: string[][] = [
  [T, T, K, K, K, K, K, K, K, K, T, T],
  [T, K, K, N, N, N, N, N, N, K, K, T],
  [K, K, N, N, N, N, N, N, N, N, K, K],
  [K, N, N, E, N, N, N, N, E, N, N, K],
  [K, N, N, E, N, N, N, N, E, N, N, K],
  [K, N, N, N, N, N, N, N, N, N, N, K],
  [K, N, N, N, N, N, N, N, N, N, N, K],
  [K, N, N, N, N, N, N, N, N, N, N, K],
  [K, N, N, N, M, M, M, M, N, N, N, K],
  [K, N, N, N, N, N, N, N, N, N, N, K],
  [T, K, N, N, N, N, N, N, N, N, K, T],
  [T, T, K, K, K, K, K, K, K, K, T, T],
];

/** MGB 0–39 % */
export const MANAGER_ANGRY: string[][] = [
  [T, T, K, K, K, K, K, K, K, K, T, T],
  [T, K, K, R, R, R, R, R, R, K, K, T],
  [K, K, R, K, R, R, R, R, K, R, K, K],
  [K, R, K, E, R, R, R, R, E, K, R, K],
  [K, R, R, E, R, R, R, R, E, R, R, K],
  [K, R, R, R, R, R, R, R, R, R, R, K],
  [K, R, R, R, R, R, R, R, R, R, R, K],
  [K, R, R, R, R, M, M, R, R, R, R, K],
  [K, R, R, M, M, R, R, M, M, R, R, K],
  [K, R, R, R, R, R, R, R, R, R, R, K],
  [T, K, R, R, R, R, R, R, R, R, K, T],
  [T, T, K, K, K, K, K, K, K, K, T, T],
];

// ─── Item Sprites (12×12) ─────────────────────────────────────────────────────

/** Coffee Cup */
export const SPRITE_COFFEE_CUP: string[][] = [
  [T, T, T, T, T, T, T, T, T, T, T, T],
  [T, T, T, D, T, D, T, T, T, T, T, T],
  [T, T, T, T, D, T, D, T, T, T, T, T],
  [T, K, K, K, K, K, K, K, K, K, T, T],
  [T, K, W, W, W, W, W, W, W, K, K, T],
  [T, K, W, W, W, W, W, W, W, K, W, K],
  [T, K, W, D, D, W, W, W, W, K, W, K],
  [T, K, W, W, W, W, W, W, W, K, K, T],
  [T, K, W, W, W, W, W, W, W, K, T, T],
  [T, T, K, K, K, K, K, K, K, T, T, T],
  [T, K, K, K, K, K, K, K, K, K, T, T],
  [T, T, T, T, T, T, T, T, T, T, T, T],
];

/** Warning Sign */
export const SPRITE_WARNING_SIGN: string[][] = [
  [T, T, T, T, T, A, T, T, T, T, T, T],
  [T, T, T, T, A, K, A, T, T, T, T, T],
  [T, T, T, A, A, K, A, A, T, T, T, T],
  [T, T, A, A, O, K, O, A, A, T, T, T],
  [T, A, A, O, O, K, O, O, A, A, T, T],
  [A, A, O, O, O, K, O, O, O, A, A, T],
  [A, O, O, O, O, K, O, O, O, O, A, T],
  [A, O, O, O, O, K, O, O, O, O, A, T],
  [A, O, O, O, K, K, K, O, O, O, A, T],
  [A, O, O, O, K, K, K, O, O, O, A, T],
  [T, A, O, O, O, O, O, O, O, A, T, T],
  [T, T, A, A, A, A, A, A, A, T, T, T],
];

/** Trophy */
export const SPRITE_TROPHY: string[][] = [
  [T, T, T, T, T, T, T, T, T, T, T, T],
  [T, K, T, T, T, T, T, T, T, T, K, T],
  [T, K, A, A, A, A, A, A, A, A, K, T],
  [K, K, A, A, A, A, A, A, A, A, K, K],
  [K, A, A, A, A, A, A, A, A, A, A, K],
  [K, K, A, A, A, A, A, A, A, A, K, K],
  [T, T, K, A, A, A, A, A, A, K, T, T],
  [T, T, T, K, A, A, A, A, K, T, T, T],
  [T, T, T, T, K, A, A, K, T, T, T, T],
  [T, T, T, K, K, K, K, K, K, T, T, T],
  [T, T, K, A, A, A, A, A, A, K, T, T],
  [T, K, K, K, K, K, K, K, K, K, K, T],
];

// ─── PM Face (12×12) — Standup / Quick Sync ───────────────────────────────────
// Annoying product manager character with a forced grin

const F = '#fde68a'; // PM skin (light sandy yellow)
const J = '#92400e'; // sandy hair
const Y = '#be185d'; // wide grin pink

/** Used in standup / quick-sync chaos events */
export const SPRITE_PM_FACE: string[][] = [
  [T, T, J, J, J, J, J, J, J, J, T, T],
  [T, J, J, F, F, F, F, F, F, J, J, T],
  [J, J, F, F, F, F, F, F, F, F, J, J],
  [K, F, F, E, F, F, F, F, E, F, F, K],
  [K, F, F, E, F, F, F, F, E, F, F, K],
  [K, F, F, F, F, F, F, F, F, F, F, K],
  [K, F, F, F, F, F, F, F, F, F, F, K],
  [K, F, Y, F, F, F, F, F, F, Y, F, K],
  [K, F, F, Y, Y, Y, Y, Y, Y, F, F, K],
  [K, F, F, F, F, F, F, F, F, F, F, K],
  [T, K, F, F, F, F, F, F, F, F, K, T],
  [T, T, K, K, K, K, K, K, K, K, T, T],
];

// ─── ChattyManager Face (16×16) ───────────────────────────────────────────────
// Alex Chen, Engineering Manager — stern expression with glasses & suit collar

const P = '#374151'; // dark suit
const Q = '#f3f4f6'; // white shirt collar
const V = '#e5e7eb'; // glasses frame (light gray)

/** The chatty manager portrait — used in the ChattyManager dialogue component */
export const MANAGER_CHATTY_16: string[][] = [
  [T, T, T, P, P, P, P, P, P, P, P, P, P, T, T, T],
  [T, T, P, N, N, N, N, N, N, N, N, N, N, P, T, T],
  [T, P, N, N, N, N, N, N, N, N, N, N, N, N, P, T],
  [P, N, N, K, K, N, N, N, N, N, N, K, K, N, N, P],  // eyebrows stern/angled
  [K, N, N, V, V, V, N, N, N, V, V, V, N, N, N, K],  // glasses top
  [K, N, N, V, E, V, N, N, N, V, E, V, N, N, N, K],  // eyes (inside glasses)
  [K, N, N, V, V, V, N, K, N, V, V, V, N, N, N, K],  // glasses bottom + nose bridge
  [K, N, N, N, N, N, N, N, N, N, N, N, N, N, N, K],
  [K, N, N, N, N, N, N, N, N, N, N, N, N, N, N, K],
  [K, N, N, N, N, M, N, N, N, N, M, N, N, N, N, K],  // mouth corners (stern)
  [K, N, N, N, N, N, M, M, M, M, N, N, N, N, N, K],  // thin straight mouth
  [K, N, N, N, N, N, N, N, N, N, N, N, N, N, N, K],
  [K, N, N, N, N, N, N, N, N, N, N, N, N, N, N, K],  // chin
  [K, P, P, Q, Q, Q, Q, Q, Q, Q, Q, Q, Q, P, P, K],  // collar/suit
  [T, K, P, P, P, P, P, P, P, P, P, P, P, P, K, T],
  [T, T, K, K, K, K, K, K, K, K, K, K, K, K, T, T],
];

// ─── Item Sprites: Headphones, Consult, Palm Tree ────────────────────────────

const B  = '#60a5fa'; // headphone accent (light blue)
const GN = '#22c55e'; // palm leaf green

/** Noise Canceling Headphones (12×12) */
export const SPRITE_HEADPHONES: string[][] = [
  [T, T, T, T, K, K, K, K, T, T, T, T],
  [T, T, T, K, T, T, T, T, K, T, T, T],
  [T, T, K, T, T, T, T, T, T, K, T, T],
  [T, K, T, T, T, T, T, T, T, T, K, T],
  [K, K, T, T, T, T, T, T, T, T, K, K],
  [K, B, K, T, T, T, T, T, T, K, B, K],
  [K, B, B, K, T, T, T, T, K, B, B, K],
  [K, G, B, K, T, T, T, T, K, B, G, K],
  [K, B, B, K, T, T, T, T, K, B, B, K],
  [K, K, K, K, T, T, T, T, K, K, K, K],
  [T, T, T, T, T, T, T, T, T, T, T, T],
  [T, T, T, T, T, T, T, T, T, T, T, T],
];

/** Consult / Tech Person (12×12) */
export const SPRITE_CONSULT: string[][] = [
  [T, T, T, T, K, K, K, T, T, T, T, T],
  [T, T, T, K, S, S, S, K, T, T, T, T],
  [T, T, T, K, S, E, S, K, T, T, T, T],
  [T, T, T, K, S, S, S, K, T, T, T, T],
  [T, T, T, T, K, K, K, T, T, T, T, T],
  [T, T, T, T, K, T, K, T, T, T, T, T],
  [T, K, K, K, K, K, K, K, K, T, T, T],
  [T, K, N, N, N, N, N, N, K, T, T, T],
  [T, K, N, N, N, N, N, N, K, T, T, T],
  [T, K, N, N, N, N, N, N, K, T, T, T],
  [T, T, K, K, K, T, K, K, K, T, T, T],
  [T, T, T, T, T, T, T, T, T, T, T, T],
];

/** Palm Tree / Vacation (12×12) */
export const SPRITE_PALM_TREE: string[][] = [
  [T,  T,  T,  T,  T,  GN, T,  T,  T,  T,  T,  T],
  [T,  T,  GN, GN, T,  GN, T,  GN, GN, T,  T,  T],
  [T,  GN, GN, GN, GN, GN, GN, GN, GN, GN, T,  T],
  [GN, GN, T,  GN, GN, GN, GN, GN, T,  GN, T,  T],
  [T,  T,  T,  T,  GN, GN, GN, T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  H,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  H,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  K,  H,  K,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  K,  H,  K,  T,  T,  T,  T,  T],
  [T,  T,  T,  K,  K,  H,  K,  K,  T,  T,  T,  T],
  [T,  T,  K,  K,  K,  H,  K,  K,  K,  T,  T,  T],
  [T,  K,  K,  K,  K,  K,  K,  K,  K,  K,  T,  T],
];

// ─── Perk Sprites (12×12) ─────────────────────────────────────────────────────

/** Rubber Duck — yellow duck silhouette (reuses A gold, O orange) */
export const SPRITE_RUBBER_DUCK: string[][] = [
  [T,  T,  T,  T,  A,  A,  A,  T,  T,  T,  T,  T],
  [T,  T,  T,  A,  A,  A,  A,  A,  T,  T,  T,  T],
  [T,  T,  T,  A,  K,  A,  A,  A,  T,  T,  T,  T],
  [T,  T,  T,  A,  A,  A,  A,  A,  T,  T,  T,  T],
  [T,  T,  O,  O,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  A,  A,  A,  A,  A,  A,  A,  A,  T,  T,  T],
  [A,  A,  A,  A,  A,  A,  A,  A,  A,  A,  T,  T],
  [A,  A,  A,  A,  A,  A,  A,  A,  A,  A,  T,  T],
  [A,  A,  A,  A,  A,  A,  A,  A,  A,  T,  T,  T],
  [T,  A,  A,  A,  A,  A,  A,  A,  T,  T,  T,  T],
  [T,  T,  A,  A,  A,  A,  A,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** Blame Shifter — right-pointing arrow (reuses R red) */
export const SPRITE_BLAME_SHIFTER: string[][] = [
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  R,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  R,  R,  R,  T,  T],
  [T,  R,  R,  R,  R,  R,  R,  R,  R,  R,  R,  T],
  [R,  R,  R,  R,  R,  R,  R,  R,  R,  R,  R,  R],
  [T,  R,  R,  R,  R,  R,  R,  R,  R,  R,  R,  T],
  [T,  T,  T,  T,  T,  T,  T,  R,  R,  R,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  R,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** 10x Dev — diagonal lightning bolt (reuses A gold) */
export const SPRITE_LIGHTNING: string[][] = [
  [T,  T,  T,  T,  A,  A,  A,  A,  A,  T,  T,  T],
  [T,  T,  T,  T,  A,  A,  A,  A,  T,  T,  T,  T],
  [T,  T,  T,  T,  A,  A,  A,  T,  T,  T,  T,  T],
  [T,  T,  T,  A,  A,  A,  A,  A,  T,  T,  T,  T],
  [T,  T,  A,  A,  A,  A,  A,  A,  A,  T,  T,  T],
  [T,  T,  T,  T,  T,  A,  A,  A,  T,  T,  T,  T],
  [T,  T,  T,  T,  A,  A,  A,  T,  T,  T,  T,  T],
  [T,  T,  T,  A,  A,  A,  T,  T,  T,  T,  T,  T],
  [T,  T,  A,  A,  A,  T,  T,  T,  T,  T,  T,  T],
  [T,  A,  A,  A,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** Caffeine Addict — coffee cup with gold lightning steam */
export const SPRITE_CAFFEINE_PERK: string[][] = [
  [T,  T,  T,  A,  T,  A,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  A,  T,  T,  T,  T,  T,  T,  T],
  [T,  K,  K,  K,  K,  K,  K,  K,  K,  K,  T,  T],
  [T,  K,  W,  W,  W,  W,  W,  W,  W,  K,  K,  T],
  [T,  K,  W,  W,  W,  W,  W,  W,  W,  K,  W,  K],
  [T,  K,  W,  D,  D,  W,  W,  W,  W,  K,  W,  K],
  [T,  K,  W,  W,  W,  W,  W,  W,  W,  K,  K,  T],
  [T,  K,  W,  W,  W,  W,  W,  W,  W,  K,  T,  T],
  [T,  T,  K,  K,  K,  K,  K,  K,  K,  T,  T,  T],
  [T,  K,  K,  K,  K,  K,  K,  K,  K,  K,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

/** Ship Dirty — pixel skull (reuses L skull-gray, K outline) */
export const SPRITE_SKULL: string[][] = [
  [T,  T,  K,  K,  K,  K,  K,  K,  T,  T,  T,  T],
  [T,  K,  L,  L,  L,  L,  L,  L,  K,  T,  T,  T],
  [K,  L,  L,  K,  K,  L,  K,  K,  L,  K,  T,  T],
  [K,  L,  L,  K,  K,  L,  K,  K,  L,  K,  T,  T],
  [K,  L,  L,  L,  L,  L,  L,  L,  L,  K,  T,  T],
  [K,  L,  L,  L,  L,  L,  L,  L,  L,  K,  T,  T],
  [K,  L,  K,  L,  K,  L,  K,  L,  K,  K,  T,  T],
  [T,  K,  K,  K,  K,  K,  K,  K,  K,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
  [T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T,  T],
];

// ─── Sprite type helpers ──────────────────────────────────────────────────────

export type PlayerMood = 'Happy' | 'Stressed' | 'Exhausted' | 'Skeleton';
export type ManagerMood = 'Smiling' | 'Neutral' | 'Angry';

export function getPlayerSprite(burnout: number): { matrix: string[][]; mood: PlayerMood } {
  if (burnout >= 100) return { matrix: PLAYER_SKELETON, mood: 'Skeleton' };
  if (burnout >= 71)  return { matrix: PLAYER_EXHAUSTED, mood: 'Exhausted' };
  if (burnout >= 31)  return { matrix: PLAYER_STRESSED, mood: 'Stressed' };
  return { matrix: PLAYER_HAPPY, mood: 'Happy' };
}

export function getManagerSprite(mgb: number): { matrix: string[][]; mood: ManagerMood } {
  if (mgb >= 80) return { matrix: MANAGER_SMILING, mood: 'Smiling' };
  if (mgb >= 40) return { matrix: MANAGER_NEUTRAL, mood: 'Neutral' };
  return { matrix: MANAGER_ANGRY, mood: 'Angry' };
}
