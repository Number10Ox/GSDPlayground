# Phase 2: Cycle System - Research

**Researched:** 2026-01-21
**Domain:** React game state management, dice allocation UI, clock visualization, keyboard accessibility
**Confidence:** HIGH

## Summary

Phase 2 implements the Citizen Sleeper-inspired daily cycle loop: wake, allocate dice, take actions, end day. The standard approach uses **React useReducer as a finite state machine** for cycle phases, **click-to-select interaction patterns** (not drag-and-drop) for dice allocation, **custom SVG components** for both dice and clock visualization, and **CSS :focus-visible** for keyboard accessibility.

The existing GameContext with useReducer pattern from Phase 1 extends naturally to handle cycle state. Dice allocation uses a two-step click pattern: select die, then assign to action. Clocks use SVG arc segments with stroke-dasharray. Framer Motion (already installed) handles layout animations when dice move between pool and actions.

**Primary recommendation:** Extend the existing useReducer with cycle-specific state (phase, dicePool, assignedDice, clocks) and actions. Build custom DieComponent and ClockComponent using SVG. Use role="listbox" pattern for accessible dice selection with arrow key navigation.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | UI framework | useReducer for state machine, Context for global state |
| Framer Motion | 12.x | Animation | Layout animations for dice movement, AnimatePresence for transitions |
| Tailwind CSS | 3.x | Styling | :focus-visible utilities, responsive design |

### Supporting (No New Dependencies)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native SVG | N/A | Dice and clock visuals | Custom polyhedral shapes, segment arcs |
| CSS :focus-visible | Native | Keyboard focus styling | Show focus ring only on keyboard navigation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Click-to-assign | dnd-kit drag-and-drop | More complex, overkill for simple assignment |
| Custom SVG dice | react-dice (three.js) | 3D is heavyweight, 2D icons sufficient |
| react-minimal-pie-chart | Custom SVG arcs | Library adds dependency for simple clocks |
| XState | useReducer FSM | XState powerful but adds dependency; useReducer sufficient |

**No new dependencies needed** - Phase 2 builds entirely on Phase 1 stack.

## Architecture Patterns

### Recommended Project Structure Addition
```
src/
├── components/
│   ├── DicePool/           # Dice tray and individual dice
│   │   ├── DicePool.tsx    # Container tray component
│   │   ├── DieComponent.tsx # Individual die (SVG + value)
│   │   └── index.ts
│   ├── Actions/            # Action cards/slots for dice
│   │   ├── ActionCard.tsx  # Single action with dice slots
│   │   ├── ActionList.tsx  # Container for available actions
│   │   └── index.ts
│   ├── Clocks/             # Progress clock visualization
│   │   ├── Clock.tsx       # Single clock (4/6/8 segment)
│   │   └── ClockList.tsx   # Multiple clocks display
│   └── CycleSummary/       # End-of-cycle summary screen
│       └── CycleSummary.tsx
├── types/
│   └── game.ts             # Extended with Die, Action, Clock types
└── hooks/
    └── useGameState.tsx    # Extended reducer for cycle state
```

### Pattern 1: Finite State Machine with useReducer

**What:** Model cycle phases as explicit states with allowed transitions
**When to use:** When component has distinct phases with different allowed actions

**Example:**
```typescript
// types/game.ts - Cycle state machine
type CyclePhase = 'WAKE' | 'ALLOCATE' | 'RESOLVE' | 'SUMMARY' | 'REST';

type DieType = 'd4' | 'd6' | 'd8' | 'd10';

interface Die {
  id: string;
  type: DieType;
  value: number;        // Rolled value (1-4, 1-6, 1-8, 1-10)
  assignedTo: string | null;  // Action ID or null if in pool
}

interface CycleState {
  phase: CyclePhase;
  cycleNumber: number;
  dicePool: Die[];
  selectedDieId: string | null;  // Currently selected die for assignment
}

// Reducer with FSM pattern
function cycleReducer(state: CycleState, action: CycleAction): CycleState {
  // Guard: Only allow actions valid for current phase
  switch (state.phase) {
    case 'ALLOCATE':
      if (action.type === 'SELECT_DIE' || action.type === 'ASSIGN_DIE' ||
          action.type === 'UNASSIGN_DIE' || action.type === 'CONFIRM_CYCLE') {
        return handleAllocateAction(state, action);
      }
      return state; // Ignore invalid actions for this phase
    // ... other phases
  }
}
```

