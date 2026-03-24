# Technical Specification: Core Logic Hotfix (Phase 11.5)

## 1. Faction Reputations (The Missing Link)
**Problem:** Factions exist in UI but don't impact gameplay.
**Fix:** Wire them directly into the Failure/Reward loop.
* [x] **Task 1.1:** Update the `Performance Review` logic. Add a hard fail condition: If *any* Faction Reputation (Product, Eng, or Sales) is below 20% at the end of a cycle, the player is automatically put on a PIP, regardless of their XP or MGB. 
* [x] **Task 1.2:** Update `ActionCard` rewards. If Product Rep is > 80%, all tasks grant +10% extra XP. If Eng Rep is > 80%, all tasks cost -10% less Complexity. 

## 2. Inventory Interaction (Vacations & Items)
**Problem:** Items sit in the Tool Chest and cannot be used.
**Fix:** Make the Tool Chest an interactive, consumable state manager.
* [x] **Task 2.1:** Update the `ToolChest` / `Inventory` UI component. Every item must be rendered as an HTML `<button>` with an `onClick` handler.
* [x] **Task 2.2:** Wire the `onClick` for "Vacation". When clicked: 1) Verify item exists in inventory array, 2) Set `Burnout` to `0`, 3) Remove "Vacation" from the inventory array.
* [x] **Task 2.3:** Add a visual toast/notification saying "Vacation Used: Burnout Reset" when clicked.

## 3. Manual Buff Activation (Noise Canceling Headphones)
**Problem:** Headphones auto-trigger against random events. They need to be manual and battery-operated.
**Fix:** Introduce an `Active Buffs` state.
* [x] **Task 3.1:** Remove the auto-block logic from the `ChaosEngine`.
* [x] **Task 3.2:** Update the Headphones item to have a `batteryLife` property (starts at 3).
* [x] **Task 3.3:** Wire the `onClick` for Headphones in the `ToolChest`. When clicked, it moves from `Inventory` into a new `activeBuffs` global state array (showing a UI indicator that they are "ON").
* [x] **Task 3.4:** Update `ChaosEngine`: If a negative event fires, check if `activeBuffs` contains Headphones. If yes, block the event, deduct 1 `batteryLife`, and turn the buff "OFF". If `batteryLife` hits 0, delete the item.