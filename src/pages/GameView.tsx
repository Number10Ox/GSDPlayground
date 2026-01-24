import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NodeMap } from '@/components/NodeMap/NodeMap';
import { NarrativePanel } from '@/components/NarrativePanel/NarrativePanel';
import { CharacterInfo } from '@/components/CharacterInfo/CharacterInfo';
import { CharacterCreation } from '@/components/Character/CharacterCreation';
import { CharacterSheet } from '@/components/Character/CharacterSheet';
import { ClockList } from '@/components/Clocks/ClockList';
import { ConflictMarker, RelationshipPanel } from '@/components/NPCMemory';
import { ConflictView } from '@/components/Conflict/ConflictView';
import { DialogueView } from '@/components/Dialogue/DialogueView';
import { MentalMap } from '@/components/MentalMap/MentalMap';
import { ActionMenu } from '@/components/ActionMenu/ActionMenu';
import type { ConflictOutcomeInfo } from '@/components/Conflict/ConflictView';
import { ResolutionSummary } from '@/components/Resolution/ResolutionSummary';
import { TownArrival } from '@/components/TownArrival/TownArrival';
import { useGameState } from '@/hooks/useGameState';
import { useCharacter } from '@/hooks/useCharacter';
import { useNPCMemory } from '@/hooks/useNPCMemory';
import { useInvestigation } from '@/hooks/useInvestigation';
import { useDialogue } from '@/hooks/useDialogue';
import { RELATIONSHIP_SEEDS } from '@/data/relationshipSeeds';
import { initialConflictState, conflictReducer } from '@/reducers/conflictReducer';
import { SIN_CHAIN_ORDER } from '@/reducers/investigationReducer';
import { useTown } from '@/hooks/useTown';
import { resolveTopicsForNPC } from '@/utils/topicResolver';
import { buildPlayerDicePool, buildNPCDicePool } from '@/utils/conflictDice';
import type { ActionContext } from '@/utils/actionAvailability';
import { advanceDescent } from '@/utils/descentClock';
import type { TimedAction, ConflictDefinition } from '@/types/actions';
import type { ConflictState } from '@/types/conflict';
import type { ApproachType } from '@/types/dialogue';
import type { Die } from '@/types/game';
import type { DescentThreshold } from '@/types/descent';

