# Technical Specification: UX Polish & State Simplification (Phase 12)

## Epic 1: The Faction Purge & XP Reset
**Description:** Remove confusing systems and clarify the promotion track.
* [x] **Task 1.1:** Completely remove the Faction System (Product, Engineering, Sales) from global state, `StatsPanel`, `ActionCard` modifiers, and the `CycleSummaryModal`.
* [x] **Task 1.2:** Refactor the XP System. Remove "Total Career XP". Rename XP to `levelXP`.
* [x] **Task 1.3:** Update Promotion Logic: When a player is promoted to the next level, reset `levelXP` to `0`.
* [x] **Task 1.4:** Update the UI displays (Sidebar and TopNav) to read: "XP Target for L[Next Level]: [levelXP] / [requiredXP]".

## Epic 2: Active Inventory & Contextual Items
**Description:** Make tools accessible and vacations instantly functional.
* [x] **Task 2.1:** Fix the Shop Vacations ("Mental Health Day", "Hawaii"). These should NOT go to inventory. Clicking 'Buy' must instantly deduct the money, reduce Burnout, and show a success toast.
* [x] **Task 2.2:** Create an `InventoryToolbar` component fixed to the right side of the screen (overlaying the right margin of the 'Done' column). Render currently owned tools (like Headphones) here as clickable buttons with tooltips.
* [x] **Task 2.3:** Wire contextual item usage into the `ChaosModal`. If a "Status Update" or "Meeting" RNG event fires, check if the player owns an "Offline Update" or "Headphones". If yes, render a prominent green button inside the modal: `[Use Tool: Bypass Event]`. Clicking it consumes the item, closes the modal, and negates the BW penalty.

## Epic 3: Layout Fixes & Clarity
**Description:** Fix clipping, cramped buttons, and missing explanations.
* [x] **Task 3.1:** Add standard `title` attributes or hover-tooltips to the Perk badges in the `TopNav` (Rubber Duck, Blame Shifter, 10x Dev) explaining exactly what they do.
* [x] **Task 3.2:** Refactor the "Recovery Actions" in the left `StatsPanel`. Change the layout from a row to a `flex-col` so Coffee and Consult are stacked vertically. Make them full width. Add subtext below the button labels explaining their exact stat costs/benefits.
* [x] **Task 3.3:** Fix the `CycleSummaryModal` top clipping. The PixelSprite at the top of the modal is being cut off. Add `mt-8` or adequate padding to the modal container to ensure the 8-bit art is fully visible.

## Epic 4: Chaos Engine Balancing
**Description:** Prevent the RNG from making the game unplayable.
* [x] **Task 4.1:** Add a `chaosEventsThisCycle` counter to the cycle state.
* [x] **Task 4.2:** Cap the misery. The `ChaosEngine` must not fire more than 2 negative interruption events per cycle. Once the cap is hit, disable negative RNG for the remainder of the 90-second sprint.