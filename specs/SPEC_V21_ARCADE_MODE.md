# Technical Specification: The Arcade Test Harness (Phase 21)

## Epic 1: Component Refactoring (Decoupling State)
**Description:** To play mini-games in isolation, they cannot directly mutate the global `PlayerStats` context. They must emit events upward.
* [x] **Task 1.1:** Open `AvoidTheManager.tsx`. Refactor it to accept an `onComplete` prop: `(outcome: 'win' | 'lose') => void`. Remove all direct global state mutations (e.g., setting Burnout/Bandwidth) from inside this component. Call `onComplete` instead.
* [x] **Task 1.2:** Open `PmFistFight.tsx`. Refactor it to also accept an `onComplete` prop: `(outcome: 'win' | 'lose') => void`. Remove global state mutations and use the callback.
* [x] **Task 1.3:** Go back to the main `Dashboard.tsx` where these games are normally triggered, and wire the `onComplete` callbacks there to actually apply the global stat penalties/rewards (mapping `win/lose` → `survived/caught` and `victory/defeat` respectively).

## Epic 2: The Arcade Menu UI
**Description:** Build the entry point for the Test Mode.
* [x] **Task 2.1:** Create a new component `ArcadeMode.tsx`. This is a full-screen, standalone view (independent of the main game loop).
* [x] **Task 2.2:** Add a small, subdued `[ Test Labs ]` button to the bottom-right corner of the main Start Screen that mounts the `ArcadeMode` component (wired through `App.tsx` with `showArcade` state).
* [x] **Task 2.3:** Inside `ArcadeMode.tsx`, render a menu with three options:
    1. `[ Play: Avoid The Manager ]`
    2. `[ Play: PM Fist Fight ]`
    3. `[ Return to Main Menu ]`

## Epic 3: The Isolated Runner
**Description:** Mount the games and mock the results.
* [x] **Task 3.1:** Add local state to `ArcadeMode.tsx`: `const [activeGame, setActiveGame] = useState<'menu' | 'pacman' | 'fight'>('menu')`.
* [x] **Task 3.2:** When a game is selected, unmount the menu and mount the respective mini-game component.
* [x] **Task 3.3:** Pass a mock `onComplete` function to the mini-games. When the game ends, the mock function displays an in-component result toast (`"Avoid The Manager: WIN ✓"` / `"PM Fist Fight: LOSE ✗"`) and instantly resets `activeGame` back to `'menu'`.
