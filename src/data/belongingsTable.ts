import type { ItemCategory } from '@/types/character';
import type { DieType } from '@/types/game';

export interface BelongingTemplate {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  dice: DieType[];
  isGun: boolean;
}

/**
 * Table of ~20 unusual belongings a Dog might carry.
 * During character creation, 4 are drawn at random and the player picks 2.
 */
export const BELONGINGS_TABLE: BelongingTemplate[] = [
  {
    id: 'belonging-cavalry-sabre',
    name: "Father's cavalry sabre",
    description: 'A heavy blade, nicked and re-sharpened. It saw the wars back East.',
    category: 'big',
    dice: ['d6', 'd4'],
    isGun: false,
  },
  {
    id: 'belonging-jar-lightning-bugs',
    name: 'Jar of preserved lightning bugs',
    description: 'They still glow faintly in the dark. No one can explain why.',
    category: 'normal',
    dice: ['d4'],
    isGun: false,
  },
  {
    id: 'belonging-blood-map',
    name: 'Map with towns marked in blood',
    description: 'Someone marked every town that fell to sin. The ink dried brown.',
    category: 'normal',
    dice: ['d4'],
    isGun: false,
  },
  {
    id: 'belonging-bone-dice',
    name: 'Set of bone dice',
    description: "Carved from a sinner's remains by your predecessor. They always roll true.",
    category: 'normal',
    dice: ['d6'],
    isGun: false,
  },
  {
    id: 'belonging-mothers-locket',
    name: "Mother's silver locket",
    description: 'Contains a lock of hair and a prayer written too small to read.',
    category: 'excellent',
    dice: ['d6', 'd4'],
    isGun: false,
  },
  {
    id: 'belonging-branding-iron',
    name: 'Branding iron (star pattern)',
    description: 'For marking cattle — or marking the unrepentant, if it comes to that.',
    category: 'big',
    dice: ['d6'],
    isGun: false,
  },
  {
    id: 'belonging-jar-sacred-earth',
    name: 'Jar of red desert earth',
    description: 'From the place where the King of Life first spoke. Warm to the touch.',
    category: 'normal',
    dice: ['d4', 'd4'],
    isGun: false,
  },
  {
    id: 'belonging-worn-journal',
    name: 'Worn leather journal',
    description: 'Half-filled with observations about sin. The other half is sketches of birds.',
    category: 'normal',
    dice: ['d6'],
    isGun: false,
  },
  {
    id: 'belonging-tin-whistle',
    name: 'Tin whistle',
    description: 'Plays three hymns and one song your grandmother taught you that isn\'t.',
    category: 'normal',
    dice: ['d4'],
    isGun: false,
  },
  {
    id: 'belonging-second-gun',
    name: 'Second revolver (concealed)',
    description: 'Strapped to your ankle. For when talk fails and the first gun is empty.',
    category: 'normal',
    dice: ['d6'],
    isGun: true,
  },
  {
    id: 'belonging-medicine-pouch',
    name: 'Healer\'s medicine pouch',
    description: 'Herbs, poultices, and a needle and thread. Smells like sage and regret.',
    category: 'normal',
    dice: ['d6'],
    isGun: false,
  },
  {
    id: 'belonging-rope-noose',
    name: 'Length of blessed rope',
    description: 'Consecrated for binding demons. Also good for tying horses.',
    category: 'big',
    dice: ['d6'],
    isGun: false,
  },
  {
    id: 'belonging-dead-dogs-coat',
    name: "Dead Dog's coat",
    description: 'Belonged to a Dog who didn\'t come home. The bloodstains won\'t wash out.',
    category: 'big-excellent',
    dice: ['d8'],
    isGun: false,
  },
  {
    id: 'belonging-steel-mirror',
    name: 'Polished steel mirror',
    description: 'They say demons can\'t bear to see their own reflection. Worth testing.',
    category: 'normal',
    dice: ['d4'],
    isGun: false,
  },
  {
    id: 'belonging-compass-wrong',
    name: 'Compass that points wrong',
    description: 'Doesn\'t point north. Points toward something else. You haven\'t figured out what.',
    category: 'normal',
    dice: ['d4', 'd4'],
    isGun: false,
  },
  {
    id: 'belonging-grandpas-rifle',
    name: "Grandfather's hunting rifle",
    description: 'Long-barreled and accurate. He used it on wolves. You use it on worse.',
    category: 'big',
    dice: ['d8'],
    isGun: true,
  },
  {
    id: 'belonging-prayer-beads',
    name: 'String of prayer beads',
    description: 'Forty beads for forty days in the desert. Worn smooth by anxious fingers.',
    category: 'normal',
    dice: ['d6'],
    isGun: false,
  },
  {
    id: 'belonging-wanted-poster',
    name: 'Wanted poster (your face)',
    description: 'From before you were a Dog. The name on it isn\'t yours anymore.',
    category: 'crap',
    dice: ['d4'],
    isGun: false,
  },
  {
    id: 'belonging-ceremonial-knife',
    name: 'Ceremonial skinning knife',
    description: 'For preparing sacred offerings. The blade is obsidian, impossibly sharp.',
    category: 'excellent',
    dice: ['d6', 'd4'],
    isGun: false,
  },
  {
    id: 'belonging-preserved-hand',
    name: 'Preserved sorcerer\'s hand',
    description: 'Taken as proof of judgment carried out. The fingers still twitch at midnight.',
    category: 'normal',
    dice: ['d6', 'd4'],
    isGun: false,
  },
];

/**
 * Draw N random belongings from the table without replacement.
 */
export function drawBelongings(count: number): BelongingTemplate[] {
  const shuffled = [...BELONGINGS_TABLE].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
