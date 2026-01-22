import type { Trait, CharacterDie } from '@/types/character';
import type { FalloutSeverity, FalloutType } from '@/types/conflict';
import type { DieType } from '@/types/game';

/**
 * Thematic trait names grouped by fallout type.
 * When a Dog takes fallout, they gain a trait named after the damage.
 * These become part of the character's identity - consequences of violence.
 */
export const FALLOUT_TRAIT_NAMES: Record<FalloutType, string[]> = {
  SOCIAL: [
    'Shamed reputation',
    'Haunted by words',
    'Bitter tongue',
    'Broken trust',
    'Dark conviction',
  ],
  PHYSICAL: [
    'Bruised ribs',
    'Twisted ankle',
    'Split lip',
    'Aching shoulder',
    'Cracked knuckle',
  ],
  VIOLENT: [
    'Scarred face',
    'Broken arm',
    'Deep gash',
    'Shattered jaw',
    'Bullet graze',
  ],
  LETHAL: [
    'Gutshot survivor',
    'Near-death vision',
    'One good eye left',
    'Shattered leg',
    'Lung damage',
  ],
};

/**
 * Map fallout severity to the die type of the resulting trait.
 * More severe fallout = better die (the scar makes you tougher).
 */
const SEVERITY_TO_DIE_TYPE: Partial<Record<FalloutSeverity, DieType>> = {
  MINOR: 'd4',
  SERIOUS: 'd6',
  DEADLY: 'd8',
};

/**
 * Create a trait from conflict fallout.
 *
 * In Dogs in the Vineyard, taking damage creates permanent traits.
 * "Scarred face" or "Broken trust" become part of who the Dog is,
 * and can be invoked in future conflicts where they're relevant.
 *
 * @param severity - How bad the fallout was (determines die type)
 * @param falloutType - What kind of damage (determines trait name theme)
 * @param customName - Optional override for the trait name
 * @returns The new Trait, or null if severity doesn't create a trait
 */
export function createTraitFromFallout(
  severity: FalloutSeverity,
  falloutType: FalloutType,
  customName?: string
): Trait | null {
  // NONE and DEATH don't create traits
  const dieType = SEVERITY_TO_DIE_TYPE[severity];
  if (!dieType) {
    return null;
  }

  // Pick a random name from the themed pool if no custom name provided
  const names = FALLOUT_TRAIT_NAMES[falloutType];
  const name = customName ?? names[Math.floor(Math.random() * names.length)];

  const die: CharacterDie = {
    id: crypto.randomUUID(),
    type: dieType,
  };

  return {
    id: crypto.randomUUID(),
    name,
    dice: [die],
    source: 'fallout',
  };
}
