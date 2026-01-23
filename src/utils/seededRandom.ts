/**
 * Seeded Random Number Generator
 *
 * Provides deterministic random number generation for procedural town generation.
 * Same seed always produces the same sequence of values, enabling reproducibility
 * and testability of generated content.
 */

/**
 * SeededRNG - Interface for a deterministic random number generator.
 * All methods produce the same output given the same seed and call sequence.
 */
export interface SeededRNG {
  /** Returns a float in [0, 1) */
  next(): number;
  /** Returns an integer in [min, max] inclusive */
  nextInt(min: number, max: number): number;
  /** Picks a random element from an array */
  pick<T>(array: T[]): T;
  /** Returns a shuffled copy of the array (Fisher-Yates) */
  shuffle<T>(array: T[]): T[];
}

/**
 * Simple string-to-32-bit-integer hash (cyrb53-inspired, truncated to 32 bits).
 * Converts any seed string into a numeric seed for the PRNG algorithm.
 */
function hashString(str: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return (h1 ^ h2) >>> 0;
}

/**
 * Mulberry32 - Fast 32-bit PRNG with good statistical properties.
 * Returns a function that produces the next random float in [0, 1).
 */
function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return function () {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Creates a deterministic seeded random number generator.
 * Same seed string always produces the same sequence of values.
 *
 * @param seed - Any string used to initialize the generator
 * @returns A SeededRNG instance with deterministic methods
 */
export function createRNG(seed: string): SeededRNG {
  const numericSeed = hashString(seed);
  const nextFloat = mulberry32(numericSeed);

  const rng: SeededRNG = {
    next(): number {
      return nextFloat();
    },

    nextInt(min: number, max: number): number {
      const range = max - min + 1;
      return min + Math.floor(nextFloat() * range);
    },

    pick<T>(array: T[]): T {
      if (array.length === 0) {
        throw new Error('Cannot pick from empty array');
      }
      const index = Math.floor(nextFloat() * array.length);
      return array[index];
    },

    shuffle<T>(array: T[]): T[] {
      const result = [...array];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(nextFloat() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },
  };

  return rng;
}
