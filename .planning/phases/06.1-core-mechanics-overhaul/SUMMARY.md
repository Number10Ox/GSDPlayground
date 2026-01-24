# Phase 6.1: Core Mechanics Overhaul — Retrospective Summary

**Status:** Complete (documented retrospectively — work done outside GSD framework)
**Commits:** bb134c3 through f2e30c7 (11 commits, 2026-01-23)
**Scope:** Replaced daily cycle with descent clock, added conviction/journey systems, reworked dialogue/conflict flow

## What Was Accomplished

### 1. Descent Clock (replaced Daily Cycle)
- Removed the Citizen Sleeper-style daily cycle (wake→allocate→resolve→summary→rest)
- Replaced with an 8-segment descent clock that advances through timed actions, conflicts, and events
- Descent reaching max escalates the sin chain
- **Deleted:** CycleView, DicePool, DieComponent, CycleSummary, ActionCard, ActionList, FatigueClock
- **Added:** `types/descent.ts`, `utils/descentClock.ts`, DescentThreshold events

### 2. Conviction System (new)
- Full conviction lifecycle: held → tested → shaken → broken → resolved
- Conviction strength (fragile/wavering/steady/firm/unshakeable) maps to die types
- ConvictionTest triggers: discovery, judgment, conflict_outcome, npc_revelation
- Reflection choices: reinforce (strengthen), doubt (weaken), transform (rewrite)
- ConvictionPicker for character creation (select 3 from seeds or write custom)
- ConvictionReflection for between-town processing
- **Files:** `types/conviction.ts`, `components/Conviction/ConvictionPicker.tsx`, `components/Conviction/ConvictionReflection.tsx`, `data/convictionSeeds.ts`, `utils/convictionTesting.ts`

### 3. Journey Persistence (new)
- Multi-town arc: CHARACTER_CREATION → TOWN_ACTIVE → JUDGMENT → TOWN_REFLECTION → RIDING_ON → JOURNEY_COMPLETE
- JourneyState persists character, convictions, completed towns, phase across towns
- TownRecord captures judgments, conviction tests, traits gained, reputation
- Journey ends after 7 towns or when all convictions resolved
- JourneyProgress (riding between towns) and JourneyEnd (arc conclusion) components
- **Files:** `types/journey.ts`, `reducers/journeyReducer.ts`, `hooks/useJourney.tsx`, `components/Journey/JourneyProgress.tsx`, `components/Journey/JourneyEnd.tsx`

### 4. Dialogue Rework
- Removed approach selection (approach chips deleted)
- Added player voice: DialogueOptionCard with tone, stat association, risk indicator
- Dialogue options generated contextually (not pre-defined per topic)
- "Press the Matter" as explicit conflict entry point (replaced ConflictTrigger)
- Inner voice now matches player stat (acuity/body/heart/will commentary)
- Prose-style narrative display maintained
- **Files:** `components/Dialogue/DialogueOptionCard.tsx`, major rewrites to `DialogueView.tsx`, `useDialogue.tsx`, `dialogueReducer.ts`

### 5. Character Creation Expansion
- Expanded from simple point-buy to 6-step wizard:
  1. Name input
  2. Background selection (complicated-history/strong-community/well-rounded)
  3. Stat allocation (point-buy with background-specific totals)
  4. Belongings drawing (draw 4, keep 2 from BELONGINGS_TABLE)
  5. Initiation scene (choose scene → gain starting trait)
  6. Conviction selection (pick 3 from seeds or write custom)
- **Files:** `data/belongingsTable.ts`, `data/initiationScenes.ts`, `data/relationshipSeeds.ts`, expanded `components/Character/CharacterCreation.tsx`

### 6. Trust Mechanics
- Trust ripple: actions with one NPC affect trust with connected NPCs
- Trust breaking: if trust drops below threshold during betrayal, permanently capped at 10
- NPCMemory tracks trust broken flag
- Relationship level affects available knowledge facts (server-side gating)
- **Files:** Updates to `hooks/useNPCMemory.tsx`, `types/npc.ts`

### 7. Town Arrival & Judgment
- TownArrival component: narrative, rumors, greeter NPC, observation text
- JudgmentPanel: player pronounces resolution on discovered sins
- ArrivalData type added to TownData interface
- **Files:** `components/TownArrival/TownArrival.tsx`, `components/Judgment/JudgmentPanel.tsx`

### 8. Authority Actions & Conflict Narration
- TimedAction type: investigation/prayer/tending with descent cost and effects
- ConflictDefinition: declarative conflict setup with consequences
- Action availability gating via UnlockCondition (descent, sin, clue, trust thresholds)
- Conflict narration utilities for dynamic raise/see description
- **Files:** `types/actions.ts`, `utils/actionAvailability.ts`, `utils/authorityActions.ts`, `utils/conflictNarration.ts`, `utils/conflictDice.ts`, `components/ActionMenu/ActionMenu.tsx`

### 9. App Architecture Changes
- App.tsx now uses JourneyProvider → CharacterProvider → JourneyRouter pattern
- JourneyRouter handles phase-based routing (character creation, town selection, gameplay, reflection, journey end)
- TownProvider, GameProvider, NPCMemoryProvider, InvestigationProvider, DialogueProvider compose per-town
- TownSelection shows ALL_TOWNS (3 built-in) with onSelectTown callback

## Architectural Impact on Earlier Phases

| Phase | Impact |
|-------|--------|
| Phase 2 (Cycle) | **Superseded** — daily cycle entirely replaced by descent clock |
| Phase 4 (Character) | **Expanded** — creation wizard grew from point-buy to 6 steps |
| Phase 5 (Investigation) | **Reworked** — approach removed, dialogue options added, conflict entry changed |

## Key Decisions (implicit, not pre-planned)
- Descent clock better models DitV's "things get worse while you investigate" than daily cycles
- Convictions provide the personal moral stakes that DitV requires (player's beliefs vs town's reality)
- Journey persistence enables the multi-town arc that gives convictions meaning
- Removing approaches from dialogue simplifies player choices (topic + voice, not topic + approach + voice)
- "Press the Matter" as explicit player choice to escalate (not automatic from approach)
