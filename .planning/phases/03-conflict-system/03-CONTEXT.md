# Phase 3: Conflict System - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Player engages in escalating conflicts using Dogs in the Vineyard raise/see mechanics. Escalation moves through four levels (Just Talking, Physical, Fighting, Gunplay), each adding dice but increasing fallout risk. Fallout is revealed at conflict end. NPCs remember violent conflicts, affecting future interactions.

</domain>

<decisions>
## Implementation Decisions

### Escalation confirmation
- Internal monologue style for escalation confirmation — "Your hand moves toward the gun. Once drawn, there's no taking it back."
- Hand-written set of 3-5 monologues per escalation level, randomly selected
- Gunplay gets extra weight — longer pause, different confirmation emphasizing lethality
- Escalation is one-way within a conflict (true to DitV) — no de-escalation possible

### Visual escalation indicators
- Both color progression AND explicit level labels
- DitV canonical names: "Just Talking", "Physical", "Fighting", "Gunplay"
- Color atmosphere shift from calm to intense (palette at Claude's discretion)
- Screen flash/pulse animation when escalating, then settle into new color state
- Ambient coloring extends beyond conflicts — locations with high tension/recent violence retain tint

### Escalation tracking
- Split tracking (faithful to DitV) — show both player and NPC escalation levels
- Player at "Just Talking" vs NPC at "Gunplay" creates visible moral contrast
- Participants can be at different levels; highest level determines fallout

### New dice presentation
- Dramatic entrance when escalation adds dice — roll onto screen with animation
- Emphasizes power gained at a cost
- No audio for now — focus on visual design first

### NPC escalation
- Observation mode — player sees NPC escalate from outside ("They reach for their gun.")
- Less ceremonial than player escalation — no internal monologue for NPCs

### Fallout visibility
- Hidden until conflict resolved (faithful to DitV rolling-after-the-fact)
- No visible risk indicator during escalation choices

### Conflict resolution recap
- Both layers: stakes outcome first, then relational/fallout consequences
- Stakes outcome: "You [won/lost] [the stakes]. The cost: [fallout summary]."
- Relationship impact: "Brother Ezekiel will remember this violence."

### NPC conflict history markers
- Small icon overlay on NPC character representation (crossed weapons, broken trust mark)
- Also shown in relationship panel with more detail
- At-a-glance awareness of history with each NPC

### Claude's Discretion
- Exact color palette progression (calm to intense)
- Witness tracking and markers (direct participants vs witnesses)
- Loading/transition animation details
- Specific internal monologue text content
- Error state handling

</decisions>

<specifics>
## Specific Ideas

- Escalation should feel like a moral threshold crossing, not a power-up
- The visible split between player and NPC escalation levels creates interesting moral moments
- Town "remembers" violence through ambient coloring — consequences are environmental

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-conflict-system*
*Context gathered: 2026-01-22*
