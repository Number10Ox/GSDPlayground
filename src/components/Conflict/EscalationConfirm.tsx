import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EscalationLevel } from '@/types/conflict';

interface EscalationConfirmProps {
  currentLevel: EscalationLevel;
  targetLevel: EscalationLevel;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Internal monologues for each escalation level.
 * Hand-written to convey the weight of escalating violence.
 */
const ESCALATION_MONOLOGUES: Record<EscalationLevel, string[]> = {
  JUST_TALKING: [
    // Not used - you can't escalate TO just talking
    'Words still have power here.',
  ],
  PHYSICAL: [
    'Your hands clench into fists. This is going to get ugly.',
    'You step closer, making your presence felt. Words alone won\'t cut it anymore.',
    'Something shifts in your stance. You\'re done being polite.',
    'The space between you shrinks. Your body knows what comes next.',
    'You feel your weight settle. Ready to move if you have to.',
  ],
  FIGHTING: [
    'Your hand moves to your belt. The time for shoving is past.',
    'Blood is about to be spilled. Are you ready for that?',
    'This crosses a line. There\'s no talking your way out after this.',
    'You feel the familiar weight at your side. A tool of last resort.',
    'Your breath steadies. You\'ve done this before. You can do it again.',
  ],
  GUNPLAY: [
    'Your hand moves toward the gun. Once drawn, there\'s no taking it back.',
    'The weight of the iron at your hip suddenly feels heavier. Someone might die today.',
    'God forgive you. But this is the only language some folks understand.',
    'You reach for cold steel. The King of Life has made His judgment known.',
    'Time slows. You see every detail. Your hand knows the motion by heart.',
  ],
};

/**
 * Display names for escalation levels
 */
const LEVEL_NAMES: Record<EscalationLevel, string> = {
  JUST_TALKING: 'Just Talking',
  PHYSICAL: 'Physical',
  FIGHTING: 'Fighting',
  GUNPLAY: 'Gunplay',
};

/**
 * Colors for level badges
 */
const LEVEL_COLORS: Record<EscalationLevel, string> = {
  JUST_TALKING: 'bg-gray-600 text-gray-200',
  PHYSICAL: 'bg-amber-700 text-amber-100',
  FIGHTING: 'bg-red-700 text-red-100',
  GUNPLAY: 'bg-red-900 text-red-100',
};

/**
 * EscalationConfirm - Modal for confirming escalation with internal monologue.
 *
 * Shows the current and target escalation levels, a randomly selected
 * monologue for the target level, and a warning that escalation cannot
 * be undone. For GUNPLAY, adds a delay before confirm is enabled.
 */
export function EscalationConfirm({
  currentLevel,
  targetLevel,
  onConfirm,
  onCancel,
}: EscalationConfirmProps) {
  // Delay for GUNPLAY escalation (1.5 seconds)
  const [confirmEnabled, setConfirmEnabled] = useState(targetLevel !== 'GUNPLAY');

  // Select random monologue once on mount
  const monologue = useMemo(() => {
    const monologues = ESCALATION_MONOLOGUES[targetLevel];
    return monologues[Math.floor(Math.random() * monologues.length)];
  }, [targetLevel]);

  // Enable confirm after delay for GUNPLAY
  useEffect(() => {
    if (targetLevel === 'GUNPLAY') {
      const timer = setTimeout(() => {
        setConfirmEnabled(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [targetLevel]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        onClick={onCancel}
        data-testid="escalation-confirm-modal"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface rounded-lg p-8 max-w-md shadow-2xl border border-gray-700"
        >
          {/* Level transition */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">From</div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${LEVEL_COLORS[currentLevel]}`}
              >
                {LEVEL_NAMES[currentLevel]}
              </span>
            </div>
            <div className="text-gray-500 text-2xl">→</div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">To</div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${LEVEL_COLORS[targetLevel]}`}
              >
                {LEVEL_NAMES[targetLevel]}
              </span>
            </div>
          </div>

          {/* Internal monologue */}
          <div className="mb-6 p-4 bg-black/30 rounded-lg border-l-4 border-amber-600">
            <p className="text-gray-200 italic leading-relaxed">{monologue}</p>
          </div>

          {/* Warning */}
          <div className="mb-6 text-center">
            <p className="text-red-400 text-sm font-medium">
              This cannot be undone.
            </p>
            {targetLevel === 'GUNPLAY' && (
              <p className="text-gray-500 text-xs mt-1">
                Someone could die from this.
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-semibold transition-colors"
            >
              Step Back
            </button>
            <button
              onClick={onConfirm}
              disabled={!confirmEnabled}
              data-testid="escalation-confirm-button"
              className={`
                flex-1 py-3 rounded-lg font-semibold transition-all
                ${confirmEnabled
                  ? `${targetLevel === 'GUNPLAY' ? 'bg-red-800 hover:bg-red-700' : 'bg-amber-700 hover:bg-amber-600'} text-white`
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {confirmEnabled ? 'Escalate' : 'Wait...'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
