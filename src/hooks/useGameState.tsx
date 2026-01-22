import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { GameState, GameAction, Location } from '@/types/game';

// Sample town data for Phase 1 (will be procedurally generated later)
const SAMPLE_LOCATIONS: Location[] = [
  { id: 'town-square', name: 'Town Square', description: 'The heart of Bridal Falls', x: 500, y: 400, connections: ['church', 'general-store', 'sheriffs-office'] },
  { id: 'church', name: 'The Chapel', description: 'A modest house of worship', x: 500, y: 200, connections: ['town-square', 'cemetery'] },
  { id: 'general-store', name: 'General Store', description: 'Ezekiel runs the store', x: 300, y: 400, connections: ['town-square'] },
  { id: 'sheriffs-office', name: "Sheriff's Office", description: 'Law in Bridal Falls', x: 700, y: 400, connections: ['town-square'] },
  { id: 'cemetery', name: 'Cemetery', description: 'The town buries its dead here', x: 500, y: 50, connections: ['church'] },
];

const initialState: GameState = {
  currentLocation: 'town-square',
  isPanelOpen: false,
  currentScene: null,
  locations: SAMPLE_LOCATIONS,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
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
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
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
