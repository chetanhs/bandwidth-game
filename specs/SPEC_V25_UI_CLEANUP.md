# Technical Specification: UI Cleanup & Art Unification (Phase 25)

## Epic 1: The Consult Modal Context
**Description:** The player needs to know their current resources before hiring a costly consultant.
* [ ] **Task 1.1:** Open the `SeniorConsultModal` (or the component handling the Consultant interactions).
* [ ] **Task 1.2:** Retrieve the player's current `network` (or `netWorth`, depending on which currency is used to hire the consultant) from the global `PlayerStats` context.
* [ ] **Task 1.3:** Render this stat at the top of the modal, matching the exact visual styling used in the `ShopModal` header (e.g., `<span className="text-amber-400">Current Network: {network}</span>`).

## Epic 2: Purging the Cosmetics Tab
**Description:** The Cosmetics feature is incomplete and distracts from the core game. Remove it entirely.
* [ ] **Task 2.1:** Open the `ShopModal` component.
* [ ] **Task 2.2:** Remove the tab navigation UI (`[ Perks & Tools ]` | `[ Cosmetics ]`).
* [ ] **Task 2.3:** Delete all rendering logic, state variables, and mock data associated with the Cosmetics store. The Shop should now natively just display the list of functional Perks, Tools, and Vacations without requiring tab selection.

## Epic 3: 8-Bit Iconography (The Final Polish)
**Description:** "Offline Update" and "Review Buddy" are breaking the retro immersion.
* [ ] **Task 3.1:** Locate the rendering logic for the "Offline Update" item (likely in the Shop and the InventoryToolbar). Replace any standard emojis or high-res SVGs with a custom CSS-drawn pixel grid or a blocky, 8-bit style SVG (e.g., a pixelated floppy disk or folder).
* [ ] **Task 3.2:** Locate the rendering logic for the "Review Buddy" item. Replace its icon with a pixelated 8-bit style icon (e.g., a pixelated pair of glasses or a small robot face).
* [ ] **Task 3.3:** Ensure these new pixel icons match the sizing and hover states of the existing `Coffee`, `Consult`, and `Headphones` icons in the right-hand `InventoryToolbar`.