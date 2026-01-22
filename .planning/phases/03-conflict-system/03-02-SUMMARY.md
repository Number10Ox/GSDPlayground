---
phase: 03-conflict-system
plan: 02
subsystem: ui
tags: [react, framer-motion, conflict, escalation, DitV]

# Dependency graph
requires:
  - phase: 03-01
    provides: ConflictState discriminated union, conflictReducer, useConflictAtmosphere
provides:
  - ConflictView orchestrator with full raise/see bidding loop
  - RaiseControls for dice selection (raise exactly 2, see >= total)
  - EscalationConfirm modal with internal monologues
  - EscalationIndicator split display with color badges
  - BiddingHistory scrollable turn log
affects: [03-03, 04-integration, NPC-interactions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useReducer for local conflict state management
    - NPC AI with simple decision logic (random raise, greedy see)
    - Internal monologue system for escalation weight

key-files:
  created:
    - src/components/Conflict/ConflictView.tsx
    - src/components/Conflict/RaiseControls.tsx
    - src/components/Conflict/EscalationConfirm.tsx
    - src/components/Conflict/EscalationIndicator.tsx
    - src/components/Conflict/BiddingHistory.tsx
    - src/components/Conflict/index.ts
  modified: []

key-decisions:
  - "Multi-select dice with toggle behavior for raise/see actions"
  - "Internal monologues hand-written per escalation level (not generated)"
  - "1.5 second delay before confirm enabled for GUNPLAY escalation"
  - "NPC AI: random dice for raise, greedy algorithm for see, 50% escalate chance"
  - "See types: Reversed the Blow (1 die), Blocked/Dodged (2 dice), Took the Blow (3+ dice)"

patterns-established:
  - "Conflict UI: bidding history left, controls center, opponent pool right"
  - "Escalation buttons only show levels above current player level"
  - "Give action requires confirmation dialog"

# Metrics
duration: 5min
completed: 2026-01-22
---

# Phase 03 Plan 02: Conflict UI Components Summary

**Complete conflict UI with raise/see bidding, escalation confirmation modals with hand-written internal monologues, and turn history display**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-22T18:01:50Z
- **Completed:** 2026-01-22T18:07:00Z
- **Tasks:** 3
- **Files created:** 6

## Accomplishments
- RaiseControls with multi-select dice validation (exactly 2 for raise, >= total for see)
- EscalationConfirm modal with hand-written internal monologues and GUNPLAY delay
- EscalationIndicator showing both player and NPC levels with color badges
- BiddingHistory with see type classification and auto-scroll
- ConflictView orchestrator with NPC AI (random raise, greedy see, escalate/give logic)
- Barrel export for all Conflict components

## Task Commits

Each task was committed atomically:

1. **Task 1: RaiseControls and EscalationConfirm** - `3ed06e8` (feat)
2. **Task 2: EscalationIndicator and BiddingHistory** - `f1290f8` (feat)
3. **Task 3: ConflictView and barrel export** - `48cb58b` (feat)

## Files Created

- `src/components/Conflict/RaiseControls.tsx` - Multi-select dice component for raise/see actions
- `src/components/Conflict/EscalationConfirm.tsx` - Modal with internal monologue and GUNPLAY delay
- `src/components/Conflict/EscalationIndicator.tsx` - Split display of player/NPC escalation levels
- `src/components/Conflict/BiddingHistory.tsx` - Scrollable turn history with see types
- `src/components/Conflict/ConflictView.tsx` - Main orchestrator with NPC AI
- `src/components/Conflict/index.ts` - Barrel export for all components

## Decisions Made

- **Multi-select toggle:** Click to add/remove dice from selection (not radio buttons)
- **Internal monologues:** 5 hand-written options per escalation level for variety
- **GUNPLAY gravity:** 1.5s delay before confirm button enables to emphasize weight
- **NPC AI simplicity:** Random selection for raise, greedy algorithm for see, keeps code maintainable
- **See type classification:** DitV rules (1=Reversed, 2=Blocked/Dodged, 3+=Took the Blow)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all components compiled and integrated cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Conflict UI complete and ready for game integration
- NPC AI provides basic opponent behavior (can be enhanced later)
- All data-testid attributes in place for E2E testing
- Visual atmosphere theming via CSS variables working

---
*Phase: 03-conflict-system*
*Completed: 2026-01-22*
