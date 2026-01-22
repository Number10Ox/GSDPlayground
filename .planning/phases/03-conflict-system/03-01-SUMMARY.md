---
phase: 03-conflict-system
plan: 01
subsystem: game-logic
tags: [typescript, state-machine, reducer, ditv, conflict, css-variables]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Die and DieType types, dice utilities, GameContext patterns"
  - phase: 02-cycle-system
    provides: "Phase guard pattern for state transitions"
provides:
  - ConflictState discriminated union (INACTIVE/ACTIVE/RESOLVED)
  - EscalationLevel type with ESCALATION_ORDER and ESCALATION_DICE constants
  - conflictReducer with turn and phase guards
  - generateFalloutDice and calculateFallout utilities
  - useConflictAtmosphere hook for CSS variable theming
affects: [03-02, 03-03, conflict-ui, npc-ai]

# Tech tracking
tech-stack:
  added: []
  patterns: [discriminated-union-state, turn-based-guards, css-variable-theming]

key-files:
  created:
    - src/types/conflict.ts
    - src/reducers/conflictReducer.ts
    - src/utils/fallout.ts
    - src/hooks/useConflictAtmosphere.ts
  modified:
    - src/index.css

key-decisions:
  - "Discriminated union for ConflictState prevents invalid state combinations at compile time"
  - "Turn guards (PLAYER_RAISE/NPC_SEE etc) enforce valid action order in reducer"
  - "Silent fail pattern returns state unchanged on invalid actions (consistent with Phase 2)"
  - "CSS variables on document.body for global atmosphere theming"

patterns-established:
  - "Separate reducer files in src/reducers/ directory"
  - "generateXxxId() helper functions for unique IDs"
  - "ESCALATION_ORDER constant for level comparison"

# Metrics
duration: 3min
completed: 2026-01-22
---

# Phase 03 Plan 01: Conflict Foundation Summary

**DitV conflict state machine with discriminated union types, turn-based reducer guards, fallout calculation per rules (7/11/15/19 thresholds), and CSS variable escalation theming**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-22T17:55:13Z
- **Completed:** 2026-01-22T17:58:17Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- ConflictState discriminated union enforcing INACTIVE/ACTIVE/RESOLVED phases at compile time
- Conflict reducer with phase guards and turn order validation (raise must precede see)
- Fallout calculation: roll accumulated dice, sum top 2, severity from DitV thresholds
- CSS variable theming hook with color progression for escalation atmosphere

## Task Commits

Each task was committed atomically:

1. **Task 1: Conflict types and state discriminated union** - `059b018` (feat)
2. **Task 2: Conflict reducer with turn validation** - `89cb745` (feat)
3. **Task 3: Fallout utilities and escalation theming hook** - `7bcfd9c` (feat)

## Files Created/Modified

- `src/types/conflict.ts` - ConflictState discriminated union, EscalationLevel, ConflictAction types
- `src/reducers/conflictReducer.ts` - State machine reducer with phase and turn guards
- `src/utils/fallout.ts` - generateFalloutDice and calculateFallout utilities
- `src/hooks/useConflictAtmosphere.ts` - CSS variable management for escalation theming
- `src/index.css` - CSS transition for smooth atmosphere changes, CSS variable defaults

## Decisions Made

- **Discriminated union for state:** TypeScript prevents accessing ACTIVE-only fields when state is INACTIVE
- **Turn guards in reducer:** currentTurn field determines valid actions (e.g., can't PLAYER_RAISE when turn is NPC_SEE)
- **Silent fail pattern:** Invalid actions return state unchanged (consistent with useGameState.tsx from Phase 2)
- **CSS variables on body:** Global theming approach allows any component to use --conflict-bg and --conflict-accent
- **Separate reducers directory:** Created src/reducers/ for conflict reducer (anticipating more reducers)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Conflict types and reducer ready for UI integration (03-02)
- useConflictAtmosphere hook ready for conflict view component
- Turn validation logic in place for implementing NPC AI decisions
- Fallout calculation ready for conflict resolution effects

---
*Phase: 03-conflict-system*
*Completed: 2026-01-22*
