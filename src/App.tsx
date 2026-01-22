import { GameProvider } from '@/hooks/useGameState';
import { GameView } from '@/pages/GameView';

function App() {
  return (
    <GameProvider>
      <GameView />
    </GameProvider>
  );
}

export default App;
