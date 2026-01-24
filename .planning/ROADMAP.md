# Roadmap: Dogs in the Vineyard CRPG

## Overview

This roadmap delivers a browser-based CRPG adapting Dogs in the Vineyard. The journey moves from foundational UI and infrastructure through the core cycle/dice system, then builds the signature escalation-based conflict system, character mechanics, investigation/narrative systems, and finally town generation with persistence. By completion, players can arrive in a procedurally generated town, discover its moral rot through investigation and NPC interaction, and resolve conflicts using the escalating stakes system.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - React/Vite/TypeScript setup with minimal text-heavy UI shell
- [x] **Phase 2: Cycle System** - Daily cycle structure with dice pool generation and allocation
- [x] **Phase 2.1: E2E Testing Infrastructure** - Playwright + BDD setup with cycle system tests (INSERTED)
- [x] **Phase 3: Conflict System** - DitV escalation, raise/see mechanics, and fallout
- [x] **Phase 4: Character System** - Stats, traits, inventory, and relationships affecting gameplay
- [x] **Phase 5: Investigation** - NPC dialogue, sin progression discovery, and resolution paths
- [x] **Phase 6: Town Generation** - Sin progression templates and NPC relationship generation
- [x] **Phase 6.1: Core Mechanics Overhaul** - Descent clock, convictions, journey persistence, dialogue rework (INSERTED, RETROSPECTIVE)
- [ ] **Phase 6.2: E2E Test Overhaul** - Audit, fix, and expand E2E tests for Phase 6.1 architectural changes (INSERTED)
- [ ] **Phase 7: Persistence** - Save/load system with manual and automatic saves
- [ ] **Phase 8: AI Town Creation** - Player-driven town generation via Claude API with aspect selection and IndexedDB persistence

## Phase Details

### Phase 1: Foundation
**Goal**: Player can launch the application and see a text-heavy, readable UI shell with interactive node-based town navigation
**Depends on**: Nothing (first phase)
**Requirements**: UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. Application loads in browser without errors
  2. Text is readable at minimum 28px with appropriate line length
  3. UI reflects minimal, atmospheric aesthetic (no cluttered chrome)
  4. Basic navigation between screens works
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Project setup (Vite, React, TypeScript, Tailwind, folder structure)
- [x] 01-02-PLAN.md — Core UI components (node map, narrative panel, character info sidebar)

### Phase 2: Cycle System
**Goal**: Player experiences complete daily cycles with dice allocation decisions
**Depends on**: Phase 1
**Requirements**: CYCLE-01, CYCLE-02, CYCLE-03, CYCLE-04, UI-03
**Success Criteria** (what must be TRUE):
  1. Player wakes to start a new cycle and sees their dice pool
  2. Player sees dice values before deciding where to allocate them
  3. Player can allocate dice to available actions and see results
  4. Clocks visually advance when their conditions are met
  5. Day ends when dice are exhausted or player chooses to rest
**Plans**: 4 plans

Plans:
- [x] 02-01-PLAN.md — Types and dice pool visualization (DitV polyhedral dice, keyboard-accessible pool)
- [x] 02-02-PLAN.md — Clock system (SVG segmented progress clocks for threats/opportunities)
- [x] 02-03-PLAN.md — Cycle state machine (phase transitions, dice selection/assignment actions)
- [x] 02-04-PLAN.md — Actions and integration (action cards, allocation UI, summary screen, full loop)

### Phase 2.1: E2E Testing Infrastructure (INSERTED)
**Goal**: Automated browser tests validate gameplay flows using BDD-style specifications
**Depends on**: Phase 2
**Requirements**: None (infrastructure)
**Success Criteria** (what must be TRUE):
  1. Playwright installed and configured for the project
  2. BDD feature files describe cycle system behavior in Gherkin syntax
  3. `npm run test:e2e` executes browser tests against running dev server
  4. Tests for Phase 2 cycle flow pass (wake, allocate, confirm, summary, next day)
  5. CI-ready configuration (headless mode, proper timeouts)
**Plans**: 2 plans

Plans:
- [x] 02.1-01-PLAN.md — Playwright setup (install, config, npm scripts, CI configuration)
- [x] 02.1-02-PLAN.md — Cycle system E2E tests (BDD feature files, step definitions, full cycle flow)

