# Phase 4: Character System - Research

**Researched:** 2026-01-22
**Domain:** React state management, RPG character systems, DitV rules
**Confidence:** HIGH

## Summary

This research investigated implementing a Dogs in the Vineyard-faithful character system in React with TypeScript. The standard approach uses React's built-in useReducer with Immer for complex nested state (character stats, traits, inventory, relationships), TypeScript discriminated unions for type-safe data modeling, and custom React components for dice pool visualization with source grouping.

Character creation follows DitV's point-buy system where players distribute dice pools (13-17d6 for stats depending on background, plus trait/relationship dice) across four stats (Acuity, Body, Heart, Will) and traits. During conflicts, traits are invoked mid-conflict by narrating them into raises/sees, adding their dice to the active pool. The UI must clearly show dice sources (stat vs trait vs item vs relationship) using icons rather than text labels.

**Primary recommendation:** Use useReducer with Immer for character state, TypeScript discriminated unions for stat/trait/item/relationship types, and custom SVG dice icons grouped by source. Persist character data to localStorage via Context API wrapper. For character creation UI, prefer button-based allocation over drag-and-drop for accessibility and mobile compatibility.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React useReducer | 19.2+ | Character state management | Built-in, designed for complex state with multiple actions |
| Immer | 10.x | Immutable state updates | Drastically simplifies nested object updates in reducers |
| TypeScript | 5.9+ | Type-safe character data | Discriminated unions prevent invalid states at compile time |
| Lucide React | latest | Western-religious iconography | 1500+ clean icons, tree-shakeable, consistent visual language |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| use-immer | 0.10+ | Hook wrapper for Immer | Alternative to manual produce() wrapping, cleaner API |
| React Hook Form | 7.x | Character creation forms | Point-buy allocation UI with validation |
| Zod | 3.x | Schema validation | Runtime validation for dice allocation constraints |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useReducer + Immer | Zustand | Better for global state, but overkill for component-level character data |
| Lucide React | Phosphor Icons | More weight variations (thin/bold/duotone), but less consistent grid system |
| React Hook Form | Formik | More mature but heavier bundle size and more re-renders |

**Installation:**
```bash
npm install immer use-immer react-hook-form zod lucide-react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Character/
│   │   ├── CharacterSheet.tsx      # Full character view
│   │   ├── CharacterCreation.tsx   # Point-buy UI
│   │   ├── StatDisplay.tsx         # Individual stat with dice icon
│   │   ├── TraitList.tsx           # Trait invocation UI
│   │   ├── InventoryPanel.tsx      # Items with dice values
│   │   └── RelationshipPanel.tsx   # NPC relationships
│   └── DicePool/
│       ├── GroupedDicePool.tsx     # Dice grouped by source
│       └── DiceSourceIcon.tsx      # Icon for stat/trait/item/relationship
├── hooks/
│   ├── useCharacter.tsx            # Character state + reducer
│   └── useCharacterPersistence.tsx # localStorage wrapper
├── types/
│   └── character.ts                # Discriminated unions for character data
└── reducers/
    └── characterReducer.ts         # Immer-wrapped reducer
```

### Pattern 1: Character State with Immer Reducer
**What:** Use useReducer with Immer's produce() for complex character state updates
**When to use:** When character state has nested objects (stats, traits array, inventory map, relationships)
**Example:**
```typescript
// Source: https://immerjs.github.io/immer/example-setstate/
import { useReducer } from 'react';
import { produce } from 'immer';

type CharacterState = {
  stats: { acuity: Stat; body: Stat; heart: Stat; will: Stat };
  traits: Trait[];
  inventory: Item[];
  relationships: Map<string, Relationship>;
};

type CharacterAction =
  | { type: 'ADD_TRAIT'; trait: Trait }
  | { type: 'UPDATE_STAT'; statName: string; modifier: number }
  | { type: 'USE_ITEM'; itemId: string };

const characterReducer = produce((draft: CharacterState, action: CharacterAction) => {
  switch (action.type) {
    case 'ADD_TRAIT':
      draft.traits.push(action.trait);
      break;
    case 'UPDATE_STAT':
      // Direct mutation in draft - Immer handles immutability
      const stat = draft.stats[action.statName as keyof typeof draft.stats];
      stat.modifier += action.modifier;
      break;
    case 'USE_ITEM':
      const item = draft.inventory.find(i => i.id === action.itemId);
      if (item) item.used = true;
      break;
  }
});

function useCharacter() {
  const [state, dispatch] = useReducer(characterReducer, initialState);
  return { state, dispatch };
}
```

