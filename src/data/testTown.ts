/**
 * Test Town Data - Compatibility shim.
 *
 * Re-exports Bridal Falls town data through the legacy API.
 * Existing tests and imports continue to work unchanged.
 * New code should use `useTown()` or import from `@/data/towns` directly.
 */

import { bridalFalls } from '@/data/towns';
import { resolveTopicsForNPC } from '@/utils/topicResolver';
import type { Topic } from '@/types/dialogue';

export const TEST_LOCATIONS = bridalFalls.locations;
export const TEST_NPCS = bridalFalls.npcs;
export const TEST_SIN_CHAIN = bridalFalls.sinChain;

export function getTopicsForNPC(
  npcId: string,
  discoveredSinIds: string[],
  currentLocation: string
): Topic[] {
  return resolveTopicsForNPC(npcId, bridalFalls.topicRules, discoveredSinIds, currentLocation);
}

export const TEST_TOWN_DATA = {
  name: bridalFalls.name,
  description: bridalFalls.description,
  locations: bridalFalls.locations,
  npcs: bridalFalls.npcs,
  sinChain: bridalFalls.sinChain,
  getTopicsForNPC,
};
