# Technical Specification: "Bandwidth" (Phase 7 - Pacing, Interstitials & XP Refactor)

## 1. Feature Adjustments
* **Delayed XP Economy:** Completing tasks no longer instantly adds to the global XP/Impact pool. Instead, it accrues as `pendingXP`. The global XP number only updates during the End of Cycle interstitial.
* **UI Declutter:** The XP/Impact progress bar is removed from the left `StatsPanel`. Total XP is now a raw number displayed in the top right `TopNav`.
* **Cycle Interstitial:** A celebratory full-screen overlay that pauses the game between cycles, tallies rewards, animates stat restorations, and dispenses loot before the next cycle begins.
* **Evil Re-org:** The Re-org RNG event now checks if `TODO` is empty. If it is, it creates a new "Urgent Strategy Alignment" task from thin air to ensure the player is properly punished.

## 2. Epic Breakdown & Tasks

### Epic 1: The XP & UI Refactor
**Description:** Separate earned XP from global XP and clean up the sidebar.
* [x] **Task 1.1:** Update global state to include `pendingXP` (integer, starts at 0). Rename `impact` to `totalXP` everywhere for consistency.
* [x] **Task 1.2:** Update `ActionCard` completion logic: Moving a card to `Done` adds to `pendingXP` instead of `totalXP`.
* [x] **Task 1.3:** Remove the Impact/XP progress bar component entirely from the left `StatsPanel`.
* [x] **Task 1.4:** Update `TopNav`: Add a clean, monospace XP counter to the top right (e.g., `XP: 1,250`).
* [x] **Task 1.5:** Update Promotion/Boss logic: Winning a Performance Review now grants a flat `+500 XP` Promotion Bonus.

### Epic 2: The Re-org Fix (True Corporate Chaos)
**Description:** Make the Re-org event dangerous even if the player is highly efficient.
* [x] **Task 2.1:** Locate the Re-org event logic in the `ChaosEngine`.
* [x] **Task 2.2:** Add a conditional: If the `TODO` array length is `0`, generate a new `ActionItem` titled "Pivot Strategy for Re-org" with a high base cost and push it to the `TODO` column.
* [x] **Task 2.3:** If `TODO` is NOT empty, retain the original logic (shuffle and increase complexity).

### Epic 3: The Interstitial Screen (Dopamine Hit)
**Description:** Build the end-of-cycle summary screen.
* [x] **Task 3.1:** Create a `CycleSummaryModal` component (full-screen, dark zinc background). It should only mount when `End Cycle` is clicked, preventing the next cycle from starting immediately.
* [x] **Task 3.2:** Render a celebratory pixel art graphic at the top using the existing `PixelSprite` engine (e.g., a Trophy or a "Level Up" arrow).
* [x] **Task 3.3:** Display the math summary: Show `pendingXP` being added to `totalXP`. Show Net Worth earned this cycle.
* [x] **Task 3.4:** Animate Bandwidth: Create a visual ticker or a CSS transition that shows the Bandwidth bar filling back up from its current level to 100.
* [x] **Task 3.5:** Reward Drop: Implement a 50% chance to grant the player a random Tool Chest item (e.g., "Noise Canceling Headphones") on this screen.
* [x] **Task 3.6:** Add a primary `[Start Next Cycle]` button that unmounts the modal, resets `pendingXP` to 0, and officially increments the calendar.
