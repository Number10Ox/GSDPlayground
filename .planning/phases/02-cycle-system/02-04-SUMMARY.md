---
phase: 02-cycle-system
plan: 04
subsystem: ui
tags: [react, framer-motion, dice-allocation, cycle-ui, game-loop]

# Dependency graph
requires:
  - phase: 02-01
    provides: DicePool component with die selection
  - phase: 02-02
    provides: Clock component for cycle awareness
  - phase: 02-03
    provides: Cycle state machine with phase transitions
provides:
  - ActionCard component for displaying available actions
  - ActionList component for filtered action display
  - CycleSummary modal for end-of-cycle review
  - CycleView orchestration for phase-based UI
  - Complete playable cycle loop (WAKE -> ALLOCATE -> RESOLVE -> SUMMARY -> REST)
affects: [03-conflict-system, 04-investigation, npc-interactions]

# Tech tracking
tech-stack:
  added: []
  patterns: [phase-based-ui-rendering, dice-allocation-flow, modal-overlay]

key-files:
  created:
    - src/components/Actions/ActionCard.tsx
    - src/components/Actions/ActionList.tsx
    - src/components/CycleSummary/CycleSummary.tsx
    - src/components/CycleView/CycleView.tsx
  modified:
    - src/types/game.ts
    - src/hooks/useGameState.tsx
    - src/pages/GameView.tsx

key-decisions:
  - "AvailableAction type distinct from GameAction reducer union"
  - "ActionCard shows assigned dice inline with click-to-unassign"
  - "CycleView handles all phase rendering in single orchestration component"
  - "Action panel currently fixed position (temporary scaffolding)"

patterns-established:
  - "Phase-based UI: CycleView renders different content per cyclePhase"
  - "Allocation flow: select die -> click action -> die assigned"
  - "Modal overlay pattern: CycleSummary with backdrop blur"

# Metrics
duration: 8min
completed: 2026-01-22
---

# Phase 2 Plan 4: Cycle UI Components Summary

**Complete cycle UI with dice allocation flow, action cards, summary modal, and phase-based orchestration enabling the core gameplay loop**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-22
- **Completed:** 2026-01-22
- **Tasks:** 6 (5 auto + 1 checkpoint)
- **Files modified:** 10

## Accomplishments

- AvailableAction type and sample actions for gameplay scaffolding
- ActionCard and ActionList components for dice allocation UI
- CycleSummary modal showing end-of-cycle results
- CycleView orchestration rendering appropriate UI per cycle phase
- Complete playable cycle: wake -> allocate dice -> confirm -> summary -> next day

## Task Commits

Each task was committed atomically:

1. **Task 1: Add AvailableAction type and sample actions** - `e3b4834` (feat)
2. **Task 2: Build ActionCard and ActionList components** - `c25340d` (feat)
3. **Task 3: Build CycleSummary component** - `41324f5` (feat)
4. **Task 4: Build CycleView orchestration component** - `81ad297` (feat)
5. **Task 5: Integrate CycleView into GameView** - `b623264` (feat)
6. **Task 6: Checkpoint - Human Verification** - User approved

## Files Created/Modified

- `src/types/game.ts` - Added AvailableAction interface
- `src/hooks/useGameState.tsx` - Added sample actions to initial state
- `src/components/Actions/ActionCard.tsx` - Action card with dice slots and assignment
- `src/components/Actions/ActionList.tsx` - Filtered action list container
- `src/components/Actions/index.ts` - Barrel export
- `src/components/CycleSummary/CycleSummary.tsx` - End-of-cycle modal with results
- `src/components/CycleSummary/index.ts` - Barrel export
- `src/components/CycleView/CycleView.tsx` - Phase-based UI orchestration
- `src/components/CycleView/index.ts` - Barrel export
- `src/pages/GameView.tsx` - Integrated CycleView overlay

## Decisions Made

- **AvailableAction separate from GameAction:** Created distinct type for player-facing actions vs reducer action union
- **Inline assigned dice:** ActionCard shows assigned dice as clickable DieIcon components for easy unassignment
- **Single orchestration component:** CycleView handles all phases rather than separate components per phase
- **Fixed action panel (temporary):** Current implementation uses fixed positioning - acknowledged as scaffolding to be refined

## Deviations from Plan

None - plan executed exactly as written.

## User Feedback (Checkpoint)

User noted the action panel uses fixed positioning that overlaps the map. They prefer a Citizen Sleeper-style approach where actions appear contextually when selecting a location rather than being always visible. This is acknowledged as temporary scaffolding - the cycle mechanics work correctly, but the UI pattern should be addressed in a future refinement pass.

## Issues Encountered

None - all tasks completed without blocking issues.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 3 (Conflict System):**
- Complete cycle loop provides foundation for conflict resolution
- Dice allocation mechanics ready for skill checks
- Action framework ready for conflict-triggering actions

**UI Refinement Noted:**
- Action panel positioning should evolve to location-contextual display
- Consider Citizen Sleeper's approach: actions appear when selecting locations
- This is UX polish, not blocking - core mechanics are functional

**Phase 2 Complete:**
- All 4 plans executed successfully
- Cycle system requirements (CYCLE-01 through CYCLE-04, UI-03) satisfied
- Core gameplay loop playable from Day 1 onward

---
*Phase: 02-cycle-system*
*Completed: 2026-01-22*
