# Architecture Research: Dogs in the Vineyard CRPG

**Domain:** Web-based narrative CRPG with procedural generation
**Researched:** 2026-01-20
**Confidence:** MEDIUM (patterns well-established, specific DitV digital adaptation is novel)

## Executive Summary

This architecture is designed for a text-heavy narrative CRPG combining:
- Procedural town generation (DitV sin progression)
- NPC relationship simulation
- Dice pool allocation per cycle (Citizen Sleeper-style)
- Escalation-based conflict resolution (DitV)
- Progress clocks for advancing threats (Blades in the Dark)
- Persistent game state with save/load

The recommended architecture uses an **Entity-Component-System (ECS) pattern** for game objects combined with a **state machine** for game flow control, connected via a **pub/sub event bus** for loose coupling. This follows established patterns for roguelikes and narrative games while accommodating the unique conflict and escalation mechanics of Dogs in the Vineyard.

---

## Core Components

### 1. Game State Manager
**Responsibility:** Central authority for all game state, handles save/load, manages game phases.

| Owns | Does Not Own |
|------|--------------|
| Current game phase (exploration, conflict, resolution) | UI state |
| Save/load serialization | Rendering decisions |
| Game clock (cycle tracking) | Input handling |
| Undo/redo stack (optional) | Animation timing |

**Key interfaces:**
- `getState(): GameState`
- `dispatch(action: GameAction): void`
- `subscribe(listener): unsubscribe`
- `save(): SerializedState`
- `load(state: SerializedState): void`

### 2. World Generator
**Responsibility:** Procedural creation of towns following DitV sin progression.

| Owns | Does Not Own |
|------|--------------|
| Town template generation | NPC behavior |
| Sin progression seeding (Pride -> Murder) | Real-time NPC simulation |
| Location generation | Player interactions |
| Initial NPC placement | Conflict resolution |

**Key interfaces:**
- `generateTown(seed: number, sinLevel: SinLevel): Town`
- `generateNPCs(town: Town): NPC[]`
- `generateRelationships(npcs: NPC[]): RelationshipGraph`

### 3. NPC System
**Responsibility:** NPC state, relationships, agendas, and behaviors.

| Owns | Does Not Own |
|------|--------------|
| NPC attributes and stats | World generation |
| Relationship graph | Conflict dice mechanics |
| Hidden agendas | UI presentation |
| Opinion/trust tracking | Player character |

**Key interfaces:**
- `getNPC(id: NPCId): NPC`
- `getRelationship(npc1: NPCId, npc2: NPCId): Relationship`
- `updateOpinion(npc: NPCId, target: NPCId | PlayerId, delta: number): void`
- `getAgenda(npc: NPCId): Agenda`

### 4. Dice Pool System
**Responsibility:** Dice allocation, rolling, and resource management per cycle.

| Owns | Does Not Own |
|------|--------------|
| Dice pool generation | What actions exist |
| Dice allocation to actions | Action resolution |
| Roll mechanics | Conflict escalation |
| Pool refresh per cycle | Narrative outcomes |

**Key interfaces:**
- `generatePool(condition: PlayerCondition): Dice[]`
- `allocateDie(die: Die, action: Action): AllocationResult`
- `rollDie(die: Die): RollResult`
- `refreshPool(): void`

### 5. Conflict System
**Responsibility:** DitV-style escalation conflict resolution.

| Owns | Does Not Own |
|------|--------------|
| Conflict initiation | World state changes |
| Escalation levels (talking -> physical -> fighting -> guns) | NPC generation |
| Raise/See mechanics | Dice pool management |
| Fallout calculation | Save/load |
| Stakes tracking | |

**Key interfaces:**
- `initiateConflict(participants: Participant[], stakes: Stakes): Conflict`
- `raise(conflict: Conflict, participant: Participant, dice: Dice[]): Raise`
- `see(conflict: Conflict, participant: Participant, dice: Dice[]): SeeResult`
- `escalate(conflict: Conflict, participant: Participant, level: EscalationLevel): void`
- `calculateFallout(conflict: Conflict): Fallout`
- `resolveConflict(conflict: Conflict): Resolution`

### 6. Clock System
**Responsibility:** Progress clocks for threats, timers, and narrative progression.

| Owns | Does Not Own |
|------|--------------|
| Clock creation and tracking | What triggers ticks |
| Tick advancement | Resolution of filled clocks |
| Clock linking (A fills -> B starts) | UI rendering of clocks |
| Clock visibility rules | |

