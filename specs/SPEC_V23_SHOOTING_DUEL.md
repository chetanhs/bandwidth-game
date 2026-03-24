# Technical Specification: The 1:1 Shooting Duel (Phase 23)

## Epic 1: The Trigger Event
**Description:** Introduce the "Unscheduled 1:1" ambush.
* [x] **Task 1.1:** Update the `ChaosEngine`. Add a new event: "Unscheduled 1:1". `limit: 1` per cycle.
* [x] **Task 1.2:** The modal buttons must be: `[ Accept (-20 BW) ]` and `[ 🔫 Duel Manager ]`.
* [x] **Task 1.3:** If `Accept` is clicked, apply penalty and close. If `Duel` is clicked, PAUSE the main Sprint Timer, mount the mini-game via full-screen overlay (`bg-zinc-950`), and pass the `onComplete` callback.

## Epic 2: The Canvas Engine (`ManagerDuel.tsx`)
**Description:** A Space Invaders-style 2D shooter built on HTML5 Canvas.
* [x] **Task 2.1:** Create `ManagerDuel.tsx`. It must accept the `onComplete: (outcome: 'win' | 'lose') => void` prop.
* [x] **Task 2.2:** Initialize an HTML `<canvas>` element (`width={600} height={400}`) and a `requestAnimationFrame` game loop.
* [x] **Task 2.3 (Player Mechanics):** The player is a Blue pixel-art block at the bottom.
    * Controls: `A/D` or `Left/Right` arrows to move horizontally. `Spacebar` to fire "Pushback" projectiles (green pixels) straight up.
    * Health: Player can take 3 hits before dying.
* [x] **Task 2.4 (Manager AI):** The manager is a larger Red block at the top.
    * Movement: Ping-pongs left and right continuously.
    * Attacks: Fires "Urgent Pings" (red projectiles) straight down at randomized intervals (e.g., every 500ms - 1200ms).
    * Health: Manager takes 10 hits to defeat. Render a "Patience" health bar at the top of the canvas.
* [x] **Task 2.5 (Collision):** Implement basic AABB (Axis-Aligned Bounding Box) collision detection between projectiles and the Player/Manager blocks. Clean up projectiles that fly off-screen to prevent memory leaks.

## Epic 3: Resolution & Arcade Mode
**Description:** Wire the outcomes and add it to the test harness.
* [x] **Task 3.1 (Victory):** If Manager health hits 0, freeze the canvas loop. Show a green overlay: "RESPECT EARNED. 'Good pushback, let's sync async.'"
    * Reward (handled via callback): `+30 Autonomy`, `+15 MGB`.
* [x] **Task 3.2 (Defeat):** If Player health hits 0, freeze the canvas. Show a red overlay: "MICROMANAGED. You agreed to take on 3 more sprint points."
    * Penalty (handled via callback): `-30 Bandwidth`, `+20 Burnout`.
* [x] **Task 3.3:** Add the `[ Return to Desk ]` button to trigger the `onComplete` prop and unmount.
* [x] **Task 3.4 (Test Harness):** Open `ArcadeMode.tsx` and add a 3rd button to the menu: `[ Play: 1:1 Shooting Duel ]`. Wire it to mount the new component with mock callbacks.
