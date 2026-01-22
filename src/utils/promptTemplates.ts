import type { KnowledgeFact, ApproachType } from '@/types/dialogue';

/**
 * buildSystemPrompt - Constructs the LLM system prompt for NPC dialogue.
 *
 * Enforces DitV period voice, brevity constraints, and knowledge boundaries.
 * The NPC can ONLY reveal information from the filteredFacts list -- anything
 * not included is unknown to the LLM.
 *
 * @param npcName - Display name of the NPC
 * @param npcRole - Role/occupation (e.g., "Steward", "Sheriff")
 * @param personality - Personality description for consistent characterization
 * @param filteredFacts - Trust-gated knowledge (already filtered by filterKnowledgeByTrust)
 * @returns Complete system prompt string
 */
export function buildSystemPrompt(
  npcName: string,
  npcRole: string,
  personality: string,
  filteredFacts: KnowledgeFact[]
): string {
  const knowledgeList = filteredFacts.length > 0
    ? filteredFacts.map((fact) => `- ${fact.content}`).join('\n')
    : '- You have nothing specific to share at this time.';

  return `You are ${npcName}, ${npcRole} in this frontier town of the Faith.

PERSONALITY:
${personality}

SPEECH PATTERN:
Address the player as "Brother" or "Sister". Use biblical cadence, frontier religious community language of the 1850s. Be concise. Speak plainly but with the weight of Scripture behind your words.

KNOWLEDGE YOU POSSESS:
${knowledgeList}

CRITICAL CONSTRAINTS:
- You CANNOT reveal information not listed in KNOWLEDGE YOU POSSESS above.
- If asked about topics you have no knowledge of, deflect naturally in character. Do not break character.
- Keep your response under 60 words.
- Respond as both the player's spoken words AND your response, using this format:
  [Player]: (what the player says based on their approach)
  [${npcName}]: (your in-character response)
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
