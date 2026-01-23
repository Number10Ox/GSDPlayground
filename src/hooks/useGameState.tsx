import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { GameState, GameAction, Location, Clock, AvailableAction } from '@/types/game';
import { generateDicePool } from '@/utils/dice';
import { useTown } from '@/hooks/useTown';

// Sample clocks for testing the cycle system
const SAMPLE_CLOCKS: Clock[] = [
  { id: 'murder-plot', label: 'Murder Plot', segments: 6, filled: 2, type: 'danger', autoAdvance: true },
  { id: 'trust-earned', label: 'Trust Earned', segments: 4, filled: 1, type: 'progress', autoAdvance: false },
];

// Sample actions for testing the cycle system
const SAMPLE_ACTIONS: AvailableAction[] = [
  { id: 'investigate-chapel', name: 'Investigate the Chapel', description: 'Look for signs of what troubles this place', locationId: 'church', diceCost: 1, available: true },
  { id: 'talk-sheriff', name: 'Talk to the Sheriff', description: 'The law might know something', locationId: 'sheriffs-office', diceCost: 1, available: true },
  { id: 'search-store', name: 'Search the Store', description: 'Ezekiel seems nervous', locationId: 'general-store', diceCost: 2, available: true },
  { id: 'pray', name: 'Pray for Guidance', description: 'Seek wisdom from the King of Life', locationId: null, diceCost: 1, available: true },
  { id: 'rest-early', name: 'Rest Early', description: 'End the day and recover', locationId: null, diceCost: 0, available: true },
];

