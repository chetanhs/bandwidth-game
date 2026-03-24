# Technical Specification: The PM Fist Fight Mini-Game (Phase 20)

## Epic 1: The Ambush Trigger
**Description:** Introduce the "Client Call" event and the fight option.
* [x] **Task 1.1:** Update the `ChaosEngine`. Add a new event: "Client Call Ambush". Ensure it has `limit: 1` per cycle.
* [x] **Task 1.2:** The modal for this event must have two buttons: `[ Accept Call (-30 BW) ]` and `[ 🥊 Challenge PM to Combat ]`.
* [x] **Task 1.3:** If `Accept` is clicked, apply the penalty and close the modal. If `Combat` is clicked, PAUSE the main Sprint Timer and render a high-z-index, full-screen overlay (`bg-zinc-950`) to mount the mini-game.

## Epic 2: The Combat Engine (`PmFistFight.tsx`)
**Description:** A tug-of-war button masher where the PM has a strong early advantage.
* [x] **Task 2.1:** Create `PmFistFight.tsx`. The UI should feature two 8-bit pixel avatars facing each other (Player on left, PM on right) with a massive "DOMINANCE" progress bar spanning the screen between them.
* [x] **Task 2.2 (The State):** The bar ranges from `0` (PM wins) to `100` (Player wins). It starts exactly at `50`.
* [x] **Task 2.3 (Player Mechanics):** Add a global `keydown` event listener for the `'f'` or `'F'` key. Every press adds `+2` to the Dominance bar. Add CSS animations to make the player's pixel avatar "punch" on keypress.
* [x] **Task 2.4 (The PM Logic & The Trap):** Create a `setInterval` that fires every 100ms to simulate the PM fighting back.
    * **Phase 1 (Seconds 0 to 3):** The PM has a "Synergy Surge". They subtract `-4` from the Dominance bar every 100ms. (The player will lose ground here, building panic).
    * **Phase 2 (Seconds 3+):** The PM runs out of buzzwords. They now only subtract `-0.5` every 100ms. (The player can now easily overpower them by mashing 'F').

## Epic 3: Resolution & Knockouts
**Description:** Returning to the sprint with the consequences of physical violence.
* [x] **Task 3.1 (Victory):** If Dominance hits `100`, freeze the game. Show a green screen: "K.O. The PM retreats to update Jira."
    * Reward: `+20 Autonomy`, `+10 Bandwidth`, `-10 Burnout`.
* [x] **Task 3.2 (Defeat):** If Dominance hits `0`, freeze the game. Show a red screen: "DEFEATED. You are now sharing your screen on the client call."
    * Penalty: `-40 Bandwidth`, `-20 MGB`.
* [x] **Task 3.3:** Render a `[ Return to Desk ]` button on both outcome screens. Clicking it unmounts the combat component, applies the stats, and RESUMES the main Sprint Timer.
