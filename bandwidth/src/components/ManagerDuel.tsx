import { useEffect, useRef, useState } from 'react';

// ── Canvas dimensions ────────────────────────────────────────────────────────
const W = 600;
const H = 400;

// ── Player constants ─────────────────────────────────────────────────────────
const PLAYER_W = 44;
const PLAYER_H = 22;
const PLAYER_SPEED = 4;
const PLAYER_MAX_HP = 3;
const PLAYER_Y = H - PLAYER_H - 18;

// ── Manager constants ────────────────────────────────────────────────────────
const MANAGER_W = 64;
const MANAGER_H = 32;
const MANAGER_SPEED = 2;
const MANAGER_MAX_HP = 10;
const MANAGER_Y = 56;

// ── Bullet constants ─────────────────────────────────────────────────────────
const BULLET_W = 4;
const BULLET_H = 12;
const PLAYER_BULLET_SPEED = 7;
const MANAGER_BULLET_SPEED = 4;

// ── Game state (all mutable, kept in ref for rAF loop) ───────────────────────

interface Bullet { x: number; y: number; }

interface GameState {
  playerX: number;
  playerHP: number;
  managerX: number;
  managerDir: 1 | -1;
  managerHP: number;
  playerBullets: Bullet[];
  managerBullets: Bullet[];
  lastManagerShot: number;
  nextManagerShotDelay: number;
  playerInvincibleFrames: number; // blink + immunity after hit
  phase: 'playing' | 'victory' | 'defeat';
}

// ── Canvas drawing helpers ───────────────────────────────────────────────────

function fillGlow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, glow: string) {
  ctx.shadowColor = glow;
  ctx.shadowBlur = 10;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
  ctx.shadowBlur = 0;
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = 'rgba(63,63,70,0.18)';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 24) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  for (let x = 0; x < W; x += 24) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, s: GameState) {
  // Blink during invincibility
  if (s.playerInvincibleFrames > 0 && Math.floor(s.playerInvincibleFrames / 5) % 2 === 0) return;

  const x = Math.round(s.playerX);
  const y = PLAYER_Y;

  // Main fuselage
  fillGlow(ctx, x + 8, y + 6, PLAYER_W - 16, PLAYER_H - 6, '#1d4ed8', '#3b82f6');
  // Wing left
  fillGlow(ctx, x, y + 12, 10, 10, '#1e40af', '#2563eb');
  // Wing right
  fillGlow(ctx, x + PLAYER_W - 10, y + 12, 10, 10, '#1e40af', '#2563eb');
  // Cockpit
  fillGlow(ctx, x + PLAYER_W / 2 - 6, y, 12, 10, '#93c5fd', '#bfdbfe');
  // Cannon tip
  fillGlow(ctx, x + PLAYER_W / 2 - 2, y - 10, 4, 10, '#60a5fa', '#93c5fd');
}

function drawManager(ctx: CanvasRenderingContext2D, s: GameState) {
  const x = Math.round(s.managerX);
  const y = MANAGER_Y;
  const hpRatio = s.managerHP / MANAGER_MAX_HP;
  const rVal = Math.round(180 + hpRatio * 59); // darkens as HP drops
  const bodyColor = `rgb(${rVal}, 40, 40)`;

  // Body
  fillGlow(ctx, x + 6, y, MANAGER_W - 12, MANAGER_H, bodyColor, '#ef4444');
  // Shoulders
  fillGlow(ctx, x, y + 8, 8, MANAGER_H - 8, '#7f1d1d', '#b91c1c');
  fillGlow(ctx, x + MANAGER_W - 8, y + 8, 8, MANAGER_H - 8, '#7f1d1d', '#b91c1c');
  // Suit collar
  ctx.fillStyle = '#374151';
  ctx.fillRect(x + 14, y + MANAGER_H - 8, MANAGER_W - 28, 8);
  // Eyes (angry — angled brows)
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 14, y + 8, 10, 8);
  ctx.fillRect(x + MANAGER_W - 24, y + 8, 10, 8);
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(x + 17, y + 11, 4, 4);
  ctx.fillRect(x + MANAGER_W - 21, y + 11, 4, 4);
  // Brow lines (angry V)
  ctx.fillStyle = '#1a0000';
  ctx.fillRect(x + 12, y + 6, 14, 2);
  ctx.fillRect(x + MANAGER_W - 26, y + 6, 14, 2);
  // Frown
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(x + 20, y + MANAGER_H - 14, MANAGER_W - 40, 3);
  // Downward cannon nozzle
  fillGlow(ctx, x + MANAGER_W / 2 - 2, y + MANAGER_H, 4, 8, '#ef4444', '#f87171');
}

