import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NodeMap } from '@/components/NodeMap/NodeMap';
import { NarrativePanel } from '@/components/NarrativePanel/NarrativePanel';
import { CharacterInfo } from '@/components/CharacterInfo/CharacterInfo';
import { CharacterCreation } from '@/components/Character/CharacterCreation';
import { CharacterSheet } from '@/components/Character/CharacterSheet';
import { CycleView } from '@/components/CycleView/CycleView';
import { ClockList } from '@/components/Clocks/ClockList';
import { ConflictMarker, RelationshipPanel } from '@/components/NPCMemory';
import { ConflictView } from '@/components/Conflict/ConflictView';
import { DialogueView } from '@/components/Dialogue/DialogueView';
import { MentalMap } from '@/components/MentalMap/MentalMap';
import { FatigueClock } from '@/components/FatigueClock/FatigueClock';
import { ResolutionSummary } from '@/components/Resolution/ResolutionSummary';
import { useGameState } from '@/hooks/useGameState';
import { useCharacter } from '@/hooks/useCharacter';
import { useNPCMemory } from '@/hooks/useNPCMemory';
import { useInvestigation } from '@/hooks/useInvestigation';
import { useDialogue } from '@/hooks/useDialogue';
import { initialConflictState, conflictReducer } from '@/reducers/conflictReducer';
import { TEST_SIN_CHAIN } from '@/data/testTown';
import { getTopicsForNPC } from '@/data/testTown';
import type { ConflictState } from '@/types/conflict';
import type { Die } from '@/types/game';