**Key interfaces:**
- `createClock(name: string, segments: 4 | 6 | 8, type: ClockType): Clock`
- `tick(clock: Clock, segments?: number): void`
- `isFilled(clock: Clock): boolean`
- `linkClocks(trigger: Clock, target: Clock): void`

### 7. Event Bus
**Responsibility:** Pub/sub communication between systems.

| Owns | Does Not Own |
|------|--------------|
| Event routing | Event generation |
| Subscription management | Event handling logic |
| Event history (for debugging) | Game state |

**Key interfaces:**
- `publish(event: GameEvent): void`
- `subscribe(eventType: string, handler: EventHandler): Unsubscribe`
- `subscribeAll(handler: EventHandler): Unsubscribe`

### 8. Narrative Engine
**Responsibility:** Dialogue, story beats, and narrative content delivery.

| Owns | Does Not Own |
|------|--------------|
| Dialogue trees | Conflict mechanics |
| Story beat triggering | NPC state |
| Conditional content | Dice rolls |
| Investigation revelations | |

**Key interfaces:**
- `getDialogue(npc: NPCId, context: DialogueContext): DialogueNode`
- `checkTriggers(state: GameState): StoryBeat[]`
- `revealInformation(player: Player, info: Information): void`

### 9. UI Layer
**Responsibility:** React components for rendering and input handling.

| Owns | Does Not Own |
|------|--------------|
| Component rendering | Game logic |
| User input capture | State management |
| Animation/transitions | Data persistence |
| Accessibility | |

---

## Component Boundaries

### Clear Ownership Rules

```
World Generator
    |
    v creates
+-------------------+
|      Town         |
|  - Locations      |
|  - Initial NPCs   |
|  - Sin Level      |
+-------------------+
         |
         v populates
+-------------------+
|    NPC System     |
|  - NPC entities   |
|  - Relationships  |
|  - Agendas        |
+-------------------+
         |
         v informs
+-------------------+    +-------------------+
| Narrative Engine  |<-->|   Clock System    |
|  - Dialogues      |    |  - Threat clocks  |
|  - Story beats    |    |  - Timer clocks   |
+-------------------+    +-------------------+
         |                        |
         v triggers               v triggers
+-------------------+    +-------------------+
|  Conflict System  |<-->|  Dice Pool System |
|  - Escalation     |    |  - Allocation     |
|  - Raise/See      |    |  - Rolling        |
|  - Fallout        |    |  - Refresh        |
+-------------------+    +-------------------+
         |
         v modifies
+-------------------+
| Game State Manager|
|  - Save/Load      |
|  - Phase control  |
|  - History        |
+-------------------+
         |
         v notifies
+-------------------+
|    Event Bus      | <-- All systems publish/subscribe here
+-------------------+
         |
         v updates
+-------------------+
|     UI Layer      |
|  - React comps    |
|  - Input handling |
+-------------------+
```

### Interface Contracts

**Between World Generator and NPC System:**
```typescript
interface GeneratedTown {
  id: TownId;
  name: string;
  sinLevel: SinLevel;
  locations: Location[];
  npcs: NPCTemplate[];  // Templates, not full NPCs
  relationships: RelationshipSeed[];
}
```

**Between NPC System and Conflict System:**
```typescript
interface ConflictParticipant {
  id: NPCId | PlayerId;
  stats: Stats;  // Body, Acuity, Heart, Will
  traits: Trait[];
  relationships: Relationship[];  // With other participants
}
```

**Between Dice Pool and Conflict System:**
```typescript
interface DiceForConflict {
  available: Die[];
  allocated: Map<EscalationLevel, Die[]>;
  rolled: RolledDie[];
}
```

---

## Data Flow

### Exploration Phase Flow

```
User Input (click location)
    |
    v
UI Layer: dispatch(MOVE_TO_LOCATION, locationId)
    |
    v
Game State Manager: validate move, update player location
    |
    v
Event Bus: publish({ type: 'PLAYER_MOVED', location })
    |
    +---> NPC System: update NPC awareness
    |
    +---> Clock System: check time-based triggers
    |
    +---> Narrative Engine: check story beat triggers
    |
    v
UI Layer: re-render with new location, NPCs present, available actions
```

### Conflict Initiation Flow

```
User Input (initiate conflict with NPC)
    |
    v
UI Layer: dispatch(INITIATE_CONFLICT, { target, stakes })
    |
    v
Game State Manager: transition to CONFLICT phase
    |
    v
Conflict System: create Conflict instance
    |
    v
Dice Pool System: allocate starting dice based on approach
    |
    v
Event Bus: publish({ type: 'CONFLICT_STARTED', conflict })
    |
    v
UI Layer: render conflict interface
```

