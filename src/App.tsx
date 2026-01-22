import { GameProvider } from '@/hooks/useGameState';
import { NPCMemoryProvider } from '@/hooks/useNPCMemory';
import { GameView } from '@/pages/GameView';

function App() {
  return (
    <GameProvider>
      <NPCMemoryProvider>
        <GameView />
      </NPCMemoryProvider>
    </GameProvider>
  );
}

export default App;
