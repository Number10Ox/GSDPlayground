import type { KnowledgeFact, ApproachType, Topic } from '@/types/dialogue';
import type { Discovery } from '@/types/investigation';

/**
 * NPCKnowledge - Full knowledge pool for an NPC.
 * Contains all facts and topics an NPC could potentially discuss.
 */
export interface NPCKnowledge {
  npcId: string;
  facts: KnowledgeFact[];
  topics: Topic[];
}

/**
 * filterKnowledgeByTrust - Filters NPC knowledge facts based on current trust level
 * and optionally by approach type.
 *
 * This is the core guardrail: facts with minTrustLevel above the player's current
 * trust will NEVER be included in the LLM prompt, preventing knowledge leakage
 * regardless of prompt injection attempts.
 *
 * @param facts - Full pool of NPC knowledge facts
 * @param trustLevel - Player's current trust level with this NPC (0-100)
 * @param approach - Optional approach type to filter approach-gated facts
 * @returns Filtered subset of facts the NPC CAN reveal
 */
export function filterKnowledgeByTrust(
  facts: KnowledgeFact[],
  trustLevel: number,
  approach?: ApproachType
): KnowledgeFact[] {
  return facts.filter((fact) => {
    // Trust gate: fact only available if player trust >= required level
    if (trustLevel < fact.minTrustLevel) return false;

    // Approach gate: if fact requires specific approach, only pass if it matches
    if (fact.requiredApproach && fact.requiredApproach !== approach) return false;

    return true;
  });
}

/**
 * getAvailableTopics - Determines which conversation topics are available
 * based on discoveries, location, and always-available defaults.
 *
 * @param npcKnowledge - Full NPC knowledge object with topics
 * @param discoveries - Player's current discovery list
 * @param currentLocation - Player's current location ID
 * @returns Topic[] with availability flags set
 */
export function getAvailableTopics(
  npcKnowledge: NPCKnowledge,
  discoveries: Discovery[],
  currentLocation: string
): Topic[] {
  const discoveryIds = new Set(discoveries.map((d) => d.id));

  return npcKnowledge.topics.map((topic) => {
    let available = true;

    // Discovery-gated: requires a specific discovery to unlock
    if (topic.requiresDiscovery) {
      available = discoveryIds.has(topic.requiresDiscovery);
    }

    // Location-gated: only available at a specific location
    if (topic.locationOnly && topic.locationOnly !== currentLocation) {
      available = false;
    }

    return { ...topic, available };
  });
}

/**
 * Always-available topic templates that every NPC supports.
 * These are merged with NPC-specific topics.
 */
export const DEFAULT_TOPICS: Topic[] = [
  {
    id: 'greeting',
    label: 'Greeting',
    available: true,
  },
  {
    id: 'town',
    label: 'The Town',
    available: true,
  },
];
