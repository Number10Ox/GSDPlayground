/**
 * Dialogue types - Models the NPC conversation system with
 * knowledge gating, deflection detection, and discovery output.
 */

import type { StatName } from '@/types/character';
import type { Discovery } from '@/types/investigation';

/**
 * ApproachType - The four stat-linked approaches.
 * Used at conflict entry (not during dialogue).
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
  explored?: boolean;     // True if player has already discussed this topic
  trustGated?: boolean;   // True if NPC has higher-trust facts on this topic
}

/**
 * KnowledgeFact - A piece of knowledge an NPC possesses.
 * Gated by trust level only.
 */
export interface KnowledgeFact {
  id: string;
  content: string;
  tags: string[];
  minTrustLevel: number;
  sinId?: string;
}

/**
 * ConversationTurn - A single exchange in a conversation.
 * Tracks the player's choice of topic, NPC response,
 * and any inner voice commentary.
 */
export interface ConversationTurn {
  topic: string;
  playerDialogue: string;
  npcResponse: string;
  innerVoice?: {
    stat: StatName;
    text: string;
  };
}

/**
 * DialogueTone - How the Dog delivers their words.
 */
export type DialogueTone =
  | 'compassionate'
  | 'authoritative'
  | 'inquisitive'
  | 'confrontational'
  | 'gentle'
  | 'stern';

/**
 * DialogueOption - A generated speech option for the player.
 * Replaces the silent "[Topic: label]" with authored player voice.
 */
export interface DialogueOption {
  id: string;
  text: string;
  tone: DialogueTone;
  associatedStat: StatName;
  risky: boolean;
  riskDescription?: string;
  convictionAligned: boolean;
  convictionId?: string;
}

/**
 * DialoguePhase - The FSM states for a conversation.
 */
export type DialoguePhase =
  | 'IDLE'
  | 'SELECTING_TOPIC'
  | 'GENERATING_OPTIONS'
  | 'SELECTING_OPTION'
  | 'STREAMING_RESPONSE'
  | 'RESPONSE_COMPLETE'
  | 'SHOWING_DISCOVERY';

/**
 * DialogueState - Full state of an active dialogue.
 */
export interface DialogueState {
  phase: DialoguePhase;
  currentNPC: string | null;
  selectedTopic: Topic | null;
  conversationHistory: ConversationTurn[];
  streamingText: string;
  newDiscoveries: Discovery[];
  availableTopics: Topic[];
  npcDeflected: boolean;
  deflectedTopicLabel: string | null;
  dialogueOptions: DialogueOption[];
  selectedOption: DialogueOption | null;
}

/**
 * DialogueAction - All actions the dialogue reducer handles.
 */
export type DialogueAction =
  | { type: 'START_CONVERSATION'; npcId: string; topics: Topic[] }
  | { type: 'SELECT_TOPIC'; topic: Topic }
  | { type: 'SET_OPTIONS_LOADING' }
  | { type: 'SET_OPTIONS'; options: DialogueOption[] }
  | { type: 'SELECT_OPTION'; option: DialogueOption }
  | { type: 'APPEND_RESPONSE'; text: string }
  | { type: 'FINISH_RESPONSE'; turn: ConversationTurn; discoveries: Discovery[] }
  | { type: 'ACKNOWLEDGE_RESPONSE' }
  | { type: 'CLOSE_DISCOVERY' }
  | { type: 'MARK_DEFLECTION'; topicLabel: string }
  | { type: 'END_CONVERSATION' };
