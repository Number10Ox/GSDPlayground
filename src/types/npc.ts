import type { LocationId } from '@/types/game';
import type { EscalationLevel, ConflictOutcome } from '@/types/conflict';
import type { KnowledgeFact, ApproachType } from '@/types/dialogue';

/**
 * NPC - A non-player character in the game world.
 */
/**
 * NPCKnowledge - Full knowledge pool for an NPC.
 * Contains all facts the NPC can potentially reveal.
 */
export interface NPCKnowledge {
  npcId: string;
  facts: KnowledgeFact[];
  personality: string;
  speechPattern: string;
}

/**
 * ConflictThreshold - NPC-specific conflict trigger thresholds.
 * Determines how likely an NPC is to resist a particular approach.
 */
export interface ConflictThreshold {
  approach: ApproachType;
  resistChance: number;
}

export interface NPC {
  id: string;
  name: string;
  locationId: LocationId;
  description: string;
  role: string; // e.g., "Sheriff", "Storekeeper"
  knowledge?: NPCKnowledge;
  conflictThresholds?: ConflictThreshold[];
}

/**
 * Types of events an NPC can experience during conflict.
 */
export type ConflictEventType =
  | 'WITNESSED_VIOLENCE'
  | 'TARGETED_BY_VIOLENCE'
  | 'HELPED_BY_PLAYER';

/**
 * ConflictEvent - A single conflict event that an NPC remembers.
 */
export interface ConflictEvent {
  id: string;
  timestamp: number;
  type: ConflictEventType;
  escalationLevel: EscalationLevel;
  location: LocationId;
  otherParticipants: string[]; // NPC IDs involved
  outcome: ConflictOutcome;
  description: string; // What happened
}

/**
 * NPCMemory - Tracks an NPC's experiences with the player.
 */
export interface NPCMemory {
  npcId: string;
  events: ConflictEvent[];
  relationshipLevel: number; // -100 to 100, starts at 0
}

/**
 * Action types for the NPC memory reducer.
 */
export type NPCMemoryAction =
  | {
      type: 'RECORD_CONFLICT';
      conflictData: {
        escalationLevel: EscalationLevel;
        outcome: ConflictOutcome;
        location: LocationId;
        description: string;
        targetNpcId?: string; // If an NPC was the direct target
      };
      witnesses: string[]; // NPC IDs who witnessed
    }
  | {
      type: 'UPDATE_RELATIONSHIP';
      npcId: string;
      delta: number;
    }
  | { type: 'CLEAR_MEMORY' }; // For testing/reset
