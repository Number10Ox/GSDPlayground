import type { DieType } from '@/types/game';

// Character die (simpler than game Die - no assignedTo needed)
export interface CharacterDie {
  id: string;
  type: DieType;
}

// Four stats as per Dogs in the Vineyard
export type StatName = 'acuity' | 'body' | 'heart' | 'will';

export interface Stat {
  name: StatName;
  dice: CharacterDie[];
  modifier: number; // Temporary reduction from injuries, starts at 0
}

// Traits - can be invoked in conflicts for bonus dice
export interface Trait {
  id: string;
  name: string;
  dice: CharacterDie[];
  source: 'creation' | 'fallout';
  description?: string;
}

// Items - contribute dice, guns enable escalation
export type ItemCategory = 'normal' | 'big' | 'excellent' | 'big-excellent' | 'crap';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  dice: CharacterDie[];
  isGun: boolean;
}

// Relationships with NPCs
export interface Relationship {
  id: string;
  npcId: string;
  npcName: string;
  dice: CharacterDie[];
  description?: string;
}

// Dice source discriminated union - tracks where conflict dice came from
export type DiceSource =
  | { source: 'stat'; statName: StatName; dice: CharacterDie[] }
  | { source: 'trait'; traitId: string; traitName: string; dice: CharacterDie[] }
  | { source: 'item'; itemId: string; itemName: string; dice: CharacterDie[] }
  | { source: 'relationship'; npcId: string; npcName: string; dice: CharacterDie[] };

// Background determines starting dice allocation
export type Background = 'complicated-history' | 'strong-community' | 'well-rounded';

export interface BackgroundDice {
  statPoints: number; // Points to distribute across stats (1-4 per stat, determines die type)
  traitDice: CharacterDie[];
  relationshipDice: CharacterDie[];
}

// Stat point -> die type mapping (each stat always has 2 dice of this type)
// 1 point = 2d4, 2 points = 2d6, 3 points = 2d8, 4 points = 2d10
export const STAT_POINT_TO_DIE_TYPE: Record<number, DieType> = {
  1: 'd4',
  2: 'd6',
  3: 'd8',
  4: 'd10',
};

export const BACKGROUND_DICE: Record<Background, BackgroundDice> = {
  'complicated-history': {
    statPoints: 8, // Fewer stat points, but more/better trait dice
    traitDice: [
      { id: 'bg-trait-1', type: 'd6' },
      { id: 'bg-trait-2', type: 'd6' },
      { id: 'bg-trait-3', type: 'd6' },
      { id: 'bg-trait-4', type: 'd6' },
      { id: 'bg-trait-5', type: 'd4' },
      { id: 'bg-trait-6', type: 'd4' },
      { id: 'bg-trait-7', type: 'd4' },
      { id: 'bg-trait-8', type: 'd10' },
    ],
    relationshipDice: [
      { id: 'bg-rel-1', type: 'd6' },
      { id: 'bg-rel-2', type: 'd6' },
      { id: 'bg-rel-3', type: 'd6' },
      { id: 'bg-rel-4', type: 'd6' },
    ],
  },
  'strong-community': {
    statPoints: 9, // Moderate stats, strong relationships
    traitDice: [
      { id: 'bg-trait-1', type: 'd6' },
      { id: 'bg-trait-2', type: 'd6' },
      { id: 'bg-trait-3', type: 'd6' },
      { id: 'bg-trait-4', type: 'd4' },
      { id: 'bg-trait-5', type: 'd4' },
    ],
    relationshipDice: [
      { id: 'bg-rel-1', type: 'd8' },
      { id: 'bg-rel-2', type: 'd6' },
      { id: 'bg-rel-3', type: 'd6' },
      { id: 'bg-rel-4', type: 'd6' },
      { id: 'bg-rel-5', type: 'd6' },
      { id: 'bg-rel-6', type: 'd6' },
    ],
  },
  'well-rounded': {
    statPoints: 10, // Most stat points, fewer traits/relationships
    traitDice: [
      { id: 'bg-trait-1', type: 'd6' },
      { id: 'bg-trait-2', type: 'd6' },
      { id: 'bg-trait-3', type: 'd4' },
      { id: 'bg-trait-4', type: 'd4' },
    ],
    relationshipDice: [
      { id: 'bg-rel-1', type: 'd6' },
      { id: 'bg-rel-2', type: 'd6' },
      { id: 'bg-rel-3', type: 'd6' },
      { id: 'bg-rel-4', type: 'd4' },
    ],
  },
};

