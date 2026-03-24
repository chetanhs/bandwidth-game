#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# run-ux-autopilot.sh — Autonomous UX Testing & Fix Pipeline
#
# Steps per iteration:
#   1. Run Playwright UX Matrix Crawler (captures all game state screenshots)
#   2. Run UX Critic (sends screenshots to Claude Vision API for critique)
#   3. Check UX_STATUS.txt — if PERFECT, exit successfully
#   4. Otherwise, invoke Claude Code to read UX_FIXES_SPEC.md and apply fixes
#   5. Repeat up to MAX_ITERATIONS times
#
# Usage:
#   export ANTHROPIC_API_KEY=sk-ant-...
#   ./run-ux-autopilot.sh
#
#   # Optional overrides:
#   MAX_ITERATIONS=3 ./run-ux-autopilot.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BANDWIDTH_DIR="$SCRIPT_DIR/bandwidth"

MAX_ITERATIONS="${MAX_ITERATIONS:-5}"
STATUS_FILE="$BANDWIDTH_DIR/UX_STATUS.txt"
FIXES_FILE="$BANDWIDTH_DIR/UX_FIXES_SPEC.md"
PLAYWRIGHT_TEST="tests/ux-matrix-crawler.spec.ts"
CRITIC_SCRIPT="$BANDWIDTH_DIR/scripts/ux-critic.js"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

banner() {
  echo ""
  echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  UX Autopilot — Iteration $1 / $MAX_ITERATIONS${NC}"
  echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
  echo ""
}

# ── Pre-flight checks ────────────────────────────────────────────────────────

if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
  echo -e "${RED}❌  ANTHROPIC_API_KEY is not set.${NC}"
  echo "    Export it before running: export ANTHROPIC_API_KEY=sk-ant-..."
  exit 1
fi

if ! command -v node &>/dev/null; then
  echo -e "${RED}❌  node is not in PATH.${NC}"; exit 1
fi

if ! command -v npx &>/dev/null; then
  echo -e "${RED}❌  npx is not in PATH.${NC}"; exit 1
fi

if ! command -v claude &>/dev/null; then
  echo -e "${YELLOW}⚠️   claude CLI not found — fix step will be skipped (dry-run mode).${NC}"
  CLAUDE_AVAILABLE=false
else
  CLAUDE_AVAILABLE=true
fi

# Install dependencies if node_modules is missing (bandwidth project)
if [[ ! -d "$BANDWIDTH_DIR/node_modules" ]]; then
  echo "📦  Installing npm dependencies in bandwidth/..."
  (cd "$BANDWIDTH_DIR" && npm install --silent)
fi

echo -e "${GREEN}🚀  Starting UX Autopilot (max ${MAX_ITERATIONS} iterations)${NC}"

# ── Main Loop ────────────────────────────────────────────────────────────────

for iteration in $(seq 1 "$MAX_ITERATIONS"); do
  banner "$iteration"

  # Step 1: Playwright Crawler (must run from bandwidth/ where playwright.config.ts lives)
  echo -e "${CYAN}[1/3] Running Playwright UX Matrix Crawler...${NC}"
  if ! (cd "$BANDWIDTH_DIR" && npx playwright test "$PLAYWRIGHT_TEST" --reporter=line) 2>&1; then
    echo -e "${RED}❌  Playwright crawler failed. Check the output above.${NC}"
    exit 1
  fi
  echo -e "${GREEN}     ✓ Screenshots captured in bandwidth/ux-screenshots/${NC}"
  echo ""

  # Step 2: Vision Critique
  echo -e "${CYAN}[2/3] Running Vision Orchestrator (Claude API)...${NC}"
  if ! (cd "$BANDWIDTH_DIR" && node "$CRITIC_SCRIPT") 2>&1; then
    echo -e "${RED}❌  UX Critic script failed.${NC}"
    exit 1
  fi
  echo ""

  # Step 3: Check status
  echo -e "${CYAN}[3/3] Checking UX_STATUS.txt...${NC}"
  STATUS=""
  if [[ -f "$STATUS_FILE" ]]; then
    STATUS=$(cat "$STATUS_FILE")
  fi

  if [[ "$STATUS" == "PERFECT" ]]; then
    echo ""
    echo -e "${GREEN}🎉  STATUS: PERFECT — All screens passed! No fixes needed.${NC}"
    echo -e "${GREEN}    Completed in ${iteration} iteration(s).${NC}"
    echo ""
    exit 0
  fi

  echo -e "${YELLOW}⚠️   STATUS: NEEDS_FIXES — Issues found. See ${FIXES_FILE}${NC}"
  echo ""

  # Step 4: Invoke Claude Code to fix
  if [[ "$iteration" -lt "$MAX_ITERATIONS" ]]; then
    if [[ "$CLAUDE_AVAILABLE" == "true" ]]; then
      echo -e "${CYAN}[FIX] Invoking Claude Code to apply UI fixes...${NC}"
      (cd "$BANDWIDTH_DIR" && claude --dangerously-skip-permissions \
        "Read UX_FIXES_SPEC.md. Implement every Tailwind/React fix in the checklist. \
Rules: (1) Only change styling — do NOT alter game logic, state, or test files. \
(2) Maintain the dark zinc palette (bg-zinc-900, text-zinc-100). \
(3) After all fixes, run: npx tsc --noEmit to confirm no TypeScript errors. \
(4) Do not create new files. Apply fixes to existing components only.")
      echo -e "${GREEN}     ✓ Claude Code finished applying fixes.${NC}"
    else
      echo -e "${YELLOW}     ⚠️  claude CLI unavailable — manual fix required.${NC}"
      echo "        Review ${FIXES_FILE} and apply the changes manually."
      echo "        Then re-run this script."
      exit 1
    fi
  fi

  echo ""
done

# ── Exhausted iterations ─────────────────────────────────────────────────────
echo -e "${RED}❌  UX Autopilot exhausted ${MAX_ITERATIONS} iterations without reaching PERFECT.${NC}"
echo "    Review ${FIXES_FILE} for remaining issues."
exit 1
