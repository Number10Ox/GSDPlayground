---
phase: 04-character-system
plan: 04
subsystem: ui
tags: [react, conflict, fallout, traits, relationships, dice-pool]

# Dependency graph
requires:
  - phase: 04-02
    provides: "Conflict reducer with INVOKE_TRAIT/USE_ITEM, generateDicePool with character stats"
  - phase: 04-03
    provides: "TraitAndItemInvocation component, conflict wiring in ConflictView"
provides:
  - "Fallout-to-trait conversion (severity maps to die type)"
  - "RelationshipDice component for conflict bonus dice"
  - "USE_RELATIONSHIP conflict action with guards"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fallout creates permanent character traits (consequences become identity)"
    - "Relationship dice rolled at invocation time (CharacterDie -> Die with value)"
    - "One-use-per-conflict pattern for traits, items, and relationships"

key-files:
  created:
    - src/utils/falloutTraits.ts
    - src/components/Character/RelationshipDice.tsx
  modified:
    - src/components/Conflict/FalloutReveal.tsx
    - src/types/conflict.ts
    - src/reducers/conflictReducer.ts
    - src/components/Conflict/ConflictView.tsx

key-decisions:
  - "FalloutReveal uses useCharacter() directly (not prop-drilled dispatch)"
  - "Fallout trait die type scales: MINOR=d4, SERIOUS=d6, DEADLY=d8"
  - "RelationshipDice shows all relationships sorted by relevance (direct NPC first)"
  - "Relationship dice value=0 in preview (unrolled), rolled at invocation time"

patterns-established:
  - "Fallout consequences accumulate as traits with source: 'fallout'"
  - "usedRelationships array parallels usedTraits/usedItems pattern"
  - "Conflict NPC extracted from gameState.activeConflict with state.npcId fallback"

# Metrics
duration: 5min
completed: 2026-01-22
---

# Phase 4 Plan 4: Fallout Traits & Relationship Dice Summary

**Fallout creates permanent d4/d6/d8 traits by severity, relationships provide one-use bonus dice in relevant conflicts**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-22T21:33:44Z
- **Completed:** 2026-01-22T21:38:46Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Fallout-to-trait conversion: MINOR/SERIOUS/DEADLY fallout creates d4/d6/d8 trait with thematic name
- FalloutReveal integrates trait creation in VERDICT phase with visual feedback
- RelationshipDice component shows NPC relationships during conflicts with "Use" buttons
- USE_RELATIONSHIP reducer action with phase/turn/uniqueness guards

## Task Commits

Each task was committed atomically:

1. **Task 1: Fallout-to-trait conversion** - `2f190de` (feat)
2. **Task 2: Relationship dice in conflicts** - `6602adf` (feat)

## Files Created/Modified
- `src/utils/falloutTraits.ts` - createTraitFromFallout utility with FALLOUT_TRAIT_NAMES by type
- `src/components/Character/RelationshipDice.tsx` - UI for using relationship dice in conflicts
- `src/components/Conflict/FalloutReveal.tsx` - Added trait creation on VERDICT, shows gained trait
- `src/types/conflict.ts` - Added usedRelationships field and USE_RELATIONSHIP action
- `src/reducers/conflictReducer.ts` - Handle USE_RELATIONSHIP with guards, init usedRelationships
- `src/components/Conflict/ConflictView.tsx` - Wire RelationshipDice with npcId from gameState

## Decisions Made
- FalloutReveal calls useCharacter() directly rather than receiving dispatch as prop (component already manages internal state machine, prop drilling would add complexity)
- Severity-to-die mapping follows DitV spirit: worse damage = better die (the scar teaches you)
- NONE and DEATH severities don't create traits (nothing happened / character is dead)
- RelationshipDice shows all relationships (not just direct NPC) with relevance indicators, letting the player decide which are narratively relevant
- Conflict NPC ID resolved from gameState.activeConflict?.npcId with state.npcId as fallback

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] DieIcon requires value prop**
- **Found during:** Task 2 (RelationshipDice component)
- **Issue:** DieIcon component requires value prop but relationship dice are unrolled (no value yet)
- **Fix:** Pass value={0} for preview dice (shows type without roll value)
- **Files modified:** src/components/Character/RelationshipDice.tsx
- **Verification:** Build passes
- **Committed in:** 6602adf (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor interface compatibility fix. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 4 (Character System) fully complete
- All character-gameplay loops closed: stats generate dice pool, traits/items add dice mid-conflict, fallout creates new traits, relationships provide bonus dice
- Ready for Phase 5 (NPC & Town Generation)

---
*Phase: 04-character-system*
*Completed: 2026-01-22*
