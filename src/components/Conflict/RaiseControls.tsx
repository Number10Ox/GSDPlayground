import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Die } from '@/types/game';
import { DieIcon } from '@/components/DicePool/DieIcon';

interface RaiseControlsProps {
  dice: Die[];
  mode: 'RAISE' | 'SEE';
  raiseTotal?: number;
  onSubmit: (dice: Die[]) => void;
  onGive: () => void;
}

/**
 * RaiseControls - Dice selection component for raise/see actions.
 *
 * RAISE mode: Player must select exactly 2 dice
 * SEE mode: Player must select dice totaling >= raise amount
 *
 * Uses multi-select with toggle behavior on click.
 */
export function RaiseControls({
  dice,
  mode,
  raiseTotal = 0,
  onSubmit,
  onGive,
}: RaiseControlsProps) {
  const [selectedDiceIds, setSelectedDiceIds] = useState<string[]>([]);
  const [showGiveConfirm, setShowGiveConfirm] = useState(false);

  // Toggle die selection
  const handleDieClick = useCallback((dieId: string) => {
    setSelectedDiceIds((prev) => {
      if (prev.includes(dieId)) {
        return prev.filter((id) => id !== dieId);
      }
      return [...prev, dieId];
    });
  }, []);

  // Get selected dice objects
  const selectedDice = useMemo(() => {
    return dice.filter((d) => selectedDiceIds.includes(d.id));
  }, [dice, selectedDiceIds]);

  // Calculate total of selected dice
  const selectedTotal = useMemo(() => {
    return selectedDice.reduce((sum, d) => sum + d.value, 0);
  }, [selectedDice]);

  // Validation based on mode
  const isValid = useMemo(() => {
    if (mode === 'RAISE') {
      return selectedDice.length === 2;
    }
    // SEE mode: must meet or exceed raise total
    return selectedTotal >= raiseTotal;
  }, [mode, selectedDice.length, selectedTotal, raiseTotal]);

  // Button text based on mode and state
  const buttonText = useMemo(() => {
    if (mode === 'RAISE') {
      if (selectedDice.length !== 2) {
        return `Select 2 dice (${selectedDice.length}/2)`;
      }
      return `Raise ${selectedTotal}`;
    }
    // SEE mode
    const deficit = raiseTotal - selectedTotal;
    if (deficit > 0) {
      return `Not enough (need ${deficit} more)`;
    }
    return `See (${selectedTotal})`;
  }, [mode, selectedDice.length, selectedTotal, raiseTotal]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (isValid) {
      onSubmit(selectedDice);
      setSelectedDiceIds([]);
    }
  }, [isValid, selectedDice, onSubmit]);

  // Handle give confirmation
  const handleGiveClick = useCallback(() => {
    setShowGiveConfirm(true);
  }, []);

  const handleGiveConfirm = useCallback(() => {
    onGive();
    setShowGiveConfirm(false);
  }, [onGive]);

  const handleGiveCancel = useCallback(() => {
    setShowGiveConfirm(false);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Dice grid */}
      <div className="flex flex-wrap gap-2 p-4 bg-surface rounded-lg min-h-[80px]">
        {dice.length === 0 ? (
          <div className="text-gray-500 text-sm">No dice available</div>
        ) : (
          dice.map((die) => {
            const isSelected = selectedDiceIds.includes(die.id);
            return (
              <motion.button
                key={die.id}
                onClick={() => handleDieClick(die.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  scale: isSelected ? 1.1 : 1,
                  boxShadow: isSelected
                    ? '0 0 12px rgba(251, 191, 36, 0.6)'
                    : '0 0 0px transparent',
                }}
                data-testid={`raise-die-${die.id}`}
                data-die-id={die.id}
                data-die-type={die.type}
                data-die-value={die.value}
                data-selected={isSelected}
                className={`
                  relative p-1 rounded-lg transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
                  ${isSelected ? 'ring-2 ring-amber-400 bg-amber-400/20' : 'hover:bg-white/10'}
                `}
              >
                <DieIcon type={die.type} value={die.value} size="md" />
              </motion.button>
            );
          })
        )}
      </div>

      {/* Selected total display */}
      {selectedDice.length > 0 && (
        <div className="text-center text-gray-300">
          Selected: {selectedDice.length} dice = {selectedTotal}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          data-testid={mode === 'RAISE' ? 'raise-submit-button' : 'see-submit-button'}
          className={`
            flex-1 py-3 rounded-lg font-semibold transition-colors
            ${isValid
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {buttonText}
        </button>

        <button
          onClick={handleGiveClick}
          data-testid="give-button"
          className="px-6 py-3 bg-gray-700 hover:bg-red-900/50 text-gray-300 hover:text-red-200 rounded-lg font-semibold transition-colors"
        >
          Give
        </button>
      </div>

      {/* Give confirmation dialog */}
      <AnimatePresence>
        {showGiveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={handleGiveCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-lg p-6 max-w-sm text-center shadow-xl"
            >
              <h3 className="text-xl font-bold text-red-400 mb-2">Give Up?</h3>
              <p className="text-gray-300 mb-4">
                If you give, you lose the stakes. The opponent wins this conflict.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleGiveCancel}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGiveConfirm}
                  data-testid="give-confirm-button"
                  className="flex-1 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Give Up
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
