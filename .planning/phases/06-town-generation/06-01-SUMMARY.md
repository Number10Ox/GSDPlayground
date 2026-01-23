---
phase: 06-town-generation
plan: 01
subsystem: generation
tags: [prng, seeded-random, sin-chain, templates, ditv, procedural]

# Dependency graph
requires:
  - phase: 05-investigation
    provides: "SinNode/SinLevel types, SIN_CHAIN_ORDER constant"
provides:
  - "Deterministic seeded RNG utility (createRNG, SeededRNG)"
  - "21 DitV-authentic sin templates (3 per level)"
  - "Sin chain generator (generateSinChain) producing valid SinNode[]"
  - "Template slot-filling utility (fillTemplate)"
affects: [06-02, 06-03, 06-04, 06-05, 06-06]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Mulberry32 PRNG with string seed hashing", "Slot-based template pattern with placeholder substitution"]

key-files:
  created:
    - src/utils/seededRandom.ts
    - src/templates/sinTemplates.ts
    - src/generators/sinChainGenerator.ts
  modified: []

key-decisions:
  - "Mulberry32 PRNG algorithm (fast, good distribution, zero dependencies)"
  - "cyrb53-inspired string hash for seed-to-number conversion"
  - "Slot-based templates with {town}/{authority}/{victim}/{sinner} placeholders"
  - "Town names derived from seed via RNG pick from curated prefix/suffix lists"
  - "Chain always starts from pride, takes first N levels from SIN_CHAIN_ORDER"

patterns-established:
  - "Seeded generation: createRNG(seed) -> deterministic picks for all procedural content"
  - "Template pattern: hand-authored templates with slot placeholders, filled at generation time"
  - "Generator pattern: single function with seed+config, returns typed array"

# Metrics
duration: 9min
completed: 2026-01-23
---

# Phase 6 Plan 1: Sin Chain Generator Summary

**Deterministic sin chain generator using Mulberry32 PRNG and 21 hand-authored DitV-authentic sin templates with slot-based pattern filling**

## Performance

- **Duration:** 9 min
- **Started:** 2026-01-23T02:57:39Z
- **Completed:** 2026-01-23T03:06:44Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- Seeded RNG utility with next/nextInt/pick/shuffle methods, fully deterministic
- 21 sin progression templates (3 per level) with authentic DitV frontier faith content
- Sin chain generator producing valid SinNode[] arrays of configurable length (3-7)
- Same seed always produces identical chains; different seeds produce different content

## Task Commits

Each task was committed atomically:

1. **Task 1: Seeded RNG utility and sin templates** - `a00a93b` (feat)
2. **Task 2: Sin chain generator** - `da35d6e` (feat)

## Files Created/Modified
- `src/utils/seededRandom.ts` - Deterministic PRNG with SeededRNG interface (next, nextInt, pick, shuffle)
- `src/templates/sinTemplates.ts` - 21 DitV-authentic sin templates with slot placeholders across all 7 levels
- `src/generators/sinChainGenerator.ts` - generateSinChain(seed, chainLength) producing valid SinNode[] arrays

## Decisions Made
- Mulberry32 PRNG chosen for speed and zero external dependencies (pure math, ~10 lines)
- String hash uses cyrb53-inspired dual-hash approach for good distribution
- Templates use {placeholder} slots rather than function-based generation for readability and author-friendliness
- Town name derivation consumes RNG state before template selection, ensuring consistent ordering
- Chain length clamped silently (no throw) to 3-7 range for robustness

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed unused parameter lint error**
- **Found during:** Task 2 (sin chain generator)
- **Issue:** `deriveTownName` had unused `seed` parameter alongside `rng`, causing noUnusedParameters error
- **Fix:** Removed the redundant `seed` parameter since RNG provides all needed randomness
- **Files modified:** src/generators/sinChainGenerator.ts
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** da35d6e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Trivial signature cleanup. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Sin chain generator ready for use by NPC generator (06-02) and town generator (06-03)
- SeededRNG utility available for all procedural generation in remaining plans
- fillTemplate utility reusable for NPC name/description generation

---
*Phase: 06-town-generation*
*Completed: 2026-01-23*
