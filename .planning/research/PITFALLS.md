# Pitfalls Research: Dogs in the Vineyard CRPG

**Domain:** Narrative CRPG with procedural generation, tabletop adaptation
**Researched:** 2026-01-20
**Overall Confidence:** MEDIUM-HIGH (verified against multiple sources)

---

## Executive Summary

This research identifies pitfalls across six critical domains for the DitV CRPG project: procedural generation, tabletop adaptation, narrative design, dice/randomization mechanics, solo adaptation, and the specific challenges of adapting DitV's escalation system. The most critical risks are:

1. **Procedural towns that feel random rather than coherent** - solvable with constraint systems
2. **Escalation mechanics that lose their tabletop tension** - requires careful resource/consequence design
3. **Moral choices that collapse into binary good/evil** - the core DitV problem to solve
4. **Failure spirals in cycle-based resource management** - needs expectation adjustment systems
5. **Loss of GM flexibility in conflict resolution** - requires robust oracle/consequence systems

---

## Procedural Generation Pitfalls

### Critical: The "Ecologically Incoherent" Town Problem

**What goes wrong:** Procedurally generated towns feel like random assemblages of buildings and NPCs rather than communities with internal logic. No Man's Sky's planets are the canonical warning: vast but same-y, with flora/fauna that lack ecological relationships.

**Why it happens:** Generators optimize for variety over coherence. Each element is generated independently without modeling relationships between elements.

