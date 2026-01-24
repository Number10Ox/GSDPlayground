import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { GameState, GameAction, Location } from '@/types/game';
import type { PressureClock } from '@/types/pressure';
import { advancePressure } from '@/utils/pressureClock';
import { useTown } from '@/hooks/useTown';

function createInitialPressureClock(thresholds?: PressureClock['thresholds']): PressureClock {
  return {
    segments: 8,
    filled: 0,
    thresholds: thresholds ?? [],
  };
}

interface InitialStateArgs {
  locations: Location[];
  pressureThresholds?: PressureClock['thresholds'];
}

function createInitialState({ locations, pressureThresholds }: InitialStateArgs): GameState {
  return {
    currentLocation: locations[0]?.id ?? 'town-square',
    isPanelOpen: false,
    currentScene: null,
    locations,

    gamePhase: 'EXPLORING',
    pressureClock: createInitialPressureClock(pressureThresholds),
    clocks: [],

    characterCondition: 100,
    activeConflict: null,
    completedActionIds: [],
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // Navigation
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

    // Phase transitions
    case 'SET_GAME_PHASE':
      return { ...state, gamePhase: action.phase };

    // Pressure clock
    case 'ADVANCE_PRESSURE': {
      const result = advancePressure(state.pressureClock, action.amount);
      return {
        ...state,
        pressureClock: result.newClock,
        // Note: triggered thresholds and overflow are handled by the component
        // that dispatches this action (GameView processes the return value separately)
      };
    }

    case 'RESET_PRESSURE_CLOCK':
      return {
        ...state,
        pressureClock: {
          ...state.pressureClock,
          filled: 0,
          thresholds: state.pressureClock.thresholds.map(t => ({ ...t, fired: false })),
        },
      };

    // Clocks (general-purpose, non-pressure)
    case 'ADVANCE_CLOCK': {
      const clockIndex = state.clocks.findIndex(c => c.id === action.clockId);
      if (clockIndex === -1) return state;
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

    // Condition
    case 'UPDATE_CONDITION':
      return {
        ...state,
        characterCondition: Math.max(0, Math.min(100, state.characterCondition + action.delta)),
      };

    // Actions (one-shot tracking)
    case 'MARK_ACTION_COMPLETE':
      if (state.completedActionIds.includes(action.actionId)) return state;
      return {
        ...state,
        completedActionIds: [...state.completedActionIds, action.actionId],
      };

    // Conflict
    case 'APPLY_FALLOUT': {
      const severityPenalty: Record<string, number> = {
        NONE: 0,
        MINOR: 10,
        SERIOUS: 30,
        DEADLY: 50,
        DEATH: state.characterCondition,
      };
      const penalty = severityPenalty[action.severity] ?? 0;
      return {
        ...state,
        characterCondition: Math.max(0, state.characterCondition - penalty),
      };
    }

    case 'START_GAME_CONFLICT':
      return {
        ...state,
        gamePhase: 'IN_CONFLICT',
        activeConflict: {
          npcId: action.npcId,
          stakes: action.stakes,
          conflictDefinitionId: action.conflictDefinitionId,
        },
      };

    case 'END_GAME_CONFLICT':
      return {
        ...state,
        gamePhase: 'EXPLORING',
        activeConflict: null,
      };

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
  const [state, dispatch] = useReducer(
    gameReducer,
    { locations: town.locations, pressureThresholds: town.pressureThresholds },
    createInitialState
  );
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