### Escalation Flow

```
User Input (escalate to fighting)
    |
    v
UI Layer: dispatch(ESCALATE, { level: 'fighting' })
    |
    v
Conflict System: validate escalation, update conflict state
    |
    v
Dice Pool System: add new dice (Body + Will)
    |
    v
Event Bus: publish({ type: 'ESCALATED', level, newDice })
    |
    +---> NPC System: update NPC opinions (violence used)
    |
    +---> Clock System: tick danger clocks
    |
    v
UI Layer: render new dice, update conflict UI
```

### Cycle End Flow

```
User Input (end cycle) OR no dice remaining
    |
    v
Game State Manager: increment cycle counter
    |
    v
Dice Pool System: refresh dice pool based on condition
    |
    v
Clock System: advance all time-based clocks
    |
    v
NPC System: advance NPC agendas
    |
    v
Event Bus: publish({ type: 'CYCLE_ENDED', cycle })
    |
    +---> Narrative Engine: check for triggered events
    |
    +---> World Generator: check for world changes (sin progression)
    |
    v
UI Layer: render new cycle, updated clocks, dice pool
```

### Save/Load Flow

```
Save:
Game State Manager
    |
    +---> Serialize: NPC System state
    +---> Serialize: Clock System state
    +---> Serialize: World state
    +---> Serialize: Player state
    +---> Serialize: Active conflicts (if any)
    |
    v
JSON.stringify() --> LocalStorage or File

Load:
LocalStorage or File
    |
    v
JSON.parse() --> Validate schema version
    |
    v
Game State Manager
    |
    +---> Hydrate: NPC System
    +---> Hydrate: Clock System
    +---> Hydrate: World state
    +---> Hydrate: Player state
    +---> Hydrate: Active conflicts
    |
    v
Event Bus: publish({ type: 'GAME_LOADED' })
    |
    v
UI Layer: re-render entire game
```

---

## Suggested Build Order

Based on component dependencies, build in this order:

### Phase 1: Core Infrastructure
**Build first - everything depends on these.**

1. **Event Bus** - Simple pub/sub, all other systems need this
2. **Game State Manager** - Core state container, Zustand or similar
3. **Basic UI Shell** - React app structure, routing

**Rationale:** These are foundational. No game logic can be tested without state management and event flow.

### Phase 2: Entity Foundation
**Build second - game objects need to exist before mechanics.**

4. **Entity System** - Base entity types (NPC, Location, Item)
5. **NPC System (basic)** - NPC data model, no behavior yet
6. **Player System** - Player stats, inventory, condition

**Rationale:** Before you can generate towns or run conflicts, you need the entities that participate in them.

### Phase 3: World Generation
**Build third - need a world to play in.**

7. **World Generator** - Town generation with sin progression
8. **Location System** - Places within towns
9. **Relationship System** - Graph of NPC relationships

**Rationale:** Procedural generation is core to the game's identity. Build it before mechanics so you have test data.

### Phase 4: Core Mechanics
**Build fourth - the actual gameplay.**

10. **Dice Pool System** - Pool generation, allocation, rolling
11. **Clock System** - Progress clocks, ticking, linking
12. **Action System** - Non-conflict actions using dice

**Rationale:** Dice and clocks are used everywhere. Build these before conflict so you can test the simpler allocation mechanics.

### Phase 5: Conflict System
**Build fifth - the most complex mechanic.**

13. **Conflict System (basic)** - Initiation, basic raise/see
14. **Escalation System** - Escalation levels, dice integration
15. **Fallout System** - Damage calculation, consequences

**Rationale:** Conflict is the most complex system. Build on top of working dice and entity systems.

### Phase 6: Narrative Layer
**Build sixth - content delivery.**

16. **Dialogue System** - Dialogue trees, choices
17. **Narrative Engine** - Story beats, triggers
18. **Investigation System** - Revelation of town secrets

**Rationale:** Narrative builds on all other systems. Needs NPCs, conflicts, clocks all working.

### Phase 7: Polish & Persistence
**Build last - refinement.**

19. **Save/Load System** - Full serialization
20. **NPC AI Behaviors** - Agenda pursuit, reactions
21. **Tutorial/Onboarding**

**Rationale:** Save/load needs all systems stable. AI behaviors are enhancement, not core.

### Dependency Graph