export function GameView() {
  const town = useTown();
  const { state, dispatch } = useGameState();
  const { character, dispatch: charDispatch } = useCharacter();
  const { clocks, currentLocation, locations, activeConflict } = state;
  const { npcs, memories: npcMemories, dispatch: npcMemoryDispatch } = useNPCMemory();
  const { state: investigationState, dispatch: investigationDispatch } = useInvestigation();
  const { dispatch: dialogueDispatch } = useDialogue();

  // Track selected NPC for relationship panel
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);

  // Character creation modal state — auto-show when no character exists
  const [showCreation, setShowCreation] = useState(!character);

  // Character sheet overlay state
  const [showSheet, setShowSheet] = useState(false);

  // Mental map overlay state
  const [showMentalMap, setShowMentalMap] = useState(false);

  // Dialogue state
  const [showDialogue, setShowDialogue] = useState(false);
  const [dialogueNpcId, setDialogueNpcId] = useState<string | null>(null);

  // Track last dialogue approach for conflict dice pool
  const [lastApproach, setLastApproach] = useState<ApproachType>('will');

  // Town arrival sequence state — deferred until character exists
  const [showArrival, setShowArrival] = useState(false);
  const [arrivalDone, setArrivalDone] = useState(!town.arrival);

  // Conflict state for ConflictView (dev mode test conflicts)
  const [conflictState, setConflictState] = useState<ConflictState | null>(null);

  // Town event overlay state
  const [pendingEvents, setPendingEvents] = useState<DescentThreshold[]>([]);

  // Track pending overflow (sin escalation deferred until event dismissed)
  const [pendingOverflow, setPendingOverflow] = useState(false);

  // Advance descent with side effects (overflow → event overlay → sin escalation on dismiss)
  const advanceDescentWithEffects = useCallback((amount: number) => {
    const result = advanceDescent(state.descentClock, amount);
    dispatch({ type: 'ADVANCE_DESCENT', amount });

    // Queue triggered threshold events (including overflow event at 8)
    if (result.triggeredThresholds.length > 0) {
      setPendingEvents(prev => [...prev, ...result.triggeredThresholds]);
      dispatch({ type: 'SET_GAME_PHASE', phase: 'TOWN_EVENT' });
    }

    // Mark overflow pending (sin escalation deferred until event is dismissed)
    if (result.overflowed) {
      setPendingOverflow(true);
    }
  }, [state.descentClock, dispatch]);

  // Dismiss current town event
  const handleDismissEvent = useCallback(() => {
    setPendingEvents(prev => {
      const remaining = prev.slice(1);
      if (remaining.length === 0) {
        // All events dismissed — apply pending overflow if any
        if (pendingOverflow) {
          investigationDispatch({ type: 'DESCENT_ESCALATE_SIN' });
          setPendingOverflow(false);
        }
        dispatch({ type: 'SET_GAME_PHASE', phase: 'EXPLORING' });
      }
      return remaining;
    });
  }, [dispatch, pendingOverflow, investigationDispatch]);

  // Initialize investigation on mount with town sin chain and clues
  useEffect(() => {
    if (investigationState.sinProgression.length === 0) {
      investigationDispatch({ type: 'START_INVESTIGATION', sinNodes: town.sinChain, clues: town.clues });
    }
  }, [investigationState.sinProgression.length, investigationDispatch, town.sinChain, town.clues]);

  // Show arrival sequence once character is created (not before)
  useEffect(() => {
    if (character && !arrivalDone && town.arrival) {
      setShowArrival(true);
    }
  }, [character, arrivalDone, town.arrival]);

  // Seed background-driven relationships when character first exists
  const [relationshipsSeeded, setRelationshipsSeeded] = useState(false);
  useEffect(() => {
    if (character && !relationshipsSeeded && npcs.length > 0) {
      const seeds = RELATIONSHIP_SEEDS[character.background];
      if (seeds && seeds.length > 0) {
        const resolvedSeeds = seeds
          .map(seed => {
            const matchedNpc = npcs.find(n => n.role === seed.targetRole);
            if (!matchedNpc) return null;
            return { npcId: matchedNpc.id, initialTrust: seed.initialTrust };
          })
          .filter((s): s is { npcId: string; initialTrust: number } => s !== null);

        if (resolvedSeeds.length > 0) {
          npcMemoryDispatch({ type: 'SEED_RELATIONSHIPS', seeds: resolvedSeeds });
        }
      }
      setRelationshipsSeeded(true);
    }
  }, [character, relationshipsSeeded, npcs, npcMemoryDispatch]);

  // Handle NPC click - open dialogue
  const handleNpcClick = useCallback((npcId: string) => {
    // Get discovered sin IDs and found clue IDs for topic generation
    const discoveredSinIds = investigationState.sinProgression
      .filter(s => s.discovered)
      .map(s => s.id);
    const foundClueIds = investigationState.clues
      .filter(c => c.found)
      .map(c => c.id);

    // Generate topics for this NPC
    const topics = resolveTopicsForNPC(npcId, town.topicRules, discoveredSinIds, currentLocation, foundClueIds);

    // Open dialogue
    setDialogueNpcId(npcId);
    setShowDialogue(true);
    dialogueDispatch({ type: 'START_CONVERSATION', npcId, topics });
  }, [investigationState, currentLocation, dialogueDispatch, town.topicRules]);

  // Handle dialogue close
  const handleDialogueClose = useCallback(() => {
    setShowDialogue(false);
    setDialogueNpcId(null);
  }, []);

  // Handle conflict start from dialogue
  const handleConflictFromDialogue = useCallback((npcId: string, stakes: string) => {
    // Close dialogue
    handleDialogueClose();

    // Build dice pools from character stats and NPC role
    const approach = lastApproach;
    const npc = town.npcs.find(n => n.id === npcId);

    let playerDice: Die[];
    if (character) {
      playerDice = buildPlayerDicePool(character, approach);
    } else {
      // Fallback if no character created: basic pool
      playerDice = [
        { id: 'player-0', type: 'd6', value: Math.floor(Math.random() * 6) + 1, assignedTo: null },
        { id: 'player-1', type: 'd6', value: Math.floor(Math.random() * 6) + 1, assignedTo: null },
        { id: 'player-2', type: 'd6', value: Math.floor(Math.random() * 6) + 1, assignedTo: null },
        { id: 'player-3', type: 'd4', value: Math.floor(Math.random() * 4) + 1, assignedTo: null },
      ];
    }

    const npcDice: Die[] = npc
      ? buildNPCDicePool(npc, approach)
      : [
          { id: 'npc-0', type: 'd6', value: Math.floor(Math.random() * 6) + 1, assignedTo: null },
          { id: 'npc-1', type: 'd6', value: Math.floor(Math.random() * 6) + 1, assignedTo: null },
          { id: 'npc-2', type: 'd4', value: Math.floor(Math.random() * 4) + 1, assignedTo: null },
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
  }, [dispatch, handleDialogueClose, lastApproach, character, town.npcs]);

  // Start a test conflict (dev mode)
  const handleStartTestConflict = useCallback(() => {
    handleConflictFromDialogue('sheriff-jacob', 'who controls the law in this town');
  }, [handleConflictFromDialogue]);

  // Listen for dialogue-conflict events (from ConflictTrigger in DialogueView)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.npcId && detail?.stakes) {
        // Capture the approach that triggered the conflict
        if (detail.approach) {
          setLastApproach(detail.approach);
        }
        setShowDialogue(false);
        setDialogueNpcId(null);
        handleConflictFromDialogue(detail.npcId, detail.stakes);
      }
    };
    window.addEventListener('dialogue-conflict', handler);
    return () => window.removeEventListener('dialogue-conflict', handler);
  }, [handleConflictFromDialogue]);

  // Handle conflict completion — process descent costs and consequences
  const handleConflictComplete = useCallback((info: ConflictOutcomeInfo) => {
    // Check if the conflict NPC is linked to a sin - if so, confront it
    if (activeConflict) {
      const linkedSin = investigationState.sinProgression.find(
        sin => sin.linkedNpcs.includes(activeConflict.npcId) && sin.discovered && !sin.resolved
      );
      if (linkedSin) {
        investigationDispatch({ type: 'CONFRONT_SIN', sinId: linkedSin.id });
      }

      // Find the conflict definition (if initiated from ActionMenu)
      const definition = activeConflict.conflictDefinitionId
        ? town.conflictDefinitions?.find(d => d.id === activeConflict.conflictDefinitionId)
        : undefined;

      if (definition) {
        // Calculate descent cost from conflict
        let descentCost = 0;
        if (info.outcome === 'PLAYER_GAVE') descentCost += definition.descentCost.onGive;
        descentCost += info.escalationsJumped * definition.descentCost.onEscalate;
        if (info.hadFallout) descentCost += definition.descentCost.onFallout;

        if (descentCost > 0) {
          advanceDescentWithEffects(descentCost);
        }

        // Apply consequences based on outcome
        const consequenceKey = info.outcome === 'PLAYER_GAVE'
          ? 'playerGives'
          : info.outcome === 'NPC_GAVE'
            ? 'npcGives'
            : 'playerWins';
        const consequences = definition.consequences[consequenceKey];

        for (const c of consequences) {
          switch (c.type) {
            case 'DISCOVER_SIN':
              // Mark the sin as discovered
              investigationDispatch({ type: 'CONFRONT_SIN', sinId: c.sinId });
              break;
            case 'RESOLVE_SIN':
              investigationDispatch({ type: 'MARK_SIN_RESOLVED', sinId: c.sinId });
              break;
            case 'ADVANCE_DESCENT':
              advanceDescentWithEffects(c.amount);
              break;
            case 'TRUST_CHANGE':
              npcMemoryDispatch({ type: 'UPDATE_RELATIONSHIP', npcId: c.npcId, delta: c.delta });
              break;
            case 'UNLOCK_CLUE':
              investigationDispatch({ type: 'FIND_CLUE', clueId: c.clueId });
              break;
            case 'NARRATIVE':
              // Narrative consequences are informational for now
              break;
          }
        }
      }
    }

    setConflictState(null);
  }, [activeConflict, investigationState.sinProgression, investigationDispatch, dispatch, town.conflictDefinitions, npcMemoryDispatch, advanceDescentWithEffects]);

  // Build action context for ActionMenu
  const actionContext: ActionContext = useMemo(() => {
    const npcTrust: Record<string, number> = {};
    for (const memory of npcMemories) {
      npcTrust[memory.npcId] = memory.relationshipLevel;
    }
    return {
      descentClock: state.descentClock,
      investigationState,
      npcTrust,
      completedActionIds: state.completedActionIds,
    };
  }, [state.descentClock, state.completedActionIds, investigationState, npcMemories]);

  // Handle timed action from ActionMenu
  const handleTimedAction = useCallback((action: TimedAction) => {
    // Apply effects
    for (const effect of action.effects) {
      switch (effect.type) {
        case 'RESTORE_CONDITION':
          dispatch({ type: 'UPDATE_CONDITION', delta: effect.amount });
          break;
        case 'DISCOVER_CLUE':
          investigationDispatch({ type: 'FIND_CLUE', clueId: effect.clueId });
          break;
        case 'TRUST_CHANGE':
          npcMemoryDispatch({ type: 'UPDATE_RELATIONSHIP', npcId: effect.npcId, delta: effect.delta });
          break;
        case 'NARRATIVE':
          // Narrative effects are purely informational for now
          break;
      }
    }

    // Advance descent clock (with overflow/threshold effects)
    advanceDescentWithEffects(action.descentCost);

    // Mark one-shot actions as complete
    if (action.oneShot) {
      dispatch({ type: 'MARK_ACTION_COMPLETE', actionId: action.id });
    }
  }, [dispatch, investigationDispatch, npcMemoryDispatch, advanceDescentWithEffects]);

  // Handle conflict from ActionMenu
  const handleConflictFromMenu = useCallback((definition: ConflictDefinition) => {
    const npc = town.npcs.find(n => n.id === definition.npcId);

    let playerDice: Die[];
    if (character) {
      playerDice = buildPlayerDicePool(character, lastApproach);
    } else {
      playerDice = [
        { id: 'player-0', type: 'd6', value: Math.floor(Math.random() * 6) + 1, assignedTo: null },
        { id: 'player-1', type: 'd6', value: Math.floor(Math.random() * 6) + 1, assignedTo: null },
        { id: 'player-2', type: 'd6', value: Math.floor(Math.random() * 6) + 1, assignedTo: null },
        { id: 'player-3', type: 'd4', value: Math.floor(Math.random() * 4) + 1, assignedTo: null },
      ];
    }

    const npcDice: Die[] = npc
      ? buildNPCDicePool(npc, lastApproach)
      : [
          { id: 'npc-0', type: 'd6', value: Math.floor(Math.random() * 6) + 1, assignedTo: null },
          { id: 'npc-1', type: 'd6', value: Math.floor(Math.random() * 6) + 1, assignedTo: null },
          { id: 'npc-2', type: 'd4', value: Math.floor(Math.random() * 4) + 1, assignedTo: null },
        ];

    const initialState = conflictReducer(initialConflictState, {
      type: 'START_CONFLICT',
      npcId: definition.npcId,
      stakes: definition.stakes,
      playerDice,
      npcDice,
      startingEscalation: definition.minEscalation,
      maxEscalation: definition.maxEscalation,
    });

    dispatch({
      type: 'START_GAME_CONFLICT',
      npcId: definition.npcId,
      stakes: definition.stakes,
      conflictDefinitionId: definition.id,
    });
    setConflictState(initialState);
  }, [dispatch, character, lastApproach, town.npcs]);

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

        {/* Narrative panel */}
        <NarrativePanel />
      </main>

      {/* Sidebar: character info, clocks, location */}
      <aside className="flex flex-col gap-4">
        <CharacterInfo
          onCreateCharacter={() => setShowCreation(true)}
          onViewSheet={() => setShowSheet(true)}
        />

        {/* Descent Clock */}
        <div className="bg-surface rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Descent
          </h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: state.descentClock.segments }).map((_, i) => (
              <div
                key={i}
                className={`h-3 flex-1 rounded-sm ${
                  i < state.descentClock.filled
                    ? 'bg-red-500'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {state.descentClock.filled}/{state.descentClock.segments}
          </p>
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
        <div className="bg-surface rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">
            {currentLocationInfo?.name ?? 'Bridal Falls'}
          </h3>
          <p className="text-sm text-gray-400">
            {currentLocationInfo?.description ?? 'A small town nestled in the mountains. Something feels wrong here.'}
          </p>
        </div>

        {/* Action Menu (visible during EXPLORING phase) */}
        {state.gamePhase === 'EXPLORING' && (
          <ActionMenu
            locationId={currentLocation}
            town={town}
            context={actionContext}
            onTimedAction={handleTimedAction}
            onConflict={handleConflictFromMenu}
          />
        )}

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
                onClick={() => investigationDispatch({ type: 'START_INVESTIGATION', sinNodes: town.sinChain })}
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

      {/* Town event overlay */}
      {state.gamePhase === 'TOWN_EVENT' && pendingEvents.length > 0 && (() => {
        const currentThreshold = pendingEvents[0];
        const eventData = town.events?.find(e => e.id === currentThreshold.eventId);
        const isOverflow = currentThreshold.eventId === 'event-descent-overflow';

        // Compute which sin will escalate (preview before dispatch)
        let escalationInfo: { name: string; fromLevel: string; toLevel: string } | null = null;
        if (isOverflow && investigationState.sinProgression.length > 0) {
          let highest: { node: typeof investigationState.sinProgression[0] } | null = null;
          for (const node of investigationState.sinProgression) {
            if (node.resolved) continue;
            const levelIdx = SIN_CHAIN_ORDER.indexOf(node.level);
            if (!highest || levelIdx > SIN_CHAIN_ORDER.indexOf(highest.node.level)) {
              highest = { node };
            }
          }
          if (highest && highest.node.level !== 'hate-and-murder') {
            const fromIdx = SIN_CHAIN_ORDER.indexOf(highest.node.level);
            const toLevel = SIN_CHAIN_ORDER[fromIdx + 1];
            escalationInfo = {
              name: highest.node.name,
              fromLevel: highest.node.level.replace(/-/g, ' '),
              toLevel: toLevel.replace(/-/g, ' '),
            };
          }
        }

        return (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
            <div className="bg-surface rounded-lg p-8 max-w-lg w-full space-y-4">
              <h2 className="text-lg font-semibold text-amber-200">
                {isOverflow ? 'The Town Descends' : 'Town Event'}
              </h2>
              <p className="text-gray-200 leading-relaxed">
                {eventData?.description ?? 'Something stirs in the town...'}
              </p>
              {escalationInfo && (
                <div className="border-t border-red-900/50 pt-3 mt-3">
                  <p className="text-red-300 text-sm font-medium">
                    Sin escalates: <span className="text-red-200">{escalationInfo.name}</span>
                  </p>
                  <p className="text-red-400/70 text-xs mt-1 capitalize">
                    {escalationInfo.fromLevel} &rarr; {escalationInfo.toLevel}
                  </p>
                </div>
              )}
              <button
                onClick={handleDismissEvent}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                data-testid="dismiss-event"
              >
                Continue
              </button>
            </div>
          </div>
        );
      })()}

      {/* Resolution summary (overlay - highest z-index) */}
      <ResolutionSummary />

      {/* Conflict view (overlay) */}
      {conflictState && conflictState.phase !== 'INACTIVE' && (() => {
        const conflictNpc = town.npcs.find(n => n.id === activeConflict?.npcId);
        // Derive aggression from average resistChance across approaches
        const thresholds = conflictNpc?.conflictThresholds ?? [];
        const avgResist = thresholds.length > 0
          ? thresholds.reduce((sum, t) => sum + t.resistChance, 0) / thresholds.length
          : 0.4;
        return (
          <ConflictView
            initialState={conflictState}
            npcName={conflictNpc?.name ?? 'Unknown'}
            npcAggression={avgResist}
            onComplete={handleConflictComplete}
          />
        );
      })()}

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

      {/* Town arrival sequence (overlay - highest z-index, blocks all interaction) */}
      {showArrival && town.arrival && (
        <TownArrival
          townName={town.name}
          arrival={town.arrival}
          greeterName={town.arrival.greeterNpcId
            ? npcs.find(n => n.id === town.arrival!.greeterNpcId)?.name
            : undefined
          }
          onComplete={() => { setShowArrival(false); setArrivalDone(true); }}
          onGreet={(npcId) => {
            setShowArrival(false);
            setArrivalDone(true);
            handleNpcClick(npcId);
          }}
        />
      )}
    </div>
  );
}
