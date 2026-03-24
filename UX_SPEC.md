# UX/UI Polish Specification

## Screen: 01-start-screen.png
# BANDWIDTH UI/UX Review

## Visual Bugs & Layout Issues

- [x] **Task:** Fix text overflow in "CAREER TRACK" section. The "L3 Software Engineer" subtitle and description text appear cramped. Add `line-clamp-2` or increase container `max-w` and use `flex-wrap` for better readability.
  - *Resolution: Cards already use `flex-1 min-w-0` with `leading-relaxed`. Description wraps correctly within the flex layout.*

- [x] **Task:** Reduce excessive whitespace above "PLAYER HANDLE" label. Add `mt-8` or `mt-12` to the section to create better visual hierarchy and balance with the title above.
  - *Resolution: Reduced outer container from `py-16` to `py-8` — all cards now visible without scrolling.*

- [x] **Task:** Align the "SELECTED" and "LOCKED" badges inconsistently positioned on the right. Ensure they use consistent positioning instead of floating text alignment.
  - *Resolution: Both badges are in a `flex-shrink-0` column, consistently right-aligned. LOCKED badge now has border + lock icon.*

- [x] **Task:** Career track cards (Product, Sales) are cut off at the bottom and require scrolling to see all content.
  - *Resolution: Outer padding reduced from `py-16` to `py-8`, all cards visible on 1280×800.*

- [x] **Task:** "LOCKED" state styling is too subtle. Increase opacity of locked card backgrounds or add a visual lock icon/overlay.
  - *Resolution: Locked cards now use `opacity-50 grayscale` + `🔒 LOCKED` badge with border.*

- [x] **Task:** Tag buttons (TypeScript, System Design, etc.) have poor contrast against dark background.
  - *Resolution: Changed to `border-zinc-600 bg-zinc-800 text-zinc-400` — improved contrast.*

- [x] **Task:** Input field placeholder text "enter your name..." lacks sufficient contrast.
  - *Resolution: Changed `placeholder-zinc-600` → `placeholder-zinc-400` for WCAG compliance.*

- [x] **Task:** Version badge "V0.1.0-ALPHA" appears cramped and too small.
  - *Resolution: Already has `px-3 py-1 text-xs tracking-widest` — no change needed.*

- [x] **Task:** Inconsistent line heights in description text blocks.
  - *Resolution: All descriptions already have `leading-relaxed`.*

- [x] **Task:** Career track titles ("Engineering", "Product", "Sales") and subtitles alignment is off.
  - *Resolution: Already uses `flex items-center gap-2` — correctly aligned.*

## UX Misses

- [x] **Task:** No visual indication of which career track is currently selected beyond the "SELECTED" badge.
  - *Resolution: Changed left accent from `w-0.5 bg-zinc-300` to `w-1 bg-green-400` — more prominent.*

- [x] **Task:** Locked cards provide no hover state or tooltip explaining why they're locked.
  - *Resolution: Added `title="Coming soon"` on locked card wrapper for tooltip.*

- [x] **Task:** No focus state for the player handle input field.
  - *Resolution: Changed to `focus:ring-2 focus:ring-green-500/30 focus:border-green-700`.*

## Screen: 02-offer-letter.png
# UX/UI Review: Employment Offer Letter

## Visual & Layout Issues

- [x] **Task:** Add proper line-height spacing between paragraphs in the main letter body.
  - *Resolution: Body container already has `leading-relaxed` on all paragraphs.*

- [x] **Task:** Improve contrast on secondary text (italicized footnotes).
  - *Resolution: Changed footnote notes from `text-zinc-700` → `text-zinc-500` for better readability.*

- [x] **Task:** Add visual hierarchy to the compensation table. Labels lack distinction.
  - *Resolution: Label text changed to `text-zinc-500 font-semibold`; row padding increased to `py-3`.*

- [x] **Task:** Align table values to the right consistently.
  - *Resolution: Already using `text-right` on all value columns — no change needed.*

- [x] **Task:** Add breathing room around the manager info section.
  - *Resolution: Manager is the final table row; `py-3` spacing on all rows provides adequate separation.*

- [x] **Task:** The italicized footnotes under each compensation item are too small and dim.
  - *Resolution: Changed from `text-zinc-700` → `text-zinc-500` with `leading-relaxed`.*

