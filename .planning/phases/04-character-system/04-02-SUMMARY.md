---
phase: 04-character-system
plan: 02
subsystem: character-ui
tags: [components, lucide-icons, point-buy, dice-pool, stat-display]
dependency-graph:
  requires: [04-01]
  provides: [stat-display, character-sheet, character-creation, stat-dice-pool]
  affects: [04-03, 04-04]
tech-stack:
  added: []
  patterns: [point-buy-allocation, stat-based-pool-generation, condition-filter]
key-files:
  created:
    - src/components/Character/StatDisplay.tsx
    - src/components/Character/CharacterSheet.tsx
    - src/components/Character/CharacterCreation.tsx
  modified:
    - src/components/CharacterInfo/CharacterInfo.tsx
    - src/types/game.ts
    - src/utils/dice.ts
    - src/hooks/useGameState.tsx
    - src/components/CycleView/CycleView.tsx
    - src/types/conflict.ts
    - src/reducers/conflictReducer.ts
decisions:
  - id: stat-icons
    description: "Lucide icons: Lightbulb (Acuity), Hand (Body), Heart (Heart), Cross (Will)"
  - id: dice-visualization
    description: "Small colored squares per die (d4=red, d6=amber, d8=green, d10=blue)"
  - id: condition-filter
    description: "Condition < 50 removes 25% weakest dice; < 25 removes 50%"
  - id: point-buy-constraints
    description: "Min 2d6, max 6d6 per stat, total must match background allocation"
  - id: pool-backward-compat
    description: "generateDicePool falls back to condition-only when no character provided"
metrics:
  duration: "4 min"
  completed: "2026-01-22"
---

# Phase 4 Plan 2: Character Display and Creation Summary

**One-liner:** Stat display with western-religious Lucide icons, point-buy character creation, and stat-based dice pool generation replacing condition-only pools.

## What Was Built

### Task 1: Character Display Components
- **StatDisplay** (`src/components/Character/StatDisplay.tsx`): Shows a stat with its Lucide icon, colored die squares, dice notation (e.g., "3d6"), and injury modifier in red when present. Supports compact and dimmed modes.
- **CharacterSheet** (`src/components/Character/CharacterSheet.tsx`): Full character view with name, background, all four stats via StatDisplay, traits with dice notation, inventory with category, and relationships.
- **CharacterInfo** (updated `src/components/CharacterInfo/CharacterInfo.tsx`): Sidebar now uses real character data from `useCharacter()`. Shows all stats in compact mode, cycle number, condition percentage with color coding. When no character exists, shows "Create Character" prompt button.

### Task 2: Character Creation and Stat-Based Dice Pool
- **GameAction update** (`src/types/game.ts`): `START_CYCLE` now accepts optional `dicePool?: Die[]` parameter for pre-computed pools.
- **CharacterCreation** (`src/components/Character/CharacterCreation.tsx`): Three-step creation flow:
  1. Name input (min 2 chars)
  2. Background selection (3 cards with stat/trait/relationship dice summaries)
  3. Stat allocation with +/- buttons (min 2, max 6 per stat, remaining counter)
  - On confirm: calls `createCharacter()` and dispatches `SET_CHARACTER`
- **generateDicePool** (updated `src/utils/dice.ts`): Now accepts optional `Character` parameter. When provided, collects all stat dice, applies modifiers (injuries), then filters by condition level (removes weakest dice at low health). Falls back to condition-only when no character.
- **CycleView** (updated): Imports `useCharacter` and `generateDicePool`, computes character-based pool before dispatching `START_CYCLE` with the computed pool.
- **useGameState** (updated): `START_CYCLE` reducer case uses `action.dicePool` if provided, otherwise falls back to condition-only generation.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Lucide icons: Lightbulb, Hand, Heart, Cross | Western-religious feel matching DitV setting per CONTEXT.md |
| Colored squares for dice visualization | Reuses established color scheme (d4=red, d6=amber, d8=green, d10=blue) |
| Condition filters by removing weakest dice | Maintains character agency (stat allocation matters) while condition degrades pool |
| Min 2 / max 6 per stat constraint | Prevents completely dumping a stat or min-maxing too extremely |
| Pool computed in CycleView, passed via action | Keeps reducer pure (no hooks needed in reducer) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing usedTraits/usedItems in conflict reducer**
- **Found during:** Task 1 build verification
- **Issue:** `ConflictState` ACTIVE type required `usedTraits` and `usedItems` fields (added in 04-01 types) but `conflictReducer.ts` START_CONFLICT case was missing them
- **Fix:** Added empty arrays to START_CONFLICT return value; also included INVOKE_TRAIT and USE_ITEM action handlers in conflict.ts types and reducer
- **Files modified:** `src/types/conflict.ts`, `src/reducers/conflictReducer.ts`
- **Commit:** `15bbfeb`

## Verification

- `npx tsc --noEmit` passes with no errors
- `npm run build` succeeds (396 KB JS bundle)
- CharacterInfo sidebar shows "Create Character" prompt when no character
- CharacterCreation flow: name -> background -> allocate -> confirm
- Stats display with icons and colored dice shapes
- Cycle dice pool generated from character stats with condition filter
- Backward compatible: works without character (falls back to condition-only)

## Next Phase Readiness

Ready for 04-03 (trait invocation during conflicts) and 04-04 (inventory/relationship dice). The `usedTraits` and `usedItems` tracking in conflict state and the INVOKE_TRAIT/USE_ITEM reducer actions are already in place.
