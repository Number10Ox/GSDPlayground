# Stack Research: Dogs in the Vineyard Web CRPG

**Domain:** Web-based narrative CRPG with dice mechanics
**Researched:** 2026-01-20
**Overall Confidence:** HIGH

## Executive Summary

For a text-heavy, narrative-focused browser game like a Dogs in the Vineyard CRPG, the standard 2025/2026 stack emphasizes **simplicity over framework overhead**. Unlike graphical games requiring canvas/WebGL engines, text-based narrative games benefit from lightweight reactive UI frameworks paired with dedicated narrative scripting systems.

The key insight from Citizen Sleeper's development: **ink** (inkle's narrative scripting language) is "totally essential" for complex branching storylines. Combined with a minimal UI layer and robust state management, this forms the core stack.

---

## Recommended Stack

### Core Framework Decision: Preact + Signals

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Preact** | 10.x | Lightweight reactive UI | HIGH |
| **@preact/signals** | 1.x | Fine-grained state updates | HIGH |
| **Vite** | 6.x | Build tooling, dev server | HIGH |
| **TypeScript** | 5.4+ | Type safety | HIGH |

**Why Preact over React?**
- **Bundle size:** ~3KB gzipped vs React's ~40KB - critical for web games
- **Signals support:** First-class Signals deliver up to 10x faster updates in UI-heavy applications with frequent state changes
- **Text updates:** Execute within hundreds of nanoseconds of vanilla JS - near-theoretical performance limits
- **React compatibility:** `preact/compat` allows using most React ecosystem libraries if needed

**Why NOT Vanilla JS?**
While Vanilla JS would be even lighter, the game's complexity (NPC relationships, clock systems, dice allocation, save/load) benefits from reactive state management. Vanilla JS would require building these patterns from scratch.

**Why NOT SolidJS?**
SolidJS has excellent reactivity but smaller ecosystem. For a solo project, Preact's React-compatibility layer provides more library options and easier troubleshooting.

---

### Narrative System: ink + inkjs

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **ink** (scripting) | current | Narrative scripting language | HIGH |
| **inkjs** | 2.3.2 | JavaScript runtime for ink stories | HIGH |
| **Inky** (editor) | current | Writing/testing ink stories | HIGH |

**Why ink?**

1. **Battle-tested:** Powers 80 Days, Heaven's Vault, Citizen Sleeper
2. **Developer testimonial:** Gareth Damian Martin (Citizen Sleeper creator) says ink was "totally essential" - "being able to see, like, did they say that to them? Or have they heard about this piece of information?"
3. **TypeScript support:** inkjs provides TypeScript definitions via `/types` submodule
4. **Zero dependencies:** inkjs works in all browsers and Node.js
5. **Built-in compiler:** inkjs includes a JavaScript port of the ink compiler

**ink handles:**
- Branching dialogue trees
- Variable tracking (NPC relationships, flags, counters)
- Conditional content based on game state
- Knot/stitch/divert structure perfect for narrative flow

