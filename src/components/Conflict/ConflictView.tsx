import { useState, useReducer, useCallback, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import type { EscalationLevel, FalloutSeverity, ConflictOutcome } from '@/types/conflict';
import type { Die } from '@/types/game';
import { ESCALATION_ORDER } from '@/types/conflict';
import { conflictReducer, initialConflictState } from '@/reducers/conflictReducer';
import { useConflictAtmosphere } from '@/hooks/useConflictAtmosphere';
import { useGameState } from '@/hooks/useGameState';
import { useNPCMemory } from '@/hooks/useNPCMemory';
import { RaiseControls } from './RaiseControls';
import { EscalationConfirm } from './EscalationConfirm';
import { EscalationIndicator } from './EscalationIndicator';
import { BiddingHistory } from './BiddingHistory';
import { ConflictResolution } from './ConflictResolution';
import { DieIcon } from '@/components/DicePool/DieIcon';
import { TraitAndItemInvocation } from '@/components/Character/TraitAndItemInvocation';
import { RelationshipDice } from '@/components/Character/RelationshipDice';
import { useCharacter } from '@/hooks/useCharacter';

/**
 * NPC response descriptions for variety
 */
const NPC_RAISE_DESCRIPTIONS = [
  'presses the argument further',
  'pushes back with conviction',
  'doubles down on their stance',
  'refuses to back down',
  'meets your challenge head-on',
];

const NPC_SEE_DESCRIPTIONS = [
  'deflects your point',
  'counters your argument',
  'stands firm',
  'absorbs the blow',
  'rolls with it',
];

/**
 * Simple greedy algorithm to find dice that meet a target total
 */
function findDiceToMeetTotal(pool: Die[], target: number): Die[] | null {
  // Sort by value descending to use fewer dice
  const sorted = [...pool].sort((a, b) => b.value - a.value);

  let total = 0;
  const selected: Die[] = [];

  for (const die of sorted) {
    selected.push(die);
    total += die.value;
    if (total >= target) {
      return selected;
    }
  }

  // Can't meet the target
  return null;
}

/**
 * Select 2 random dice for NPC raise
 */
function selectRaiseDice(pool: Die[]): [Die, Die] | null {
  if (pool.length < 2) return null;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

interface ConflictViewProps {
  // Optional initial state for testing
  initialState?: ReturnType<typeof conflictReducer>;
  // NPC display name
  npcName?: string;
  // Witnesses to violence
  witnesses?: string[];
  // Callback when conflict completes
  onComplete?: () => void;
}

/**
 * ConflictView - Main orchestrator for the DitV conflict system.
 *
 * Manages the raise/see bidding loop, escalation, and resolution.
 * NPC AI makes simple decisions (raise with 2 random dice, see with minimum).
 */
export function ConflictView({
  initialState,
  npcName: npcNameProp,
  witnesses: witnessesProp = [],
  onComplete,
}: ConflictViewProps) {
  const { state: gameState, dispatch: gameDispatch } = useGameState();
  const { character } = useCharacter();
  const { dispatch: npcDispatch, getWitnessesAtLocation } = useNPCMemory();
  const [state, dispatch] = useReducer(
    conflictReducer,
    initialState ?? initialConflictState
  );

  // Track whether we've recorded this conflict's outcome
  const hasRecordedConflict = useRef(false);

  // Get witnesses at current location (including the conflict opponent)
  const witnesses = useMemo(() => {
    if (witnessesProp.length > 0) return witnessesProp;

    const locationWitnesses = getWitnessesAtLocation(gameState.currentLocation);
    // Include the NPC opponent if they're not already in the witness list
    const opponentId = state.phase === 'ACTIVE' ? state.npcId : null;
    if (opponentId && !locationWitnesses.includes(opponentId)) {
      return [...locationWitnesses, opponentId];
    }
    return locationWitnesses;
  }, [witnessesProp, getWitnessesAtLocation, gameState.currentLocation, state]);

  // Get NPC name from state or prop
  const npcName = useMemo(() => {
    if (npcNameProp) return npcNameProp;
    if (state.phase === 'ACTIVE') return state.npcId;
    return 'Opponent';
  }, [state, npcNameProp]);

  // Handle resolution dismiss - apply fallout and cleanup
  const handleResolutionDismiss = useCallback(
    (severity: FalloutSeverity) => {
      // Apply fallout to character condition
      gameDispatch({ type: 'APPLY_FALLOUT', severity });
      // Clear active conflict in game state
      gameDispatch({ type: 'END_GAME_CONFLICT' });
      // Notify parent
      onComplete?.();
    },
    [gameDispatch, onComplete]
  );

  // Escalation modal state
  const [showEscalation, setShowEscalation] = useState<{
    targetLevel: EscalationLevel;
  } | null>(null);

  // Determine highest escalation level for atmosphere
  const highestEscalation: EscalationLevel | null = useMemo(() => {
    if (state.phase !== 'ACTIVE') return null;
    const playerOrder = ESCALATION_ORDER[state.playerEscalation];
    const npcOrder = ESCALATION_ORDER[state.npcEscalation];
    return playerOrder >= npcOrder ? state.playerEscalation : state.npcEscalation;
  }, [state]);

  // Apply atmosphere theming
  useConflictAtmosphere(highestEscalation);

  // Record conflict to NPC memory when resolved
  useEffect(() => {
    if (state.phase !== 'RESOLVED') return;
    if (hasRecordedConflict.current) return;

    // Mark as recorded to prevent duplicate dispatches
    hasRecordedConflict.current = true;

    // Generate description from outcome
    const outcomeDescriptions: Record<ConflictOutcome, string> = {
      PLAYER_WON: 'The Dog prevailed in the conflict',
      PLAYER_GAVE: 'The Dog backed down from the confrontation',
      NPC_GAVE: 'They yielded to the Dog\'s pressure',
    };

    // Determine the target NPC if the opponent was directly involved
    const targetNpcId = gameState.activeConflict?.npcId;

    // Record to NPC memory
    npcDispatch({
      type: 'RECORD_CONFLICT',
      conflictData: {
        escalationLevel: state.fallout.falloutType === 'LETHAL'
          ? 'GUNPLAY'
          : state.fallout.falloutType === 'VIOLENT'
            ? 'FIGHTING'
            : state.fallout.falloutType === 'PHYSICAL'
              ? 'PHYSICAL'
              : 'JUST_TALKING',
        outcome: state.outcome,
        location: gameState.currentLocation,
        description: outcomeDescriptions[state.outcome],
        targetNpcId,
      },
      witnesses: state.witnesses.length > 0 ? state.witnesses : witnesses,
    });
  }, [state, gameState.activeConflict, gameState.currentLocation, npcDispatch, witnesses]);

  // NPC AI turn handling
  useEffect(() => {
    if (state.phase !== 'ACTIVE') return;

    // Only act on NPC turns
    if (state.currentTurn === 'NPC_RAISE') {
      const timer = setTimeout(() => {
        const raiseDice = selectRaiseDice(state.npcPool);
        if (raiseDice) {
          const description = NPC_RAISE_DESCRIPTIONS[
            Math.floor(Math.random() * NPC_RAISE_DESCRIPTIONS.length)
          ];
          dispatch({
            type: 'NPC_RAISE',
            diceIds: [raiseDice[0].id, raiseDice[1].id] as [string, string],
            description,
          });
        } else {
          // Can't raise, NPC gives
          dispatch({ type: 'NPC_GIVE' });
        }
      }, 1000 + Math.random() * 1000); // 1-2 second "thinking" time
      return () => clearTimeout(timer);
    }

    if (state.currentTurn === 'NPC_SEE' && state.currentRaise) {
      const timer = setTimeout(() => {
        const seeDice = findDiceToMeetTotal(state.npcPool, state.currentRaise!.total);
        if (seeDice) {
          const description = NPC_SEE_DESCRIPTIONS[
            Math.floor(Math.random() * NPC_SEE_DESCRIPTIONS.length)
          ];
          dispatch({
            type: 'NPC_SEE',
            diceIds: seeDice.map((d) => d.id),
            description,
          });
        } else {
          // Can't see - consider escalating or give
          // Simple AI: escalate if possible and above 50% chance
          const nextLevel = getNextEscalationLevel(state.npcEscalation);
          if (nextLevel && Math.random() > 0.5) {
            dispatch({
              type: 'NPC_ESCALATE',
              newLevel: nextLevel,
              monologue: 'raises the stakes',
            });
          } else {
            dispatch({ type: 'NPC_GIVE' });
          }
        }
      }, 1000 + Math.random() * 1000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Get next escalation level
  function getNextEscalationLevel(current: EscalationLevel): EscalationLevel | null {
    const levels: EscalationLevel[] = ['JUST_TALKING', 'PHYSICAL', 'FIGHTING', 'GUNPLAY'];
    const currentIndex = levels.indexOf(current);
    if (currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }
    return null;
  }

  // Get available escalation levels (above current)
  const availableEscalations = useMemo(() => {
    if (state.phase !== 'ACTIVE') return [];
    const levels: EscalationLevel[] = ['PHYSICAL', 'FIGHTING', 'GUNPLAY'];
    const currentOrder = ESCALATION_ORDER[state.playerEscalation];
    return levels.filter((l) => ESCALATION_ORDER[l] > currentOrder);
  }, [state]);

  // Handle player raise
  const handleRaise = useCallback((dice: Die[]) => {
    if (dice.length !== 2) return;
    dispatch({
      type: 'PLAYER_RAISE',
      diceIds: [dice[0].id, dice[1].id] as [string, string],
      description: 'makes their point',
    });
  }, []);

  // Handle player see
  const handleSee = useCallback((dice: Die[]) => {
    dispatch({
      type: 'PLAYER_SEE',
      diceIds: dice.map((d) => d.id),
      description: 'responds to the challenge',
    });
  }, []);

  // Handle player give
  const handleGive = useCallback(() => {
    dispatch({ type: 'PLAYER_GIVE' });
  }, []);

  // Handle escalation request
  const handleEscalateClick = useCallback((level: EscalationLevel) => {
    setShowEscalation({ targetLevel: level });
  }, []);

  // Handle escalation confirm
  const handleEscalateConfirm = useCallback(() => {
    if (!showEscalation || state.phase !== 'ACTIVE') return;
    dispatch({
      type: 'PLAYER_ESCALATE',
      newLevel: showEscalation.targetLevel,
      monologue: 'escalates the conflict',
    });
    setShowEscalation(null);
  }, [showEscalation, state.phase]);

  // Handle escalation cancel
  const handleEscalateCancel = useCallback(() => {
    setShowEscalation(null);
  }, []);

  // Render based on conflict phase
  if (state.phase === 'INACTIVE') {
    return null;
  }

  if (state.phase === 'RESOLVED') {
    // Determine stakes text from active conflict if available (from initialState)
    const stakesText = initialState && initialState.phase === 'ACTIVE'
      ? initialState.stakes
      : 'the conflict';

    // Build fallout dice for the resolution reveal
    // Use the dice that were rolled during fallout calculation
    const falloutDiceForReveal = state.fallout.diceRolled.length > 0
      ? [{ dice: state.fallout.diceRolled, escalationLevel: state.fallout.falloutType === 'LETHAL' ? 'GUNPLAY' : state.fallout.falloutType === 'VIOLENT' ? 'FIGHTING' : state.fallout.falloutType === 'PHYSICAL' ? 'PHYSICAL' : 'JUST_TALKING' as EscalationLevel }]
      : [];

    return (
      <ConflictResolution
        outcome={state.outcome}
        stakes={stakesText}
        npcName={npcName}
        falloutDice={falloutDiceForReveal}
        witnesses={state.witnesses.length > 0 ? state.witnesses : witnesses}
        onDismiss={handleResolutionDismiss}
      />
    );
  }

  // ACTIVE phase - main conflict UI
  const isPlayerTurn =
    state.currentTurn === 'PLAYER_RAISE' || state.currentTurn === 'PLAYER_SEE';
  const mode = state.currentTurn === 'PLAYER_SEE' ? 'SEE' : 'RAISE';

  return (
    <LayoutGroup>
      <div
        data-testid="conflict-view"
        className="fixed inset-0 flex flex-col z-40 bg-gray-950"
      >
        {/* Atmosphere overlay - tints based on escalation level */}
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-500"
          style={{
            backgroundColor: 'var(--conflict-bg, transparent)',
          }}
        />
        {/* Header: Stakes */}
        <div className="p-4 bg-black/50">
          <h2
            data-testid="conflict-stakes"
            className="text-xl font-bold text-center text-gray-100"
          >
            Stakes: {state.stakes}
          </h2>
        </div>

        {/* Escalation indicator */}
        <div className="p-4">
          <EscalationIndicator
            playerLevel={state.playerEscalation}
            npcLevel={state.npcEscalation}
            npcName={npcName}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Bidding history */}
          <div className="w-80 p-4 border-r border-gray-700 overflow-hidden">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2">
              History
            </h3>
            <BiddingHistory
              turns={state.turnHistory}
              currentRaise={state.currentRaise}
              npcName={npcName}
            />
          </div>

          {/* Center: Controls and pool */}
          <div className="flex-1 flex flex-col p-4">
            {/* Turn indicator */}
            <div className="text-center mb-4">
              {isPlayerTurn ? (
                <span className="text-amber-400 font-semibold">
                  Your turn to {mode === 'RAISE' ? 'Raise' : 'See'}
                </span>
              ) : (
                <span className="text-gray-400">Opponent is thinking...</span>
              )}
            </div>

            {/* Player dice pool display */}
            <div className="mb-4">
              <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                Your Dice ({state.playerPool.length})
              </h3>
              {isPlayerTurn ? (
                <RaiseControls
                  dice={state.playerPool}
                  mode={mode}
                  raiseTotal={state.currentRaise?.total ?? 0}
                  onSubmit={mode === 'RAISE' ? handleRaise : handleSee}
                  onGive={handleGive}
                />
              ) : (
                <div className="flex flex-wrap gap-2 p-4 bg-surface rounded-lg opacity-50">
                  {state.playerPool.map((die) => (
                    <div key={die.id}>
                      <DieIcon type={die.type} value={die.value} size="md" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Escalation buttons */}
            {isPlayerTurn && availableEscalations.length > 0 && (
              <div className="mt-auto">
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                  Escalate
                </h3>
                <div className="flex gap-2">
                  {availableEscalations.map((level) => (
                    <button
                      key={level}
                      onClick={() => handleEscalateClick(level)}
                      data-testid={`escalate-${level.toLowerCase()}-button`}
                      className={`
                        px-4 py-2 rounded-lg font-semibold transition-colors
                        ${level === 'GUNPLAY'
                          ? 'bg-red-900 hover:bg-red-800 text-red-100'
                          : level === 'FIGHTING'
                            ? 'bg-red-800 hover:bg-red-700 text-red-100'
                            : 'bg-amber-800 hover:bg-amber-700 text-amber-100'
                        }
                      `}
                    >
                      {level === 'PHYSICAL' && 'Get Physical'}
                      {level === 'FIGHTING' && 'Start Fighting'}
                      {level === 'GUNPLAY' && 'Draw Your Gun'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trait & Item Invocation - available during player's raise/see turns */}
            {isPlayerTurn && character && (character.traits.length > 0 || character.inventory.length > 0) && state.phase === 'ACTIVE' && (
              <TraitAndItemInvocation
                traits={character.traits}
                items={character.inventory}
                usedTraitIds={state.usedTraits}
                usedItemIds={state.usedItems}
                dispatch={dispatch}
              />
            )}

            {/* Relationship Dice - available during player's raise/see turns */}
            {isPlayerTurn && character && character.relationships.length > 0 && state.phase === 'ACTIVE' && (
              <RelationshipDice
                relationships={character.relationships}
                conflictNpcId={gameState.activeConflict?.npcId ?? state.npcId}
                usedRelationships={state.usedRelationships}
                dispatch={dispatch}
              />
            )}
          </div>

          {/* Right: NPC pool (smaller, just for info) */}
          <div className="w-48 p-4 border-l border-gray-700">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2">
              Opponent ({state.npcPool.length})
            </h3>
            <div className="flex flex-wrap gap-1">
              {state.npcPool.map((die) => (
                <div key={die.id} className="opacity-60">
                  <DieIcon type={die.type} value={die.value} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Escalation confirmation modal */}
      <AnimatePresence>
        {showEscalation && state.phase === 'ACTIVE' && (
          <EscalationConfirm
            currentLevel={state.playerEscalation}
            targetLevel={showEscalation.targetLevel}
            onConfirm={handleEscalateConfirm}
            onCancel={handleEscalateCancel}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