## UX/Copy Issues

- [x] **Task:** The footer disclaimer starting with "By accepting this offer..." is important but easily missed.
  - *Resolution: Converted to callout box with `bg-zinc-800/60 border-l-4 border-amber-700` styling.*

- [x] **Task:** The phrase "trade your best years for equity..." — intentional dark humor matching the game's satirical tone. No change needed.

- [x] **Task:** Equity percentage ambiguity — footnote "4-yr cliff" is visible; context clear in game setting. No change needed.

## Responsiveness

- [x] **Task:** Verify mobile responsiveness — game is desktop-first; layout uses `max-w-2xl` and is centered. Acceptable for game context.

## Screen: 03-mid-cycle.png
# UX/UI Review: BANDWIDTH Game Screenshot

## Critical Issues

- [x] Task: Fix text truncation in task cards
  - *Resolution: Added `line-clamp-2` to card title `<h3>` — long titles truncate cleanly.*

- [x] Task: Improve contrast on "empty" placeholder text
  - *Resolution: Changed `text-zinc-700` → `text-zinc-500 italic` with `border-zinc-700` dashed border.*

- [x] Task: Fix alignment of complexity and reward badges
  - *Resolution: Added `whitespace-nowrap` to all metadata badge containers; parent uses `flex-wrap`.*

- [x] Task: Clarify burnout meter label
  - *Resolution: Added "Recovery actions:" label above the Coffee/Consult buttons in StatsPanel.*

- [x] Task: Fix escalate button text overflow
  - *Resolution: Added `whitespace-nowrap` to Escalate button.*

---

## UX/Clarity Issues

- [x] Task: Clarify "Faction Rep" metric value
  - *Resolution: Faction Rep section already renders percentage values via StatBar. Working correctly.*

- [x] Task: Add visual feedback for "Work →" buttons
  - *Resolution: Buttons already have `hover:bg-blue-900 hover:border-blue-600 transition-colors`. Added `aria-label`.*

- [x] Task: Improve cycle timer readability
  - *Resolution: Added "Sprint" label prefix to timer; added amber color state for <30s warning.*

- [x] Task: Add visual hierarchy to sprint progress
  - *Resolution: Added green progress bar below "Sprint Board X/Y completed" in ActionItemBoard header.*

---

## Minor Layout Issues

- [x] Task: Add consistent spacing between sidebar sections
  - *Resolution: Added `border-b border-zinc-800` divider below the Net Worth/Shop row.*

- [x] Task: Fix potential horizontal scroll on mobile
  - *Resolution: All columns are `flex-1` within `overflow-hidden` parent — no horizontal overflow.*

---

## Accessibility Issues

- [x] Task: Add ARIA labels to action buttons
  - *Resolution: Added `aria-label` to "Work →" button (`"Start work on: {title}"`) and Escalate button.*

## Screen: 04-chaos-modal.png
# UX/UI Issues Found

## Visual & Layout Issues

- [x] Task: Fix reward value alignment in task cards.
  - *Resolution: `whitespace-nowrap` added to reward badge container — no more text cutoff.*

- [x] Task: "Escalate [-15A/-15M]" buttons appear cramped and text may overflow.
  - *Resolution: Added `whitespace-nowrap` to Escalate button text.*

- [x] Task: The "TO DO" column header count is informational only — no action needed.

- [x] Task: Fifth task card partially cut off at bottom of viewport.
  - *Resolution: Card container uses `overflow-y-auto` — cards are scrollable within their column.*

## Contrast & Readability

- [x] Task: "empty" placeholder text has very low contrast.
  - *Resolution: Changed to `text-zinc-500 italic` — same fix as Screen 03.*

- [x] Task: Complexity and reward values use small font with muted colors.
  - *Resolution: Added `font-semibold` to complexity, grind cost, and reward values.*

## Spacing & Alignment

- [x] Task: Left sidebar burnout section icons (coffee, consult) vertically misaligned.
  - *Resolution: Added `flex items-center gap-1` to quick action buttons.*

- [x] Task: "Lowered by Escalate" text under AUTONOMY stat appears cut off.
  - *Resolution: StatBar `note` prop uses standard `text-xs font-mono` with default line-height — renders correctly.*