**Why FSM pattern:**
- Prevents invalid state transitions (can't assign dice during RESOLVE)
- Makes cycle flow explicit and debuggable
- TypeScript catches invalid action/phase combinations

### Pattern 2: Click-to-Select Dice Allocation

**What:** Two-step interaction: click die to select, click action to assign
**When to use:** When user assigns items from pool to targets

**Example:**
```typescript
// DieComponent.tsx - Selectable die
interface DieComponentProps {
  die: Die;
  isSelected: boolean;
  onSelect: () => void;
}

export function DieComponent({ die, isSelected, onSelect }: DieComponentProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-12 h-12 transition-transform",
        isSelected && "scale-110 ring-2 ring-amber-400",
        "focus-visible:ring-2 focus-visible:ring-amber-400"
      )}
      aria-pressed={isSelected}
      aria-label={`${die.type} showing ${die.value}`}
    >
      <DieIcon type={die.type} value={die.value} />
    </button>
  );
}

// ActionCard.tsx - Receives assigned dice
interface ActionCardProps {
  action: GameAction;
  assignedDice: Die[];
  onAssign: () => void;      // Called when player clicks to assign selected die
  onUnassign: (dieId: string) => void;
  isAvailable: boolean;
}

export function ActionCard({ action, assignedDice, onAssign, onUnassign, isAvailable }: ActionCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border",
        isAvailable ? "border-gray-600 cursor-pointer" : "border-gray-800 opacity-50"
      )}
      onClick={isAvailable ? onAssign : undefined}
      role="button"
      aria-disabled={!isAvailable}
    >
      <h3>{action.name}</h3>
      {/* Stacked dice display */}
      <div className="flex gap-1 mt-2">
        {assignedDice.map(die => (
          <button
            key={die.id}
            onClick={(e) => { e.stopPropagation(); onUnassign(die.id); }}
            aria-label={`Remove ${die.type} from ${action.name}`}
          >
            <DieIcon type={die.type} value={die.value} size="sm" />
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Why click-to-select:**
- Simpler than drag-and-drop (no library needed)
- Mobile-friendly (touch targets, no drag gesture)
- Easily reversible (click assigned die to return)
- Clear keyboard flow (Tab to dice, Enter to select, Tab to actions, Enter to assign)

### Pattern 3: SVG Progress Clocks

**What:** Segmented circle using SVG arcs with stroke-dasharray
**When to use:** Visualizing discrete progress (4/6/8 segments)

**Example:**
```typescript
// components/Clocks/Clock.tsx
interface ClockProps {
  segments: 4 | 6 | 8;
  filled: number;
  label: string;
  variant?: 'danger' | 'progress' | 'opportunity';
}

export function Clock({ segments, filled, label, variant = 'progress' }: ClockProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const segmentLength = circumference / segments;
  const gap = 4; // Gap between segments

  const colors = {
    danger: { empty: '#4a4a4a', filled: '#ef4444' },
    progress: { empty: '#4a4a4a', filled: '#3b82f6' },
    opportunity: { empty: '#4a4a4a', filled: '#22c55e' },
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-16 h-16">
        {Array.from({ length: segments }).map((_, i) => {
          const rotation = (360 / segments) * i - 90; // Start at 12 o'clock
          const isFilled = i < filled;
          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={isFilled ? colors[variant].filled : colors[variant].empty}
              strokeWidth="8"
              strokeDasharray={`${segmentLength - gap} ${circumference - segmentLength + gap}`}
              strokeDashoffset={-i * segmentLength}
              transform={`rotate(${rotation} 50 50)`}
              className="transition-colors duration-300"
            />
          );
        })}
      </svg>
      <span className="text-xs text-gray-400 mt-1">{label}</span>
    </div>
  );
}
```

**Why custom SVG:**
- No dependency for simple shapes
- Full control over segment appearance
- Tailwind classes work directly on SVG
- Framer Motion can animate strokeDashoffset

### Pattern 4: Keyboard-Accessible Listbox for Dice Selection

**What:** ARIA listbox role with arrow key navigation
**When to use:** Selecting from a collection of items

**Example:**
```typescript
// DicePool.tsx - Accessible dice selection
export function DicePool({ dice, selectedDieId, onSelect }: DicePoolProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const poolRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(i => Math.min(i + 1, dice.length - 1));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(dice[focusedIndex].id);
        break;
    }
  };

  return (
    <div
      ref={poolRef}
      role="listbox"
      aria-label="Dice pool"
      aria-activedescendant={dice[focusedIndex]?.id}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="flex gap-2 p-4 bg-surface rounded-lg focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      {dice.map((die, index) => (
        <DieComponent
          key={die.id}
          die={die}
          isSelected={die.id === selectedDieId}
          isFocused={index === focusedIndex}
          onSelect={() => onSelect(die.id)}
        />
      ))}
    </div>
  );
}
```

**Why listbox pattern:**
- Standard ARIA role for selection UI
- Arrow keys feel natural for horizontal list
- Single Tab stop for entire pool (not each die)
- Screen reader announces selection state

### Pattern 5: Layout Animation for Dice Movement

**What:** Framer Motion layout prop for automatic position animation
**When to use:** When items move between containers

**Example:**
```typescript
// Wrap dice in LayoutGroup for cross-container animation
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';

