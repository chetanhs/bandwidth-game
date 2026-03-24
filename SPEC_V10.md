# Technical Specification: "Bandwidth" (Phase 10 - Deep Systems & Replayability)

## 1. Feature Additions
* **The Perk Draft:** End-of-cycle interstitial now offers a choice of 3 synergistic, passive modifiers.
* **Automation (L5+):** Unlocks the "Junior Dev" assignment system, changing the core interaction model from clicking "Grind" to managing automated workers.
* **Faction Reputations:** Tri-state reputation bars (Product, Engineering, Sales) that react to how tasks are completed.
* **The Alumni Network (Meta-Skill Tree):** A persistent upgrade tree accessed only between jobs, funded by total career Net Worth.

## 2. Epic Breakdown & Tasks

### Epic 1: The Perk Draft & Synergies
**Description:** Replace static item drops with game-altering passive builds.
* [x] **Task 1.1:** Update the `CycleSummaryModal`. Add a drafting UI showing 3 random `PerkCard` components. The player must select 1 to proceed.
* [x] **Task 1.2:** Define the `Perk` interface (`id`, `name`, `description`, `modifierEffects`).
* [x] **Task 1.3:** Implement 5 synergistic Perks in the data store. Examples:
  * *Caffeine Addict:* All BW gains are doubled, Burnout gains are doubled.
  * *Blame Shifter:* "Ship it Dirty" adds 0 Project Debt, but drains -15% MGB.
  * *10x Dev:* Task complexity reduced by 30%, but RNG interruptions happen 3x more often.
* [x] **Task 1.4:** Wire the `modifierEffects` into the core game math functions (e.g., wrap the `addBandwidth` function to check for the *Caffeine Addict* perk).

### Epic 2: The Automation Shift (L5 Gameplay)
**Description:** Introduce the auto-battler mechanics for Senior roles.
* [x] **Task 2.1:** Add `directReports` array to global state (unlocked at Level 5).
* [x] **Task 2.2:** Update `ActionItemBoard`. If Level >= 5, remove the "Grind" button. Replace with a drag-and-drop (or select menu) to assign a Junior Dev to the ticket.
* [x] **Task 2.3:** Implement the automation loop: Assigned Junior Devs automatically add +10 Progress to their ticket every 2 seconds, but have a 20% chance each tick to generate a "Blocker" event.
* [x] **Task 2.4:** The player uses their own Bandwidth solely to clear "Blockers" and manage the RNG Chaos Engine, protecting the Juniors so they can work.

### Epic 3: Faction Politics
**Description:** Introduce impossible choices and competing interests.
* [x] **Task 3.1:** Add `factions` object to state: `{ product: 50, engineering: 50, sales: 50 }`.
* [x] **Task 3.2:** Update `StatsPanel` to display these 3 new reputation bars (using minimal, distinct colors like Blue, Purple, Amber).
* [x] **Task 3.3:** Update `ActionItem` completion logic. "Ship it Dirty" -> +Product, -Engineering. "Escalate" -> +Engineering, -Sales.
* [x] **Task 3.4:** Add Faction Ultimatum RNG Events. If a faction drops below 20%, they trigger a massive penalty (e.g., Sales drops below 20% -> "Client Churn", instant -50% total XP).

### Epic 4: The Alumni Network (Meta-Progression)
**Description:** Give the player a reason to want to get fired.
* [x] **Task 4.1:** Create `AlumniNetworkScreen`, accessible only from the Job Board.
* [x] **Task 4.2:** Build a small skill tree UI. Nodes cost persistent `CareerNetWorth` (a new global state that does *not* reset between jobs).
* [x] **Task 4.3:** Implement 3 permanent upgrades: "Ivy League Degree" (Start jobs at L4 instead of L3), "Teflon" (Burnout maxes at 90%, preventing the crash cycle), "Golden Parachute" (Severance grants +$50k).