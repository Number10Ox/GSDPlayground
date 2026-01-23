---
phase: 05-investigation
plan: 03
subsystem: ui
tags: [dialogue, fsm, streaming, typewriter, inner-voice, discovery, framer-motion, tailwind]

# Dependency graph
requires:
  - phase: 05-investigation/01
    provides: "Type definitions (DialogueState, DialogueAction, DialoguePhase, Topic, ApproachType, Discovery)"
  - phase: 05-investigation/02
    provides: "API endpoint, mock handler, inner voice templates, knowledge gating"
provides:
  - "Dialogue FSM reducer with 5 phases and silent-fail phase guards"
  - "DialogueProvider and useDialogue hook with streaming reader"
  - "Complete dialogue UI: topic selection, approach selection, streaming display, discovery reveal"
  - "Inner voice interjection overlay using template system"
  - "Discovery marker parsing from LLM response"
affects: [05-investigation/04, 05-investigation/05, 05-investigation/06]

# Tech tracking
tech-stack:
  added: []
  patterns: [dialogue-fsm, streaming-reader, discovery-markers, phase-driven-rendering]

key-files:
  created:
    - src/reducers/dialogueReducer.ts
    - src/hooks/useDialogue.tsx
    - src/components/Dialogue/DialogueView.tsx
    - src/components/Dialogue/TopicChips.tsx
    - src/components/Dialogue/ApproachChips.tsx
    - src/components/Dialogue/TypewriterText.tsx
    - src/components/Dialogue/InnerVoice.tsx
    - src/components/Dialogue/DiscoverySummary.tsx
  modified: []

key-decisions:
  - "sendMessage handles full exchange flow: dispatches SELECT_TOPIC + SELECT_APPROACH, streams, extracts discoveries"
  - "DialogueView dispatches SELECT_TOPIC directly; approach chip triggers sendMessage with already-selected topic"
  - "Discovery markers format: [DISCOVERY: factId|sinId|content] embedded in LLM response, parsed client-side"
  - "TypewriterText uses framer-motion for cursor blink only (not per-character animation - too expensive for streaming)"
  - "InnerVoice auto-hides after 4 seconds with slide-in/fade-out animation"
  - "CLOSE_DISCOVERY ends conversation after 3+ exchanges (2-3 exchanges per conversation)"
  - "Prose-style narrative display (not chat bubbles) matching DitV literary tone"

patterns-established:
  - "Dialogue FSM: IDLE -> SELECTING_TOPIC -> SELECTING_APPROACH -> STREAMING_RESPONSE -> SHOWING_DISCOVERY -> loop/end"
  - "Silent fail phase guards: invalid transitions return state unchanged (consistent with conflict/cycle reducers)"
  - "ReadableStream reader pattern for streaming chunks to UI"
  - "Discovery marker extraction: regex parse after stream complete, markers removed from display text"
  - "Phase-driven component rendering: DialogueView shows different sub-components per DialoguePhase"
  - "Stat-colored UI elements: acuity=blue, heart=pink, body=amber, will=purple (consistent with Phase 4)"

# Metrics
duration: 3min
completed: 2026-01-23
---

# Phase 5 Plan 3: Dialogue UI Components Summary

**Complete dialogue FSM reducer, streaming hook with discovery extraction, and 6 phase-driven UI components (topics, approaches, typewriter, inner voice, discovery summary, orchestrator view)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-23T00:05:31Z
- **Completed:** 2026-01-23T00:08:54Z
- **Tasks:** 2
- **Files created:** 8

## Accomplishments
- Dialogue FSM with 5 phases (IDLE, SELECTING_TOPIC, SELECTING_APPROACH, STREAMING_RESPONSE, SHOWING_DISCOVERY) and phase guards
- Streaming reader processes chunks from /api/dialogue endpoint, with dev-mode mock fallback
- Discovery markers extracted from response text and recorded in investigation state
- Inner voice interjections triggered probabilistically (30%) after each NPC response
- TypewriterText with blinking cursor animation during streaming (framer-motion)
- Full-screen dialogue overlay with NPC avatar, fatigue indicator, and leave button
- 2-3 exchanges per conversation (CLOSE_DISCOVERY checks history length >= 3)
- Fatigue clock advances per conversation exchange

## Task Commits

Each task was committed atomically:

1. **Task 1: Dialogue reducer and hook with streaming** - `c6f510d` (feat)
2. **Task 2: Dialogue UI components** - `2017457` (feat)

## Files Created/Modified
- `src/reducers/dialogueReducer.ts` - Dialogue FSM with phase guards and silent fail pattern
- `src/hooks/useDialogue.tsx` - DialogueProvider, useDialogue hook, sendMessage with streaming, discovery parsing
- `src/components/Dialogue/DialogueView.tsx` - Full-screen orchestrator rendering phase-appropriate sub-components
- `src/components/Dialogue/TopicChips.tsx` - Horizontal topic selection chips with amber accent
- `src/components/Dialogue/ApproachChips.tsx` - Stat-linked approach chips with Lucide icons and dice count
- `src/components/Dialogue/TypewriterText.tsx` - Prose narrative display with blinking cursor animation
- `src/components/Dialogue/InnerVoice.tsx` - Stat-colored interjection overlay with auto-hide timer
- `src/components/Dialogue/DiscoverySummary.tsx` - Discovery reveal overlay with sin connections

## Decisions Made
- **Two-step UI selection:** Topic chip dispatches SELECT_TOPIC directly to advance FSM; approach chip calls sendMessage which handles SELECT_APPROACH + streaming
- **Discovery marker format:** `[DISCOVERY: factId|sinId|content]` parsed after stream completes -- markers stripped from display text
- **Cursor animation only:** TypewriterText uses framer-motion for underscore blink, not per-character reveal (streaming already provides natural typewriter effect)
- **4-second auto-hide for inner voice:** Prevents UI clutter while ensuring player sees interjection
- **Prose style over chat bubbles:** Matches DitV literary narrative tone (player gray-300, NPC gray-100)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Initial DialogueView approach handler had incorrect logic (dispatching END_CONVERSATION + re-dispatching) -- fixed to call sendMessage directly with the already-selected topic from state

## Next Phase Readiness
- Dialogue UI ready for integration into GameView (plan 05-05)
- DialogueProvider needs wrapping in App.tsx provider tree (deferred to 05-05)
- START_CONVERSATION dispatch needed from NPC interaction (will be in plan 05-05 integration)
- E2E testing of dialogue flow possible once providers wired (plan 05-06)

---
*Phase: 05-investigation*
*Completed: 2026-01-23*
