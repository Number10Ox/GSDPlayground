import type { DialogueState, DialogueAction } from '@/types/dialogue';

/**
 * Initial dialogue state - conversation is idle with no NPC.
 */
export const initialDialogueState: DialogueState = {
  phase: 'IDLE',
  currentNPC: null,
  selectedTopic: null,
  selectedApproach: null,
  conversationHistory: [],
  streamingText: '',
  newDiscoveries: [],
  availableTopics: [],
};

/**
 * Dialogue reducer - FSM for NPC conversations.
 *
 * Phase transitions:
 *   IDLE -> SELECTING_TOPIC (START_CONVERSATION)
 *   SELECTING_TOPIC -> SELECTING_APPROACH (SELECT_TOPIC)
 *   SELECTING_APPROACH -> STREAMING_RESPONSE (SELECT_APPROACH)
 *   STREAMING_RESPONSE -> SHOWING_DISCOVERY | SELECTING_TOPIC (FINISH_RESPONSE)
 *   SHOWING_DISCOVERY -> SELECTING_TOPIC | IDLE (CLOSE_DISCOVERY)
 *   Any -> IDLE (END_CONVERSATION)
 *
 * Uses silent fail pattern: invalid transitions return state unchanged.
 */
export function dialogueReducer(
  state: DialogueState,
  action: DialogueAction
): DialogueState {
  switch (action.type) {
    case 'START_CONVERSATION': {
      // Guard: only from IDLE
      if (state.phase !== 'IDLE') return state;

      return {
        ...state,
        phase: 'SELECTING_TOPIC',
        currentNPC: action.npcId,
        availableTopics: action.topics,
        conversationHistory: [],
        newDiscoveries: [],
      };
    }

    case 'SELECT_TOPIC': {
      // Guard: only from SELECTING_TOPIC
      if (state.phase !== 'SELECTING_TOPIC') return state;

      return {
        ...state,
        phase: 'SELECTING_APPROACH',
        selectedTopic: action.topic,
      };
    }

    case 'SELECT_APPROACH': {
      // Guard: only from SELECTING_APPROACH
      if (state.phase !== 'SELECTING_APPROACH') return state;

      return {
        ...state,
        phase: 'STREAMING_RESPONSE',
        selectedApproach: action.approach,
        streamingText: '',
      };
    }

    case 'APPEND_RESPONSE': {
      // Guard: only during streaming
      if (state.phase !== 'STREAMING_RESPONSE') return state;

      return {
        ...state,
        streamingText: state.streamingText + action.text,
      };
    }

    case 'FINISH_RESPONSE': {
      // Guard: only from STREAMING_RESPONSE
      if (state.phase !== 'STREAMING_RESPONSE') return state;

      const newHistory = [...state.conversationHistory, action.turn];
      const hasDiscoveries = action.discoveries.length > 0;

      return {
        ...state,
        phase: hasDiscoveries ? 'SHOWING_DISCOVERY' : 'SELECTING_TOPIC',
        conversationHistory: newHistory,
        newDiscoveries: action.discoveries,
        streamingText: '',
        // Reset selections for next exchange
        selectedTopic: hasDiscoveries ? state.selectedTopic : null,
        selectedApproach: hasDiscoveries ? state.selectedApproach : null,
      };
    }

    case 'CLOSE_DISCOVERY': {
      // Guard: only from SHOWING_DISCOVERY
      if (state.phase !== 'SHOWING_DISCOVERY') return state;

      // End conversation after 3+ exchanges
      if (state.conversationHistory.length >= 3) {
        return initialDialogueState;
      }

      return {
        ...state,
        phase: 'SELECTING_TOPIC',
        newDiscoveries: [],
        selectedTopic: null,
        selectedApproach: null,
      };
    }

    case 'END_CONVERSATION': {
      // Can end from any phase
      return initialDialogueState;
    }

    default:
      return state;
  }
}
