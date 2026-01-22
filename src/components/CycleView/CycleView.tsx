import { useMemo, useCallback } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { useCharacter } from '@/hooks/useCharacter';
import { generateDicePool } from '@/utils/dice';
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
  const {
    cyclePhase,
    cycleNumber,
    dicePool,
    selectedDieId,
    currentLocation,
    availableActions,
    clocks,
  } = state;

  // Compute actions completed for summary
  const actionsCompleted = useMemo(() => {
    const result: { action: AvailableAction; diceUsed: Die[]; result: string }[] = [];
    const actionMap = new Map(availableActions.map((a) => [a.id, a]));

    // Group dice by assigned action
    const diceByAction = new Map<string, Die[]>();
    for (const die of dicePool) {
      if (die.assignedTo) {
        const existing = diceByAction.get(die.assignedTo) || [];
        existing.push(die);
        diceByAction.set(die.assignedTo, existing);
      }
    }

    // Create action results
    for (const [actionId, dice] of diceByAction) {
      const action = actionMap.get(actionId);
      if (action) {
        result.push({
          action,
          diceUsed: dice,
          result: `You ${action.name.toLowerCase()}...`, // Placeholder result
        });
      }
    }

    return result;
  }, [dicePool, availableActions]);

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

    case 'RESOLVE':
      // Auto-transition to SUMMARY for now (actual resolution in Phase 3)
      // Use setTimeout to avoid dispatch during render
      setTimeout(() => dispatch({ type: 'VIEW_SUMMARY' }), 0);
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="text-gray-400">Resolving actions...</div>
        </div>
      );

    case 'SUMMARY':
      return (
        <CycleSummary
          cycleNumber={cycleNumber}
          actionsCompleted={actionsCompleted}
          clockChanges={clockChanges}
          onContinue={() => dispatch({ type: 'END_CYCLE' })}
        />
      );

    case 'REST':
      return (
        <div
          data-testid="cycle-rest-overlay"
          className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface rounded-lg p-8 text-center shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Night Falls</h2>
            <p className="text-gray-400 mb-6">You rest and prepare for tomorrow.</p>
            <button
              data-testid="next-day-button"
              onClick={startCycle}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Next Day
            </button>
          </motion.div>
        </div>
      );

    default:
      return null;
  }
}
