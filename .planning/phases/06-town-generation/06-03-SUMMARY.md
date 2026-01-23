# Plan 06-03 Summary: Location Templates + Topic Rules + Town Assembler

## Status: Complete

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Location templates and location generator | de2e16a | src/templates/locationTemplates.ts, src/generators/locationGenerator.ts |
| 2 | Topic rule generator and town assembler | d2b04ed | src/generators/topicRuleGenerator.ts, src/generators/townGenerator.ts |

## Deliverables

- **src/templates/locationTemplates.ts** — 3 layout templates (hub-and-spoke, linear-road, clustered) with 6-8 slots each, pre-computed SVG coordinates, and name/description variants
- **src/generators/locationGenerator.ts** — `generateLocations(npcCount, seed)` producing connected location graphs with RNG-selected name variants
- **src/generators/topicRuleGenerator.ts** — `generateTopicRules(npcs, sinChain, locations)` producing default, discovery-gated, and location-specific topic rules
- **src/generators/townGenerator.ts** — `generateTown(config)` orchestrating all sub-generators into complete self-consistent TownData objects

## Key Decisions

- [06-03]: Fixed SVG coordinates per template slot (variety from template selection + name variants, not random positions)
- [06-03]: NPC-to-location assignment uses heuristic type matching with least-crowded fallback
- [06-03]: Cross-referencing discovery topics for adjacent sin pairs (multi-gate unlock paths)
- [06-03]: TOWN_NAME_FRAGMENTS exported for testing/variety verification (22 prefixes x 22 suffixes = 484 possible names)

## Verification

- TypeScript compiles with zero errors
- generateTown produces complete TownData with valid internal references
- All NPC locationIds map to actual generated locations
- Every sin covered by at least one discovery-gated topic rule
- Location connection graphs are connected (all locations reachable)
- Deterministic: same seed produces same town