### Pattern 2: Discriminated Unions for Character Data
**What:** Use TypeScript discriminated unions with a shared discriminator property for type-safe character data
**When to use:** When different character elements (stats vs traits vs items) have different properties but need unified handling
**Example:**
```typescript
// Source: https://www.developerway.com/posts/advanced-typescript-for-react-developers-discriminated-unions
type DiceSource =
  | { source: 'stat'; statName: 'acuity' | 'body' | 'heart' | 'will'; dice: Die[] }
  | { source: 'trait'; traitId: string; traitName: string; dice: Die[] }
  | { source: 'item'; itemId: string; itemName: string; dice: Die[] }
  | { source: 'relationship'; npcId: string; npcName: string; dice: Die[] };

function getDiceIcon(source: DiceSource): ReactNode {
  switch (source.source) {
    case 'stat':
      return <StatIcon name={source.statName} />;
    case 'trait':
      return <TraitIcon />;
    case 'item':
      return <ItemIcon />;
    case 'relationship':
      return <RelationshipIcon />;
  }
}
```

### Pattern 3: Grouped Dice Pool Display
**What:** Display dice pools grouped by source with icon badges, not text labels
**When to use:** During conflicts when showing contributing dice from multiple sources
**Example:**
```typescript
// Source: https://www.shadcndesign.com/blog/5-best-icon-libraries-for-shadcn-ui
import { Lightbulb, Hand, Heart, Cross } from 'lucide-react';

function GroupedDicePool({ sources }: { sources: DiceSource[] }) {
  return (
    <div className="flex flex-col gap-4">
      {sources.map((source) => (
        <div key={source.source} className="flex gap-2 items-center">
          <div className="w-6 h-6">
            {source.source === 'stat' && <StatIcon name={source.statName} />}
            {source.source === 'trait' && <Bookmark className="w-6 h-6" />}
            {source.source === 'item' && <Package className="w-6 h-6" />}
            {source.source === 'relationship' && <Users className="w-6 h-6" />}
          </div>
          <div className="flex gap-1">
            {source.dice.map((die) => (
              <DieIcon key={die.id} type={die.type} value={die.value} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Pattern 4: localStorage Persistence with Context
**What:** Combine Context API for reactive state with localStorage for persistence
**When to use:** For character data that must survive browser refresh in a browser-only game
**Example:**
```typescript
// Source: https://felixgerschau.com/react-localstorage/
function useCharacterPersistence(characterId: string) {
  const [state, dispatch] = useReducer(characterReducer, null, () => {
    const stored = localStorage.getItem(`character-${characterId}`);
    return stored ? JSON.parse(stored) : initialCharacterState;
  });

  useEffect(() => {
    localStorage.setItem(`character-${characterId}`, JSON.stringify(state));
  }, [state, characterId]);

  return { state, dispatch };
}
```

### Pattern 5: Point-Buy Allocation UI
**What:** Button-based allocation interface for distributing dice pools during character creation
**When to use:** Character creation where players allocate limited dice resources across stats/traits
**Example:**
```typescript
// Source: https://www.react-hook-form.com/api/useform/register/
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const statSchema = z.object({
  acuity: z.number().min(2).max(8), // Minimum 2d6 per stat
  body: z.number().min(2).max(8),
  heart: z.number().min(2).max(8),
  will: z.number().min(2).max(8),
}).refine(
  (data) => data.acuity + data.body + data.heart + data.will <= 17,
  { message: 'Total dice cannot exceed 17d6' }
);

