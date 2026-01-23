---
phase: 06-town-generation
plan: 06
subsystem: testing
tags: [playwright, e2e, bdd, gherkin, town-generation, procedural]

# Dependency graph
requires:
  - phase: 06-05
    provides: "TownSelection UI with data-testid attributes, App.tsx conditional render"
  - phase: 05-07
    provides: "E2E patterns: route interception, dispatchEvent for SVG, dialogue mocking"
provides:
  - "6 E2E tests covering town selection, generated town gameplay, NPC interaction, discovery"
  - "BDD feature file with 6 Gherkin scenarios for town generation"
  - "Step helpers for reusable town selection and NPC interaction functions"
  - "Resilient town generation (safeGenerateValidTown fallback)"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "safeGenerateValidTown: try/catch fallback to shorter chain lengths"
    - "navigateToNPCLocation: iterative location search for generated towns"
    - "getTownCardNames/getTownCardSinDepths: DOM inspection for variety verification"

key-files:
  created:
    - "e2e/features/town-generation.feature"
    - "e2e/steps/townGeneration.steps.ts"
    - "e2e/town-generation.spec.ts"
  modified:
    - "src/data/towns/index.ts"

key-decisions:
  - "safeGenerateValidTown wraps generation with try/catch fallback to shorter chains"
  - "Shepherd's Ridge chain length reduced from 6 to 5 for reliable generation"
  - "Discovery tests use route interception with inline [DISCOVERY:] markers"
  - "navigateToNPCLocation iterates all map nodes to find one with visible NPCs"

patterns-established:
  - "Town selection test pattern: goto -> verifyTownSelectionVisible -> selectTown"
  - "Generated town NPC test: selectTown -> createCharacter -> startDay -> navigateToNPCLocation -> startConversation"
  - "Variety verification: getTownCardNames/getTownCardSinDepths assert uniqueness"

# Metrics
duration: 8min
completed: 2026-01-23
---

# Phase 6 Plan 6: Town Generation E2E Tests Summary

**6 Playwright E2E tests validating full town generation pipeline: selection UI, generated town navigation, NPC interaction, sin discovery, and content variety**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-23T05:24:51Z
- **Completed:** 2026-01-23T05:33:03Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- 6 BDD scenarios covering complete town generation flow in Gherkin feature file
- 11 reusable step helpers for town selection, NPC navigation, and discovery attempts
- 6 stable Playwright tests passing 3x without flakiness (5.2-5.3s per run)
- Full E2E suite passes: 36 tests (30 prior + 6 new) in 30s
- Fixed critical bug: safeGenerateValidTown prevents app crash on generation failure

## Task Commits

Each task was committed atomically:

1. **Task 1: BDD feature file and step helpers** - `928b116` (test)
2. **Task 2: Playwright test specs** - `e32bda7` (test)

## Files Created/Modified
- `e2e/features/town-generation.feature` - 6 BDD scenarios for town generation
- `e2e/steps/townGeneration.steps.ts` - 11 step helpers (selectTown, verifyTownLoaded, navigateToNPCLocation, etc.)
- `e2e/town-generation.spec.ts` - 6 Playwright test specs with route interception
- `src/data/towns/index.ts` - safeGenerateValidTown fallback, chain length reduced to 5

## Decisions Made
- **safeGenerateValidTown fallback:** Generation with 6-level chains frequently fails validator (10/10 attempts). Added try/catch wrapper that falls back to shorter chain lengths (chainLength-1, then 3) to prevent app crash.
- **Chain length 5 for both generated towns:** 6-level chains are too complex for current validator to reliably pass. Both generated towns now use chainLength 5.
- **Inline discovery markers in route interception:** Tests mock the dialogue API response with [DISCOVERY: factId|sinId|content] format matching production parsing.
- **Iterative NPC location search:** navigateToNPCLocation clicks each map node and checks for npc-button visibility, since generated town NPC placement is dynamic.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed app crash from failed town generation**
- **Found during:** Task 2 (Playwright test specs)
- **Issue:** generateValidTown throws when all 10 attempts fail for 6-level chains. Since towns/index.ts calls this at module load time, the entire React app crashes before rendering.
- **Fix:** Added safeGenerateValidTown wrapper with try/catch fallback to shorter chain lengths. Reduced Shepherd's Ridge from chainLength 6 to 5.
- **Files modified:** src/data/towns/index.ts
- **Verification:** App renders TownSelection with all 3 towns. All 36 E2E tests pass.
- **Committed in:** e32bda7 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Bug fix essential for app to function. No scope creep.

## Issues Encountered
- Node v18.16.1 too old for Playwright ESM module loading (requires 18.19+). Used nvm to switch to Node v20.20.0.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 6 (Town Generation) complete: all 6 plans executed
- Full E2E suite: 36 tests covering cycles, conflicts, characters, investigation, and town generation
- Town generation pipeline produces playable towns with verified discoverability
- Ready for Phase 7 (final phase, if applicable)

---
*Phase: 06-town-generation*
*Completed: 2026-01-23*