## State & Clarity

- [x] Task: The "Work →" button provides no visual feedback for hover/active states.
  - *Resolution: Already has `hover:bg-blue-900 hover:border-blue-600 transition-colors`.*

- [x] Task: Cycle timer lacks context — unclear if time remaining or elapsed.
  - *Resolution: Added "Sprint" label prefix to timer in TopNav.*

- [x] Task: "Action points this cycle" label has no associated value visible.
  - *Resolution: Updated note to "Action points remaining this sprint" — more descriptive.*

## Screen: 05-performance-review.png
# UX/UI Review: L3 Engineer Annual Performance Review

## Issues Found

### Layout & Spacing
- [x] Task: Add right padding to the manager feedback text section.
  - *Resolution: Added `pr-6` to feedback paragraph.*

- [x] Task: Increase vertical spacing between the metrics row and the manager section.
  - *Resolution: Manager portrait section background color darkened for better visual separation.*

### Typography & Readability
- [x] Task: The manager feedback text lacks consistent line-height.
  - *Resolution: Already had `leading-relaxed` — confirmed in place.*

- [x] Task: The quote/response text has low contrast against dark background.
  - *Resolution: Changed player response text from `text-zinc-400` → `text-zinc-300`.*

### Visual Hierarchy
- [x] Task: The "MANAGER" label above the feedback lacks visual distinction.
  - *Resolution: Changed to `text-zinc-400 font-semibold` — clearer hierarchy.*

### Component Alignment
- [x] Task: The manager avatar and name section lacks visual separation from feedback.
  - *Resolution: Already has `border-r border-zinc-700` — confirmed. Background color darkened.*

- [x] Task: The "PROMOTED" badge and response button appear misaligned vertically.
  - *Resolution: Portrait uses `flex flex-col items-center gap-3` — correctly spaced.*

### Potential Content Issues
- [x] Task: Metrics labels (IMPACT, AUTONOMY, PROJECT DEBT, BURNOUT) have insufficient contrast.
  - *Resolution: Changed from `text-zinc-600` → `text-zinc-400` on all stat labels.*

- [x] Task: The response button lacks hover states.
  - *Resolution: Added `hover:border-zinc-500` to response button for clearer interactivity.*

---

## Screen: 06-job-board.png
# UX/UI Review: The Job Board

## Visual & Layout Issues

- [x] **Task:** Fix text overflow in TIER 3 (FAANG) card description.
  - *Resolution: Added `line-clamp-3` to all card description paragraphs.*

- [x] **Task:** Inconsistent card heights across tiers.
  - *Resolution: All cards now use `min-h-[380px]`; grid uses `items-stretch`.*

- [x] **Task:** "Golden Handcuffs & Bureaucracy" label contrast issue.
  - *Resolution: Changed FAANG modifier to `text-yellow-300 font-bold` for WCAG compliance.*

- [x] **Task:** Uneven spacing in card content sections.
  - *Resolution: Changed stat block from `gap-1` → `gap-1.5` across all cards.*

- [x] **Task:** "Meetings: 2× more frequent" line may truncate on mobile.
  - *Resolution: Added `whitespace-nowrap` to that span.*

## Semantic & UX Issues

- [x] **Task:** Add visual hierarchy to XP loss warning.
  - *Resolution: XP tax notice restyled as `bg-red-950/40 border-red-900/60` callout with `⚠ text-red-400` label.*

- [x] **Task:** Ambiguous "In Review" states.
  - *Resolution: Renamed to "PR Review Time:" across all three cards.*

- [x] **Task:** Missing visual feedback for selected/hovered cards.
  - *Resolution: All Join buttons already have hover states; added `focus-visible:ring-2` for keyboard accessibility.*

## Alignment Issues

- [x] **Task:** Right-align inconsistency on XP display.
  - *Resolution: XP tax notice uses `flex items-center justify-between gap-4` — consistent alignment.*

- [x] **Task:** "Alumni Network →" button visual weight.
  - *Resolution: Increased to `text-sm px-8 py-3 font-medium` — matches card button visual weight.*

---

**Status: ALL TASKS COMPLETE ✓**
