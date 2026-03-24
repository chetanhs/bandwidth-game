# Technical Specification: "Bandwidth" (Phase 5 - Advanced Economy & Push/Pull Dynamics)

## 1. Feature Additions & State Changes
* **Net Worth ($):** A new currency awarded at the end of each Cycle (salary). Used to purchase Burnout reduction and Tools.
* **Manager's Good Books (MGB):** Replaces static "Manager Time" slots. This is a 0-100% sliding scale. High MGB provides a buffer during Performance Reviews; low MGB increases PIP risk.
* **The Shop / Perks:** A place to spend Net Worth on Vacations (reduces Burnout) or Tools.
* **The Tool Chest:** An inventory of single-use items (e.g., "Noise Canceling Headphones") that auto-trigger to negate specific negative RNG events.

## 2. Epic Breakdown & Tasks

### Epic 1: The Dual Economy (Net Worth & The Shop)
**Description:** Implement the personal wealth system and the ability to buy mental health recovery.
* [x] **Task 1.1:** Update `PlayerStats` state to include `netWorth` (integer, starts at 0).
* [x] **Task 1.2:** Update `End Cycle` logic: Award base salary to `netWorth` based on `currentLevel` (e.g., L3 = $5k/cycle, L4 = $8k/cycle).
* [x] **Task 1.3:** Build a `PerksShop` component (a modal or a slide-out panel, using Tailwind `bg-zinc-800` to match the dark aesthetic).
* [x] **Task 1.4:** Add purchasable Burnout reduction items: "Mental Health Day" (Cost: $2k, -15% Burnout) and "Hawaii Vacation" (Cost: $15k, sets Burnout to 0%). Deduct Net Worth and apply stat changes on purchase.

### Epic 2: The Reputation System (MGB & Senior Consult)
**Description:** Refactor how the player asks for help, turning it into a balancing act of reputation and autonomy.
* [x] **Task 2.1:** Replace the old `managerSlots` state with `managerGoodBooks` (MGB) (integer, 0-100, starts at 80%).
* [x] **Task 2.2:** Update the UI in `StatsPanel` to display MGB as a percentage progress bar (similar to Autonomy).
* [x] **Task 2.3:** Add `[Senior Consult]` button next to `[Drink Coffee]`. Logic: Grants +20 Bandwidth instantly, but reduces `Autonomy` by -10% and costs -5% MGB.
* [x] **Task 2.4:** Update the "Escalate" action on Action Items. Logic: Instantly completes the task, but costs -15% MGB and -15% Autonomy.

### Epic 3: Advanced Chaos & The Tool Chest
**Description:** Expand the RNG events to mirror corporate reality and give the player defensive items to counter them.
* [x] **Task 3.1:** Update the `ChaosEngine` RNG list with new negative events: "Mandatory Team Meeting" (-15 BW), "Optional Team Outing" (-10 BW, +5% MGB), "PM Status Update" (-10 BW), "Re-org" (Shuffles all To-Do items, adding +5 base complexity to them).
* [x] **Task 3.2:** Update `PlayerStats` to include an `inventory` array for Tool Chest items.
* [x] **Task 3.3:** Add Tools to the `PerksShop` and as random rewards for completing Cycles with high Impact. Examples: "Noise Canceling Headphones" (blocks one Meeting/PM event), "ChatGPT Plus Subscription" (Passive: all Grind actions cost 1 less BW for one Cycle).
* [x] **Task 3.4:** Wire the Tool Chest to the Chaos Engine. Before applying a negative RNG event (like "PM Status Update"), check if the player has the counter-tool ("Headphones"). If yes, negate the penalty, display a "Blocked by Tool" toast/message, and consume the tool.