export function CycleView() {
  return (
    <LayoutGroup>
      {/* Dice in pool animate to actions and back */}
      <DicePool dice={poolDice} />
      <ActionList actions={actions} />
    </LayoutGroup>
  );
}

// Individual die with layout animation
export function DieComponent({ die, ...props }: DieComponentProps) {
  return (
    <motion.button
      layoutId={die.id}  // Same ID across pool and action
      layout
      initial={false}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      // ... other props
    >
      <DieIcon type={die.type} value={die.value} />
    </motion.button>
  );
}
```

**Why layout animation:**
- Automatic position interpolation
- No manual coordinate tracking
- Works across different parent containers
- Framer Motion already installed

### Anti-Patterns to Avoid

- **Drag-and-drop for simple assignment:** Click-to-assign is simpler, more accessible, works on mobile
- **Storing selected die in component state:** Keep in reducer for single source of truth
- **Animating SVG width/height:** Use transform scale instead for performance
- **Multiple focus traps:** Dice pool and actions should be separate tab stops, not trapped
- **Hardcoding clock segments:** Make segment count a prop for reusability

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dice rolling | Custom PRNG | Math.random() with floor | Sufficiently random for games, simple |
| Focus-visible detection | Manual keyboard detection | CSS :focus-visible | Browser handles mouse vs keyboard distinction |
| Layout animations | Manual position tracking | Framer Motion layoutId | Automatic interpolation across containers |
| SVG arc math | Manual trigonometry | stroke-dasharray pattern | Well-documented, handles all segment counts |
| State machine | Custom pub/sub | useReducer with phase guards | Built-in React, type-safe with TypeScript |

**Key insight:** The cycle system's complexity is in game design (action effects, clock triggers), not UI infrastructure. Use standard React patterns and existing Framer Motion for UI; save custom logic for game rules.

## Common Pitfalls

### Pitfall 1: State Spread Across Components

**What goes wrong:** Dice selection state in DicePool, assignment state in ActionList, causing sync issues
**Why it happens:** Natural to put state near where it's used
**How to avoid:** All cycle state in single reducer: `{ phase, dicePool, selectedDieId, clocks }`
**Warning signs:** Props drilling selectedDie through multiple levels, stale state after assignment

### Pitfall 2: Missing Keyboard Navigation

**What goes wrong:** Dice only clickable, keyboard users stuck
**Why it happens:** Mouse testing only, forgetting accessibility
**How to avoid:**
- Use `role="listbox"` with `aria-activedescendant`
- Arrow keys for navigation within pool
- Tab between pool and actions
- Enter/Space to select/assign
**Warning signs:** Can't complete allocation without mouse

### Pitfall 3: Clock Segment Math Errors

**What goes wrong:** Segments overlap, gaps inconsistent, wrong start position
**Why it happens:** SVG coordinate system confusion (3 o'clock is 0 degrees)
**How to avoid:**
- Rotate -90deg to start at 12 o'clock
- Use consistent gap calculation: `segmentLength - gap` for dash, rest for space
- Test with all segment counts (4, 6, 8)
**Warning signs:** First segment points right, segments touch or have varying gaps

### Pitfall 4: Transition Jank on Dice Movement

**What goes wrong:** Dice teleport or flash when moving between pool and action
**Why it happens:** Component unmounts in one place, mounts in another
**How to avoid:**
- Same `layoutId` in both locations
- Wrap in `LayoutGroup` for cross-container animation
- Keep die data in single array, filter by `assignedTo` for display
**Warning signs:** Flicker during assignment, no smooth motion

### Pitfall 5: Cycle Phase Desync

**What goes wrong:** UI shows ALLOCATE phase but actions think it's RESOLVE
**Why it happens:** Multiple useStates for different phase aspects
**How to avoid:** Single `phase` field in reducer, derive UI state from it
**Warning signs:** Buttons enabled when they shouldn't be, actions fire during wrong phase

### Pitfall 6: Forgetting Free Actions

**What goes wrong:** All actions require dice, player can't move or observe
**Why it happens:** Treating dice cost as universal requirement
**How to avoid:** Action type includes `{ diceCost: number }` where 0 = free action
**Warning signs:** Player stuck with no dice but unable to do anything

## Code Examples

Verified patterns from official sources:

### Complete Cycle State Type Definition

```typescript
// types/game.ts - Extended for Phase 2
export type DieType = 'd4' | 'd6' | 'd8' | 'd10';
export type CyclePhase = 'WAKE' | 'ALLOCATE' | 'RESOLVE' | 'SUMMARY' | 'REST';
export type ClockType = 'danger' | 'progress' | 'opportunity';

