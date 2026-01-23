---
phase: 06-town-generation
plan: 04
subsystem: generation
tags: [validation, sin-chain, npc, playability, retry-loop, graph-traversal]

# Dependency graph
requires:
  - phase: 06-town-generation/03
    provides: town generator assembler (generateTown)
provides:
  - Sin chain discoverability validation (validateSinChainDiscoverable)
  - NPC stakes and connectivity validation (validateNPCStakes)
  - Structural playability validation (validatePlayability)
  - Composed validator (validateTown)
  - Generate-validate loop (generateValidTown)
affects: [06-town-generation/05, 06-town-generation/06]

# Tech tracking
tech-stack:
  added: []
  patterns: [validate-retry loop, graph reachability via BFS, cycle detection via iterative DFS, composed validators]

key-files:
  created:
    - src/generators/validators/sinChainValidator.ts
    - src/generators/validators/npcStakesValidator.ts
    - src/generators/validators/playabilityValidator.ts
  modified:
    - src/generators/townGenerator.ts

key-decisions:
  - "Cycle detection only flags genuine prerequisite dependencies, not NPC knowledge breadth"
  - "Sins with trust-0 facts are independently discoverable (no incoming dependency edges)"
  - "Retry uses seed suffix pattern (seed-retry-N) for deterministic but varied attempts"

patterns-established:
  - "ValidationResult/ValidationError types for composable validator output"
  - "Composed validators: individual validators return results, top-level merges"
  - "Generate-validate loop: generate, validate, retry with modified seed"

# Metrics
duration: 7min
completed: 2026-01-23
---

# Phase 6 Plan 4: Validation Pipeline Summary

**Three composable validators (sin chain, NPC stakes, playability) with generate-validate-retry loop guaranteeing playable town output**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-23T05:06:06Z
- **Completed:** 2026-01-23T05:13:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Sin chain validator catches unreachable sins (no starter facts), circular dependencies, and isolated sins
- NPC stakes validator catches missing knowledge, stakeless NPCs, disconnected NPCs, and missing entry points
- Playability validator checks structural integrity (location refs, topic rule refs, connectivity, topic coverage)
- generateValidTown() retries up to 10 times, guaranteeing playable output or explicit error

## Task Commits

Each task was committed atomically:

1. **Task 1: Sin chain and NPC validators** - `3a62687` (feat)
2. **Task 2: Playability validator and generate-validate loop** - `aa4e17d` (feat)

## Files Created/Modified
- `src/generators/validators/sinChainValidator.ts` - Validates sin reachability, cycles, isolation; exports ValidationError/ValidationResult types
- `src/generators/validators/npcStakesValidator.ts` - Validates NPC knowledge, stakes, connectivity, entry points
- `src/generators/validators/playabilityValidator.ts` - Validates structural integrity, composes all validators via validateTown()
- `src/generators/townGenerator.ts` - Added generateValidTown() with validate-retry loop

## Decisions Made
- Cycle detection uses discovery topic rule gates, not NPC knowledge breadth (NPCs knowing multiple sins is normal, not circular)
- Sins with trust-0 facts are independently discoverable and excluded from dependency graph (they don't need prerequisites)
- Retry seed suffix pattern (`-retry-N`) ensures deterministic but varied output per attempt
- NPC connectivity checked implicitly via shared sin assignments in linkedNpcs arrays (no explicit relationship edges needed)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed overly aggressive circular dependency detection**
- **Found during:** Task 2 (verification testing)
- **Issue:** Original cycle detection created edges for any NPC knowing about multiple sins, causing ALL generated towns to fail validation with false circular dependency errors
- **Fix:** Restricted dependency edges to genuine discovery prerequisites: only when a discovery-gated topic rule is the sole access path to another sin's facts (excluding independently discoverable sins with trust-0 facts)
- **Files modified:** src/generators/validators/sinChainValidator.ts
- **Verification:** 5 different seeds all produce valid towns within 1-6 attempts
- **Committed in:** aa4e17d (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for validator correctness. Without it, no generated town could pass validation.

## Issues Encountered
None beyond the deviation above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Validation pipeline complete, ready for integration testing (plan 06-05)
- generateValidTown() is the recommended entry point for all consumers
- All validators produce actionable error messages with specific sin/NPC identifiers

---
*Phase: 06-town-generation*
*Completed: 2026-01-23*
