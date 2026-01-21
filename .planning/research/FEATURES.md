# Feature Landscape: Dogs in the Vineyard CRPG

**Domain:** Narrative CRPG / Dice-based story game
**Reference Games:** Citizen Sleeper, Disco Elysium, 80 Days, Sorcery!, Sovereign Syndicate, Wildermyth
**Researched:** 2026-01-20
**Overall Confidence:** HIGH (based on multiple verified sources and direct game documentation)

---

## Table Stakes

Features users expect from narrative dice-based CRPGs. Missing these makes the product feel incomplete or frustrating.

### Core Gameplay Loop

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Dice/randomness visualization** | Genre-defining; players expect to see the roll | Medium | Citizen Sleeper shows dice at cycle start; Disco Elysium shows percentage and roll result. Must feel tactile and meaningful. |
| **Clear success/failure feedback** | Players need to understand outcomes | Low | Show what happened and why. Disco Elysium excels at making failures interesting. |
| **Resource management** | Creates tension and decision-making | Medium | Citizen Sleeper: energy/stabilizer. 80 Days: money/health/time. DitV: dice pools and fallout. |
| **Meaningful choices with consequences** | Core genre expectation post-Witcher 3, Disco Elysium | High | Consequences must feel proportional and logical. Avoid "illusion of choice" trap. |
| **Character stats/skills affecting outcomes** | RPG fundamental | Medium | Stats should unlock dialogue options AND modify success chances. |
| **Save system with manual + autosave** | Players expect to save progress at will | Medium | Web games especially need robust localStorage/cloud save. Include save-on-exit. |

### Narrative Presentation

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Readable, comfortable text** | Text-heavy game = text must be comfortable | Low | 28px minimum on desktop. High contrast. Line length 50-80 chars. |
| **Text size customization** | Accessibility table stakes | Low | Multiple size options, not just one toggle. |
| **Dialogue history/log** | Players miss text, need to review | Low | Scrollable log of recent exchanges. Critical for narrative games. |
| **Clear indication of choices** | Players must know when they're choosing | Low | Visual distinction between narrative text and choice buttons. |
| **Progress indicators** | Know where you are in the story | Medium | Citizen Sleeper uses clocks. Must show both player progress and world state. |

### UI/UX Fundamentals

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Responsive layout** | Web game = multiple screen sizes | Medium | Must work on tablet and desktop at minimum. |
| **Pause/resume capability** | Web games get interrupted constantly | Low | Must handle tab switching, browser closing gracefully. |
| **Settings menu** | Standard expectation | Low | Audio, text size, accessibility options. |
| **Tutorial/onboarding** | Players need to understand mechanics | Medium | Can be integrated into first town/scenario. Citizen Sleeper does this well. |
| **Loading indicators** | Web latency expectation | Low | Any loading must communicate progress. |

### Accessibility Minimums

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **High contrast mode** | Visual accessibility | Low | Dark/light themes with sufficient contrast ratios. |
| **Keyboard navigation** | Accessibility + power users | Medium | All actions reachable without mouse. |
| **Screen reader compatibility** | Accessibility best practice | Medium | Semantic HTML, ARIA labels for interactive elements. |

---

## Differentiators

Features that would make this game special. Not expected, but would set it apart from competitors.

### DitV-Specific Mechanics (High Value)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Escalation conflict system** | Unique to this game; defines DitV identity | High | Talking -> Physical -> Fighting -> Guns. Each escalation adds dice AND increases fallout risk. Core differentiator. |
| **Raise/See mechanic visualization** | Novel poker-style bidding in narrative context | High | Show dice allocation, make "seeing" with 3+ dice feel dangerous. |
| **Fallout as consequence** | Wounds/consequences from conflict style | Medium | Fallout severity depends on escalation level. Gunfights kill; arguments scar. |
| **Moral judgment as gameplay** | Players ARE the law, must render judgment | High | No "right answer" - player decides what sins deserve what punishment. |
| **Sin progression system** | Procedural town generation with escalating problems | High | Pride -> Injustice -> Sin -> Demonic Influence. Each town at different stage. |

