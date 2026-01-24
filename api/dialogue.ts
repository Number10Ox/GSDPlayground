import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { filterKnowledgeByTrust } from '../src/utils/knowledgeGating.ts';
import { buildSystemPrompt, buildUserPrompt } from '../src/utils/promptTemplates.ts';
import type { KnowledgeFact, ApproachType } from '../src/types/dialogue.ts';

/**
 * Valid approach types for runtime validation.
 */
const VALID_APPROACHES: ApproachType[] = ['acuity', 'heart', 'body', 'will'];

/**
 * DialogueRequestBody - Expected shape of incoming request payload.
 */
interface DialogueRequestBody {
  npcId: string;
  npcName: string;
  npcRole: string;
  npcPersonality: string;
  npcFacts: KnowledgeFact[];
  npcMotivation?: string;
  npcDesire?: string;
  npcFear?: string;
  npcRelationships?: string[];
  townSituation?: string;
  topic: string;
  approach: ApproachType;
  trustLevel: number;
  statValue: number;
}

/**
 * Vercel serverless function configuration.
 * maxDuration prevents timeout on long LLM responses.
 */
export const config = {
  maxDuration: 30,
};

/**
 * POST handler - Dialogue API endpoint.
 *
 * Flow:
 * 1. Parse and validate request body
 * 2. Filter NPC facts by trust level (server-side guardrail)
 * 3. Build system prompt with filtered knowledge only
 * 4. Build user prompt with approach and stat value
 * 5. Stream LLM response back to client
 *
 * The trust-gating happens server-side to prevent prompt injection:
 * even if a client sends manipulated data, the server filters facts
 * before they enter the LLM prompt.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as DialogueRequestBody;

    // Input validation
    if (!body.approach || !VALID_APPROACHES.includes(body.approach)) {
      return new Response(
        JSON.stringify({ error: `Invalid approach. Must be one of: ${VALID_APPROACHES.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (typeof body.trustLevel !== 'number' || body.trustLevel < 0 || body.trustLevel > 100) {
      return new Response(
        JSON.stringify({ error: 'trustLevel must be a number between 0 and 100' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!body.npcName || !body.npcRole || !body.topic) {
      return new Response(
        JSON.stringify({ error: 'npcName, npcRole, and topic are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Server-side knowledge gating: filter facts by trust and approach
    const safeFacts = filterKnowledgeByTrust(
      body.npcFacts || [],
      body.trustLevel,
      body.approach
    );

    // Build prompts with only the safe (trust-gated) knowledge
    const systemPrompt = buildSystemPrompt({
      npcName: body.npcName,
      npcRole: body.npcRole,
      personality: body.npcPersonality || '',
      filteredFacts: safeFacts,
      motivation: body.npcMotivation,
      desire: body.npcDesire,
      fear: body.npcFear,
      relationships: body.npcRelationships,
      townSituation: body.townSituation,
    });

    const userPrompt = buildUserPrompt(
      body.topic,
      body.approach,
      body.statValue || 3
    );

    // Stream LLM response using AI SDK v6 format
    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxOutputTokens: 800,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
