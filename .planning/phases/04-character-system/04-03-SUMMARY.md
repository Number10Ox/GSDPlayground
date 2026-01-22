---
phase: 04-character-system
plan: 03
subsystem: character-ui
tags: [traits, inventory, invocation, conflict-integration, framer-motion]
depends_on:
  requires: ["04-01"]
  provides: ["trait-invocation", "item-usage", "inventory-display"]
  affects: ["04-04"]
tech_stack:
  added: []
  patterns: ["conflict-dice-injection", "character-die-rolling"]
key_files:
  created:
    - src/components/Character/InventoryPanel.tsx
    - src/components/Character/TraitList.tsx
    - src/components/Character/TraitAndItemInvocation.tsx
  modified:
    - src/types/conflict.ts
    - src/reducers/conflictReducer.ts
    - src/components/Conflict/ConflictView.tsx
decisions:
  - id: "invocation-props-pattern"
    description: "TraitAndItemInvocation receives props from ConflictView instead of using useCharacter internally, keeping it testable"
  - id: "character-die-roll-on-invoke"
    description: "CharacterDie rolled to Die (with value) at invocation time, not pre-rolled"
  - id: "unified-trait-item-panel"
    description: "Single panel for both traits and items with section headers, not separate components"
metrics:
  duration: "3 min"
  completed: "2026-01-22"
---

# Phase 04 Plan 03: Trait & Item Invocation Summary

**Mid-conflict trait/item invocation with once-per-conflict enforcement and unified panel UI**

## What Was Built

### Task 1: Inventory and Trait Display Components
- **InventoryPanel**: Displays items with category badges (normal/big/excellent/big-excellent/crap), colored dice indicators, and gun icons (Lucide Target)
- **TraitList**: Shows traits with dice notation (e.g. "2d6"), source badges (creation=amber, fallout=red), and optional Invoke buttons for conflict mode

### Task 2: Trait and Item Invocation During Conflict
- **ConflictState additions**: `usedTraits: string[]` and `usedItems: string[]` track once-per-conflict usage
- **INVOKE_TRAIT action**: Guarded by ACTIVE phase + PLAYER_RAISE/PLAYER_SEE turn + not-already-used
- **USE_ITEM action**: Same guards as traits; adds rolled item dice to player pool
- **TraitAndItemInvocation component**: Unified panel with Traits and Items sections, rolls CharacterDie -> Die on invocation, framer-motion slide animation
- **ConflictView integration**: Panel renders below escalation buttons during player's raise/see turns, only when character has traits or items

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Props pattern for invocation component | ConflictView passes traits/items/dispatch as props rather than component using hooks internally - keeps it testable and decoupled |
| Roll on invoke, not pre-rolled | CharacterDie has no value; rolling at invocation time matches the dramatic moment of narrating a trait into the fiction |
| Unified panel for traits and items | Single component with section headers reduces cognitive load vs two separate panels |

## Deviations from Plan

None - plan executed exactly as written. The conflict types and reducer already had usedTraits/usedItems/INVOKE_TRAIT/USE_ITEM changes from a prior plan (04-02) that pre-applied them as a type sync fix.

## Verification

- [x] `npx tsc --noEmit` passes
- [x] `npm run build` succeeds
- [x] InventoryPanel displays items with categories and dice
- [x] TraitList shows traits with dice and source badges
- [x] TraitAndItemInvocation renders during player's raise/see turns
- [x] INVOKE_TRAIT adds rolled dice to player pool
- [x] USE_ITEM adds rolled dice to player pool
- [x] Same trait/item cannot be invoked/used twice (usedTraits/usedItems guard)

## Commits

| Hash | Message |
|------|---------|
| d2acf49 | feat(04-03): inventory and trait display components |
| b54d05d | feat(04-03): trait and item invocation during conflict |

## Next Phase Readiness

Plan 04-04 (Character Creation Flow) can proceed. All display and invocation infrastructure is in place:
- Character types and state management (04-01)
- Character display components (04-02)
- Trait/item invocation during conflict (04-03)

The creation flow needs only to produce a valid Character object using the existing types and dispatch SET_CHARACTER.
