import { produce } from 'immer';
import type { Character, CharacterAction } from '@/types/character';

export type CharacterState = Character | null;

export const initialCharacterState: CharacterState = null;

export const characterReducer = produce((draft: CharacterState, action: CharacterAction): CharacterState | void => {
  // If no character exists yet, only SET_CHARACTER is valid
  if (draft === null) {
    if (action.type === 'SET_CHARACTER') {
      return action.character;
    }
    return;
  }

  switch (action.type) {
    case 'SET_CHARACTER':
      return action.character;

    case 'ADD_TRAIT':
      draft.traits.push(action.trait);
      break;

    case 'REMOVE_TRAIT':
      draft.traits = draft.traits.filter(t => t.id !== action.traitId);
      break;

    case 'UPDATE_STAT_MODIFIER':
      draft.stats[action.statName].modifier = action.modifier;
      break;

    case 'ADD_ITEM':
      draft.inventory.push(action.item);
      break;

    case 'REMOVE_ITEM':
      draft.inventory = draft.inventory.filter(i => i.id !== action.itemId);
      break;

    case 'ADD_RELATIONSHIP':
      draft.relationships.push(action.relationship);
      break;

    case 'UPDATE_RELATIONSHIP_DICE': {
      const rel = draft.relationships.find(r => r.id === action.relationshipId);
      if (rel) {
        rel.dice = action.dice;
      }
      break;
    }
  }
});
