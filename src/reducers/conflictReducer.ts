import type {
  ConflictState,
  ConflictAction,
  ConflictTurn,
  EscalationLevel,
} from '@/types/conflict';
import type { Die } from '@/types/game';
import { ESCALATION_ORDER, ESCALATION_DICE } from '@/types/conflict';
import { generateFalloutDice, calculateFallout } from '@/utils/fallout';
import { rollDie } from '@/utils/dice';

// Initial state - no active conflict
export const initialConflictState: ConflictState = { phase: 'INACTIVE' };

// Generate unique ID for turn history
function generateTurnId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `turn-${crypto.randomUUID()}`;
  }
  return `turn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Generate unique ID for dice
function generateDieId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `die-${crypto.randomUUID()}`;
  }
  return `die-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Generate escalation dice for a new level
function generateEscalationDice(level: EscalationLevel): Die[] {
  const config = ESCALATION_DICE[level];
  const dice: Die[] = [];
  for (let i = 0; i < config.count; i++) {
    dice.push({
      id: generateDieId(),
      type: config.type,
      value: rollDie(config.type),
      assignedTo: null,
    });
  }
  return dice;
}

// Calculate sum of dice values
function sumDice(dice: Die[]): number {
  return dice.reduce((sum, die) => sum + die.value, 0);
}

// Get description for see action based on dice count
function getSeeDescription(diceCount: number, description: string): string {
  if (diceCount === 1) {
    return `Reverses the Blow: ${description}`;
  }
  if (diceCount === 2) {
    return `Block/Dodge: ${description}`;
  }
  return `Takes the Blow: ${description}`;
}

/**
 * Conflict reducer - state machine for DitV conflict mechanics.
 * Follows the phase guard pattern from useGameState.tsx.
 * Invalid actions return state unchanged (silent fail).
 */
