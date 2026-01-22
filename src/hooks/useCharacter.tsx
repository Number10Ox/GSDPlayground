import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { characterReducer, initialCharacterState } from '@/reducers/characterReducer';
import type { Character, CharacterAction } from '@/types/character';

interface CharacterContextValue {
  character: Character | null;
  dispatch: Dispatch<CharacterAction>;
}

const CharacterContext = createContext<CharacterContextValue | null>(null);

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character, dispatch] = useReducer(characterReducer, initialCharacterState);
  return (
    <CharacterContext.Provider value={{ character, dispatch }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
}