**Consequences:**
- Towns feel interchangeable despite surface variety
- Players lose motivation to investigate because "it's just random"
- Sin progressions (DitV's core driver) feel arbitrary rather than inevitable

**Warning signs:**
- NPCs have backstories that don't reference each other
- Town problems don't trace back to specific relationships
- Players describe towns as "procedurally generated" (they notice)

**Prevention:**
1. **Generate relationships first, then characters.** The web of connections (who married whom, who wronged whom, who knows what secret) should precede individual NPC generation.
2. **Use constraint satisfaction.** Define rules about what MUST be true (every town has a sin progression, every sin has a human source, every sinner has a relationship to the victim) and generate within those constraints.
3. **Implement Talk of the Town-style knowledge propagation.** NPCs should know things about each other, with knowledge degrading through gossip chains. This creates investigative gameplay naturally.

**Phase to address:** Foundation phase - town generation architecture must bake this in from the start

**Confidence:** HIGH (verified via academic research on procedural narrative worlds)

**Sources:**
- [Procedural Narrative and How to Make It Coherent](https://newtonarrative.com/blog/procedural-narrative-and-how-to-keep-it-coherent/)
- [Procedural Generation: Golden Ticket or Gilded Cage?](https://www.wayline.io/blog/procedural-generation-golden-ticket-or-gilded-cage)

---

### Critical: The Three Inconsistencies (Continuity, Tone, Pacing)

**What goes wrong:** Procedural narrative systems produce content that contradicts itself, shifts tone jarringly, or has terrible pacing.

**Why it happens:**
- **Continuity:** Events reference things that haven't happened or contradict established facts
- **Tone:** A dark moment of confession followed by comedic banter
- **Pacing:** Three revelations in a row, or long stretches of nothing

**Consequences:** Player immersion breaks. The "it's just a game" feeling takes over.

**Warning signs:**
- NPCs reference events that didn't happen in THIS playthrough
- Dramatic moments land flat because wrong context
- Players report boredom or overwhelm at predictable points

**Prevention:**
1. **Prerequisites and guard clauses.** Every content piece has preconditions that must be satisfied before it can trigger.
2. **Foreshadowing hooks.** Before major revelations, plant earlier hints so discoveries feel earned.
3. **TAPIR method (keyword-based probability).** Selected narrative elements boost likelihood of thematically compatible follow-up content.
4. **Beat structure overlay.** Even with procedural content, enforce a rhythm (investigation -> confrontation -> consequence).

**Phase to address:** Narrative system phase - core architecture decision

**Confidence:** HIGH

**Sources:**
- [Procedural Narrative and How to Make It Coherent](https://newtonarrative.com/blog/procedural-narrative-and-how-to-keep-it-coherent/)
- [GDC Vault - Procedural Narrative Generation](https://www.gdcvault.com/play/1024143/Procedural-Narrative)

---

### Moderate: Player Understanding Gap

**What goes wrong:** The engine knows why NPCs act as they do (emotional states, relationship webs, secrets) but players can't infer this from what they observe. Events seem random or the system seems to be cheating.

**Why it happens:** Internal simulation complexity doesn't translate to observable player-facing content.

**Consequences:** Players assume randomness, lose engagement, feel the game is unfair.

**Prevention:**
1. **Externalize internal state.** If an NPC is angry because of a past event, ensure dialogue or behavior communicates this.
2. **Investigative breadcrumbs.** Provide ways for players to discover the "why" - letters, gossip, observation.
3. **Post-hoc explanation.** After major events, provide some mechanism for players to understand causality.

**Phase to address:** NPC/dialogue system phase

**Confidence:** MEDIUM (single source but logically sound)

---

### Minor: Generator Failure Modes

**What goes wrong:** Either the story over-constrains generation (every town feels the same) or generation ignores story needs (locations don't support the narrative).

**Prevention:**
- Define minimum variety requirements per generation run
- Validate generated content against story support requirements before accepting

**Phase to address:** Testing/iteration phase

---

## Tabletop Adaptation Pitfalls

### Critical: Over-Adherence to Rules as Written (RAW)

**What goes wrong:** Adapting tabletop rules literally rather than capturing what made them fun. Example: Baldur's Gate 3's auto-fail on natural 1 regardless of bonuses feels punishing in a video game context.

**Why it happens:** Developers treat source material as sacred rather than as inspiration. Fear of fan backlash for "changing" beloved systems.

**Consequences:** Mechanics that worked with a human GM's flexibility become frustrating without that flexibility. Players feel punished by random chance.

**Warning signs:**
- Playtesters complain about "unfair" random results
- Edge cases in rules create degenerate gameplay
- Rules that required GM judgment now produce nonsensical outcomes

**Prevention:**
1. **Adapt the EXPERIENCE, not the rules.** DitV's escalation feels tense at the table because of social dynamics and uncertainty. Capture that tension, not the exact dice mechanics.
2. **Identify what the GM papers over.** Every tabletop system has rough edges that a good GM smooths out. List these explicitly and design digital solutions.
3. **Playtest with non-fans.** People unfamiliar with the source will identify friction that fans forgive.

**Phase to address:** Core mechanics phase - fundamental design decision

**Confidence:** HIGH (multiple sources, including Cyberpunk 2077 success story)

**Sources:**
- [The Issues with Adapting Tabletop RPGs to Videogames](https://catscontrollercorner.substack.com/p/the-issues-with-adapting-tabletop)
- [Adapting the mechanics of tabletop RPGs - Wireframe Magazine](https://wireframe.raspberrypi.org/articles/adapting-the-mechanics-of-tabletop-rpgs)

---

### Critical: Loss of GM Flexibility

**What goes wrong:** Tabletop GMs can "react to player actions on the fly, and customise and refocus the adventure quickly" (Chris Avellone). Video games have a finite set of actions and results planned in advance.

**Why it happens:** Fundamental medium difference. No current technology replicates GM creativity.

**Consequences:** Players feel railroaded. Edge cases produce nonsensical results. The "I should be able to do X" frustration.

**DitV-specific risk:** The GM's ability to frame conflicts, introduce complications, and judge "what happens when you push Sister Patience too far" is core to the experience.

**Prevention:**
1. **Robust consequence system.** Pre-author consequences for a wide range of player actions, not just the "expected" path.
2. **Graceful degradation.** When players do something unexpected, have sensible fallback responses rather than breaking.
3. **Constraint acknowledgment.** Be clear about what players can and cannot do. Citizen Sleeper's bounded agency ("Harry is not going to change the balance of political power") is a model.
4. **Oracle systems for edge cases.** Borrowing from Ironsworn: when specific content doesn't exist, procedural systems can generate plausible responses.

**Phase to address:** Conflict resolution system - core architecture

**Confidence:** HIGH

---

### Moderate: The Violence Default

**What goes wrong:** D&D-adjacent games default to violence because combat has the most developed rules. Non-violent conflict resolution feels like "skipping content."

**Why it happens:** Combat systems are deep and tested; social systems are shallow afterthoughts.

**DitV-specific risk:** The escalation system DEPENDS on violence being a meaningful choice, not the default. If combat is the most engaging system, players will skip to gunfighting.

**Prevention:**
1. **Parity of depth.** Social/investigation/rhetoric systems must be as mechanically interesting as violence.
2. **Violence has costs.** Not just mechanical costs but narrative consequences that persist.
3. **Non-violence has rewards.** Unique content/outcomes available only through peaceful resolution.

**Phase to address:** Escalation system design

**Confidence:** HIGH (core DitV design challenge)

**Sources:**
- [On Conflict & Violence - The Dododecahedron](https://dododecahedron.blog/2024/07/27/on-conflict-violence/)

---

## Narrative Game Pitfalls

### Critical: The Illusion of Choice / False Dichotomy

**What goes wrong:** Choices appear meaningful but lead to the same outcome, OR choices are clearly labeled good/evil encouraging single-path optimization.

**Why it happens:**
- Budget constraints make true branching expensive
- Binary morality is easier to design than nuance
- Players min-max if given clear "better" options

**Consequences:**
- Players feel manipulated ("my choices don't matter")
- Replay value collapses
- The moral weight DitV requires evaporates

**DitV-specific catastrophe:** If players can identify the "right answer," the game fails its core premise. The "ultra-conservative values made explicitly, magically correct" critique of tabletop DitV becomes even worse in digital form if the game signals correct choices.

**Warning signs:**
- Playtesters report "obvious" best choices
- Players describe endings as "the good ending" vs "the bad ending"
- Walkthroughs quickly establish optimal paths

**Prevention:**
1. **No karma meters.** Never label choices as good or evil. Never track alignment.
2. **Competing goods.** Choices should be between two things the player values, not good vs evil.
3. **Delayed consequences.** The impact of choices should unfold over time, making optimization difficult.
4. **Situational ethics.** The "right" choice in one context is wrong in another. Context matters more than principle.
5. **Personal cost.** As one analysis notes: "meaningful choices have to cause the player to lose something in order to gain power."

**Phase to address:** Core design principle - must be established before any content creation

**Confidence:** HIGH (extensively documented across multiple sources)

**Sources:**
- [Beyond Good vs. Evil: Crafting Nuanced Morality Systems](https://www.wayline.io/blog/crafting-nuanced-morality-systems-in-video-games)
- [On Binary Moral Choice - Games by Arbitration](https://www.jaredbruett.com/2017/10/29/on-binary-moral-choice/)
- [Dark Side 'Cause It Looks Cool: The Failings of Moral Choice](https://www.engadget.com/2012-02-10-dark-side-cause-it-looks-cool-the-failings-of-moral-choice-in.html)

---

### Critical: Exposition Dumping

**What goes wrong:** Complex setting/backstory delivered in text walls or cutscenes rather than through play.

**Why it happens:** Writers have lots of worldbuilding and want players to appreciate it.

**Consequences:** Players skip text, miss important information, feel lectured.

**DitV-specific risk:** The Faith, the Territorial Authority, the history of each town - lots of setting that could become walls of text.

**Prevention:**
1. **Integrate narrative into investigation.** Players should WANT to read because it advances their goals.
2. **Discoverable lore.** Let players find setting details organically rather than front-loading.
3. **Conflict-relevant exposition only.** Only explain what players need to understand the current situation.

**Phase to address:** Content creation guidelines - writing style guide

**Confidence:** HIGH

**Sources:**
- [Game Narrative Design: Complete Storytelling Guide 2025](https://generalistprogrammer.com/tutorials/game-narrative-design-complete-storytelling-guide-2025)

---

### Moderate: Narrative State Bugs

**What goes wrong:** Testing all choice combinations is exponentially complex. Rare paths have bugs where NPCs reference things that didn't happen, or contradictory states exist.

**Prevention:**
1. **State machine validation.** Automated testing that verifies narrative state consistency.
2. **Scope branching carefully.** Use Pentiment/Nessa Cannon's advice: prioritize consequential + thematic + character identity choices rather than branching everything.
3. **Funnel structure.** Allow divergence but bring paths back together at key moments.

**Phase to address:** Technical architecture - narrative state system design

**Confidence:** MEDIUM

**Sources:**
- [How to build branching narrative without breaking the bank](https://www.gamedeveloper.com/design/how-to-build-branching-narrative-when-you-don-t-have-a-big-budget-)

---

## Dice/Randomization Pitfalls

### Critical: RNG Undermining Player Agency

**What goes wrong:** Players make smart decisions but fail due to bad rolls. Brilliant plans foiled by "plain bad luck." The sense of being "a passenger in a car controlled by a blindfolded squirrel."

**Why it happens:** Tabletop dice work because of social context, GM adjustment, and the joy of physical rolling. Digital RNG feels like the computer cheating.

**Consequences:** Player frustration, disengagement, sense that skill doesn't matter.

**Warning signs:**
- Players complain about "unfair" outcomes
- Players save-scum to retry rolls
- Forum discussions about "rigged RNG"

**Prevention:**
1. **Visible resources before commitment.** Citizen Sleeper's dice are rolled at cycle start and visible. Players allocate known resources rather than gambling.
2. **Dice inform, not determine.** Results should create situations to respond to rather than success/failure gates.
3. **Player agency in risk.** Let players choose how much to stake, with commensurate rewards.
4. **Narrative framing of failure.** "Take failures as canon" - failure should produce interesting outcomes, not dead ends.

**Phase to address:** Core mechanics design

**Confidence:** HIGH (Citizen Sleeper explicitly designed for this)

**Sources:**
- [Randomness in Narrative Games: Player vs Dice](https://newtonarrative.com/blog/randomness-in-narrative-games-player-vs-dice/)
- [How 'Citizen Sleeper' Turns Stress into Intimate Storytelling](https://www.vice.com/en/article/how-citizen-sleeper-turns-stress-into-intimate-storytelling/)

---

### Moderate: RNG as Narrative Disconnection

**What goes wrong:** Random events feel disconnected from the story being told. A dice roll determines something that should be narratively motivated.

**Prevention:**
1. **RNG generates situations, not verdicts.** Use randomness to create narrative opportunities, not to resolve narrative questions.
2. **Weight by narrative context.** Dice results should be interpreted through established fiction.
3. **Emergent storytelling framing.** Position RNG as creating unexpected situations that the narrative must incorporate.

**Phase to address:** Narrative system integration

**Confidence:** MEDIUM

---

## Solo Adaptation Pitfalls

### Critical: Loss of GM's Two Core Functions

**What goes wrong:** Tabletop GMs handle worldbuilding (deciding what's true) and opposition (providing meaningful challenges). Without a human in that role, both functions degrade.

**Why it happens:**
- **Worldbuilding:** No one to adjudicate "is this true in this world?" questions
- **Opposition:** AI/rules can't provide the depth of tactical and narrative opposition a human GM offers

**Consequences:**
- World feels shallow or inconsistent
- Opposition feels gamey or unfair
- Loss of the improvisational magic

**DitV-specific risk:** The GM in DitV frames situations, introduces complications mid-conflict, and judges the moral weight of actions. All of this must be systematized.

**Prevention:**
1. **Oracle systems (Ironsworn model).** Use weighted random tables + player interpretation to answer open questions about the world.
2. **Procedural opposition with personality.** NPCs should have goals, tactics, and limits - not just stat blocks.
3. **Complication triggers.** Pre-authored escalation points that fire based on game state, replacing GM improvisation.
4. **Clear fiction-first framing.** Establish what's true before resolving mechanically.

**Phase to address:** Core GM-replacement architecture - foundational

**Confidence:** HIGH (Ironsworn is proof of concept)

**Sources:**
- [Ironsworn RPG - Tomkin Press](https://tomkinpress.com/pages/ironsworn)
- [Running a Solo Game GM-less - Gnome Stew](https://gnomestew.com/running-a-solo-game-gm-less/)

---

### Critical: Loss of Social Negotiation

**What goes wrong:** DitV conflicts involve social negotiation - "I see your raise and add that I invoke my relationship with Elder Samuel." Solo play removes the human element of judging when a raise is legitimate, when fallout is appropriate, when a block makes sense.

**Prevention:**
1. **Formalize the informal.** What the tabletop handles through social negotiation must have explicit rules.
2. **Generous interpretation.** When ambiguous, favor the player's intent (as a good GM would).
3. **Consequence preview.** Show players what will happen before they commit, reducing "that's not what I meant" moments.

**Phase to address:** Conflict resolution system

**Confidence:** MEDIUM (theoretical, needs testing)

---

### Moderate: Campaign Sustainability

**What goes wrong:** GM-less systems work for one-shots but struggle with long campaigns. The accumulation of state, relationships, and consequences becomes hard to track without a human.

**Prevention:**
1. **State externalization.** Everything important is written/tracked explicitly, not held in memory.
2. **Periodic summarization.** System provides "story so far" recaps.
3. **Episodic structure.** Design for clear arcs with soft resets rather than endless continuity.

**Phase to address:** Campaign/progression system

**Confidence:** MEDIUM

---

## Dogs in the Vineyard Specific Pitfalls

### Critical: Escalation Without Social Stakes

**What goes wrong:** The escalation mechanic (talking -> physical -> fighting -> guns) is brilliant at the table because of social stakes. Players feel the weight of choosing violence in front of their friends. Solo play removes this.

**Why it happens:** Escalation's power comes from the social contract, not the mechanics alone.

**Consequences:** Players escalate casually because it's mechanically optimal and socially costless.

**Prevention:**
1. **Persistent world consequences.** Violence echoes. NPCs remember. The town talks.
2. **Internal character consequences.** Fallout isn't just mechanical - it's psychological, spiritual, relational.
3. **Make de-escalation viable.** Ensure non-violent resolution is mechanically competitive, not just possible.
4. **Witness mechanics.** Who saw what you did? This replaces the social audience of tabletop.

**Phase to address:** Escalation system - core design challenge

**Confidence:** HIGH (well-documented DitV design feature)

**Sources:**
- [The brilliant Raise/See mechanic in "Dogs in the Vineyard"](https://steemit.com/tabletop-rpg/@danmaruschak/the-brilliant-raise-see-mechanic-in-the-tabletop-rpg-dogs-in-the-vineyard)
- [Dogs in the Vineyard Holds Up Fairly Well - Mythcreants](https://mythcreants.com/blog/dogs-in-the-vineyard-holds-up-fairly-well/)

---

### Critical: The "Demons Make It Easy" Problem

**What goes wrong:** In DitV, sin progression brings literal demons. This can make morality feel mechanical - "sin = demons = bad" - rather than genuinely ambiguous.

**Why it happens:** The supernatural enforcement of morality removes moral ambiguity.

**DitV-specific context:** The critique that the game "takes ultra-conservative values and makes them explicitly, magically correct" is a real risk.

**Prevention:**
1. **Ambiguous supernatural.** Are the demons real? Are the Dogs' powers? Leave room for interpretation.
2. **Sin as symptom, not cause.** The sin progression shows community breakdown, but the "demons" could be metaphorical for social decay.
3. **Unreliable cosmology.** The Faith teaches one thing; reality may be more complex.
4. **Focus on human cost.** Whatever the metaphysics, the story is about people hurting people.

**Phase to address:** Setting/cosmology design - early decision

**Confidence:** MEDIUM (interpretive design choice)

---

### Moderate: Conflict System Complexity

**What goes wrong:** DitV's raise/see system is elegant but complex. Converting it to digital may over-simplify (losing depth) or over-complicate (losing accessibility).

**Prevention:**
1. **Prototype early.** Build the conflict system first, playtest extensively before building content around it.
2. **Tutorial integration.** Teach the system through play, not documentation.
3. **Progressive complexity.** Early conflicts can be simpler; full system emerges over time.

**Phase to address:** Core mechanics prototype

**Confidence:** MEDIUM

---

## Resource/Cycle Management Pitfalls

### Critical: Unrecoverable Failure Spirals

**What goes wrong:** In cycle-based games (Citizen Sleeper model), early mistakes compound. Players who fall behind can't catch up. Hours of play end in unavoidable loss.

**Why it happens:** Resource systems naturally create positive feedback loops - the rich get richer, the poor get poorer.

**Warning signs:**
- Players describe feeling "doomed" long before game over
- Optimal strategy becomes "restart if early game goes poorly"
- Mid-game feels like going through the motions

**Prevention:**
1. **Expectation adjustment (RimWorld model).** When things go badly, reduce requirements. Colonists with dead friends have lower expectations.
2. **Rubber-banding.** Hidden systems that help struggling players without feeling like cheating.
3. **Recovery mechanics.** Explicit ways to dig out of holes, even if costly.
4. **Condition zero isn't game over.** Following Citizen Sleeper: hitting rock bottom has consequences but doesn't end play.

**Phase to address:** Cycle/resource system design

**Confidence:** HIGH (well-documented game design principle)

**Sources:**
- [The Art of the Spiral: Failure Cascades in Simulation Games](https://www.gamedeveloper.com/design/the-art-of-the-spiral-failure-cascades-in-simulation-games)
- [The Designer's Notebook: Preventing the Downward Spiral](https://www.gamedeveloper.com/design/the-designer-s-notebook-preventing-the-downward-spiral)

---

### Moderate: Cycle Pressure vs. Investigation Freedom

**What goes wrong:** Citizen Sleeper-style cycle pressure (need to eat, need stabilizer) can conflict with investigation-heavy gameplay. Players feel rushed, can't explore.

**Prevention:**
1. **Pressure as texture, not constraint.** Resources create atmosphere but shouldn't prevent engagement with content.
2. **Investigation advances resources.** Finding information should provide material benefits, not just narrative progress.
3. **Safe harbors.** Moments/locations where pressure pauses, allowing exploration.

**Phase to address:** Cycle system tuning

**Confidence:** MEDIUM

---

## Text-Heavy Browser Game Pitfalls

### Moderate: Wall of Text Fatigue

**What goes wrong:** Text-heavy games overwhelm players with prose. Even good writing becomes exhausting in quantity.

**Why it happens:** Writers (understandably) want players to appreciate their work.

**Prevention:**
1. **Chunking.** Break text into digestible pieces with player agency between.
2. **Visual rhythm.** Vary text presentation - dialogue, description, internal monologue styled differently.
3. **Skip options.** Let players control pace without punishing them for speed-reading.

**Phase to address:** UI/presentation design

**Confidence:** MEDIUM

**Sources:**
- [Text Adventure Game Design in 2020](https://medium.com/@model_train/text-adventure-game-design-in-2020-608528ac8bda)
- [Text-Based Game Design Principles](https://gamedesignskills.com/game-design/text-based/)

---

### Minor: Unwinnable States

**What goes wrong:** Player actions can remove required items or create logically unwinnable situations.

**Prevention:**
1. **No unwinnable states by design.** Every action should leave some path forward.
2. **Multiple solution paths.** If one approach is blocked, others remain.
3. **Graceful failure.** If truly stuck, provide escape valve (time passes, situation changes).

**Phase to address:** Narrative design - content guidelines

**Confidence:** HIGH (classic adventure game lesson)

---

## Prevention Strategy Summary

### Phase 1 - Foundation
- Establish "no karma meter" principle before any content
- Design relationship-first town generation
- Prototype escalation system early
- Build oracle systems for GM-replacement

### Phase 2 - Core Systems
- Implement visible resource allocation (Citizen Sleeper dice model)
- Create consequence tracking for violence
- Build narrative state validation
- Design expectation adjustment for failure spirals

### Phase 3 - Content Creation
- Write to beat structure overlay
- Implement prerequisite/guard clause system
- Create foreshadowing hooks
- Test all choice combinations automatically

### Phase 4 - Polish
- Tune cycle pressure vs. exploration freedom
- Playtest with non-DitV-fans
- Verify no "obvious best choices" emerge
- Test failure recovery paths

---

## Confidence Assessment

| Domain | Confidence | Notes |
|--------|------------|-------|
| Procedural Generation | HIGH | Extensive academic + industry sources |
| Tabletop Adaptation | HIGH | Multiple documented cases (BG3, Cyberpunk) |
| Narrative Design | HIGH | Well-documented industry knowledge |
| Dice/Randomization | HIGH | Citizen Sleeper case study + theory |
| Solo Adaptation | MEDIUM-HIGH | Ironsworn proof of concept, less digital examples |
| DitV-Specific | MEDIUM | Theoretical, needs prototyping to validate |
| Resource/Cycles | HIGH | RimWorld, Citizen Sleeper documented |
| Text-Heavy Games | MEDIUM | Less systematic research, more anecdotal |

---

## Open Questions for Phase-Specific Research

1. **How should the DitV raise/see system translate to solo digital play?** Needs prototyping.
2. **What is the right balance of procedural vs. authored town content?** Needs testing.
3. **How do we preserve moral ambiguity when game state is deterministic?** Core design challenge.
4. **What oracle structures work best for replacing GM judgment?** Ironsworn provides a model but DitV has different needs.