export interface Die {
  id: string;
  type: DieType;
  value: number;
  assignedTo: string | null;
}

export interface Clock {
  id: string;
  label: string;
  segments: 4 | 6 | 8;
  filled: number;
  type: ClockType;
  autoAdvance: boolean;  // Advances each cycle
}

export interface GameAction {
  id: string;
  name: string;
  description: string;
  locationId: LocationId | null;  // null = available anywhere
  diceCost: number;               // 0 = free action
  available: boolean;             // Requirements met?
  requirementHint?: string;       // "Requires: Talk to Sheriff first"
}

export interface CycleState {
  phase: CyclePhase;
  cycleNumber: number;
  dicePool: Die[];
  selectedDieId: string | null;
  clocks: Clock[];
  availableActions: GameAction[];
  pendingResults: ActionResult[];
}

export type CycleAction =
  | { type: 'START_CYCLE' }
  | { type: 'SELECT_DIE'; dieId: string }
  | { type: 'ASSIGN_DIE'; actionId: string }
  | { type: 'UNASSIGN_DIE'; dieId: string }
  | { type: 'CONFIRM_ALLOCATIONS' }
  | { type: 'RESOLVE_NEXT' }
  | { type: 'ADVANCE_CLOCK'; clockId: string; amount: number }
  | { type: 'END_CYCLE' }
  | { type: 'REST_EARLY' };
```

### Dice Rolling Based on Character Condition

```typescript
// utils/dice.ts - DitV-faithful dice pool generation
export function rollDie(type: DieType): number {
  const max = parseInt(type.slice(1)); // 'd6' -> 6
  return Math.floor(Math.random() * max) + 1;
}

