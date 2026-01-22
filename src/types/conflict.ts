import type { Die, DieType } from '@/types/game';

// Escalation levels in Dogs in the Vineyard conflict system
// Each level represents increasing stakes and violence
export type EscalationLevel = 'JUST_TALKING' | 'PHYSICAL' | 'FIGHTING' | 'GUNPLAY';

// Ordering for escalation comparison
export const ESCALATION_ORDER: Record<EscalationLevel, number> = {
  JUST_TALKING: 0,
  PHYSICAL: 1,
  FIGHTING: 2,
  GUNPLAY: 3,
};

// Dice added when escalating to a new level
export const ESCALATION_DICE: Record<EscalationLevel, { count: number; type: DieType }> = {
  JUST_TALKING: { count: 0, type: 'd4' },  // Starting level, no bonus
  PHYSICAL: { count: 2, type: 'd6' },       // "I shove him"
  FIGHTING: { count: 2, type: 'd8' },       // "I throw a punch"
  GUNPLAY: { count: 2, type: 'd10' },       // "I draw my gun"
};

// Current turn in the conflict - determines valid actions
export type ConflictTurnPhase =
  | 'PLAYER_RAISE'
  | 'NPC_RAISE'
  | 'PLAYER_SEE'
  | 'NPC_SEE';

// Actor in the conflict
export type ConflictActor = 'PLAYER' | 'NPC';

// Actions that can occur during a turn
export type TurnAction = 'RAISE' | 'SEE' | 'GIVE' | 'ESCALATE';

// A single turn in the conflict history
export interface ConflictTurn {
  id: string;
  actor: ConflictActor;
  action: TurnAction;
  dice: Die[];
  description: string;
}

// A raise that must be met or given
export interface CurrentRaise {
  dice: Die[];
  total: number;
}

// Outcome when conflict resolves
export type ConflictOutcome = 'PLAYER_WON' | 'PLAYER_GAVE' | 'NPC_GAVE';

// Severity of fallout from accumulated damage
export type FalloutSeverity = 'NONE' | 'MINOR' | 'SERIOUS' | 'DEADLY' | 'DEATH';

// Type of fallout based on highest escalation level
export type FalloutType = 'SOCIAL' | 'PHYSICAL' | 'VIOLENT' | 'LETHAL';

// Dice accumulated during conflict that will be rolled for fallout
export interface FalloutDice {
  dice: Die[];
  escalationLevel: EscalationLevel;
}

// Result of fallout calculation
export interface FalloutResult {
  severity: FalloutSeverity;
  falloutType: FalloutType;
  total: number;
  diceRolled: Die[];
}

// Discriminated union for conflict state
// The phase field determines which properties are available
export type ConflictState =
  | { phase: 'INACTIVE' }
  | {
      phase: 'ACTIVE';
      npcId: string;
      stakes: string;
      playerPool: Die[];
      npcPool: Die[];
      playerEscalation: EscalationLevel;
      npcEscalation: EscalationLevel;
      turnHistory: ConflictTurn[];
      currentTurn: ConflictTurnPhase;
      currentRaise: CurrentRaise | null;
      falloutDice: FalloutDice[];
      usedTraits: string[];   // Trait IDs invoked this conflict (once per trait)
      usedItems: string[];    // Item IDs used this conflict (once per item)
    }
  | {
      phase: 'RESOLVED';
      outcome: ConflictOutcome;
      fallout: FalloutResult;
      witnesses: string[];
    };

// Actions for the conflict reducer
export type ConflictAction =
  | {
      type: 'START_CONFLICT';
      npcId: string;
      stakes: string;
      playerDice: Die[];
      npcDice: Die[];
    }
  | {
      type: 'PLAYER_RAISE';
      diceIds: [string, string]; // Exactly 2 dice
      description: string;
    }
  | {
      type: 'PLAYER_SEE';
      diceIds: string[];
      description: string;
    }
  | { type: 'PLAYER_GIVE' }
  | {
      type: 'PLAYER_ESCALATE';
      newLevel: EscalationLevel;
      monologue: string;
    }
  | {
      type: 'NPC_RAISE';
      diceIds: [string, string]; // Exactly 2 dice
      description: string;
    }
  | {
      type: 'NPC_SEE';
      diceIds: string[];
      description: string;
    }
  | { type: 'NPC_GIVE' }
  | {
      type: 'NPC_ESCALATE';
      newLevel: EscalationLevel;
      monologue: string;
    }
  | {
      type: 'RESOLVE_CONFLICT';
      outcome: ConflictOutcome;
      witnesses: string[];
    }
  | {
      type: 'INVOKE_TRAIT';
      traitId: string;
      dice: Die[];  // Already rolled dice to add to player pool
    }
  | {
      type: 'USE_ITEM';
      itemId: string;
      dice: Die[];  // Already rolled dice to add to player pool
    };