function drawHUD(ctx: CanvasRenderingContext2D, s: GameState) {
  // Manager patience bar background
  ctx.fillStyle = '#27272a';
  ctx.fillRect(8, 8, W - 16, 14);
  // Manager patience bar fill
  const barW = Math.round((W - 16) * (s.managerHP / MANAGER_MAX_HP));
  ctx.shadowColor = '#f87171';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(8, 8, barW, 14);
  ctx.shadowBlur = 0;
  // Label
  ctx.fillStyle = '#a1a1aa';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('MANAGER PATIENCE', 13, 19);

  // Player HP pips (bottom-right)
  for (let i = 0; i < PLAYER_MAX_HP; i++) {
    const active = i < s.playerHP;
    ctx.shadowColor = active ? '#60a5fa' : 'transparent';
    ctx.shadowBlur = active ? 6 : 0;
    ctx.fillStyle = active ? '#3b82f6' : '#27272a';
    ctx.fillRect(W - 16 - (PLAYER_MAX_HP - i - 1) * 18, H - 14, 12, 8);
  }
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#71717a';
  ctx.font = '8px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('HP', W - 16 - PLAYER_MAX_HP * 18 - 4, H - 7);
  ctx.textAlign = 'left';
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  onComplete: (outcome: 'win' | 'lose') => void;
}

