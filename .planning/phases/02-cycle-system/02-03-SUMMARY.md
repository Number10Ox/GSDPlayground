---
phase: 02-cycle-system
plan: 03
subsystem: state-management
tags: [react, reducer, state-machine, dice, clocks]

# Dependency graph
requires:
  - phase: 02-01
    provides: Die/DieType/Clock types, generateDicePool utility
  - phase: 01-02
    provides: GameContext with useReducer pattern
provides:
  - GameState with cycle fields (cyclePhase, cycleNumber, dicePool, selectedDieId, clocks)
  - GameAction union with all cycle actions
  - Phase-guarded reducer handling cycle state transitions
  - Sample clocks for testing
affects: [02-04, 03-actions, 04-conflicts, 05-npcs]

# Tech tracking
tech-stack:
  added: []
  patterns: [state-machine-with-phase-guards, action-phase-validation]

key-files:
  created: []
  modified:
    - src/types/game.ts
    - src/hooks/useGameState.tsx

key-decisions:
  - "Phase guards return state unchanged on invalid action (silent ignore vs error)"
  - "CONFIRM_ALLOCATIONS requires at least one assigned die"
  - "Sample clocks: danger (murder-plot, autoAdvance) and progress (trust-earned, manual)"

patterns-established:
  - "Phase guard pattern: check cyclePhase before processing action"
  - "Immutable state updates with spread operator for nested arrays"
  - "Toggle behavior for SELECT_DIE (same die deselects)"

# Metrics
duration: 2min
completed: 2026-01-22
---

# Phase 02 Plan 03: Cycle State Machine Summary

**State machine reducer with phase-guarded actions for WAKE/ALLOCATE/RESOLVE/SUMMARY/REST cycle flow**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-22T03:42:09Z
- **Completed:** 2026-01-22T03:44:20Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Extended GameState with cycle tracking (phase, cycle number, dice pool, selected die, clocks)
- Added 11 cycle actions to GameAction union type
- Implemented state machine reducer with phase guards for each action
- Sample clocks for testing danger/progress mechanics
- Auto-advance clocks increment at END_CYCLE

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend GameState with cycle state** - `305ab1e` (feat)
2. **Task 2: Implement cycle state machine in reducer** - `3ebbb2e` (feat)

## Files Created/Modified
- `src/types/game.ts` - Extended GameState interface, added cycle actions to GameAction
- `src/hooks/useGameState.tsx` - Cycle state machine with phase-guarded reducer (247 lines)

## Decisions Made
- Phase guards silently ignore invalid action/phase combinations (return state unchanged)
- CONFIRM_ALLOCATIONS requires at least one die assigned (prevents empty confirmation)
- Sample clocks: "Murder Plot" (danger, 6 segments, autoAdvance) and "Trust Earned" (progress, 4 segments, manual)
- SELECT_DIE uses toggle behavior - selecting same die deselects it
- Only unassigned dice can be selected

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Cycle state machine ready for UI integration (Plan 02-04)
- generateDicePool(100) hardcoded for testing, will need character condition integration
- RESOLVE_NEXT currently just transitions to SUMMARY (actual resolution in Plan 04)
- Clock system ready for integration with NPC actions and conflict outcomes

---
*Phase: 02-cycle-system*
*Completed: 2026-01-22*
