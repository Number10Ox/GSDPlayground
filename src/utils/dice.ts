import type { DieType } from '@/types/game';

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
export function generateDieId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `die-${crypto.randomUUID()}`;
  }
  return `die-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
