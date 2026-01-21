# Research Summary

**Project:** Dogs in the Vineyard Web CRPG
**Domain:** Narrative CRPG / Tabletop adaptation / Procedural storytelling
**Researched:** 2026-01-20
**Confidence:** HIGH

## Executive Summary

This project adapts the tabletop RPG "Dogs in the Vineyard" into a browser-based CRPG combining Citizen Sleeper's cycle-based dice allocation with DitV's unique escalation conflict system. The recommended approach centers on three pillars: (1) ink for narrative scripting (battle-tested in 80 Days, Citizen Sleeper), (2) Preact + Signals for a lightweight reactive UI (~3KB vs React's 40KB), and (3) XState for the complex conflict state machine that handles escalation from talking through gunfighting. This is a text-heavy narrative game, not a graphical one - avoid game engines like Phaser entirely.

The critical insight from research: **the escalation system IS the game**. At the tabletop, escalation tension comes from social stakes (choosing violence in front of friends). In digital form, this must be replaced with persistent world consequences (NPCs remember, the town talks) and meaningful fallout (psychological, spiritual, relational - not just hit points). If players can escalate to guns without meaningful cost, the core design fails.

The highest risks are: (1) procedural towns feeling random rather than coherent - solve by generating relationships first, then characters; (2) moral choices collapsing into obvious good/evil - absolutely no karma meters, show consequences instead; (3) failure spirals in resource management - implement expectation adjustment like RimWorld. The game lives or dies on whether moral judgments feel genuinely difficult.

---

## Stack

**Core technologies:**
- **Preact + Signals**: Lightweight reactive UI (~3KB) with near-vanilla-JS text update performance - essential for text-heavy game
- **ink/inkjs**: Narrative scripting language powering 80 Days, Citizen Sleeper - "totally essential" per Citizen Sleeper creator
- **XState v5**: Formal state machines for conflict escalation, clock systems, quest progression - "80% of the way there" for RPG dev
- **Zustand**: Simple global state for UI, settings - 14.4M weekly downloads, minimal boilerplate
- **Dexie.js**: IndexedDB wrapper for save games - 5MB localStorage limit insufficient for complex saves
- **Vite**: Build tooling with native ES modules, near-instant HMR

**Avoid:** React (too heavy), Phaser/Excalibur (overkill for text), localStorage (too small), custom narrative systems (ink is proven).

---

## Table Stakes

Features users expect - missing these makes the product feel broken:

- **Dice/randomness visualization** - Players must see the roll; show dice at cycle start like Citizen Sleeper
- **Clear success/failure feedback** - Show what happened and why; make failures interesting not punishing
- **Meaningful choices with consequences** - Core genre expectation; consequences must feel proportional and logical
- **Save system with manual + autosave** - Web games need robust persistence; include save-on-exit
- **Readable text with size customization** - 28px minimum, high contrast, 50-80 char line length
- **Dialogue history log** - Players miss text and need to review; critical for narrative games
- **Keyboard navigation** - Accessibility plus power users

---

## Differentiators

What makes this special - not expected but sets it apart:

- **Escalation conflict system** - DitV's defining mechanic: talking -> physical -> fighting -> guns. Each level adds dice AND fallout risk
- **Raise/See bidding** - Poker-style dice allocation in narrative context; seeing with 3+ dice should feel dangerous
- **Fallout as consequence** - Wounds depend on escalation level; gunfights kill, arguments scar
- **Moral judgment as gameplay** - Players ARE the law with no right answer; player decides punishment
- **Sin progression towns** - Pride -> Injustice -> Sin -> Demonic Influence; each town at different stage
- **Progress clocks** (BitD-style) - Visual tracking of concurrent storylines; fill = thing happens
- **Failure as interesting narrative** - Disco Elysium's innovation; failed checks unlock unique content, never punish-only

**Defer to v2+:** Procedural town generation, internal monologue voices, legacy/meta-progression, extensive NPC portraits.

---

## Architecture

**Pattern:** Entity-Component-System for game objects + state machines for flow control + pub/sub event bus for loose coupling.

**Major components (build order):**

1. **Event Bus** - Pub/sub for all system communication; build first, everything depends on it
2. **Game State Manager** - Zustand store for central state, save/load, game phases
3. **Dice Pool System** - Pool generation per cycle, allocation to actions, rolling
4. **Clock System** - Progress clocks with ticking, linking (A fills -> B starts)
5. **Conflict System** - XState machine for escalation, raise/see, fallout calculation
6. **NPC System** - Entities, relationship graph, agendas, opinion tracking
7. **Narrative Engine** - ink integration, dialogue trees, story beat triggers
8. **World Generator** - Town creation with sin progression (build after working manual version)

**Key boundary:** UI dispatches actions, game systems calculate, UI re-renders. Never put game logic in React components.

---

## Critical Pitfalls

1. **Escalation without social stakes** - Tabletop escalation tension comes from choosing violence in front of friends. **Prevention:** Persistent world consequences (witnesses, NPC memory, town gossip) plus internal character consequences (spiritual/psychological fallout, not just HP).

2. **Illusion of choice / false dichotomy** - If players can identify the "right answer," the game fails. **Prevention:** Absolutely no karma meters. Competing goods not good-vs-evil. Delayed consequences. Situational ethics where context matters more than principle.

3. **Procedural towns feeling random** - Towns that feel like random assemblages instead of communities. **Prevention:** Generate relationships first, then characters. Use constraint satisfaction (every sin has a human source, every sinner relates to victim). Knowledge propagation through gossip chains.

4. **Unrecoverable failure spirals** - Early mistakes compounding until players feel "doomed." **Prevention:** Expectation adjustment (RimWorld model), rubber-banding, explicit recovery mechanics, condition zero is not game over.

5. **RNG undermining player agency** - Smart decisions foiled by bad luck feels like computer cheating. **Prevention:** Visible resources before commitment (Citizen Sleeper model), dice inform situations rather than gate success, player chooses how much to stake.

---

## Roadmap Implications

Based on research, suggested phase structure:

### Phase 1: Core Infrastructure
**Rationale:** Everything else depends on state management, event flow, and basic UI shell. Cannot test game logic without these.
**Delivers:** Preact app structure, Zustand store, event bus, basic routing
**Addresses:** Technical foundation for all features
**Avoids:** Coupling UI to game logic early

### Phase 2: Cycle and Dice System
**Rationale:** Dice allocation is the core gameplay loop that everything else builds on. Must work before conflict system.
**Delivers:** Cycle-based turns, dice pool generation based on condition, dice allocation UI, action resolution
**Uses:** Preact + Signals for reactive dice display, Zustand for pool state
**Avoids:** RNG frustration via visible resources before commitment

### Phase 3: Conflict and Escalation
**Rationale:** The most complex system and core differentiator. Build on working dice system. Needs extensive prototyping.
**Delivers:** Escalation levels, raise/see mechanics, fallout calculation, conflict resolution
**Implements:** XState conflict state machine
**Avoids:** Loss of tabletop tension via world consequences and witness mechanics

### Phase 4: Narrative Engine
**Rationale:** Needs NPCs, conflicts, clocks all working before content delivery layer.
**Delivers:** ink integration, dialogue trees, story beat triggers, investigation/revelation system
**Uses:** inkjs runtime, conditional content based on game state
**Avoids:** Exposition dumping via investigation-driven discovery

### Phase 5: World and NPCs
**Rationale:** Build one hand-crafted town first to prove the concept before procedural generation.
**Delivers:** Town data model, NPC entities, relationship graph, sin progression tracking
**Avoids:** Incoherent procedural towns by establishing working manual version first

### Phase 6: Save/Load and Polish
**Rationale:** Serialization needs all systems stable. Polish after core loop works.
**Delivers:** Dexie persistence, autosave, settings menu, accessibility options, tutorial
**Avoids:** Save file corruption via schema versioning from the start

### Phase Ordering Rationale

- **Cycle before conflict:** Conflict uses dice from the cycle system
- **Conflict before narrative:** Narrative triggers conflicts and responds to outcomes
- **Manual town before procedural:** Procedural generation builds on working manual version
- **One complete vertical slice:** By Phase 5 end, one full town playable end-to-end

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 3 (Conflict):** DitV raise/see translation to solo digital is novel territory; needs prototyping and iteration
- **Phase 5 (World):** Balance of procedural vs authored town content needs testing

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Infrastructure):** Well-documented Preact/Vite/Zustand patterns
- **Phase 2 (Cycle/Dice):** Citizen Sleeper provides clear model
- **Phase 6 (Save/Polish):** Standard web persistence patterns

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified via official docs and npm; Citizen Sleeper case study validates approach |
| Features | HIGH | Multiple reference games analyzed; clear table stakes vs differentiators |
| Architecture | MEDIUM | Patterns well-established; specific DitV digital adaptation is novel |
| Pitfalls | HIGH | Extensive sources including academic research on procedural narrative |

