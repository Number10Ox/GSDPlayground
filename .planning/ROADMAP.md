# Roadmap: Dogs in the Vineyard CRPG

## Overview

This roadmap delivers a browser-based CRPG adapting Dogs in the Vineyard. The journey moves from foundational UI and infrastructure through the core cycle/dice system, then builds the signature escalation-based conflict system, character mechanics, investigation/narrative systems, and finally town generation with persistence. By completion, players can arrive in a procedurally generated town, discover its moral rot through investigation and NPC interaction, and resolve conflicts using the escalating stakes system.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation** - React/Vite/TypeScript setup with minimal text-heavy UI shell
- [ ] **Phase 2: Cycle System** - Daily cycle structure with dice pool generation and allocation
- [ ] **Phase 3: Conflict System** - DitV escalation, raise/see mechanics, and fallout
- [ ] **Phase 4: Character System** - Stats, traits, inventory, and relationships affecting gameplay
- [ ] **Phase 5: Investigation** - NPC dialogue, sin progression discovery, and resolution paths
- [ ] **Phase 6: Town Generation** - Sin progression templates and NPC relationship generation
- [ ] **Phase 7: Persistence** - Save/load system with manual and automatic saves

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
- [ ] 01-01-PLAN.md — Project setup (Vite, React, TypeScript, Tailwind, folder structure)
- [ ] 01-02-PLAN.md — Core UI components (node map, narrative panel, character info sidebar)

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
**Plans**: TBD

Plans:
- [ ] 02-01: Dice pool generation and visualization
- [ ] 02-02: Cycle state machine (wake, allocate, resolve, end day)
- [ ] 02-03: Clock system with visual progress indicators
- [ ] 02-04: Action resolution using allocated dice

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
**Plans**: TBD

Plans:
- [ ] 03-01: Conflict state machine (escalation levels, transitions)
- [ ] 03-02: Raise/see bidding mechanics
- [ ] 03-03: Fallout calculation and application
- [ ] 03-04: NPC witness/memory system

### Phase 4: Character System
**Goal**: Player's Dog has meaningful stats, traits, and inventory that affect gameplay
**Depends on**: Phase 3
**Requirements**: CHAR-01, CHAR-02, CHAR-03, CHAR-04
**Success Criteria** (what must be TRUE):
  1. Character stats and traits visibly affect dice pools
  2. Player can see and use inventory items (coat, gun, Book of Life, sacred earth)
  3. Conflict fallout can add new traits to the character
  4. Relationships with NPCs provide dice in relevant conflicts
**Plans**: TBD

Plans:
- [ ] 04-01: Character stats and trait system
- [ ] 04-02: Inventory system with usable items
- [ ] 04-03: Fallout-to-trait conversion
- [ ] 04-04: Relationship tracking and conflict dice bonuses

### Phase 5: Investigation
**Goal**: Player can investigate NPCs to discover the town's sin progression and find resolution paths
**Depends on**: Phase 4
**Requirements**: INV-01, INV-02, INV-03, INV-04
**Success Criteria** (what must be TRUE):
  1. Player can talk to NPCs and receive information based on relationship
  2. Player can piece together how the root Pride cascaded into current problems
  3. Player can observe NPC relationships and stakes in the town's problems
  4. Player can pursue multiple valid paths to resolve the town's situation
**Plans**: TBD

Plans:
- [ ] 05-01: NPC dialogue system with ink integration
- [ ] 05-02: Information revelation mechanics (what NPCs know and share)
- [ ] 05-03: Sin progression discovery tracking
- [ ] 05-04: Resolution path branching

### Phase 6: Town Generation
**Goal**: Towns are generated with coherent sin progressions and interconnected NPCs
**Depends on**: Phase 5
**Requirements**: PROC-01, PROC-02
**Success Criteria** (what must be TRUE):
  1. Towns generate with a clear sin progression (Pride through Murder)
  2. NPCs are generated with relationships to each other
  3. Every NPC has stakes in the town's problems
  4. Generated towns are playable from arrival to resolution
**Plans**: TBD

Plans:
- [ ] 06-01: Hand-crafted reference town (proof of concept)
- [ ] 06-02: Sin progression template system
- [ ] 06-03: NPC generation with relationship graphs
- [ ] 06-04: Town assembly and validation

### Phase 7: Persistence
**Goal**: Player can save progress and resume later
**Depends on**: Phase 6
**Requirements**: SAVE-01, SAVE-02
**Success Criteria** (what must be TRUE):
  1. Player can manually save game at any point
  2. Player can load a previous save and continue from that state
  3. Game automatically saves at the end of each cycle
  4. Saves persist across browser sessions
**Plans**: TBD

Plans:
- [ ] 07-01: Save state serialization
- [ ] 07-02: Manual save/load UI
- [ ] 07-03: Autosave system with cycle hooks

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Planned | - |
| 2. Cycle System | 0/4 | Not started | - |
| 3. Conflict System | 0/4 | Not started | - |
| 4. Character System | 0/4 | Not started | - |
| 5. Investigation | 0/4 | Not started | - |
| 6. Town Generation | 0/4 | Not started | - |
| 7. Persistence | 0/3 | Not started | - |

**Total:** 0/25 plans complete

---
*Roadmap created: 2026-01-20*
*Phase 1 planned: 2026-01-21*
*Depth: comprehensive*
*Coverage: 23/23 v1 requirements mapped*
