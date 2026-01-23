# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-20)

**Core value:** The player must be able to arrive in a procedurally generated town, discover its moral rot through investigation and NPC interaction, and resolve conflicts using the escalating stakes system — experiencing the weight of judgment that defines Dogs in the Vineyard.
**Current focus:** Phase 5 - Investigation System (Integration complete, E2E tests next)

## Current Position

Phase: 5 of 7 (Investigation)
Plan: 6 of 7 in current phase
Status: In progress
Last activity: 2026-01-23 — Completed 05-06-PLAN.md (Investigation Integration)

Progress: [████████████████░░░░] 83%

## Performance Metrics

**Velocity:**
- Total plans completed: 25
- Average duration: 4.6 min
- Total execution time: 1.95 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | 7 min | 3.5 min |
| 02-cycle-system | 4 | 17 min | 4.25 min |
| 02.1-e2e-testing | 2 | 8 min | 4 min |
| 03-conflict-system | 5 | 35 min | 7 min |
| 04-character-system | 5 | 29 min | 5.8 min |
| 05-investigation | 6 | 21 min | 3.5 min |

**Recent Trend:**
- Last 5 plans: 05-03 (3min), 05-04 (4min), 05-05 (2min), 05-06 (4min)
- Trend: Integration plan fast due to well-defined component interfaces from prior plans

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Solo Dog (not party) - lonelier, more personal journey
- [Init]: Procedural generation for replayability
- [Init]: Faithful DitV setting for moral weight
- [Init]: Citizen Sleeper-style cycles as proven model
- [01-01]: Tailwind v3 for traditional config (v4 uses CSS-native approach)
- [01-01]: Path alias @/* -> ./src/* for cleaner imports
- [01-02]: GameContext with useReducer pattern for scalable state management
- [01-02]: SVG viewBox 0 0 1000 500 for node map coordinate system
- [01-02]: Amber highlight for current location visual distinction
- [01-02]: Bottom-sliding narrative panel with spring animation
- [02-01]: DieType as union type for type safety
- [02-01]: Die colors: d4=red, d6=amber, d8=green, d10=blue for quick recognition
- [02-01]: ARIA listbox pattern for keyboard-navigable dice pool
- [02-03]: Phase guards return state unchanged on invalid action (silent ignore)
- [02-03]: CONFIRM_ALLOCATIONS requires at least one assigned die
- [02-03]: SELECT_DIE uses toggle behavior (same die deselects)
- [02-04]: AvailableAction type distinct from GameAction reducer union
- [02-04]: CycleView single orchestration component for all phases
- [02-04]: Action panel fixed position (temporary scaffolding, refine later)
- [02.1-01]: Chromium-only Playwright project (add browsers later if needed)
- [02.1-01]: data-testid attributes over CSS selectors for E2E stability
- [02.1-01]: webServer config auto-starts Vite dev server for tests
- [02.1-02]: Step definitions as helper functions (not cucumber-style) for flexibility
- [02.1-02]: data-testid includes semantic data attributes (data-die-type, data-action-id)
- [03-01]: Discriminated union for ConflictState prevents invalid state combinations at compile time
- [03-01]: Turn guards (PLAYER_RAISE/NPC_SEE etc) enforce valid action order in reducer
- [03-01]: Silent fail pattern returns state unchanged on invalid actions (consistent with Phase 2)
- [03-01]: CSS variables on document.body for global atmosphere theming
- [03-02]: Multi-select dice with toggle behavior for raise/see actions
- [03-02]: Internal monologues hand-written per escalation level (not generated)
- [03-02]: 1.5 second delay before GUNPLAY escalation confirm enabled
- [03-02]: NPC AI: random dice for raise, greedy algorithm for see
- [03-02]: See types: Reversed the Blow (1 die), Blocked/Dodged (2 dice), Took the Blow (3+ dice)
- [03-03]: Four-phase fallout reveal sequence (GATHERING/ROLLING/CALCULATION/VERDICT)
- [03-03]: Severity penalties: MINOR=-10, SERIOUS=-30, DEADLY=-50, DEATH=0
- [03-03]: characterCondition (0-100) affects dice pool generation
- [03-04]: Relationship penalties: JUST_TALKING=0, PHYSICAL=-5, FIGHTING=-15, GUNPLAY=-30
- [03-04]: Targeted NPCs receive double relationship penalty
- [03-04]: Three marker types based on severity: crossed fists (amber), crossed guns (red), broken trust (dark red)
- [03-04]: NPCMemoryProvider wraps app inside GameProvider
- [03-05]: Deterministic dice pools for E2E tests (fixed values instead of random)
- [03-05]: Promise.race pattern for NPC wait (handles give up vs continue)
- [03-05]: Dev-mode test trigger using import.meta.env.DEV guard
- [04-01]: CharacterDie simpler than game Die (no assignedTo/value - computed during conflict)
- [04-01]: Stat.modifier tracks temporary injury reduction without mutating base dice
- [04-01]: CharacterProvider wraps outermost (character is most fundamental entity)
- [04-01]: Character state starts null until SET_CHARACTER (no character until creation)
- [04-02]: Lucide icons: Lightbulb (Acuity), Hand (Body), Heart (Heart), Cross (Will)
- [04-02]: Condition filter: <50 removes 25% weakest dice, <25 removes 50%
- [04-02]: Point-buy: min 2d6, max 6d6 per stat, total must match background
- [04-02]: generateDicePool backward compatible (falls back without character)
- [04-02]: Pool computed in CycleView, passed via START_CYCLE action payload
- [04-03]: CharacterDie rolled to Die (with value) at invocation time, not pre-rolled
- [04-03]: Unified trait+item panel (single component with section headers)
- [04-03]: TraitAndItemInvocation receives props from ConflictView (testable, decoupled)
- [04-04]: Fallout trait die scales with severity: MINOR=d4, SERIOUS=d6, DEADLY=d8
- [04-04]: FalloutReveal uses useCharacter() directly (not prop-drilled dispatch)
- [04-04]: usedRelationships parallels usedTraits/usedItems one-use-per-conflict pattern
- [04-04]: Relationship dice show all NPCs with relevance sorting (direct first)
- [04-05]: CharacterCreation triggered by button click (not auto-shown) to avoid blocking existing tests
- [04-05]: Dev-mode Add Test Trait button for deterministic trait invocation testing
- [04-05]: CharacterSheet overlay accessible via "View Character Sheet" button in sidebar
- [05-01]: Discovery type defined in investigation.ts, imported by dialogue.ts (single source of truth)
- [05-01]: FatigueClock max=6 (one segment per conversation per cycle)
- [05-01]: SIN_CHAIN_ORDER exported as constant for generation/resolution logic
- [05-01]: InvestigationProvider not wired into App.tsx yet (deferred to 05-05)
- [05-01]: Existing research dialogue.ts fully replaced with plan-specified interface
- [05-02]: AI SDK v6 uses system+prompt (not messages array) and maxOutputTokens (not maxTokens)
- [05-02]: Separate tsconfig.api.json for api/ folder (Vercel serverless convention)
- [05-02]: Template-based inner voice (not LLM-generated) for speed and determinism
- [05-02]: 30% trigger probability for inner voice interjections
- [05-02]: Mock streaming handler for dev mode (no API key required)
- [05-03]: sendMessage handles full exchange flow (SELECT_TOPIC + SELECT_APPROACH + stream + discoveries)
- [05-03]: Discovery markers format: [DISCOVERY: factId|sinId|content] parsed client-side after stream complete
- [05-03]: TypewriterText uses framer-motion cursor blink only (not per-character animation)
- [05-03]: InnerVoice auto-hides after 4 seconds
- [05-03]: CLOSE_DISCOVERY ends conversation after 3+ exchanges
- [05-03]: Prose-style narrative display (not chat bubbles) matching DitV literary tone
- [05-04]: Manual layout positioning for mental map nodes (avoids dagre/force layout for MVP)
- [05-04]: getStraightPath for edges (cleaner for vertical chain + horizontal NPC links)
- [05-04]: Severity color gradient: amber->orange->red->dark-red+glow for sin escalation
- [05-04]: NPC nodes only render when linked sin discovered (no DOM spoilers)
- [05-05]: Inline CSS keyframe for fatigue pulse (avoids Tailwind config extension)
- [05-05]: ConflictTrigger uses forceTriggered prop for dev-mode deterministic testing
- [05-05]: CONFRONT_SIN marks sin resolved directly (DitV: confrontation IS resolution)
- [05-05]: ResolutionSummary renders only when terminal state reached (townResolved or sinEscalatedToMurder)
- [05-06]: Test town uses existing location IDs plus new homestead/well locations
- [05-06]: CycleView dispatches END_CYCLE internally; GameView watches phase transition to REST
- [05-06]: ResolutionSummary self-gates rendering (unconditional mount, internal condition check)
- [05-06]: Conflict completion auto-confronts discovered linked sins for streamlined gameplay

### Pending Todos

None yet.

### Blockers/Concerns

- Node v20+ required for development (resolved - user set as default)

## Session Continuity

Last session: 2026-01-23
Stopped at: Completed 05-06-PLAN.md (Investigation Integration) - Phase 5 plans 1-6 of 7 complete
Resume file: None

## Phase 2 Completion Notes

Phase 2 complete. Core cycle system functional:
- Dice pool with selection and keyboard navigation
- Clock system with auto-advancing threats
- Cycle state machine (WAKE -> ALLOCATE -> RESOLVE -> SUMMARY -> REST)
- Action allocation UI with dice assignment flow

**User feedback:** Action panel positioning (fixed overlay) should evolve to Citizen Sleeper-style contextual display. Noted for future UX refinement - not blocking.

## Phase 2.1 Completion Notes

E2E testing infrastructure complete:
- Playwright with Chromium, webServer auto-start, base fixtures
- BDD feature file (4 Gherkin scenarios), 13 step helpers, 9 E2E tests
- data-testid attributes on all interactive components
- Bug fixed: END_CYCLE was skipping REST phase
- Test fix: Use global actions (Pray for Guidance) that are available from any location

## Phase 3 Progress Notes

Plan 03-01 complete. Conflict foundation in place:
- ConflictState discriminated union (INACTIVE/ACTIVE/RESOLVED)
- conflictReducer with phase and turn guards
- Fallout calculation per DitV rules (7/11/15/19 thresholds)
- useConflictAtmosphere hook for escalation theming

Ready for Plan 03-02 (Conflict UI).

Plan 03-02 complete. Conflict UI functional:
- RaiseControls with multi-select dice validation
- EscalationConfirm with hand-written internal monologues
- EscalationIndicator showing player/NPC escalation levels
- BiddingHistory with see type classification
- ConflictView orchestrator with NPC AI
- All data-testid attributes for E2E testing

## Phase 3 Completion Notes

Phase 3 complete with E2E test coverage. Full conflict system functional:
- Conflict state machine with discriminated unions and turn guards
- Raise/see bidding with DitV rules (reverse, block, take the blow)
- Escalation system with dramatic internal monologues
- Fallout reveal with four-phase animated sequence
- Game state integration (characterCondition affects dice pool)
- APPLY_FALLOUT action applies severity-based penalties
- NPC witness/memory system with conflict history tracking
- ConflictMarker and RelationshipPanel for visual feedback
- Violence has persistent consequences through relationship levels
- E2E tests: 7 BDD scenarios, 15 step helpers, all tests passing
- Total E2E suite: 16 tests (9 cycle + 7 conflict)

Ready for Phase 4 (Character System - stats, traits, inventory).

## Phase 4 Completion Notes

Phase 4 complete with full E2E test coverage. Character system with gameplay loops:
- Character state (stats, traits, items, relationships) with CharacterProvider
- Stat-based dice pool generation with condition modifiers
- CharacterCreation with point-buy allocation and CharacterSheet display
- Trait & item invocation during conflicts (once per conflict each)
- Fallout-to-trait conversion (consequences become permanent character traits)
- Relationship dice provide bonus in relevant conflicts
- Character-gameplay loop closed: stats->pool, traits/items->bonus dice, fallout->new traits, relationships->conflict dice
- E2E tests: 6 BDD scenarios, 16 step helpers, 7 Playwright tests
- Total E2E suite: 23 tests (9 cycle + 7 conflict + 7 character), all passing
- CharacterCreation and CharacterSheet overlays wired into GameView

Ready for Phase 5 (NPC & Town Generation).
