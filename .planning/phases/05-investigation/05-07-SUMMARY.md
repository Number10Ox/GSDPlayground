---
phase: 05-investigation
plan: 07
subsystem: testing
tags: [playwright, e2e, investigation, dialogue, mocking, bdd, gherkin]

# Dependency graph
requires:
  - phase: 05-investigation-06
    provides: "Wired investigation system with test town data and dialogue integration"
  - phase: 02-01
    provides: "E2E test pattern with Playwright, BDD features, step helpers"
provides:
  - "7 deterministic E2E tests for the investigation system"
  - "VCR-style dialogue mock fixtures for test reproducibility"
  - "ConflictTrigger wired into DialogueView"
  - "data-testid attributes on LocationNode and fatigue warning"
affects: [06-judgment, 07-polish]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Route interception for LLM mock responses in E2E"
    - "dispatchEvent('click') for SVG element interaction in Playwright"
    - "Custom event bridge (dialogue-conflict) between React contexts"

key-files:
  created:
    - "e2e/fixtures/dialogue-recordings.json"
    - "e2e/features/investigation.feature"
    - "e2e/steps/investigation.steps.ts"
    - "e2e/investigation.spec.ts"
  modified:
    - "src/components/Dialogue/DialogueView.tsx"
    - "src/components/NodeMap/LocationNode.tsx"
    - "src/pages/GameView.tsx"

key-decisions:
  - "Used route interception (page.route) instead of component-level mocks for E2E dialogue tests"
  - "Used dispatchEvent('click') for SVG g elements instead of click({force:true}) due to overlay conflicts"
  - "Used custom window event (dialogue-conflict) to bridge DialogueView -> GameView conflict trigger"
  - "Fixed hooks violation by moving early return after useEffect in DialogueView"

patterns-established:
  - "VCR recording pattern: JSON fixtures keyed by {npcId, topic, approach} for deterministic dialogue"
  - "SVG navigation in E2E: dispatchEvent for g elements that are overlapped by phase overlays"
  - "Conflict trigger wiring: ConflictTrigger component inside DialogueView dispatches events to parent"

# Metrics
duration: 50min
completed: 2026-01-23
---

# Phase 5 Plan 7: Investigation E2E Tests Summary

**7 deterministic Playwright E2E tests with VCR-style LLM mocks verifying investigation dialogue flow, discovery system, mental map, fatigue clock, sin escalation, and conflict triggering**

## Performance

- **Duration:** 50 min
- **Started:** 2026-01-23T00:21:41Z
- **Completed:** 2026-01-23T01:11:24Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- 16 deterministic dialogue recordings covering all test town NPCs and discovery paths
- 7 BDD Gherkin scenarios matching INV-01 through INV-04 requirements
- 15 reusable step helper functions following established project pattern
- Route interception prevents any real LLM API calls during testing
- All 7 tests pass deterministically in both sequential and parallel execution

## Task Commits

Each task was committed atomically:

1. **Task 1: Mock dialogue fixtures and BDD feature file** - `2556bde` (test)
2. **Task 2: Playwright test specs with route interception** - `6375c9e` (feat)

## Files Created/Modified
- `e2e/fixtures/dialogue-recordings.json` - 16 VCR-style recordings keyed by {npcId, topic, approach}
- `e2e/features/investigation.feature` - 7 BDD scenarios (52 lines) as specification
- `e2e/steps/investigation.steps.ts` - 15 step helpers for investigation test operations
- `e2e/investigation.spec.ts` - 7 Playwright specs with route interception
- `src/components/Dialogue/DialogueView.tsx` - ConflictTrigger wiring + hooks order fix
- `src/components/NodeMap/LocationNode.tsx` - data-testid on SVG g elements
- `src/pages/GameView.tsx` - data-testid on fatigue warning + dialogue-conflict listener

## Decisions Made
- **Route interception over mock modules**: Used Playwright's page.route to intercept /api/dialogue requests rather than mocking at the module level, providing more realistic testing of the streaming response path
- **dispatchEvent for SVG navigation**: Discovered that click({force:true}) doesn't reliably trigger React handlers on SVG g elements when overlays exist; dispatchEvent('click') works correctly
- **Custom event bridge**: Used window.dispatchEvent('dialogue-conflict') to communicate between DialogueView (inside DialogueProvider context) and GameView (which manages conflict state), avoiding prop drilling across context boundaries
- **Sequential response delivery**: Used plain text body fulfillment instead of streaming chunks, since the ReadableStream reader handles both formats and plain text is simpler for test fixtures

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed React hooks violation in DialogueView**
- **Found during:** Task 2 (E2E test execution - dialogue close caused app crash)
- **Issue:** DialogueView had an early return (`if phase === 'IDLE' return null`) before a useEffect hook, violating React's rules of hooks. When dialogue closed, React errored with "Rendered fewer hooks than expected"
- **Fix:** Moved the early return statement after the useEffect hook
- **Files modified:** src/components/Dialogue/DialogueView.tsx
- **Verification:** App no longer crashes on dialogue close; all 7 E2E tests pass
- **Committed in:** 6375c9e (Task 2 commit)

**2. [Rule 2 - Missing Critical] Wired ConflictTrigger into DialogueView**
- **Found during:** Task 2 (conflict trigger test required the wiring)
- **Issue:** ConflictTrigger component existed but was not rendered in DialogueView (was planned for 05-06 but deferred)
- **Fix:** Added ConflictTrigger rendering after body/will approaches complete, with custom event dispatch to GameView for conflict creation
- **Files modified:** src/components/Dialogue/DialogueView.tsx, src/pages/GameView.tsx
- **Verification:** Conflict trigger test passes; ConflictTrigger visible in dev mode
- **Committed in:** 6375c9e (Task 2 commit)

**3. [Rule 2 - Missing Critical] Added data-testid to LocationNode and fatigue warning**
- **Found during:** Task 2 (E2E tests needed to navigate and verify fatigue)
- **Issue:** LocationNode SVG elements and fatigue toast lacked data-testid attributes for E2E accessibility
- **Fix:** Added data-testid="map-node-{id}" to LocationNode and data-testid="fatigue-warning" to toast
- **Files modified:** src/components/NodeMap/LocationNode.tsx, src/pages/GameView.tsx
- **Verification:** Tests can navigate via map nodes and verify fatigue warnings
- **Committed in:** 6375c9e (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 missing critical)
**Impact on plan:** All auto-fixes necessary for correctness and test functionality. No scope creep.

## Issues Encountered
- SVG `<g>` element clicks with `click({force:true})` don't trigger React handlers when overlapped by absolute-positioned overlays (cycle-wake-overlay). Resolved by using `dispatchEvent('click')` instead.
- Dev server HMR caused test timeout when code changes were saved during test execution (5 tests failed during one run). Resolved by running tests after HMR completed.
- JSON import in ESM context required `fs.readFileSync` instead of `import ... from` since Playwright's ESM loader doesn't support JSON import assertions.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Investigation phase complete (all 7 plans executed)
- 30 total E2E tests across character, cycle, conflict, and investigation systems
- Ready for Phase 6 (Judgment) which builds on discovered sins and confrontation mechanics
- ConflictTrigger now wired in, providing the bridge from investigation to judgment

---
*Phase: 05-investigation*
*Completed: 2026-01-23*