**Overall confidence:** HIGH

### Gaps to Address

- **Raise/See digital translation:** How exactly the bidding mechanic works in solo play needs prototyping - no existing model
- **Moral ambiguity in deterministic system:** Core design challenge; will need iteration to ensure choices feel genuinely difficult
- **Oracle systems for GM replacement:** Ironsworn provides a model but DitV has different needs; may need custom solution
- **Cycle pressure vs investigation freedom:** Balance needs playtesting; can't be designed purely theoretically

---

## Sources

### Primary (HIGH confidence)
- [inkle's ink documentation](https://www.inklestudios.com/ink/) - Narrative scripting
- [inkjs GitHub](https://github.com/y-lohse/inkjs) v2.3.2 - JavaScript runtime
- [XState documentation](https://stately.ai/docs/xstate) v5.25.0 - State machines
- [Zustand GitHub](https://github.com/pmndrs/zustand) v5.0.10 - State management
- [Dexie.js documentation](https://dexie.org/) v4.2.1 - IndexedDB wrapper
- [Citizen Sleeper case study](https://howtomakeanrpg.com/r/a/case-study-citizen-sleeper.html) - ink testimonial, dice design

### Secondary (MEDIUM confidence)
- [Blades in the Dark - Progress Clocks](https://bladesinthedark.com/progress-clocks) - Clock design
- [DitV Raise/See Mechanic Analysis](https://steemit.com/tabletop-rpg/@danmaruschak/the-brilliant-raise-see-mechanic-in-the-tabletop-rpg-dogs-in-the-vineyard) - Escalation design
- [Disco Elysium RPG System Analysis](https://www.gabrielchauri.com/disco-elysium-rpg-system-analysis/) - Failure as narrative
- [Ironsworn RPG](https://tomkinpress.com/pages/ironsworn) - Solo oracle systems

### Tertiary (needs validation)
- Balance of procedural vs authored content - theoretical, needs prototyping
- Moral ambiguity preservation in deterministic digital system - core design challenge

---
*Research completed: 2026-01-20*
*Ready for roadmap: yes*
