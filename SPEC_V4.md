# Technical Specification: "Bandwidth" (Phase 4 - Economy & Onboarding)

## 1. Feature Additions
* **Active Replenishment (Coffee):** A consumable action that restores Bandwidth but builds Burnout. Hitting 100% Burnout triggers a "Crash" (skipped cycle, halved starting Bandwidth).
* **Contextual Tutorials:** An overlay system that pauses the game and highlights specific UI elements the first time a player encounters them.

## 2. Epic Breakdown & Tasks

### Epic 1: Active Replenishment & The Burnout Crash
**Description:** Give the player a dangerous way to get Bandwidth back instantly.
* [x] **Task 1.1:** Add a generic `[Drink Coffee]` button to the `StatsPanel`, positioned near the Burnout progress bar.
* [x] **Task 1.2:** Implement the Click Handler: `+25 Bandwidth` (capped at 100) and `+15 Burnout`.
* [x] **Task 1.3:** Implement the "Burnout Crash": If `Burnout >= 100`, trigger a modal stating the player had a breakdown. Force an `End Cycle` action, but for the *next* cycle, set starting Bandwidth to `50` (instead of 100) and reset Burnout to `0`.

### Epic 2: The Tutorial Engine (Contextual Tooltips)
**Description:** Build a system to track and display onboarding messages without interrupting the core game loop permanently.
* [x] **Task 2.1:** Update global state to include a `tutorialState` object (e.g., `{ seenWelcome: false, seenGrind: false, seenRush: false }`).
* [x] **Task 2.2:** Build a `TutorialOverlay` component. It should darken the background (`bg-black/50`), highlight a specific target DOM element, and display a text box with an "Understood" button.
* [x] **Task 2.3:** Implement Tutorial 1 (Welcome): Triggers immediately on Level 1 start. Explains the goal (Impact) and the resource (Bandwidth).
* [x] **Task 2.4:** Implement Tutorial 2 (The Grind): Triggers the first time an item moves to the `In Progress` column. Explains clicking "Grind" to finish tasks.
* [x] **Task 2.5:** Implement Tutorial 3 (The Risks): Triggers the first time Bandwidth drops below 30. Highlights the "Coffee" and "Escalate" buttons, explaining their permanent penalties to Burnout and Autonomy.

### Epic 3: Late-Game Tutorials (Level 2)
**Description:** Explain advanced mechanics only when they become available.
* [x] **Task 3.1:** Implement Tutorial 4 (Project Debt): Triggers immediately upon starting Level 2. Highlights the newly unlocked "Ship it Dirty" (Rush) button. Explains that rushing saves Bandwidth but builds Project Debt, making future tasks harder.
