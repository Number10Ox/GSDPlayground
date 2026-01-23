import { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useCharacter } from '@/hooks/useCharacter';
import { useInvestigation } from '@/hooks/useInvestigation';
import { useNPCMemory } from '@/hooks/useNPCMemory';
import { useTown } from '@/hooks/useTown';
import { generateDicePool } from '@/utils/dice';
import { generateAllActions, parseActionType } from '@/utils/actionGenerator';
import { resolveAction, type ActionResult } from '@/utils/actionResolver';
import { DicePool } from '@/components/DicePool/DicePool';
import { ActionList } from '@/components/Actions/ActionList';
import { CycleSummary } from '@/components/CycleSummary/CycleSummary';
import type { AvailableAction, Die } from '@/types/game';

/**
 * CycleView - Orchestrates the daily cycle UI based on phase.
 *
 * Phases:
 * - WAKE: "Day X begins" with Start Day button
 * - ALLOCATE: DicePool at bottom, ActionList panel, Confirm/Rest buttons
 * - RESOLVE: Auto-transition to SUMMARY (actual resolution in Phase 3)
 * - SUMMARY: CycleSummary overlay
 * - REST: Brief message, Next Day button
 */
export function CycleView() {
  const { state, dispatch } = useGameState();
  const { character } = useCharacter();
  const { state: investigationState, dispatch: investigationDispatch } = useInvestigation();
  const { npcs, dispatch: npcDispatch } = useNPCMemory();
  const town = useTown();
  const {
    cyclePhase,
    cycleNumber,
    dicePool,
    selectedDieId,
    currentLocation,
    availableActions,
    clocks,
  } = state;

  // Track resolved action results for the summary
  const [resolvedResults, setResolvedResults] = useState<ActionResult[]>([]);
  // Ref guard: synchronously prevents re-entry when effect dispatches cause re-renders
  const resolveGuardRef = useRef(false);

  // Resolve actions when entering RESOLVE phase
  useEffect(() => {
    if (cyclePhase !== 'RESOLVE') {
      // Reset guard and results when leaving RESOLVE phase
      resolveGuardRef.current = false;
      setResolvedResults([]);
      return;
    }
    if (resolveGuardRef.current) return;
    resolveGuardRef.current = true;

    const assignedDice = dicePool.filter(d => d.assignedTo !== null);
    if (assignedDice.length === 0) {
      dispatch({ type: 'VIEW_SUMMARY' });
      return;
    }

    const results: ActionResult[] = [];
    const actionMap = new Map(availableActions.map(a => [a.id, a]));

    for (const die of assignedDice) {
      const actionId = die.assignedTo!;
      const action = actionMap.get(actionId);
      if (!action) continue;

      const actionType = parseActionType(actionId);
      const locationClues = investigationState.clues.filter(
        c => c.locationId === currentLocation && !c.found
      );
      const npcsHere = npcs.filter(n => n.locationId === currentLocation);

      const result = resolveAction(die, actionId, action.name, actionType, {
        availableClues: locationClues,
        npcIds: npcsHere.map(n => n.id),
      });
      results.push(result);

      // Apply effects
      for (const effect of result.effects) {
        switch (effect.type) {
          case 'DISCOVER_CLUE':
            investigationDispatch({ type: 'FIND_CLUE', clueId: effect.clueId });
            break;
          case 'TRUST_CHANGE':
            npcDispatch({ type: 'UPDATE_RELATIONSHIP', npcId: effect.npcId, delta: effect.delta });
            dispatch({ type: 'ADVANCE_CLOCK', clockId: 'trust-earned', amount: 1 });
            break;
          case 'RESTORE_CONDITION':
            dispatch({ type: 'UPDATE_CONDITION', delta: effect.amount });
            break;
          case 'ADVANCE_CLOCK':
            dispatch({ type: 'ADVANCE_CLOCK', clockId: effect.clockId, amount: effect.amount });
            break;
        }
      }
    }

    setResolvedResults(results);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cyclePhase]);

  // Regenerate actions when location or game state changes
  useEffect(() => {
    if (cyclePhase === 'ALLOCATE' || cyclePhase === 'WAKE') {
      const discoveredSinIds = investigationState.sinProgression
        .filter(s => s.discovered)
        .map(s => s.id);
      const actions = generateAllActions(
        town.locations,
        investigationState.clues,
        npcs,
        discoveredSinIds,
        currentLocation,
        !!character
      );
      dispatch({ type: 'UPDATE_ACTIONS', actions });
    }
  }, [cyclePhase, currentLocation, investigationState.clues, investigationState.sinProgression, npcs, character, town.locations, dispatch]);

  // Compute actions completed for summary
  const actionsCompleted = useMemo(() => {
    // Use resolved results if available (from RESOLVE phase)
    if (resolvedResults.length > 0) {
      const actionMap = new Map(availableActions.map((a) => [a.id, a]));
      return resolvedResults.map(r => ({
        action: actionMap.get(r.actionId) ?? { id: r.actionId, name: r.actionName, description: '', locationId: null, diceCost: 1, available: true },
        diceUsed: [r.die],
        result: r.narrativeText,
      }));
    }

    // Fallback: placeholder
    const result: { action: AvailableAction; diceUsed: Die[]; result: string }[] = [];
    const actionMap = new Map(availableActions.map((a) => [a.id, a]));
    const diceByAction = new Map<string, Die[]>();
    for (const die of dicePool) {
      if (die.assignedTo) {
        const existing = diceByAction.get(die.assignedTo) || [];
        existing.push(die);
        diceByAction.set(die.assignedTo, existing);
      }
    }
    for (const [actionId, dice] of diceByAction) {
      const action = actionMap.get(actionId);
      if (action) {
        result.push({ action, diceUsed: dice, result: `You ${action.name.toLowerCase()}...` });
      }
    }
    return result;
  }, [dicePool, availableActions, resolvedResults]);

  // Compute clock changes (autoAdvance clocks)
  const clockChanges = useMemo(() => {
    return clocks
      .filter((c) => c.autoAdvance)
      .map((clock) => ({ clock, advanced: 1 }));
  }, [clocks]);

  // Filter dice to show only unassigned in pool
  const unassignedDice = useMemo(() => {
    return dicePool.filter((die) => die.assignedTo === null);
  }, [dicePool]);

  // Check if any dice are assigned (for Confirm button)
  const hasAssignedDice = dicePool.some((die) => die.assignedTo !== null);

  // Start cycle with character-based dice pool
  const startCycle = useCallback(() => {
    setResolvedResults([]);
    resolveGuardRef.current = false;
    const pool = generateDicePool(state.characterCondition, character);
    dispatch({ type: 'START_CYCLE', dicePool: pool });
  }, [state.characterCondition, character, dispatch]);

  // Handle dice selection
  const handleSelectDie = (dieId: string) => {
    dispatch({ type: 'SELECT_DIE', dieId });
  };

  // Handle assigning die to action
  const handleAssignDie = (actionId: string) => {
    dispatch({ type: 'ASSIGN_DIE', actionId });
  };

  // Handle unassigning die from action
  const handleUnassignDie = (dieId: string) => {
    dispatch({ type: 'UNASSIGN_DIE', dieId });
  };

  // Render based on phase
  switch (cyclePhase) {
    case 'WAKE':
      return (
        <div
          data-testid="cycle-wake-overlay"
          className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-lg p-8 text-center shadow-xl"
          >
            <h2
              data-testid="day-number"
              data-day={cycleNumber}
              className="text-3xl font-bold text-gray-100 mb-2"
            >
              Day {cycleNumber} Begins
            </h2>
            <p className="text-gray-400 mb-6">The sun rises over Bridal Falls.</p>
            <button
              data-testid="start-day-button"
              onClick={startCycle}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Start Day
            </button>
          </motion.div>
        </div>
      );

    case 'ALLOCATE':
      return (
        <LayoutGroup>
          {/* Action panel on the right side */}
          <motion.div
            data-testid="action-panel"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute top-4 right-4 bottom-24 w-80 bg-surface/95 rounded-lg p-4 overflow-y-auto z-20 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">
              Available Actions
            </h3>
            <ActionList
              actions={availableActions}
              dicePool={dicePool}
              currentLocation={currentLocation}
              selectedDieId={selectedDieId}
              onAssign={handleAssignDie}
              onUnassign={handleUnassignDie}
            />

            {/* Action buttons */}
            <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
              <button
                data-testid="confirm-allocations-button"
                onClick={() => dispatch({ type: 'CONFIRM_ALLOCATIONS' })}
                disabled={!hasAssignedDice}
                className={`
                  w-full py-2 rounded-lg font-semibold transition-colors
                  ${hasAssignedDice
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Confirm Allocations
              </button>
              <button
                data-testid="rest-early-button"
                onClick={() => dispatch({ type: 'REST_EARLY' })}
                className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-semibold transition-colors"
              >
                Rest Early
              </button>
            </div>
          </motion.div>

          {/* Dice pool at bottom */}
          <motion.div
            data-testid="dice-pool"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-4 left-4 right-[340px] z-20"
          >
            <div className="bg-surface/95 rounded-lg p-2 shadow-xl">
              <div className="text-xs text-gray-500 px-2 mb-1">
                {selectedDieId ? 'Click an action to assign die' : 'Select a die to assign'}
              </div>
              <DicePool
                dice={unassignedDice}
                selectedDieId={selectedDieId}
                onSelect={handleSelectDie}
              />
            </div>
          </motion.div>
        </LayoutGroup>
      );

    case 'RESOLVE': {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface rounded-lg p-6 max-w-md w-full shadow-xl"
          >
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Actions Resolved</h2>
            <div className="space-y-2">
              {resolvedResults.map((r, i) => (
                <div key={i} className={`text-sm p-2 rounded ${r.success ? 'bg-green-900/30 text-green-200' : 'bg-red-900/30 text-red-300'}`}>
                  <span className="font-medium">{r.actionName}:</span> {r.narrativeText}
                </div>
              ))}
            </div>
            <button
              data-testid="resolve-continue-button"
              onClick={() => dispatch({ type: 'CONTINUE_FROM_RESOLVE' })}
              className="mt-4 w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-colors cursor-pointer"
            >
              {unassignedDice.length > 0 ? 'Continue (dice remaining)' : 'End Day'}
            </button>
          </motion.div>
        </div>
      );
    }

    case 'SUMMARY':
      return (
        <CycleSummary
          cycleNumber={cycleNumber}
          actionsCompleted={actionsCompleted}
          clockChanges={clockChanges}
          onContinue={() => dispatch({ type: 'END_CYCLE' })}
        />
      );

    case 'REST': {
      // Check for town events that should fire this cycle
      const firedEvents = (town.events ?? []).filter(evt => {
        if (evt.fired) return false;
        switch (evt.trigger.type) {
          case 'CYCLE_COUNT':
            return cycleNumber >= evt.trigger.min;
          case 'CLUE_FOUND':
            return investigationState.clues.some(c => c.id === evt.trigger.clueId && c.found);
          default:
            return false;
        }
      });

      // Generate inner monologue based on discoveries
      const discoveryCount = investigationState.discoveries.length;
      const unresolvedSins = investigationState.sinProgression.filter(s => s.discovered && !s.resolved);
      let innerMonologue = 'The night is quiet. You review what you\'ve learned.';
      if (unresolvedSins.length > 0) {
        innerMonologue = `You lie awake thinking about what you've uncovered. ${unresolvedSins.length} sin${unresolvedSins.length > 1 ? 's' : ''} discovered, festering in this town. The King of Life demands action.`;
      } else if (discoveryCount === 0) {
        innerMonologue = 'You\'ve learned little today. Tomorrow you must dig deeper — the town\'s secrets won\'t reveal themselves.';
      }

      return (
        <div
          data-testid="cycle-rest-overlay"
          className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface rounded-lg p-8 max-w-lg w-full shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-100 mb-4">Night Falls</h2>

            {/* Inner monologue */}
            <p className="text-gray-400 italic text-sm mb-4">{innerMonologue}</p>

            {/* Town events */}
            {firedEvents.length > 0 && (
              <div className="mb-4 space-y-3">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">While You Rest...</h3>
                {firedEvents.map(evt => (
                  <div key={evt.id} className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-3">
                    <p className="text-sm text-gray-300">{evt.description}</p>
                    {evt.effects
                      .filter((e): e is { type: 'NARRATIVE'; text: string } => e.type === 'NARRATIVE')
                      .map((e, i) => (
                        <p key={i} className="text-xs text-amber-300/70 mt-1 italic">{e.text}</p>
                      ))
                    }
                  </div>
                ))}
              </div>
            )}

            <button
              data-testid="next-day-button"
              onClick={startCycle}
              className="w-full px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Next Day
            </button>
          </motion.div>
        </div>
      );
    }

    default:
      return null;
  }
}
