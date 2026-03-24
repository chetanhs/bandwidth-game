# Technical Specification: The Autonomous UX Autopilot Pipeline

## Objective
Build a fully automated pipeline where Playwright forces the game into every possible state/permutation, a Node.js script sends screenshots to the Anthropic Vision API for critique, and a Bash script orchestrates Claude Code to implement the UI fixes.

## Epic 1: The React State Injector (God Mode)
**Description:** The game has too much RNG and branching logic for linear testing. We must expose a global injector so Playwright can instantly teleport to any scenario.
* [x] **Task 1.1:** Create a `tests/e2e-injector.ts` file or add an `__E2E_INJECTOR__` object to the global `window` in `main.tsx` (only active when `import.meta.env.DEV` is true).
  * _Resolution: Added `__E2E_INJECTOR__` to `main.tsx` inside the existing `import.meta.env.DEV` guard._
* [x] **Task 1.2:** Implement injection methods for EVERY game scenario. This must include:
    * [x] `triggerRngEvent(eventName)`: Forces specific Chaos Modals (Meeting, Re-org, Flow State) — all 8 chaos types supported.
    * [x] `triggerChattyManager(dialogueId)`: Forces the manager overlay with custom message.
    * [x] `forcePerformanceReview(status)`: Forces Boss screen. Accepts `'promotion'` and `'pip'` — sets stats to guarantee the desired outcome.
    * [x] `openShop(tab)`: Opens the Shop modal. Tab switching handled by crawler clicking the tab button.
    * [x] `triggerCycleDrop(items)`: Forces the Cycle Summary interstitial with a specific loot drop + perk draft.
    * [x] `setExtremeStats()`: Maxes Burnout (99%), zeros MGB (1%), maxes Debt (95%), drops BW to 5.
    * [x] `loadAlumniNetwork()`: Teleports to the alumni network screen.
    * [x] `forceBurnoutCrash()`: Triggers the BurnoutCrashModal directly.
    * [x] `forceConsultModal()`: Opens the ConsultModal directly.
    * [x] `forceGameOver()`: Jumps to game-over screen.
    * [x] `forceHackerTheme()`: Unlocks and applies the Hacker Green cosmetic theme.

## Epic 2: The Comprehensive Playwright Crawler
**Description:** Build the script that uses the Injector to traverse the matrix.
* [x] **Task 2.1:** Created `tests/ux-matrix-crawler.spec.ts`.
* [x] **Task 2.2:** Playwright test iterates through the injector capturing screenshots of:
    * [x] The L3 Dashboard (Standard) — `03-l3-dashboard.png`
    * [x] The L5 Dashboard (Auto-Battler UI showing Junior Devs) — `04-l5-dashboard-junior-devs.png`
    * [x] The PIP / Game Over Screen — `22-performance-review-pip.png`, `23-game-over.png`
    * [x] The Offer Letter / Intro Screen — `02-offer-letter.png`
    * [x] Every variant of the Chaos / Interruption Modals — `05` through `12` (all 8 types)
    * [x] The Chatty Manager dialogue overlay — `13-chatty-manager.png`
    * [x] The Burnout Crash modal — `14-burnout-crash-modal.png`
    * [x] The Consult Modal — `15-consult-modal.png`
    * [x] The Cycle Summary Screen (with XP animations and Loot Drops) — `16-cycle-summary-loot-drop.png`
    * [x] The Shop (Both Tabs) — `17-shop-perks-tab.png`, `18-shop-cosmetics-tab.png`
    * [x] The Job Board — `24-job-board.png`
    * [x] The UI with the "Hacker Green" cosmetic theme applied — `19-hacker-green-theme.png`
    * [x] Extreme Stats stress test — `20-extreme-stats-stress-test.png`
    * [x] Performance Review (Promotion) — `21-performance-review-promotion.png`
    * [x] Alumni Network — `25-alumni-network.png`
    * [x] Pro Unlock Modal — `26-pro-unlock-modal.png`
* [x] **Task 2.3:** All screenshots saved to `ux-screenshots/` — directory is cleared before each run via `clearScreenshots()`.

## Epic 3: The Vision Orchestrator
**Description:** The Node script that acts as the UX Critic.
* [x] **Task 3.1:** Created `scripts/ux-critic.js` using `@anthropic-ai/sdk`.
* [x] **Task 3.2:** Script reads all PNGs from `ux-screenshots/`, sends each to `claude-haiku-4-5-20251001` with a strict prompt targeting: overflow, contrast, missing hover/focus states, misalignment, ambiguous timers, scrollbar issues, z-index problems. Outputs strict Markdown checklist or `"STATUS: PERFECT"` per screen.
* [x] **Task 3.3:** Script writes AI output to `UX_FIXES_SPEC.md` and status to `UX_STATUS.txt` (`PERFECT` or `NEEDS_FIXES`).

## Epic 4: The Autopilot Loop
**Description:** The Bash script that glues it together and triggers Claude Code.
* [x] **Task 4.1:** Created `run-ux-autopilot.sh` in the `bandwidth/` root. Made executable with `chmod +x`.
* [x] **Task 4.2:** Loop logic implemented:
    1. Runs `npx playwright test tests/ux-matrix-crawler.spec.ts`
    2. Runs `node scripts/ux-critic.js`
    3. Checks `UX_STATUS.txt` — exits 0 if `PERFECT`
    4. If not perfect, runs `claude --permission-mode acceptEdits` with a scoped prompt (styling only, no game logic changes, maintain zinc palette, TypeScript check after)
    5. Loops up to `MAX_ITERATIONS` (default: 5, configurable via env var)
    6. Pre-flight checks: validates `ANTHROPIC_API_KEY`, `node`, `npx`, `claude` — gracefully degrades to dry-run if `claude` CLI is absent