export function generateDicePool(condition: number): Die[] {
  // Condition 0-100 maps to 1-5 dice
  const diceCount = Math.max(1, Math.ceil(condition / 20));

  // DitV uses mixed dice types based on character traits
  // Simplified: worse condition = more d4s, better = more d6s/d8s
  const pool: Die[] = [];

  for (let i = 0; i < diceCount; i++) {
    const type: DieType = condition > 60 ? 'd6' : condition > 30 ? 'd6' : 'd4';
    pool.push({
      id: `die-${Date.now()}-${i}`,
      type,
      value: rollDie(type),
      assignedTo: null,
    });
  }

  return pool;
}
```

### SVG Die Icon Component

```typescript
// components/DicePool/DieIcon.tsx
interface DieIconProps {
  type: DieType;
  value: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 32, md: 48, lg: 64 };

// Simplified 2D die shapes (faithful to DitV polyhedral aesthetic)
export function DieIcon({ type, value, size = 'md' }: DieIconProps) {
  const s = sizeMap[size];

  // Different shapes for different die types
  const shapes: Record<DieType, string> = {
    d4: `M${s/2},4 L${s-4},${s-4} L4,${s-4} Z`,           // Triangle
    d6: `M4,4 L${s-4},4 L${s-4},${s-4} L4,${s-4} Z`,     // Square
    d8: `M${s/2},2 L${s-2},${s/2} L${s/2},${s-2} L2,${s/2} Z`, // Diamond
    d10: `M${s/2},2 L${s-4},${s/3} L${s-2},${s-4} L4,${s-4} L2,${s/3} Z`, // Pentagon-ish
  };

  const colors: Record<DieType, string> = {
    d4: '#ef4444', // Red - weakest
    d6: '#f59e0b', // Amber - standard
    d8: '#22c55e', // Green - good
    d10: '#3b82f6', // Blue - best
  };

  return (
    <svg viewBox={`0 0 ${s} ${s}`} width={s} height={s}>
      <path
        d={shapes[type]}
        fill={colors[type]}
        stroke="white"
        strokeWidth="2"
      />
      <text
        x={s/2}
        y={s/2 + 4}
        textAnchor="middle"
        fill="white"
        fontSize={s * 0.4}
        fontWeight="bold"
      >
        {value}
      </text>
    </svg>
  );
}
```

### Focus-Visible Tailwind Configuration

```javascript
// tailwind.config.js - Already supports focus-visible
module.exports = {
  // ... existing config
  theme: {
    extend: {
      // Custom focus ring for game elements
      ringColor: {
        'game-focus': '#fbbf24', // amber-400
      },
    },
  },
};

// Usage in components:
// className="focus-visible:ring-2 focus-visible:ring-game-focus focus-visible:outline-none"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Drag-and-drop libraries | Click-to-assign | 2024-2025 | Simpler, more accessible, mobile-friendly |
| :focus for all focus styles | :focus-visible | 2023-2024 | Better UX (no focus ring on click) |
| Manual position animation | Framer Motion layoutId | 2022-2023 | Automatic cross-container animation |
| XState for all state machines | useReducer FSM pattern | 2024-2025 | Simpler for component-level state |
| Canvas dice | SVG dice | Ongoing | Better accessibility, CSS styling |

**Deprecated/outdated:**
- **react-beautiful-dnd:** Unmaintained since 2022, use dnd-kit or click patterns
- **Manual focus management:** CSS :focus-visible has 95%+ browser support
- **Complex state management for UI:** useReducer sufficient, XState overkill for cycles

## DitV Mechanics Reference

### Dice Types and Their Meaning
| Die | When Used | Significance |
|-----|-----------|--------------|
| d4 | Traits that hinder, fallout from verbal conflict | Lowest, often cause taking the blow |
| d6 | Standard traits, belongings | Baseline for most conflicts |
| d8 | Strong traits, relationships, good equipment | Solid advantage |
| d10 | Exceptional traits, sacred items, deep relationships | Rare, powerful |