### Citizen Sleeper-Style Mechanics (High Value)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Cycle-based time structure** | Clear turn structure with resource refresh | Medium | Each cycle: get dice, allocate, resolve, world advances. |
| **Progress clocks** | Visual tracking of multiple concurrent storylines | Medium | BitD-style clocks: specific events, not abstract states. Fill = thing happens. |
| **Drives over quests** | Player-directed narrative discovery | Medium | Show available storylines, let player choose which to pursue. |
| **Condition affecting resources** | Degradation/recovery mechanic | Medium | In DitV context: relationship strain, spiritual burden, physical injury affecting dice pool. |

### Narrative Innovation

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Failure as interesting narrative** | Disco Elysium's biggest innovation | Medium | Failed checks unlock unique dialogue/story beats. Never punish-only. |
| **Internal monologue/competing voices** | Character depth like Disco Elysium skills | High | Dog's faith, doubt, compassion as "voices" providing commentary. |
| **Procedural town generation** | High replayability | Very High | Towns with different sin stages, NPC configurations, relationship webs. |
| **NPC relationship web** | Who knows whom, who sins against whom | High | Visualize connections. Solving one problem affects others. |
| **Consequence cascades** | Your judgment ripples through community | High | Save the sinner -> victim's family angry. Execute sinner -> orphaned children. |

### Presentation Polish

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Atmospheric audio design** | Immersion in Western frontier setting | Medium | Ambient soundscapes, music cues for tension/resolution. |
| **Visual novel-style character portraits** | Character recognition and emotional connection | Medium | Even simple illustrations add significant presence. |
| **Animated dice/clock interactions** | Tactile feel despite web platform | Medium | Satisfying animations for dice roll, clock tick, escalation. |
| **Day/night cycle visualization** | Reinforce cycle-based gameplay | Low | Visual indicator of time passing each cycle. |

### Replayability

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Multiple town variations** | Fresh content each playthrough | High | Procedural generation of NPCs, sins, relationships. |
| **Legacy/meta-progression** | Reward for multiple playthroughs | Medium | Wildermyth-style character persistence or unlockable traits. |
| **Different Dog backgrounds** | Character creation affecting story | Medium | Hometown, conversion story, mentor relationship. |
| **Branching storyline pools** | See different content each run | High | Wildermyth approach: pool of events, randomly selected. |

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Combat mini-game** | DitV is about moral choices, not tactics. Combat-focused design undercuts the theme. | Make conflict resolution the "combat" - the escalation system IS the game. |
| **Good/evil morality meter** | Binary morality undermines DitV's moral complexity. Players should struggle with judgment. | Show consequences, not alignment scores. Let the world react, not a meter. |
| **Extensive character customization** | Wastes dev time; genre expects narrative depth, not appearance options. | One or two meaningful Dog background choices. Save complexity for story. |
| **Inventory management** | 80 Days shows trading works, but DitV isn't about stuff. Belongings in DitV are narrative tools. | Simple coat/book/gun as story-significant items, not loot system. |
| **Grinding/XP farming** | Antithetical to narrative pacing. Players shouldn't replay content for stats. | Skills develop through story choices, not repetition. |
| **Minimap/waypoints** | Text-heavy game; unnecessary UI complexity. | Textual descriptions of locations. Simple location list if needed. |
| **Achievements/trophies** | Gamification undermines moral weight. "Achievement: Executed 10 sinners" is tone-deaf. | If any, purely narrative milestones. Probably skip entirely. |
| **Multiplayer** | Scope explosion. DitV works solo; adding multiplayer delays everything. | Single-player only. Period. |
| **Voice acting** | Expensive, limits iteration, constrains text changes. Text-heavy game should lean into text. | Excellent writing and text presentation instead. |
| **Procedural text generation (LLM)** | Quality control nightmare. Tone consistency impossible. | Hand-written content with procedural selection/variation. |
| **Complex animation/sprites** | Web platform limitations; dev time sink. | Static illustrations, text focus, meaningful small animations. |
| **Permadeath without mitigation** | Frustrating for narrative players. | Consequences, not erasure. Fallout system already provides stakes. |
| **Timed choices** | Stresses players, causes accidental selections, accessibility issue. | Let players think. Tension comes from consequences, not timers. |
| **Crafting system** | Off-theme. Dogs aren't crafters. | If needed, acquire items through story (gift from grateful townsperson). |

