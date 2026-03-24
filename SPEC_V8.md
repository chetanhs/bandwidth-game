# Technical Specification: "Bandwidth" (Phase 8 - Real-Time, Meta-Game & Monetization)

## 1. Core Balancing & Progression Scaling
* **L3 Rebalance:** Base bandwidth cost for L3 tasks must be halved. L3 is the "hook" tutorial.
* **Progression Ladder (L3 to L10):**
  * L3 - L4: Easy (Tactical grunt work).
  * L5 - L6: Medium (High complexity, heavy code tasks).
  * L7 - L9: Hard (Strategic work: "Define Roadmap", "Review Architecture"). These require massive Focus but less manual "Grind" clicks.
  * L10 (CEO/Founder): Infinite Mode. Ruthless scaling difficulty.
* **Job Switching (Meta-Game):** Players who fail (PIP) or want to leave can hit the Job Board. Changing jobs resets Burnout to 0, but applies a 10% tax to total XP (re-establishing reputation).

## 2. Real-Time Pressure & Obstacles
* **The Cycle Clock:** Cycles are no longer infinite. A real-time timer (e.g., 60-90 seconds) counts down. If it hits 0:00, the cycle auto-ends. The clock turns red and pulses at 15 seconds.
* **The "In Review" Trap:** Tasks no longer go straight from `IN_PROGRESS` to `DONE`. They enter `IN_REVIEW`, locking them out of completion for a set duration (e.g., 10 seconds), unless a specific Tool is used.
* **Active Interruptions:** RNG events (Standups, Meetings) are now aggressive pixel-art pop-ups that freeze the game state and drain the clock until dismissed.

## 3. Epic Breakdown & Tasks

### Epic 1: Narrative Intro & Chatty Manager
**Description:** Inject personality and narrative context.
* [x] **Task 1.1:** Create the `OfferLetterScreen` component. Displays a formal (but slightly ominous) letter welcoming the player to a startup. Renders *after* clicking Start, but *before* Cycle 1.
* [x] **Task 1.2:** Build a `ChattyManager` dialogue box component. It should feature a 16x16 pixel art face and a typewriter text effect for the dialogue.
* [x] **Task 1.3:** Wire the `ChattyManager` to state: If the player clicks `Escalate` or `Senior Consult` more than twice in one cycle, pop up the Manager with a warning (e.g., *"Are you sure you're cut out for this?"*).

### Epic 2: The Real-Time Clock & Interruption Engine
**Description:** Introduce time anxiety and comical, annoying blockers.
* [x] **Task 2.1:** Implement a `useCycleTimer` hook. Initialize with 90 seconds. Display it prominently in the `TopNav`. When it hits 0, trigger `End Cycle` automatically.
* [x] **Task 2.2:** Update the RNG Chaos Engine to trigger *animated* partial-screen pop-ups (e.g., a pixelated PM face saying "Quick Sync?").
* [x] **Task 2.3:** Add new Tools to the Shop/Loot table: "Offline Update" (Instantly kills a Standup interruption without losing time).

### Epic 3: The "In Review" State & Progression Scaling
**Description:** Make the workflow realistic and adjust level difficulty.
* [x] **Task 3.1:** Update `ActionCard` workflow: `TODO` -> `IN_PROGRESS` -> `IN_REVIEW` -> `DONE`.
* [x] **Task 3.2:** When a card hits `IN_REVIEW`, start a 10-second local timer before it automatically moves to `DONE`.
* [x] **Task 3.3:** Add "Review Buddy" tool to the inventory. Clicking it on an `IN_REVIEW` card instantly moves it to `DONE`.
* [x] **Task 3.4:** Rebalance the `TaskGenerator`: Lower cost multipliers for L3/L4. For L7+, change task titles to strategic variants (e.g., "Board Meeting Prep") with massive single-click costs instead of multi-click grinding.

### Epic 4: Monetization & The Job Board (Meta-Progression)
**Description:** Introduce premium options for desperate players. *(Note: For dev, use a mock "Simulate Payment" button).*
* [x] **Task 4.1:** Update the `SeniorConsult` action. Instead of instantly executing, open a `ConsultModal`.
* [x] **Task 4.2:** Populate `ConsultModal` with options: "Free Tier" (costs Autonomy/MGB) and "Staff Engineer (Premium - $0.99)" (Instantly finishes task, no stat penalties).
* [x] **Task 4.3:** Update the `PerformanceReview` PIP state. Add a new option: "Take Severance & Hit the Market (Premium - $1.99)". Bypasses the Game Over screen.
* [x] **Task 4.4:** Build the `JobBoard` component. Shown after Severance or voluntary quitting. Options: "Crappy Startup (Free)", "Mid-Tier Corp ($0.99)", "FAANG ($4.99)".
* [x] **Task 4.5:** Implement Job Switch logic: Reset `Burnout` to 0. Apply `XP = Math.floor(XP * 0.90)`. Update the company name in the TopNav based on the tier chosen. Set level appropriately.
