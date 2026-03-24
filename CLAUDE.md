# Project: Bandwidth (Corporate Career RPG)

## 1. The Source of Truth
* The file `SPEC.md` is the absolute source of truth for this project's architecture, requirements, and current progress.
* **Before writing any code**, you must read `SPEC.md` to understand the context and locate the current active task (the first unchecked `[ ]` box).

## 2. Execution Protocol
* **One Step at a Time:** Do not hallucinate future features. Only execute the specific task or Epic requested by the user.
* **Mandatory Check-ins:** When you complete a task, you MUST open `SPEC.md` and physically update the checkbox for that task from `[ ]` to `[x]`. 
* **Stop and Wait:** After updating `SPEC.md`, you must stop and wait for the user to review the code and provide the next prompt. Do not automatically proceed to the next task.

## 3. Strict Technical Constraints (NFRs)
* **Tech Stack:** React, strict TypeScript, and Tailwind CSS.
* **Aesthetic:** Dark zinc palette (`bg-zinc-900`, `text-zinc-100`). Minimal, clean, developer-centric layout resembling tools like Linear or Notion. No cartoonish assets.
* **Typography:** Use standard sans-serif for general UI. You MUST use a monospace font (JetBrains Mono, Fira Code, or `font-mono`) specifically for numbers, stats, and tech-specific track data.
* **Architecture:** The core game engine must remain agnostic. Never hardcode job-specific strings (like "Tech Debt" or "Senior SWE") directly into the UI components. Rely on generic state variables. 

## 4. State Management
* Ensure the game state (Bandwidth, Burnout, Autonomy, Impact, Debt) is strictly typed to prevent impossible values (e.g., Bandwidth cannot drop below 0).
* Persist the game state to `localStorage` at the start of every Cycle so progress is not lost on a page refresh.
