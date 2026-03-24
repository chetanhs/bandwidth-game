# Technical Specification: "Bandwidth" (Corporate Career RPG)

## 1. Game Fundamentals & Core Architecture

### 1.1 Core Game Loop (The Cycle)
The game operates in "Cycles" (e.g., 2-week sprints). During a Cycle, the player receives a set of "Action Items" (tickets) and must spend resources to complete them before the Cycle ends.

### 1.2 Universal Resource System
* **Bandwidth (Action Points):** The primary currency. Resets every Cycle. Working on tasks costs Bandwidth.
* **Escalation (Manager/Senior Time):** Instantly unblocks a task or reduces its difficulty. **Rule:** Using this lowers the player's "Autonomy" stat.
* **Coffee / Perks:** Consumables. Instantly restores Bandwidth, but increases the hidden "Burnout" meter.

### 1.3 Pointing, Rewards, and Penalties
* **Impact (XP):** Gained by completing Action Items. Used to unlock promotions.
* **Project Debt (The Ding):** Accrued by rushing tasks. High debt increases the Bandwidth cost of future tasks.
* **Burnout:** If the Burnout meter hits 100%, the player is forced to take "Mandatory PTO," losing an entire Cycle and missing their Impact quota.

---

## 2. UI/UX Component Architecture
**Global Aesthetic:** Clean, minimal, dark zinc (`bg-zinc-900` / `#18181b`). Looks like a high-end productivity tool (Linear/Notion). Use standard sans-serif for UI, and monospace (JetBrains Mono/Fira Code) for numbers and tech-specific track data.

### 2.1 Screen Layouts
* **`StartScreen` Component:** * Centered layout. Large title "BANDWIDTH".
  * Track Selection grid (Engineering enabled; Product/Sales disabled).
  * "Start Career" primary button.
* **`DashboardLayout` Component (Main Game UI):**
  * **Top Bar (`<TopNav>`):** Displays Player Name, Current Role (e.g., "L3 Engineer"), Cycle Number, and a large "End Cycle" button.
  * **Left Sidebar (`<StatsPanel>`):** Visual progress bars for Bandwidth (Blue), Burnout (Red), Autonomy (Green), and Impact (Gold).
  * **Main Content Area (`<ActionItemBoard>`):** A Kanban-style board showing "To Do", "In Progress", and "Done" columns.
* **`ActionCard` Component:**
  * Represents a single task. Shows Title, Required Bandwidth cost, and Impact reward.
  * Buttons: [Work] (spends Bandwidth), [Rush] (spends 0 Bandwidth but adds Debt), [Escalate] (spends Manager Time, lowers Autonomy).
* **`PerformanceReview` Component (Boss Screen):**
  * Split screen: Manager portrait/text on the left, player dialogue choices on the right. 
  * Displays a summary of the player's total Impact, Debt, and Autonomy.

---

## 3. Functional Requirements & Task Breakdown

### Epic 1: Shell, Start Screen & State Initialization
**Description:** Establish the application layout and the Career Track selector.
* [x] **Task 1.1:** Scaffold React/TypeScript application with Tailwind CSS (`npx create-react-app --template typescript` or Vite equivalent).
* [x] **Task 1.2:** Build the `StartScreen` component per the UI specs.
* [x] **Task 1.3:** Implement generic TypeScript interfaces: `ActionItem` (id, title, cost, reward, debtRisk) and `PlayerStats` (bandwidth, burnout, autonomy, debt, impact).
* [x] **Task 1.4:** Implement global state (Zustand or Context) to manage `PlayerStats`, `CycleNumber`, and `CurrentLevel`.

### Epic 2: Core Game Engine & Main Dashboard
**Description:** Build the agnostic state machine and main play area.
* [x] **Task 2.1:** Build `DashboardLayout`, `TopNav`, and `StatsPanel` using Tailwind (`bg-zinc-900`, `text-zinc-100`, progress bars).
* [x] **Task 2.2:** Build the `ActionItemBoard` and `ActionCard` components.
* [x] **Task 2.3:** Implement the "Execute Task" action handler: deduct Bandwidth, update card status, add Impact.
* [x] **Task 2.4:** Implement "End Cycle" logic: reset Bandwidth, apply Burnout penalties (if > 80%), increment Cycle counter, spawn new Action Items.

### Epic 3: Onboarding & Level 1 (The IC / New Grad)
**Description:** The tutorial phase introducing the basic mechanics. Focus on survival and learning.
* [ ] **Task 3.1:** Build `TutorialOverlay` modals triggered on Cycle 1. Popups explain: Bandwidth (how to work), Escalation (how to ask for help), and Sprints (ending a turn).
* [x] **Task 3.2:** Define Level 1 config: 5 Cycles total. Goal: 100 Impact to trigger Boss phase.
* [x] **Task 3.3:** Populate Level 1 `EngineeringTrack` data: Action Items like "Resolve 400+ TS errors", "Fix docs typo".
* [x] **Task 3.4:** Implement the "Escalate" action logic (guarantees task completion, decreases Autonomy stat by 10%).

### Epic 4: Level 2 (Mid-Level / High Stakes)
**Description:** Introduction of the "Project Debt" mechanic and risk management.
* [x] **Task 4.1:** Transition to Level 2 (Triggered after beating Level 1 Boss). Config: 8 Cycles total. Goal: 300 Impact.
* [x] **Task 4.2:** Unlock the "Ship it Dirty" (Rush) button on `ActionCard`s. Logic: Completes task instantly for 0 Bandwidth, adds +20 Project Debt.
* [x] **Task 4.3:** Populate Level 2 Action Items: "Build 10 utility tools over the weekend", "Refactor core schema".
* [x] **Task 4.4:** Implement compounding penalty logic: If Project Debt > 50, all new Action Items cost 20% more Bandwidth.

### Epic 5: Level 3 (Boss Mode - Performance Review)
**Description:** The universal promotion gate. No Kanban board, just stat checks and dialogue.
* [x] **Task 5.1:** Build the `PerformanceReview` component (dialogue tree UI). Triggered at the end of Level 1 and Level 2.
* [x] **Task 5.2:** Implement evaluation logic. To pass Level 1 -> 2: Impact > 100, Autonomy > 50%. To pass Level 2 -> Win: Impact > 300, Autonomy > 60%, Debt < 50.
* [x] **Task 5.3:** Create dynamic manager dialogues based on the player's worst stat (e.g., if Debt is high: "Your velocity is great, but QA is complaining about bugs...").
* [x] **Task 5.4:** Implement Win (Promotion/Next Level) and Loss (Performance Improvement Plan / Game Over) states.

---

## 4. Non-Functional Requirements
* [x] **NFR 1 - Agnostic Architecture:** UI components must not hardcode track-specific strings (like "Tech Debt"). Use generic state variables populated by the selected `CareerTrack`.
* [x] **NFR 2 - Persistence:** State must be saved to `localStorage` at the start of every Cycle to prevent progress loss on refresh.
* [x] **NFR 3 - Type Safety:** Use strict TypeScript types for all state transitions to prevent negative resource values (e.g., Bandwidth cannot drop below 0).