export function ManagerDuel({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef<GameState>({
    playerX: (W - PLAYER_W) / 2,
    playerHP: PLAYER_MAX_HP,
    managerX: (W - MANAGER_W) / 2,
    managerDir: 1,
    managerHP: MANAGER_MAX_HP,
    playerBullets: [],
    managerBullets: [],
    lastManagerShot: 0,
    nextManagerShotDelay: 800,
    playerInvincibleFrames: 0,
    phase: 'playing',
  });

  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const canFireRef = useRef(true); // spacebar debounce

  // Single React state — only used to trigger overlay render
  const [phase, setPhase] = useState<'playing' | 'victory' | 'defeat'>('playing');

  // ── E2E debug hook ─────────────────────────────────────────────────────────
  // Allows Playwright tests to force win/loss states without playing the game.
  // Sets the game phase (freezing the loop and showing the overlay) so the
  // test can then click [ Return to Desk ] to trigger the onComplete callback.
  useEffect(() => {
    type DebugFn = (outcome: 'win' | 'lose') => void;
    (window as Window & { __DEBUG_RESOLVE_DUEL__?: DebugFn }).__DEBUG_RESOLVE_DUEL__ =
      (outcome: 'win' | 'lose') => {
        stateRef.current.phase = outcome === 'win' ? 'victory' : 'defeat';
        setPhase(outcome === 'win' ? 'victory' : 'defeat');
      };
    return () => {
      delete (window as Window & { __DEBUG_RESOLVE_DUEL__?: DebugFn }).__DEBUG_RESOLVE_DUEL__;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Input handlers ─────────────────────────────────────────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        const s = stateRef.current;
        if (s.phase !== 'playing' || !canFireRef.current) return;
        canFireRef.current = false;
        s.playerBullets.push({
          x: s.playerX + PLAYER_W / 2 - BULLET_W / 2,
          y: PLAYER_Y - BULLET_H,
        });
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
      if (e.key === ' ' || e.key === 'Spacebar') canFireRef.current = true;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ── Game loop ──────────────────────────────────────────────────────────
    let lastTime = 0;

    function loop(timestamp: number) {
      if (lastTime === 0) lastTime = timestamp;
      lastTime = timestamp;

      const s = stateRef.current;
      if (s.phase !== 'playing') return;

      const keys = keysRef.current;

      // Player movement
      if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
        s.playerX = Math.max(0, s.playerX - PLAYER_SPEED);
      }
      if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
        s.playerX = Math.min(W - PLAYER_W, s.playerX + PLAYER_SPEED);
      }

      // Manager ping-pong
      s.managerX += MANAGER_SPEED * s.managerDir;
      if (s.managerX <= 0) { s.managerX = 0; s.managerDir = 1; }
      if (s.managerX >= W - MANAGER_W) { s.managerX = W - MANAGER_W; s.managerDir = -1; }

      // Manager fires at random intervals
      if (timestamp - s.lastManagerShot >= s.nextManagerShotDelay) {
        s.lastManagerShot = timestamp;
        s.nextManagerShotDelay = 500 + Math.random() * 700;
        s.managerBullets.push({
          x: s.managerX + MANAGER_W / 2 - BULLET_W / 2,
          y: MANAGER_Y + MANAGER_H + 8,
        });
      }

      // Move bullets, cull off-screen
      s.playerBullets = s.playerBullets
        .map(b => ({ ...b, y: b.y - PLAYER_BULLET_SPEED }))
        .filter(b => b.y + BULLET_H > 0);
      s.managerBullets = s.managerBullets
        .map(b => ({ ...b, y: b.y + MANAGER_BULLET_SPEED }))
        .filter(b => b.y < H);

      // Collision: player bullets → manager (AABB)
      const hitBullets = new Set<number>();
      s.playerBullets.forEach((b, i) => {
        if (
          b.x < s.managerX + MANAGER_W &&
          b.x + BULLET_W > s.managerX &&
          b.y < MANAGER_Y + MANAGER_H &&
          b.y + BULLET_H > MANAGER_Y
        ) {
          hitBullets.add(i);
          s.managerHP = Math.max(0, s.managerHP - 1);
        }
      });
      s.playerBullets = s.playerBullets.filter((_, i) => !hitBullets.has(i));

      // Collision: manager bullets → player (AABB), with invincibility window
      if (s.playerInvincibleFrames > 0) {
        s.playerInvincibleFrames--;
      } else {
        const hitMgr = new Set<number>();
        s.managerBullets.forEach((b, i) => {
          if (
            b.x < s.playerX + PLAYER_W &&
            b.x + BULLET_W > s.playerX &&
            b.y < PLAYER_Y + PLAYER_H &&
            b.y + BULLET_H > PLAYER_Y
          ) {
            hitMgr.add(i);
            s.playerHP = Math.max(0, s.playerHP - 1);
            s.playerInvincibleFrames = 60; // 1s immunity at 60fps
          }
        });
        s.managerBullets = s.managerBullets.filter((_, i) => !hitMgr.has(i));
      }

      // Win / loss
      if (s.managerHP <= 0) {
        s.phase = 'victory';
        setPhase('victory');
        return;
      }
      if (s.playerHP <= 0) {
        s.phase = 'defeat';
        setPhase('defeat');
        return;
      }

      // ── Draw ────────────────────────────────────────────────────────────
      // Clear
      ctx!.fillStyle = '#09090b';
      ctx!.fillRect(0, 0, W, H);

      // Grid scanlines
      drawGrid(ctx!);

      // Player bullets (green)
      s.playerBullets.forEach(b => {
        fillGlow(ctx!, b.x, b.y, BULLET_W, BULLET_H, '#16a34a', '#4ade80');
      });

      // Manager bullets (red)
      s.managerBullets.forEach(b => {
        fillGlow(ctx!, b.x, b.y, BULLET_W, BULLET_H, '#dc2626', '#f87171');
      });

      drawManager(ctx!, s);
      drawPlayer(ctx!, s);
      drawHUD(ctx!, s);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 select-none">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="border border-zinc-700"
          style={{ imageRendering: 'pixelated', display: 'block' }}
        />

        {/* Victory overlay */}
        {phase === 'victory' && (
          <div className="absolute inset-0 bg-green-950/95 flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <p className="font-retro text-green-400 uppercase tracking-widest mb-3" style={{ fontSize: '9px' }}>
                — RESPECT EARNED —
              </p>
              <p className="font-mono text-green-200 text-lg font-bold mb-2">
                "Good pushback, let's sync async."
              </p>
              <p className="font-mono text-green-400 text-sm">+30 Autonomy &nbsp;·&nbsp; +15 Manager's Good Books</p>
            </div>
            <button
              onClick={() => onComplete('win')}
              className="font-retro px-6 py-3 rounded border border-green-600 bg-green-900 text-green-200 hover:bg-green-800 hover:border-green-500 transition-colors cursor-pointer"
              style={{ fontSize: '9px' }}
            >
              [ Return to Desk ]
            </button>
          </div>
        )}

        {/* Defeat overlay */}
        {phase === 'defeat' && (
          <div className="absolute inset-0 bg-red-950/95 flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <p className="font-retro text-red-400 uppercase tracking-widest mb-3" style={{ fontSize: '9px' }}>
                — MICROMANAGED —
              </p>
              <p className="font-mono text-red-200 text-lg font-bold mb-2">
                You agreed to take on 3 more sprint points.
              </p>
              <p className="font-mono text-red-400 text-sm">-30 Bandwidth &nbsp;·&nbsp; +20 Burnout</p>
            </div>
            <button
              onClick={() => onComplete('lose')}
              className="font-retro px-6 py-3 rounded border border-red-600 bg-red-900 text-red-200 hover:bg-red-800 hover:border-red-500 transition-colors cursor-pointer"
              style={{ fontSize: '9px' }}
            >
              [ Return to Desk ]
            </button>
          </div>
        )}
      </div>

      {phase === 'playing' && (
        <div className="flex items-center gap-6 font-mono text-xs text-zinc-600">
          <span>A / D or ← / → — Move</span>
          <span className="text-zinc-800">·</span>
          <span>Space — Fire Pushback</span>
          <span className="text-zinc-800">·</span>
          <span className="text-red-800">10 hits to defeat the Manager</span>
        </div>
      )}
    </div>
  );
}
