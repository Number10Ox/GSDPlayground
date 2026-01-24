import type { JourneyState, JourneyAction } from '@/types/journey';
import type { Conviction, ConvictionStrength } from '@/types/conviction';
import { STRENGTH_ORDER } from '@/types/conviction';
import { createInitialJourneyState } from '@/types/journey';

export { createInitialJourneyState };

/**
 * Advance conviction strength by one step (for reinforcement).
 */
function strengthenConviction(current: ConvictionStrength): ConvictionStrength {
  const idx = STRENGTH_ORDER.indexOf(current);
  if (idx < STRENGTH_ORDER.length - 1) {
    return STRENGTH_ORDER[idx + 1];
  }
  return current;
}

/**
 * Weaken conviction strength by one step (for doubt).
 */
function weakenConviction(current: ConvictionStrength): ConvictionStrength {
  const idx = STRENGTH_ORDER.indexOf(current);
  if (idx > 0) {
    return STRENGTH_ORDER[idx - 1];
  }
  return current;
}

/**
 * Check if all original convictions (those without bornFrom) are resolved.
 */
function checkAllResolved(convictions: Conviction[]): boolean {
  const originals = convictions.filter(c => !c.bornFrom);
  if (originals.length === 0) return false;
  return originals.every(c => c.lifecycle === 'resolved');
}

/**
 * Journey reducer - manages the multi-town arc state machine.
 * Uses silent fail pattern consistent with other reducers.
 */
export function journeyReducer(
  state: JourneyState,
  action: JourneyAction
): JourneyState {
  switch (action.type) {
    case 'SET_CHARACTER': {
      return { ...state, character: action.character };
    }

    case 'UPDATE_CHARACTER': {
      return { ...state, character: action.character };
    }

    case 'SET_CONVICTIONS': {
      return { ...state, convictions: action.convictions };
    }

    case 'ADD_CONVICTION_TEST': {
      // Don't add duplicate tests for the same conviction in the same town
      const alreadyTested = state.pendingTests.some(
        t => t.convictionId === action.test.convictionId && t.townId === action.test.townId
      );
      if (alreadyTested) return state;

      // Mark the conviction as tested
      const updatedConvictions = state.convictions.map(c =>
        c.id === action.test.convictionId && c.lifecycle === 'held'
          ? { ...c, lifecycle: 'tested' as const }
          : c
      );

      return {
        ...state,
        convictions: updatedConvictions,
        pendingTests: [...state.pendingTests, action.test],
      };
    }

    case 'REFLECT_ON_CONVICTION': {
      const { convictionId, choice, newText } = action;
      const conviction = state.convictions.find(c => c.id === convictionId);
      if (!conviction) return state;

      let updated: Conviction;
      const currentTown = state.completedTowns[state.completedTowns.length - 1];
      const townName = currentTown?.townName ?? 'Unknown';
      const townId = currentTown?.townId ?? '';

      switch (choice) {
        case 'reinforce': {
          const newStrength = strengthenConviction(conviction.strength);
          const isResolved = newStrength === 'unshakeable';
          updated = {
            ...conviction,
            strength: newStrength,
            reinforceCount: conviction.reinforceCount + 1,
            lifecycle: isResolved ? 'resolved' : 'held',
            history: [...conviction.history, {
              townId,
              townName,
              action: 'reinforced',
              context: `Reinforced after testing in ${townName}`,
            }],
          };
          break;
        }
        case 'doubt': {
          const newStrength = weakenConviction(conviction.strength);
          const newDoubtCount = conviction.doubtCount + 1;
          const isBroken = newDoubtCount >= 3;
          updated = {
            ...conviction,
            strength: newStrength,
            doubtCount: newDoubtCount,
            lifecycle: isBroken ? 'broken' : 'shaken',
            history: [...conviction.history, {
              townId,
              townName,
              action: 'doubted',
              context: `Doubted after testing in ${townName}`,
            }],
          };
          break;
        }
        case 'transform': {
          if (!newText) return state;
          updated = {
            ...conviction,
            text: newText,
            strength: 'steady',
            lifecycle: 'resolved',
            doubtCount: 0,
            reinforceCount: 0,
            history: [...conviction.history, {
              townId,
              townName,
              action: 'transformed',
              context: `Transformed in ${townName}`,
              previousText: conviction.text,
            }],
          };
          break;
        }
        default:
          return state;
      }

      const newConvictions = state.convictions.map(c =>
        c.id === convictionId ? updated : c
      );

      return {
        ...state,
        convictions: newConvictions,
        allConvictionsResolved: checkAllResolved(newConvictions),
      };
    }

    case 'COMPLETE_TOWN': {
      return {
        ...state,
        completedTowns: [...state.completedTowns, action.record],
        pendingTests: [],
      };
    }

    case 'ADVANCE_TO_NEXT_TOWN': {
      // Reset tested convictions back to held (those not resolved/broken)
      const resetConvictions = state.convictions.map(c =>
        c.lifecycle === 'tested' ? { ...c, lifecycle: 'held' as const } : c
      );

      return {
        ...state,
        convictions: resetConvictions,
        currentTownIndex: state.currentTownIndex + 1,
        phase: 'TOWN_ACTIVE',
      };
    }

    case 'SET_PHASE': {
      return { ...state, phase: action.phase };
    }

    case 'CHECK_JOURNEY_COMPLETE': {
      const allResolved = checkAllResolved(state.convictions);
      const atMaxTowns = state.currentTownIndex >= state.maxTowns - 1;

      if (allResolved || atMaxTowns) {
        return {
          ...state,
          allConvictionsResolved: allResolved,
          phase: 'JOURNEY_COMPLETE',
        };
      }
      return state;
    }

    default:
      return state;
  }
}
