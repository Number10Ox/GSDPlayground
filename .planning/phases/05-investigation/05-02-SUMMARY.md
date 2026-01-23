---
phase: 05-investigation
plan: 02
subsystem: api
tags: [ai-sdk, anthropic, llm, streaming, knowledge-gating, prompt-engineering, ditv]

# Dependency graph
requires:
  - phase: 05-investigation/01
    provides: "Dialogue and investigation type definitions (KnowledgeFact, ApproachType, Discovery, Topic)"
provides:
  - "Trust-level knowledge filtering (filterKnowledgeByTrust)"
  - "DitV-voiced prompt construction (buildSystemPrompt, buildUserPrompt)"
  - "Stat-based inner voice interjection templates (4 stats x 6 situations)"
  - "Serverless dialogue API endpoint with streaming (api/dialogue.ts)"
  - "Mock dialogue handler for API-free local development"
affects: [05-investigation/03, 05-investigation/04, 05-investigation/05]

# Tech tracking
tech-stack:
  added: [ai@6.0.48, "@ai-sdk/anthropic@3.0.23"]
  patterns: [server-side-knowledge-gating, trust-gated-prompts, mock-streaming-for-dev, vercel-serverless-functions]

key-files:
  created:
    - src/utils/knowledgeGating.ts
    - src/utils/promptTemplates.ts
    - src/utils/innerVoiceTemplates.ts
    - api/dialogue.ts
    - src/utils/mockDialogue.ts
    - tsconfig.api.json
  modified:
    - package.json
    - tsconfig.json

key-decisions:
  - "AI SDK v6 uses system+prompt pattern (not messages array with system role)"
  - "maxOutputTokens (not maxTokens) in AI SDK v6 for token limit"
  - "Separate tsconfig.api.json for api/ folder (not in src/ or node config)"
  - "NPCKnowledge interface defined in knowledgeGating.ts (utility-local, not in types/)"
  - "Inner voice uses template-based generation (not LLM-generated) for speed and determinism"
  - "30% trigger probability for inner voice interjections"
  - "Mock handler simulates streaming with ReadableStream for realistic dev experience"

patterns-established:
  - "Server-side knowledge filtering: facts filtered BEFORE prompt construction, preventing prompt injection"
  - "Stat-scaled approach descriptions: low/mid/high tiers based on dice count (2-6)"
  - "DitV period voice constraints in system prompt: 60 words, Brother/Sister address, 1850s frontier"
  - "Mock streaming pattern: createMockStream with random chunk sizes for natural pacing"
  - "Vercel serverless function pattern: POST export, config.maxDuration, input validation"

# Metrics
duration: 6min
completed: 2026-01-22
---

# Phase 5 Plan 2: LLM Integration Layer Summary

**Trust-gated knowledge filtering, DitV-voiced prompt templates, Disco Elysium-style inner voice (96 templates), and streaming serverless dialogue endpoint with Vercel AI SDK v6**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-22T23:51:26Z
- **Completed:** 2026-01-22T23:57:22Z
- **Tasks:** 2
- **Files created:** 6

## Accomplishments
- Knowledge gating prevents NPC fact leakage: filterKnowledgeByTrust gates by trust level AND approach type server-side
- System prompt enforces DitV period voice with 60-word limit, [Player]/[NPC] format, and hard knowledge boundaries
- Inner voice templates: 4 stats (Acuity/Heart/Body/Will) x 6 situations x 3-4 templates = 96 total, all in frontier religious voice
- Streaming serverless endpoint with input validation, error handling, and 30s maxDuration config
- Mock handler enables full dev workflow without API keys, simulating character-by-character streaming

## Task Commits

Each task was committed atomically:

1. **Task 1: Knowledge gating and prompt template utilities** - `167d015` (feat)
2. **Task 2: Serverless dialogue API endpoint** - `e72fc6e` (feat)

## Files Created/Modified
- `src/utils/knowledgeGating.ts` - Trust-level and approach filtering of NPC knowledge, NPCKnowledge interface, DEFAULT_TOPICS, getAvailableTopics
- `src/utils/promptTemplates.ts` - buildSystemPrompt (DitV voice, knowledge constraints) and buildUserPrompt (stat-scaled approach descriptions)
- `src/utils/innerVoiceTemplates.ts` - INNER_VOICE_TEMPLATES (4x6x3-4 templates) and getInnerVoiceInterjection (30% trigger)
- `api/dialogue.ts` - Vercel serverless POST handler: validates, filters knowledge, builds prompts, streams via AI SDK
- `src/utils/mockDialogue.ts` - mockDialogueResponse, createMockStream, mockDialogueEndpoint for dev mode
- `tsconfig.api.json` - TypeScript project config for api/ folder with @/* path alias
- `tsconfig.json` - Added api project reference
- `package.json` - Added ai and @ai-sdk/anthropic dependencies

## Decisions Made
- **AI SDK v6 API format:** Uses `system` + `prompt` properties (not `messages` array with system role) and `maxOutputTokens` (not `maxTokens`)
- **Separate tsconfig for api/:** api/ folder needs its own TypeScript project since tsconfig.app.json only includes src/
- **Template-based inner voice:** Deterministic, no API cost, fast -- LLM generation deferred as future enhancement if variety needed
- **NPCKnowledge in utility file:** Interface defined locally in knowledgeGating.ts rather than dialogue types, since it's only used by the gating logic
- **30% inner voice trigger rate:** Balances immersion with avoiding annoyance -- can be tuned via constant

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] AI SDK v6 API property names differ from plan**
- **Found during:** Task 2 (API endpoint)
- **Issue:** Plan specified `maxTokens` and `messages` array format, but AI SDK v6 uses `maxOutputTokens` and `system`+`prompt` pattern
- **Fix:** Updated streamText call to use correct v6 properties
- **Files modified:** api/dialogue.ts
- **Verification:** `npx tsc --noEmit` passes, `npm run build` succeeds
- **Committed in:** e72fc6e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** API property rename necessary for SDK compatibility. No scope creep.

## Issues Encountered
- Types files (dialogue.ts, investigation.ts) already existed from plan 05-01, so no need to create them -- adjusted utility imports accordingly
- Topic interface in linter-updated dialogue.ts removed `description` field -- updated DEFAULT_TOPICS to match

## User Setup Required

For production deployment, set the `ANTHROPIC_API_KEY` environment variable in your Vercel project settings. Local development uses the mock handler and requires no API key.

## Next Phase Readiness
- Knowledge gating and prompt templates ready for dialogue UI (plan 05-03/04)
- Mock handler enables UI development without API keys
- Inner voice templates ready for InnerVoice component integration
- API endpoint ready for Vercel deployment once ANTHROPIC_API_KEY is configured

---
*Phase: 05-investigation*
*Completed: 2026-01-22*
