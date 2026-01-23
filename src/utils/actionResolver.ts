import type { Die } from '@/types/game';
import type { LocationClue } from '@/types/investigation';

/**
 * ActionEffect - Game state changes produced by resolving an action.
 */
export type ActionEffect =
  | { type: 'DISCOVER_CLUE'; clueId: string; description: string }
  | { type: 'TRUST_CHANGE'; npcId: string; delta: number }
  | { type: 'GATHER_INFO'; text: string }
  | { type: 'RESTORE_CONDITION'; amount: number }
  | { type: 'ADVANCE_CLOCK'; clockId: string; amount: number };

/**
 * ActionResult - Outcome of resolving a single die against an action.
 */
export interface ActionResult {
  actionId: string;
  actionName: string;
  die: Die;
  success: boolean;
  effects: ActionEffect[];
  narrativeText: string;
}

/**
 * Die size to max value mapping.
 */
const DIE_MAX: Record<string, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
};

/**
 * resolveAction - Roll a die against an action's difficulty and produce effects.
 *
 * Success threshold: die value must be >= half the die's max value (rounded up).
 * e.g., d6 needs 4+, d4 needs 3+, d8 needs 5+, d10 needs 6+
 *
 * @param die - The allocated die
 * @param actionId - Which action was targeted
 * @param actionName - Display name of the action
 * @param actionType - Category determining what effects to produce
 * @param context - Available clues, NPCs at location, etc.
 */
export function resolveAction(
  die: Die,
  actionId: string,
  actionName: string,
  actionType: 'investigate' | 'observe' | 'pray' | 'authority' | 'talk' | 'duty',
  context: {
    availableClues?: LocationClue[];
    npcIds?: string[];
    clockId?: string;
    dutyNarrative?: string;
  }
): ActionResult {
  const maxVal = DIE_MAX[die.type] ?? 6;
  const threshold = Math.ceil(maxVal / 2);
  const success = die.value >= threshold;

  const effects: ActionEffect[] = [];
  let narrativeText = '';

  if (success) {
    switch (actionType) {
      case 'investigate': {
        // Find an undiscovered clue at this location
        const clue = context.availableClues?.find(c => !c.found);
        if (clue) {
          effects.push({ type: 'DISCOVER_CLUE', clueId: clue.id, description: clue.description });
          narrativeText = `You search carefully and discover something: ${clue.description}`;
        } else {
          effects.push({ type: 'GATHER_INFO', text: 'You search thoroughly but find nothing new.' });
          narrativeText = 'You search thoroughly but find nothing new here.';
        }
        break;
      }
      case 'observe': {
        // Gain trust with NPCs at location
        const npcId = context.npcIds?.[0];
        if (npcId) {
          effects.push({ type: 'TRUST_CHANGE', npcId, delta: 5 });
          narrativeText = 'You watch carefully, noting habits and routines. Your patience earns a measure of respect.';
        } else {
          effects.push({ type: 'GATHER_INFO', text: 'You observe the area, taking mental notes.' });
          narrativeText = 'You observe the area, taking mental notes of what you see.';
        }
        break;
      }
      case 'pray': {
        effects.push({ type: 'RESTORE_CONDITION', amount: 10 });
        narrativeText = 'You kneel in prayer. The King of Life grants you strength for what lies ahead.';
        break;
      }
      case 'authority': {
        // Broad trust gain — the service raises standing with all NPCs present
        if (context.npcIds && context.npcIds.length > 0) {
          for (const npcId of context.npcIds) {
            effects.push({ type: 'TRUST_CHANGE', npcId, delta: 8 });
          }
        }
        effects.push({ type: 'ADVANCE_CLOCK', clockId: 'trust-earned', amount: 1 });
        effects.push({ type: 'RESTORE_CONDITION', amount: 5 });
        narrativeText = 'You gather the faithful and speak with the King\'s authority. Your words settle into hearts like rain on dry earth.';
        break;
      }
      case 'talk': {
        const npcId = context.npcIds?.[0];
        if (npcId) {
          effects.push({ type: 'TRUST_CHANGE', npcId, delta: 3 });
        }
        narrativeText = 'Your words carry weight. The conversation moves things forward.';
        break;
      }
      case 'duty': {
        // Duties always succeed on any roll (the act of performing them is what matters)
        effects.push({ type: 'RESTORE_CONDITION', amount: 5 });
        effects.push({ type: 'ADVANCE_CLOCK', clockId: 'duties-fulfilled', amount: 1 });
        narrativeText = context.dutyNarrative || 'You perform your sacred duty as a Dog of the Vineyard.';
        break;
      }
    }
  } else {
    // Failure narratives
    switch (actionType) {
      case 'investigate':
        narrativeText = 'You search but find nothing of use. Perhaps a different approach would help.';
        break;
      case 'observe':
        narrativeText = 'You watch, but the moment passes without insight.';
        break;
      case 'pray':
        narrativeText = 'Your prayers feel hollow today. The silence weighs on you.';
        break;
      case 'authority':
        narrativeText = 'Your authority falters. The words don\'t carry their usual weight.';
        break;
      case 'talk':
        narrativeText = 'The conversation goes nowhere. They aren\'t ready to hear you.';
        break;
      case 'duty':
        // Duties still succeed on failure rolls (the faith is what matters)
        effects.push({ type: 'ADVANCE_CLOCK', clockId: 'duties-fulfilled', amount: 1 });
        narrativeText = context.dutyNarrative || 'The ritual feels hollow, but the duty is done. The King of Life accepts your effort.';
        break;
    }
  }

  return {
    actionId,
    actionName,
    die,
    success,
    effects,
    narrativeText,
  };
}
