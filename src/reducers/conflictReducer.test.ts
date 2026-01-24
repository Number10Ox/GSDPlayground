import { describe, it, expect } from 'vitest';
import { conflictReducer, initialConflictState } from './conflictReducer';
import type { ConflictState } from '@/types/conflict';
import type { Die } from '@/types/game';

function makeActiveState(overrides: Partial<Extract<ConflictState, { phase: 'ACTIVE' }>> = {}): ConflictState {
  return {
    phase: 'ACTIVE',
    npcId: 'npc-1',
    stakes: 'Who controls the town',
    playerPool: [{ id: 'p1', type: 'd6', value: 4, assignedTo: null }],
    npcPool: [{ id: 'n1', type: 'd6', value: 3, assignedTo: null }],
    playerEscalation: 'JUST_TALKING',
    npcEscalation: 'JUST_TALKING',
    turnHistory: [],
    currentTurn: 'PLAYER_RAISE',
    currentRaise: null,
    falloutDice: [],
    usedTraits: [],
    usedItems: [],
    usedRelationships: [],
    usedConvictions: [],
    ...overrides,
  };
}

const mockDice: Die[] = [
  { id: 'conv-die-1', type: 'd6', value: 5, assignedTo: null },
];

describe('conflictReducer - INVOKE_CONVICTION', () => {
  it('adds conviction dice to player pool', () => {
    const state = makeActiveState();
    const result = conflictReducer(state, {
      type: 'INVOKE_CONVICTION',
      convictionId: 'conv-1',
      dice: mockDice,
    });
    expect(result.phase).toBe('ACTIVE');
    if (result.phase === 'ACTIVE') {
      expect(result.playerPool).toHaveLength(2);
      expect(result.playerPool[1]).toEqual(mockDice[0]);
      expect(result.usedConvictions).toContain('conv-1');
    }
  });

  it('records conviction as used', () => {
    const state = makeActiveState();
    const result = conflictReducer(state, {
      type: 'INVOKE_CONVICTION',
      convictionId: 'conv-1',
      dice: mockDice,
    });
    if (result.phase === 'ACTIVE') {
      expect(result.usedConvictions).toEqual(['conv-1']);
    }
  });

  it('rejects if conviction already used', () => {
    const state = makeActiveState({ usedConvictions: ['conv-1'] });
    const result = conflictReducer(state, {
      type: 'INVOKE_CONVICTION',
      convictionId: 'conv-1',
      dice: mockDice,
    });
    if (result.phase === 'ACTIVE') {
      expect(result.playerPool).toHaveLength(1); // unchanged
      expect(result.usedConvictions).toEqual(['conv-1']); // unchanged
    }
  });

  it('rejects during NPC turns', () => {
    const state = makeActiveState({ currentTurn: 'NPC_RAISE' });
    const result = conflictReducer(state, {
      type: 'INVOKE_CONVICTION',
      convictionId: 'conv-1',
      dice: mockDice,
    });
    if (result.phase === 'ACTIVE') {
      expect(result.playerPool).toHaveLength(1);
    }
  });

  it('works during PLAYER_SEE', () => {
    const state = makeActiveState({ currentTurn: 'PLAYER_SEE' });
    const result = conflictReducer(state, {
      type: 'INVOKE_CONVICTION',
      convictionId: 'conv-1',
      dice: mockDice,
    });
    if (result.phase === 'ACTIVE') {
      expect(result.playerPool).toHaveLength(2);
      expect(result.usedConvictions).toContain('conv-1');
    }
  });

  it('rejects if not in ACTIVE phase', () => {
    const result = conflictReducer(initialConflictState, {
      type: 'INVOKE_CONVICTION',
      convictionId: 'conv-1',
      dice: mockDice,
    });
    expect(result.phase).toBe('INACTIVE');
  });

  it('supports multiple different convictions', () => {
    let state = makeActiveState();
    state = conflictReducer(state, {
      type: 'INVOKE_CONVICTION',
      convictionId: 'conv-1',
      dice: [{ id: 'die-1', type: 'd6', value: 4, assignedTo: null }],
    }) as Extract<ConflictState, { phase: 'ACTIVE' }>;

    state = conflictReducer(state, {
      type: 'INVOKE_CONVICTION',
      convictionId: 'conv-2',
      dice: [{ id: 'die-2', type: 'd8', value: 7, assignedTo: null }],
    });

    if (state.phase === 'ACTIVE') {
      expect(state.usedConvictions).toEqual(['conv-1', 'conv-2']);
      expect(state.playerPool).toHaveLength(3); // original + 2 conviction dice
    }
  });
});
