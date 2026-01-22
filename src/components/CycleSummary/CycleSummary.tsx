import { motion, AnimatePresence } from 'framer-motion';
import type { AvailableAction, Die, Clock } from '@/types/game';
import { DieIcon } from '@/components/DicePool/DieIcon';

interface ActionResult {
  action: AvailableAction;
  diceUsed: Die[];
  result: string;
}

interface ClockChange {
  clock: Clock;
  advanced: number;
}

interface CycleSummaryProps {
  cycleNumber: number;
  actionsCompleted: ActionResult[];
  clockChanges: ClockChange[];
  onContinue: () => void;
}

/**
 * CycleSummary - Modal overlay showing end-of-cycle results.
 *
 * Displays:
 * - Actions taken with dice used
 * - Clocks that advanced
 * - Continue button to proceed to next day
 *
 * Uses Framer Motion for fade-in animation.
 */
export function CycleSummary({
  cycleNumber,
  actionsCompleted,
  clockChanges,
  onContinue,
}: CycleSummaryProps) {
  const hasActions = actionsCompleted.length > 0;
  const hasClockChanges = clockChanges.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-surface max-w-lg w-full mx-4 rounded-lg p-6 shadow-xl"
        >
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-100 border-b border-gray-700 pb-3 mb-4">
            End of Day {cycleNumber}
          </h2>

          {/* Actions Taken */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Actions Taken
            </h3>
            {hasActions ? (
              <ul className="space-y-3">
                {actionsCompleted.map((item, index) => (
                  <li key={index} className="bg-surface-light rounded p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-100">{item.action.name}</span>
                      <div className="flex gap-1">
                        {item.diceUsed.map((die) => (
                          <DieIcon key={die.id} type={die.type} value={die.value} size="sm" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{item.result}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">You rested the entire day.</p>
            )}
          </section>

          {/* Clocks Advanced */}
          {hasClockChanges && (
            <section className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Clocks Advanced
              </h3>
              <ul className="space-y-2">
                {clockChanges.map((change) => (
                  <li key={change.clock.id} className="flex items-center gap-2 text-gray-300">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        change.clock.type === 'danger'
                          ? 'bg-red-500'
                          : change.clock.type === 'opportunity'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <span>{change.clock.label}</span>
                    <span className="text-gray-500">+{change.advanced}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
