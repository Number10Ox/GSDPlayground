---
phase: 04-character-system
plan: 01
subsystem: character-data
tags: [types, immer, reducer, context, ditv-stats]
dependency-graph:
  requires: [01-foundation, 02-cycle-system]
  provides: [character-types, character-reducer, character-provider]
  affects: [04-02, 04-03, 04-04]
tech-stack:
  added: [immer, lucide-react]
  patterns: [immer-produce-reducer, character-context-provider]
key-files:
  created:
    - src/types/character.ts
    - src/reducers/characterReducer.ts
    - src/hooks/useCharacter.tsx
  modified:
    - src/App.tsx
    - package.json
    - package-lock.json
decisions:
  - id: char-die-simple
    description: "CharacterDie is simpler than game Die (no assignedTo/value) - conflict dice are rolled separately"
  - id: stat-modifier
    description: "Stat.modifier tracks temporary injury reduction (starts at 0)"
  - id: provider-outermost
    description: "CharacterProvider wraps outermost - character is most fundamental entity"
  - id: immer-null-state
    description: "Character state starts null until SET_CHARACTER - no character until creation"
metrics:
  duration: 2 min
  completed: 2026-01-22
---

# Phase 04 Plan 01: Character Types and State Summary

JWT-free DitV character data layer with Immer reducer, four stats (Acuity/Body/Heart/Will) as dice arrays, typed traits/items/relationships, and context provider wired into app.

## What Was Done

### Task 1: Install dependencies and create character types
- Installed `immer` (immutable state updates) and `lucide-react` (icons for future UI)
- Created `src/types/character.ts` with complete DitV-faithful type system:
  - `CharacterDie` (id + DieType, simpler than game Die)
  - `Stat` with dice arrays and injury modifier
  - `Trait` with source tracking (creation vs fallout)
  - `Item` with category-based dice and isGun flag
  - `Relationship` linking to NPCs with dice
  - `DiceSource` discriminated union for conflict pool tracking
  - `Background` type with `BACKGROUND_DICE` constants (complicated-history/strong-community/well-rounded)
  - `CharacterAction` discriminated union (8 action types)
  - `createStartingInventory()` helper (Coat d8, Gun d6+d4, Book of Life d6, Sacred Earth d6)
  - `createCharacter()` helper with point-buy validation

### Task 2: Create character reducer and context provider
- Created `src/reducers/characterReducer.ts` with Immer `produce()` wrapper
  - Handles all 8 action types with clean mutable-style updates
  - Null-state guard: only SET_CHARACTER works when no character exists
- Created `src/hooks/useCharacter.tsx` with CharacterProvider + useCharacter hook
  - Follows same pattern as useGameState (useReducer + context + null guard)
- Updated `src/App.tsx`: CharacterProvider wraps as outermost provider

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| CharacterDie simpler than game Die | Character dice don't need assignedTo/value - those are computed during conflict |
| Stat.modifier for injuries | Allows temporary dice reduction without mutating the base dice array |
| CharacterProvider outermost | Character is the most fundamental entity; game state and NPC memory depend on it |
| Null initial state | No character exists until player completes creation flow |
| Background dice per DitV rules | complicated-history: 13 stat, more traits; well-rounded: 17 stat, fewer traits |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- `npx tsc --noEmit` passes cleanly
- `npm run build` succeeds (387KB JS bundle)
- All types importable from `@/types/character`
- CharacterProvider + useCharacter importable from `@/hooks/useCharacter`

## Next Phase Readiness

Plan 04-02 (Character Creation UI) can proceed immediately:
- Types are complete and exported
- Reducer handles SET_CHARACTER for creation flow
- Context provider is wired and available throughout component tree
- Background constants define point-buy budgets
