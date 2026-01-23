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
  sinEscalatedToMurder: false,
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

    case 'ADVANCE_SIN_PROGRESSION': {
      // Called at end of each cycle: time pressure mechanic.
      // Finds the highest-severity unresolved sin, advances to next level.
      if (state.sinProgression.length === 0) return state;

      // Find highest-severity unresolved sin node
      let highestUnresolved: { node: typeof state.sinProgression[0]; index: number } | null = null;
      for (const node of state.sinProgression) {
        if (node.resolved) continue;
        const levelIndex = SIN_CHAIN_ORDER.indexOf(node.level);
        if (!highestUnresolved || levelIndex > SIN_CHAIN_ORDER.indexOf(highestUnresolved.node.level)) {
          highestUnresolved = { node, index: levelIndex };
        }
      }

      // Silent fail: no unresolved sins or already at max
      if (!highestUnresolved) return state;
      if (highestUnresolved.node.level === 'hate-and-murder') {
        // Already at maximum, set murder flag if not set
        return state.sinEscalatedToMurder ? state : {
          ...state,
          sinEscalatedToMurder: true,
        };
      }

      // Advance to next level
      const currentLevelIndex = SIN_CHAIN_ORDER.indexOf(highestUnresolved.node.level);
      const nextLevel = SIN_CHAIN_ORDER[currentLevelIndex + 1];
      const reachedMurder = nextLevel === 'hate-and-murder';

      // Create new sin node at the escalated level
      const newSinNode = {
        id: `sin-${nextLevel}-${Date.now()}`,
        level: nextLevel,
        name: `Escalated ${nextLevel.replace(/-/g, ' ')}`,
        description: `The town's rot has deepened to ${nextLevel.replace(/-/g, ' ')}.`,
        discovered: false,
        resolved: false,
        linkedNpcs: [],
      };

      return {
        ...state,
        sinProgression: [...state.sinProgression, newSinNode],
        sinEscalatedToMurder: reachedMurder || state.sinEscalatedToMurder,
      };
    }

    case 'CONFRONT_SIN': {
      const { sinId } = action;
      const confrontedNode = state.sinProgression.find((node) => node.id === sinId);

      // Silent fail: sin not found
      if (!confrontedNode) return state;

      // Mark as confronted (resolved = true, since confrontation counts in DitV)
      const updatedProgression = state.sinProgression.map((node) =>
        node.id === sinId ? { ...node, resolved: true } : node
      );

      // If the confronted sin is at the 'pride' level (root), resolve the town
      const isRootSin = confrontedNode.level === 'pride';

      return {
        ...state,
        sinProgression: updatedProgression,
        townResolved: isRootSin || state.townResolved,
      };
    }

    default:
      return state;
  }
}
