# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-20)

**Core value:** The player must be able to arrive in a procedurally generated town, discover its moral rot through investigation and NPC interaction, and resolve conflicts using the escalating stakes system — experiencing the weight of judgment that defines Dogs in the Vineyard.
**Current focus:** Phase 2.1 - E2E Testing Infrastructure

## Current Position

Phase: 2.1 of 7 (E2E Testing Infrastructure)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-01-21 — Completed 02.1-01-PLAN.md (Playwright Setup)

Progress: [██████░░░░] 50%

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: 4 min
- Total execution time: 0.5 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | 7 min | 3.5 min |
| 02-cycle-system | 4 | 17 min | 4.25 min |
| 02.1-e2e-testing | 1 | 4 min | 4 min |

**Recent Trend:**
- Last 5 plans: 02-01 (4min), 02-02 (3min), 02-03 (2min), 02-04 (8min), 02.1-01 (4min)
- Trend: Stable

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

### Pending Todos

None yet.

### Blockers/Concerns

- Node v20+ required for development (Vite 7.3 requirement)
- Node v18.19+ required for Playwright ESM (current: 18.16.1)

## Session Continuity

Last session: 2026-01-21
Stopped at: Completed 02.1-01-PLAN.md (Playwright Setup)
Resume file: None

## Phase 2 Completion Notes

Phase 2 complete. Core cycle system functional:
- Dice pool with selection and keyboard navigation
- Clock system with auto-advancing threats
- Cycle state machine (WAKE -> ALLOCATE -> RESOLVE -> SUMMARY -> REST)
- Action allocation UI with dice assignment flow

**User feedback:** Action panel positioning (fixed overlay) should evolve to Citizen Sleeper-style contextual display. Noted for future UX refinement - not blocking.
