# Phase 1: Foundation - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Player can launch the application and see a text-heavy, readable UI shell with minimal, atmospheric aesthetic. Basic navigation between screens works. This phase establishes the visual foundation and layout system — no game mechanics yet.

</domain>

<decisions>
## Implementation Decisions

### Layout structure
- Multi-pane dashboard with main area + right sidebar
- Town node map IS the main view (Citizen Sleeper style)
- Clicking a location node opens a narrative panel (slides in or expands)
- Current scene prominent in narrative panel, with history access (log button or scroll up)
- Stylized/minimal illustrations for location backdrops — evocative, not literal
- Build illustration component support in this phase (even if using placeholder art)

### Character information
- Minimal persistent stats always visible (small)
- Full character sheet accessible on demand (click/hover to expand)
- Detailed character screen as separate modal/screen

### Navigation
- Citizen Sleeper style node map for town navigation
- Click nodes to travel between locations
- Current location highlighted on map

### Claude's Discretion
- Whether sidebar is always visible or collapsible
- What minimal stats are always visible (dice pool, health/fallout, cycle indicator — Claude decides what's useful without being cluttered)
- Exact panel slide/expand animations
- Color palette and atmospheric mood
- Typography choices (serif vs sans-serif, sizes, spacing)

</decisions>

<specifics>
## Specific Ideas

- "Like Citizen Sleeper where the focus is on the location/town as the central visual element"
- Node map as primary navigation — spatial understanding of the town
- Stylized/minimal art style — simple shapes, limited colors, atmospheric silhouettes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-01-21*
