# Phase 5: Investigation - Research

**Researched:** 2026-01-22
**Domain:** LLM-backed dialogue systems, React state management, graph visualization
**Confidence:** HIGH

## Summary

Phase 5 implements an LLM-backed dialogue system where players investigate NPCs to discover a sin progression chain and pursue resolution paths. The standard approach combines serverless functions as API proxies with React state management for conversation flow, visual graph components for the mental map, and deterministic testing via record-replay patterns.

The established pattern is: **serverless function proxy → Vercel AI SDK for provider abstraction → React Context/useReducer for state → React Flow for graph visualization → VCR-style mocking for tests.**

Key architectural insights:
- LLM providers accessed via serverless edge functions to hide API keys and enable streaming responses
- Trust-gated information revelation implemented through filtering knowledge pools before sending to LLM
- Conversation state managed via useReducer with finite state machine patterns
- Mental map visualization handled by React Flow or custom SVG components
- Fatigue clock integrates with existing cycle system as parallel resource to dice

**Primary recommendation:** Use Vercel AI SDK with serverless functions for LLM abstraction, React Flow for mental map visualization, and VCR.py-style HTTP recording for deterministic E2E tests. Extend existing GameProvider/useReducer pattern with dialogue-specific state.

## Standard Stack

The established libraries/tools for LLM-backed React applications in 2026:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vercel AI SDK | 6.x | LLM provider abstraction, streaming | Industry standard for multi-provider AI, Language Model Specification V3 provides unified interface |
| React Flow | @xyflow/react 12.x | Interactive node-edge graph visualization | Most mature React graph library, MIT licensed, extensive customization |
| Framer Motion | 12.x | Typewriter animation, UI transitions | Already in project (package.json), smooth declarative animations |
| TypeScript | 5.0+ | Type safety for complex state | Already in project, required for AI SDK type inference |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vercel Functions | - | Serverless LLM API proxy | Streaming support, up to 800s timeout on Pro, fluid compute for concurrent I/O |
| Netlify Edge Functions | - | Alternative serverless proxy | If using Netlify hosting (50ms CPU limit, 40s header timeout) |
| llm-ui | latest | React components for LLM streaming | If need pre-built streaming text components beyond custom implementation |
| react-countdown-circle-timer | latest | SVG-based circular progress | For fatigue clock if custom SVG not preferred |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Flow | D3 + custom React | More control but 10x implementation time, harder to maintain |
| Vercel AI SDK | Direct OpenAI/Anthropic SDK | Vendor lock-in, no easy provider switching |
| Vercel Functions | Netlify Edge Functions | Shorter timeouts (50ms CPU vs 800s total), different concurrency model |
| useReducer | Redux | Overkill for dialogue state, more boilerplate |

**Installation:**
```bash
npm install ai @ai-sdk/openai @xyflow/react
# Or alternative provider:
npm install ai @ai-sdk/anthropic
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Dialogue/              # Dialogue UI components
│   │   ├── DialogueView.tsx   # Main conversation container
│   │   ├── TopicChips.tsx     # Topic selection UI
│   │   ├── ApproachChips.tsx  # Approach selection UI
│   │   ├── TypewriterText.tsx # Streaming text display
│   │   └── InnerVoice.tsx     # Stat-based interjections
│   ├── MentalMap/             # Knowledge graph visualization
│   │   ├── MentalMap.tsx      # React Flow wrapper
│   │   ├── SinNode.tsx        # Custom node for sins
│   │   └── NPCNode.tsx        # Custom node for NPCs
│   └── FatigueClock/          # Cycle economy
│       └── FatigueClock.tsx   # Circular progress component
├── hooks/
│   ├── useDialogue.tsx        # Dialogue state management
│   └── useMentalMap.tsx       # Mental map state
├── reducers/
│   ├── dialogueReducer.ts     # Conversation flow FSM
│   └── investigationReducer.ts # Discovery & sin tracking
├── types/
│   ├── dialogue.ts            # Conversation types
│   ├── investigation.ts       # Discovery & sin types
│   └── mentalMap.ts           # Graph data types
├── utils/
│   ├── knowledgeGating.ts     # Trust-level filtering
│   └── promptTemplates.ts     # LLM prompt construction
└── api/                       # Serverless functions
    └── dialogue.ts            # LLM proxy endpoint
```

### Pattern 1: LLM Provider Abstraction with Serverless Proxy

