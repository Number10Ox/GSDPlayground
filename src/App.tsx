import { useState } from 'react';
import { TownProvider } from '@/hooks/useTown';
import { CharacterProvider } from '@/hooks/useCharacter';
import { GameProvider } from '@/hooks/useGameState';
import { NPCMemoryProvider } from '@/hooks/useNPCMemory';
import { InvestigationProvider } from '@/hooks/useInvestigation';
import { DialogueProvider } from '@/hooks/useDialogue';
import { GameView } from '@/pages/GameView';
import { TownSelection } from '@/components/TownSelection/TownSelection';
import type { TownData } from '@/types/town';

function App() {
  const [selectedTown, setSelectedTown] = useState<TownData | null>(null);

  if (!selectedTown) {
    return <TownSelection onSelectTown={setSelectedTown} />;
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

export default App;
