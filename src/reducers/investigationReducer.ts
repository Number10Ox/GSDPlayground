import type {
  InvestigationState,
  InvestigationAction,
  SinLevel,
} from '@/types/investigation';

/**
 * SIN_CHAIN_ORDER - The 7 levels of the DitV sin progression in order.
 * Each town's moral rot follows this linear escalation.
 */
export const SIN_CHAIN_ORDER: SinLevel[] = [
  'pride',
  'injustice',
  'sin',
  'demonic-attacks',
  'false-doctrine',
  'sorcery',
  'hate-and-murder',
];

/**
 * Initial investigation state.
 * Sin progression is empty until START_INVESTIGATION populates it.
 * Fatigue clock defaults to 6 segments per cycle.
 */
export const initialInvestigationState: InvestigationState = {
  discoveries: [],
  sinProgression: [],
  fatigueClock: { current: 0, max: 6 },
  townResolved: false,
};

/**
 * Investigation reducer - manages the investigation state machine.
 * Uses silent fail pattern (returns state unchanged on invalid actions),
 * consistent with existing reducers in the codebase.
 */
export function investigationReducer(
  state: InvestigationState,
  action: InvestigationAction
): InvestigationState {
  switch (action.type) {
    case 'START_INVESTIGATION': {
      // Initialize the sin progression chain for this town
      return {
        ...state,
        sinProgression: action.sinNodes,
      };
    }

    case 'RECORD_DISCOVERY': {
      const { discovery } = action;
      const newDiscoveries = [...state.discoveries, discovery];

      // If discovery links to a sin node, mark it as discovered
      if (discovery.sinId) {
        const newSinProgression = state.sinProgression.map((node) =>
          node.id === discovery.sinId
            ? { ...node, discovered: true }
            : node
        );
        return {
          ...state,
          discoveries: newDiscoveries,
          sinProgression: newSinProgression,
        };
      }

      return {
        ...state,
        discoveries: newDiscoveries,
      };
    }

    case 'ADVANCE_FATIGUE': {
      // Silent fail: already at max
      if (state.fatigueClock.current >= state.fatigueClock.max) {
        return state;
      }
      return {
        ...state,
        fatigueClock: {
          ...state.fatigueClock,
          current: state.fatigueClock.current + 1,
        },
      };
    }

    case 'RESET_FATIGUE': {
      return {
        ...state,
        fatigueClock: {
          ...state.fatigueClock,
          current: 0,
        },
      };
    }

    case 'MARK_SIN_RESOLVED': {
      const { sinId } = action;
      const nodeExists = state.sinProgression.some((node) => node.id === sinId);

      // Silent fail: sin node not found
      if (!nodeExists) {
        return state;
      }

      return {
        ...state,
        sinProgression: state.sinProgression.map((node) =>
          node.id === sinId
            ? { ...node, resolved: true }
            : node
        ),
      };
    }

    case 'MARK_TOWN_RESOLVED': {
      return {
        ...state,
        townResolved: true,
      };
    }

    default:
      return state;
  }
}
