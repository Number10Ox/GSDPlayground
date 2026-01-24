import type { DialogueState, DialogueAction } from '@/types/dialogue';

/**
 * Initial dialogue state - conversation is idle with no NPC.
 */
export const initialDialogueState: DialogueState = {
  phase: 'IDLE',
  currentNPC: null,
  selectedTopic: null,
  conversationHistory: [],
  streamingText: '',
  newDiscoveries: [],
  availableTopics: [],
  npcDeflected: false,
  deflectedTopicLabel: null,
  dialogueOptions: [],
  selectedOption: null,
};

/**
 * Dialogue reducer - FSM for NPC conversations.
 *
 * Phase transitions:
 *   IDLE -> SELECTING_TOPIC (START_CONVERSATION)
 *   SELECTING_TOPIC -> GENERATING_OPTIONS (SELECT_TOPIC)
 *   GENERATING_OPTIONS -> SELECTING_OPTION (SET_OPTIONS)
 *   SELECTING_OPTION -> STREAMING_RESPONSE (SELECT_OPTION)
 *   STREAMING_RESPONSE -> RESPONSE_COMPLETE (FINISH_RESPONSE)
 *   RESPONSE_COMPLETE -> SHOWING_DISCOVERY | SELECTING_TOPIC (ACKNOWLEDGE_RESPONSE)
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
        ...initialDialogueState,
        phase: 'SELECTING_TOPIC',
        currentNPC: action.npcId,
        availableTopics: action.topics,
      };
    }

    case 'SELECT_TOPIC': {
      // Guard: only from SELECTING_TOPIC
      if (state.phase !== 'SELECTING_TOPIC') return state;

      return {
        ...state,
        phase: 'GENERATING_OPTIONS',
        selectedTopic: action.topic,
        streamingText: '',
        npcDeflected: false,
        deflectedTopicLabel: null,
        dialogueOptions: [],
        selectedOption: null,
      };
    }

    case 'SET_OPTIONS_LOADING': {
      if (state.phase !== 'GENERATING_OPTIONS') return state;
      return state;
    }

    case 'SET_OPTIONS': {
      if (state.phase !== 'GENERATING_OPTIONS') return state;
      return {
        ...state,
        phase: 'SELECTING_OPTION',
        dialogueOptions: action.options,
      };
    }

    case 'SELECT_OPTION': {
      if (state.phase !== 'SELECTING_OPTION') return state;
      return {
        ...state,
        phase: 'STREAMING_RESPONSE',
        selectedOption: action.option,
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

      return {
        ...state,
        phase: 'RESPONSE_COMPLETE',
        conversationHistory: newHistory,
        newDiscoveries: action.discoveries,
        streamingText: '',
      };
    }

    case 'ACKNOWLEDGE_RESPONSE': {
      // Guard: only from RESPONSE_COMPLETE
      if (state.phase !== 'RESPONSE_COMPLETE') return state;

      const hasDiscoveries = state.newDiscoveries.length > 0;
      // Mark the topic as explored
      const updatedTopics = state.availableTopics.map(t =>
        t.id === state.selectedTopic?.id ? { ...t, explored: true } : t
      );

      // End conversation after 3+ exchanges (prevents unlimited trust farming)
      if (!hasDiscoveries && state.conversationHistory.length >= 3) {
        return initialDialogueState;
      }

      return {
        ...state,
        phase: hasDiscoveries ? 'SHOWING_DISCOVERY' : 'SELECTING_TOPIC',
        selectedTopic: hasDiscoveries ? state.selectedTopic : null,
        availableTopics: updatedTopics,
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
      };
    }

    case 'MARK_DEFLECTION': {
      return {
        ...state,
        npcDeflected: true,
        deflectedTopicLabel: action.topicLabel,
      };
    }

    case 'STREAM_ERROR': {
      // Recover from failed stream — return to topic selection
      if (state.phase !== 'STREAMING_RESPONSE' && state.phase !== 'GENERATING_OPTIONS') return state;
      return {
        ...state,
        phase: 'SELECTING_TOPIC',
        streamingText: '',
        selectedTopic: null,
        dialogueOptions: [],
        selectedOption: null,
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
