# Phase 2: Cycle System - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Player experiences complete daily cycles with dice allocation decisions. This phase delivers the Citizen Sleeper-inspired "wake, allocate, resolve, rest" loop. Conflict mechanics (escalation, raise/see, fallout) are Phase 3 — this phase creates the pacing structure that leads to conflicts.

</domain>

<decisions>
## Implementation Decisions

### Allocation Interaction
- Click-to-assign: click a die to select it, click an action to assign it
- Freely reversible: player can unassign any die before confirming cycle
- Click die on action to return it to pool (not undo button)
- Assigned dice appear stacked on their action (visual grouping)
- Full keyboard flow: Tab through dice, arrow keys for actions, Enter to assign
- When action is full (if limits exist), it becomes unclickable and visually muted

### Dice Pool Presentation
- Pool appears as a tray along the bottom of the screen
- Mixed dice types (d4, d6, d8, d10) supported from the start — faithful to DitV
- Blind allocation: player doesn't see outcome until resolution — creates tension

### Actions
- Unavailable actions shown with lock icon; clicking reveals requirement
- Some free actions (movement, observation) that don't consume dice
- Meaningful actions cost dice

### Cycle Flow
- Day ends when dice exhausted OR player chooses to rest early
- Cycle flow should feel thematically appropriate to DitV (deliberate judgment, not rushed)
- Summary screen between cycles showing what advanced/changed — skippable

### Clocks
- Some threat clocks advance automatically each cycle (creates urgency)
- Other clocks only advance when triggered by actions/events

### Mechanics Philosophy
- Citizen Sleeper for pacing (daily dice allocation), DitV-faithful for conflicts
- Time pressure AND resource allocation are both important
- Escalation drama (the heart of DitV) lives in Phase 3 Conflict System

### Claude's Discretion
- Die selection visual feedback (lift/glow, border, etc.)
- Whether actions define dice slots vs player-chosen quantity
- How confirm/resolve cycle flow works (explicit button vs auto)
- Dice face display (numeric vs pips)
- Number key shortcuts for dice selection
- Focus indicator visibility approach
- Escape key behavior
- Whether actions are location-based (node map) or global menu
- Value thresholds vs quantity-only for action requirements
- How cycle/conflict dice pools relate (consume vs separate)
- How clocks create pressure toward confrontation
- Whether resting with unused dice provides a bonus
- Summary screen information layout and pacing

</decisions>

<specifics>
## Specific Ideas

- "The gameplay should be a faithful recreation of Dogs in the Vineyard mechanisms, with adjustments only where tabletop-to-digital translation requires it"
- Escalation is the heart of DitV: "How far do you want to take this to get your way? Going too far, you win, but there's a cost"
- Clock pressure should make players feel they can't investigate forever — must eventually act/confront

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-cycle-system*
*Context gathered: 2026-01-21*
