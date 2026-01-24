import { useState, useEffect } from 'react';
import { JourneyProvider, useJourney } from '@/hooks/useJourney';
import { TownProvider } from '@/hooks/useTown';
import { CharacterProvider } from '@/hooks/useCharacter';
import { GameProvider } from '@/hooks/useGameState';
import { NPCMemoryProvider } from '@/hooks/useNPCMemory';
import { InvestigationProvider } from '@/hooks/useInvestigation';
import { DialogueProvider } from '@/hooks/useDialogue';
import { GameView } from '@/pages/GameView';
import { TownSelection } from '@/components/TownSelection/TownSelection';
import { CharacterCreation } from '@/components/Character/CharacterCreation';
import { ConvictionReflection } from '@/components/Conviction/ConvictionReflection';
import { JourneyProgress } from '@/components/Journey/JourneyProgress';
import { JourneyEnd } from '@/components/Journey/JourneyEnd';
import type { TownData } from '@/types/town';

function JourneyRouter() {
  const { journey, dispatch } = useJourney();
  const [selectedTown, setSelectedTown] = useState<TownData | null>(null);

  // Reset selectedTown when leaving town phases
  useEffect(() => {
    if (journey.phase !== 'TOWN_ACTIVE') {
      setSelectedTown(null);
    }
  }, [journey.phase]);

  // Handle phase-based routing
  switch (journey.phase) {
    case 'CHARACTER_CREATION':
      return (
        <CharacterCreation
          onComplete={() => dispatch({ type: 'SET_PHASE', phase: 'TOWN_ACTIVE' })}
        />
      );

    case 'TOWN_REFLECTION':
      return <ConvictionReflection />;

    case 'RIDING_ON':
      return <JourneyProgress />;

    case 'JOURNEY_COMPLETE':
      return <JourneyEnd />;

    default:
      break;
  }

  // TOWN_ACTIVE phase: select a town then play it
  if (!selectedTown) {
    return <TownSelection onSelectTown={(town) => setSelectedTown(town)} />;
  }

  return (
    <TownProvider town={selectedTown}>
      <GameProvider>
        <NPCMemoryProvider>
          <InvestigationProvider>
            <DialogueProvider>
              <GameView />
            </DialogueProvider>
          </InvestigationProvider>
        </NPCMemoryProvider>
      </GameProvider>
    </TownProvider>
  );
}

function App() {
  return (
    <JourneyProvider>
      <CharacterProvider>
        <JourneyRouter />
      </CharacterProvider>
    </JourneyProvider>
  );
}

export default App;
