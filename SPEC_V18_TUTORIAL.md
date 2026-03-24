# Technical Specification: First-Time User Tutorial (Phase 18)

## Epic 1: Tutorial State Management
**Description:** The tutorial should only play once per user, but needs to be tracked robustly.
* [x] **Task 1.1:** Add a `hasSeenTutorial` boolean to the global game state and ensure it persists in `localStorage` so refreshing doesn't force them to replay it.
* [x] **Task 1.2:** Create a `TutorialOverlay` component that only renders if `hasSeenTutorial` is false and the game is in the active 'Sprint' state.

## Epic 2: The Spotlight Tour Component
**Description:** Build a full-screen overlay that highlights specific parts of the UI step-by-step.
* [x] **Task 2.1:** The `TutorialOverlay` should be a `fixed inset-0 z-50 bg-black/80` container to dim the background.
* [x] **Task 2.2:** Create a state variable `currentStep` (starting at 0).
* [x] **Task 2.3:** Build a floating dialog box in the center (or near the highlighted element) using the retro terminal aesthetic (dark zinc background, monospace font, green/amber text). Include a "Next ->" button and a subdued "Skip Tutorial" button.
* [x] **Task 2.4 (The Spotlight Effect):** For each step, apply a temporary relative/z-index bump (e.g., `z-[60] relative bg-zinc-900 rounded shadow-[0_0_15px_rgba(255,255,255,0.2)]`) to the actual UI elements being highlighted so they "pop out" of the darkened background.

## Epic 3: The Corporate Script (The Steps)
**Description:** The step-by-step sequence to teach the core loop.
* [x] **Task 3.1: Step 1 (The Clock).** * Highlight: The TopNav (Specifically the Timer and End Cycle button).
    * Text: "Welcome to your new role. Sprints happen in real-time. You have 90 seconds to complete your tickets before the cycle ends. Watch the clock."
* [x] **Task 3.2: Step 2 (The Grind).** * Highlight: The 'To Do' column.
    * Text: "Click 'Work' to push code. It costs Bandwidth, but earns XP for your next promotion."
* [x] **Task 3.3: Step 3 (The Cost of Business).** * Highlight: The Left Sidebar (Burnout & Bandwidth meters).
    * Text: "If Bandwidth hits 0, you can't work. If Burnout hits 100%, you will be placed on a PIP and fired. Manage your energy."
* [x] **Task 3.4: Step 4 (The Lifelines).** * Highlight: The Right Inventory Toolbar (Coffee/Consult icons).
    * Text: "Need a boost? Drink coffee or consult your manager. But be careful—every corporate lifeline comes with a toxic trade-off."
* [x] **Task 3.5: Step 5 (The End).**
    * Highlight: None (Center modal).
    * Text: "Watch out for unannounced 'Quick Syncs' from your PM. Good luck. Don't disappoint the shareholders."
    * Button: `[ Start Sprint ]` (This sets `hasSeenTutorial` to true, unpauses the timer, and removes the overlay).
