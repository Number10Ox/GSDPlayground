# Phase 4: Character System - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Player's Dog has meaningful stats, traits, and inventory that affect gameplay. Stats contribute dice to conflict pools, traits can be invoked mid-conflict for bonus dice, inventory items are usable in conflicts, and NPC relationships provide dice in relevant situations. Character creation uses DitV-style point-buy allocation.

</domain>

<decisions>
## Implementation Decisions

### Stat display
- Always-visible in sidebar — player always knows their stat dice
- Visual dice icons (die shapes with count) rather than text notation or abstract numbers
- Symbolic/thematic icons for each stat (western-religious: lantern for Acuity, fist for Body, heart for Heart, cross for Will)
- Show base + modifier when stats are temporarily reduced (e.g., "2d6 (-1d6)" from injury)
- During conflicts, inactive stats dim — draws focus to contributing stats

### Dice pool sourcing
- Dice in pool grouped by source, each group marked with a small icon (not text label)
- Icons distinguish stat dice, trait dice, item dice, relationship dice

### Character creation
- DitV point-buy: player distributes dice across 4 stats (Acuity, Body, Heart, Will) from a fixed pool
- Players choose die sizes for each stat allocation

### Trait invocation
- Mid-conflict invocation (DitV-faithful): during a raise or see, player can declare a trait to add its dice
- Traits are optional bonuses narrated into the fiction, not auto-applied

### Claude's Discretion
- Stat allocation UI style (drag vs buttons vs other)
- Trait placement in sidebar (alongside stats vs separate section)
- Trait invocation limit per action (one vs unlimited vs balanced)
- Pool breakdown preview before conflicts (full itemization vs summary)
- Exact icon choices for each stat

</decisions>

<specifics>
## Specific Ideas

- "I'd like to replicate what Dogs does" — faithful to DitV character creation and trait mechanics
- Traits declared mid-conflict during raises/sees, not pre-conflict auto-added
- Stats use western-religious iconography fitting the DitV setting

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-character-system*
*Context gathered: 2026-01-22*