---

## Feature Dependencies

Understanding what requires what for proper phase ordering.

```
FOUNDATION (must build first):
  Cycle/Turn System
    |
    +-- Dice Pool Generation
    |     |
    |     +-- Dice Allocation UI
    |           |
    |           +-- Action Resolution
    |
    +-- Time/Cycle Advancement
          |
          +-- Progress Clocks
          +-- Resource Refresh

CONFLICT SYSTEM (core differentiator):
  Basic Dialogue System
    |
    +-- Choice Presentation
    |     |
    |     +-- Consequence Tracking
    |
    +-- Conflict Detection (when to escalate)
          |
          +-- Escalation System
          |     |
          |     +-- Raise/See Mechanic
          |     +-- Dice Pool Changes per Level
          |     +-- Fallout Calculation
          |
          +-- Conflict Resolution
                |
                +-- Stakes Determination
                +-- Fallout Application

TOWN/WORLD SYSTEM:
  Location Data Model
    |
    +-- NPC Data Model
    |     |
    |     +-- Relationship Web
    |     +-- Sin Attribution
    |
    +-- Sin Progression State
          |
          +-- Pride -> Injustice -> Sin -> Demonic
          |
          +-- Procedural Town Generation (requires all above)

SAVE/PERSISTENCE:
  Game State Serialization
    |
    +-- LocalStorage Save
    +-- Autosave on Cycle End
    +-- Manual Save Points

UI LAYER:
  Text Rendering Engine
    |
    +-- Choice Buttons
    +-- Dialogue History
    +-- Clock Visualization
    +-- Dice Visualization
```

### Critical Path Dependencies

1. **Cycle system before dice** - Dice refresh each cycle
2. **Dice before conflict** - Conflict uses dice allocation
3. **Basic dialogue before escalation** - Escalation IS dialogue with mechanics
4. **NPC model before relationships** - Can't track relationships without NPCs
5. **Sin tracking before progression** - Progression changes sin state
6. **All world state before procedural gen** - Procedural builds on working manual version

---

## Complexity Notes

Relative effort estimates for major feature areas.

### Low Complexity (1-2 weeks each)

- Text rendering and basic UI
- Choice presentation
- Save/load to localStorage
- Settings menu
- Accessibility basics (text size, contrast)
- Day/night visual indicator
- Dialogue history log

### Medium Complexity (2-4 weeks each)

- Cycle/turn system with dice generation
- Dice allocation UI with drag-and-drop
- Progress clock system (BitD-style)
- Basic NPC dialogue trees
- Consequence tracking
- Character stats affecting checks
- Responsive layout for tablet/desktop
- Audio system with ambient sounds
- Basic conflict resolution (pre-escalation)

### High Complexity (1-2 months each)

- **Escalation conflict system** - Core DitV mechanic. Needs extensive design, UI work, balance.
- **Raise/See bidding mechanic** - Poker-style back-and-forth with AI opponent. Complex state machine.
- **Fallout system** - Tracking wounds/consequences, applying to future play.
- **NPC relationship web** - Data model, visualization, consequence propagation.
- **Sin progression system** - Town state machine, escalation triggers.

### Very High Complexity (2+ months)

- **Procedural town generation** - Requires all other systems working first. Needs extensive content authoring for variation pool.
- **Internal monologue system** - Multiple "voices" with personality, contextual commentary.
- **Consequence cascades** - Ripple effects through relationship web. Hard to balance, easy to break.

### Complexity Traps (Seem Simple, Actually Hard)

| Feature | Seems Like | Actually Is |
|---------|------------|-------------|
| "Meaningful choices" | Writing different branches | Tracking state, preventing contradictions, testing all paths |
| "Procedural variation" | Random selection | Content authoring, quality consistency, edge case handling |
| "Interesting failures" | Writing fail text | Ensuring failures lead somewhere, don't dead-end |
| "Relationship web" | A data structure | Visualization, propagation rules, narrative coherence |

---

## MVP Recommendation

For minimum viable Dogs in the Vineyard CRPG:

### Must Have (Table Stakes + Core Identity)

