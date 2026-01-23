/**
 * Sin Chain Generator
 *
 * Produces valid SinNode[] arrays from sin templates using deterministic
 * seeded random selection. Each generated chain represents a town's
 * moral progression from Pride through escalating levels of sin.
 */

import type { SinNode, SinLevel } from '@/types/investigation';
import { SIN_TEMPLATES } from '@/templates/sinTemplates';
import type { SinSlotTemplate } from '@/templates/sinTemplates';
import { createRNG } from '@/utils/seededRandom';
import { SIN_CHAIN_ORDER } from '@/reducers/investigationReducer';

/** Minimum chain length (Pride + 2 escalation levels) */
const MIN_CHAIN_LENGTH = 3;
/** Maximum chain length (all 7 sin levels) */
const MAX_CHAIN_LENGTH = 7;

/**
 * Fills a template pattern string with slot values.
 * Replaces {slotName} placeholders with corresponding values.
 *
 * @param pattern - String with {placeholder} slots
 * @param slots - Key-value map of slot names to replacement values
 * @returns Pattern with all slots filled
 */
export function fillTemplate(
  pattern: string,
  slots: Record<string, string>
): string {
  let result = pattern;
  for (const [key, value] of Object.entries(slots)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}

/**
 * Derives a town name from a seed string.
 * Produces a consistent, evocative frontier settlement name.
 */
function deriveTownName(rng: ReturnType<typeof createRNG>): string {
  const prefixes = [
    'Bridal', 'Widow', 'Salt', 'Iron', 'Bitter',
    'Silent', 'Bone', 'Cedar', 'Ash', 'Copper',
    'Fallen', 'Hollow', 'Dust', 'Stone', 'Red',
  ];
  const suffixes = [
    'Falls', 'Creek', 'Bluff', 'Crossing', 'Gulch',
    'Flats', 'Springs', 'Ridge', 'Hollow', 'Canyon',
    'Wells', 'Fork', 'Basin', 'Pass', 'Bend',
  ];
  return `${rng.pick(prefixes)} ${rng.pick(suffixes)}`;
}

/**
 * Creates a short hash string from a seed for unique ID generation.
 */
function shortHash(seed: string, index: number): string {
  let hash = 0;
  const input = `${seed}-${index}`;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash).toString(36).slice(0, 6).padEnd(6, '0');
}

/**
 * Generates a sin chain from templates using deterministic seeded selection.
 *
 * @param seed - Seed string for deterministic generation
 * @param chainLength - Number of sin levels (3-7, clamped if outside range)
 * @returns Array of SinNode objects in progression order
 */
export function generateSinChain(seed: string, chainLength: number): SinNode[] {
  // Clamp chain length to valid range
  const length = Math.max(MIN_CHAIN_LENGTH, Math.min(MAX_CHAIN_LENGTH, chainLength));

  const rng = createRNG(seed);

  // Derive town name first (consumes RNG state deterministically)
  const townName = deriveTownName(rng);

  // Select sin levels from the canonical order (always starting from pride)
  const selectedLevels: SinLevel[] = SIN_CHAIN_ORDER.slice(0, length);

  // Generate role names for slot filling
  const authorityNames = ['Steward Ezra', 'Elder Harmon', 'Brother Josiah', 'Sister Adelaide'];
  const sinnerNames = ['Caleb', 'Thaddeus', 'Miriam', 'Obadiah', 'Ruth'];
  const victimNames = ['young Sarah', 'old Matthias', 'the widow Leah', 'Brother Amos', 'Sister Naomi'];

  const authority = rng.pick(authorityNames);
  const sinner = rng.pick(sinnerNames);
  const victim = rng.pick(victimNames);

  const slots: Record<string, string> = {
    town: townName,
    authority,
    sinner,
    victim,
  };

  // Generate SinNode for each selected level
  const sinNodes: SinNode[] = selectedLevels.map((level, index) => {
    const templates: SinSlotTemplate[] = SIN_TEMPLATES[level];
    const template = rng.pick(templates);

    const id = `sin-${level}-${shortHash(seed, index)}`;
    const name = template.name;
    const description = fillTemplate(template.descriptionPattern, slots);

    return {
      id,
      level,
      name,
      description,
      discovered: false,
      resolved: false,
      linkedNpcs: [],
    };
  });

  return sinNodes;
}
