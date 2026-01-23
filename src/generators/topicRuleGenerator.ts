/**
 * Topic Rule Generator
 *
 * Produces TopicRule[] arrays from NPC, sin chain, and location data.
 * Generated rules cover:
 * 1. Default topics (always available to every NPC)
 * 2. Discovery-gated topics (unlocked when sins are discovered)
 * 3. Location-specific topics (available only at NPC's home location)
 *
 * Output is compatible with resolveTopicsForNPC() in topicResolver.ts.
 */

import type { TopicRule } from '@/types/town';
import type { NPC } from '@/types/npc';
import type { SinNode } from '@/types/investigation';
import type { Location } from '@/types/game';

/**
 * Converts a sin name to a topic label in kebab-case.
 * e.g., "Steward's Pride" -> "stewards-pride"
 */
function sinNameToLabel(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Maps NPC location types to topic label prefixes.
 * Used to generate location-specific topic labels.
 */
const LOCATION_TYPE_TOPICS: Record<string, string> = {
  'meeting-house': 'governance',
  'jail': 'law-records',
  'homestead': 'home-life',
  'farm': 'crop-talk',
  'schoolhouse': 'school-matters',
  'chapel': 'chapel-doctrine',
  'general-store': 'store-goods',
};

/**
 * Generates topic rules from NPCs, sin chain, and locations.
 * Ensures every sin has at least one discovery-gated topic that references it.
 *
 * @param npcs - Generated NPCs with locationId assignments
 * @param sinChain - The town's sin progression nodes
 * @param locations - Generated locations with IDs
 * @returns TopicRule[] compatible with resolveTopicsForNPC()
 */
export function generateTopicRules(
  npcs: NPC[],
  sinChain: SinNode[],
  locations: Location[]
): TopicRule[] {
  const rules: TopicRule[] = [];

  // 1. Default topics (always available to every NPC)
  rules.push({ kind: 'default', label: 'greeting' });
  rules.push({ kind: 'default', label: 'the-town' });

  // 2. Discovery-gated topics (one per sin node)
  const coveredSinIds = new Set<string>();

  for (const sinNode of sinChain) {
    const label = sinNameToLabel(sinNode.name);
    rules.push({
      kind: 'discovery',
      label,
      requiredSinIds: [sinNode.id],
    });
    coveredSinIds.add(sinNode.id);
  }

  // 3. Cross-referencing discovery topics for sins that connect to adjacent levels
  // Pair adjacent sins to create multi-gate topics (like steward-decree needing either pride or injustice)
  for (let i = 0; i < sinChain.length - 1; i++) {
    const current = sinChain[i];
    const next = sinChain[i + 1];
    const combinedLabel = `${sinNameToLabel(current.name)}-consequence`;
    rules.push({
      kind: 'discovery',
      label: combinedLabel,
      requiredSinIds: [current.id, next.id],
    });
  }

  // 4. Location-specific topics (one per NPC at their home location)
  for (const npc of npcs) {
    const npcLocation = locations.find(l => l.id === npc.locationId);
    if (!npcLocation) continue;

    // Determine topic label based on NPC role or location
    const roleLabel = npc.role ? npc.role.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'local-knowledge';
    const topicLabel = LOCATION_TYPE_TOPICS[roleLabel] || `${roleLabel}-matters`;

    rules.push({
      kind: 'location',
      label: topicLabel,
      npcId: npc.id,
      locationId: npc.locationId,
      topicId: `${npc.id}-${topicLabel}`,
    });
  }

  // 5. Verify every sin is reachable (has at least one discovery topic)
  for (const sinNode of sinChain) {
    if (!coveredSinIds.has(sinNode.id)) {
      // This should not happen given the loop above, but safety check
      rules.push({
        kind: 'discovery',
        label: `hidden-${sinNameToLabel(sinNode.name)}`,
        requiredSinIds: [sinNode.id],
      });
    }
  }

  return rules;
}
