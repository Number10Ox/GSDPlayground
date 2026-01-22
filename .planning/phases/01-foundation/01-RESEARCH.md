# Phase 1: Foundation - Research

**Researched:** 2026-01-21
**Domain:** React web application UI, minimal text-heavy interface, node-based navigation
**Confidence:** HIGH

## Summary

Phase 1 establishes a text-heavy, minimal UI shell with node-based navigation similar to Citizen Sleeper. The standard approach in 2026 is **React + TypeScript + Vite** for the foundation, **Tailwind CSS** for styling (rapid prototyping of multi-pane layouts), and **Framer Motion** for panel slide animations. For the interactive node map, custom SVG with React is the recommended approach over heavy graph libraries.

State management should remain simple: **React Context + hooks** for UI state (current location, panel visibility, theme) and avoid Redux entirely at this stage. The multi-pane dashboard layout uses **CSS Grid for macro layout** (main area + sidebar) and **Flexbox for component internals**.

**Primary recommendation:** Use Vite's `react-ts` template as foundation, Tailwind for styling, Framer Motion's AnimatePresence for sliding panels, and custom SVG components for the node map. Keep state local or in Context—no external state library needed.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 6.x | Build tool & dev server | React's official recommendation (2026), 10x faster than CRA, native ESM |
| React | 19.x | UI framework | Industry standard, component architecture fits multi-pane layout |
| TypeScript | 5.x | Type safety | First-class support in React 19, prevents runtime errors |
| Tailwind CSS | 4.1 | Utility-first CSS | Rapid prototyping, enforces design system, no runtime overhead |
| Framer Motion | 12.x | Animation library | Declarative animations, AnimatePresence for exit animations, layout animations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Router | 7.x | Client-side routing | For screen navigation (character sheet modal, settings) |
| SVGO | Latest | SVG optimization | Pre-process SVG assets to reduce bundle size |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind | CSS Modules | More verbose, harder to prototype, but cleaner JSX |
| Framer Motion | CSS transitions | Lighter bundle, but harder to coordinate complex animations |
| Custom SVG | D3.js / Reagraph | Graph libraries are overkill for static node maps, increase bundle size |

**Installation:**
```bash
# Create project
npm create vite@latest ditv-crpg -- --template react-ts
cd ditv-crpg
npm install

# Add dependencies
npm install tailwindcss postcss autoprefixer framer-motion react-router
npx tailwindcss init -p
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── NodeMap/        # Interactive town node visualization
│   ├── NarrativePanel/ # Sliding text panel for scenes
│   ├── CharacterInfo/  # Stats display component
│   └── ui/             # Primitive components (Button, Card, etc.)
├── pages/              # Top-level views
│   ├── GameView.tsx    # Main dashboard (map + panels)
│   └── CharacterSheet.tsx
├── hooks/              # Custom React hooks
│   └── useGameState.ts # Location, panel visibility
├── types/              # TypeScript definitions
│   └── game.ts         # Location, Character, Scene types
├── assets/             # Static resources
│   └── illustrations/  # Location backdrop SVGs
└── App.tsx             # Root component with Context
```

**Key principles:**
- **Colocate by feature:** NodeMap folder contains SVG logic, types, and subcomponents
- **Types folder for shared definitions:** Avoid `.d.ts` files (puts types in global scope)
- **Maximum 3-4 nested levels:** Flat structure prevents deep imports
- **Single source of truth:** Game state lives in Context, not duplicated

### Pattern 1: Multi-Pane Dashboard Layout

**What:** CSS Grid defines macro layout, Flexbox handles component internals

**When to use:** Top-level layout with distinct regions (map area, sidebar, narrative panel)

**Example:**
```typescript
// GameView.tsx
// Source: CSS Grid dashboard pattern (https://mxb.dev/blog/css-grid-admin-dashboard/)

export function GameView() {
  return (
    <div className="grid grid-cols-[1fr_300px] h-screen gap-4 p-4">
      {/* Main area: node map + narrative panel */}
      <main className="relative overflow-hidden">
        <NodeMap />
        <NarrativePanel /> {/* Slides in from bottom/side */}
      </main>

      {/* Sidebar: character info */}
      <aside className="flex flex-col gap-4">
        <CharacterInfo />
        {/* Cycle indicator, minimal stats */}
      </aside>
    </div>
  );
}
```

**Why Grid + Flexbox:**
- Grid for page-level structure (columns, rows, gaps)
- Flexbox for alignment within grid cells (vertical stacking, centering)
- 97% browser support (2026), production-ready

### Pattern 2: Sliding Panel with AnimatePresence

**What:** Framer Motion's AnimatePresence keeps exiting components in DOM during animation

**When to use:** Any UI element that slides in/out (narrative panel, modals)

