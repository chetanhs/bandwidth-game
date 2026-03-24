# Technical Specification: The Lead Magnet Pivot (Phase 13)

## Epic 1: Removing the Paywall
**Description:** The game is now 100% free. Remove all commercial friction.
* [x] **Task 1.1:** Delete the `ProUnlockModal` component and remove `isProUser` from the global state.
* [x] **Task 1.2:** Ensure the player can progress from L4 to L5 (and up to L10) seamlessly without any interruptions or purchase prompts.
* [x] **Task 1.3:** Audit the `PerksShop` and `JobBoard`. Remove any `$0.99` or real-money text. Ensure all costs strictly use the `netWorth` state integer.

## Epic 2: The "Consistent Coder" Funnel Screens
**Description:** Redesign the End States to drive traffic to `clauderules.net`.
* [x] **Task 2.1:** Overhaul the `GameOverModal` (triggered on PIP). Use the layout: Retro red warning text -> Divider -> Modern sleek CTA.
* [x] **Task 2.2:** Add the Primary CTA button to the `GameOverModal`: "Master your craft: Read The Consistent Coder ↗". Wire it to open `https://clauderules.net` in a new tab (`target="_blank" rel="noopener noreferrer"`).
* [x] **Task 2.3:** Overhaul the `GameWonModal` (triggered on reaching L10/CEO). Use the layout: Gold/Yellow hollow victory text -> Divider -> Modern sleek CTA.
* [x] **Task 2.4:** Add the exact same Primary CTA button to the `GameWonModal`.
* [x] **Task 2.5:** Ensure both modals have a subdued secondary button to reset the global state and start a new run (e.g., "Take Severance & Restart").

## Epic 3: URL Parameter Tracking (Optional but highly recommended)
**Description:** Know where your blog traffic is coming from.
* [x] **Task 3.1:** Update the `href` on the CTA buttons to include UTM parameters so analytics can track the source.
* Use this exact URL: `https://clauderules.net/?utm_source=bandwidth_game&utm_medium=web_app&utm_campaign=game_over_screen`