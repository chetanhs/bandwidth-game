// ─── Lead Magnet End Screens ─────────────────────────────────────────────────
// Both screens share a two-zone layout:
//   Zone 1 — Retro game result (pixel/mono aesthetic, zinc palette)
//   Zone 2 — Modern, high-contrast CTA that deliberately breaks the retro mold
// UTM-tagged links so analytics can track conversions from the game.

interface EndProps {
  playerName: string;
  onReset: () => void;
}

// ─── Shared CTA button ────────────────────────────────────────────────────────

function BlogCTA({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-center gap-3 w-full px-8 py-4 rounded-xl font-sans font-semibold text-base tracking-tight transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/30"
      style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        boxShadow: '0 0 32px rgba(139,92,246,0.45), 0 4px 16px rgba(0,0,0,0.4)',
        color: '#ffffff',
      }}
    >
      <span>{label}</span>
      <span
        className="text-xl transition-transform duration-200 group-hover:translate-x-1"
        aria-hidden
      >
        ↗
      </span>
    </a>
  );
}

// ─── Game Over Screen (PIP) ───────────────────────────────────────────────────

export function GameOverScreen({ playerName, onReset }: EndProps) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg">

        {/* ── Zone 1: Retro failure state ───────────────────────────────── */}
        <div className="mb-10 text-center">
          {/* Scanline-style label */}
          <p
            className="text-xs font-mono uppercase tracking-[0.3em] mb-4 tabular-nums"
            style={{ color: '#ef4444' }}
          >
            ■ Performance Improvement Plan ■
          </p>

          {/* Big hollow retro headline */}
          <h1
            className="font-mono font-black uppercase leading-none mb-5 select-none"
            style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              color: 'transparent',
              WebkitTextStroke: '2px #ef4444',
              textShadow: '0 0 40px rgba(239,68,68,0.25)',
              letterSpacing: '-0.02em',
            }}
          >
            GAME<br />OVER
          </h1>

          {/* Mono flavour text */}
          <p className="text-sm font-mono text-zinc-500 leading-relaxed max-w-sm mx-auto">
            {playerName}, the committee has decided not to move forward.<br />
            A 30-day PIP has been filed. The career ladder waits for no one.
          </p>
        </div>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">
            but you can still level up IRL
          </span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* ── Zone 2: Modern CTA ────────────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-center text-sm text-zinc-400 font-sans leading-relaxed">
            Fired? It's time to automate your job before they automate you. Stop doing manual Jira tickets. Supercharge your AI coding with the best Claude Code rules and MCP servers.
          </p>

          <BlogCTA
            href="https://www.clauderules.net/?utm_source=bandwidth_game&utm_medium=web_app&utm_campaign=pip_screen"
            label="Automate Your Job at clauderules.net"
          />
        </div>

        {/* ── Secondary: restart ────────────────────────────────────────── */}
        <div className="mt-10 text-center">
          <button
            onClick={onReset}
            className="text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer underline underline-offset-4"
          >
            Take severance &amp; start a new run →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Win Screen (CEO) ─────────────────────────────────────────────────────────

export function WinScreen({ playerName, onReset }: EndProps) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg">

        {/* ── Zone 1: Retro victory state ───────────────────────────────── */}
        <div className="mb-10 text-center">
          {/* Scanline-style label */}
          <p
            className="text-xs font-mono uppercase tracking-[0.3em] mb-4"
            style={{ color: '#eab308' }}
          >
            ★ You Reached CEO ★
          </p>

          {/* Big hollow gold headline */}
          <h1
            className="font-mono font-black uppercase leading-none mb-5 select-none"
            style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              color: 'transparent',
              WebkitTextStroke: '2px #eab308',
              textShadow: '0 0 40px rgba(234,179,8,0.3)',
              letterSpacing: '-0.02em',
            }}
          >
            YOU<br />WON
          </h1>

          {/* Mono flavour text */}
          <p className="text-sm font-mono text-zinc-500 leading-relaxed max-w-sm mx-auto">
            {playerName} — L7, Director, then CEO.<br />
            Your calendar is now 100% meetings. Congratulations, we think.
          </p>
        </div>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">
            now go build the real thing
          </span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* ── Zone 2: Modern CTA ────────────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-center text-sm text-zinc-400 font-sans leading-relaxed">
            You beat the system. Now build your own. This entire game was autonomously coded using custom AI system prompts. Explore the tools used to build it.
          </p>

          <BlogCTA
            href="https://www.clauderules.net/?utm_source=bandwidth_game&utm_medium=web_app&utm_campaign=ceo_screen"
            label="Get the AI Rules at clauderules.net"
          />
        </div>

        {/* ── Secondary: restart ────────────────────────────────────────── */}
        <div className="mt-10 text-center">
          <button
            onClick={onReset}
            className="text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer underline underline-offset-4"
          >
            Take severance &amp; start a new run →
          </button>
        </div>
      </div>
    </div>
  );
}
