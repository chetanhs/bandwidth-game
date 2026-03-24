# Technical Specification: Final UI/UX Polish & Active Perks (Phase 14)

## Epic 1: TopNav Spacing & Layout
**Description:** The header is currently crowded and smushed. It needs breathing room and proper alignment.
* [x] **Task 1.1:** Refactor the `TopNav` container. Apply a `flex justify-between items-center w-full px-6 py-4` layout.
* [x] **Task 1.2:** Group the left-side elements (Role, Cycle, Level) into a `flex gap-6` container. Add a subtle vertical divider (`border-l border-zinc-700 mx-4`) between logical groups.
* [x] **Task 1.3:** Group the right-side elements (Perk Badges, Timer, End Cycle button) into a `flex items-center gap-4` container to prevent overlap.

## Epic 2: Unified 8-Bit Iconography
**Description:** Emojis and standard SVGs break the immersion. Everything must match the retro pixel-art aesthetic.
* [x] **Task 2.1:** Replace the existing icons for 'Coffee', 'Consult', 'Headphones', 'Vacation', and any other Shop items. Use CSS-drawn pixel grids or a consistent 8-bit SVG style (similar to the Player Face avatar).
* [x] **Task 2.2:** Increase the visual weight of the 'Recovery Actions' (Coffee/Consult). Ensure the icons are at least `w-8 h-8` and the layout prevents the text/icons from being hidden behind the sidebar boundary.

## Epic 3: Playable Perks (The Defense Mechanics)
**Description:** Perks in the header must be playable responses to Chaos Events, not just static badges.
* [x] **Task 3.1:** Map specific Perks to specific RNG Chaos Events:
    * `Rubber Duck`: Counters "Bug in Prod" events.
    * `Blame Shifter`: Counters "Scope Creep" or "PM Change" events.
    * `10x Dev`: Counters "Architecture Review" events.
    * `Caffeine Addict`: Counters "Late Night Ping" events.
* [x] **Task 3.2:** Update the `ChaosModal` component. When a Chaos Event fires, check the player's active Perks. If they hold the counter-perk, render a prominent, glowing button inside the modal: `[Play Perk: {Perk Name}]`.
* [x] **Task 3.3:** Wire the `onClick` handler: Clicking the perk button instantly resolves the Chaos Event, negates the Bandwidth penalty, and closes the modal. (If these perks are single-use, remove them from the UI; if they are permanent, add a visual "cooldown" state to the header badge).
* [x] **Task 3.4:** Add a visual pulse/glow animation to the corresponding Perk badge in the `TopNav` while the relevant Chaos Modal is open, drawing the player's eye to their available defense.