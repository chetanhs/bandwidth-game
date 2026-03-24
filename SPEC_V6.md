# Technical Specification: "Bandwidth" (Phase 6 - Retro 8-Bit Visual Overhaul)

## 1. Feature Additions & Aesthetic Shift
* **The "DOOM" HUD:** The UI will now feature dynamic, 8-bit pixel art faces for both the Player and the Manager.
* **Zero-Image Asset Policy:** All pixel art must be generated programmatically using a `PixelSprite` React component that maps a 2D array of color codes to a CSS Grid (or SVG `shape-rendering="crispEdges"`). NO external image files are allowed.
* **Retro Overlays:** RNG events (Chaos) and Promotions will feature pixel art icons (e.g., a pixelated coffee cup, a pixelated warning sign) displayed in partial-page overlays with a retro terminal aesthetic.

## 2. Epic Breakdown & Tasks

### Epic 1: The Pixel Engine (Zero-Image Rendering)
**Description:** Build the core reusable component that draws pixel art from code.
* [x] **Task 1.1:** Create a `PixelSprite` component. It should accept a prop `matrix` (a 2D array of string color values) and a `pixelSize` (integer). It should render a grid of `div`s where each `div` is a colored square.
* [x] **Task 1.2:** Create a `SpriteLibrary.ts` file to store the 2D color arrays. Create a basic 12x12 or 16x16 template matrix.

### Epic 2: The HUD Faces (Player & Manager)
**Description:** Implement the dynamic faces that react to the game state.
* [x] **Task 2.1:** In `SpriteLibrary.ts`, design 4 Player Face matrices: `Happy` (Burnout 0-30%), `Stressed` (Burnout 31-70%), `Exhausted/Bruised` (Burnout 71-99%), and `Skeleton/Fired` (Burnout 100%).
* [x] **Task 2.2:** In `SpriteLibrary.ts`, design 3 Manager Face matrices: `Smiling` (MGB 80-100%), `Neutral` (MGB 40-79%), and `Angry/Red` (MGB 0-39%).
* [x] **Task 2.3:** Update the `StatsPanel` to display the Player Face above the Burnout bar, passing the correct matrix based on the current `burnout` state.
* [x] **Task 2.4:** Update the `StatsPanel` to display the Manager Face above the MGB bar, passing the correct matrix based on the current `managerGoodBooks` state.

### Epic 3: Retro Event Overlays (Partial Page Splashes)
**Description:** Upgrade the Chaos events and Rewards to use the new pixel art engine.
* [x] **Task 3.1:** In `SpriteLibrary.ts`, design 3x simple item matrices: `CoffeeCup`, `WarningSign` (for bad events), and `Trophy` (for promotions/rewards).
* [x] **Task 3.2:** Refactor the `ChaosModal` to be a partial-page overlay (sliding in from the bottom or popping up in the center, not taking up the whole screen).
* [x] **Task 3.3:** Inject the `PixelSprite` into the `ChaosModal`. For example, if the "Mandatory Team Meeting" event fires, show the `WarningSign` sprite next to the text.
* [x] **Task 3.4:** Apply a pixelated CSS filter or use a retro font (e.g., `'Press Start 2P'`, or a standard monospace) specifically for the text inside these overlays to complete the cartridge vibe.