export function GameView() {
  const { state, dispatch } = useGameState();
  const { character, dispatch: charDispatch } = useCharacter();
  const { clocks, cycleNumber, cyclePhase, currentLocation, locations, activeConflict } = state;
  const { npcs } = useNPCMemory();
  const { state: investigationState, dispatch: investigationDispatch } = useInvestigation();
  const { dispatch: dialogueDispatch } = useDialogue();

  // Track selected NPC for relationship panel
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);

  // Character creation modal state
  const [showCreation, setShowCreation] = useState(false);

  // Character sheet overlay state
  const [showSheet, setShowSheet] = useState(false);

  // Mental map overlay state
  const [showMentalMap, setShowMentalMap] = useState(false);

  // Dialogue state
  const [showDialogue, setShowDialogue] = useState(false);
  const [dialogueNpcId, setDialogueNpcId] = useState<string | null>(null);

  // Fatigue toast message
  const [fatigueToast, setFatigueToast] = useState(false);

  // Conflict state for ConflictView (dev mode test conflicts)
  const [conflictState, setConflictState] = useState<ConflictState | null>(null);

  // Initialize investigation on mount with test town sin chain
  useEffect(() => {
    if (investigationState.sinProgression.length === 0) {
      investigationDispatch({ type: 'START_INVESTIGATION', sinNodes: TEST_SIN_CHAIN });
    }
  }, [investigationState.sinProgression.length, investigationDispatch]);

  // Handle NPC click - open dialogue if not fatigued
  const handleNpcClick = useCallback((npcId: string) => {
    const { fatigueClock } = investigationState;
    if (fatigueClock.current >= fatigueClock.max) {
      // Show fatigue toast
      setFatigueToast(true);
      setTimeout(() => setFatigueToast(false), 2000);
      return;
    }

    // Get discovered sin IDs for topic generation
    const discoveredSinIds = investigationState.sinProgression
      .filter(s => s.discovered)
      .map(s => s.id);

    // Generate topics for this NPC
    const topics = getTopicsForNPC(npcId, discoveredSinIds, currentLocation);

    // Open dialogue
    setDialogueNpcId(npcId);
    setShowDialogue(true);
    dialogueDispatch({ type: 'START_CONVERSATION', npcId, topics });
  }, [investigationState, currentLocation, dialogueDispatch]);

  // Handle dialogue close
  const handleDialogueClose = useCallback(() => {
    setShowDialogue(false);
    setDialogueNpcId(null);
  }, []);

  // Handle conflict start from dialogue
  const handleConflictFromDialogue = useCallback((npcId: string, stakes: string) => {
    // Close dialogue
    handleDialogueClose();

    // Create dice pools
    const playerDice: Die[] = [
      { id: 'player-d1', type: 'd8', value: 6, assignedTo: null },
      { id: 'player-d2', type: 'd8', value: 5, assignedTo: null },
      { id: 'player-d3', type: 'd6', value: 4, assignedTo: null },
      { id: 'player-d4', type: 'd6', value: 4, assignedTo: null },
      { id: 'player-d5', type: 'd6', value: 3, assignedTo: null },
      { id: 'player-d6', type: 'd4', value: 2, assignedTo: null },
    ];

    const npcDice: Die[] = [
      { id: 'npc-d1', type: 'd8', value: 6, assignedTo: null },
      { id: 'npc-d2', type: 'd8', value: 5, assignedTo: null },
      { id: 'npc-d3', type: 'd6', value: 4, assignedTo: null },
      { id: 'npc-d4', type: 'd6', value: 4, assignedTo: null },
      { id: 'npc-d5', type: 'd6', value: 3, assignedTo: null },
      { id: 'npc-d6', type: 'd4', value: 2, assignedTo: null },
    ];

    const initialState = conflictReducer(initialConflictState, {
      type: 'START_CONFLICT',
      npcId,
      stakes,
      playerDice,
      npcDice,
    });

    dispatch({ type: 'START_GAME_CONFLICT', npcId, stakes });
    setConflictState(initialState);
  }, [dispatch, handleDialogueClose]);

  // Start a test conflict (dev mode)
  const handleStartTestConflict = useCallback(() => {
    handleConflictFromDialogue('sheriff-jacob', 'who controls the law in this town');
  }, [handleConflictFromDialogue]);

  // Handle conflict completion
  const handleConflictComplete = useCallback(() => {
    // Check if the conflict NPC is linked to a sin - if so, confront it
    if (activeConflict) {
      const linkedSin = investigationState.sinProgression.find(
        sin => sin.linkedNpcs.includes(activeConflict.npcId) && sin.discovered && !sin.resolved
      );
      if (linkedSin) {
        investigationDispatch({ type: 'CONFRONT_SIN', sinId: linkedSin.id });
      }
    }

    setConflictState(null);
    dispatch({ type: 'END_GAME_CONFLICT' });
  }, [activeConflict, investigationState.sinProgression, investigationDispatch, dispatch]);

  // Watch for cycle end (REST phase) - reset fatigue and advance sin progression
  const [prevCyclePhase, setPrevCyclePhase] = useState(cyclePhase);
  useEffect(() => {
    if (prevCyclePhase !== 'REST' && cyclePhase === 'REST') {
      investigationDispatch({ type: 'RESET_FATIGUE' });
      investigationDispatch({ type: 'ADVANCE_SIN_PROGRESSION' });
    }
    setPrevCyclePhase(cyclePhase);
  }, [cyclePhase, prevCyclePhase, investigationDispatch]);

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
        <CharacterInfo
          onCreateCharacter={() => setShowCreation(true)}
          onViewSheet={() => setShowSheet(true)}
        />

        {/* Cycle status */}
        <div className="bg-surface rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Day {cycleNumber}
          </h3>
          <p className="text-xs text-gray-500 capitalize">
            Phase: {cyclePhase.toLowerCase()}
          </p>

          {/* Fatigue Clock */}
          <div className="mt-3 flex items-center justify-center">
            <FatigueClock
              current={investigationState.fatigueClock.current}
              max={investigationState.fatigueClock.max}
            />
          </div>
        </div>

        {/* Mental Map button */}
        <button
          data-testid="open-mental-map"
          onClick={() => setShowMentalMap(true)}
          className="w-full bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          View Mental Map
        </button>

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
                  onClick={() => handleNpcClick(npc.id)}
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

        {/* Dev mode: Test helpers */}
        {import.meta.env.DEV && !activeConflict && (
          <div className="space-y-2">
            <button
              data-testid="start-test-conflict"
              onClick={handleStartTestConflict}
              className="w-full bg-red-900/50 hover:bg-red-800/50 text-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Start Test Conflict
            </button>
            {investigationState.sinProgression.length === 0 && (
              <button
                data-testid="start-investigation"
                onClick={() => investigationDispatch({ type: 'START_INVESTIGATION', sinNodes: TEST_SIN_CHAIN })}
                className="w-full bg-green-900/50 hover:bg-green-800/50 text-green-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Start Investigation
              </button>
            )}
            <button
              data-testid="advance-sin"
              onClick={() => investigationDispatch({ type: 'ADVANCE_SIN_PROGRESSION' })}
              className="w-full bg-orange-900/50 hover:bg-orange-800/50 text-orange-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Advance Sin
            </button>
            {character && (
              <button
                data-testid="add-test-trait"
                onClick={() => {
                  charDispatch({
                    type: 'ADD_TRAIT',
                    trait: {
                      id: 'test-trait-quick-draw',
                      name: 'Quick Draw',
                      dice: [{ id: 'test-trait-die-1', type: 'd6' }],
                      source: 'creation',
                    },
                  });
                }}
                className="w-full bg-purple-900/50 hover:bg-purple-800/50 text-purple-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add Test Trait
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Fatigue toast */}
      <AnimatePresence>
        {fatigueToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 text-red-200 px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-fade-in">
            Too tired to talk. Rest to recover.
          </div>
        )}
      </AnimatePresence>

      {/* Relationship panel (overlay) */}
      <AnimatePresence>
        {selectedNpcId && (
          <RelationshipPanel
            npcId={selectedNpcId}
            onClose={() => setSelectedNpcId(null)}
          />
        )}
      </AnimatePresence>

      {/* Dialogue view (overlay) */}
      {showDialogue && dialogueNpcId && (
        <DialogueView />
      )}

      {/* Mental Map (overlay) */}
      {showMentalMap && (
        <div className="fixed inset-0 z-40 bg-black/80 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-4xl flex-1 relative">
            <button
              data-testid="close-mental-map"
              onClick={() => setShowMentalMap(false)}
              className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 text-lg cursor-pointer"
            >
              x
            </button>
            <MentalMap />
          </div>
        </div>
      )}

      {/* Resolution summary (overlay - highest z-index) */}
      <ResolutionSummary />

      {/* Conflict view (overlay) */}
      {conflictState && conflictState.phase !== 'INACTIVE' && (
        <ConflictView
          initialState={conflictState}
          npcName={npcs.find(n => n.id === activeConflict?.npcId)?.name ?? 'Unknown'}
          onComplete={handleConflictComplete}
        />
      )}

      {/* Character sheet (overlay) - shows when user clicks View Character Sheet */}
      {character && showSheet && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative max-h-[90vh] overflow-y-auto">
            <CharacterSheet />
            <button
              data-testid="close-character-sheet"
              onClick={() => setShowSheet(false)}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 text-lg"
            >
              x
            </button>
          </div>
        </div>
      )}

      {/* Character creation (overlay) - shows when user clicks Create Character */}
      {!character && showCreation && (
        <CharacterCreation onComplete={() => setShowCreation(false)} />
      )}
    </div>
  );
}