**Integration Pattern for Future Phases:**
Each phase will include E2E tests as the final plan:
- Phase 3: 03-05-PLAN.md — Conflict system E2E tests
- Phase 4: 04-05-PLAN.md — Character system E2E tests
- Phase 5: 05-07-PLAN.md — Investigation E2E tests
- Phase 6: 06-06-PLAN.md — Town generation E2E tests
- Phase 7: 07-04-PLAN.md — Persistence E2E tests

### Phase 3: Conflict System
**Goal**: Player can engage in escalating conflicts using raise/see mechanics with meaningful fallout
**Depends on**: Phase 2
**Requirements**: CONF-01, CONF-02, CONF-03, CONF-04
**Success Criteria** (what must be TRUE):
  1. Player can enter a conflict at any escalation level (talking, physical, fighting, gunplay)
  2. Player can choose to escalate, adding dice but increasing fallout risk
  3. Player can raise (make a move) and see (counter) using dice bidding
  4. Conflicts produce fallout proportional to highest escalation reached
  5. NPCs remember violent conflicts and this affects future interactions
**Plans**: 5 plans

Plans:
- [x] 03-01-PLAN.md — Conflict types and state machine (discriminated unions, reducer, fallout utils, theming hook)
- [x] 03-02-PLAN.md — Raise/see bidding UI (RaiseControls, EscalationConfirm, EscalationIndicator, BiddingHistory, ConflictView)
- [x] 03-03-PLAN.md — Fallout reveal and game state integration (FalloutReveal animation, ConflictResolution, condition tracking)
- [x] 03-04-PLAN.md — NPC witness/memory system (NPC types, memory context, ConflictMarker, RelationshipPanel)
- [x] 03-05-PLAN.md — Conflict system E2E tests (BDD feature file, step helpers, Playwright specs)

### Phase 4: Character System
**Goal**: Player's Dog has meaningful stats, traits, and inventory that affect gameplay
**Depends on**: Phase 3
**Requirements**: CHAR-01, CHAR-02, CHAR-03, CHAR-04
**Success Criteria** (what must be TRUE):
  1. Character stats and traits visibly affect dice pools
  2. Player can see and use inventory items (coat, gun, Book of Life, sacred earth)
  3. Conflict fallout can add new traits to the character
  4. Relationships with NPCs provide dice in relevant conflicts
**Plans**: 5 plans

Plans:
- [x] 04-01-PLAN.md — Character types, Immer reducer, and context provider (foundation for all character features)
- [x] 04-02-PLAN.md — Stat display with icons, character creation UI, stat-based dice pool generation
- [x] 04-03-PLAN.md — Inventory display, trait list, and mid-conflict trait/item invocation
- [x] 04-04-PLAN.md — Fallout-to-trait conversion and relationship dice in conflicts
- [x] 04-05-PLAN.md — Character system E2E tests (BDD feature file, step helpers, Playwright specs)

### Phase 5: Investigation
**Goal**: Player can investigate NPCs to discover the town's sin progression and find resolution paths
**Depends on**: Phase 4
**Requirements**: INV-01, INV-02, INV-03, INV-04
**Success Criteria** (what must be TRUE):
  1. Player can talk to NPCs and receive information based on relationship
  2. Player can piece together how the root Pride cascaded into current problems
  3. Player can observe NPC relationships and stakes in the town's problems
  4. Player can pursue multiple valid paths to resolve the town's situation
**Plans**: 7 plans

Plans:
- [x] 05-01-PLAN.md — Investigation types, reducer, and context provider (sin progression, discovery, fatigue state)
- [x] 05-02-PLAN.md — LLM integration layer (knowledge gating, prompt templates, serverless API, mock handler)
- [x] 05-03-PLAN.md — Dialogue reducer and UI components (conversation FSM, topic/approach chips, typewriter, inner voice)
- [x] 05-04-PLAN.md — Mental map visualization (React Flow graph with sin chain and NPC nodes)
- [x] 05-05-PLAN.md — Fatigue clock, conflict triggering, and town resolution (cycle economy, escalation, endings)
- [x] 05-06-PLAN.md — Full integration (providers, GameView wiring, test town data)
- [x] 05-07-PLAN.md — Investigation E2E tests (BDD feature, step helpers, Playwright specs with mocked LLM)

