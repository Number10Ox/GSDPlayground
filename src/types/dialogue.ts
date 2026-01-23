/**
 * Dialogue types - Models the NPC conversation system with
 * knowledge gating, approach selection, and discovery output.
 */

import type { StatName } from '@/types/character';
import type { Discovery } from '@/types/investigation';

/**
 * ApproachType - The four stat-linked conversation approaches.
 * Each approach may unlock different knowledge from NPCs.
 */
export type ApproachType = 'acuity' | 'heart' | 'body' | 'will';

/**
 * Topic - A conversation topic the player can select.
 * Some topics require prior discoveries or specific locations.
 */
export interface Topic {
  id: string;
  label: string;
  available: boolean;
  requiresDiscovery?: string;
  requiresClue?: string;
  locationOnly?: string;
}

/**
 * KnowledgeFact - A piece of knowledge an NPC possesses.
 * Gated by trust level and optionally by approach type.
 */
export interface KnowledgeFact {
  id: string;
  content: string;
  tags: string[];
  minTrustLevel: number;
  requiredApproach?: ApproachType;
  sinId?: string;
}

/**
 * ConversationTurn - A single exchange in a conversation.
 * Tracks the player's choice of topic and approach, NPC response,
 * and any inner voice commentary.
 */
export interface ConversationTurn {
  topic: string;
  approach: ApproachType;
  playerDialogue: string;
  npcResponse: string;
  innerVoice?: {
    stat: StatName;
    text: string;
  };
}

/**
 * DialoguePhase - The FSM states for a conversation.
 */
export type DialoguePhase =
  | 'IDLE'
  | 'SELECTING_TOPIC'
  | 'SELECTING_APPROACH'
  | 'STREAMING_RESPONSE'
  | 'SHOWING_DISCOVERY';

/**
 * DialogueState - Full state of an active dialogue.
 */
export interface DialogueState {
  phase: DialoguePhase;
  currentNPC: string | null;
  selectedTopic: Topic | null;
  selectedApproach: ApproachType | null;
  conversationHistory: ConversationTurn[];
  streamingText: string;
  newDiscoveries: Discovery[];
  availableTopics: Topic[];
}

/**
 * DialogueAction - All actions the dialogue reducer handles.
 */
export type DialogueAction =
  | { type: 'START_CONVERSATION'; npcId: string; topics: Topic[] }
  | { type: 'SELECT_TOPIC'; topic: Topic }
  | { type: 'SELECT_APPROACH'; approach: ApproachType }
  | { type: 'APPEND_RESPONSE'; text: string }
  | { type: 'FINISH_RESPONSE'; turn: ConversationTurn; discoveries: Discovery[] }
  | { type: 'CLOSE_DISCOVERY' }
  | { type: 'END_CONVERSATION' };
