import { useState } from 'react';
import { JourneyProvider, useJourney } from '@/hooks/useJourney';
import { TownProvider } from '@/hooks/useTown';
import { CharacterProvider } from '@/hooks/useCharacter';
import { GameProvider } from '@/hooks/useGameState';
import { NPCMemoryProvider } from '@/hooks/useNPCMemory';
import { InvestigationProvider } from '@/hooks/useInvestigation';
import { DialogueProvider } from '@/hooks/useDialogue';
import { GameView } from '@/pages/GameView';
import { TownSelection } from '@/components/TownSelection/TownSelection';
import { ConvictionReflection } from '@/components/Conviction/ConvictionReflection';
import { JourneyProgress } from '@/components/Journey/JourneyProgress';
import { JourneyEnd } from '@/components/Journey/JourneyEnd';
import type { TownData } from '@/types/town';

function JourneyRouter() {
  const { journey, dispatch } = useJourney();
  const [selectedTown, setSelectedTown] = useState<TownData | null>(null);

  // Handle phase-based routing
  switch (journey.phase) {
    case 'TOWN_REFLECTION':
      return <ConvictionReflection />;

    case 'RIDING_ON':
      return <JourneyProgress />;

    case 'JOURNEY_COMPLETE':
      return <JourneyEnd />;

    default:
      break;
  }

  // CHARACTER_CREATION and TOWN_ACTIVE phases use the existing town flow
  if (!selectedTown) {
    return <TownSelection onSelectTown={(town) => {
      setSelectedTown(town);
      if (journey.phase === 'CHARACTER_CREATION') {
        dispatch({ type: 'SET_PHASE', phase: 'TOWN_ACTIVE' });
      }
    }} />;
  }

  return (
    <TownProvider town={selectedTown}>
      <CharacterProvider>
        <GameProvider>
          <NPCMemoryProvider>
            <InvestigationProvider>
              <DialogueProvider>
                <GameView />
              </DialogueProvider>
            </InvestigationProvider>
          </NPCMemoryProvider>
        </GameProvider>
      </CharacterProvider>
    </TownProvider>
  );
}

function App() {
  return (
    <JourneyProvider>
      <JourneyRouter />
    </JourneyProvider>
  );
}

export default App;
