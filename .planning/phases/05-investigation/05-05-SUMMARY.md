---
phase: 05-investigation
plan: 05
subsystem: ui
tags: [svg, fatigue-clock, conflict-trigger, resolution, sin-escalation, framer-motion]

# Dependency graph
requires:
  - phase: 05-investigation/05-01
    provides: InvestigationState, SinNode, FatigueClock types, investigationReducer
  - phase: 05-investigation/05-03
    provides: DialogueView, ApproachType, dialogue FSM
provides:
  - FatigueClock SVG component for fatigue display
  - ConflictTrigger for Body/Will approach escalation
  - ResolutionSummary end-of-town overlay with 3 outcomes
  - ADVANCE_SIN_PROGRESSION and CONFRONT_SIN reducer actions
affects: [05-investigation/05-06, 06-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [sin-escalation-per-cycle, conflict-from-dialogue, multi-outcome-resolution]

key-files:
  created:
    - src/components/FatigueClock/FatigueClock.tsx
    - src/components/Dialogue/ConflictTrigger.tsx
    - src/components/Resolution/ResolutionSummary.tsx
  modified:
    - src/types/investigation.ts
    - src/reducers/investigationReducer.ts

key-decisions:
  - "Inline CSS keyframe for fatigue pulse animation (avoids Tailwind config extension)"
  - "ConflictTrigger uses forceTriggered prop for dev-mode deterministic testing"
  - "CONFRONT_SIN marks sin as resolved directly (DitV: confrontation IS resolution)"
  - "ResolutionSummary renders only when townResolved OR sinEscalatedToMurder"

patterns-established:
  - "Sin escalation per cycle: ADVANCE_SIN_PROGRESSION finds highest unresolved, creates next-level node"
  - "Conflict from dialogue: only Body/Will approaches roll against NPC resistChance"
  - "Three-outcome resolution: positive (clean), bittersweet (murder+resolved), tragedy (murder only)"

# Metrics
duration: 2min
completed: 2026-01-23
---

# Phase 5 Plan 5: Fatigue Clock, Conflict Trigger & Resolution Summary

**SVG fatigue clock with exhaustion pulse, Body/Will conflict escalation from dialogue, and 3-outcome town resolution summary with NPC outcomes**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-23T00:13:24Z
- **Completed:** 2026-01-23T00:15:48Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- FatigueClock SVG component with circular progress, segment markers, blue/red color states, and exhaustion pulse animation
- ConflictTrigger checks NPC conflict thresholds for Body/Will approaches, rolls probabilistic resistance, triggers conflict after 1s warning
- ADVANCE_SIN_PROGRESSION escalates town sin each cycle (time pressure), CONFRONT_SIN resolves sins (pride = town resolved)
- ResolutionSummary full-screen overlay with 3 distinct endings, NPC outcome cards, and sin chain visualization

## Task Commits

Each task was committed atomically:

1. **Task 1: Fatigue clock component and conflict trigger** - `1a6c46e` (feat)
2. **Task 2: Resolution summary and sin escalation** - `168c659` (feat)

## Files Created/Modified
- `src/components/FatigueClock/FatigueClock.tsx` - SVG circular progress clock with segment markers, color transitions, pulse animation
- `src/components/Dialogue/ConflictTrigger.tsx` - Body/Will approach resistance check against NPC thresholds, animated warning before escalation
- `src/components/Resolution/ResolutionSummary.tsx` - End-of-town overlay with 3 outcome paths, NPC outcome cards, sin chain visualization
- `src/types/investigation.ts` - Added sinEscalatedToMurder to state, ADVANCE_SIN_PROGRESSION and CONFRONT_SIN action types
- `src/reducers/investigationReducer.ts` - Sin escalation per cycle, confrontation resolves sin (pride = town resolved)

## Decisions Made
- Inline CSS keyframe for fatigue pulse animation rather than extending Tailwind config (self-contained component)
- ConflictTrigger uses forceTriggered prop for dev-mode deterministic testing (consistent with 03-05 dev-mode test trigger pattern)
- CONFRONT_SIN marks sin resolved directly rather than using intermediate 'confronted' status (DitV rules: the Dog IS the authority, confrontation counts)
- ResolutionSummary only renders when game reaches terminal state (townResolved or sinEscalatedToMurder)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- FatigueClock ready to be wired into GameView/CycleView (Plan 05-06 integration)
- ConflictTrigger ready to be wired into DialogueView between approach selection and streaming (Plan 05-06)
- ResolutionSummary auto-shows when terminal state reached
- InvestigationProvider still needs to be wired into App.tsx (Plan 05-06)

---
*Phase: 05-investigation*
*Completed: 2026-01-23*
