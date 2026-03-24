# Technical Specification: Consolidating Active Tools (Phase 15)

## Epic 1: The Left Sidebar Purge
**Description:** The left sidebar should only display passive stats. Active buttons must be removed.
* [x] **Task 1.1:** Open the `StatsPanel` (or equivalent left sidebar component). Completely remove the "Recovery actions" section (the Coffee and Consult buttons).

## Epic 2: The Universal Action Toolbar (Right Side)
**Description:** All playable actions (Coffee, Consult, Headphones, Offline Updates) must live in the right-hand `InventoryToolbar`.
* [x] **Task 2.1:** Move the `Coffee` and `Consult` buttons into the `InventoryToolbar` component on the right side of the screen.
* [x] **Task 2.2:** Transform them from wide text buttons into square icon buttons (matching the size and pixel-art style of the Headphones). 
* [x] **Task 2.3:** Add rich hover-tooltips to these icons so the player knows the exact math. 
    * Coffee tooltip: `Coffee: +25 BW, +15 Burnout`
    * Consult tooltip: `Consult: +20 BW, -10 Autonomy, -5 MGB`
* [x] **Task 2.4:** Ensure their `onClick` state logic remains perfectly intact (Coffee still restores Bandwidth/increases Burnout, etc.).

## Epic 3: Header Text Un-Smushing (TopNav Fix)
**Description:** The text for Cycle count and XP target is bleeding into each other.
* [x] **Task 3.1:** Open the `TopNav` component. Separate the "Cycle" text and "XP" text into their own distinct `<div>` or `<span>` blocks. 
* [x] **Task 3.2:** Do not let them sit side-by-side if space is tight. Stack them vertically (`flex-col`) OR put a very hard minimum width and margin between them (e.g., `min-w-[150px] mr-4`) so "Cycle 3/10" never touches the XP text.