/**
 * Town types - Defines the complete shape of a town and its
 * data-driven topic rules for NPC conversations.
 */

import type { Location } from '@/types/game';
import type { NPC } from '@/types/npc';
import type { SinNode } from '@/types/investigation';

/**
 * TopicRule - Declarative rule for which topics are available to NPCs.
 * Replaces hardcoded getTopicsForNPC functions with data.
 */
export type TopicRule = DefaultTopicRule | DiscoveryTopicRule | LocationTopicRule;

export interface DefaultTopicRule {
  kind: 'default';
  label: string;
}

export interface DiscoveryTopicRule {
  kind: 'discovery';
  label: string;
  /** Any of these sin IDs being discovered unlocks this topic (OR semantics) */
  requiredSinIds: string[];
}

export interface LocationTopicRule {
  kind: 'location';
  label: string;
  npcId: string;
  locationId: string;
  /** Custom topic ID override (defaults to `${npcId}-${label}`) */
  topicId?: string;
}

/**
 * TownData - Complete definition of a town.
 * Each town file in src/data/towns/ exports one of these.
 */
export interface TownData {
  id: string;
  name: string;
  description: string;
  locations: Location[];
  npcs: NPC[];
  sinChain: SinNode[];
  topicRules: TopicRule[];
}
