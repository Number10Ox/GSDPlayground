---
created: 2026-01-22T21:30
title: Dialogue quality overhaul
area: api
files:
  - src/utils/promptTemplates.ts
  - src/utils/mockDialogue.ts
  - api/dialogue.ts
  - src/hooks/useDialogue.tsx
  - src/templates/npcArchetypes.ts
  - src/generators/npcGenerator.ts
---

## Problem

NPC dialogue is cryptic, short, and uninformative. The LLM prompt receives almost no context about the town situation — only the NPC's name, role, a brief personality string, and a filtered list of knowledge facts (often 1-2 at low trust). A 60-word response limit further constrains output.

Result: NPCs speak in vague allusions ("Something festers beneath the surface") rather than giving the player concrete, actionable information. Players cannot piece together the town's problems because dialogue never reveals enough substance.

Comparison to Citizen Sleeper: In that game, NPCs have clear wants, clear problems, and clear relationships that surface through dialogue. Each conversation reveals something concrete and drives the player toward understanding the situation.

Key deficiencies:
1. **No town context in prompt** — LLM doesn't know what's happening in the town beyond isolated facts
2. **60-word limit** — Far too restrictive for narrative depth
3. **No NPC motivations** — NPCs have no `desire` or `want` field; they only gatekeep facts
4. **No relationship context** — LLM doesn't know who this NPC loves/hates/protects
5. **Facts are hints, not substance** — "Brother Thomas steals medicine" is a data point, not a narrative hook
6. **No NPC agency** — NPCs never ask the player for help, never make demands, never express needs

## Solution

Gap closure on the dialogue system (spans Phase 5 prompt templates + Phase 6 NPC generation):

1. **Add `motivation`, `desire`, `fear` fields to NPC archetypes** — What each NPC wants the Dog to do (or not do)
2. **Add town situation summary to system prompt** — NPC's perspective on what's wrong (filtered by knowledge level)
3. **Add relationship context** — "You distrust [other NPC]", "You protect [victim]"
4. **Remove or raise word limit** — Allow 200-300 word responses for meaningful exchanges
5. **Rewrite fact templates** — From data points to narrative hooks with emotional stakes
6. **Add NPC requests/demands** — NPCs should ask the Dog for specific actions
7. **Update mock handler** — Longer, more substantive dev-mode responses matching new quality bar