**Source:** [inkle's ink documentation](https://www.inklestudios.com/ink/), [inkjs GitHub](https://github.com/y-lohse/inkjs)

---

### State Management: XState + Zustand (Hybrid)

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **XState** | 5.25.0 | Complex state machines (conflict, clocks) | HIGH |
| **Zustand** | 5.0.10 | Simple global state (UI, settings) | HIGH |

**Why hybrid approach?**

1. **XState for game logic:** State machines are "80% of the way there" for RPG development
   - **Conflict system:** DitV escalation (talking -> physical -> fighting -> guns) maps perfectly to state machine
   - **Clock systems:** Faction clocks, doom clocks as explicit states
   - **Quest states:** Tracking quest progression explicitly, less error-prone
   - **Actor model:** XState v5's actor focus fits game entities (NPCs, factions)

2. **Zustand for UI state:**
   - Settings, current view, UI toggles
   - ~14.4M weekly downloads - battle-tested
   - Minimal boilerplate: "read two lines in the docs and already be an expert"

**Why NOT XState alone?**
XState is powerful but verbose for simple state. Zustand handles "is the inventory open?" style state more elegantly.

**Why NOT Zustand alone?**
Complex game logic (DitV escalation, clocks) benefits from explicit state machines. Zustand stores can become spaghetti without discipline.

**Source:** [XState documentation](https://stately.ai/docs/xstate), [Zustand GitHub](https://github.com/pmndrs/zustand)

---

### Data/Persistence: Dexie.js + IndexedDB

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Dexie.js** | 4.2.1 | IndexedDB wrapper | HIGH |
| **IndexedDB** | native | Browser storage | HIGH |

**Why Dexie over raw IndexedDB?**

1. **Developer experience:** Promise-based API, elegant queries
2. **Performance:** Bulk methods use lesser-known IndexedDB features for max speed
3. **Reliability:** Works around IndexedDB implementation bugs across browsers
4. **Ecosystem:** 759K weekly downloads, used by 100K+ sites
5. **Migration support:** Schema versioning built-in

**Why NOT localStorage?**
- 5MB limit insufficient for complex save games
- No structured queries
- Synchronous API blocks UI

**Save game structure:**
```typescript
interface SaveGame {
  id: string;
  timestamp: Date;
  gameState: {
    currentTown: string;
    cycle: number;
    dice: DicePool;
    npcs: Map<string, NPCState>;
    clocks: Clock[];
    inkState: string; // JSON from inkjs
  };
  metadata: {
    playTime: number;
    version: string;
  };
}
```

**Source:** [Dexie.js documentation](https://dexie.org/)

---

### Procedural Generation: rot.js (Selective Use)

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **rot.js** | 2.2.1 | Procedural generation utilities | MEDIUM |

**Why rot.js?**

1. **Name generation:** RNG-based name generators
2. **Map generation:** BSP, cellular automata (if visual maps needed)
3. **Noise functions:** For procedural variety
4. **TypeScript support:** Written in TypeScript

**Caveat:** rot.js is "feature-complete" - maintained but not actively developed. Use selectively for specific utilities rather than as primary framework.

**Alternative:** Custom procedural generation may be simpler for narrative-focused town generation (NPC roles, building types, faction tensions).

**Source:** [rot.js homepage](https://ondras.github.io/rot.js/hp/)

---

### Build Tooling: Vite

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Vite** | 6.x | Dev server, bundling | HIGH |
| **vitest** | 2.x | Unit testing | HIGH |
| **Playwright** | 1.x | E2E testing | MEDIUM |

**Why Vite?**

1. **Speed:** Native ES modules in dev, near-instant HMR
2. **TypeScript:** Out-of-box support
3. **Templates:** `vanilla-ts` or `preact-ts` templates available
4. **Production:** Rollup-based optimized builds
5. **Game dev standard:** Phaser team provides official Vite template

**Project structure:**
```
src/
  main.ts           # Entry point
  game/
    state/          # XState machines, Zustand stores
    narrative/      # ink integration
    systems/        # Dice, clocks, conflict
    entities/       # NPCs, towns, factions
  ui/
    components/     # Preact components
    views/          # Screen-level components
  data/
    stories/        # .ink files
    schemas/        # Dexie schemas
  utils/
public/
  assets/           # Static assets
```

**Source:** [Vite documentation](https://vite.dev/guide/)

---

## Framework Options Comparison

### For Text-Heavy Narrative Games

| Option | Bundle Size | Reactivity | Ecosystem | Verdict |
|--------|-------------|------------|-----------|---------|
| **Vanilla JS** | 0KB | Manual | Full web | Too much boilerplate for complex state |
| **Preact + Signals** | ~3KB | Excellent | Good (React compat) | **RECOMMENDED** |
| **React** | ~40KB | Good | Excellent | Overkill for text game |
| **SolidJS** | ~7KB | Excellent | Growing | Smaller ecosystem, harder debugging |
| **Phaser 4** | ~200KB+ | N/A | Game-focused | Overkill for text-only game |

### Game Engine Consideration

**Phaser 4** (currently at Release Candidate 4, final release imminent):
- Great for graphical games
- Overkill for text-heavy UI
- Would add ~200KB+ to bundle
- **Verdict:** NOT recommended for this project

**Source:** [Phaser news](https://phaser.io/news/2025)

---

## What to Avoid

### Anti-Recommendations

| Technology | Why Avoid |
|------------|-----------|
| **React** | 40KB overhead unnecessary for text game |
| **Redux** | Too verbose, Zustand simpler |
| **Phaser/Excalibur** | Canvas-based, overkill for text UI |
| **localStorage** | 5MB limit, no structured queries |
| **Raw IndexedDB** | Painful API, Dexie abstracts cleanly |
| **Custom narrative system** | ink is battle-tested, don't reinvent |
| **Twine/Yarn Spinner** | Less flexible than ink for complex game state |

### Common Mistakes

1. **Over-engineering:** Don't reach for full game engines (Phaser, Excalibur) for text games
2. **Under-engineering state:** Don't use plain objects for complex game state - XState prevents bugs
3. **Coupling narrative to UI:** Keep ink stories separate from display logic
4. **Ignoring persistence early:** Design save/load from the start, not as afterthought

---

## Installation

```bash
# Create project
npm create vite@latest ditv-crpg -- --template preact-ts
cd ditv-crpg

# Core dependencies
npm install inkjs @preact/signals xstate zustand dexie

# Development dependencies
npm install -D vitest @vitest/coverage-v8 playwright

# Optional: rot.js for procedural generation
npm install rot-js
```

**tsconfig.json additions:**
```json
{
  "compilerOptions": {
    "strictNullChecks": true,  // Required for XState v5
    "target": "ES2020"
  }
}
```

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| **Preact + Signals** | HIGH | Multiple 2025 sources confirm performance, official documentation verified |
| **ink/inkjs** | HIGH | Developer testimonial from Citizen Sleeper, official inkle documentation |
| **XState v5** | HIGH | Official Stately documentation, npm verified at 5.25.0 |
| **Zustand** | HIGH | 14.4M weekly downloads, npm verified at 5.0.10 |
| **Dexie.js** | HIGH | Official documentation, npm verified at 4.2.1 |
| **rot.js** | MEDIUM | Useful but "feature-complete" (maintenance mode) |
| **Vite** | HIGH | Industry standard, official templates for games |

---

## Sources

### Authoritative (HIGH confidence)
- [inkle's ink documentation](https://www.inklestudios.com/ink/)
- [inkjs GitHub](https://github.com/y-lohse/inkjs) - v2.3.2
- [XState documentation](https://stately.ai/docs/xstate) - v5.25.0
- [Zustand GitHub](https://github.com/pmndrs/zustand) - v5.0.10
- [Dexie.js documentation](https://dexie.org/) - v4.2.1
- [Vite documentation](https://vite.dev/guide/)
- [Preact documentation](https://preactjs.com/)

### Developer Insights (HIGH confidence)
- [Citizen Sleeper case study](https://howtomakeanrpg.com/r/a/case-study-citizen-sleeper.html) - ink testimonial
- [Creative Bloq - Citizen Sleeper 2 development](https://www.creativebloq.com/3d/video-game-design/game-development-is-more-accessible-than-ever-how-citizen-sleeper-2-was-created-without-coding)

### Ecosystem Research (MEDIUM confidence)
- [GameFromScratch - JS/TS Game Engines 2025](https://gamefromscratch.com/javascript-typescript-game-engines-in-2025/)
- [Preact vs React 2025 comparison](https://medium.com/@marketing_96787/preact-vs-react-in-2025-which-javascript-framework-delivers-the-best-performance-f2ded55808a4)
- [State machines for RPGs](https://howtomakeanrpg.com/r/a/state-machines.html)
- [rot.js homepage](https://ondras.github.io/rot.js/hp/)