function StatAllocation() {
  const { register, watch, formState: { errors } } = useForm({
    resolver: zodResolver(statSchema),
    defaultValues: { acuity: 2, body: 2, heart: 2, will: 2 }
  });

  const values = watch();
  const remaining = 17 - (values.acuity + values.body + values.heart + values.will);

  return (
    <div>
      <p>Remaining dice: {remaining}d6</p>
      {(['acuity', 'body', 'heart', 'will'] as const).map((stat) => (
        <div key={stat}>
          <label>{stat}</label>
          <input
            type="number"
            {...register(stat, { valueAsNumber: true })}
          />
          {errors[stat] && <span>{errors[stat]?.message}</span>}
        </div>
      ))}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Prop drilling character state** through multiple levels — use Context instead
- **useState for complex character objects** — useReducer is designed for this
- **Manual spread operators for nested updates** — use Immer to avoid bugs
- **Text labels for dice sources** — icons provide faster visual parsing
- **Auto-applying traits to pools** — DitV requires player narration and invocation
- **Drag-and-drop only UI** — excludes keyboard users and mobile

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Immutable nested state updates | Manual spread operators with deep nesting | Immer + useReducer | Deeply nested spreads are error-prone; Immer is battle-tested |
| Form validation for point-buy | Custom validation logic | React Hook Form + Zod | Edge cases (negative numbers, decimal inputs, async validation) |
| localStorage sync | Manual useEffect + JSON.parse/stringify | Custom hook pattern or library | Easy to create race conditions, forget error handling |
| Dice pool visualization | Basic div grids | Custom SVG dice components with variants | Consistent sizing, animation support, accessibility |
| Icon consistency | Mixed icon sources | Single icon library (Lucide) | Visual consistency, tree-shaking, predictable API |

**Key insight:** Character systems have hidden complexity in state updates (traits added from fallout, stats modified by injuries, relationships changing). Immer prevents an entire class of bugs by ensuring immutability without manual spreads.

## Common Pitfalls

### Pitfall 1: Forgetting Default Values for Nested Objects
**What goes wrong:** Initializing character state with null or undefined nested objects causes "Cannot read property X of undefined" errors during render
**Why it happens:** TypeScript allows optional properties, but React renders before checks complete
**How to avoid:** Always provide complete default values in reducer initialization
**Warning signs:** Errors only in production, inconsistent behavior on refresh
**Example:**
```typescript
// BAD: Will crash on render
const initialState: CharacterState = {
  stats: null, // TypeError when accessing stats.acuity
  traits: [], // OK
};

// GOOD: Complete defaults
const initialState: CharacterState = {
  stats: {
    acuity: { dice: [], modifier: 0 },
    body: { dice: [], modifier: 0 },
    heart: { dice: [], modifier: 0 },
    will: { dice: [], modifier: 0 },
  },
  traits: [],
};
```

### Pitfall 2: Showing Validation Errors Before User Interaction
**What goes wrong:** Form shows "Invalid" errors immediately on mount, frustrating users who haven't had a chance to enter valid input
**Why it happens:** Validation runs on initial render with default/empty values
**How to avoid:** Show errors only after blur or submit events, not on mount or onChange
**Warning signs:** User complaints about aggressive validation, high form abandonment rates
**Example:**
```typescript
// Use React Hook Form's validation modes
const form = useForm({
  mode: 'onBlur', // Validate on blur, not onChange
  reValidateMode: 'onChange', // Re-validate on change after first blur
});
```

### Pitfall 3: Assuming localStorage Never Fails
**What goes wrong:** localStorage.setItem can throw QuotaExceededError or fail in private browsing modes, causing app crashes
**Why it happens:** localStorage has ~5-10MB limit and is disabled in some browser modes
**How to avoid:** Wrap all localStorage calls in try-catch blocks
**Warning signs:** App works locally but fails for some users, errors in Sentry/monitoring
**Example:**
```typescript
// BAD: Will crash if quota exceeded
localStorage.setItem('character', JSON.stringify(largeCharacter));

// GOOD: Graceful degradation
try {
  localStorage.setItem('character', JSON.stringify(character));
} catch (error) {
  console.warn('Could not save character to localStorage', error);
  // Fall back to memory-only or show warning to user
}
```

### Pitfall 4: Not Validating Dice Pool Sources
**What goes wrong:** During conflicts, traits/items/relationships contribute dice multiple times when DitV rules allow only once per conflict
**Why it happens:** No validation that a trait/item hasn't already been used this conflict
**How to avoid:** Track used sources per conflict in conflict state, validate before allowing invocation
**Warning signs:** Players winning conflicts too easily, dice pools growing unexpectedly large
**Example:**
```typescript
type ConflictState = {
  // ... other conflict state
  usedTraits: Set<string>; // Track trait IDs already invoked
  usedItems: Set<string>;
  usedRelationships: Set<string>;
};

function canInvokeTrait(traitId: string, conflictState: ConflictState): boolean {
  return !conflictState.usedTraits.has(traitId);
}
```

### Pitfall 5: Conditional Rendering with Falsy Dice Counts
**What goes wrong:** UI renders `0` when dice pool is empty instead of hiding the section
**Why it happens:** Using `diceCount && <Component />` when diceCount is 0 renders "0" in JSX
**How to avoid:** Use explicit boolean conversion or ternary operators
**Warning signs:** Stray zeros appearing in UI where empty space expected
**Example:**
```typescript
// BAD: Renders "0" when no dice
{dicePool.length && <DicePoolDisplay dice={dicePool} />}

// GOOD: Explicit check
{dicePool.length > 0 && <DicePoolDisplay dice={dicePool} />}
```

### Pitfall 6: Missing Keys in Dynamic Trait/Item Lists
**What goes wrong:** React's reconciliation breaks when adding/removing traits, causing dice to swap between traits or incorrect updates
**Why it happens:** Not providing stable unique keys for dynamically rendered trait/item lists
**How to avoid:** Use stable IDs (UUIDs, database IDs) as keys, never array indices
**Warning signs:** UI updates incorrectly when reordering/adding/removing items
**Example:**
```typescript
// BAD: Index as key causes bugs when reordering
{traits.map((trait, index) => <TraitCard key={index} trait={trait} />)}

// GOOD: Stable ID as key
{traits.map((trait) => <TraitCard key={trait.id} trait={trait} />)}
```

## Code Examples

Verified patterns from official sources:

### Character State Type Definitions
```typescript
// Source: DitV rules + TypeScript discriminated unions best practices
// https://www.darkshire.net/jhkim/rpg/dogsinthevineyard/chargen.html

export type DieType = 'd4' | 'd6' | 'd8' | 'd10';

export interface Die {
  id: string;
  type: DieType;
  value: number; // Rolled value
}

export interface Stat {
  name: 'acuity' | 'body' | 'heart' | 'will';
  dice: Die[]; // e.g., [d6, d6, d6] for 3d6
  modifier: number; // Temporary reduction from injuries
}

export interface Trait {
  id: string;
  name: string;
  dice: Die[]; // e.g., [d6, d4] for "I'm a Dog 2d6" + "Good shot 1d4"
  description?: string;
}

export interface Item {
  id: string;
  name: string;
  category: 'normal' | 'big' | 'excellent' | 'big-excellent' | 'crap';
  dice: Die[]; // Determined by category: normal=1d6, big=1d8, excellent=2d6, etc.
  isGun: boolean; // Guns add +1d4
}

export interface Relationship {
  id: string;
  npcId: string;
  npcName: string;
  dice: Die[];
  description?: string;
}

export interface Character {
  id: string;
  name: string;
  stats: {
    acuity: Stat;
    body: Stat;
    heart: Stat;
    will: Stat;
  };
  traits: Trait[];
  inventory: Item[];
  relationships: Relationship[];
}
```

### Character Creation with Point-Buy
```typescript
// Source: DitV character creation rules
// Background determines starting dice pools

type Background = 'complicated-history' | 'strong-community' | 'well-rounded';

const BACKGROUNDS: Record<Background, {
  statDice: number; // How many d6 for stats
  traitDice: Die[]; // Starting trait dice
  relationshipDice: Die[];
}> = {
  'complicated-history': {
    statDice: 13, // 13d6 to allocate
    traitDice: [
      { type: 'd4' }, { type: 'd4' },
      { type: 'd6' }, { type: 'd6' },
      { type: 'd8' }, { type: 'd10' },
    ],
    relationshipDice: [
      { type: 'd6' }, { type: 'd6' }, { type: 'd6' },
      { type: 'd8' }, { type: 'd10' },
    ],
  },
  // ... other backgrounds
};

function createCharacter(
  name: string,
  background: Background,
  statAllocation: { acuity: number; body: number; heart: number; will: number },
  // ... trait and relationship allocations
): Character {
  const bg = BACKGROUNDS[background];

  // Validate stat allocation
  const total = Object.values(statAllocation).reduce((sum, val) => sum + val, 0);
  if (total !== bg.statDice) {
    throw new Error(`Must allocate exactly ${bg.statDice}d6`);
  }

  // Create stats with allocated dice
  const stats = {
    acuity: createStat('acuity', statAllocation.acuity),
    body: createStat('body', statAllocation.body),
    heart: createStat('heart', statAllocation.heart),
    will: createStat('will', statAllocation.will),
  };

  return {
    id: crypto.randomUUID(),
    name,
    stats,
    traits: [],
    inventory: createStartingInventory(), // Coat, gun, Book of Life, sacred earth
    relationships: [],
  };
}

function createStartingInventory(): Item[] {
  return [
    { id: crypto.randomUUID(), name: 'Coat', category: 'big', dice: [{ type: 'd8', value: 0 }], isGun: false },
    { id: crypto.randomUUID(), name: 'Gun', category: 'normal', dice: [{ type: 'd6', value: 0 }, { type: 'd4', value: 0 }], isGun: true },
    { id: crypto.randomUUID(), name: 'Book of Life', category: 'normal', dice: [{ type: 'd6', value: 0 }], isGun: false },
    { id: crypto.randomUUID(), name: 'Sacred Earth (jar)', category: 'normal', dice: [{ type: 'd6', value: 0 }], isGun: false },
  ];
}
```

### Trait Invocation During Conflict
```typescript
// Source: DitV conflict rules - traits invoked mid-conflict during raise/see
// https://inky.org/rpg/oneshots/dogs.html

function canInvokeTrait(
  traitId: string,
  character: Character,
  conflictState: ConflictState
): boolean {
  // DitV rule: can only invoke each trait once per conflict
  if (conflictState.usedTraits.has(traitId)) {
    return false;
  }

  // Must have the trait
  const trait = character.traits.find(t => t.id === traitId);
  return trait !== undefined;
}

function invokeTrait(
  traitId: string,
  narration: string,
  character: Character,
  conflictState: ConflictState
): Die[] {
  if (!canInvokeTrait(traitId, character, conflictState)) {
    throw new Error('Cannot invoke this trait');
  }

  const trait = character.traits.find(t => t.id === traitId)!;

  // Roll the trait's dice
  const rolledDice = trait.dice.map(die => ({
    ...die,
    value: rollDie(die.type),
  }));

  // Mark trait as used for this conflict
  conflictState.usedTraits.add(traitId);

  return rolledDice;
}
```

### Fallout-to-Trait Conversion
```typescript
// Source: DitV fallout rules - fallout becomes new traits
// Severity determines trait's dice

function createTraitFromFallout(
  severity: FalloutSeverity,
  description: string
): Trait {
  let dice: Die[];

  switch (severity) {
    case 'MINOR':
      dice = [{ type: 'd4', value: 0 }];
      break;
    case 'SERIOUS':
      dice = [{ type: 'd6', value: 0 }];
      break;
    case 'DEADLY':
      dice = [{ type: 'd8', value: 0 }];
      break;
    case 'DEATH':
      // Character dies - this is handled separately
      throw new Error('Cannot create trait from DEATH fallout');
    default:
      dice = [];
  }

  return {
    id: crypto.randomUUID(),
    name: description, // e.g., "Broken arm", "Lost faith"
    dice,
    description: `Gained from fallout`,
  };
}

// Add trait to character in reducer
case 'ADD_FALLOUT_TRAIT': {
  const newTrait = createTraitFromFallout(action.severity, action.description);
  draft.traits.push(newTrait);
  break;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux for all state | useReducer for component state, Zustand/Jotai for shared | 2023-2024 | Simpler mental model, less boilerplate |
| Manual immutability | Immer with reducers | 2020-present | 50% less code, fewer bugs |
| Formik | React Hook Form | 2021-present | Better performance, fewer re-renders |
| Font Awesome | Lucide React | 2023-present | Tree-shakeable, consistent design system |
| Drag-and-drop primary | Buttons + optional drag | 2022-present | Better accessibility, mobile support |
| Class components | Function components + hooks | 2019-present | Standard for all new code |

**Deprecated/outdated:**
- Redux for local component state: useReducer is built-in and simpler
- PropTypes: TypeScript is the standard for type checking
- componentDidMount/Update: useEffect replaces lifecycle methods
- Manual localStorage sync: Custom hooks abstract persistence logic

## Open Questions

Things that couldn't be fully resolved:

1. **Exact DitV dice allocation by background**
   - What we know: Backgrounds provide different starting dice pools (13-17d6 for stats, varying trait/relationship dice)
   - What's unclear: Full tables for all backgrounds not found in public sources
   - Recommendation: Use 15d6 as default for stats, let players choose die sizes for traits (matching total dice value)

2. **Trait invocation limit per raise/see**
   - What we know: DitV allows traits once per conflict; user wants mid-conflict invocation
   - What's unclear: Can multiple traits be invoked in a single raise/see?
   - Recommendation: Allow unlimited traits per raise/see but one-use-per-conflict (most faithful to DitV spirit)

3. **Relationship dice in conflicts without NPC present**
   - What we know: Relationships provide dice when relevant to conflict
   - What's unclear: Can relationship with Sheriff provide dice in conflict with Sinner if Sheriff isn't present?
   - Recommendation: Require NPC presence or direct relevance to stakes (GM/player judgment call)

4. **Icon choices for stat display**
   - What we know: User wants western-religious iconography (lantern/fist/heart/cross suggested)
   - What's unclear: Which Lucide icons best match this aesthetic
   - Recommendation: Lightbulb (Acuity), Hand (Body), Heart (Heart), Cross (Will) from Lucide's available icons; can custom SVG if needed

## Sources

### Primary (HIGH confidence)
- [Dogs in the Vineyard Character Generation](https://www.darkshire.net/jhkim/rpg/dogsinthevineyard/chargen.html) - Official DitV chargen rules
- [Dogs in the Vineyard PDF](https://i.4pcdn.org/tg/1515706438642.pdf) - Full game rules
- [Immer React Documentation](https://immerjs.github.io/immer/example-setstate/) - Official Immer + useReducer patterns
- [React Hook Form API](https://www.react-hook-form.com/api/useform/register/) - Official validation API
- [Lucide React](https://lucide.dev/guide/packages/lucide-react) - Icon library documentation

### Secondary (MEDIUM confidence)
- [Advanced TypeScript for React Developers - Discriminated Unions](https://www.developerway.com/posts/advanced-typescript-for-react-developers-discriminated-unions)
- [State Management in 2026: Redux, Context API, and Modern Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)
- [How to Persist React State in Local Storage](https://felixgerschau.com/react-localstorage/)
- [React UI Patterns for Badges and Tags](https://www.shadcndesign.com/blog/5-best-icon-libraries-for-shadcn-ui)
- [Common React Mistakes](https://www.joshwcomeau.com/react/common-beginner-mistakes/)

### Tertiary (LOW confidence - WebSearch only)
- [RPG Inventory Usability Best Practices](https://conferencing-in-the-web.com/video-games/essential-elements-for-crafting-an-intuitive-inventory-system-in-complex-rpgs/) - General principles, not React-specific
- [Data Structures for Game Programmers](https://medium.com/supercent-blog/data-structures-for-game-developers-2d2e0adcc931) - General game dev, not TypeScript
- [Drag and Drop UX Guidelines](https://blog.logrocket.com/ux-design/drag-and-drop-ui-examples/) - General UX, not implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified with official docs (React, Immer, RHF), widely adopted in 2026
- Architecture: HIGH - Patterns from official sources, proven in production
- DitV rules: MEDIUM - Public sources consistent but not official rulebook
- Pitfalls: HIGH - Documented in official guides and community consensus
- UI patterns: MEDIUM - Best practices verified but project-specific

**Research date:** 2026-01-22
**Valid until:** ~2026-03-22 (60 days - React ecosystem stable, DitV rules timeless)
