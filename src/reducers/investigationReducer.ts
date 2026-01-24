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
 */
export const initialInvestigationState: InvestigationState = {
  discoveries: [],
  sinProgression: [],
  clues: [],
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
      // Initialize the sin progression chain and clues for this town.
      // The first sin (pride) is always discovered on arrival — it's the
      // surface-level problem visible to any Dog entering the town.
      const seededNodes = action.sinNodes.map((node, index) =>
        index === 0 ? { ...node, discovered: true } : node
      );
      return {
        ...state,
        sinProgression: seededNodes,
        clues: action.clues ?? [],
      };
    }

    case 'FIND_CLUE': {
      const { clueId } = action;
      const clueIndex = state.clues.findIndex(c => c.id === clueId);
      if (clueIndex === -1 || state.clues[clueIndex].found) return state;

      const clue = state.clues[clueIndex];
      const updatedClues = state.clues.map((c, i) =>
        i === clueIndex ? { ...c, found: true } : c
      );

      // Auto-create a discovery from this clue
      const discovery = {
        id: `clue-discovery-${clueId}`,
        factId: clueId,
        sinId: null as string | null,
        npcId: '',
        content: clue.description,
        timestamp: Date.now(),
        newConnections: [clue.discoveryId],
      };

      // Check if the clue's discoveryId links to a sin node
      const linkedSin = state.sinProgression.find(s => s.id === clue.discoveryId);
      if (linkedSin) {
        discovery.sinId = linkedSin.id;
      }

      const newSinProgression = linkedSin
        ? state.sinProgression.map(node =>
            node.id === linkedSin.id ? { ...node, discovered: true } : node
          )
        : state.sinProgression;

      return {
        ...state,
        clues: updatedClues,
        discoveries: [...state.discoveries, discovery],
        sinProgression: newSinProgression,
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

    case 'PRESSURE_ESCALATE_SIN':
    case 'ADVANCE_SIN_PROGRESSION': {
      // Called when pressure clock overflows: time pressure mechanic.
      // Escalates the highest-severity unresolved sin in-place (keeps NPC links).
      if (state.sinProgression.length === 0) return state;

      // Find highest-severity unresolved sin node
      let highestUnresolved: { node: typeof state.sinProgression[0]; arrayIndex: number } | null = null;
      for (let i = 0; i < state.sinProgression.length; i++) {
        const node = state.sinProgression[i];
        if (node.resolved) continue;
        const levelIndex = SIN_CHAIN_ORDER.indexOf(node.level);
        if (!highestUnresolved || levelIndex > SIN_CHAIN_ORDER.indexOf(highestUnresolved.node.level)) {
          highestUnresolved = { node, arrayIndex: i };
        }
      }

      // Silent fail: no unresolved sins or already at max
      if (!highestUnresolved) return state;
      if (highestUnresolved.node.level === 'hate-and-murder') {
        return state.sinEscalatedToMurder ? state : {
          ...state,
          sinEscalatedToMurder: true,
        };
      }

      // Advance the sin in-place: upgrade its level, keep linked NPCs
      const currentLevelIndex = SIN_CHAIN_ORDER.indexOf(highestUnresolved.node.level);
      const nextLevel = SIN_CHAIN_ORDER[currentLevelIndex + 1];
      const reachedMurder = nextLevel === 'hate-and-murder';

      const updatedProgression = state.sinProgression.map((node, i) => {
        if (i !== highestUnresolved!.arrayIndex) return node;
        return {
          ...node,
          level: nextLevel,
          description: `${node.description} The situation has worsened.`,
        };
      });

      return {
        ...state,
        sinProgression: updatedProgression,
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
