import { describe, it, expect } from 'vitest';
import { dialogueReducer, initialDialogueState } from './dialogueReducer';
import type { DialogueState, DialogueOption, Topic, ConversationTurn } from '@/types/dialogue';

const mockTopic: Topic = {
  id: 'topic-1',
  label: 'The Missing Child',
  available: true,
};

const mockOption: DialogueOption = {
  id: 'opt-1',
  text: 'Tell me what troubles you.',
  tone: 'compassionate',
  associatedStat: 'heart',
  risky: false,
  convictionAligned: false,
};

const mockTurn: ConversationTurn = {
  topic: 'The Missing Child',
  playerDialogue: 'Tell me what troubles you.',
  npcResponse: 'It has been hard since she disappeared...',
};

describe('dialogueReducer', () => {
  describe('initial state', () => {
    it('starts in IDLE phase with empty options', () => {
      expect(initialDialogueState.phase).toBe('IDLE');
      expect(initialDialogueState.dialogueOptions).toEqual([]);
      expect(initialDialogueState.selectedOption).toBeNull();
    });
  });

  describe('START_CONVERSATION', () => {
    it('transitions from IDLE to SELECTING_TOPIC', () => {
      const state = dialogueReducer(initialDialogueState, {
        type: 'START_CONVERSATION',
        npcId: 'npc-1',
        topics: [mockTopic],
      });
      expect(state.phase).toBe('SELECTING_TOPIC');
      expect(state.currentNPC).toBe('npc-1');
      expect(state.availableTopics).toEqual([mockTopic]);
    });

    it('does nothing if not in IDLE', () => {
      const active: DialogueState = { ...initialDialogueState, phase: 'SELECTING_TOPIC', currentNPC: 'npc-1' };
      const state = dialogueReducer(active, {
        type: 'START_CONVERSATION',
        npcId: 'npc-2',
        topics: [mockTopic],
      });
      expect(state.currentNPC).toBe('npc-1');
    });
  });

  describe('SELECT_TOPIC → GENERATING_OPTIONS', () => {
    it('transitions from SELECTING_TOPIC to GENERATING_OPTIONS', () => {
      const selecting: DialogueState = {
        ...initialDialogueState,
        phase: 'SELECTING_TOPIC',
        currentNPC: 'npc-1',
        availableTopics: [mockTopic],
      };
      const state = dialogueReducer(selecting, { type: 'SELECT_TOPIC', topic: mockTopic });
      expect(state.phase).toBe('GENERATING_OPTIONS');
      expect(state.selectedTopic).toEqual(mockTopic);
      expect(state.dialogueOptions).toEqual([]);
      expect(state.selectedOption).toBeNull();
    });

    it('resets deflection state', () => {
      const deflected: DialogueState = {
        ...initialDialogueState,
        phase: 'SELECTING_TOPIC',
        currentNPC: 'npc-1',
        npcDeflected: true,
        deflectedTopicLabel: 'Something',
      };
      const state = dialogueReducer(deflected, { type: 'SELECT_TOPIC', topic: mockTopic });
      expect(state.npcDeflected).toBe(false);
      expect(state.deflectedTopicLabel).toBeNull();
    });

    it('does nothing if not in SELECTING_TOPIC', () => {
      const state = dialogueReducer(initialDialogueState, { type: 'SELECT_TOPIC', topic: mockTopic });
      expect(state.phase).toBe('IDLE');
    });
  });

  describe('SET_OPTIONS', () => {
    it('transitions from GENERATING_OPTIONS to SELECTING_OPTION with options', () => {
      const generating: DialogueState = {
        ...initialDialogueState,
        phase: 'GENERATING_OPTIONS',
        currentNPC: 'npc-1',
        selectedTopic: mockTopic,
      };
      const options = [mockOption, { ...mockOption, id: 'opt-2', tone: 'stern' as const }];
      const state = dialogueReducer(generating, { type: 'SET_OPTIONS', options });
      expect(state.phase).toBe('SELECTING_OPTION');
      expect(state.dialogueOptions).toEqual(options);
    });

    it('does nothing if not in GENERATING_OPTIONS', () => {
      const state = dialogueReducer(initialDialogueState, { type: 'SET_OPTIONS', options: [mockOption] });
      expect(state.phase).toBe('IDLE');
      expect(state.dialogueOptions).toEqual([]);
    });
  });

  describe('SELECT_OPTION', () => {
    it('transitions from SELECTING_OPTION to STREAMING_RESPONSE', () => {
      const selecting: DialogueState = {
        ...initialDialogueState,
        phase: 'SELECTING_OPTION',
        currentNPC: 'npc-1',
        selectedTopic: mockTopic,
        dialogueOptions: [mockOption],
      };
      const state = dialogueReducer(selecting, { type: 'SELECT_OPTION', option: mockOption });
      expect(state.phase).toBe('STREAMING_RESPONSE');
      expect(state.selectedOption).toEqual(mockOption);
    });

    it('does nothing if not in SELECTING_OPTION', () => {
      const generating: DialogueState = { ...initialDialogueState, phase: 'GENERATING_OPTIONS' };
      const state = dialogueReducer(generating, { type: 'SELECT_OPTION', option: mockOption });
      expect(state.phase).toBe('GENERATING_OPTIONS');
    });
  });

  describe('APPEND_RESPONSE', () => {
    it('appends text during STREAMING_RESPONSE', () => {
      const streaming: DialogueState = {
        ...initialDialogueState,
        phase: 'STREAMING_RESPONSE',
        currentNPC: 'npc-1',
        streamingText: 'Hello',
      };
      const state = dialogueReducer(streaming, { type: 'APPEND_RESPONSE', text: ' world' });
      expect(state.streamingText).toBe('Hello world');
    });

    it('does nothing if not streaming', () => {
      const state = dialogueReducer(initialDialogueState, { type: 'APPEND_RESPONSE', text: 'test' });
      expect(state.streamingText).toBe('');
    });
  });

  describe('FINISH_RESPONSE', () => {
    it('transitions from STREAMING_RESPONSE to RESPONSE_COMPLETE', () => {
      const streaming: DialogueState = {
        ...initialDialogueState,
        phase: 'STREAMING_RESPONSE',
        currentNPC: 'npc-1',
        streamingText: 'Some response',
      };
      const state = dialogueReducer(streaming, {
        type: 'FINISH_RESPONSE',
        turn: mockTurn,
        discoveries: [],
      });
      expect(state.phase).toBe('RESPONSE_COMPLETE');
      expect(state.conversationHistory).toEqual([mockTurn]);
      expect(state.streamingText).toBe('');
    });
  });

  describe('ACKNOWLEDGE_RESPONSE', () => {
    it('transitions to SHOWING_DISCOVERY if discoveries exist', () => {
      const complete: DialogueState = {
        ...initialDialogueState,
        phase: 'RESPONSE_COMPLETE',
        currentNPC: 'npc-1',
        selectedTopic: mockTopic,
        availableTopics: [mockTopic],
        newDiscoveries: [{ id: 'd1', factId: 'f1', sinId: null, npcId: 'npc-1', content: 'fact', timestamp: 0, newConnections: [] }],
      };
      const state = dialogueReducer(complete, { type: 'ACKNOWLEDGE_RESPONSE' });
      expect(state.phase).toBe('SHOWING_DISCOVERY');
    });

    it('transitions to SELECTING_TOPIC if no discoveries', () => {
      const complete: DialogueState = {
        ...initialDialogueState,
        phase: 'RESPONSE_COMPLETE',
        currentNPC: 'npc-1',
        selectedTopic: mockTopic,
        availableTopics: [mockTopic],
        newDiscoveries: [],
      };
      const state = dialogueReducer(complete, { type: 'ACKNOWLEDGE_RESPONSE' });
      expect(state.phase).toBe('SELECTING_TOPIC');
      expect(state.selectedTopic).toBeNull();
    });

    it('marks the topic as explored', () => {
      const complete: DialogueState = {
        ...initialDialogueState,
        phase: 'RESPONSE_COMPLETE',
        currentNPC: 'npc-1',
        selectedTopic: mockTopic,
        availableTopics: [mockTopic],
        newDiscoveries: [],
      };
      const state = dialogueReducer(complete, { type: 'ACKNOWLEDGE_RESPONSE' });
      expect(state.availableTopics[0].explored).toBe(true);
    });
  });

  describe('CLOSE_DISCOVERY', () => {
    it('returns to SELECTING_TOPIC with few exchanges', () => {
      const showing: DialogueState = {
        ...initialDialogueState,
        phase: 'SHOWING_DISCOVERY',
        currentNPC: 'npc-1',
        conversationHistory: [mockTurn],
        newDiscoveries: [{ id: 'd1', factId: 'f1', sinId: null, npcId: 'npc-1', content: 'fact', timestamp: 0, newConnections: [] }],
      };
      const state = dialogueReducer(showing, { type: 'CLOSE_DISCOVERY' });
      expect(state.phase).toBe('SELECTING_TOPIC');
      expect(state.newDiscoveries).toEqual([]);
    });

    it('ends conversation after 3+ exchanges', () => {
      const showing: DialogueState = {
        ...initialDialogueState,
        phase: 'SHOWING_DISCOVERY',
        currentNPC: 'npc-1',
        conversationHistory: [mockTurn, mockTurn, mockTurn],
        newDiscoveries: [{ id: 'd1', factId: 'f1', sinId: null, npcId: 'npc-1', content: 'fact', timestamp: 0, newConnections: [] }],
      };
      const state = dialogueReducer(showing, { type: 'CLOSE_DISCOVERY' });
      expect(state.phase).toBe('IDLE');
    });
  });

  describe('END_CONVERSATION', () => {
    it('resets to initial state from any phase', () => {
      const active: DialogueState = {
        ...initialDialogueState,
        phase: 'STREAMING_RESPONSE',
        currentNPC: 'npc-1',
        streamingText: 'partial',
        dialogueOptions: [mockOption],
        selectedOption: mockOption,
      };
      const state = dialogueReducer(active, { type: 'END_CONVERSATION' });
      expect(state).toEqual(initialDialogueState);
    });
  });

  describe('full player voice flow', () => {
    it('completes the IDLE → TOPIC → OPTIONS → OPTION → STREAMING → COMPLETE cycle', () => {
      let state = dialogueReducer(initialDialogueState, {
        type: 'START_CONVERSATION',
        npcId: 'npc-1',
        topics: [mockTopic],
      });
      expect(state.phase).toBe('SELECTING_TOPIC');

      state = dialogueReducer(state, { type: 'SELECT_TOPIC', topic: mockTopic });
      expect(state.phase).toBe('GENERATING_OPTIONS');

      const options = [mockOption];
      state = dialogueReducer(state, { type: 'SET_OPTIONS', options });
      expect(state.phase).toBe('SELECTING_OPTION');
      expect(state.dialogueOptions).toHaveLength(1);

      state = dialogueReducer(state, { type: 'SELECT_OPTION', option: mockOption });
      expect(state.phase).toBe('STREAMING_RESPONSE');
      expect(state.selectedOption).toEqual(mockOption);

      state = dialogueReducer(state, { type: 'APPEND_RESPONSE', text: 'NPC says...' });
      expect(state.streamingText).toBe('NPC says...');

      state = dialogueReducer(state, { type: 'FINISH_RESPONSE', turn: mockTurn, discoveries: [] });
      expect(state.phase).toBe('RESPONSE_COMPLETE');
      expect(state.conversationHistory).toHaveLength(1);

      state = dialogueReducer(state, { type: 'ACKNOWLEDGE_RESPONSE' });
      expect(state.phase).toBe('SELECTING_TOPIC');
    });
  });
});
