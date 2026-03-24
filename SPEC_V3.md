# Technical Specification: "Bandwidth" (Phase 3 - Game Feel & Friction)

## 1. Current State Assessment
* **Working:** State management, `End Cycle` progression, Level 1 -> Boss -> Level 2 (Engineering Manager) transitions, "Rush" and "Escalate" mechanics, PIP/Game Over evaluation logic.
* **Missing:** The "Grind" friction, Random Events (Chaos), and UI danger warnings.

## 2. Epic Breakdown & Tasks

### Epic 1: The Friction Engine (The "In Progress" Grind)
**Description:** Stop tasks from instantly completing. Force players to spend Bandwidth incrementally.
* [x] **Task 1.1:** Update the `ActionItem` state interface to include a `progress` integer (0 to 100).
* [x] **Task 1.2:** Modify the "Work" button on `To Do` cards. Clicking it no longer completes the task; it simply moves the card to the `In Progress` column.
* [x] **Task 1.3:** Add a "Grind" button to cards in the `In Progress` column.
* [x] **Task 1.4:** Implement "Grind" logic: Each click adds +25 to the card's `progress` and deducts 5 Bandwidth. When `progress >= 100`, the card automatically moves to `Done` and awards its Impact.

### Epic 2: The Chaos Engine (Random Encounters)
**Description:** Introduce RNG to disrupt the player's math and force strategic adaptation.
* [x] **Task 2.1:** Create a `ChaosModal` component that overlays the dashboard to announce random events.
* [x] **Task 2.2:** Wire a 15% RNG trigger into the new "Grind" button click handler. If triggered, pause the game state and display the `ChaosModal`.
* [x] **Task 2.3:** Implement 3 random events:
    * *Scope Creep:* "The PM added a requirement." -> Current task requires +25 more progress to finish.
    * *PagerDuty Alert:* "Prod is down." -> Instantly drains 15 Bandwidth.
    * *Flow State:* "You put your headphones on." -> Restores 20 Bandwidth.

### Epic 3: Danger Visibility (UI Warnings)
**Description:** Warn the player before they ruin their Performance Review.
* [x] **Task 3.1:** Update the `StatsPanel` progress bars. If `Project Debt` goes above 50, change its bar color to bright red (`bg-red-500`) and make it pulse (`animate-pulse`).
* [x] **Task 3.2:** If `Autonomy` drops below 50%, change its color to amber/orange to warn the player they are relying too much on "Escalate".
* [x] **Task 3.3:** Add a small tooltip or text warning under the Debt and Autonomy bars that appears when they are in the danger zone: *"Warning: PIP Risk High"*.
