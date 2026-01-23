/**
 * Relationship Patterns
 *
 * Defines how NPCs relate to each other based on the sin chain.
 * Each sin level has characteristic relationship patterns between
 * specific role pairs, creating the dramatic tension DitV requires.
 */

import type { SinLevel } from '@/types/investigation';

/**
 * RelationshipType - The kinds of connections between NPCs.
 */
export type RelationshipType =
  | 'family'
  | 'ally'
  | 'enemy'
  | 'romantic'
  | 'secret-keeper'
  | 'victim-of'
  | 'protector-of';

/**
 * NPCRelationship - A directed relationship between two NPCs.
 * Secret relationships are not visible to the player until discovered.
 */
export interface NPCRelationship {
  from: string;
  to: string;
  type: RelationshipType;
  secret: boolean;
  sinId?: string;
}

/**
 * RelationshipPattern - A template for generating relationships
 * between NPCs assigned to a particular sin level.
 */
export interface RelationshipPattern {
  roles: [string, string];
  type: RelationshipType;
  secret: boolean;
}

/**
 * RELATIONSHIP_PATTERNS - Relationship templates per sin level.
 * Each pattern maps role pairs to relationship types.
 * Roles are matched flexibly (partial match against NPC archetypes).
 */
export const RELATIONSHIP_PATTERNS: Record<SinLevel, RelationshipPattern[]> = {
  pride: [
    { roles: ['steward', 'sheriff'], type: 'ally', secret: false },
    { roles: ['steward', 'healer'], type: 'enemy', secret: false },
    { roles: ['elder', 'preacher'], type: 'ally', secret: false },
    { roles: ['steward', 'farmer'], type: 'victim-of', secret: true },
    { roles: ['steward', 'elder'], type: 'enemy', secret: true },
  ],

  injustice: [
    { roles: ['healer', 'widow'], type: 'protector-of', secret: false },
    { roles: ['steward', 'widow'], type: 'victim-of', secret: false },
    { roles: ['sheriff', 'healer'], type: 'enemy', secret: true },
    { roles: ['teacher', 'widow'], type: 'protector-of', secret: false },
    { roles: ['farmer', 'merchant'], type: 'ally', secret: false },
  ],

  sin: [
    { roles: ['farmer', 'widow'], type: 'protector-of', secret: true },
    { roles: ['farmer', 'steward'], type: 'enemy', secret: false },
    { roles: ['merchant', 'sheriff'], type: 'secret-keeper', secret: true },
    { roles: ['healer', 'farmer'], type: 'ally', secret: false },
    { roles: ['teacher', 'merchant'], type: 'secret-keeper', secret: true },
  ],

  'demonic-attacks': [
    { roles: ['healer', 'widow'], type: 'ally', secret: false },
    { roles: ['teacher', 'steward'], type: 'secret-keeper', secret: true },
    { roles: ['elder', 'healer'], type: 'ally', secret: false },
    { roles: ['farmer', 'preacher'], type: 'enemy', secret: false },
    { roles: ['widow', 'elder'], type: 'family', secret: false },
  ],

  'false-doctrine': [
    { roles: ['preacher', 'steward'], type: 'ally', secret: false },
    { roles: ['preacher', 'farmer'], type: 'enemy', secret: false },
    { roles: ['preacher', 'teacher'], type: 'enemy', secret: false },
    { roles: ['elder', 'preacher'], type: 'enemy', secret: true },
    { roles: ['healer', 'teacher'], type: 'ally', secret: false },
  ],

  sorcery: [
    { roles: ['farmer', 'healer'], type: 'enemy', secret: true },
    { roles: ['farmer', 'teacher'], type: 'secret-keeper', secret: true },
    { roles: ['merchant', 'farmer'], type: 'ally', secret: true },
    { roles: ['elder', 'widow'], type: 'protector-of', secret: false },
    { roles: ['sheriff', 'merchant'], type: 'enemy', secret: false },
  ],

  'hate-and-murder': [
    { roles: ['farmer', 'widow'], type: 'enemy', secret: true },
    { roles: ['sheriff', 'elder'], type: 'enemy', secret: false },
    { roles: ['healer', 'widow'], type: 'protector-of', secret: false },
    { roles: ['teacher', 'sheriff'], type: 'secret-keeper', secret: true },
    { roles: ['elder', 'steward'], type: 'enemy', secret: false },
  ],
};
