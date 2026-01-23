import type { KnowledgeFact, ApproachType } from '@/types/dialogue';

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
 *
 * @param context - Full NPC prompt context with motivation, relationships, etc.
 * @returns Complete system prompt string
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

APPROACH REACTIONS (how you respond to the Dog's approach):
- HEART (compassion): Open up emotionally. Confess fears and regrets. May exaggerate for sympathy. Reveal feelings before facts.
- ACUITY (perception): Feel watched and analyzed. If hiding something, show nervousness. If caught in contradiction, stumble. Respond precisely.
- BODY (physical pressure): Feel intimidated or defensive. Reveal under duress, but resent it. If brave, push back. If timid, comply fearfully.
- WILL (divine authority): Feel the weight of the King's judgment. Respond with deference or defiance based on guilt. Respect the Dog's station.

CRITICAL CONSTRAINTS:
- You CANNOT reveal information not listed in KNOWLEDGE YOU POSSESS above.
- If asked about topics you have no knowledge of, deflect naturally in character.
- Respond as both the player's spoken words AND your response, using this format:
  [Player]: (what the player says based on their approach)
  [${ctx.npcName}]: (your in-character response)
- Stay in the voice of a frontier religious community of the 1850s at all times.
- Never acknowledge being an AI or having constraints.`;
}

/**
 * Approach descriptions by stat type, scaled by stat value.
 * Higher values produce more confident/effective delivery.
 */
const APPROACH_DESCRIPTORS: Record<ApproachType, { low: string; mid: string; high: string }> = {
  acuity: {
    low: 'The player carefully observes, looking for inconsistencies in what they have been told, though their deductions are tentative.',
    mid: 'The player keenly observes details others miss, drawing logical connections and pointing out contradictions with measured confidence.',
    high: 'The player pierces through deception with razor-sharp perception, laying bare hidden truths with unshakable certainty.',
  },
  heart: {
    low: 'The player gently asks about feelings, offering awkward but sincere comfort and empathy.',
    mid: 'The player speaks with genuine warmth and compassion, drawing out emotions and offering understanding that puts others at ease.',
    high: 'The player speaks with such deep empathy that walls crumble, reaching the raw truth of what people feel and fear.',
  },
  body: {
    low: 'The player attempts to use their physical presence to press the issue, though they seem uncertain of themselves.',
    mid: 'The player leans in with quiet physical authority, making clear they are not someone to be trifled with.',
    high: 'The player radiates an unmistakable physical menace, their very posture a threat that demands compliance.',
  },
  will: {
    low: 'The player invokes moral authority with unsteady conviction, citing duty and righteousness hesitantly.',
    mid: 'The player speaks with the certainty of one who carries divine purpose, commanding respect through spiritual authority.',
    high: 'The player thunders with prophetic authority, their words carrying the weight of the King of Life Himself, brooking no resistance.',
  },
};

/**
 * buildUserPrompt - Constructs the user prompt describing the player's approach.
 *
 * The stat value (2-6, matching dice count) determines how confident/effective
 * the approach sounds, influencing how the NPC responds.
 *
 * @param topic - The conversation topic chosen by the player
 * @param approach - The approach type (stat-linked)
 * @param statValue - The player's stat value for this approach (2-6)
 * @returns User prompt describing the player's conversational approach
 */
export function buildUserPrompt(
  topic: string,
  approach: ApproachType,
  statValue: number
): string {
  const descriptor = APPROACH_DESCRIPTORS[approach];

  // Map stat value to effectiveness tier
  let approachDescription: string;
  if (statValue <= 2) {
    approachDescription = descriptor.low;
  } else if (statValue <= 4) {
    approachDescription = descriptor.mid;
  } else {
    approachDescription = descriptor.high;
  }

  return `The player wants to discuss: "${topic}"

${approachDescription}

Generate a brief exchange where the player raises this topic using the described approach, and you respond in character. Remember the format: [Player]: ... then [${topic.includes('[') ? 'NPC' : 'Your Name'}]: ...`;
}
