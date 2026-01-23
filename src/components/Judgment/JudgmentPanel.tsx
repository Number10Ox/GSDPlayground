import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JUDGMENT_CHOICES, resolveJudgment, type JudgmentChoice, type JudgmentOutcome } from '@/utils/authorityActions';
import type { SinNode } from '@/types/investigation';
import type { NPC } from '@/types/npc';

interface JudgmentPanelProps {
  sin: SinNode;
  linkedNpcs: NPC[];
  allNpcIds: string[];
  onJudge: (outcome: JudgmentOutcome) => void;
  onDismiss: () => void;
}

/**
 * JudgmentPanel - End-game moral choice UI for pronouncing judgment on a sinner.
 * Presents the sin, the linked NPC, and 4 moral choices with consequences.
 */
export function JudgmentPanel({ sin, linkedNpcs, allNpcIds, onJudge, onDismiss }: JudgmentPanelProps) {
  const [selectedChoice, setSelectedChoice] = useState<JudgmentChoice | null>(null);
  const [outcome, setOutcome] = useState<JudgmentOutcome | null>(null);

  const targetNpc = linkedNpcs[0];

  const handleConfirm = useCallback(() => {
    if (!selectedChoice || !targetNpc) return;
    const result = resolveJudgment(selectedChoice, targetNpc.id, sin.id, allNpcIds);
    setOutcome(result);
    onJudge(result);
  }, [selectedChoice, targetNpc, sin.id, allNpcIds, onJudge]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-amber-800/50 rounded-xl p-6 max-w-lg w-full shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {!outcome ? (
            <motion.div key="choose" exit={{ opacity: 0 }}>
              <h2 className="text-lg font-bold text-amber-200 mb-1">Pronounce Judgment</h2>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">{sin.name}</p>

              {/* Sin description */}
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-300">{sin.description}</p>
                {targetNpc && (
                  <p className="text-xs text-amber-400/70 mt-2">
                    Accused: <span className="font-medium text-amber-300">{targetNpc.name}</span> — {targetNpc.role}
                  </p>
                )}
                {targetNpc?.personalSin && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Their justification: "{targetNpc.personalSin.justification}"
                  </p>
                )}
              </div>

              {/* Judgment choices */}
              <div className="space-y-2 mb-4">
                {JUDGMENT_CHOICES.map(({ choice, label, description }) => (
                  <button
                    key={choice}
                    onClick={() => setSelectedChoice(choice)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedChoice === choice
                        ? 'border-amber-500 bg-amber-900/30'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    }`}
                  >
                    <p className={`text-sm font-medium ${selectedChoice === choice ? 'text-amber-200' : 'text-gray-200'}`}>
                      {label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={!selectedChoice}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    selectedChoice
                      ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Confirm Judgment
                </button>
                <button
                  onClick={onDismiss}
                  className="px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                >
                  Not yet
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="outcome"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-bold text-amber-200 mb-4">Judgment Pronounced</h2>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">{outcome.narrative}</p>
              <button
                onClick={onDismiss}
                className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium text-sm transition-colors cursor-pointer"
              >
                Continue
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
