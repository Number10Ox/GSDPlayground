# Requirements: Dogs in the Vineyard CRPG

**Defined:** 2026-01-20
**Core Value:** The player must be able to arrive in a procedurally generated town, discover its moral rot through investigation and NPC interaction, and resolve conflicts using the escalating stakes system — experiencing the weight of judgment that defines Dogs in the Vineyard.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Cycle System

- [x] **CYCLE-01**: Player experiences daily cycle structure (wake → allocate dice → take actions → end day)
- [x] **CYCLE-02**: Player receives dice pool based on character condition
- [x] **CYCLE-03**: Player sees dice values before deciding where to allocate them
- [x] **CYCLE-04**: Clocks advance threats and opportunities over time

### Conflict System

- [x] **CONF-01**: Conflicts have escalation levels (talking → physical → fighting → gunplay)
- [x] **CONF-02**: Conflicts use raise and see bidding mechanic
- [x] **CONF-03**: Conflicts produce fallout based on severity
- [x] **CONF-04**: NPCs remember violence they witnessed

### Investigation

- [ ] **INV-01**: Player can talk to NPCs to learn information
- [ ] **INV-02**: Player discovers how Pride cascaded through sin progression
- [ ] **INV-03**: NPCs have relationships and stakes with each other
- [ ] **INV-04**: Towns have multiple valid resolution paths

### Character

- [ ] **CHAR-01**: Character has stats/traits that affect dice pools
- [ ] **CHAR-02**: Character has inventory (coat, gun, Book of Life, sacred earth)
- [ ] **CHAR-03**: Character gains traits from conflict fallout
- [ ] **CHAR-04**: Character has relationships with NPCs that affect conflicts

### Persistence

- [ ] **SAVE-01**: Player can manually save and load game
- [ ] **SAVE-02**: Game auto-saves each cycle

### Procedural Generation

- [ ] **PROC-01**: Towns generated from DitV sin progression templates
- [ ] **PROC-02**: NPCs generated with relationships and stakes

### UI/Presentation

- [ ] **UI-01**: Text-heavy, minimal visual style (like Citizen Sleeper)
- [ ] **UI-02**: Readable text with appropriate sizing
- [x] **UI-03**: Dice visualization for allocation and conflicts

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Persistence

- **SAVE-03**: Multiple save slots

### Procedural Generation

- **PROC-03**: Infinite town generation (keep traveling indefinitely)

### Meta-progression

- **META-01**: Legacy/meta-progression between runs

### Accessibility

- **ACCESS-01**: Full accessibility features (screen reader support, colorblind modes)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Karma/morality meter | Destroys moral complexity — show consequences, not alignment |
| Voice acting | Expensive, limits iteration, text-focused game |
| Combat mini-game | Conflicts ARE the game, not a separate minigame |
| Mobile native app | Web browser is target platform |
| Multiplayer / party of Dogs | Solo Dog experience |
| Procedural text via LLM | Quality control nightmare, breaks coherence |
| Timed dialogue choices | Accessibility issue, adds stress without depth |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CYCLE-01 | Phase 2 | Complete |
| CYCLE-02 | Phase 2 | Complete |
| CYCLE-03 | Phase 2 | Complete |
| CYCLE-04 | Phase 2 | Complete |
| CONF-01 | Phase 3 | Complete |
| CONF-02 | Phase 3 | Complete |
| CONF-03 | Phase 3 | Complete |
| CONF-04 | Phase 3 | Complete |
| INV-01 | Phase 5 | Pending |
| INV-02 | Phase 5 | Pending |
| INV-03 | Phase 5 | Pending |
| INV-04 | Phase 5 | Pending |
| CHAR-01 | Phase 4 | Pending |
| CHAR-02 | Phase 4 | Pending |
| CHAR-03 | Phase 4 | Pending |
| CHAR-04 | Phase 4 | Pending |
| SAVE-01 | Phase 7 | Pending |
| SAVE-02 | Phase 7 | Pending |
| PROC-01 | Phase 6 | Pending |
| PROC-02 | Phase 6 | Pending |
| UI-01 | Phase 1 | Complete |
| UI-02 | Phase 1 | Complete |
| UI-03 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

---
*Requirements defined: 2026-01-20*
*Last updated: 2026-01-22 after Phase 3 completion*