**What:** Serverless function proxies LLM API calls, hiding credentials and enabling streaming. Client sends conversation context, server construins prompt with guardrails, streams response.

**When to use:** Always for production LLM integration (never expose API keys client-side).

**Example:**
```typescript
// api/dialogue.ts (Vercel Function)
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic'; // or openai

export async function POST(request: Request) {
  const { npcId, topic, approach, playerStats, trustLevel } = await request.json();

  // Filter knowledge based on trust level (guardrail)
  const availableKnowledge = filterKnowledgeByTrust(npcId, trustLevel);

  // Construct prompt with guardrails
  const systemPrompt = buildSystemPrompt(npcId, availableKnowledge);
  const userPrompt = buildUserPrompt(topic, approach, playerStats);

  // Stream response
  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    maxTokens: 300, // Keep responses brief
  });

  return result.toTextStreamResponse();
}
```

**Client-side consumption:**
```typescript
// hooks/useDialogue.tsx
async function sendMessage(topic: string, approach: string) {
  const response = await fetch('/api/dialogue', {
    method: 'POST',
    body: JSON.stringify({ npcId, topic, approach, playerStats, trustLevel }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    dispatch({ type: 'APPEND_RESPONSE', chunk });
  }
}
```

**Source:** [Vercel AI SDK Documentation](https://vercel.com/docs/ai-sdk), [Multi-provider LLM orchestration](https://dev.to/ash_dubai/multi-provider-llm-orchestration-in-production-a-2026-guide-1g10)

### Pattern 2: Trust-Gated Knowledge Revelation

**What:** NPCs know a pool of information, but only reveal facts based on relationship level and conversation approach. Implemented as server-side filtering BEFORE prompt construction.

**When to use:** Any system where NPCs have limited or conditional knowledge.

**Example:**
```typescript
// utils/knowledgeGating.ts
interface KnowledgeFact {
  id: string;
  content: string;
  tags: string[]; // e.g., ['sin-pride', 'npc-relationship']
  minTrustLevel: number; // -100 to 100
  requiredApproach?: 'acuity' | 'heart' | 'body' | 'will';
}

function filterKnowledgeByTrust(
  npcId: string,
  trustLevel: number,
  approach?: string
): KnowledgeFact[] {
  const allKnowledge = getNPCKnowledge(npcId);

  return allKnowledge.filter(fact => {
    // Trust gate
    if (trustLevel < fact.minTrustLevel) return false;

    // Approach gate (some facts only revealed via specific approaches)
    if (fact.requiredApproach && fact.requiredApproach !== approach) {
      return false;
    }

    return true;
  });
}

function buildSystemPrompt(npcId: string, knowledge: KnowledgeFact[]): string {
  const npc = getNPC(npcId);

  return `You are ${npc.name}, ${npc.role} in this frontier town.

PERSONALITY: ${npc.personality}
SPEECH PATTERN: Biblical cadence, address player as "Brother" or "Sister"

KNOWLEDGE YOU POSSESS:
${knowledge.map(k => `- ${k.content}`).join('\n')}

CRITICAL CONSTRAINTS:
- You CANNOT reveal information not listed above
- If asked about unknown topics, deflect naturally in character
- Keep responses under 50 words (brief exchanges)
- Match the DitV period voice (1850s frontier religious community)`;
}
```

**Source:** [Prompt Engineering with Guardrails](https://www.endtrace.com/prompt-engineering-with-guardrails-guide/), [Building Guardrails](https://www.qed42.com/insights/building-simple-effective-prompt-based-guardrails)

### Pattern 3: Conversation State Machine with useReducer

**What:** Manage dialogue flow as finite state machine: IDLE → SELECTING_TOPIC → SELECTING_APPROACH → STREAMING_RESPONSE → SHOWING_DISCOVERY → IDLE.

**When to use:** Multi-step conversation flows with clear state transitions.

**Example:**
```typescript
// reducers/dialogueReducer.ts
type DialoguePhase =
  | 'IDLE'
  | 'SELECTING_TOPIC'
  | 'SELECTING_APPROACH'
  | 'STREAMING_RESPONSE'
  | 'SHOWING_DISCOVERY';

interface DialogueState {
  phase: DialoguePhase;
  currentNPC: string | null;
  selectedTopic: string | null;
  selectedApproach: string | null;
  conversationHistory: ConversationTurn[];
  streamingText: string;
  newDiscoveries: Discovery[];
}

type DialogueAction =
  | { type: 'START_CONVERSATION'; npcId: string }
  | { type: 'SELECT_TOPIC'; topic: string }
  | { type: 'SELECT_APPROACH'; approach: string }
  | { type: 'APPEND_RESPONSE'; chunk: string }
  | { type: 'FINISH_RESPONSE'; discoveries: Discovery[] }
  | { type: 'CLOSE_DISCOVERY' }
  | { type: 'END_CONVERSATION' };

function dialogueReducer(state: DialogueState, action: DialogueAction): DialogueState {
  switch (action.type) {
    case 'START_CONVERSATION':
      if (state.phase !== 'IDLE') return state;
      return {
        ...state,
        phase: 'SELECTING_TOPIC',
        currentNPC: action.npcId,
        selectedTopic: null,
        selectedApproach: null,
      };

    case 'SELECT_TOPIC':
      if (state.phase !== 'SELECTING_TOPIC') return state;
      return {
        ...state,
        phase: 'SELECTING_APPROACH',
        selectedTopic: action.topic,
      };

    case 'SELECT_APPROACH':
      if (state.phase !== 'SELECTING_APPROACH') return state;
      return {
        ...state,
        phase: 'STREAMING_RESPONSE',
        selectedApproach: action.approach,
        streamingText: '',
      };

    case 'APPEND_RESPONSE':
      if (state.phase !== 'STREAMING_RESPONSE') return state;
      return {
        ...state,
        streamingText: state.streamingText + action.chunk,
      };

    case 'FINISH_RESPONSE':
      if (state.phase !== 'STREAMING_RESPONSE') return state;
      return {
        ...state,
        phase: action.discoveries.length > 0 ? 'SHOWING_DISCOVERY' : 'IDLE',
        conversationHistory: [
          ...state.conversationHistory,
          { topic: state.selectedTopic!, approach: state.selectedApproach!, response: state.streamingText }
        ],
        newDiscoveries: action.discoveries,
        streamingText: '',
      };

    case 'CLOSE_DISCOVERY':
      return { ...state, phase: 'IDLE', newDiscoveries: [] };

    case 'END_CONVERSATION':
      return initialDialogueState;

    default:
      return state;
  }
}
```

**Source:** [React useReducer Deep Dive](https://dev.to/a1guy/react-19-usereducer-deep-dive-from-basics-to-complex-state-patterns-3fpi), [TypeScript Finite State Machines](https://medium.com/@MichaelVD/composable-state-machines-in-typescript-type-safe-predictable-and-testable-5e16574a6906)

### Pattern 4: Mental Map with React Flow

**What:** Visual graph showing discovered sins, NPCs, and connections. Updates after conversations reveal new information.

**When to use:** Any knowledge graph/relationship visualization in games.

**Example:**
```typescript
// components/MentalMap/MentalMap.tsx
import { ReactFlow, Node, Edge, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface MentalMapProps {
  discoveries: Discovery[];
  sinProgression: SinNode[];
}

export function MentalMap({ discoveries, sinProgression }: MentalMapProps) {
  const initialNodes: Node[] = sinProgression.map((sin, idx) => ({
    id: sin.id,
    type: 'sinNode',
    position: { x: 400, y: idx * 100 },
    data: {
      label: sin.name,
      discovered: discoveries.some(d => d.sinId === sin.id),
      severity: sin.severity
    },
  }));

  const initialEdges: Edge[] = sinProgression.slice(0, -1).map((sin, idx) => ({
    id: `e${sin.id}-${sinProgression[idx + 1].id}`,
    source: sin.id,
    target: sinProgression[idx + 1].id,
    animated: true,
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        nodeTypes={{ sinNode: SinNodeComponent }}
      />
    </div>
  );
}
```

**Source:** [React Flow Documentation](https://reactflow.dev/learn), [React Flow Quick Start](https://reactflow.dev/learn)

### Pattern 5: Typewriter Effect for Streaming LLM Text

**What:** Display streaming text character-by-character with natural typing cadence for narrative immersion.

**When to use:** LLM streaming responses, narrative text display.

**Example:**
```typescript
// components/Dialogue/TypewriterText.tsx
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  isStreaming: boolean;
}

export function TypewriterText({ text, isStreaming }: TypewriterTextProps) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="narrative-text"
    >
      {text.split('').map((char, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: idx * 0.03 }}
        >
          {char}
        </motion.span>
      ))}
      {isStreaming && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          _
        </motion.span>
      )}
    </motion.p>
  );
}

// Alternative: Direct streaming without re-rendering each character
export function StreamingText({ chunks }: { chunks: string[] }) {
  return (
    <div className="narrative-text">
      {chunks.map((chunk, idx) => (
        <span key={idx}>{chunk}</span>
      ))}
    </div>
  );
}
```

**Source:** [Motion.dev Typewriter](https://motion.dev/docs/react-typewriter), [5 Ways to Implement Typing Animation](https://blog.logrocket.com/5-ways-implement-typing-animation-react/)

### Anti-Patterns to Avoid

- **Client-side LLM API calls with exposed keys:** ALWAYS proxy through serverless functions
- **Prompt-only guardrails:** Trust level filtering MUST happen server-side before prompt construction
- **Uncontrolled LLM verbosity:** Set maxTokens (e.g., 300) and use system prompts to enforce brevity
- **Blocking on LLM responses:** Always stream for perceived performance
- **Global state for dialogue:** Use Context + useReducer scoped to dialogue flow, not game-wide Redux

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-provider LLM abstraction | Custom fetch wrappers for each provider | Vercel AI SDK | Handles streaming, type safety, provider switching, prompt formatting differences |
| Graph visualization | Custom canvas/SVG node-edge renderer | React Flow | Handles layout algorithms, zoom/pan, connection validation, accessibility |
| Conversation state management | Ad-hoc useState for each field | useReducer with FSM pattern | Type-safe transitions, predictable state changes, easier testing |
| LLM response streaming | Manual SSE/WebSocket handling | Vercel AI SDK streaming | Handles reconnection, chunk parsing, error states |
| Typewriter animation | setTimeout loops | Framer Motion or Motion.dev | Handles animation cleanup, cancellation, performance |
| Circular progress/clock | Canvas rendering | SVG with strokeDasharray | Scalable, accessible, CSS animatable |

**Key insight:** LLM integration has significant hidden complexity (streaming protocols, error handling, retry logic, rate limiting). The Vercel AI SDK abstracts this mature ecosystem knowledge. Graph visualization similarly has edge cases (layout cycles, performance with 100+ nodes) that React Flow solves.

## Common Pitfalls

### Pitfall 1: Serverless Function Timeouts for Long LLM Responses

**What goes wrong:** LLM calls can take 10-30 seconds, exceeding default serverless timeouts (10s on Netlify standard functions, 300s default on Vercel).

**Why it happens:** Developers assume serverless functions have generous timeouts like traditional servers.

**How to avoid:**
- Use Vercel Functions with fluid compute (up to 800s on Pro/Enterprise)
- Enable streaming so response headers sent immediately (Edge Functions require 25s to start streaming)
- Set appropriate maxDuration config in vercel.json
- Consider Netlify Background Functions (15 min) if using Netlify, though not ideal for real-time UX

**Warning signs:** 504 FUNCTION_INVOCATION_TIMEOUT errors, responses cutting off mid-stream.

**Source:** [Vercel Functions Limitations](https://vercel.com/docs/functions/limitations), [Netlify Serverless Function Timeouts](https://damianwroblewski.com/en/blog/how-to-bypass-the-netlify-serverless-function-timeout/)

### Pitfall 2: LLM Knowledge Leakage Through Prompt Injection

**What goes wrong:** NPC reveals information it shouldn't know because player crafts topic/approach to trick the LLM into ignoring constraints.

**Why it happens:** Relying solely on prompt instructions ("only reveal X") without hard filtering.

**How to avoid:**
- Filter knowledge pool BEFORE constructing prompt (server-side)
- Never include sensitive facts in system prompt if trust level too low
- Validate player inputs server-side (sanitize topics, restrict approach values to enum)
- Log LLM responses to detect leakage in testing

**Warning signs:** Players discovering information earlier than intended, inconsistent NPC knowledge across conversations.

**Source:** [Prompt Engineering with Guardrails](https://www.endtrace.com/prompt-engineering-with-guardrails-guide/), [Guardrails as Deterministic Systems](https://medium.com/techtrends-digest/beyond-the-prompt-why-ai-guardrails-are-the-new-firewall-for-the-agentic-era-b82c9d06e847)

### Pitfall 3: Context Provider Re-render Storms

**What goes wrong:** Every dialogue state change re-renders entire component tree, causing lag during streaming.

**Why it happens:** Dialogue context wraps too much of the app, or state updates trigger unnecessary re-renders.

**How to avoid:**
- Scope DialogueProvider to only components that need it (not root-level)
- Split providers: InvestigationProvider (mental map, discoveries) separate from DialogueProvider (active conversation)
- Use React.memo on components that don't need dialogue updates
- Prefer local state for UI-only concerns (e.g., topic chip hover states)

**Warning signs:** FPS drops during conversations, DevTools showing excessive re-renders.

**Source:** [React Context Best Practices](https://kentcdodds.com/blog/how-to-use-react-context-effectively), [State Management in 2026](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)

### Pitfall 4: Non-Deterministic E2E Tests

**What goes wrong:** E2E tests fail randomly because LLM responses vary, making assertions unpredictable.

**Why it happens:** Tests call real LLM API or use mocks without deterministic responses.

**How to avoid:**
- Use VCR-style HTTP recording: record real LLM responses once, replay in tests
- Libraries like vcrpy capture full HTTP interactions and replay deterministically
- For unit tests, use fake providers (e.g., GenericFakeChatModel from LangChain pattern)
- Test conversation flow mechanics separately from LLM quality

**Warning signs:** Flaky tests, different passes/fails on same code, expensive test runs (API costs).

**Source:** [Testing LLM Applications](https://langfuse.com/blog/2025-10-21-testing-llm-applications), [Deterministic Tests for LLM RAG](https://medium.com/@scrudato/deterministic-tests-for-complex-llm-rag-applications-b5a354b75346), [Mocking LLM Responses](https://medium.com/@vuongngo/effective-practices-for-mocking-llm-responses-during-the-software-development-lifecycle-73f726c3f994)

### Pitfall 5: Unstructured Sin Progression Tracking

**What goes wrong:** Can't detect when town is "resolved" because sin progression is ad-hoc arrays/flags, no clear data structure.

**Why it happens:** Starting implementation without defining sin chain data model.

**How to avoid:**
- Model sin progression as Directed Acyclic Graph (DAG) or linear chain
- Each sin node has: id, name, severity, prerequisites, resolved: boolean
- Use TypeScript interfaces to enforce structure
- Track resolution via reducer action: MARK_SIN_RESOLVED → checks if all blocking sins resolved
- Town complete when root sin (Pride) resolved OR final sin (Murder) reached

**Warning signs:** Bugs where resolution doesn't trigger, unclear game state, can't determine win/loss.

**Source:** [Branching Narrative Structures](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/), [TypeScript DAG Libraries](https://segfaultx64.github.io/typescript-graph/)

## Code Examples

Verified patterns from research and existing codebase:

### Integrating with Existing GameProvider

```typescript
// hooks/useInvestigation.tsx
import { createContext, useContext, useReducer } from 'react';
import { useGameState } from './useGameState';
import { useNPCMemory } from './useNPCMemory';

interface InvestigationState {
  mentalMap: Discovery[];
  sinProgression: SinNode[];
  activeDialogue: DialogueState | null;
  fatigueClock: { current: number; max: number };
}

type InvestigationAction =
  | { type: 'START_DIALOGUE'; npcId: string }
  | { type: 'RECORD_DISCOVERY'; discovery: Discovery }
  | { type: 'ADVANCE_FATIGUE'; amount: number }
  | { type: 'MARK_SIN_RESOLVED'; sinId: string }
  | { type: 'END_CYCLE' };

function investigationReducer(
  state: InvestigationState,
  action: InvestigationAction
): InvestigationState {
  switch (action.type) {
    case 'START_DIALOGUE':
      // Check fatigue limit
      if (state.fatigueClock.current >= state.fatigueClock.max) {
        return state; // Cannot start conversation, too fatigued
      }
      return {
        ...state,
        activeDialogue: { phase: 'SELECTING_TOPIC', npcId: action.npcId, ... },
      };

    case 'RECORD_DISCOVERY':
      return {
        ...state,
        mentalMap: [...state.mentalMap, action.discovery],
      };

    case 'ADVANCE_FATIGUE':
      return {
        ...state,
        fatigueClock: {
          ...state.fatigueClock,
          current: Math.min(
            state.fatigueClock.max,
            state.fatigueClock.current + action.amount
          ),
        },
      };

    case 'MARK_SIN_RESOLVED':
      return {
        ...state,
        sinProgression: state.sinProgression.map(sin =>
          sin.id === action.sinId ? { ...sin, resolved: true } : sin
        ),
      };

    case 'END_CYCLE':
      // Reset fatigue at end of cycle
      return {
        ...state,
        fatigueClock: { ...state.fatigueClock, current: 0 },
      };

    default:
      return state;
  }
}

// Provider pattern matches existing codebase
const InvestigationContext = createContext<{
  state: InvestigationState;
  dispatch: Dispatch<InvestigationAction>;
} | null>(null);

export function InvestigationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(investigationReducer, initialState);
  return (
    <InvestigationContext.Provider value={{ state, dispatch }}>
      {children}
    </InvestigationContext.Provider>
  );
}

export function useInvestigation() {
  const context = useContext(InvestigationContext);
  if (!context) throw new Error('Must be within InvestigationProvider');
  return context;
}
```

**Source:** Existing codebase pattern (useGameState.tsx, useNPCMemory.tsx)

### Inner Voice System with Stat-Based Interjections

```typescript
// components/Dialogue/InnerVoice.tsx
interface InnerVoiceProps {
  character: Character;
  situation: 'dialogue' | 'discovery' | 'conflict-escalation';
  context: Record<string, unknown>;
}

export function InnerVoice({ character, situation, context }: InnerVoiceProps) {
  const [voiceText, setVoiceText] = useState<string | null>(null);

  useEffect(() => {
    // Determine highest stat
    const stats = [
      { name: 'acuity', value: character.acuity },
      { name: 'heart', value: character.heart },
      { name: 'body', value: character.body },
      { name: 'will', value: character.will },
    ];
    const highestStat = stats.reduce((a, b) => a.value > b.value ? a : b);

    // 30% chance to trigger inner voice on highest stat
    if (Math.random() < 0.3) {
      const text = generateInnerVoice(highestStat.name, situation, context);
      setVoiceText(text);

      // Auto-dismiss after 5 seconds
      setTimeout(() => setVoiceText(null), 5000);
    }
  }, [situation, context]);

  if (!voiceText) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="inner-voice"
    >
      <span className="inner-voice-label">[{highestStat.name.toUpperCase()}]</span>
      <span className="inner-voice-text">{voiceText}</span>
    </motion.div>
  );
}

// Template-based or LLM-generated inner voice
function generateInnerVoice(
  stat: string,
  situation: string,
  context: Record<string, unknown>
): string {
  // Option 1: Template-based (deterministic, fast, no API cost)
  const templates = {
    acuity: {
      dialogue: "Something doesn't add up about their story...",
      discovery: "This connects to what the Sister said earlier.",
    },
    heart: {
      dialogue: "They're hiding pain beneath those words.",
      discovery: "The weight of this truth settles heavy on you.",
    },
    // ... etc
  };

  return templates[stat]?.[situation] ?? '';

  // Option 2: LLM-generated (dynamic, costs API calls)
  // Could call lightweight model for variety
}
```

**Source:** [Disco Elysium Skills Guide](https://game.dazepuzzle.com/disco-elysium-skills-guide/), Existing character system (character.ts)

### Fatigue Clock Integration with Existing Cycle System

```typescript
// components/FatigueClock/FatigueClock.tsx
interface FatigueClockProps {
  current: number;
  max: number;
}

export function FatigueClock({ current, max }: FatigueClockProps) {
  const percentage = (current / max) * 100;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {/* Background circle */}
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="#333"
        strokeWidth="8"
      />

      {/* Progress circle */}
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={current >= max ? '#e74c3c' : '#3498db'}
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)" // Start at top like clock
        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
      />

      {/* Segment markers */}
      {Array.from({ length: max }).map((_, i) => {
        const angle = (i / max) * 360 - 90;
        const x1 = 60 + (radius - 5) * Math.cos((angle * Math.PI) / 180);
        const y1 = 60 + (radius - 5) * Math.sin((angle * Math.PI) / 180);
        const x2 = 60 + (radius + 5) * Math.cos((angle * Math.PI) / 180);
        const y2 = 60 + (radius + 5) * Math.sin((angle * Math.PI) / 180);

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#fff"
            strokeWidth="2"
          />
        );
      })}

      {/* Center text */}
      <text
        x="60"
        y="65"
        textAnchor="middle"
        fontSize="20"
        fill="#fff"
        fontWeight="bold"
      >
        {current}/{max}
      </text>
    </svg>
  );
}
```

**Source:** [Build SVG Circular Progress with React Hooks](https://blog.logrocket.com/build-svg-circular-progress-component-react-hooks/), Existing Clock component (Clock.tsx)

### VCR-Style Testing for LLM Conversations

```typescript
// e2e/fixtures/llm-vcr.ts
import { test as base } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Fixture for recording/replaying LLM responses
export const test = base.extend({
  recordedResponses: async ({ page }, use, testInfo) => {
    const recordingPath = path.join(
      __dirname,
      'recordings',
      `${testInfo.titlePath.join('-')}.json`
    );

    let recordings: Record<string, string> = {};

    // Load existing recordings if present
    if (fs.existsSync(recordingPath)) {
      recordings = JSON.parse(fs.readFileSync(recordingPath, 'utf-8'));
    }

    // Intercept API calls to /api/dialogue
    await page.route('**/api/dialogue', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      // Create deterministic key from request
      const key = JSON.stringify({
        npcId: postData.npcId,
        topic: postData.topic,
        approach: postData.approach,
      });

      if (recordings[key]) {
        // Replay recorded response
        await route.fulfill({
          status: 200,
          body: recordings[key],
          headers: { 'Content-Type': 'text/plain' },
        });
      } else {
        // Record new response (in record mode)
        const response = await route.fetch();
        const body = await response.text();
        recordings[key] = body;

        // Save to disk
        fs.writeFileSync(recordingPath, JSON.stringify(recordings, null, 2));

        await route.fulfill({ response });
      }
    });

    await use(recordings);
  },
});

// Usage in tests
test('Player can investigate NPC to learn about sin', async ({ page }) => {
  await page.goto('/');

  // ... character setup

  // Start conversation (will use recorded response)
  await page.getByTestId('npc-sheriff-jacob').click();
  await page.getByTestId('topic-chip-town-trouble').click();
  await page.getByTestId('approach-chip-heart').click();

  // Verify response appears (deterministic from recording)
  await expect(page.getByTestId('dialogue-response')).toContainText(
    'The Steward has been preaching strange doctrines'
  );

  // Verify discovery appears
  await expect(page.getByTestId('discovery-false-doctrine')).toBeVisible();
});
```

**Source:** [Mocking LLM Responses SDLC](https://medium.com/@vuongngo/effective-practices-for-mocking-llm-responses-during-the-software-development-lifecycle-73f726c3f994), Existing test structure (character.spec.ts)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct OpenAI SDK calls | Vercel AI SDK provider abstraction | 2024-2025 (AI SDK 3.x → 6.x) | Easy provider switching, unified streaming API |
| D3 + manual React integration | React Flow library | 2021-present | 90% less code for graph UIs, better performance |
| Custom streaming protocols | Server-Sent Events (SSE) | 2023-present | Native LLM API support, simpler client code |
| Prompt-only guardrails | Server-side knowledge filtering | 2025-2026 | Actual security vs. hope-based security |
| Netlify Functions (10s timeout) | Vercel Fluid Compute (800s) | 2024-2025 | Long-running LLM calls feasible |
| Manual FSM with switch statements | TypeScript FSM libraries | 2023-present | Type-safe state transitions |
| Redux for all state | Context + useReducer for local, Zustand/Jotai for shared | 2024-2026 | Less boilerplate, better performance |

**Deprecated/outdated:**
- **react-d3-graph**: Maintained but less actively developed than React Flow, harder customization
- **OpenAI API v1 completions**: v2 uses chat format, streaming changed
- **Edge Functions for long LLM calls on Netlify**: 50ms CPU limit too restrictive, use Vercel or Background Functions
- **Prompt engineering as primary guardrail**: 2026 consensus is deterministic filtering + prompts, not prompts alone

## Open Questions

Things that couldn't be fully resolved:

1. **Inner Voice Generation: Template vs LLM**
   - What we know: Templates are deterministic/fast, LLM-generated is dynamic/expensive
   - What's unclear: Whether variety from LLM justifies API cost for flavor text
   - Recommendation: Start with templates, A/B test LLM version if budget allows

2. **Sin Progression Structure: Linear vs Branching DAG**
   - What we know: DitV lore describes linear chain (Pride → Injustice → Sin → Demonic → False Doctrine → Sorcery → Hate → Murder)
   - What's unclear: Whether branching (e.g., multiple paths from Sin) adds gameplay value or complexity
   - Recommendation: Start with linear for Phase 5, evaluate branching in Phase 6 town generation

3. **Mental Map Layout: Auto-Layout vs Manual Positioning**
   - What we know: React Flow supports Dagre/Elk auto-layout, or manual positioning
   - What's unclear: Whether auto-layout creates readable graphs for 5-10 sin nodes + 5-10 NPC nodes
   - Recommendation: Manual positioning for MVP (predictable), test auto-layout for dynamic towns

4. **Fatigue Clock Segment Count**
   - What we know: Citizen Sleeper uses 5-6 segments per cycle
   - What's unclear: Optimal balance for investigation (too few = no choices, too many = grindy)
   - Recommendation: Start with 6 segments, 1 per conversation, playtest and adjust

5. **Approach-Triggered Conflict Threshold**
   - What we know: Body/Will approaches can escalate to conflict
   - What's unclear: Probability formula (always? NPC-dependent? Relationship-gated?)
   - Recommendation: Make NPC-specific (some NPCs always resist Body, others tolerate), override in CONTEXT.md if user has preference

## Sources

### Primary (HIGH confidence)
- [Vercel AI SDK Documentation](https://vercel.com/docs/ai-sdk) - Official docs, current as of 2026
- [React Flow Documentation](https://reactflow.dev/learn) - Official docs, verified features
- [Vercel Functions Limitations](https://vercel.com/docs/functions/limitations) - Official timeout/payload limits
- [Vercel Streaming Functions](https://vercel.com/docs/functions/streaming-functions) - Official streaming patterns
- [Netlify Edge Functions Limits](https://docs.netlify.com/build/edge-functions/limits/) - Official constraints
- Existing codebase (useGameState.tsx, useNPCMemory.tsx, character.spec.ts) - Verified patterns

### Secondary (MEDIUM confidence)
- [Multi-provider LLM orchestration in production: A 2026 Guide](https://dev.to/ash_dubai/multi-provider-llm-orchestration-in-production-a-2026-guide-1g10) - Community guide, cross-verified with SDK docs
- [State Management in 2026: Redux, Context API, and Modern Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) - Educational resource, aligns with React docs
- [Prompt Engineering with Guardrails](https://www.endtrace.com/prompt-engineering-with-guardrails-guide/) - Industry blog, verified against academic research
- [Testing LLM Applications: A Practical Guide](https://langfuse.com/blog/2025-10-21-testing-llm-applications) - From LLM observability company, corroborated by multiple sources
- [Disco Elysium Skills Guide](https://game.dazepuzzle.com/disco-elysium-skills-guide/) - Game analysis, design patterns verified by wiki
- [Dogs in the Vineyard PDF](https://i.4pcdn.org/tg/1515706438642.pdf) - Original rulebook, authoritative for sin progression

### Tertiary (LOW confidence)
- [WebSearch: ReAct Prompting patterns](https://www.promptingguide.ai/techniques/react) - Different "ReAct" from React library, informational only
- [WebSearch: Branching narrative structures](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/) - Emily Short blog, older (2016) but relevant patterns
- [WebSearch: TypeScript DAG libraries](https://segfaultx64.github.io/typescript-graph/) - Library docs, limited usage data

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Vercel AI SDK, React Flow, Framer Motion all verified official docs
- Architecture: HIGH - Patterns verified in official docs and existing codebase
- Pitfalls: MEDIUM-HIGH - Based on community reports and official limitations docs
- Sin progression structure: MEDIUM - DitV rulebook clear on concept, implementation details require design decision
- Testing strategy: HIGH - VCR pattern well-established for API mocking, confirmed by multiple sources
- Inner voice implementation: MEDIUM - Pattern clear (stat-based), generation method (template vs LLM) is design choice

**Research date:** 2026-01-22
**Valid until:** ~30 days (Vercel AI SDK updates frequently, serverless limits stable)

**Research domains covered:**
- LLM integration architecture ✓
- Serverless function patterns ✓
- React state management for dialogue ✓
- Graph visualization libraries ✓
- Testing strategies for non-deterministic systems ✓
- Existing codebase integration ✓
- UI patterns (typewriter, chips, clocks) ✓
- Sin progression data modeling ✓
- Resolution detection logic ✓
