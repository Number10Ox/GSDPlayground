import type { EscalationLevel } from '@/types/conflict';
import type { LocationId } from '@/types/game';

/**
 * UnlockCondition - Gates that control when an action becomes available.
 * Checked by actionAvailability utility against current game context.
 */
export type UnlockCondition =
  | { type: 'descent_min'; value: number }
  | { type: 'descent_max'; value: number }
  | { type: 'sin_discovered'; sinId: string }
  | { type: 'clue_found'; clueId: string }
  | { type: 'trust_min'; npcId: string; value: number };

/**
 * TimedAction - Ticks the descent clock. Investigation, prayer, tending.
 */
export interface TimedAction {
  id: string;
  name: string;
  description: string;
  locationId: LocationId;
  descentCost: number;
  effects: TimedActionEffect[];
  unlockCondition?: UnlockCondition;
  oneShot: boolean;
}

export type TimedActionEffect =
  | { type: 'RESTORE_CONDITION'; amount: number }
  | { type: 'DISCOVER_CLUE'; clueId: string }
  | { type: 'TRUST_CHANGE'; npcId: string; delta: number }
  | { type: 'NARRATIVE'; text: string };

/**
 * ConflictDefinition - A declarative conflict encounter.
 * Defines stakes, escalation constraints, and outcome consequences.
 */
export interface ConflictDefinition {
  id: string;
  npcId: string;
  stakes: string;
  locationId: LocationId;
  minEscalation: EscalationLevel;
  maxEscalation: EscalationLevel;
  npcAggression: number;
  descentCost: { onGive: number; onEscalate: number; onFallout: number };
  unlockCondition?: UnlockCondition;
  consequences: {
    playerWins: ConflictConsequence[];
    playerGives: ConflictConsequence[];
    npcGives: ConflictConsequence[];
  };
}

export type ConflictConsequence =
  | { type: 'DISCOVER_SIN'; sinId: string }
  | { type: 'ADVANCE_DESCENT'; amount: number }
  | { type: 'TRUST_CHANGE'; npcId: string; delta: number }
  | { type: 'UNLOCK_CLUE'; clueId: string }
  | { type: 'NARRATIVE'; text: string }
  | { type: 'RESOLVE_SIN'; sinId: string };

/**
 * ActionTier - UI grouping for the action menu.
 */
export type ActionTier = 'free' | 'timed' | 'conflict';
