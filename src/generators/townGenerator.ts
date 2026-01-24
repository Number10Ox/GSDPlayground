/**
 * Town Generator
 *
 * Main orchestrator that assembles a complete TownData object by
 * coordinating sin chain, NPC, location, and topic rule generation.
 * Produces fully self-consistent towns where all references are valid:
 * - NPC locationIds reference actual location IDs
 * - TopicRule npcId/locationId values reference actual NPCs/locations
 * - Sin chain linkedNpcs reference actual NPC IDs
 */

import type { TownData } from '@/types/town';
import type { Location } from '@/types/game';
import { createRNG } from '@/utils/seededRandom';
import { generateSinChain } from '@/generators/sinChainGenerator';
import { generateNPCs } from '@/generators/npcGenerator';
import { generateLocations } from '@/generators/locationGenerator';
import { generateTopicRules } from '@/generators/topicRuleGenerator';
import { validateTown } from '@/generators/validators/playabilityValidator';

/**
 * Configuration for town generation.
 */
export interface TownGenerationConfig {
  /** Seed string for deterministic generation */
  seed: string;
  /** Number of sin levels in the chain (3-7, default 4) */
  chainLength?: number;
  /** Override town name (if not provided, one is generated) */
  name?: string;
  /** Whether the town has formal law enforcement (enables Sheriff) */
  hasLaw?: boolean;
}

/**
 * Town name fragments for procedural name generation.
 * Combined as prefix + suffix (e.g., "Bridal Falls", "Iron Creek").
 */
export const TOWN_NAME_FRAGMENTS = {
  prefixes: [
    'Bridal', 'Widow', 'Salt', 'Iron', 'Bitter',
    'Silent', 'Bone', 'Cedar', 'Ash', 'Copper',
    'Fallen', 'Hollow', 'Dust', 'Stone', 'Red',
    'Shepherd\'s', 'Black', 'Dry', 'Silver', 'Broken',
    'White', 'Devil\'s',
  ],
  suffixes: [
    'Falls', 'Creek', 'Bluff', 'Crossing', 'Gulch',
    'Flats', 'Springs', 'Ridge', 'Hollow', 'Canyon',
    'Wells', 'Fork', 'Basin', 'Pass', 'Bend',
    'Gap', 'Run', 'Landing', 'Trace', 'Point',
    'Butte', 'Mesa',
  ],
};

/**
 * Atmospheric description fragments for generated towns.
 * Combined to hint at the sin chain's theme.
 */
const DESCRIPTION_TEMPLATES = [
  'A remote settlement where the faithful keep their own counsel. Something festers beneath the surface.',
  'A frontier town at the edge of the world, where prayers go unanswered and secrets run deep.',
  'A quiet community that has not seen a Dog in years. The silence here has weight.',
  'A settlement built on faith and hard ground. Both are cracking.',
  'A town that keeps its troubles behind closed doors and drawn curtains.',
  'A place where the faithful gather but trust has worn thin as autumn ice.',
  'A lonely outpost where the doctrine bends to fit the will of those in power.',
  'A dying settlement where the harvest fails and the faithful blame each other.',
];

/**
 * Converts a name to a kebab-case ID.
 */
