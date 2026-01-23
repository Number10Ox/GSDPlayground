import type { ApproachType } from '@/types/dialogue';
import type { EscalationLevel } from '@/types/conflict';

/**
 * Narration templates for conflicts - gives mechanical actions narrative context.
 */

const RAISE_TEMPLATES: Record<ApproachType, string[]> = {
  heart: [
    'You speak from the soul, reaching for what matters most.',
    'Your words carry genuine compassion — and an expectation of truth.',
    'You appeal to their better nature, reminding them of what they owe.',
  ],
  acuity: [
    'You lay out the facts, cold and undeniable.',
    'Your eyes catch the contradiction — you press it.',
    'You piece together what they said before. It doesn\'t add up.',
  ],
  body: [
    'You step forward. Your presence alone makes the point.',
    'Your hand moves to your coat. The implication is clear.',
    'You stand between them and the door. Nowhere to go.',
  ],
  will: [
    'You invoke the King of Life. His law is absolute.',
    'Your voice carries the weight of Scripture and station.',
    'You speak with the authority given to you. They will hear it.',
  ],
};

const SEE_TEMPLATES: Record<ApproachType, string[]> = {
  heart: [
    'You absorb their blow, letting empathy shield you.',
    'Their words sting, but you hold steady with understanding.',
    'You meet their anger with patience. It costs you.',
  ],
  acuity: [
    'You saw it coming. Your answer was prepared.',
    'Their argument has a flaw — you exploit it.',
    'You deflect with logic. Emotion won\'t sway you.',
  ],
  body: [
    'You take the hit and don\'t flinch.',
    'Your body absorbs the impact. You\'ve had worse.',
    'You stand your ground. They\'ll need more than that.',
  ],
  will: [
    'Your faith is a shield. Their words bounce off it.',
    'You draw strength from the King. This is His work.',
    'Your conviction holds. You will not be moved.',
  ],
};

const ESCALATION_TEXT: Record<EscalationLevel, string> = {
  JUST_TALKING: '',
  PHYSICAL: 'Words aren\'t enough anymore. Someone reaches out — a grabbed arm, a shove, bodies too close.',
  FIGHTING: 'It comes to blows. Fists and fury, the pretense of civilization stripped away.',
  GUNPLAY: 'Cold steel speaks now. The situation has crossed a line that can\'t be uncrossed.',
};

const GIVE_TEMPLATES = [
  'They yield. The fight drains from their eyes.',
  'Their shoulders slump. They\'ve lost and they know it.',
  'A long silence. Then, quietly: "...Alright."',
];

const PLAYER_GIVE_TEMPLATES = [
  'You can\'t press this further. Not today.',
  'Their conviction is too strong. You step back.',
  'This fight isn\'t worth what it would cost.',
];

/**
 * getConflictOpening - Generate a narrative opening for a conflict.
 */
export function getConflictOpening(stakes: string, npcName: string): string {
  return `The air between you and ${npcName} grows heavy. What's at stake: ${stakes}. Someone will yield before this is over.`;
}

/**
 * getRaiseNarration - Get flavor text for a raise action.
 */
export function getRaiseNarration(approach: ApproachType): string {
  const templates = RAISE_TEMPLATES[approach];
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * getSeeNarration - Get flavor text for a see action.
 */
export function getSeeNarration(approach: ApproachType): string {
  const templates = SEE_TEMPLATES[approach];
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * getEscalationNarration - Get the narrative for an escalation.
 */
export function getEscalationNarration(level: EscalationLevel): string {
  return ESCALATION_TEXT[level];
}

/**
 * getGiveNarration - Get flavor text when someone gives.
 */
export function getGiveNarration(isPlayer: boolean): string {
  const templates = isPlayer ? PLAYER_GIVE_TEMPLATES : GIVE_TEMPLATES;
  return templates[Math.floor(Math.random() * templates.length)];
}
