import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConflictOutcome, FalloutDice, FalloutResult, FalloutSeverity } from '@/types/conflict';
import { FalloutReveal } from './FalloutReveal';

interface ConflictResolutionProps {
  outcome: ConflictOutcome;
  stakes: string;
  npcName: string;
  falloutDice: FalloutDice[];
  witnesses: string[];
  onDismiss: (severity: FalloutSeverity) => void;
}

// Outcome display text
const OUTCOME_TEXT: Record<ConflictOutcome, { prefix: string; tone: string }> = {
  PLAYER_WON: { prefix: 'You won:', tone: 'text-green-400' },
  PLAYER_GAVE: { prefix: 'You gave:', tone: 'text-red-400' },
  NPC_GAVE: { prefix: 'They gave:', tone: 'text-amber-400' },
};

/**
 * ConflictResolution - Full-screen overlay showing conflict outcome and fallout.
 *
 * Sequence:
 * 1. Stakes outcome displayed first
 * 2. FalloutReveal component for dramatic dice reveal
 * 3. After reveal: relationship impact if violence occurred
 * 4. Continue button (enabled after fallout reveal completes)
 */
export function ConflictResolution({
  outcome,
  stakes,
  npcName,
  falloutDice,
  witnesses,
  onDismiss,
}: ConflictResolutionProps) {
  const [falloutComplete, setFalloutComplete] = useState(false);
  const [falloutResult, setFalloutResult] = useState<FalloutResult | null>(null);

  const handleFalloutComplete = useCallback((result: FalloutResult) => {
    setFalloutResult(result);
    setFalloutComplete(true);
  }, []);

  const handleDismiss = useCallback(() => {
    if (falloutResult) {
      onDismiss(falloutResult.severity);
    }
  }, [falloutResult, onDismiss]);

  // Determine if violence occurred (for relationship impact display)
  const wasViolent = falloutDice.some(
    (fd) => fd.escalationLevel === 'FIGHTING' || fd.escalationLevel === 'GUNPLAY'
  );

  const outcomeInfo = OUTCOME_TEXT[outcome];

  return (
    <div
      data-testid="conflict-resolution"
      className="fixed inset-0 flex items-center justify-center bg-black/80 z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface rounded-lg p-8 max-w-lg w-full mx-4 shadow-2xl"
      >
        {/* Stakes outcome */}
        <div data-testid="resolution-outcome" className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-2xl font-bold ${outcomeInfo.tone}`}
          >
            {outcomeInfo.prefix}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-200 mt-2"
          >
            {stakes}
          </motion.p>
        </div>

        {/* Fallout reveal */}
        <div className="border-t border-gray-700 pt-6 mb-6">
          <FalloutReveal falloutDice={falloutDice} onComplete={handleFalloutComplete} />
        </div>

        {/* Relationship impact (after fallout reveal, if violent) */}
        <AnimatePresence>
          {falloutComplete && wasViolent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-gray-700 pt-4 mb-6"
            >
              <p className="text-amber-400 text-center">
                Brother {npcName} will remember this violence.
              </p>
              {witnesses.length > 0 && (
                <p className="text-gray-500 text-sm text-center mt-2">
                  Witnessed by: {witnesses.join(', ')}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue button */}
        <div className="flex justify-center mt-6">
          <motion.button
            data-testid="resolution-continue-button"
            onClick={handleDismiss}
            disabled={!falloutComplete}
            initial={{ opacity: 0 }}
            animate={{ opacity: falloutComplete ? 1 : 0.3 }}
            className={`
              px-8 py-3 rounded-lg font-semibold transition-colors
              ${falloutComplete
                ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
