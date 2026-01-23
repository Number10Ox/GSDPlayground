import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { NPC, NPCMemory, NPCMemoryAction, ConflictEvent } from '@/types/npc';
import type { EscalationLevel } from '@/types/conflict';
import type { LocationId } from '@/types/game';
import { TEST_NPCS } from '@/data/testTown';

/**
 * Relationship level penalties based on escalation.
 */
const ESCALATION_PENALTIES: Record<EscalationLevel, number> = {
  JUST_TALKING: 0,
  PHYSICAL: -5,
  FIGHTING: -15,
  GUNPLAY: -30,
};

/**
 * NPC Memory State
 */
interface NPCMemoryState {
  npcs: NPC[];
  memories: NPCMemory[];
}

const initialNPCState: NPCMemoryState = {
  npcs: TEST_NPCS,
  memories: [], // Empty initially - NPCs have no memory of the player
};

/**
 * Generate a unique ID for conflict events.
 */
function generateEventId(): string {
  return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clamp a value between min and max.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * NPC Memory Reducer
 */
function npcMemoryReducer(
  state: NPCMemoryState,
  action: NPCMemoryAction
): NPCMemoryState {
  switch (action.type) {
    case 'RECORD_CONFLICT': {
      const { conflictData, witnesses } = action;
      const { escalationLevel, outcome, location, description, targetNpcId } = conflictData;

      // Calculate base penalty
      const basePenalty = ESCALATION_PENALTIES[escalationLevel];

      // Build updated memories
      const newMemories = [...state.memories];

      // Process each witness
      for (const witnessId of witnesses) {
        // Find or create memory for this NPC
        let memoryIndex = newMemories.findIndex((m) => m.npcId === witnessId);

        if (memoryIndex === -1) {
          // Create new memory entry
          newMemories.push({
            npcId: witnessId,
            events: [],
            relationshipLevel: 0,
          });
          memoryIndex = newMemories.length - 1;
        }

        const memory = newMemories[memoryIndex];

        // Determine event type and penalty
        const isTarget = witnessId === targetNpcId;
        const eventType = isTarget ? 'TARGETED_BY_VIOLENCE' : 'WITNESSED_VIOLENCE';
        const penalty = isTarget ? basePenalty * 2 : basePenalty; // Double penalty if targeted

        // Create the conflict event
        const event: ConflictEvent = {
          id: generateEventId(),
          timestamp: Date.now(),
          type: eventType,
          escalationLevel,
          location,
          otherParticipants: witnesses.filter((id) => id !== witnessId),
          outcome,
          description,
        };

        // Update memory
        newMemories[memoryIndex] = {
          ...memory,
          events: [...memory.events, event],
          relationshipLevel: clamp(memory.relationshipLevel + penalty, -100, 100),
        };
      }

      return {
        ...state,
        memories: newMemories,
      };
    }

    case 'UPDATE_RELATIONSHIP': {
      const { npcId, delta } = action;

      const memoryIndex = state.memories.findIndex((m) => m.npcId === npcId);

      if (memoryIndex === -1) {
        // Create new memory with adjusted relationship
        return {
          ...state,
          memories: [
            ...state.memories,
            {
              npcId,
              events: [],
              relationshipLevel: clamp(delta, -100, 100),
            },
          ],
        };
      }

      // Update existing memory
      const memory = state.memories[memoryIndex];
      const newMemories = [...state.memories];
      newMemories[memoryIndex] = {
        ...memory,
        relationshipLevel: clamp(memory.relationshipLevel + delta, -100, 100),
      };

      return {
        ...state,
        memories: newMemories,
      };
    }

    case 'CLEAR_MEMORY': {
      return {
        ...state,
        memories: [],
      };
    }

    default:
      return state;
  }
}

/**
 * Context type
 */
interface NPCMemoryContextType {
  state: NPCMemoryState;
  dispatch: Dispatch<NPCMemoryAction>;
}

const NPCMemoryContext = createContext<NPCMemoryContextType | null>(null);

/**
 * NPCMemoryProvider - Provides NPC memory state to the app.
 */
export function NPCMemoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(npcMemoryReducer, initialNPCState);

  return (
    <NPCMemoryContext.Provider value={{ state, dispatch }}>
      {children}
    </NPCMemoryContext.Provider>
  );
}

/**
 * useNPCMemory - Hook for accessing and managing NPC memory.
 *
 * Returns state, dispatch, and helper functions for common operations.
 */
export function useNPCMemory() {
  const context = useContext(NPCMemoryContext);

  if (!context) {
    throw new Error('useNPCMemory must be used within an NPCMemoryProvider');
  }

  const { state, dispatch } = context;

  /**
   * Get an NPC by ID.
   */
  const getNPCById = useCallback(
    (id: string): NPC | undefined => {
      return state.npcs.find((npc) => npc.id === id);
    },
    [state.npcs]
  );

  /**
   * Get memory for a specific NPC.
   */
  const getMemoryForNPC = useCallback(
    (npcId: string): NPCMemory | undefined => {
      return state.memories.find((m) => m.npcId === npcId);
    },
    [state.memories]
  );

  /**
   * Check if an NPC has witnessed violence.
   */
  const hasWitnessedViolence = useCallback(
    (npcId: string): boolean => {
      const memory = state.memories.find((m) => m.npcId === npcId);
      if (!memory) return false;

      return memory.events.some(
        (event) =>
          event.escalationLevel === 'PHYSICAL' ||
          event.escalationLevel === 'FIGHTING' ||
          event.escalationLevel === 'GUNPLAY'
      );
    },
    [state.memories]
  );

  /**
   * Get the highest escalation level an NPC has witnessed.
   */
  const getHighestEscalationWitnessed = useCallback(
    (npcId: string): EscalationLevel | null => {
      const memory = state.memories.find((m) => m.npcId === npcId);
      if (!memory || memory.events.length === 0) return null;

      const escalationOrder: Record<EscalationLevel, number> = {
        JUST_TALKING: 0,
        PHYSICAL: 1,
        FIGHTING: 2,
        GUNPLAY: 3,
      };

      let highest: EscalationLevel | null = null;
      let highestOrder = -1;

      for (const event of memory.events) {
        const order = escalationOrder[event.escalationLevel];
        if (order > highestOrder) {
          highest = event.escalationLevel;
          highestOrder = order;
        }
      }

      return highest;
    },
    [state.memories]
  );

  /**
   * Get NPC IDs at a specific location.
   */
  const getWitnessesAtLocation = useCallback(
    (locationId: LocationId): string[] => {
      return state.npcs
        .filter((npc) => npc.locationId === locationId)
        .map((npc) => npc.id);
    },
    [state.npcs]
  );

  return {
    npcs: state.npcs,
    memories: state.memories,
    dispatch,
    getNPCById,
    getMemoryForNPC,
    hasWitnessedViolence,
    getHighestEscalationWitnessed,
    getWitnessesAtLocation,
  };
}
