import { CharacterProvider } from '@/hooks/useCharacter';
import { GameProvider } from '@/hooks/useGameState';
import { NPCMemoryProvider } from '@/hooks/useNPCMemory';
import { InvestigationProvider } from '@/hooks/useInvestigation';
import { DialogueProvider } from '@/hooks/useDialogue';
import { GameView } from '@/pages/GameView';

function App() {
  return (
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
  );
}

export default App;