```
Event Bus ─────────────────────────────────────┐
    │                                          │
    v                                          │
Game State Manager ────────────────────────────┤
    │                                          │
    v                                          │
Entity System                                  │
    │                                          │
    ├──> NPC System ──────> Relationship System│
    │         │                    │           │
    │         v                    v           │
    │    World Generator ──> Location System   │
    │         │                                │
    │         v                                │
    └──> Dice Pool System ──> Action System    │
              │                    │           │
              v                    v           │
         Clock System ────> Conflict System ───┤
              │                    │           │
              v                    v           │
         Narrative Engine ──> Dialogue System  │
              │                                │
              v                                │
         Save/Load System <────────────────────┘
```

---

## State Management Strategy

### Recommended: Zustand with Immer

For this game's complex interconnected state, **Zustand** is recommended over Redux or Context for:
- Minimal boilerplate (critical for game dev iteration)
- No Provider wrapper (easier testing)
- Built-in support for subscriptions (good for reactive UI)
- Works well with Immer for immutable updates

### State Shape

```typescript
interface GameState {
  // Meta
  meta: {
    saveVersion: number;
    seed: number;
    cycle: number;
    phase: 'exploration' | 'conflict' | 'resolution';
  };

  // World
  world: {
    currentTown: TownId;
    towns: Record<TownId, Town>;
    visitedLocations: Set<LocationId>;
  };

  // Entities
  entities: {
    npcs: Record<NPCId, NPC>;
    locations: Record<LocationId, Location>;
    items: Record<ItemId, Item>;
  };

  // Relationships (normalized)
  relationships: {
    byPair: Record<`${NPCId}-${NPCId}`, Relationship>;
    byNPC: Record<NPCId, NPCId[]>;  // adjacency list
  };

  // Player
  player: {
    stats: Stats;
    traits: Trait[];
    belongings: ItemId[];
    condition: number;  // 0-10, affects dice pool
    position: LocationId;
  };

  // Mechanics
  dicePool: {
    available: Die[];
    allocated: AllocationRecord[];
    usedThisCycle: Die[];
  };

  clocks: {
    active: Record<ClockId, Clock>;
    completed: ClockId[];
  };

  // Conflict (when active)
  activeConflict: Conflict | null;

  // Narrative
  narrative: {
    revealed: Set<SecretId>;
    completedBeats: Set<StoryBeatId>;
    activeDialogue: DialogueState | null;
  };
}
```

### State Update Patterns

**Use Immer for complex updates:**
```typescript
// Good: Immer handles immutability
updateNPCOpinion: (npcId, targetId, delta) =>
  set(produce(state => {
    state.entities.npcs[npcId].opinions[targetId] += delta;
  })),

// Good: Direct assignment with Immer
tickClock: (clockId) =>
  set(produce(state => {
    state.clocks.active[clockId].filled += 1;
  })),
```

**Selectors for derived state:**
```typescript
// Compute available actions based on location and dice
const useAvailableActions = () => useGameStore(state => {
  const location = state.entities.locations[state.player.position];
  const availableDice = state.dicePool.available;
  return location.actions.filter(action =>
    availableDice.some(die => die.value >= action.minDie)
  );
});
```

### Conflict State Machine

The conflict system needs its own state machine within the game state:

```typescript
type ConflictPhase =
  | { type: 'inactive' }
  | { type: 'initiating'; participants: Participant[]; stakes: Stakes }
  | { type: 'active'; conflict: ActiveConflict }
  | { type: 'escalating'; conflict: ActiveConflict; toLevel: EscalationLevel }
  | { type: 'resolving'; conflict: ActiveConflict; outcome: Outcome }
  | { type: 'fallout'; conflict: ResolvedConflict; fallout: Fallout };

interface ActiveConflict {
  id: ConflictId;
  participants: Map<ParticipantId, ParticipantState>;
  stakes: Stakes;
  currentLevel: EscalationLevel;
  raises: Raise[];
  currentTurn: ParticipantId;
}
```

### Serialization Strategy

**What to serialize:**
- All of `GameState` except transient UI state
- Use JSON with custom revivers for Sets and Maps

**Schema versioning:**
```typescript
interface SaveFile {
  version: number;  // Increment on breaking changes
  timestamp: number;
  state: SerializedGameState;
}

// On load, migrate if needed
function loadGame(save: SaveFile): GameState {
  let state = save.state;
  if (save.version < 2) {
    state = migrateV1toV2(state);
  }
  if (save.version < 3) {
    state = migrateV2toV3(state);
  }
  return deserialize(state);
}
```

---

## Anti-Patterns to Avoid

