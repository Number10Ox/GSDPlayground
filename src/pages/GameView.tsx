import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NodeMap } from '@/components/NodeMap/NodeMap';
import { NarrativePanel } from '@/components/NarrativePanel/NarrativePanel';
import { CharacterInfo } from '@/components/CharacterInfo/CharacterInfo';
import { CycleView } from '@/components/CycleView/CycleView';
import { ClockList } from '@/components/Clocks/ClockList';
import { ConflictMarker, RelationshipPanel } from '@/components/NPCMemory';
import { useGameState } from '@/hooks/useGameState';
import { useNPCMemory } from '@/hooks/useNPCMemory';

export function GameView() {
  const { state } = useGameState();
  const { clocks, cycleNumber, cyclePhase, currentLocation, locations } = state;
  const { npcs } = useNPCMemory();

  // Track selected NPC for relationship panel
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);

  // Get current location info
  const currentLocationInfo = useMemo(() => {
    return locations.find((l) => l.id === currentLocation);
  }, [locations, currentLocation]);

  // Get NPCs at current location
  const npcsAtLocation = useMemo(() => {
    return npcs.filter((npc) => npc.locationId === currentLocation);
  }, [npcs, currentLocation]);

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

        {/* NPCs at current location */}
        {npcsAtLocation.length > 0 && (
          <div className="bg-surface rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              People Here
            </h3>
            <div className="space-y-2">
              {npcsAtLocation.map((npc) => (
                <button
                  key={npc.id}
                  onClick={() => setSelectedNpcId(npc.id)}
                  className="w-full text-left p-2 rounded-lg bg-surface-light hover:bg-gray-700 transition-colors flex items-center gap-3"
                  data-testid={`npc-button-${npc.id}`}
                >
                  <div className="relative">
                    {/* NPC avatar placeholder */}
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-semibold">
                      {npc.name.charAt(0)}
                    </div>
                    <ConflictMarker npcId={npc.id} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {npc.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {npc.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Location info card */}
        <div className="bg-surface rounded-lg p-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">
            {currentLocationInfo?.name ?? 'Bridal Falls'}
          </h3>
          <p className="text-sm text-gray-400">
            {currentLocationInfo?.description ?? 'A small town nestled in the mountains. Something feels wrong here.'}
          </p>
        </div>
      </aside>

      {/* Relationship panel (overlay) */}
      <AnimatePresence>
        {selectedNpcId && (
          <RelationshipPanel
            npcId={selectedNpcId}
            onClose={() => setSelectedNpcId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
