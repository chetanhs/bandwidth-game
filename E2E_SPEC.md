# Playwright E2E Test Plan: Factions & Meta-Progression

**Testing Philosophy for Persistence:** When testing the Alumni Network, the test script MUST manipulate and read from the browser's `localStorage` via Playwright's `page.evaluate()` to ensure true cross-session persistence.

**Test 14: Faction Politics (Triage & State Updates)**
1. Start a new game. 
2. Assert that Product, Engineering, and Sales UI meters are all exactly at 50%.
3. Move a To-Do task to `In Progress`.
4. Click the "Ship it Dirty" (Rush) button.
5. Assert that the Product Reputation meter increases (e.g., > 50%) and Engineering Reputation decreases (e.g., < 50%).
6. Move a second task to `In Progress` and click "Escalate".
7. Assert that Engineering Reputation increases and Sales Reputation decreases.

**Test 15: Faction Ultimatum (The 20% Trigger)**
1. Start a new game.
2. Programmatically set the Sales Reputation state to 21% (to save time).
3. Click "Escalate" on a task (which reduces Sales Rep).
4. Assert that Sales drops below 20%.
5. Assert that the `ChaosModal` instantly appears with an "Ultimatum" warning (e.g., "Client Churn").
6. Assert the corresponding penalty is applied to the player's stats (e.g., -50% total XP or immediate Bandwidth drain).

**Test 16: True Meta-Progression (Cross-Session Persistence)**
1. Start a game. Programmatically set `CareerNetWorth` to $50,000.
2. Trigger a "Game Over" (via PIP) or select "Take Severance" to reach the Job Board.
3. Assert the `AlumniNetworkScreen` is accessible.
4. Purchase the "Ivy League Degree" upgrade (which forces the player to start at Level 4 instead of Level 3).
5. Assert that `CareerNetWorth` decreases by the purchase price.
6. **Crucial Step:** Use Playwright to reload the page (`page.reload()`) to simulate a fresh session.
7. Select a new job from the Job Board.
8. Assert that the newly initialized game dashboard says "Level 4" (verifying `localStorage` successfully held the upgrade data across a reload).