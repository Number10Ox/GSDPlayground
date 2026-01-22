import type { Die } from '@/types/game';
import type {
  EscalationLevel,
  FalloutDice,
  FalloutResult,
  FalloutSeverity,
  FalloutType,
} from '@/types/conflict';
import { ESCALATION_ORDER } from '@/types/conflict';
import { rollDie } from '@/utils/dice';

/**
 * Generate a unique ID for dice created during fallout calculation.
 */
function generateDieId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `die-${crypto.randomUUID()}`;
  }
  return `die-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create FalloutDice record when player "Takes the Blow" (sees with 3+ dice).
 * The raise dice become fallout dice at the current escalation level.
 *
 * @param raiseDice - The dice from the raise being seen
 * @param escalationLevel - Current escalation level (affects fallout type)
 */
export function generateFalloutDice(
  raiseDice: Die[],
  escalationLevel: EscalationLevel
): FalloutDice {
  return {
    dice: raiseDice,
    escalationLevel,
  };
}

/**
 * Map escalation level to fallout type.
 * Higher escalation = more severe fallout type.
 */
function getfalloutType(level: EscalationLevel): FalloutType {
  switch (level) {
    case 'JUST_TALKING':
      return 'SOCIAL';
    case 'PHYSICAL':
      return 'PHYSICAL';
    case 'FIGHTING':
      return 'VIOLENT';
    case 'GUNPLAY':
      return 'LETHAL';
  }
}

/**
 * Determine fallout severity from total of top 2 dice.
 * Based on DitV rules:
 * - 1-7: No long-term fallout
 * - 8-11: Minor (bruises, hurt feelings)
 * - 12-15: Serious (broken bones, reputation damage)
 * - 16-19: Deadly (near-death, exile-worthy)
 * - 20+: Death
 */
function determineSeverity(total: number): FalloutSeverity {
  if (total <= 7) return 'NONE';
  if (total <= 11) return 'MINOR';
  if (total <= 15) return 'SERIOUS';
  if (total <= 19) return 'DEADLY';
  return 'DEATH';
}

/**
 * Calculate fallout from accumulated dice during conflict.
 *
 * Rules:
 * 1. Roll all accumulated fallout dice
 * 2. Sort values descending
 * 3. Sum the top 2 values
 * 4. Determine severity from total
 * 5. Determine type from highest escalation level
 *
 * @param accumulated - All FalloutDice records from "Take the Blow" actions
 */
export function calculateFallout(accumulated: FalloutDice[]): FalloutResult {
  // No fallout if no dice accumulated
  if (accumulated.length === 0) {
    return {
      severity: 'NONE',
      falloutType: 'SOCIAL',
      total: 0,
      diceRolled: [],
    };
  }

  // Collect all dice and roll them
  const diceRolled: Die[] = [];
  let highestEscalation: EscalationLevel = 'JUST_TALKING';

  for (const fallout of accumulated) {
    // Track highest escalation level for fallout type
    if (ESCALATION_ORDER[fallout.escalationLevel] > ESCALATION_ORDER[highestEscalation]) {
      highestEscalation = fallout.escalationLevel;
    }

    // Roll each die (create new dice with fresh rolls)
    for (const die of fallout.dice) {
      diceRolled.push({
        id: generateDieId(),
        type: die.type,
        value: rollDie(die.type),
        assignedTo: null,
      });
    }
  }

  // Sort values descending and sum top 2
  const values = diceRolled.map(d => d.value).sort((a, b) => b - a);
  const top2 = values.slice(0, 2);
  const total = top2.reduce((sum, v) => sum + v, 0);

  return {
    severity: determineSeverity(total),
    falloutType: getfalloutType(highestEscalation),
    total,
    diceRolled,
  };
}
