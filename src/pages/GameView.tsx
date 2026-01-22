import { NodeMap } from '@/components/NodeMap/NodeMap';
import { NarrativePanel } from '@/components/NarrativePanel/NarrativePanel';
import { CharacterInfo } from '@/components/CharacterInfo/CharacterInfo';

export function GameView() {
  return (
    <div className="grid grid-cols-[1fr_280px] h-screen gap-4 p-4 bg-background">
      {/* Main area: node map + narrative panel */}
      <main className="relative overflow-hidden bg-surface rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <NodeMap />
        </div>
        <NarrativePanel />
      </main>

      {/* Sidebar: character info */}
      <aside className="flex flex-col gap-4">
        <CharacterInfo />

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
