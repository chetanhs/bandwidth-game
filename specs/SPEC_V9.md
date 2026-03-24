# Technical Specification: "Bandwidth" (Phase 9 - Commercial Viability & Meta-Game)

## 1. Monetization Overhaul (The "Shareware" Model)
* **Remove Consumable Microtransactions:** Remove real-money costs for "Senior Consults" and "Severance". These are now bought purely with in-game `Net Worth` or `MGB` stats.
* **The "Pro Tier" Gate:** The game is free-to-play up to Level 5 (Senior Engineer). Upon completing Level 4, the player hits a hard paywall. To accept the L5 promotion and unlock the endgame (Staff, Director, CEO), they must purchase the "Pro License" (e.g., $4.99).
* **The Cosmetic Shop:** Add a new tab to the Shop where players can spend real money (or massive amounts of in-game Net Worth) to unlock UI themes (e.g., "Hacker Green," "Vaporwave," "Light Mode (Psychopath)") and custom 8-bit avatar skins.

## 2. Meta-Game Depth (Job Differentiation)
Switching jobs must fundamentally alter the gameplay loop to create replayability.
* **Crappy Startup:** * Modifier: *Move Fast, Break Things.*
  * Effect: Base Bandwidth is low (80). "In Review" timer is 0 seconds (instant merges). 
* **Mid-Tier Corp:**
  * Modifier: *Standard Agile.*
  * Effect: Base Bandwidth is normal (100). "In Review" timer is 5 seconds.
* **FAANG / Big Tech:**
  * Modifier: *Golden Handcuffs & Bureaucracy.*
  * Effect: Base Bandwidth is massive (150). Salary is 3x. However, "In Review" timer is agonizingly slow (15+ seconds), and RNG Interruptions (Meetings) happen twice as often.

## 3. Epic Breakdown & Tasks

### Epic 1: The Premium Paywall (Pro Tier)
**Description:** Implement the shareware transition point.
* [x] **Task 1.1:** Add `isProUser` (boolean, default false) to global state.
* [x] **Task 1.2:** Remove all existing `$0.99` microtransaction triggers from the Job Board and Consult actions. Replace their costs with high in-game `Net Worth` values.
* [x] **Task 1.3:** Update the `PerformanceReview` logic. If `currentLevel === 4` and the player wins the review, check `isProUser`.
* [x] **Task 1.4:** If `!isProUser`, render the `ProUnlockModal`. The modal should freeze progression and offer a "Buy Full Game ($4.99)" button. *(For dev: Button sets `isProUser = true` and continues to L5).*

### Epic 2: The Cosmetic Shop
**Description:** Give players a reason to horde Net Worth or spend extra money.
* [x] **Task 2.1:** Update the `PerksShop` component with two tabs: "Perks" (Vacations/Tools) and "Cosmetics".
* [x] **Task 2.2:** Add a Theme Toggle to the global state. Implement 2 alternate Tailwind color palettes (e.g., `bg-green-900`/`text-green-400` for Hacker Mode).
* [x] **Task 2.3:** Add purchasable Themes and Avatars to the Cosmetics tab. Ensure they instantly apply to the UI and `PixelSprite` components when bought.

### Epic 3: Job Board Replayability (Meta-Game Modifiers)
**Description:** Make the different companies play differently.
* [x] **Task 3.1:** Update the `JobBoard` component. Each job listing must display its mechanical Modifiers (e.g., "Warning: Heavy Bureaucracy").
* [x] **Task 3.2:** Update global state to include a `currentCompanyType` string ('startup', 'corp', 'faang').
* [x] **Task 3.3:** Refactor the Cycle Initialization: Set max Bandwidth based on `currentCompanyType` (Startup: 80, Corp: 100, FAANG: 150).
* [x] **Task 3.4:** Refactor the `IN_REVIEW` local timer: Set the timeout duration dynamically based on `currentCompanyType` (Startup: 0s, Corp: 5s, FAANG: 15s).
* [x] **Task 3.5:** Refactor the Chaos Engine: Double the probability of RNG interruptions if `currentCompanyType === 'faang'`.
