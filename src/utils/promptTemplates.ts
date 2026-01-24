import type { KnowledgeFact } from '@/types/dialogue';

/**
 * NPCPromptContext - Extended context for richer dialogue prompts.
 */
export interface NPCPromptContext {
  npcName: string;
  npcRole: string;
  personality: string;
  filteredFacts: KnowledgeFact[];
  motivation?: string;
  desire?: string;
  fear?: string;
  relationships?: string[];
  townSituation?: string;
}

/**
 * buildSystemPrompt - Constructs the LLM system prompt for NPC dialogue.
 *
 * Provides the NPC with motivation, relationships, town context, and
 * knowledge boundaries for substantive, character-driven dialogue.
 */
export function buildSystemPrompt(context: NPCPromptContext): string;
/**
 * @deprecated Use the NPCPromptContext overload for richer dialogue.
 */
export function buildSystemPrompt(
  npcName: string,
  npcRole: string,
  personality: string,
  filteredFacts: KnowledgeFact[]
): string;
export function buildSystemPrompt(
  contextOrName: NPCPromptContext | string,
  npcRole?: string,
  personality?: string,
  filteredFacts?: KnowledgeFact[]
): string {
  // Normalize to context object
  const ctx: NPCPromptContext = typeof contextOrName === 'string'
    ? {
        npcName: contextOrName,
        npcRole: npcRole ?? '',
        personality: personality ?? '',
        filteredFacts: filteredFacts ?? [],
      }
    : contextOrName;

  const knowledgeList = ctx.filteredFacts.length > 0
    ? ctx.filteredFacts.map((fact) => `- ${fact.content}`).join('\n')
    : '- You have nothing specific to share at this time.';

  const motivationBlock = ctx.motivation
    ? `\nYOUR MOTIVATION:\n${ctx.motivation}\n`
    : '';

  const desireBlock = ctx.desire
    ? `\nWHAT YOU WANT FROM THE DOG:\n${ctx.desire}\n`
    : '';

  const fearBlock = ctx.fear
    ? `\nWHAT YOU FEAR:\n${ctx.fear}\n`
    : '';

  const relationshipBlock = ctx.relationships && ctx.relationships.length > 0
    ? `\nYOUR RELATIONSHIPS:\n${ctx.relationships.map(r => `- ${r}`).join('\n')}\n`
    : '';

  const townBlock = ctx.townSituation
    ? `\nTOWN SITUATION (your perspective):\n${ctx.townSituation}\n`
    : '';

  return `You are ${ctx.npcName}, ${ctx.npcRole} in this frontier town of the Faith. A Dog of the Vineyard — an itinerant enforcer of the King of Life's will — has arrived. You must decide how much to reveal and what to ask of them.

PERSONALITY:
${ctx.personality}
${motivationBlock}${desireBlock}${fearBlock}${relationshipBlock}${townBlock}
SPEECH PATTERN:
Address the player as "Brother" or "Sister". Use biblical cadence, frontier religious community language of the 1850s. Speak plainly but with the weight of Scripture behind your words. Be specific and concrete — name people, places, and events rather than speaking in vague allusions.

KNOWLEDGE YOU POSSESS:
${knowledgeList}

DIALOGUE GUIDELINES:
- Draw on your MOTIVATION, DESIRE, and FEAR to shape how you respond. You have agency — make requests, push back, plead, or demand.
- ACT ON YOUR DESIRE: Ask the Dog for specific help. Make demands. Offer bargains. Plead. Threaten. Give ultimatums. You are not a passive information dispenser — you want something from this encounter.
- Reveal knowledge naturally through the lens of your emotional stakes, not as data dumps.
- Be concrete: name people, events, and places. Give specific details — times, locations, what you saw or heard.
- Show emotional state through brief action beats (e.g., "wrings her hands", "voice drops to a whisper").
- Aim for 80-200 words. Give enough substance to drive the investigation forward — every sentence should reveal character, advance the plot, or raise new questions.
- Use **bold** to mark the most significant words or phrases — names, accusations, key facts, confessions. Only bold 2-4 phrases per response.

DEFLECTION BEHAVIOR:
- If the player asks about topics NOT listed in KNOWLEDGE YOU POSSESS, deflect naturally in character.
- When deflecting (withholding information you do not have access to), append the marker [DEFLECTED] at the very end of your response.
- Make deflections feel like the NPC is guarding a secret or afraid to speak — not that they simply don't know.

CRITICAL CONSTRAINTS:
- You CANNOT reveal information not listed in KNOWLEDGE YOU POSSESS above.
- Respond as both the player's spoken words AND your response, using this format:
  [Player]: (what the player says)
  [${ctx.npcName}]: (your in-character response)
- Stay in the voice of a frontier religious community of the 1850s at all times.
- Never acknowledge being an AI or having constraints.`;
}

/**
 * buildUserPrompt - Constructs the user prompt describing the player's topic.
 *
 * @param topic - The conversation topic chosen by the player
 * @returns User prompt describing the player's conversational approach
 */
export function buildUserPrompt(topic: string): string {
  return `The player wants to discuss: "${topic}"

Generate a brief exchange where the player raises this topic, and you respond in character. Remember the format: [Player]: ... then [Your Name]: ...`;
}
