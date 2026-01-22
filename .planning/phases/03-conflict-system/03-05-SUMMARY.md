---
phase: 03-conflict-system
plan: 05
subsystem: testing
tags: [playwright, e2e, bdd, gherkin, conflict-system]

# Dependency graph
requires:
  - phase: 02.1-e2e-testing
    provides: Playwright infrastructure, step definition patterns, data-testid conventions
  - phase: 03-01
    provides: Conflict types, state machine reducer
  - phase: 03-02
    provides: ConflictView, RaiseControls, EscalationConfirm components
  - phase: 03-03
    provides: FalloutReveal, ConflictResolution components
  - phase: 03-04
    provides: NPC memory integration
provides:
  - BDD feature file with 7 Gherkin scenarios for conflict system
  - 15 step helper functions for conflict E2E testing
  - 7 Playwright test specs covering conflict mechanics
  - Dev-mode test conflict trigger integrated into GameView
  - Deterministic dice pools for reliable E2E testing
affects: [phase-4, npc-ai, town-generation]

# Tech tracking
tech-stack:
  added: []
  patterns: [deterministic-test-data, robust-npc-wait-handling, conditional-flow-testing]

key-files:
  created:
    - e2e/features/conflict.feature
    - e2e/conflict.spec.ts
  modified:
    - e2e/steps/conflict.steps.ts
    - src/pages/GameView.tsx

key-decisions:
  - "Deterministic dice pools for test conflict (fixed values instead of random generation)"
  - "Promise.race pattern for handling NPC turn outcomes (either turn completes or conflict resolves)"
  - "Adaptive seeWithDice helper that adds more dice if needed to meet raise total"
  - "Dev-mode test conflict button using import.meta.env.DEV guard"

patterns-established:
  - "Deterministic test data: Use fixed values for E2E tests when random generation causes flakiness"
  - "Conditional test flow: Handle alternative outcomes (NPC give vs continue) in single test"
  - "Promise.race for async waits: Wait for multiple possible outcomes simultaneously"

# Metrics
duration: 16min
completed: 2026-01-22
---

# Phase 03-05: Conflict System E2E Tests Summary

**BDD Gherkin scenarios and Playwright specs for conflict mechanics with deterministic test data for reliable CI execution**

## Performance

- **Duration:** 16 min
- **Started:** 2026-01-22T18:18:29Z
- **Completed:** 2026-01-22T18:34:35Z
- **Tasks:** 3
- **Files created/modified:** 4

## Accomplishments

- Created BDD feature file with 7 scenarios covering full conflict flow
- Implemented 15 step helper functions for conflict E2E operations
- Built 7 Playwright test specs: basic exchange, give up, escalation (physical/gunplay), fallout, resolution
- Integrated ConflictView and test trigger into GameView
- Achieved 100% pass rate with deterministic dice pools (35/35 on repeated runs)

## Task Commits

Each task was committed atomically:

1. **Task 1: BDD feature file** - `49ca918` (test)
2. **Task 2: Step helper functions** - `8112189` (test)
3. **Task 3: Playwright specs and GameView integration** - `4243cae` (feat)

## Files Created/Modified

- `e2e/features/conflict.feature` - 7 BDD Gherkin scenarios for conflict system
- `e2e/steps/conflict.steps.ts` - 15 step helper functions (startConflict, raiseWithDice, seeWithDice, giveUp, escalateTo, etc.)
- `e2e/conflict.spec.ts` - Playwright test specs implementing BDD scenarios
- `src/pages/GameView.tsx` - Added ConflictView integration and dev-mode test trigger

## Decisions Made

1. **Deterministic dice pools** - Instead of using generateDicePool() which creates random values, the test conflict uses hardcoded dice arrays (6 dice each with values 6,5,4,4,3,2) for predictable test outcomes
2. **Promise.race for NPC wait** - waitForNPCTurn() uses Promise.race to handle both "NPC finished turn" and "conflict resolved" outcomes, preventing test failures when NPC gives up
3. **Adaptive seeWithDice** - The helper now adds more dice if the initial selection isn't enough to meet the raise, handling variable raise totals
4. **Dev-mode only trigger** - Test conflict button uses `import.meta.env.DEV` guard so it only appears in development builds

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed flaky tests due to random dice pools**
- **Found during:** Task 3 (running test suite repeatedly)
- **Issue:** Tests were flaky because NPC could give up if random dice weren't enough to see/raise
- **Fix:** Replaced generateDicePool() with hardcoded deterministic dice arrays
- **Files modified:** src/pages/GameView.tsx
- **Verification:** 35/35 test runs passed (5 repetitions x 7 tests)
- **Committed in:** 4243cae

**2. [Rule 1 - Bug] Fixed seeWithDice not handling variable raise totals**
- **Found during:** Task 3 (test failures showing "Not enough (need X more)")
- **Issue:** seeWithDice selected exactly N dice but didn't verify they met the raise total
- **Fix:** Added logic to keep selecting dice until see button is enabled
- **Files modified:** e2e/steps/conflict.steps.ts
- **Verification:** Tests pass even with high NPC raise totals
- **Committed in:** 4243cae

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for reliable E2E testing. No scope creep.

## Issues Encountered

- Node.js version (18.16.1) was too old for Playwright ESM modules - switched to Node 20.20.0
- Initial tests had timing issues with NPC AI (1-2s per action) - increased timeouts and used Promise.race pattern

## Next Phase Readiness

- E2E test infrastructure complete for conflict system
- All 16 E2E tests pass (9 cycle + 7 conflict)
- Tests run in headless mode, CI-ready
- Ready for Phase 4 (NPC AI and town generation)

---
*Phase: 03-conflict-system*
*Completed: 2026-01-22*