**Example:**
```typescript
// NarrativePanel.tsx
// Source: Framer Motion AnimatePresence pattern (https://egghead.io/blog/how-to-create-a-sliding-sidebar-menu-with-framer-motion)

import { motion, AnimatePresence } from 'framer-motion';

export function NarrativePanel({ isOpen, currentScene }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <div className="p-8 max-w-3xl mx-auto">
            <p className="text-[28px] leading-relaxed">
              {currentScene.text}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Why AnimatePresence:**
- Handles exit animations (CSS can't animate unmounting)
- Declarative API (describe end state, not steps)
- Layout animations for complex transitions

### Pattern 3: Context for UI State

**What:** React Context + useReducer for global UI state, local state for components

**When to use:** State shared across multiple components (current location, panel visibility)

**Example:**
```typescript
// hooks/useGameState.ts
// Source: React official docs (https://react.dev/learn/managing-state)

type GameState = {
  currentLocation: LocationId;
  isPanelOpen: boolean;
  currentScene: Scene | null;
};

type GameAction =
  | { type: 'NAVIGATE'; locationId: LocationId }
  | { type: 'OPEN_PANEL'; scene: Scene }
  | { type: 'CLOSE_PANEL' };

const GameContext = createContext<{
  state: GameState;
  dispatch: Dispatch<GameAction>;
} | null>(null);

export function useGameState() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGameState must be used within GameProvider');
  return context;
}
```

**Why Context not Redux:**
- Redux is overkill for UI-only state (down to 10% of new projects in 2026)
- Context + useReducer is built-in, zero dependencies
- Zustand/TanStack Query only needed for server data (not relevant in Phase 1)

### Pattern 4: Interactive SVG Node Map

**What:** React components render SVG elements, handle click events

**When to use:** Custom visualizations with moderate interactivity (node graphs, maps)

**Example:**
```typescript
// components/NodeMap/NodeMap.tsx
// Source: Custom pattern (avoid heavy graph libraries for simple maps)

type Location = {
  id: string;
  x: number;  // SVG coordinate
  y: number;
  label: string;
  illustration: string;  // Asset path
};

