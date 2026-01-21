# Dogs in the Vineyard CRPG

## What This Is

A web-based single-player CRPG adaptation of the tabletop RPG "Dogs in the Vineyard." You play as a Dog — a young religious troubleshooter in a frontier territory inspired by pre-statehood Utah — traveling alone from town to town, uncovering sin and corruption, and deciding how to set things right. Gameplay combines Citizen Sleeper's dice-allocation-per-cycle structure with DitV's distinctive escalation-based conflict resolution.

## Core Value

The player must be able to arrive in a procedurally generated town, discover its moral rot through investigation and NPC interaction, and resolve conflicts using the escalating stakes system — experiencing the weight of judgment that defines Dogs in the Vineyard.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Procedural town generation using DitV sin progression (Pride → Injustice → Sin → Demonic Attacks → False Doctrine → Sorcery → Hate and Murder)
- [ ] Daily cycle system with dice pool allocation (Citizen Sleeper-inspired)
- [ ] NPC system with relationships, secrets, and stakes in the town's problems
- [ ] Investigation mechanics — uncover the root pride and its consequences
- [ ] DitV escalation conflict system (talking → physical → fighting → gunplay)
- [ ] Raise and See mechanic adapted for single-player
- [ ] Fallout system — consequences from conflicts affect your Dog
- [ ] Town resolution — complete a town and move to the next
- [ ] Character stats and traits for the player's Dog
- [ ] Clock system for advancing threats and NPC agendas
- [ ] Text-heavy, minimal UI with atmospheric presentation

### Out of Scope

- Multiplayer / party of Dogs — this is a solo Dog experience
- Mobile-native app — web browser is the target platform
- Voice acting or extensive animation — text-focused presentation
- Map/overworld exploration — focus is on the town experience, not travel between towns
- Pixel art or illustrated scenes — minimal visual style like Citizen Sleeper

## Context

**Source Material:**
- Dogs in the Vineyard by D. Vincent Baker (2004) — the tabletop RPG being adapted
- Full text available in ~/Downloads/ditv.txt
- Key mechanics: escalation-based conflict, Raise/See bidding, Fallout, town creation via sin progression

**Gameplay Inspiration:**
- Citizen Sleeper — dice pool per cycle, allocation choices, clocks, narrative branching, text-heavy UI

**Setting:**
- Faithful adaptation of DitV setting: The Faith (based on early Mormon frontier communities), the King of Life, Dogs as religious authority figures
- Utah-inspired landscape: mountains, scrublands, isolated towns
- Time period feel: pre-Civil War American frontier

**Town Structure:**
- Some towns are simmering mysteries (problem hidden beneath the surface)
- Some towns are already in open crisis
- Each town has a root pride that has cascaded into deeper problems
- NPCs have positions on the conflict, relationships to each other, things they want

## Constraints

- **Tech stack**: Web browser (HTML/CSS/JavaScript) — must be accessible without installation
- **Solo adaptation**: Must translate the tabletop's group dynamics to single-player without losing the moral weight
- **Procedural towns**: Town generation must produce coherent moral situations, not just random elements
- **DitV mechanics**: Escalation and Fallout systems must feel meaningful — the choice to pull a gun should matter

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Solo Dog (not party) | Lonelier, more personal journey; simpler to implement | — Pending |
| Procedural generation (not handcrafted towns) | Replayability; mirrors how GMs create towns in tabletop | — Pending |
| Faithful DitV setting (not genericized) | The specific religious context gives the moral dilemmas their weight | — Pending |
| Citizen Sleeper-style cycles | Proven model for narrative dice games; fits DitV's "days in town" structure | — Pending |

---
*Last updated: 2026-01-20 after initialization*
