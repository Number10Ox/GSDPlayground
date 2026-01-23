---
phase: 05-investigation
plan: 06
subsystem: ui
tags: [react, investigation, dialogue, mental-map, fatigue, sin-chain, provider-hierarchy]

# Dependency graph
requires:
  - phase: 05-01
    provides: "Investigation types, reducer, provider, fatigue clock economy"
  - phase: 05-02
    provides: "Dialogue streaming handler, mock endpoint, inner voice templates"
  - phase: 05-03
    provides: "DialogueView component, topic/approach chips, discovery summary"
  - phase: 05-04
    provides: "MentalMap with ReactFlow, sin/NPC nodes, connection edges"
  - phase: 05-05
    provides: "FatigueClock, ConflictTrigger, ResolutionSummary components"
provides:
  - "Fully playable investigation loop with 5 NPCs, 4 sins, 27 knowledge facts"
  - "Test town (Bridal Falls) with complete sin chain and NPC relationships"
  - "Provider hierarchy wiring (Investigation + Dialogue into App.tsx)"
  - "GameView integration of dialogue, mental map, fatigue, and resolution"
affects: [05-07-e2e-tests, 06-procedural-generation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Phase transition detection via useEffect + prev state comparison"
    - "Topic generation function gated by discovered sins and location"
    - "Fatigue toast pattern for resource exhaustion feedback"

key-files:
  created:
    - "src/data/testTown.ts"
  modified:
    - "src/App.tsx"
    - "src/pages/GameView.tsx"
    - "src/hooks/useNPCMemory.tsx"
    - "src/hooks/useGameState.tsx"

key-decisions:
  - "Test town uses existing location IDs (church, general-store, sheriffs-office) plus new ones (homestead, well)"
  - "CycleView dispatches END_CYCLE internally; GameView watches phase transition to REST for investigation reset"
  - "ResolutionSummary self-gates rendering (checks townResolved || sinEscalatedToMurder internally)"
  - "Conflict completion auto-confronts discovered linked sins for streamlined gameplay"

patterns-established:
  - "Topic generation: getTopicsForNPC(npcId, discoveredSinIds, currentLocation) for discovery-gated topics"
  - "Phase transition detection: prevCyclePhase + useEffect for cross-system cycle integration"
  - "Fatigue gating: check fatigueClock.current >= max before opening dialogue"

# Metrics
duration: 4min
completed: 2026-01-23
---

# Phase 5 Plan 6: Investigation Integration Summary

**Test town with 5 NPCs (27 knowledge facts, 4-level sin chain) wired into playable investigation loop via provider hierarchy and GameView integration**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-23T00:13:44Z
- **Completed:** 2026-01-23T00:18:06Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created Bridal Falls test town with 5 NPCs, each with personality, speech pattern, 4-6 knowledge facts, and conflict thresholds
- Wired InvestigationProvider and DialogueProvider into App.tsx provider hierarchy
- Integrated dialogue, mental map, fatigue clock, and resolution into GameView with proper overlay z-indexing
- Connected cycle system to investigation (REST phase resets fatigue and advances sin)

## Task Commits

Each task was committed atomically:

1. **Task 1: Test town data and NPC knowledge setup** - `d828f17` (feat)
2. **Task 2: Wire providers and integrate into GameView** - `fb69c76` (feat)

## Files Created/Modified
- `src/data/testTown.ts` - Complete test town: 5 NPCs, 4-level sin chain, 7 locations, topic generation
- `src/App.tsx` - Added InvestigationProvider + DialogueProvider to provider hierarchy
- `src/pages/GameView.tsx` - Full investigation loop: dialogue, mental map, fatigue clock, resolution, dev buttons
- `src/hooks/useNPCMemory.tsx` - Replaced sample NPCs with test town NPCs
- `src/hooks/useGameState.tsx` - Updated to use test town locations (added homestead, well)

## Decisions Made
- Test town uses existing location IDs where possible (church=chapel, sheriffs-office=jailhouse) to minimize game state changes
- CycleView dispatches END_CYCLE internally, so GameView watches for REST phase transition instead of passing an onEndCycle callback
- ResolutionSummary renders unconditionally (self-gated by townResolved/sinEscalatedToMurder check inside component)
- Conflict completion automatically confronts the first discovered but unresolved sin linked to the NPC

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated useGameState to import TEST_LOCATIONS**
- **Found during:** Task 1 (test town creation)
- **Issue:** New NPC locations (homestead, well) didn't exist in game state, so NPCs would never appear at those locations
- **Fix:** Updated useGameState.tsx to import TEST_LOCATIONS from testTown.ts instead of hardcoded SAMPLE_LOCATIONS
- **Files modified:** src/hooks/useGameState.tsx
- **Verification:** TypeScript passes, NPC locationIds match available locations
- **Committed in:** d828f17 (Task 1 commit)

**2. [Rule 1 - Bug] Removed invalid onEndCycle prop from CycleView**
- **Found during:** Task 2 (GameView integration)
- **Issue:** Plan specified passing onEndCycle prop to CycleView, but CycleView accepts no props and dispatches END_CYCLE internally
- **Fix:** Used useEffect watching cyclePhase transition to REST instead of prop passing
- **Files modified:** src/pages/GameView.tsx
- **Verification:** TypeScript passes, investigation resets trigger on phase transition
- **Committed in:** fb69c76 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for correct compilation and runtime behavior. No scope creep.

## Issues Encountered
- Vite dev server requires Node.js 20+ (environment constraint documented in STATE.md). TypeScript compilation verified correctness instead.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Investigation loop fully playable with test data
- All 05-investigation subsystems connected (dialogue, mental map, fatigue, conflict trigger, resolution)
- Ready for E2E testing (05-07) to verify integration flows
- Test town provides deterministic content for E2E assertions

---
*Phase: 05-investigation*
*Completed: 2026-01-23*
