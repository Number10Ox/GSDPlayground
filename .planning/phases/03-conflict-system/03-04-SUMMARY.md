---
phase: 03-conflict-system
plan: 04
subsystem: npc, memory
tags: [react-context, npc-memory, relationship-tracking, witness-system, conflict-history]

# Dependency graph
requires:
  - phase: 03-02
    provides: ConflictView component and conflict resolution flow
  - phase: 03-03
    provides: FalloutReveal, ConflictResolution, game state integration
provides:
  - NPC and memory type definitions
  - NPCMemoryProvider context and useNPCMemory hook
  - ConflictMarker component for at-a-glance violence history
  - RelationshipPanel component for detailed NPC history
  - Witness detection at locations
  - Conflict recording to NPC memory on resolution
affects: [04-npc-ai, 05-town-generation, future NPC interaction systems]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "NPC memory context with reducer pattern"
    - "Relationship level tracking (-100 to +100)"
    - "Conflict event recording with escalation penalties"

key-files:
  created:
    - src/types/npc.ts
    - src/hooks/useNPCMemory.tsx
    - src/components/NPCMemory/ConflictMarker.tsx
    - src/components/NPCMemory/RelationshipPanel.tsx
    - src/components/NPCMemory/index.ts
  modified:
    - src/App.tsx
    - src/components/Conflict/ConflictView.tsx
    - src/pages/GameView.tsx

key-decisions:
  - "Relationship penalties: JUST_TALKING=0, PHYSICAL=-5, FIGHTING=-15, GUNPLAY=-30"
  - "Targeted NPCs receive double penalty"
  - "Relationship labels: Hostile/Distrustful/Neutral/Friendly/Trusted"
  - "Three marker types: crossed fists (amber), crossed guns (red), broken trust (dark red)"

patterns-established:
  - "NPC memory context wraps app inside GameProvider"
  - "Conflict events auto-recorded on resolution with witnesses"
  - "NPCs displayed in sidebar with ConflictMarker overlays"

# Metrics
duration: 6min
completed: 2026-01-22
---

# Phase 03 Plan 04: NPC Witness/Memory System Summary

**NPC memory context tracking conflict history with relationship levels, visual markers indicating violence history, and slide-out panel showing detailed NPC relationship**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-22
- **Completed:** 2026-01-22
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- NPC and memory type system with ConflictEvent tracking
- NPCMemoryProvider context with reducer handling RECORD_CONFLICT, UPDATE_RELATIONSHIP
- ConflictMarker showing at-a-glance violence history (3 icon types based on severity)
- RelationshipPanel with relationship meter and conflict history
- Auto-detection of witnesses at current location
- Conflict recording integrated with ConflictView resolution flow
- GameView sidebar showing NPCs at current location with markers

## Task Commits

Each task was committed atomically:

1. **Task 1: NPC types and memory context** - `c9508a7` (feat)
2. **Task 2: ConflictMarker and RelationshipPanel components** - `6ef135e` (feat)
3. **Task 3: Integrate memory system with ConflictView and game state** - `fdeb725` (feat)

## Files Created/Modified
- `src/types/npc.ts` - NPC, ConflictEvent, NPCMemory, NPCMemoryAction types
- `src/hooks/useNPCMemory.tsx` - Context, reducer, and hook with helpers
- `src/components/NPCMemory/ConflictMarker.tsx` - Visual marker for violence history
- `src/components/NPCMemory/RelationshipPanel.tsx` - Slide-out panel with history
- `src/components/NPCMemory/index.ts` - Barrel export
- `src/App.tsx` - Added NPCMemoryProvider wrapper
- `src/components/Conflict/ConflictView.tsx` - Records conflict to NPC memory
- `src/pages/GameView.tsx` - Shows NPCs at location with markers and panel

## Decisions Made
- Relationship penalties based on escalation level (doubled if NPC was target)
- Sample NPCs match existing locations: Sheriff Jacob, Ezekiel, Sister Abigail, Brother Hiram
- ConflictMarker uses three distinct icons for different severity levels
- RelationshipPanel uses gradient meter from red to green for -100 to +100
- NPCs displayed in sidebar "People Here" section (not on SVG map)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Unused variable warning from TypeScript in GameView (getNPCById) - removed the unused destructured variable

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- NPC memory system complete and integrated
- Violence has persistent consequences through relationship tracking
- Ready for NPC AI and town generation integration
- Sample NPCs available for testing and development

---
*Phase: 03-conflict-system*
*Completed: 2026-01-22*
