# Technical Specification: Headphones Defense Mechanic (Phase 17)

## Epic 1: Purge the RNG "Flow State"
**Description:** The game should never randomly equip headphones for the player.
* [x] **Task 1.1:** Open the `ChaosEngine` (or the file where random events are defined). Find and completely delete the "Flow State" positive random event from the event pool.

## Epic 2: The Counter-Card UI
**Description:** The player must be able to actively play their Headphones to block chatty managers.
* [x] **Task 2.1:** Open the `ChaosModal` component (the modal that pops up for random events). 
* [x] **Task 2.2:** Add conditional logic: If the current active random event is a "Status Update" or "Quick Sync", AND the player currently owns "Headphones" in their inventory, render a prominent action button inside the modal: `[ 🎧 Put on Headphones ]`.
* [x] **Task 2.3:** Style this button distinctly from the standard "Acknowledge" button so the player knows it's a special defense action (e.g., give it a green border or a glowing effect).

## Epic 3: Resolution Logic
**Description:** Playing the item must successfully block the penalty.
* [x] **Task 3.1:** Wire the `onClick` handler for the new `[ 🎧 Put on Headphones ]` button.
* [x] **Task 3.2:** When clicked:
    1. Instantly close the `ChaosModal`.
    2. Completely negate the Bandwidth penalty of the "Status Update" or "Quick Sync".
    3. Decrease the Headphone's battery life by 1 (or remove it from the `InventoryToolbar` if it is a single-use item).
    4. Fire a small success toast: "Event blocked. Back to coding."