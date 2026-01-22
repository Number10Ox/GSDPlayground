import { NodeMap } from '@/components/NodeMap/NodeMap';
import { NarrativePanel } from '@/components/NarrativePanel/NarrativePanel';
import { CharacterInfo } from '@/components/CharacterInfo/CharacterInfo';
import { CycleView } from '@/components/CycleView/CycleView';
import { ClockList } from '@/components/Clocks/ClockList';
import { useGameState } from '@/hooks/useGameState';

export function GameView() {
  const { state } = useGameState();
  const { clocks, cycleNumber, cyclePhase } = state;

  return (
    <div className="grid grid-cols-[1fr_280px] h-screen gap-4 p-4 bg-background">
      {/* Main area: node map + cycle UI */}
      <main className="relative overflow-hidden bg-surface rounded-lg">
        {/* Node map always visible */}
        <div className="absolute inset-0 flex items-center justify-center">
          <NodeMap />
        </div>

        {/* Cycle UI overlays */}
        <CycleView />

        {/* Narrative panel */}
        <NarrativePanel />
      </main>

      {/* Sidebar: character info, clocks, location */}
      <aside className="flex flex-col gap-4">
        <CharacterInfo />

        {/* Cycle status */}
        <div className="bg-surface rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Day {cycleNumber}
          </h3>
          <p className="text-xs text-gray-500 capitalize">
            Phase: {cyclePhase.toLowerCase()}
          </p>
        </div>

        {/* Active clocks */}
        {clocks.length > 0 && (
          <div className="bg-surface rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Active Clocks
            </h3>
            <ClockList clocks={clocks} />
          </div>
        )}

        {/* Location info card */}
        <div className="bg-surface rounded-lg p-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">
            Bridal Falls
          </h3>
          <p className="text-sm text-gray-400">
            A small town nestled in the mountains. Something feels wrong here.
          </p>
        </div>
      </aside>
    </div>
  );
}
