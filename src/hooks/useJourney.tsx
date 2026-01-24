import { createContext, useContext, useReducer, useCallback, type ReactNode, type Dispatch } from 'react';
import { journeyReducer, createInitialJourneyState } from '@/reducers/journeyReducer';
import { CONVICTION_STRENGTH_DICE } from '@/types/conviction';
import type { JourneyState, JourneyAction } from '@/types/journey';
import type { Conviction, ConvictionTestTrigger, ConvictionTest } from '@/types/conviction';
import type { CharacterDie, StatName } from '@/types/character';

interface JourneyContextValue {
  journey: JourneyState;
  dispatch: Dispatch<JourneyAction>;
  getActiveConvictions: () => Conviction[];
  getConvictionDice: (convictionId: string) => CharacterDie[];
  testConviction: (convictionId: string, trigger: ConvictionTestTrigger, description: string) => void;
  isJourneyComplete: () => boolean;
  getConvictionForStat: (stat: StatName) => Conviction | undefined;
  getTestedConvictions: () => Conviction[];
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [journey, dispatch] = useReducer(journeyReducer, undefined, createInitialJourneyState);

  const getActiveConvictions = useCallback((): Conviction[] => {
    return journey.convictions.filter(c => c.lifecycle !== 'resolved');
  }, [journey.convictions]);

  const getConvictionDice = useCallback((convictionId: string): CharacterDie[] => {
    const conviction = journey.convictions.find(c => c.id === convictionId);
    if (!conviction || conviction.lifecycle === 'resolved') return [];
    const dieType = CONVICTION_STRENGTH_DICE[conviction.strength];
    return [{ id: `${convictionId}-die`, type: dieType }];
  }, [journey.convictions]);

  const testConviction = useCallback((
    convictionId: string,
    trigger: ConvictionTestTrigger,
    description: string
  ) => {
    const conviction = journey.convictions.find(c => c.id === convictionId);
    if (!conviction || conviction.lifecycle === 'resolved') return;

    const test: ConvictionTest = {
      id: crypto.randomUUID(),
      convictionId,
      trigger,
      description,
      townId: `town-${journey.currentTownIndex}`,
    };
    dispatch({ type: 'ADD_CONVICTION_TEST', test });
  }, [journey.convictions, journey.currentTownIndex, dispatch]);

  const isJourneyComplete = useCallback((): boolean => {
    return journey.allConvictionsResolved || journey.currentTownIndex >= journey.maxTowns;
  }, [journey.allConvictionsResolved, journey.currentTownIndex, journey.maxTowns]);

  const getConvictionForStat = useCallback((stat: StatName): Conviction | undefined => {
    return journey.convictions.find(c => c.associatedStat === stat && c.lifecycle !== 'resolved');
  }, [journey.convictions]);

  const getTestedConvictions = useCallback((): Conviction[] => {
    return journey.convictions.filter(c => c.lifecycle === 'tested' || c.lifecycle === 'broken');
  }, [journey.convictions]);

  return (
    <JourneyContext.Provider value={{
      journey,
      dispatch,
      getActiveConvictions,
      getConvictionDice,
      testConviction,
      isJourneyComplete,
      getConvictionForStat,
      getTestedConvictions,
    }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
}
