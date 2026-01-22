import type { Die, DieType } from '@/types/game';
import type { Character, StatName } from '@/types/character';

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
 * Generate a dice pool based on character stats and condition.
 *
 * If character is provided: generates pool from character stat dice,
 * applying modifiers (injuries reduce dice) and condition as a filter.
 *
 * If character is null: falls back to condition-only generation (backward compatible).
 *
 * @param condition - Character condition (0-100)
 * @param character - Optional character for stat-based pool generation
 * @returns Array of rolled dice
 */
export function generateDicePool(condition: number, character?: Character | null): Die[] {
  // If no character, fall back to condition-only generation
  if (!character) {
    return generateConditionOnlyPool(condition);
  }

  // Collect all stat dice with modifiers applied
  const statNames: StatName[] = ['acuity', 'body', 'heart', 'will'];
  const allDice: { type: DieType }[] = [];

  for (const statName of statNames) {
    const stat = character.stats[statName];
    // Modifier reduces effective dice count for this stat (minimum 0)
    const effectiveCount = Math.max(0, stat.dice.length - Math.abs(stat.modifier));
    for (let i = 0; i < effectiveCount; i++) {
      allDice.push({ type: stat.dice[i].type });
    }
  }

  // Apply condition as a filter: lower condition removes weakest dice
  let filteredDice = [...allDice];
  const clampedCondition = Math.max(0, Math.min(100, condition));

  if (clampedCondition < 25) {
    // Critical condition: remove 50% of dice (weakest first)
    const removeCount = Math.floor(filteredDice.length * 0.5);
    filteredDice = removeWeakestDice(filteredDice, removeCount);
  } else if (clampedCondition < 50) {
    // Poor condition: remove 25% of dice (weakest first)
    const removeCount = Math.floor(filteredDice.length * 0.25);
    filteredDice = removeWeakestDice(filteredDice, removeCount);
  }

  // Ensure at least 1 die in pool
  if (filteredDice.length === 0 && allDice.length > 0) {
    filteredDice = [allDice[0]];
  }

  // Roll each die and return as game Die objects
  return filteredDice.map((die) => ({
    id: generateDieId(),
    type: die.type,
    value: rollDie(die.type),
    assignedTo: null,
  }));
}

/**
 * Remove N weakest dice from the pool (smallest die types first).
 * Die type ordering: d4 < d6 < d8 < d10
 */
function removeWeakestDice(dice: { type: DieType }[], count: number): { type: DieType }[] {
  if (count <= 0) return dice;
  const typeOrder: Record<DieType, number> = { d4: 0, d6: 1, d8: 2, d10: 3 };
  const sorted = [...dice].sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
  return sorted.slice(count);
}

/**
 * Legacy condition-only pool generation (no character).
 * Condition mapping:
 * - 0-20: 1 die (mostly d4)
 * - 21-40: 2 dice (d4-d6)
 * - 41-60: 3 dice (d6)
 * - 61-80: 4 dice (d6-d8)
 * - 81-100: 5 dice (d8-d10)
 */
function generateConditionOnlyPool(condition: number): Die[] {
  const clampedCondition = Math.max(0, Math.min(100, condition));
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
