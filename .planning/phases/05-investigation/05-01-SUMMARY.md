---
phase: 05-investigation
plan: 01
subsystem: investigation
tags: [typescript, reducer, context, ditv, sin-progression, dialogue, fatigue-clock]

# Dependency graph
requires:
  - phase: 04-character-system
    provides: "StatName type, CharacterProvider/useCharacter pattern"
provides:
  - "SinLevel/SinNode types for sin progression chain"
  - "Discovery type shared between dialogue and investigation"
  - "KnowledgeFact with trust+approach gating"
  - "DialogueState FSM (5 phases)"
  - "InvestigationReducer with 6 action types"
  - "InvestigationProvider/useInvestigation context hook"
  - "FatigueClock economy (6 segments per cycle)"
affects: [05-02-dialogue-ui, 05-03-mental-map, 05-04-fatigue, 05-05-integration, 05-06-e2e-tests]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Investigation reducer with silent fail guards", "Discovery as cross-module shared type"]

key-files:
  created:
    - src/types/investigation.ts
    - src/types/dialogue.ts
    - src/reducers/investigationReducer.ts
    - src/hooks/useInvestigation.tsx
  modified:
    - src/types/npc.ts

key-decisions:
  - "Discovery type defined in investigation.ts, imported by dialogue.ts (single source of truth)"
  - "FatigueClock max=6 (one segment per conversation per cycle)"
  - "SIN_CHAIN_ORDER exported as constant for use by generation/resolution logic"
  - "InvestigationProvider not wired into App.tsx yet (deferred to 05-05 integration)"
  - "Existing dialogue.ts from research fully replaced with plan-specified interface"

patterns-established:
  - "Cross-module type sharing: define in owning module, import in consumers"
  - "Investigation reducer follows silent fail pattern (consistent with conflict/cycle reducers)"

# Metrics
duration: 2min
completed: 2026-01-22
---

# Phase 5 Plan 01: Investigation Types and State Summary

**DitV sin progression types, dialogue FSM state, fatigue clock economy, and investigation reducer with context provider**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-22T23:51:20Z
- **Completed:** 2026-01-22T23:53:39Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Complete type foundation for investigation system (SinLevel, SinNode, Discovery, FatigueClock)
- Dialogue types with 5-phase FSM, trust-gated KnowledgeFact, and stat-linked ApproachType
- Investigation reducer handling 6 action types with silent fail guards
- InvestigationProvider and useInvestigation hook following established codebase pattern
- NPC type extended with knowledge pool and conflict threshold fields

## Task Commits

Each task was committed atomically:

1. **Task 1: Investigation and dialogue type definitions** - `9b1c333` (feat)
2. **Task 2: Investigation reducer and context provider** - `b1aea15` (feat)

## Files Created/Modified
- `src/types/investigation.ts` - SinLevel, SinNode, Discovery, FatigueClock, InvestigationState, InvestigationAction, ResolutionStatus
- `src/types/dialogue.ts` - ApproachType, Topic, KnowledgeFact, ConversationTurn, DialoguePhase, DialogueState, DialogueAction
- `src/types/npc.ts` - Added NPCKnowledge, ConflictThreshold interfaces; optional knowledge/conflictThresholds on NPC
- `src/reducers/investigationReducer.ts` - investigationReducer, initialInvestigationState, SIN_CHAIN_ORDER
- `src/hooks/useInvestigation.tsx` - InvestigationProvider, useInvestigation

## Decisions Made
- Discovery type lives in investigation.ts (the owning module) and is imported by dialogue.ts, ensuring single source of truth
- Existing dialogue.ts from research phase was fully replaced rather than merged, as the plan-specified interface is the canonical design
- FatigueClock defaults to max=6 segments (1 per conversation per cycle)
- SIN_CHAIN_ORDER exported as a named constant for use by town generation and resolution systems
- InvestigationProvider NOT wired into App.tsx (plan explicitly defers to 05-05)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Types ready for dialogue UI (05-02) to consume DialogueState/DialogueAction
- Types ready for mental map (05-03) to consume SinNode/Discovery
- Reducer ready for fatigue system (05-04) to dispatch ADVANCE_FATIGUE/RESET_FATIGUE
- Integration plan (05-05) will wire InvestigationProvider into App.tsx

---
*Phase: 05-investigation*
*Completed: 2026-01-22*
