# Technical Specification: Mini-Game Rebalance & Visual Overhaul (Phase 22)

## Epic 1: PM Fist Fight Rebalance (Slower, Fairer)
**Description:** The PM's initial surge is currently too overpowering. Adjust the math to give the user a viable fighting chance.
* [x] **Task 1.1:** Open `PmFistFight.tsx` (or the component logic where the PM's attack interval is defined).
* [x] **Task 1.2:** Adjust the Phase 1 (Synergy Surge) logic (Seconds 0-3). Reduce the PM's attack power by **30%**. If the original spec was `-4` dominance every 100ms, change it to `-2.8` every 100ms.
* [x] **Task 1.3 (Player Tweak):** Slightly increase the 'F' mash power. If one press gave `+2`, increase it to `+2.2`. This ensures that aggressive mashing can hold the line, rather than just slowing the decay.

## Epic 2: Avoid The Manager - 8-Bit Theme (Iconography)
**Description:** Replace simple dots with unified pixel-art sprites matching the game's overall zinc/terminal aesthetic.
* [x] **Task 2.1:** Create or implement two new SVG or CSS-drawn pixelated sprites:
    * **Player Sprite:** A highly pixelated face/avatar in electric blue.
    * **Manager Sprite:** An angry, red-tinted pixelated face.
* [x] **Task 2.2:** Update `AvoidTheManager.tsx` to render these sprites in place of the generic CSS colored squares in the 20x20 grid.

## Epic 3: Avoid The Manager - The Cubicle Office Layout
**Description:** Convert the open grid arena into a "cubicle farm" maze with static walls that block both the player and the manager.
* [x] **Task 3.1 (Map Matrix):** Create a static 2D array (Matrix) representing the 20x20 arena.
    * `0` = Walkable Pathway (hallway).
    * `1` = Obstacle (Cubicle wall).
* [x] **Task 3.2 (Layout Design):** Populate the matrix to create a simple cubicle layout (e.g., several 2x2 cubicle blocks surrounded by 1-cell wide hallways). Do not make the maze solvable/winnable; the player just needs pathways to loop around the obstacles for 10 seconds.
* [x] **Task 3.3 (Visual Styling):** Update the CSS rendering of the grid cells. Cells with value `1` (walls) must be rendered as opaque, zinc-colored blocks with a "desk clutter" pixel-art texture. Walkable cells (`0`) use the standard dark floor texture.
* [x] **Task 3.4 (Collision Detection):** Update both the Player move listener and the Manager move interval. Add a conditional check: before moving to a new cell, verify the map matrix value at that location is `0`. If `1`, the move is blocked.
* [x] **Task 3.5 (Pathfinding Update):** The manager's greedy pathfinding (move directly towards player) must be updated to account for collision. The manager should not try to move directly through a cubicle wall. (Use a simple Breadth-First Search (BFS) or greedy logic with "next available walkable step" check).
