import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ArrivalData } from '@/types/town';

interface TownArrivalProps {
  townName: string;
  arrival: ArrivalData;
  greeterName?: string;
  onComplete: () => void;
  onGreet?: (npcId: string) => void;
}

type ArrivalPhase = 'NARRATIVE' | 'OBSERVATION' | 'RUMORS' | 'GREET';

/**
 * TownArrival - Full-screen arrival sequence when entering a town.
 *
 * Phases:
 * 1. NARRATIVE - Descriptive text of arriving
 * 2. OBSERVATION - The Dog's initial read of the town
 * 3. RUMORS - What the Dog heard on the road
 * 4. GREET - Option to speak to the approaching NPC
 */
export function TownArrival({ townName, arrival, greeterName, onComplete, onGreet }: TownArrivalProps) {
  const [phase, setPhase] = useState<ArrivalPhase>('NARRATIVE');

  const advance = useCallback(() => {
    switch (phase) {
      case 'NARRATIVE':
        setPhase('OBSERVATION');
        break;
      case 'OBSERVATION':
        if (arrival.rumors.length > 0) {
          setPhase('RUMORS');
        } else if (arrival.greeterNpcId) {
          setPhase('GREET');
        } else {
          onComplete();
        }
        break;
      case 'RUMORS':
        if (arrival.greeterNpcId) {
          setPhase('GREET');
        } else {
          onComplete();
        }
        break;
      case 'GREET':
        onComplete();
        break;
    }
  }, [phase, arrival, onComplete]);

  const handleGreet = useCallback(() => {
    if (arrival.greeterNpcId && onGreet) {
      onGreet(arrival.greeterNpcId);
    }
    onComplete();
  }, [arrival.greeterNpcId, onGreet, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center">
      <div className="max-w-2xl w-full px-8">
        <AnimatePresence mode="wait">
          {phase === 'NARRATIVE' && (
            <motion.div
              key="narrative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-2xl font-bold text-amber-200 mb-6 text-center">
                {townName}
              </h1>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                {arrival.narrative}
              </p>
              <button
                onClick={advance}
                className="mt-8 w-full text-center text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors cursor-pointer"
              >
                Continue...
              </button>
            </motion.div>
          )}

          {phase === 'OBSERVATION' && (
            <motion.div
              key="observation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
                Your Eyes Tell You
              </h2>
              <p className="text-gray-300 leading-relaxed text-sm italic">
                {arrival.observation}
              </p>
              <button
                onClick={advance}
                className="mt-8 w-full text-center text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors cursor-pointer"
              >
                Continue...
              </button>
            </motion.div>
          )}

          {phase === 'RUMORS' && (
            <motion.div
              key="rumors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
                What You Know
              </h2>
              <ul className="space-y-3">
                {arrival.rumors.map((rumor, i) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-amber-600 shrink-0">&bull;</span>
                    <span>{rumor}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={advance}
                className="mt-8 w-full text-center text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors cursor-pointer"
              >
                Continue...
              </button>
            </motion.div>
          )}

          {phase === 'GREET' && (
            <motion.div
              key="greet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-300 text-sm mb-6">
                <span className="text-amber-200 font-medium">{greeterName ?? 'Someone'}</span> approaches you with urgency in their step.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleGreet}
                  className="flex-1 bg-amber-900/50 hover:bg-amber-800/60 text-amber-200 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Speak with {greeterName ?? 'them'}
                </button>
                <button
                  onClick={onComplete}
                  className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Look around first
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