1. **Cycle-based gameplay** with dice allocation (Citizen Sleeper core loop)
2. **Escalation conflict system** (DitV's defining mechanic)
3. **One hand-crafted town** with sin progression
4. **Basic NPC dialogue** with consequence tracking
5. **Progress clocks** for storyline tracking
6. **Save/load system**
7. **Readable text with size options**

### Defer to Post-MVP

- **Procedural town generation** - Too complex for MVP; one hand-crafted town proves the concept
- **Internal monologue voices** - Nice polish, not essential to core loop
- **Legacy/meta-progression** - Requires multiple playthroughs to matter
- **Audio beyond basics** - Polish, not core
- **Multiple Dog backgrounds** - One default Dog is fine for MVP
- **Extensive NPC portraits** - Text works; art is polish

### MVP Validates

- Does escalation conflict feel tense and meaningful?
- Is dice allocation decision-making interesting?
- Do players feel the weight of moral judgment?
- Is the town's sin progression compelling?
- Can players complete a full town arc satisfactorily?

---

## Sources

### Primary Game References

- [Citizen Sleeper Steam](https://store.steampowered.com/app/1578650/Citizen_Sleeper/) - Dice allocation, cycles, clocks
- [Citizen Sleeper Wiki - Dice](https://citizensleeper.fandom.com/wiki/Dice) - Dice mechanics details
- [Disco Elysium Wiki - Skills](https://discoelysium.wiki.gg/wiki/Skills) - Skill check system, internal dialogue
- [Disco Elysium RPG System Analysis](https://www.gabrielchauri.com/disco-elysium-rpg-system-analysis/) - Failure as narrative, skill personalities
- [80 Days - Inkle Studios](https://www.inklestudios.com/80days/) - Resource management, branching narrative
- [80 Days Wikipedia](https://en.wikipedia.org/wiki/80_Days_(2014_video_game)) - Content scale, mechanics overview
- [Sorcery! - Inkle Studios](https://www.inklestudios.com/sorcery/) - Choice system, rewind mechanic
- [Sovereign Syndicate GOG](https://www.gog.com/en/game/sovereign_syndicate) - Tarot card mechanics
- [Wildermyth Wikipedia](https://en.wikipedia.org/wiki/Wildermyth) - Procedural story events, character system

### Dogs in the Vineyard Sources

- [Dogs in the Vineyard Wikipedia](https://en.wikipedia.org/wiki/Dogs_in_the_Vineyard) - Core mechanics overview
- [DitV Raise/See Mechanic - Steemit](https://steemit.com/tabletop-rpg/@danmaruschak/the-brilliant-raise-see-mechanic-in-the-tabletop-rpg-dogs-in-the-vineyard) - Detailed mechanic explanation
- [DitV Mythcreants Analysis](https://mythcreants.com/blog/dogs-in-the-vineyard-holds-up-fairly-well/) - Escalation design philosophy
- [DitV Strategy Notes - Darkshire](https://www.darkshire.net/jhkim/rpg/dogsinthevineyard/strategy.html) - Mechanical details

### Design Pattern Sources

- [Blades in the Dark - Progress Clocks](https://bladesinthedark.com/progress-clocks) - Clock mechanic design
- [The Alexandrian - Progress Clocks](https://thealexandrian.net/wordpress/40424/roleplaying-games/blades-in-the-dark-progress-clocks) - Clock design philosophy
- [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/full-list/) - Accessibility requirements
- [Xbox Accessibility Guidelines](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101) - Text readability standards
- [Wayline - Illusion of Choice](https://www.wayline.io/blog/illusion-of-choice-rpgs) - Meaningful decision design
- [PANGeA - Procedural Narrative](https://arxiv.org/abs/2404.19721) - Procedural narrative generation research

### Development Practice Sources

- [Game UI Design - Justinmind](https://www.justinmind.com/ui-design/game) - UI best practices
- [Common Indie Dev Mistakes - Cliffski](https://www.positech.co.uk/cliffsblog/2021/10/14/common-mistakes-by-indie-game-developers/) - Development pitfalls
- [HTML5 Game Best Practices - SitePoint](https://www.sitepoint.com/top-5-best-practices-for-building-html5-gamesin-action/) - Web game development