export function NodeMap({ locations, currentLocation, onNavigate }) {
  return (
    <svg viewBox="0 0 1000 800" className="w-full h-full">
      {/* Connections between nodes */}
      {connections.map(conn => (
        <line
          key={conn.id}
          x1={conn.from.x}
          y1={conn.from.y}
          x2={conn.to.x}
          y2={conn.to.y}
          className="stroke-gray-600 stroke-2"
        />
      ))}

      {/* Location nodes */}
      {locations.map(loc => (
        <g key={loc.id} onClick={() => onNavigate(loc.id)}>
          <circle
            cx={loc.x}
            cy={loc.y}
            r={30}
            className={cn(
              'cursor-pointer transition-colors',
              loc.id === currentLocation ? 'fill-amber-500' : 'fill-gray-700'
            )}
          />
          <text x={loc.x} y={loc.y + 50} className="text-center text-[16px]">
            {loc.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
```

**Why custom SVG not libraries:**
- D3.js, Reagraph designed for complex, dynamic graphs (force layouts, thousands of nodes)
- This is a static town map with 5-15 locations
- Custom SVG is 10x smaller bundle, full control over styling
- Libraries add complexity without value for simple visualizations

### Anti-Patterns to Avoid

- **Premature abstraction:** Don't create generic component wrappers until you have 3+ use cases
- **CSS Modules with Tailwind:** Tailwind v4 documentation explicitly warns against combining them (scoping conflicts)
- **Inline SVGs in bundles:** Large SVGs bloat JavaScript; use external files or lazy load
- **Deep prop drilling:** If passing state 3+ levels, use Context instead
- **Type `any` in TypeScript:** Use `unknown` or explicit types; `any` defeats type safety

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS reset | Custom normalize.css | Tailwind's Preflight | Handles 30+ browser inconsistencies, tested across all browsers |
| SVG optimization | Manual attribute removal | SVGO CLI | Removes metadata, empty groups, redundant paths—20-50% size reduction |
| Development server | Custom Express + Webpack | Vite | Native ESM, instant HMR, optimized build pipeline |
| TypeScript config | Blank tsconfig.json | Vite's template config | Includes correct module resolution, JSX transform, paths |
| Color contrast checking | Manual hex calculations | Browser DevTools / online checkers | WCAG 2.1 compliance verification (4.5:1 minimum) |
| Animation easing | Custom cubic-bezier | Framer Motion presets | spring, tween, inertia physics are production-tested |

**Key insight:** The "simple" parts of web apps have decades of edge cases. Use battle-tested solutions for fundamentals; innovate on domain logic (game mechanics), not infrastructure.

## Common Pitfalls

### Pitfall 1: Ignoring TypeScript Errors

**What goes wrong:** Using `any` type or `// @ts-ignore` to silence errors, leading to runtime crashes

**Why it happens:** TypeScript errors feel like blockers during rapid prototyping

**How to avoid:**
- Use `unknown` instead of `any` (requires type guards)
- Define prop types with `interface` or `type` for all components
- Enable strict mode in tsconfig.json from day one

**Warning signs:**
- `any` type appearing in code reviews
- Runtime errors that TypeScript could have caught
- Multiple `// @ts-ignore` comments

### Pitfall 2: Over-Nesting Component Structure

**What goes wrong:** Deep folder hierarchies like `src/components/game/map/nodes/LocationNode.tsx` make imports painful

**Why it happens:** Mimicking backend service architecture patterns in frontend

**How to avoid:**
- Maximum 3-4 nested levels
- Colocate by feature (NodeMap folder contains all map-related code)
- Use flat `components/ui/` for primitives, not `components/ui/buttons/primary/large/`

**Warning signs:**
- Import paths with 5+ segments
- Difficulty finding where a component lives
- Renaming folders breaks many imports

### Pitfall 3: Text Size Below WCAG Minimum

**What goes wrong:** Using 16px body text with low contrast (e.g., gray-400 on gray-800), failing accessibility

**Why it happens:** Assumption that "dark theme = aesthetic" without contrast testing

**How to avoid:**
- Minimum 28px for primary text (per requirements)
- 4.5:1 contrast ratio for normal text (WCAG AA)
- Use soft dark grays (not pure black #000000) to prevent eye strain
- Test with Chrome DevTools contrast checker

**Warning signs:**
- Pure white (#ffffff) text on pure black (#000000) background (causes halation)
- Inability to read text on laptop in bright room
- Browser DevTools flagging contrast issues

### Pitfall 4: CSS-in-JS Runtime Overhead

**What goes wrong:** Using styled-components or Emotion causes runtime style injection, slowing down renders

**Why it happens:** Familiarity with CSS-in-JS from older React projects

**How to avoid:**
- Use Tailwind (zero runtime, build-time CSS generation)
- If custom styles needed, use CSS Modules (scoped, no runtime)
- Avoid `styled.div` or `css` prop in this project

**Warning signs:**
- Style tags appearing in `<head>` during runtime
- Slow initial render times
- CSS recalculation in Performance profiler

### Pitfall 5: Animating Width/Height Instead of Transform

**What goes wrong:** Animating `width: 0 → 300px` triggers layout recalculation on every frame (janky)

**Why it happens:** Intuitive to animate the property that visually changes

**How to avoid:**
- Use `transform: translateX()` or `scaleX()` for horizontal slides
- Framer Motion's `layout` prop handles this automatically
- Stick to transform and opacity for 60fps animations

**Warning signs:**
- Choppy animations on lower-end devices
- Performance profiler showing purple "Layout" bars
- Animations slowing down when many elements on screen

### Pitfall 6: Vite Environment Variables Without VITE_ Prefix

**What goes wrong:** Defining `API_URL` in `.env` but `import.meta.env.API_URL` returns `undefined`

**Why it happens:** Vite's security model requires explicit prefix for client-side exposure

**How to avoid:**
- Always prefix client-side vars with `VITE_` (e.g., `VITE_API_URL`)
- Access via `import.meta.env.VITE_API_URL`
- Keep sensitive vars (DB passwords) without prefix (never exposed)

**Warning signs:**
- Environment variables working in Node scripts but not in browser
- Hardcoded URLs in components because env vars don't work
- Confusion between build-time and runtime configuration

## Code Examples

Verified patterns from official sources:

### Tailwind Configuration

```javascript
// tailwind.config.js
// Source: Tailwind v4 docs (https://tailwindcss.com/docs/compatibility)

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'narrative': '28px',  // Primary text size per requirements
      },
      colors: {
        // Soft dark grays for readability (not pure black)
        'background': '#1a1a1a',
        'surface': '#2a2a2a',
      },
    },
  },
  plugins: [],
}
```

### Vite Configuration

```typescript
// vite.config.ts
// Source: Vite official docs (https://vite.dev/guide/)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',  // Import aliasing (@/components/...)
    },
  },
})
```

### TypeScript Configuration

```json
// tsconfig.json
// Source: Vite react-ts template

{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,  // CRITICAL: Enables all strict type checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Accessible Text Styling

```typescript
// components/ui/NarrativeText.tsx
// Source: WCAG 2.1 contrast guidelines (https://webaim.org/articles/contrast/)

export function NarrativeText({ children }: { children: React.ReactNode }) {
  return (
    <p className={cn(
      "text-[28px]",           // Minimum size per requirements
      "leading-relaxed",        // 1.5-1.6 line height for readability
      "max-w-[66ch]",          // 66 characters per line (Bringhurst recommendation)
      "text-gray-100",         // High contrast against dark background
      "font-serif",            // Serif fonts often more readable for long-form text
    )}>
      {children}
    </p>
  );
}
```

### SVG Optimization Script

```json
// package.json scripts
// Source: SVGO best practices (https://github.com/svg/svgo)

{
  "scripts": {
    "optimize-svg": "svgo -f src/assets/illustrations -o src/assets/illustrations/optimized"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Create React App | Vite | 2022-2023 | 10x faster dev server, smaller bundles |
| Redux for all state | Context + hooks for UI state | 2024-2025 | Simpler code, less boilerplate, Redux at 10% adoption |
| CSS-in-JS (styled-components) | Tailwind CSS | 2023-2024 | Zero runtime cost, faster prototyping |
| CSS preprocessors (Sass, Less) | Native CSS + Tailwind | 2024-2025 | Modern browsers support nesting, variables natively |
| Webpack | Vite (Rollup) | 2022-2023 | Native ESM, instant HMR |
| class components + lifecycle | Function components + hooks | 2019-2020 | Simpler code, better reusability |

**Deprecated/outdated:**
- **Create React App:** No longer recommended by React docs (last update 2022)
- **PropTypes:** TypeScript provides compile-time checking, PropTypes are runtime
- **defaultProps:** Deprecated in React 18, use default parameters
- **React.FC:** Removes implicit `children`, use explicit props instead

## Open Questions

Things that couldn't be fully resolved:

1. **Illustration Asset Format**
   - What we know: SVG recommended for scalability, SVGO for optimization
   - What's unclear: Whether to use inline SVG (React components) or external files (`<img src="..." />`)
   - Recommendation: Start with external files (easier to swap), convert to inline only if needing CSS manipulation (e.g., theming illustration colors)

2. **Sidebar Collapse Behavior**
   - What we know: Marked as Claude's discretion in CONTEXT.md
   - What's unclear: User preference for always-visible vs. collapsible
   - Recommendation: Start always-visible (simpler), add collapse if screen real estate becomes issue

3. **Font Selection**
   - What we know: Inter, Roboto, Open Sans are 2026 standards for sans-serif; serif fonts more readable for long-form text
   - What's unclear: Whether to use web-safe fonts (Georgia, Times) or Google Fonts (Merriweather, Lora)
   - Recommendation: Start with system font stack for speed (`font-serif` in Tailwind), evaluate custom fonts if aesthetics require it

## Sources

### Primary (HIGH confidence)
- Vite Official Docs (https://vite.dev/guide/) - Getting started, env variables
- React Official Docs (https://react.dev/learn/build-a-react-app-from-scratch) - Build tool recommendations
- Tailwind CSS v4.1 Docs (https://tailwindcss.com/docs/compatibility) - Current version, compatibility
- WCAG 2.1 Guidelines (https://webaim.org/articles/contrast/) - Contrast requirements
- MDN Web Docs (https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast) - Accessibility standards

### Secondary (MEDIUM confidence)
- [React Vite setup 2026](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2) - Setup walkthrough
- [Tailwind vs CSS Modules 2026](https://medium.com/@imranmsa93/react-css-in-2026-best-styling-approaches-compared-d5e99a771753) - Styling comparison
- [CSS Grid dashboard patterns](https://mxb.dev/blog/css-grid-admin-dashboard/) - Layout examples
- [Framer Motion sliding panel](https://egghead.io/blog/how-to-create-a-sliding-sidebar-menu-with-framer-motion) - AnimatePresence pattern
- [React folder structure 2026](https://www.robinwieruch.de/react-folder-structure/) - Project organization
- [React state management 2026](https://www.developerway.com/posts/react-state-management-2025) - Context vs Redux vs Zustand
- [TypeScript React mistakes](https://www.greatfrontend.com/blog/typescript-for-react-developers) - Common pitfalls
- [SVG optimization React](https://www.dhiwise.com/post/how-to-manage-and-optimize-svgs-with-react-svg-loader) - Performance best practices

### Tertiary (LOW confidence - WebSearch only)
- Various React animation library roundups (2026) - General landscape awareness
- WebSearch results on node graph libraries - Confirmed overkill for this use case

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified with official React and Vite docs, current best practices
- Architecture patterns: HIGH - CSS Grid/Flexbox are stable, Framer Motion patterns verified with examples
- Pitfalls: MEDIUM - Based on common community issues, some extrapolated from training data
- Typography/accessibility: HIGH - WCAG 2.1 is authoritative standard, verified with WebAIM
- State management: MEDIUM - Community consensus (WebSearch), not official guidance

**Research date:** 2026-01-21
**Valid until:** ~2026-03-21 (60 days for stable web standards; React/Vite move slowly)
**Fast-moving areas:** Tailwind updates frequently (check docs if >30 days old), Framer Motion API
