/**
 * topicResolver - Pure function that evaluates TopicRules against
 * runtime state to produce available Topics for an NPC.
 */

import type { Topic } from '@/types/dialogue';
import type { TopicRule } from '@/types/town';

/**
 * resolveTopicsForNPC - Evaluates topic rules to produce available topics for an NPC.
 *
 * @param npcId - The NPC to generate topics for
 * @param topicRules - All topic rules from town data
 * @param discoveredSinIds - IDs of discovered sin nodes
 * @param currentLocation - Player's current location ID
 * @param foundClueIds - IDs of clues the player has found (optional)
 */
export function resolveTopicsForNPC(
  npcId: string,
  topicRules: TopicRule[],
  discoveredSinIds: string[],
  currentLocation: string,
  foundClueIds: string[] = []
): Topic[] {
  const topics: Topic[] = [];

  for (const rule of topicRules) {
    switch (rule.kind) {
      case 'default':
        topics.push({
          id: `${npcId}-${rule.label}`,
          label: rule.label,
          available: true,
        });
        break;

      case 'discovery':
        if (rule.requiredSinIds.some(sinId => discoveredSinIds.includes(sinId))) {
          topics.push({
            id: `${npcId}-${rule.label}`,
            label: rule.label,
            available: true,
            requiresDiscovery: rule.requiredSinIds[0],
          });
        }
        break;

      case 'location':
        if (rule.npcId === npcId && currentLocation === rule.locationId) {
          topics.push({
            id: rule.topicId ?? `${npcId}-${rule.label}`,
            label: rule.label,
            available: true,
            locationOnly: rule.locationId,
          });
        }
        break;

      case 'clue':
        // Clue-gated: only appears when the required clue has been found
        if (foundClueIds.includes(rule.requiredClueId)) {
          if (!rule.npcId || rule.npcId === npcId) {
            topics.push({
              id: `${npcId}-clue-${rule.requiredClueId}`,
              label: rule.label,
              available: true,
              requiresClue: rule.requiredClueId,
            });
          }
        }
        break;
    }
  }

  return topics;
}