### Fallout Dice (Phase 3 Preview)
- d4: Words only (verbal fallout)
- d6: Physical non-weapon (fists, shoving)
- d8: Melee weapons
- d10: Guns

### Cycle Integration with Conflict
- Daily dice pool is for **allocation to actions**
- Conflicts (Phase 3) generate **separate dice pools** from traits/relationships
- This phase does NOT implement raise/see mechanics (Phase 3)

## Open Questions

Things that couldn't be fully resolved:

1. **Dice Slot Limits on Actions**
   - What we know: Some actions may limit how many dice can be assigned
   - What's unclear: Should all actions have limits, or unlimited assignment?
   - Recommendation: Start with unlimited, add limits per-action if gameplay needs it

2. **Rest Bonus for Unused Dice**
   - What we know: CONTEXT.md lists as Claude's discretion
   - What's unclear: Whether resting early should provide next-cycle bonus
   - Recommendation: Implement simple end-cycle first, add bonus if pacing feels off

3. **Action Location Binding**
   - What we know: CONTEXT.md lists as Claude's discretion (location-based vs global)
   - What's unclear: Whether actions should filter by current node location
   - Recommendation: Start with location-based (fits node map), allow some global actions

4. **Value Thresholds vs Quantity**
   - What we know: CONTEXT.md lists as Claude's discretion
   - What's unclear: Do actions require minimum die value, or just any die?
   - Recommendation: Start quantity-only (simpler), add thresholds for specific actions later

## Sources

### Primary (HIGH confidence)
- [Kyle Shevlin: useReducer as FSM](https://kyleshevlin.com/how-to-use-usereducer-as-a-finite-state-machine/) - State machine pattern
- [React ARIA useFocusRing](https://react-aria.adobe.com/useFocusRing) - Focus-visible hook API
- [Blades in the Dark: Progress Clocks](https://bladesinthedark.com/progress-clocks) - Clock mechanics
- [MDN :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible) - CSS support
- [Framer Motion Layout Animations](https://www.framer.com/motion/layout-animations/) - layoutId pattern

### Secondary (MEDIUM confidence)
- [Citizen Sleeper Dice Explained](https://www.thegamer.com/citizen-sleeper-dice-explained-guide/) - Inspiration mechanics
- [How Citizen Sleeper was inspired by TTRPGs](https://www.gamedeveloper.com/business/how-citizen-sleeper-was-inspired-by-tabletop-rpgs-and-gig-work) - Design philosophy
- [LogRocket: SVG Circular Progress](https://blog.logrocket.com/build-svg-circular-progress-component-react-hooks/) - Clock implementation
- [dnd-kit Documentation](https://docs.dndkit.com) - Drag-drop alternative (decided against)
- [FreeCodeCamp: Keyboard Accessibility in React](https://www.freecodecamp.org/news/designing-keyboard-accessibility-for-complex-react-experiences/) - Accessibility patterns

### Tertiary (LOW confidence - for reference only)
- [Dogs in the Vineyard PDF](https://i.4pcdn.org/tg/1515706438642.pdf) - Original dice rules
- [1d6chan DitV Summary](https://1d6chan.miraheze.org/wiki/Dogs_in_the_Vineyard) - Mechanics overview

## Metadata

**Confidence breakdown:**
- State machine pattern: HIGH - Verified with Kyle Shevlin's guide, React docs
- Click-to-assign UX: HIGH - Standard pattern, simpler than dnd
- SVG clocks: HIGH - stroke-dasharray is well-documented
- Keyboard accessibility: HIGH - ARIA listbox pattern, React ARIA docs
- DitV dice mechanics: MEDIUM - Based on rulebook, simplified for digital
- Layout animations: HIGH - Framer Motion docs, already in stack

**Research date:** 2026-01-21
**Valid until:** ~2026-03-21 (60 days - patterns are stable)
**Fast-moving areas:** None - all patterns use stable React APIs and existing dependencies