// Full character state
export interface Character {
  id: string;
  name: string;
  background: Background;
  stats: {
    acuity: Stat;
    body: Stat;
    heart: Stat;
    will: Stat;
  };
  traits: Trait[];
  inventory: Item[];
  relationships: Relationship[];
}

// Character actions for reducer
export type CharacterAction =
  | { type: 'SET_CHARACTER'; character: Character }
  | { type: 'ADD_TRAIT'; trait: Trait }
  | { type: 'REMOVE_TRAIT'; traitId: string }
  | { type: 'UPDATE_STAT_MODIFIER'; statName: StatName; modifier: number }
  | { type: 'ADD_ITEM'; item: Item }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'ADD_RELATIONSHIP'; relationship: Relationship }
  | { type: 'UPDATE_RELATIONSHIP_DICE'; relationshipId: string; dice: CharacterDie[] };

// Helper: create the starting inventory every Dog receives
export function createStartingInventory(): Item[] {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Coat',
      category: 'big',
      dice: [{ id: crypto.randomUUID(), type: 'd8' }],
      isGun: false,
    },
    {
      id: crypto.randomUUID(),
      name: 'Gun',
      category: 'normal',
      dice: [
        { id: crypto.randomUUID(), type: 'd6' },
        { id: crypto.randomUUID(), type: 'd4' },
      ],
      isGun: true,
    },
    {
      id: crypto.randomUUID(),
      name: 'Book of Life',
      category: 'normal',
      dice: [{ id: crypto.randomUUID(), type: 'd6' }],
      isGun: false,
    },
    {
      id: crypto.randomUUID(),
      name: 'Sacred Earth',
      category: 'normal',
      dice: [{ id: crypto.randomUUID(), type: 'd6' }],
      isGun: false,
    },
  ];
}

// Helper: create a character with point-buy stat allocation
// Each stat gets exactly 2 dice. The allocated points determine die TYPE:
// 1 point = 2d4, 2 points = 2d6, 3 points = 2d8, 4 points = 2d10
export function createCharacter(
  name: string,
  background: Background,
  statAllocation: { acuity: number; body: number; heart: number; will: number }
): Character {
  const bgDice = BACKGROUND_DICE[background];
  const total = statAllocation.acuity + statAllocation.body + statAllocation.heart + statAllocation.will;

  if (total !== bgDice.statPoints) {
    throw new Error(
      `Stat allocation total (${total}) must equal background stat points (${bgDice.statPoints}) for ${background}`
    );
  }

  function createStatDice(points: number): CharacterDie[] {
    const dieType = STAT_POINT_TO_DIE_TYPE[points] || 'd6';
    return [
      { id: crypto.randomUUID(), type: dieType },
      { id: crypto.randomUUID(), type: dieType },
    ];
  }

  return {
    id: crypto.randomUUID(),
    name,
    background,
    stats: {
      acuity: { name: 'acuity', dice: createStatDice(statAllocation.acuity), modifier: 0 },
      body: { name: 'body', dice: createStatDice(statAllocation.body), modifier: 0 },
      heart: { name: 'heart', dice: createStatDice(statAllocation.heart), modifier: 0 },
      will: { name: 'will', dice: createStatDice(statAllocation.will), modifier: 0 },
    },
    traits: [],
    inventory: createStartingInventory(),
    relationships: [],
  };
}
