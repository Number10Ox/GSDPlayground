# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-20)

**Core value:** The player must be able to arrive in a procedurally generated town, discover its moral rot through investigation and NPC interaction, and resolve conflicts using the escalating stakes system — experiencing the weight of judgment that defines Dogs in the Vineyard.
**Current focus:** Phase 3 - Conflict System

## Current Position

Phase: 3 of 7 (Conflict System)
Plan: 5 of 5 in current phase
Status: Phase complete (with E2E tests)
Last activity: 2026-01-22 — Completed 03-05-PLAN.md (E2E Testing for Conflict)

Progress: [████████░░] 87%

## Performance Metrics

**Velocity:**
- Total plans completed: 14
- Average duration: 4.6 min
- Total execution time: 1.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | 7 min | 3.5 min |
| 02-cycle-system | 4 | 17 min | 4.25 min |
| 02.1-e2e-testing | 2 | 8 min | 4 min |
| 03-conflict-system | 5 | 35 min | 7 min |

**Recent Trend:**
- Last 5 plans: 03-01 (3min), 03-02 (5min), 03-03 (5min), 03-04 (6min), 03-05 (16min)
- Trend: E2E test plan longer due to flakiness debugging

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

### Pending Todos

None yet.

### Blockers/Concerns

- Node v20+ required for development (resolved - user set as default)

## Session Continuity

Last session: 2026-01-22
Stopped at: Completed 03-05-PLAN.md (E2E Testing for Conflict)
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

Ready for Phase 4 (NPC AI and town generation integration).