### 1. Circular Dependencies Between Systems
**Bad:** NPC System imports Conflict System, Conflict System imports NPC System
**Good:** Both publish events to Event Bus, neither directly imports the other

### 2. UI Components Managing Game State
**Bad:** React component calculates conflict outcome
**Good:** React component dispatches action, game systems calculate, UI re-renders

### 3. Monolithic God Object
**Bad:** Single `Game` class with all logic
**Good:** Separate systems with clear boundaries, connected via events

### 4. Synchronous Chains of Updates
**Bad:** `updateNPC() -> updateRelationship() -> updateClock() -> updateNarrative()`
**Good:** `updateNPC() -> publish(NPC_UPDATED) -> subscribers react independently`

### 5. Storing Computed Data
**Bad:** `npc.availableActions` stored in state
**Good:** `getAvailableActions(npc, location, dicePool)` computed when needed

---

## Technology Recommendations

| Concern | Recommendation | Rationale |
|---------|----------------|-----------|
| Framework | React 18+ | Component model, hooks, ecosystem |
| State | Zustand + Immer | Minimal boilerplate, immutable updates |
| Typing | TypeScript (strict) | Essential for complex state shapes |
| State Machine | XState or custom | Conflict system needs formal FSM |
| Event Bus | mitt or custom | Tiny, typed, sufficient |
| Persistence | LocalStorage + JSON | Simple, sufficient for single-player |
| Testing | Vitest + Testing Library | Fast, good React support |

---

## Scalability Considerations

| Concern | MVP (1 town) | Full Game (10+ towns) | Notes |
|---------|--------------|----------------------|-------|
| NPC count | ~20 | ~200 | Use entity pooling |
| Relationship edges | ~100 | ~5000 | Sparse graph representation |
| Clock count | ~10 | ~50 | Active subset only |
| Save file size | ~50KB | ~500KB | Compress if needed |
| Load time | <100ms | <1s | Lazy hydration possible |

---

## Sources

### State Management
- [5 React State Management Tools Developers Actually Use in 2025](https://www.syncfusion.com/blogs/post/react-state-management-libraries)
- [Modern React State Management in 2025](https://dev.to/joodi/modern-react-state-management-in-2025-a-practical-guide-2j8f)

### ECS and Game Architecture
- [Entity Component System - RogueBasin](https://www.roguebasin.com/index.php/Entity_Component_System)
- [Building Vanilla Roguelike](https://davidslv.uk/ruby/game-development/2025/11/08/vanilla-roguelike.html)
- [State Pattern - Game Programming Patterns](https://gameprogrammingpatterns.com/state.html)

### Dice and Conflict Systems
- [Dogs in the Vineyard Strategy Notes](https://www.darkshire.net/jhkim/rpg/dogsinthevineyard/strategy.html)
- [Escalating Stakes in RPG Conflict](https://douglasunderhill.wordpress.com/2024/02/01/escalating-stakes-in-rpg-conflict/)
- [Citizen Sleeper Dice System](https://www.thegamer.com/citizen-sleeper-dice-explained-guide/)

### Progress Clocks
- [Progress Clocks - Blades in the Dark](https://bladesinthedark.com/progress-clocks)
- [The Alexandrian - Blades in the Dark Progress Clocks](https://thealexandrian.net/wordpress/40424/roleplaying-games/blades-in-the-dark-progress-clocks)

### Procedural Generation
- [Procedural Generation of Semantically Plausible Small-Scale Towns](https://www.sciencedirect.com/science/article/pii/S1524070323000012)
- [Lume: A System for Procedural Story Generation](https://eis.ucsc.edu/papers/Mason_Lume.pdf)

### Event Systems
- [Event-Driven Architecture in Gaming](https://peerdh.com/blogs/programming-insights/event-driven-architecture-in-gaming)
- [Building Type-Safe Event-Driven Applications in TypeScript](https://dev.to/encore/building-type-safe-event-driven-applications-in-typescript-using-pubsub-cron-jobs-and-postgresql-50jc)

### Save Systems
- [Demystifying Game Persistence with Serialization](https://michaelbitzos.com/devblog/demystifying-game-persistence)
- [Game State Persistence](https://app.studyraid.com/en/read/12499/404269/game-state-persistence)

### Finite State Machines
- [Finite State Machine for Turn-Based Games](https://www.gamedev.net/blogs/entry/2274204-finite-state-machine-for-turn-based-games/)
- [State Machines: The Key to Cleaner, Smarter GameDev Code](https://howtomakeanrpg.com/r/a/state-machines.html)
