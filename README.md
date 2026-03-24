# Bandwidth — Corporate Career RPG

A browser-based corporate career RPG where you manage Bandwidth, Burnout, and Autonomy, survive chaos events, and climb from L3 Engineer to CEO. Built entirely using an AI-driven development workflow — from spec to code to automated UI review.

--

## Why did I build this?
I run clauderules.net, a directory for Claude system prompts and MCP servers. I wanted to prove how powerful Claude Code can be if you give it strict architectural rules.

So, I used my own Claude rules to autonomously build a satirical game about the very industry that is currently trying to automate us.

Yes, this game is essentially an over-engineered portfolio piece for my website. But frankly, I'd rather build a playable pixel-art PM fist-fight than pay for Google Ads. I hope you enjoy the trauma.

---

## How This Was Built

This project was developed using a **spec-driven, agentic loop** — no manual coding. Every feature was written by Claude Code agents working from structured markdown specs.

### 1. Feature Development via Specs

Every feature started as a markdown spec in `specs/`. Each spec described:
- What to build and why
- Exact state changes, component interfaces, and logic
- File-level implementation details and edge cases

Specs were written incrementally as the game evolved — from the core engine (`SPEC.md`) through 26 versions covering chaos events, mini-games, the performance review system, the chess duel, and the marketing funnel.

```
specs/
├── SPEC.md                    ← Core game engine
├── SPEC_V3.md → SPEC_V9.md   ← Early feature iterations
├── SPEC_V10.md → SPEC_V25.md ← Mini-games, perks, duel system
└── SPEC_V26_FUNNEL_ALIGNMENT.md ← Final marketing copy
```

Claude Code read the spec, implemented the feature, ran TypeScript checks, and updated the spec's checkboxes on completion. The human role was writing specs and reviewing output — not writing code.

---

### 2. Automated UI Critic Loop

Once features were built, UI quality was enforced by an automated vision-feedback loop — no manual design review needed.

#### How it works

```
┌─────────────────────────────────────────────────────┐
│                 run-ux-autopilot.sh                 │
│                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐  │
│  │Playwright│───▶│ UX Critic│───▶│ Claude Code  │  │
│  │ Crawler  │    │(Vision AI│    │  (Fix Agent) │  │
│  └──────────┘    └──────────┘    └──────────────┘  │
│       │               │                │            │
│  Screenshots     UX_FIXES_SPEC.md  Applies fixes   │
│  of every        + UX_STATUS.txt   to components   │
│  game screen                           │            │
│       └───────────────────────────────▶│            │
│                   Loop until PERFECT               │
└─────────────────────────────────────────────────────┘
```

#### Step 1 — Playwright Crawler

`tests/ux-matrix-crawler.spec.ts` navigates through every game state — start screen, dashboard, chaos events, performance review, mini-games, end screens — and captures a PNG screenshot of each.

#### Step 2 — Vision Critique (`scripts/ux-critic.js`)

Each screenshot is sent to the Claude API (Haiku) with a strict UX prompt. The critic looks for:
- Text overflow or clipped elements
- Low contrast text failing WCAG AA
- Missing hover/focus states
- Misaligned or inconsistently spaced elements
- Ambiguous timers or unlabeled numbers
- Unexpected scrollbars or z-index issues

For each screen it outputs either a Markdown fix checklist (with exact Tailwind classes) or `STATUS: PERFECT`. Results are written to `UX_FIXES_SPEC.md` and `UX_STATUS.txt`.

#### Step 3 — Claude Code Fix Agent

If `UX_STATUS.txt` is not `PERFECT`, the shell script invokes `claude` CLI with a prompt to read `UX_FIXES_SPEC.md` and apply every fix — styling only, no logic changes. TypeScript is verified clean after each pass.

#### Step 4 — Loop

The loop repeats up to 5 times. If all screens pass in a given iteration, the script exits with `STATUS: PERFECT`. This meant UI polish ran fully autonomously overnight.

```bash
export ANTHROPIC_API_KEY=sk-ant-...
./run-ux-autopilot.sh

# Optional: limit iterations
MAX_ITERATIONS=3 ./run-ux-autopilot.sh
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19, TypeScript (strict), Tailwind CSS v4 |
| State | Zustand v5 with localStorage persistence |
| Build | Vite 8 |
| Tests | Playwright (E2E + logic assertions) |
| AI Critic | Claude API (Haiku) via `@anthropic-ai/sdk` |
| Dev Agent | Claude Code CLI |

---

## Project Structure

```
bandwidth/          ← Game source (React/Vite)
  src/
    components/     ← All UI components
    store.ts        ← Zustand game engine
    types.ts        ← Shared types + level configs
  tests/            ← Playwright E2E test suite
  scripts/
    ux-critic.js    ← Vision critique orchestrator
specs/              ← All feature specs (v1–v26)
docs/               ← Superpowers plans + design docs
run-ux-autopilot.sh ← Automated UI fix loop
```

---

## Running Locally

```bash
cd bandwidth
npm install
npm run dev       # http://localhost:5173

npm run build     # Production build
npx playwright test  # Full E2E suite
```

---

Built with [Claude Code](https://claude.ai/code) and [clauderules.net](https://www.clauderules.net/?utm_source=bandwidth_game&utm_medium=web_app&utm_campaign=readme).