### Phase 6: Town Generation
**Goal**: Towns are generated with coherent sin progressions and interconnected NPCs
**Depends on**: Phase 5
**Requirements**: PROC-01, PROC-02
**Success Criteria** (what must be TRUE):
  1. Towns generate with a clear sin progression (Pride through Murder)
  2. NPCs are generated with relationships to each other
  3. Every NPC has stakes in the town's problems
  4. Generated towns are playable from arrival to resolution
**Plans**: 6 plans

Plans:
- [x] 06-01-PLAN.md — Seeded RNG, sin templates, and sin chain generator (foundation for all generation)
- [x] 06-02-PLAN.md — NPC archetypes, relationship patterns, and NPC generator
- [x] 06-03-PLAN.md — Location templates, topic rule generator, and town assembler
- [x] 06-04-PLAN.md — Validation pipeline and generate-validate-retry loop
- [x] 06-05-PLAN.md — Multi-town integration (pre-generated towns, selection UI, App wiring)
- [x] 06-06-PLAN.md — Town generation E2E tests (selection, playability, variety)

### Phase 6.1: Core Mechanics Overhaul (INSERTED, RETROSPECTIVE)
**Goal**: Replace daily cycle with descent clock, add conviction system, implement journey persistence, and rework dialogue/conflict flow
**Depends on**: Phase 6
**Status**: Complete (executed outside GSD framework, documented retrospectively)
**Success Criteria** (verified post-hoc):
  1. Daily cycle system replaced with descent clock (8-segment urgency tracker)
  2. Conviction system: creation, testing, reflection, lifecycle (held→tested→shaken→broken→resolved)
  3. Journey persistence: multi-town arc with conviction carry-over across towns
  4. Dialogue rework: removed approach selection, added player voice options, "Press the Matter" conflict entry
  5. Trust mechanics: ripple effects, trust breaking (permanent cap), relationship memory
  6. Character creation: 6-step wizard (name, background, stats, belongings, initiation, convictions)
  7. Town arrival narrative with rumors and greeter NPC
**Commits**: bb134c3 through f2e30c7 (11 commits, 2026-01-23)

**Key Changes from Earlier Phases:**
- **Phase 2 (Cycle System)**: Daily cycle replaced by descent clock. Deleted: CycleView, DicePool, CycleSummary, ActionCard, ActionList, FatigueClock
- **Phase 5 (Investigation)**: Approach selection removed from dialogue. ApproachChips deleted. ConflictTrigger replaced by "Press the Matter" flow. DialogueView substantially rewritten.
- **Phase 4 (Character)**: CharacterCreation expanded from point-buy to full 6-step wizard with belongings table, initiation scenes, and conviction selection

**New Systems Introduced:**
- Conviction system (`types/conviction.ts`, `ConvictionPicker`, `ConvictionReflection`, `convictionSeeds`, `convictionTesting`)
- Journey system (`types/journey.ts`, `journeyReducer`, `useJourney`, `JourneyEnd`, `JourneyProgress`)
- Descent clock (`types/descent.ts`, `utils/descentClock.ts`, `DescentThreshold`)
- Authority actions (`types/actions.ts`, `actionAvailability`, `authorityActions`, `ActionMenu`)
- Dialogue options (`DialogueOptionCard`, player voice generation, inner voice stat-matching)
- Town arrival (`TownArrival` component with narrative and rumors)
- Judgment (`JudgmentPanel` for sin resolution)
- Conflict narration (`conflictNarration`, `conflictDice` utilities)

### Phase 6.2: E2E Test Overhaul (INSERTED)
**Goal**: Audit existing E2E tests against Phase 6.1 architectural changes, fix/remove broken tests referencing deleted components, add comprehensive coverage for new systems
**Depends on**: Phase 6.1
**Success Criteria** (what must be TRUE):
  1. All existing E2E tests pass against the current codebase (fix or remove tests referencing deleted components)
  2. Character creation wizard has E2E coverage (6-step flow including convictions)
  3. Descent clock mechanics have E2E coverage (advancement, threshold events)
  4. Dialogue rework has E2E coverage (player voice options, "Press the Matter" conflict entry)
  5. Journey flow has E2E coverage (town completion, conviction reflection, riding on, multi-town progression)
  6. Trust mechanics have E2E coverage (trust changes, trust breaking edge cases)
  7. Edge cases fixed in commit f2e30c7 are covered by regression tests
