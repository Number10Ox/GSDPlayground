# Phase 5: Investigation - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Player can investigate NPCs to discover the town's sin progression and find resolution paths. This phase delivers the NPC dialogue system (AI-generated with guardrails), information revelation mechanics, sin progression discovery tracking via mental map, and resolution through player action. Town generation itself is Phase 6.

</domain>

<decisions>
## Implementation Decisions

### Dialogue System Architecture
- AI-generated dialogue with guardrails (LLM constrained by NPC knowledge/personality templates)
- NPCs cannot reveal information they shouldn't know — trust level + knowledge tags enforce this
- Game backend/proxy for LLM API calls (serverless functions — Vercel/Netlify/Lambda)
- LLM provider: Claude's discretion (design with configurable provider abstraction)
- DitV period voice: frontier religious community language, biblical cadence, "Brother"/"Sister" address

### Conversation Interaction Flow
- Sequential selection: player picks TOPIC first, then APPROACH for that topic
- Approach types are stat-linked: Acuity (observe/deduce), Heart (empathize/comfort), Body (intimidate/pressure), Will (command/preach)
- Character stats flavor the delivery — higher stats make approaches more effective
- AI generates both the player's actual spoken words and the NPC's response
- Brief exchanges: 2-3 back-and-forth per conversation, pick up fragments across visits

### Conversation UI
- Dedicated dialogue view (separate from narrative panel, takes more screen space)
- NPC displayed with simple icons/silhouettes (not portraits, not text-only)
- Typewriter narrative display: prose-style text, not chat bubbles
- Subtle UI indicator for approach effectiveness (color tint or icon, not explicit numbers)
- Topic chips + approach chips as sequential UI steps below the narrative

### Inner Voice System
- Stat-based inner voice interjections during dialogue (like Disco Elysium)
- Highest stat occasionally chimes in: Acuity notices inconsistencies, Heart reads emotions, Body sizes up threats, Will senses moral weight
- Generation approach: Claude's discretion

### Information Revelation
- Trust level sets ceiling of what NPC CAN share; approach determines what they WILL share from that pool
- Topics come from context + knowledge: some always available (greetings, town), others unlock from discoveries, location-specific topics available contextually
- Bottom-up discovery is natural flow, but multiple NPCs provide different angles on the sin chain
- End-of-conversation discovery summary: brief moment showing what was learned and new mental map connections

### Mental Map
- Visual approach: Claude's discretion (node graph, layered view, or hybrid)
- Updates after conversations via discovery summary
- Shows sin chain advancing as escalation progresses
- Also serves as escalation visibility — narrative hints in dialogue PLUS visual progression on map

### Fatigue Clock (Cycle Economy)
- Investigation uses fatigue clock instead of dice allocation
- Dice reserved for conflicts — two parallel resource systems
- Conversations cost fatigue segments; fatigue fills → cycle ends
- Segment count and cost balance: Claude's discretion
- NPCs always available at their locations (no schedules)

### Conflict Triggering
- Approach-triggered: confrontational approaches (Body/Will) can escalate into conflicts if NPC resists
- Direct escalation: no warning, player knew the risk when choosing forceful approach
- Flows directly from dialogue into existing conflict system

### Sin Progression & Escalation
- Sin structure: Claude's discretion (linear chain or branching)
- Escalating time pressure: each cycle without resolution advances the sin
- New consequences appear, NPCs get more desperate
- Early escalation = forced confrontation; late escalation (near Murder) = tragedy unfolds
- Visibility: narrative hints always present + mental map shows sin chain advancing

### Resolution
- Emerges from player actions (DitV style) — no explicit "choose resolution" moment
- Target-based resolution paths: player decides WHO to address as "the problem"
- Game tracks which links in sin progression have been confronted/resolved
- Town resolved when root sin is addressed (even if imperfectly)
- Summary + ride on: resolution shows what happened to each NPC, then Dog leaves

### NPC Social Dynamics
- NPC reactions to confrontations: Claude's discretion
- Key moments memory: NPCs remember significant actions (conflicts, accusations, help) but casual chat resets
- Existing NPC memory system (Phase 3) carries forward

### Testing Strategy
- E2E tests use mocked/stubbed LLM responses (deterministic, no API costs)
- Tests verify UI flow and interaction mechanics, not AI quality

### Claude's Discretion
- LLM provider choice and prompt engineering approach
- Mental map visual design (node graph vs layered vs hybrid)
- Fatigue clock segment count and activity costs
- Inner voice generation method (AI-generated vs pre-authored templates)
- Sin progression structure (linear chain vs branching tree)
- NPC social consequence propagation
- Location-based evidence (searchable locations vs NPC-only discovery)
- Items in dialogue utility (Book of Life as approach modifier or conflict-only)
- API error handling approach
- NPC personality expression (mood + personality vs tags only)
- Backend technology specifics within serverless constraint

</decisions>

<specifics>
## Specific Ideas

- "Citizen Sleeper style" pacing — dice/clocks drive real choices, dialogue is flavor within that
- "Disco Elysium style" inner voice — stats as personality aspects that comment on situations
- Approach + topic sequential selection (not simultaneous)
- DitV faithful: the Dog IS the authority, whatever they decide is the resolution
- No "game over" from escalation — tragic outcomes are consequences, not failure states
- Player picks up fragments across brief exchanges, piecing together the picture over multiple cycles

</specifics>

<deferred>
## Deferred Ideas

- Town generation (sin templates, NPC relationships) — Phase 6
- Save/load system — Phase 7
- NPC schedules/time-of-day presence — potential future enhancement
- AI-generated character portraits — out of scope for now
- Free text player input — opted for topic chips instead
- Consequences revealed in next town (reputation carrying forward) — potential Phase 6/7 feature

</deferred>

---

*Phase: 05-investigation*
*Context gathered: 2026-01-22*
