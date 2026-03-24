# Technical Specification: E2E Testing the Canvas Duel (Phase 24)

## Epic 1: Exposing the Debug Hook
**Description:** Playwright cannot easily play a 60-FPS canvas shooter. We need a window hook strictly for testing the outcome math.
* [x] **Task 1.1:** Open `ManagerDuel.tsx`.
* [x] **Task 1.2:** Add a `useEffect` that attaches a debug function to the window object: `window.__DEBUG_RESOLVE_DUEL__ = (outcome: 'win' | 'lose') => onComplete(outcome);`. Ensure this is cleaned up when the component unmounts.

## Epic 2: The Playwright Suite (`tests/manager-duel.spec.ts`)
**Description:** Write the assertions to prove the game loop and math are flawless.
* [x] **Task 2.1:** Create a new test file: `tests/manager-duel.spec.ts`.
* [x] **Task 2.2:** Write Test 1: **Arcade Mode Mounting**.
    * Navigate to `/`. Click `[ Test Labs ]` -> Click `[ Play: 1:1 Shooting Duel ]`.
    * Assert that the `<canvas>` element is visible on the page.
    * Assert the `[ Return to Desk ]` button exists.
* [x] **Task 2.3:** Write Test 2: **Game Loop Integration & Pause**.
    * Inject the `Unscheduled 1:1` Chaos Event into the active game loop.
    * Assert the modal appears. Click `[ 🔫 Duel Manager ]`.
    * Assert the main `Sprint Timer` stops counting down.
* [x] **Task 2.4:** Write Test 3: **Victory State Math**.
    * Trigger the duel in the main game loop.
    * Read the current `Autonomy` and `MGB` from the DOM.
    * Execute `await page.evaluate(() => window.__DEBUG_RESOLVE_DUEL__('win'));`.
    * Click `[ Return to Desk ]`.
    * Assert that `Autonomy` increased by 30 and `MGB` increased by 15.
    * Assert the Sprint Timer resumes.
* [x] **Task 2.5:** Write Test 4: **Defeat State Math**.
    * Trigger the duel. Read current `Bandwidth` and `Burnout`.
    * Execute `await page.evaluate(() => window.__DEBUG_RESOLVE_DUEL__('lose'));`.
    * Click `[ Return to Desk ]`.
    * Assert that `Bandwidth` decreased by 30 and `Burnout` increased by 20.
