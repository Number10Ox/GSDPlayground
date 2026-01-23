---
phase: 06-town-generation
plan: 02
subsystem: generation
tags: [npc, archetypes, relationships, procedural, seeded-rng, ditv]

# Dependency graph
requires:
  - phase: 06-01
    provides: seededRandom.ts, sinTemplates.ts, sinChainGenerator.ts, fillTemplate utility
provides:
  - NPC archetype templates (9 roles with personality, speech, resist, fact patterns)
  - Relationship pattern definitions for all 7 sin levels
  - NPC generator producing 5-7 interconnected NPCs from sin chains
  - NPCGenerationResult type with npcs, relationships, updatedSinChain
affects: [06-03, 06-04, 06-05, 06-06]

# Tech tracking
tech-stack:
  added: []
  patterns: [archetype-template-selection, slot-based-fact-generation, seeded-archetype-diversity, sin-based-connectivity-graph]

key-files:
  created:
    - src/templates/npcArchetypes.ts
    - src/templates/relationshipPatterns.ts
    - src/generators/npcGenerator.ts
  modified: []

key-decisions:
  - "9 archetypes (not 8): added widow role for victim/grief-driven narrative tension"
  - "Global fallback in relationship building: matches any NPC with right role when local sin-pair not found"
  - "Separate RNG seeds for NPC generation and slot filling to ensure independence"
  - "ROLE_SLOT_TO_ARCHETYPE mapping for flexible sin template role to archetype resolution"

patterns-established:
  - "Archetype template pattern: role-based templates with personality, speech, resist, and fact arrays"
  - "Slot-filled fact generation: {town}/{authority}/{victim}/{sinner} replaced from sin chain context"
  - "Sin coverage enforcement: every sin guaranteed 2+ NPCs via adjacent-sin borrowing"
  - "Connectivity validation: every NPC shares at least one sin with another NPC"

# Metrics
duration: 19min
completed: 2026-01-23
---

# Phase 6 Plan 2: NPC Generator Summary

**9 DitV-authentic NPC archetypes with sin-linked knowledge facts, relationship patterns for all 7 sin levels, and a seeded generator producing 5-7 interconnected NPCs per town**

## Performance

- **Duration:** 19 min
- **Started:** 2026-01-23T03:09:28Z
- **Completed:** 2026-01-23T03:28:40Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments
- 9 NPC archetypes (steward, sheriff, healer, farmer, teacher, preacher, merchant, elder, widow) each with 4+ personality templates, 3+ speech patterns, 5 fact templates spanning trust levels 0-80
- Relationship patterns for all 7 sin levels defining role-pair connections (ally, enemy, protector-of, victim-of, secret-keeper, family, romantic)
- NPC generator producing 5-7 interconnected NPCs with full knowledge, thresholds, and sin linkages
- Deterministic generation from seeded RNG with verified connectivity

## Task Commits

Each task was committed atomically:

1. **Task 1: NPC archetypes and relationship patterns** - `c086757` (feat)
2. **Task 2: NPC generator with sin-based connectivity** - `9a0f21e` (feat)

## Files Created/Modified
- `src/templates/npcArchetypes.ts` - 9 NPC archetypes with NPCArchetype/FactTemplate interfaces
- `src/templates/relationshipPatterns.ts` - RelationshipType, NPCRelationship, RELATIONSHIP_PATTERNS for all 7 sin levels
- `src/generators/npcGenerator.ts` - generateNPCs function with NPCGenerationResult type

## Decisions Made
- Added widow as 9th archetype (plan specified 8+) for victim/grief narrative coverage
- Used global fallback in relationship building: if no matching role pair exists at the same sin, searches all NPCs by role. This produces richer relationship graphs for smaller NPC casts.
- Separate RNG seed (`${seed}-npcs`) for NPC generation vs slot filling (`${seed}-slots`) to prevent cross-contamination between archetype selection and name generation sequences.
- Created ROLE_SLOT_TO_ARCHETYPE mapping (70+ entries) for flexible resolution of sin template roles (e.g., "patriarch" -> farmer/elder, "betrayed-spouse" -> widow/healer).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed require() call in browser context**
- **Found during:** Task 2 (NPC generator)
- **Issue:** Initial implementation used `require('@/templates/sinTemplates')` which is not valid in Vite/browser environment
- **Fix:** Changed to static ES module import of SIN_TEMPLATES at file top
- **Files modified:** src/generators/npcGenerator.ts
- **Verification:** `npx tsc --noEmit` passes clean
- **Committed in:** 9a0f21e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Trivial fix needed for module system compatibility. No scope change.

## Issues Encountered
- tsx path alias resolution required `--tsconfig tsconfig.app.json` flag for runtime verification
- tsx `-e` inline execution did not produce output for complex scripts; file-based execution worked correctly

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- NPC archetypes and generator ready for town assembly (06-03)
- Relationship patterns ready for validator verification (06-04)
- Generated NPCs conform exactly to existing NPC interface (id, name, locationId, description, role, knowledge, conflictThresholds)
- All types exported for downstream consumers

---
*Phase: 06-town-generation*
*Completed: 2026-01-23*
