import type { Background } from '@/types/character';
import type { DieType } from '@/types/game';

/**
 * RelationshipSeed - A pre-existing relationship template seeded by background.
 */
export interface RelationshipSeed {
  /** Archetype role to match (e.g., 'steward', 'elder') */
  targetRole: string;
  /** Initial trust level (-100 to 100) */
  initialTrust: number;
  /** Narrative reason for this relationship */
  reason: string;
  /** Relationship dice granted to the character */
  dice: DieType[];
}

/**
 * Background-driven relationship seeds.
 * Each background generates 1-2 pre-existing NPC relationships at game start.
 */
export const RELATIONSHIP_SEEDS: Record<Background, RelationshipSeed[]> = {
  'complicated-history': [
    {
      targetRole: 'elder',
      initialTrust: -15,
      reason: 'This elder remembers your family\'s disgrace. They watched and said nothing.',
      dice: ['d6'],
    },
    {
      targetRole: 'healer',
      initialTrust: 20,
      reason: 'She tended your wounds once, back when you were running from your past. She never told a soul.',
      dice: ['d6'],
    },
  ],
  'strong-community': [
    {
      targetRole: 'steward',
      initialTrust: 15,
      reason: 'The Steward recommended you for the Dogs. You owe him your calling.',
      dice: ['d6'],
    },
    {
      targetRole: 'farmer',
      initialTrust: 10,
      reason: 'You grew up on neighboring farms. He taught you to ride before you could read.',
      dice: ['d4'],
    },
  ],
  'well-rounded': [
    {
      targetRole: 'teacher',
      initialTrust: 25,
      reason: 'She was your mentor at the academy. Her letters still arrive, full of advice and quiet pride.',
      dice: ['d8'],
    },
  ],
};