export function conflictReducer(
  state: ConflictState,
  action: ConflictAction
): ConflictState {
  switch (action.type) {
    case 'START_CONFLICT': {
      // Only from INACTIVE
      if (state.phase !== 'INACTIVE') {
        return state;
      }
      return {
        phase: 'ACTIVE',
        npcId: action.npcId,
        stakes: action.stakes,
        playerPool: action.playerDice,
        npcPool: action.npcDice,
        playerEscalation: 'JUST_TALKING',
        npcEscalation: 'JUST_TALKING',
        turnHistory: [],
        currentTurn: 'PLAYER_RAISE',
        currentRaise: null,
        falloutDice: [],
      };
    }

    case 'PLAYER_RAISE': {
      // Phase guard: ACTIVE only
      if (state.phase !== 'ACTIVE') {
        return state;
      }
      // Turn guard: PLAYER_RAISE only
      if (state.currentTurn !== 'PLAYER_RAISE') {
        return state;
      }
      // Validate exactly 2 dice IDs provided
      if (action.diceIds.length !== 2) {
        return state;
      }
      // Find dice in player pool
      const dice = action.diceIds.map(id =>
        state.playerPool.find(d => d.id === id)
      );
      // Validate all dice exist in pool
      if (dice.some(d => d === undefined)) {
        return state;
      }
      const raiseDice = dice as Die[];
      const total = sumDice(raiseDice);

      // Create turn record
      const turn: ConflictTurn = {
        id: generateTurnId(),
        actor: 'PLAYER',
        action: 'RAISE',
        dice: raiseDice,
        description: action.description,
      };

      // Remove dice from pool
      const newPool = state.playerPool.filter(
        d => !action.diceIds.includes(d.id)
      );

      return {
        ...state,
        playerPool: newPool,
        currentRaise: { dice: raiseDice, total },
        currentTurn: 'NPC_SEE',
        turnHistory: [...state.turnHistory, turn],
      };
    }

    case 'PLAYER_SEE': {
      // Phase guard: ACTIVE only
      if (state.phase !== 'ACTIVE') {
        return state;
      }
      // Turn guard: PLAYER_SEE only
      if (state.currentTurn !== 'PLAYER_SEE') {
        return state;
      }
      // Must have a raise to see
      if (state.currentRaise === null) {
        return state;
      }
      // Validate at least 1 die provided
      if (action.diceIds.length === 0) {
        return state;
      }
      // Find dice in player pool
      const dice = action.diceIds.map(id =>
        state.playerPool.find(d => d.id === id)
      );
      // Validate all dice exist in pool
      if (dice.some(d => d === undefined)) {
        return state;
      }
      const seeDice = dice as Die[];
      const seeTotal = sumDice(seeDice);

      // Must meet or exceed raise total
      if (seeTotal < state.currentRaise.total) {
        return state;
      }

      // Determine turn type and handle fallout
      let newFalloutDice = state.falloutDice;
      if (seeDice.length >= 3) {
        // Taking the Blow - accumulate fallout dice
        const fallout = generateFalloutDice(
          state.currentRaise.dice,
          state.playerEscalation
        );
        newFalloutDice = [...state.falloutDice, fallout];
      }

      // Create turn record
      const turn: ConflictTurn = {
        id: generateTurnId(),
        actor: 'PLAYER',
        action: 'SEE',
        dice: seeDice,
        description: getSeeDescription(seeDice.length, action.description),
      };

      // Remove dice from pool
      const newPool = state.playerPool.filter(
        d => !action.diceIds.includes(d.id)
      );

      return {
        ...state,
        playerPool: newPool,
        currentRaise: null,
        currentTurn: 'PLAYER_RAISE',
        turnHistory: [...state.turnHistory, turn],
        falloutDice: newFalloutDice,
      };
    }

    case 'PLAYER_GIVE': {
      // Phase guard: ACTIVE only
      if (state.phase !== 'ACTIVE') {
        return state;
      }
      // Calculate fallout from accumulated dice
      const fallout = calculateFallout(state.falloutDice);

      return {
        phase: 'RESOLVED',
        outcome: 'PLAYER_GAVE',
        fallout,
        witnesses: [], // Will be populated by RESOLVE_CONFLICT action
      };
    }

    case 'PLAYER_ESCALATE': {
      // Phase guard: ACTIVE only
      if (state.phase !== 'ACTIVE') {
        return state;
      }
      // Validate new level is higher than current
      if (
        ESCALATION_ORDER[action.newLevel] <=
        ESCALATION_ORDER[state.playerEscalation]
      ) {
        return state;
      }

      // Generate new dice for escalation
      const newDice = generateEscalationDice(action.newLevel);

      // Create turn record
      const turn: ConflictTurn = {
        id: generateTurnId(),
        actor: 'PLAYER',
        action: 'ESCALATE',
        dice: newDice,
        description: action.monologue,
      };

      return {
        ...state,
        playerEscalation: action.newLevel,
        playerPool: [...state.playerPool, ...newDice],
        turnHistory: [...state.turnHistory, turn],
      };
    }

    case 'NPC_RAISE': {
      // Phase guard: ACTIVE only
      if (state.phase !== 'ACTIVE') {
        return state;
      }
      // Turn guard: NPC_RAISE only
      if (state.currentTurn !== 'NPC_RAISE') {
        return state;
      }
      // Validate exactly 2 dice IDs provided
      if (action.diceIds.length !== 2) {
        return state;
      }
      // Find dice in NPC pool
      const dice = action.diceIds.map(id =>
        state.npcPool.find(d => d.id === id)
      );
      // Validate all dice exist in pool
      if (dice.some(d => d === undefined)) {
        return state;
      }
      const raiseDice = dice as Die[];
      const total = sumDice(raiseDice);

      // Create turn record
      const turn: ConflictTurn = {
        id: generateTurnId(),
        actor: 'NPC',
        action: 'RAISE',
        dice: raiseDice,
        description: action.description,
      };

      // Remove dice from pool
      const newPool = state.npcPool.filter(d => !action.diceIds.includes(d.id));

      return {
        ...state,
        npcPool: newPool,
        currentRaise: { dice: raiseDice, total },
        currentTurn: 'PLAYER_SEE',
        turnHistory: [...state.turnHistory, turn],
      };
    }

    case 'NPC_SEE': {
      // Phase guard: ACTIVE only
      if (state.phase !== 'ACTIVE') {
        return state;
      }
      // Turn guard: NPC_SEE only
      if (state.currentTurn !== 'NPC_SEE') {
        return state;
      }
      // Must have a raise to see
      if (state.currentRaise === null) {
        return state;
      }
      // Validate at least 1 die provided
      if (action.diceIds.length === 0) {
        return state;
      }
      // Find dice in NPC pool
      const dice = action.diceIds.map(id =>
        state.npcPool.find(d => d.id === id)
      );
      // Validate all dice exist in pool
      if (dice.some(d => d === undefined)) {
        return state;
      }
      const seeDice = dice as Die[];
      const seeTotal = sumDice(seeDice);

      // Must meet or exceed raise total
      if (seeTotal < state.currentRaise.total) {
        return state;
      }

      // NPC taking the blow - accumulate NPC fallout (tracked separately in future)
      // For now, we don't track NPC fallout in the same array

      // Create turn record
      const turn: ConflictTurn = {
        id: generateTurnId(),
        actor: 'NPC',
        action: 'SEE',
        dice: seeDice,
        description: getSeeDescription(seeDice.length, action.description),
      };

      // Remove dice from pool
      const newPool = state.npcPool.filter(d => !action.diceIds.includes(d.id));

      return {
        ...state,
        npcPool: newPool,
        currentRaise: null,
        currentTurn: 'NPC_RAISE',
        turnHistory: [...state.turnHistory, turn],
      };
    }

    case 'NPC_GIVE': {
      // Phase guard: ACTIVE only
      if (state.phase !== 'ACTIVE') {
        return state;
      }
      // Calculate fallout from accumulated dice
      const fallout = calculateFallout(state.falloutDice);

      return {
        phase: 'RESOLVED',
        outcome: 'NPC_GAVE',
        fallout,
        witnesses: [], // Will be populated by RESOLVE_CONFLICT action
      };
    }

    case 'NPC_ESCALATE': {
      // Phase guard: ACTIVE only
      if (state.phase !== 'ACTIVE') {
        return state;
      }
      // Validate new level is higher than current
      if (
        ESCALATION_ORDER[action.newLevel] <=
        ESCALATION_ORDER[state.npcEscalation]
      ) {
        return state;
      }

      // Generate new dice for escalation
      const newDice = generateEscalationDice(action.newLevel);

      // Create turn record
      const turn: ConflictTurn = {
        id: generateTurnId(),
        actor: 'NPC',
        action: 'ESCALATE',
        dice: newDice,
        description: action.monologue,
      };

      return {
        ...state,
        npcEscalation: action.newLevel,
        npcPool: [...state.npcPool, ...newDice],
        turnHistory: [...state.turnHistory, turn],
      };
    }

    case 'RESOLVE_CONFLICT': {
      // Phase guard: ACTIVE only
      if (state.phase !== 'ACTIVE') {
        return state;
      }
      // Calculate fallout from accumulated dice
      const fallout = calculateFallout(state.falloutDice);

      return {
        phase: 'RESOLVED',
        outcome: action.outcome,
        fallout,
        witnesses: action.witnesses,
      };
    }

    default:
      return state;
  }
}
