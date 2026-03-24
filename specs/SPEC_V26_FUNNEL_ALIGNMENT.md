# Technical Specification: The Marketing & Funnel Pivot (Phase 26)

## Epic 1: The TopNav Attribution Link
**Description:** Add a persistent but subtle link to the directory so players who don't finish the game still see the brand.
* [x] **Task 1.1:** Open the `TopNav` component.
* [x] **Task 1.2:** On the far right side of the header, just to the left of the `Sprint Timer` (or in a similarly balanced, non-intrusive spot), add a subtle text link: `[ Built with clauderules.net ↗ ]`.
* [x] **Task 1.3:** Style it to be subdued (e.g., `text-zinc-500 hover:text-amber-400 text-xs tracking-widest uppercase`).
* [x] **Task 1.4:** Wire the `href` to `https://www.clauderules.net/?utm_source=bandwidth_game&utm_medium=web_app&utm_campaign=topnav_link` and ensure it opens in a new tab.

## Epic 2: The PIP Screen (Game Over) Overhaul
**Description:** Shift the failure narrative from "read my blog" to "automate your job using Claude rules."
* [x] **Task 2.1:** Open the `GameOverModal` (the PIP screen).
* [x] **Task 2.2:** Update the Pivot Hook Text (the modern text below the divider).
    * *New Text:* "Fired? It's time to automate your job before they automate you. Stop doing manual Jira tickets. Supercharge your AI coding with the best Claude Code rules and MCP servers."
* [x] **Task 2.3:** Update the Primary CTA Button.
    * *New Text:* `[ Automate Your Job at clauderules.net ↗ ]`
    * *Link:* `https://www.clauderules.net/?utm_source=bandwidth_game&utm_medium=web_app&utm_campaign=pip_screen`

## Epic 3: The CEO Screen (Game Won) Overhaul
**Description:** Shift the victory narrative to emphasize the technical achievement of building the game itself.
* [x] **Task 3.1:** Open the `GameWonModal` (the L10/CEO screen).
* [x] **Task 3.2:** Update the Pivot Hook Text.
    * *New Text:* "You beat the system. Now build your own. This entire game was autonomously coded using custom AI system prompts. Explore the tools used to build it."
* [x] **Task 3.3:** Update the Primary CTA Button.
    * *New Text:* `[ Get the AI Rules at clauderules.net ↗ ]`
    * *Link:* `https://www.clauderules.net/?utm_source=bandwidth_game&utm_medium=web_app&utm_campaign=ceo_screen`
