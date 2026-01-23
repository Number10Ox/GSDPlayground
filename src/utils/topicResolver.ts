/**
 * topicResolver - Pure function that evaluates TopicRules against
 * runtime state to produce available Topics for an NPC.
 */

import type { Topic } from '@/types/dialogue';
import type { TopicRule } from '@/types/town';

/**
 * resolveTopicsForNPC - Evaluates topic rules to produce available topics for an NPC.
 */
export function resolveTopicsForNPC(
  npcId: string,
  topicRules: TopicRule[],
  discoveredSinIds: string[],
  currentLocation: string
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
    }
  }

  return topics;
}
