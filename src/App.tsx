import { CharacterProvider } from '@/hooks/useCharacter';
import { GameProvider } from '@/hooks/useGameState';
import { NPCMemoryProvider } from '@/hooks/useNPCMemory';
import { GameView } from '@/pages/GameView';

function App() {
  return (
    <CharacterProvider>
      <GameProvider>
        <NPCMemoryProvider>
          <GameView />
        </NPCMemoryProvider>
      </GameProvider>
    </CharacterProvider>
  );
}

export default App;
