# Technical Specification: The Header Purge (Phase 16)

## Epic 1: Clean the TopNav
**Description:** The header must be completely stripped of interactive items and perks.
* [x] **Task 1.1:** Open `TopNav`. Completely remove the rendering loop for `Active Perks` (Rubber Duck, Blame Shifter, 10x Dev, Ship Dirty, Caffeine).
* [x] **Task 1.2:** The `TopNav` should now ONLY contain: 
    * Left side: Player Role/Company
    * Middle: Cycle Count and XP Target (ensure these are spaced properly and not smushed)
    * Right side: SPRINT Timer and `End Cycle` button.

## Epic 2: Unify the Inventory Toolbar
**Description:** The right-hand toolbar is the single source of truth for all player tools and perks.
* [x] **Task 2.1:** Open `InventoryToolbar` (the right-side action bar). Render the user's active Perks here, alongside Coffee, Consult, and any Shop items.
* [x] **Task 2.2:** Transform the Perk badges from wide text boxes into square, pixel-art icon buttons to match the rest of the toolbar.
* [x] **Task 2.3:** Add descriptive hover-tooltips to these new Perk icons explaining what they do (e.g., "Rubber Duck: Counters Bug in Prod events").
* [x] **Task 2.4:** Verify that the logic from Phase 14 remains intact: owning these perks still allows the player to bypass the corresponding Chaos Events when the modal pops up.