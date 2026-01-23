import type { DieType } from '@/types/game';

/**
 * DutyTrigger - Condition that makes a duty available as an action.
 */
export type DutyTrigger =
  | { type: 'TRUST_THRESHOLD'; npcId: string; min: number }
  | { type: 'CYCLE_REACHED'; min: number }
  | { type: 'CLUE_FOUND'; clueId: string };

/**
 * DutyDefinition - A sacred duty that Dogs can perform when conditions are met.
 */
export interface DutyDefinition {
  id: string;
  name: string;
  description: string;
  /** Location where this duty can be performed (null = any location) */
  locationId: string | null;
  /** Trigger condition that makes this duty available */
  trigger: DutyTrigger;
  /** Narrative text shown when the duty is performed */
  successNarrative: string;
  /** Effects: trust gain, condition restore, clock advance */
  effects: {
    trustGain?: { npcId: string; amount: number };
    conditionRestore?: number;
    clockAdvance?: { clockId: string; amount: number };
  };
  /** Dice cost to perform this duty */
  diceCost: number;
}

/**
 * Duties available in Bridal Falls.
 * Each duty is unlocked by a specific trigger and can only be performed once.
 */
export const BRIDAL_FALLS_DUTIES: DutyDefinition[] = [
  {
    id: 'duty-name-child',
    name: 'Name the newborn',
    description: 'A family asks you to name and bless their child, born during these troubled times.',
    locationId: null,
    trigger: { type: 'CYCLE_REACHED', min: 2 },
    successNarrative: 'You hold the infant gently and speak the words of naming. "In the sight of the King of Life, I name this child." The parents weep with gratitude. For a moment, the town remembers what goodness feels like.',
    effects: {
      conditionRestore: 15,
      clockAdvance: { clockId: 'duties-fulfilled', amount: 1 },
    },
    diceCost: 1,
  },
  {
    id: 'duty-bless-sick',
    name: 'Bless the sick',
    description: 'A fevered soul lies suffering. They ask for your blessing before they pass.',
    locationId: null,
    trigger: { type: 'CYCLE_REACHED', min: 3 },
    successNarrative: 'You kneel by the bedside and lay hands on the burning forehead. The fever breaks like a wave retreating from shore. Color returns to the cheeks. "Thank the King," they whisper. "Thank you, Dog."',
    effects: {
      conditionRestore: 10,
      trustGain: { npcId: 'npc-healer', amount: 10 },
      clockAdvance: { clockId: 'duties-fulfilled', amount: 1 },
    },
    diceCost: 1,
  },
  {
    id: 'duty-perform-marriage',
    name: 'Perform a marriage',
    description: 'A young couple asks you to wed them — the Steward refused, calling their union sinful.',
    locationId: null,
    trigger: { type: 'TRUST_THRESHOLD', npcId: 'npc-farmer', min: 20 },
    successNarrative: 'You speak the words of binding under the open sky, away from the Steward\'s disapproving gaze. "What the King has joined, let no mortal put asunder." The couple clasps hands. The witnesses smile through tears. You have defied the Steward — and it felt righteous.',
    effects: {
      trustGain: { npcId: 'npc-farmer', amount: 15 },
      clockAdvance: { clockId: 'duties-fulfilled', amount: 1 },
    },
    diceCost: 1,
  },
  {
    id: 'duty-consecrate-ground',
    name: 'Consecrate the ground',
    description: 'The earth feels wrong here. Something rots beneath the surface. It must be cleansed.',
    locationId: null,
    trigger: { type: 'CYCLE_REACHED', min: 4 },
    successNarrative: 'You scatter sacred earth and speak the words of cleansing. The ground shudders — or perhaps that is your imagination. But the air feels lighter afterward. The crows that had been circling disperse. Whatever was feeding here has been driven back, for now.',
    effects: {
      conditionRestore: 5,
      clockAdvance: { clockId: 'duties-fulfilled', amount: 1 },
    },
    diceCost: 1,
  },
  {
    id: 'duty-settle-dispute',
    name: 'Settle a dispute',
    description: 'Two families stand on the verge of violence over a boundary claim. They need a Dog\'s judgment.',
    locationId: null,
    trigger: { type: 'TRUST_THRESHOLD', npcId: 'npc-elder', min: 15 },
    successNarrative: 'You hear both sides with patience. Then you speak your judgment — fair, firm, final. Neither party is entirely happy, but both accept your authority. The King\'s law holds, and blood stays unspilled. This is what Dogs are for.',
    effects: {
      trustGain: { npcId: 'npc-elder', amount: 10 },
      conditionRestore: 5,
      clockAdvance: { clockId: 'duties-fulfilled', amount: 1 },
    },
    diceCost: 1,
  },
];
