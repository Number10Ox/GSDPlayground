import type { Die, DieType } from '@/types/game';

/**
 * Roll a single die of the given type.
 * @param type - The die type (d4, d6, d8, d10)
 * @returns A random value from 1 to the die's max
 */
export function rollDie(type: DieType): number {
  const max = parseInt(type.slice(1)); // 'd6' -> 6
  return Math.floor(Math.random() * max) + 1;
}

/**
 * Get the maximum value for a die type.
 * @param type - The die type (d4, d6, d8, d10)
 * @returns The maximum value (4, 6, 8, or 10)
 */
export function getDieMax(type: DieType): number {
  return parseInt(type.slice(1));
}

/**
 * Generate a unique ID for a die.
 * Uses crypto.randomUUID if available, falls back to timestamp-based ID.
 */
function generateDieId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `die-${crypto.randomUUID()}`;
  }
  return `die-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Determine die type based on condition level.
 * Better condition = better dice (more d8s/d10s).
 * Worse condition = worse dice (more d4s).
 */
function getDieTypeForCondition(condition: number, position: number, _total: number): DieType {
  // Higher condition = more good dice
  // Position within pool affects type (first dice tend to be better)
  const adjustedCondition = condition - (position * 10);

  if (adjustedCondition >= 80) return 'd10';
  if (adjustedCondition >= 60) return 'd8';
  if (adjustedCondition >= 30) return 'd6';
  return 'd4';
}

/**
 * Generate a dice pool based on character condition.
 * @param condition - Character condition (0-100)
 * @returns Array of rolled dice
 *
 * Condition mapping:
 * - 0-20: 1 die (mostly d4)
 * - 21-40: 2 dice (d4-d6)
 * - 41-60: 3 dice (d6)
 * - 61-80: 4 dice (d6-d8)
 * - 81-100: 5 dice (d8-d10)
 */
export function generateDicePool(condition: number): Die[] {
  // Clamp condition to 0-100
  const clampedCondition = Math.max(0, Math.min(100, condition));

  // Condition maps to 1-5 dice
  const diceCount = Math.max(1, Math.ceil(clampedCondition / 20));

  const pool: Die[] = [];

  for (let i = 0; i < diceCount; i++) {
    const type = getDieTypeForCondition(clampedCondition, i, diceCount);
    pool.push({
      id: generateDieId(),
      type,
      value: rollDie(type),
      assignedTo: null,
    });
  }

  return pool;
}