function toKebabId(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Maps NPC defaultLocationType values to actual location IDs from generated locations.
 * Finds the best match by location type, falling back to any available location.
 */
function assignNPCsToLocations(
  npcs: ReturnType<typeof generateNPCs>['npcs'],
  locations: Location[]
): void {
  // Build a map of location types (from slot types) to location IDs
  // NPC locationIds are currently set as 'loc-{defaultLocationType}' by npcGenerator
  // We need to map those to actual generated location IDs

  // Track which locations are assigned (to distribute NPCs)
  const locationAssignments = new Map<string, number>();
  for (const loc of locations) {
    locationAssignments.set(loc.id, 0);
  }

  // Map NPC archetype location types to location slot types
  const TYPE_MAPPINGS: Record<string, string[]> = {
    'meeting-house': ['gathering', 'church'],
    'jail': ['office'],
    'homestead': ['homestead'],
    'farm': ['homestead', 'outskirts'],
    'schoolhouse': ['landmark', 'gathering'],
    'chapel': ['church'],
    'general-store': ['store'],
  };

  for (const npc of npcs) {
    // Extract the location type from the current placeholder ID
    const locType = npc.locationId.replace('loc-', '');
    const preferredTypes = TYPE_MAPPINGS[locType] || ['gathering'];

    // Find the best matching location (least crowded among preferred types)
    let bestLocation: Location | undefined;
    let bestCount = Infinity;

    // First try preferred location types by checking location descriptions/names
    for (const loc of locations) {
      const count = locationAssignments.get(loc.id) || 0;
      // Check if this location's position/type matches any preferred type
      for (const prefType of preferredTypes) {
        if (isLocationOfType(loc, prefType) && count < bestCount) {
          bestLocation = loc;
          bestCount = count;
        }
      }
    }

    // Fallback: assign to least crowded location
    if (!bestLocation) {
      for (const loc of locations) {
        const count = locationAssignments.get(loc.id) || 0;
        if (count < bestCount) {
          bestLocation = loc;
          bestCount = count;
        }
      }
    }

    if (bestLocation) {
      npc.locationId = bestLocation.id;
      locationAssignments.set(bestLocation.id, bestCount + 1);
    } else {
      // Final fallback: first location
      npc.locationId = locations[0].id;
    }
  }
}

/**
 * Heuristic to determine if a location matches a given type.
 * Uses the location's coordinates and name to infer type.
 */
function isLocationOfType(location: Location, slotType: string): boolean {
  const nameLower = location.name.toLowerCase();
  const descLower = location.description.toLowerCase();

  switch (slotType) {
    case 'church':
      return nameLower.includes('chapel') || nameLower.includes('church') ||
             nameLower.includes('worship') || nameLower.includes('tabernacle') ||
             nameLower.includes('sanctuary') || nameLower.includes('faith') ||
             nameLower.includes('prayer') || nameLower.includes('meeting');
    case 'store':
      return nameLower.includes('store') || nameLower.includes('mercantile') ||
             nameLower.includes('trading') || nameLower.includes('supply') ||
             nameLower.includes('provision') || nameLower.includes('emporium') ||
             nameLower.includes('dry goods');
    case 'office':
      return nameLower.includes('sheriff') || nameLower.includes('marshal') ||
             nameLower.includes('jail') || nameLower.includes('office') ||
             nameLower.includes('stockade') || nameLower.includes('station') ||
             nameLower.includes('watch') || nameLower.includes('guard') ||
             nameLower.includes('peace');
    case 'homestead':
      return nameLower.includes('homestead') || nameLower.includes('farm') ||
             nameLower.includes('cottage') || nameLower.includes('ranch') ||
             nameLower.includes('claim') || nameLower.includes('orchard') ||
             nameLower.includes('parsonage') || nameLower.includes('manse') ||
             nameLower.includes('house') || nameLower.includes('hut') ||
             nameLower.includes('herb') || nameLower.includes('healer') ||
             descLower.includes('dwelling') || descLower.includes('farm');
    case 'gathering':
      return nameLower.includes('square') || nameLower.includes('commons') ||
             nameLower.includes('main') || nameLower.includes('bridge') ||
             nameLower.includes('crossing') || nameLower.includes('ford') ||
             nameLower.includes('thoroughfare') || nameLower.includes('market');
    case 'landmark':
      return nameLower.includes('well') || nameLower.includes('crossroads') ||
             nameLower.includes('oak') || nameLower.includes('stone') ||
             nameLower.includes('circle') || nameLower.includes('council') ||
             nameLower.includes('graveyard') || nameLower.includes('rest') ||
             nameLower.includes('quiet');
    case 'outskirts':
      return nameLower.includes('cemetery') || nameLower.includes('bluff') ||
             nameLower.includes('lookout') || nameLower.includes('ridge') ||
             nameLower.includes('mine') || nameLower.includes('shaft') ||
             nameLower.includes('ravine') || nameLower.includes('gulch') ||
             nameLower.includes('boot hill') || nameLower.includes('burying');
    default:
      return false;
  }
}

/**
 * Generates a complete TownData object by orchestrating all sub-generators.
 * Output satisfies the TownData interface with all internal references valid.
 *
 * @param config - Generation configuration (seed, optional chainLength and name)
 * @returns A complete, self-consistent TownData object
 */
export function generateTown(config: TownGenerationConfig): TownData {
  const { seed, chainLength = 4, name: providedName, hasLaw } = config;
  const rng = createRNG(seed);

  // 1. Generate town name
  const name = providedName || `${rng.pick(TOWN_NAME_FRAGMENTS.prefixes)} ${rng.pick(TOWN_NAME_FRAGMENTS.suffixes)}`;
  const id = toKebabId(name);

  // 2. Generate description
  const description = rng.pick(DESCRIPTION_TEMPLATES);

  // 3. Generate sin chain
  const rawSinChain = generateSinChain(seed, chainLength);

  // 4. Generate NPCs (updates sin chain with linkedNpcs)
  const { npcs, updatedSinChain } = generateNPCs(rawSinChain, seed, { hasLaw });

  // 5. Generate locations
  const locations = generateLocations(npcs.length, `${seed}-loc`);

  // 6. Assign NPCs to actual locations (replaces placeholder 'loc-*' IDs)
  assignNPCsToLocations(npcs, locations);

  // 7. Generate topic rules
  const topicRules = generateTopicRules(npcs, updatedSinChain, locations);

  // 8. Assemble complete TownData
  return {
    id,
    name,
    description,
    locations,
    npcs,
    sinChain: updatedSinChain,
    clues: [],
    topicRules,
    hasLaw,
  };
}

/**
 * Generates a validated town, retrying on validation failure.
 * Guarantees the returned town passes all validators (sin chain,
 * NPC stakes, and playability), or throws if all attempts fail.
 *
 * Each retry uses a different seed suffix to produce a different town.
 *
 * @param config - Generation configuration
 * @param maxAttempts - Maximum number of generation attempts (default 10)
 * @returns A validated, playable TownData object
 * @throws Error if all attempts produce invalid towns
 */
export function generateValidTown(
  config: TownGenerationConfig,
  maxAttempts = 10
): TownData {
  let lastErrors: string[] = [];

  for (let i = 0; i < maxAttempts; i++) {
    const seed = i > 0 ? `${config.seed}-retry-${i}` : config.seed;
    const candidate = generateTown({ ...config, seed });
    const result = validateTown(candidate);

    if (result.valid) {
      if (result.warnings.length > 0) {
        console.warn(
          `[generateValidTown] Town "${candidate.name}" passed validation with ${result.warnings.length} warning(s):`,
          result.warnings.map(w => w.message)
        );
      }
      return candidate;
    }

    lastErrors = result.errors.map(e => e.message);
    console.warn(
      `[generateValidTown] Attempt ${i + 1}/${maxAttempts} failed with ${result.errors.length} error(s):`,
      lastErrors
    );
  }

  throw new Error(
    `[generateValidTown] All ${maxAttempts} attempts failed. Last errors:\n${lastErrors.map(e => `  - ${e}`).join('\n')}`
  );
}
