# Technical Specification: The "Avoid The Manager" Mini-Game (Phase 19)

## Epic 1: The Trigger Event & Suspense Delay
**Description:** Introduce the "Unplanned Meeting" event and the 5-second delay.
* [x] **Task 1.1:** Update the `ChaosEngine`. Add a new event: "Unplanned Team Meeting". Ensure it has a strict `limit: 1` per cycle.
* [x] **Task 1.2:** The modal for this event must have two buttons: `[ Accept ]` and `[ Skip Meeting ]`.
    * If `Accept`: Apply standard penalties (e.g., -15 Bandwidth, +10 Burnout) and close the modal.
    * If `Skip Meeting`: Close the modal, but **do not** apply penalties yet. Instead, trigger a 5-second silent `setTimeout`.
* [x] **Task 1.3:** After the 5-second delay, **PAUSE** the main Sprint Timer. Render a full-screen, high-z-index overlay (`bg-zinc-950`).
* [x] **Task 1.4:** Display the ominous warning: "Since you skipped the meeting, the manager is pissed and is now looking for you..." for 3 seconds before mounting the mini-game component.

## Epic 2: The Mini-Game Engine (`AvoidTheManager.tsx`)
**Description:** A retro, grid-based survival chase game.
* [x] **Task 2.1:** Create a new component `AvoidTheManager.tsx`. Render a 20x20 CSS grid arena (styled like a dark terminal floor).
* [x] **Task 2.2:** Player State: The player is a Blue square (or pixel face). Control movement (Up/Down/Left/Right) via keyboard arrow keys/WASD. Prevent moving out of grid bounds.
* [x] **Task 2.3:** Manager State: The manager is a Red square (or angry pixel face). Every 400ms, the manager recalculates its position to move 1 grid square closer to the player's current X/Y coordinates (basic pathfinding).
* [x] **Task 2.4:** Win Condition: The player must survive for **10 seconds** without sharing the same grid coordinates as the manager. Add a prominent countdown timer at the top of the arena.

## Epic 3: Outcomes & Resolution Transitions
**Description:** The mini-game must return the player to the main game with the correct stat changes.
* [x] **Task 3.1 (Caught):** If the Manager's coordinates equal the Player's coordinates, halt the mini-game. Show a red screen: "CAUGHT. 'We need to talk about your priorities.'"
    * Penalty: `-25 Manager's Good Books (MGB)`.
* [x] **Task 3.2 (Survived):** If the 10-second timer reaches 0, halt the mini-game. Show a green screen: "SURVIVED. You successfully hid in the server room."
    * Reward: `+30 Bandwidth`, `-15 Burnout`.
* [x] **Task 3.3:** Add a `[ Return to Desk ]` button on both outcome screens. Clicking this unmounts the mini-game, updates the global `PlayerStats`, and **RESUMES** the main 90-second Sprint Timer.
