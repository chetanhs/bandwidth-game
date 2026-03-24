# Technical Specification: Bug Fixes & UX Coherence (Phase 11)

## Epic 1: Economy & State Handlers (Bugs 10, 11, 13, 14, 4)
**Description:** Fix the broken onClick handlers and state transitions in the Shop, Inventory, and Job Board.
* [x] **Task 1.1:** Fix the `Buy Vacation` and `Costly Consultant` buttons in the Shop. Wire them to actually deduct `Net Worth` and apply the correct stat changes (Burnout to 0, or instantly complete a task).
* [x] **Task 1.2:** Fix the `Job Board` Net Worth bug. `CareerNetWorth` must persist properly when switching to FAANG, rather than resetting to 0 and jumping randomly.
* [x] **Task 1.3:** Fix the `Headphones` item. Remove the auto-apply logic from the `ChaosEngine`. Make it a clickable item in the Inventory. Add a "Battery Life" state (e.g., 3 uses) and add a "Battery Pack" item to the Shop to recharge it.
* [x] **Task 1.4:** Ensure `Burnout` correctly decreases when vacations or specific tools are used.

## Epic 2: UI Clarity & The Active HUD (Bugs 2, 3, 6, 7, 8, 9)
**Description:** The player needs to see what effects are active and have context for their stats.
* [x] **Task 2.1:** Create an `Active Perks` HUD below the Cycle Timer. If "10x Developer" or "Ship Dirty" is active, display a small badge here so the player knows *why* things are happening.
* [x] **Task 2.2:** Restore the `XP Progress Slider` to the left sidebar, showing `Current XP / XP Needed for Next Level`.
* [x] **Task 2.3:** Relocate the `Faction Reputations` (Product/Eng/Sales). Move them out of the scrollable sidebar and integrate them into the `CycleSummaryModal` or the `ActionCard` completion tooltips so they feel tied to the actual game loop.
* [x] **Task 2.4:** Make the `Tool Chest` inventory items explicitly clickable buttons.

## Epic 3: Game Balance & Logic Coherence (Bugs 1, 5, 12)
**Description:** Fix the math so the game is actually playable and the narrative matches the stats.
* [x] **Task 3.1:** Rebalance XP vs. Burnout. Tasks currently give too much XP or cost too much Burnout. Reduce the Burnout penalty per task by 30% for L3 and L4.
* [x] **Task 3.2:** Implement Manager Impression (`MGB`) recovery. If a player completes a cycle where `Total XP Gained > (Level Base Requirement * 1.5)`, grant `+15% MGB`.
* [x] **Task 3.3:** Fix the `Performance Review` mismatch. If `Total XP` exceeds the promotion threshold and `MGB` > 40%, it MUST be a Promotion. Ensure the feedback text string strictly matches the outcome (PIP vs. Promo).