function createInitialState(locations: Location[]): GameState {
  return {
    currentLocation: locations[0]?.id ?? 'town-square',
    isPanelOpen: false,
    currentScene: null,
    locations,

    cyclePhase: 'WAKE',
    cycleNumber: 1,
    dicePool: [],
    selectedDieId: null,
    clocks: SAMPLE_CLOCKS,
    availableActions: SAMPLE_ACTIONS,

    characterCondition: 100,
    activeConflict: null,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // Existing Phase 1 actions
    case 'NAVIGATE': {
      const location = state.locations.find(l => l.id === action.locationId);
      if (!location) return state;
      return {
        ...state,
        currentLocation: action.locationId,
        isPanelOpen: true,
        currentScene: {
          id: `scene-${action.locationId}`,
          locationId: action.locationId,
          title: location.name,
          text: location.description,
        },
      };
    }
    case 'OPEN_PANEL':
      return { ...state, isPanelOpen: true, currentScene: action.scene };
    case 'CLOSE_PANEL':
      return { ...state, isPanelOpen: false };

    // Cycle actions
    case 'START_CYCLE': {
      // Valid in: WAKE, REST
      if (state.cyclePhase !== 'WAKE' && state.cyclePhase !== 'REST') {
        return state;
      }
      // From REST: go to WAKE for next day with incremented cycle number
      if (state.cyclePhase === 'REST') {
        return {
          ...state,
          cyclePhase: 'WAKE',
          cycleNumber: state.cycleNumber + 1,
        };
      }
      // From WAKE: go to ALLOCATE with provided pool or condition-only fallback
      return {
        ...state,
        cyclePhase: 'ALLOCATE',
        dicePool: action.dicePool ?? generateDicePool(state.characterCondition),
        selectedDieId: null,
      };
    }

    case 'SELECT_DIE': {
      // Valid in: ALLOCATE
      if (state.cyclePhase !== 'ALLOCATE') {
        return state;
      }
      const die = state.dicePool.find(d => d.id === action.dieId);
      // Only allow selecting unassigned dice
      if (!die || die.assignedTo !== null) {
        return state;
      }
      // Toggle behavior: if same die selected, deselect
      if (state.selectedDieId === action.dieId) {
        return { ...state, selectedDieId: null };
      }
      return { ...state, selectedDieId: action.dieId };
    }

    case 'ASSIGN_DIE': {
      // Valid in: ALLOCATE
      if (state.cyclePhase !== 'ALLOCATE') {
        return state;
      }
      // Requires a selected die
      if (state.selectedDieId === null) {
        return state;
      }
      return {
        ...state,
        dicePool: state.dicePool.map(die =>
          die.id === state.selectedDieId
            ? { ...die, assignedTo: action.actionId }
            : die
        ),
        selectedDieId: null, // Clear selection after assignment
      };
    }

    case 'UNASSIGN_DIE': {
      // Valid in: ALLOCATE
      if (state.cyclePhase !== 'ALLOCATE') {
        return state;
      }
      const dieToUnassign = state.dicePool.find(d => d.id === action.dieId);
      if (!dieToUnassign) {
        return state;
      }
      return {
        ...state,
        dicePool: state.dicePool.map(die =>
          die.id === action.dieId
            ? { ...die, assignedTo: null }
            : die
        ),
        // If unassigned die was selected, clear selection
        selectedDieId: state.selectedDieId === action.dieId ? null : state.selectedDieId,
      };
    }

    case 'CONFIRM_ALLOCATIONS': {
      // Valid in: ALLOCATE
      if (state.cyclePhase !== 'ALLOCATE') {
        return state;
      }
      // At least one die must be assigned
      const hasAssignedDice = state.dicePool.some(die => die.assignedTo !== null);
      if (!hasAssignedDice) {
        return state;
      }
      return {
        ...state,
        cyclePhase: 'RESOLVE',
        selectedDieId: null,
      };
    }

    case 'RESOLVE_NEXT': {
      // Valid in: RESOLVE
      if (state.cyclePhase !== 'RESOLVE') {
        return state;
      }
      // For now, just transition to SUMMARY (actual resolution logic in Plan 04)
      return {
        ...state,
        cyclePhase: 'SUMMARY',
      };
    }

    case 'VIEW_SUMMARY': {
      // Valid in: RESOLVE
      if (state.cyclePhase !== 'RESOLVE') {
        return state;
      }
      return {
        ...state,
        cyclePhase: 'SUMMARY',
      };
    }

    case 'ADVANCE_CLOCK': {
      // Valid in: any phase (typically called during RESOLVE)
      const clockIndex = state.clocks.findIndex(c => c.id === action.clockId);
      if (clockIndex === -1) {
        return state;
      }
      const clock = state.clocks[clockIndex];
      const newFilled = Math.min(clock.segments, clock.filled + action.amount);
      return {
        ...state,
        clocks: [
          ...state.clocks.slice(0, clockIndex),
          { ...clock, filled: newFilled },
          ...state.clocks.slice(clockIndex + 1),
        ],
      };
    }

    case 'END_CYCLE': {
      // Valid in: SUMMARY
      if (state.cyclePhase !== 'SUMMARY') {
        return state;
      }
      // Advance autoAdvance clocks by 1
      const advancedClocks = state.clocks.map(clock =>
        clock.autoAdvance
          ? { ...clock, filled: Math.min(clock.segments, clock.filled + 1) }
          : clock
      );
      return {
        ...state,
        cyclePhase: 'REST',
        dicePool: [], // Clear dice pool
        selectedDieId: null,
        clocks: advancedClocks,
      };
    }

    case 'REST_EARLY': {
      // Valid in: ALLOCATE
      if (state.cyclePhase !== 'ALLOCATE') {
        return state;
      }
      // Skip to SUMMARY with remaining dice unused
      return {
        ...state,
        cyclePhase: 'SUMMARY',
        selectedDieId: null,
      };
    }

    // Conflict actions
    case 'APPLY_FALLOUT': {
      // Apply fallout severity to character condition
      // NONE: no change, MINOR: -10, SERIOUS: -30, DEADLY: -50, DEATH: 0
      const severityPenalty: Record<string, number> = {
        NONE: 0,
        MINOR: 10,
        SERIOUS: 30,
        DEADLY: 50,
        DEATH: state.characterCondition, // Set to 0
      };
      const penalty = severityPenalty[action.severity] ?? 0;
      const newCondition = Math.max(0, state.characterCondition - penalty);
      return {
        ...state,
        characterCondition: newCondition,
      };
    }

    case 'START_GAME_CONFLICT': {
      // Set up active conflict tracking in game state
      return {
        ...state,
        activeConflict: {
          npcId: action.npcId,
          stakes: action.stakes,
        },
      };
    }

    case 'END_GAME_CONFLICT': {
      // Clear active conflict
      return {
        ...state,
        activeConflict: null,
      };
    }

    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const town = useTown();
  const [state, dispatch] = useReducer(gameReducer, town.locations, createInitialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
}
