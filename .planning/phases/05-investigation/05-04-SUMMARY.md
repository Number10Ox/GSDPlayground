---
phase: 05-investigation
plan: 04
subsystem: ui
tags: [react-flow, graph-visualization, node-edge, mental-map, investigation]

# Dependency graph
requires:
  - phase: 05-01
    provides: InvestigationState, SinNode types, sinProgression, discoveries
  - phase: 04-character-system
    provides: useNPCMemory hook, NPC type with name/role
provides:
  - MentalMap React Flow visualization component
  - useMentalMap hook converting investigation state to graph
  - Custom sin/NPC node components with severity-based styling
  - Custom animated edge component for chain and NPC connections
affects: [05-06-integration, future-investigation-ui]

# Tech tracking
tech-stack:
  added: ["@xyflow/react"]
  patterns: ["custom-node-types", "custom-edge-types", "memoized-graph-conversion"]

key-files:
  created:
    - src/hooks/useMentalMap.tsx
    - src/components/MentalMap/MentalMap.tsx
    - src/components/MentalMap/SinNode.tsx
    - src/components/MentalMap/NPCNode.tsx
    - src/components/MentalMap/ConnectionEdge.tsx
  modified:
    - package.json

key-decisions:
  - "Manual layout (x/y positioning) for sin chain and NPC nodes - avoids dagre/force layout complexity for MVP"
  - "getStraightPath for edges (simpler than bezier for vertical chain + horizontal NPC links)"
  - "Severity color gradient: amber(pride/injustice) -> orange(sin/demonic) -> red(doctrine/sorcery) -> dark-red+glow(murder)"
  - "NPC nodes only render when linked sin is discovered (prevents spoilers)"

patterns-established:
  - "Custom React Flow node pattern: NodeProps with data cast to typed interface"
  - "Graph state sync: useMentalMap produces data, MentalMap syncs via useEffect"
  - "Severity theming: SEVERITY_COLORS record maps SinLevel to Tailwind classes/hex colors"

# Metrics
duration: 4min
completed: 2026-01-22
---

# Phase 5 Plan 4: Mental Map Visualization Summary

**React Flow node-edge graph showing DitV sin progression chain with severity-colored nodes and NPC connections, reactive to investigation state**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-22
- **Completed:** 2026-01-22
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Interactive knowledge graph with sin chain displayed as vertical node column
- NPCs appear as connected pill-shaped nodes when their linked sin is discovered
- Three visual states per sin node: undiscovered (???), discovered (severity-colored), resolved (green+checkmark)
- Custom animated edges distinguish chain connections from NPC links by thickness and color

## Task Commits

Each task was committed atomically:

1. **Task 1: Install React Flow and create mental map hook** - `dea7262` (feat)
2. **Task 2: Mental map components with custom nodes** - `dab479b` (feat)

## Files Created/Modified
- `src/hooks/useMentalMap.tsx` - Hook converting investigation state to React Flow nodes/edges with memoization
- `src/components/MentalMap/MentalMap.tsx` - React Flow wrapper with custom type registration, pan/zoom, dark theme
- `src/components/MentalMap/SinNode.tsx` - Custom node with severity gradient coloring and 3 visual states
- `src/components/MentalMap/NPCNode.tsx` - Pill-shaped NPC node with discovered/undiscovered states
- `src/components/MentalMap/ConnectionEdge.tsx` - Custom edge with chain (thick, colored) and NPC (thin, gray) variants
- `package.json` - Added @xyflow/react dependency

## Decisions Made
- Manual node positioning (x=300 for sins, x=550 for NPCs, y=i*120) instead of automatic layout algorithms - simpler for MVP, predictable for 5-10 nodes
- getStraightPath for edges rather than bezier curves - cleaner for the vertical chain + horizontal branch layout
- Severity color gradient from amber through orange to red with glow on hate-and-murder - intuitive escalation visualization
- NPC nodes filtered in hook (not rendered when sin undiscovered) rather than hidden via CSS - prevents DOM leaks of undiscovered content
- proOptions.hideAttribution to remove React Flow watermark for clean game UI

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- MentalMap component ready to be wired into GameView (plan 05-06 integration)
- useMentalMap hook reactive to investigation state changes via useInvestigation context
- All data-testid attributes in place for E2E testing when integration plan adds tests

---
*Phase: 05-investigation*
*Completed: 2026-01-22*