**Plans**: 5 plans

Plans:
- [ ] 06.2-01-PLAN.md — Fix existing test helpers (conviction step, approach overlay) to pass all 34 tests
- [ ] 06.2-02-PLAN.md — Character creation wizard + dialogue rework E2E coverage
- [ ] 06.2-03-PLAN.md — Journey flow E2E (judgment, reflection, multi-town progression)
- [ ] 06.2-04-PLAN.md — Trust mechanics E2E (data-testid additions, trust changes, breaking)
- [ ] 06.2-05-PLAN.md — Regression tests for f2e30c7 edge cases + full suite validation

### Phase 7: Persistence
**Goal**: Player can save progress and resume later
**Depends on**: Phase 6.2
**Requirements**: SAVE-01, SAVE-02
**Note**: Journey persistence (in-memory state across towns via useJourney/journeyReducer) was built in Phase 6.1. This phase adds **browser persistence** — serializing that state to survive page reloads.
**Success Criteria** (what must be TRUE):
  1. Player can manually save game at any point
  2. Player can load a previous save and continue from that state
  3. Game automatically saves at key transition points (town complete, conviction reflection done)
  4. Saves persist across browser sessions (IndexedDB or localStorage)
**Plans**: TBD

Plans:
- [ ] 07-01: Save state serialization (JourneyState + per-town GameState + InvestigationState)
- [ ] 07-02: Manual save/load UI
- [ ] 07-03: Autosave at journey phase transitions
- [ ] 07-04: Persistence E2E tests

### Phase 8: AI Town Creation
**Goal**: Players can create custom towns by selecting thematic aspects, which are used to generate complete playable towns via Claude API, persisted across sessions via IndexedDB
**Depends on**: Phase 6.1 (town generation and game systems must be stable; independent of Phase 7 save/load)
**Success Criteria** (what must be TRUE):
  1. Player can select town aspects from category tables (root sin, town character, central conflict, key figures)
  2. Player can add custom entries to any category table
  3. Selected aspects are sent to Claude API which generates a complete, valid TownData JSON
  4. Generated towns pass the existing playability validator
  5. Custom towns are persisted to IndexedDB and survive page reloads
  6. Custom towns appear alongside built-in towns on the TownSelection screen
  7. Generated towns are fully playable (dialogue, investigation, conflict systems all function)
**Plans**: TBD

Plans:
- [ ] TBD (run /gsd:plan-phase 8 to break down)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 2.1 -> 3 -> 4 -> 5 -> 6 -> 6.1 -> 6.2 -> 7 -> 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-01-21 |
| 2. Cycle System | 4/4 | Complete (superseded by 6.1) | 2026-01-22 |
| 2.1 E2E Testing | 2/2 | Complete | 2026-01-22 |
| 3. Conflict System | 5/5 | Complete | 2026-01-22 |
| 4. Character System | 5/5 | Complete (expanded by 6.1) | 2026-01-22 |
| 5. Investigation | 7/7 | Complete (reworked by 6.1) | 2026-01-22 |
| 6. Town Generation | 6/6 | Complete | 2026-01-22 |
| 6.1 Core Mechanics Overhaul | n/a | Complete (retrospective) | 2026-01-23 |
| 6.2 E2E Test Overhaul | 0/5 | Not started | - |
| 7. Persistence | 0/4 | Not started | - |
| 8. AI Town Creation | 0/? | Not started | - |

**Total:** 32+ plans complete (Phase 6.1 unplanned, executed ad-hoc)

---
*Roadmap created: 2026-01-20*
*Phase 1 planned: 2026-01-21*
*Phase 2 planned: 2026-01-21*
*Phase 3 planned: 2026-01-22*
*Phase 4 planned: 2026-01-22*
*Phase 5 planned: 2026-01-22*
*Phase 6 planned: 2026-01-22*
*Phase 6.2 planned: 2026-01-24*
*Depth: comprehensive*
*Coverage: 23/23 v1 requirements mapped*
