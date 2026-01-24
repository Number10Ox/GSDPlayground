/**
 * Town types - Defines the complete shape of a town and its
 * data-driven topic rules for NPC conversations.
 */

import type { Location } from '@/types/game';
import type { NPC } from '@/types/npc';
import type { SinNode, LocationClue } from '@/types/investigation';
import type { TimedAction, ConflictDefinition } from '@/types/actions';
import type { DescentThreshold } from '@/types/descent';

/**
 * TopicRule - Declarative rule for which topics are available to NPCs.
 * Replaces hardcoded getTopicsForNPC functions with data.
 */
export type TopicRule = DefaultTopicRule | DiscoveryTopicRule | LocationTopicRule | ClueTopicRule;

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

export interface ClueTopicRule {
  kind: 'clue';
  label: string;
  /** Clue ID that must be found to unlock this topic */
  requiredClueId: string;
  /** Optional: only for specific NPC */
  npcId?: string;
}

/**
 * ArrivalData - What the Dog knows/sees upon arriving at a town.
 */
export interface ArrivalData {
  /** Narrative text describing the Dog's arrival */
  narrative: string;
  /** NPC who approaches the Dog first (by ID) */
  greeterNpcId?: string;
  /** What the Dog has heard on the road (seeds initial investigation context) */
  rumors: string[];
  /** Initial observation the Dog makes (something feels wrong) */
  observation: string;
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
  clues: LocationClue[];
  topicRules: TopicRule[];
  arrival?: ArrivalData;
  events?: TownEvent[];
  /** Whether the town has formal law enforcement (enables Sheriff NPC) */
  hasLaw?: boolean;
  /** Timed actions available at locations (tick descent clock) */
  timedActions?: TimedAction[];
  /** Conflict encounters available at locations (full DitV conflicts) */
  conflictDefinitions?: ConflictDefinition[];
  /** Descent thresholds that trigger events */
  descentThresholds?: DescentThreshold[];
}

/**
 * TownEvent - Something that happens between cycles, driven by NPCs or sin progression.
 */
export interface TownEvent {
  id: string;
  description: string;
  trigger: EventTrigger;
  effects: EventEffect[];
  fired: boolean;
}

export type EventTrigger =
  | { type: 'DESCENT_REACHED'; value: number }
  | { type: 'SIN_LEVEL'; sinId: string; level: string }
  | { type: 'DISCOVERY_MADE'; discoveryId: string }
  | { type: 'NPC_TRUST'; npcId: string; threshold: number }
  | { type: 'CLUE_FOUND'; clueId: string };

export type EventEffect =
  | { type: 'ADVANCE_SIN' }
  | { type: 'TRUST_CHANGE'; npcId: string; delta: number }
  | { type: 'UNLOCK_CLUE'; clueId: string }
  | { type: 'NARRATIVE'; text: string };
