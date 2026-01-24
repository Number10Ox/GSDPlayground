import { motion } from 'framer-motion';
import { useJourney } from '@/hooks/useJourney';
import { CONVICTION_STRENGTH_DICE } from '@/types/conviction';

/**
 * JourneyEnd - The final screen when the Dog's arc is complete.
 * Shows the transformation from starting beliefs to final convictions.
 */
export function JourneyEnd() {
  const { journey } = useJourney();

  const characterName = journey.character?.name ?? 'The Dog';
  const townCount = journey.completedTowns.length;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="max-w-2xl w-full px-8 py-10"
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-3xl font-serif text-gray-100 text-center mb-2"
        >
          The Dog Has Become Who They Will Be
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-gray-500 text-sm text-center mb-10"
        >
          {characterName} rode through {townCount} {townCount === 1 ? 'town' : 'towns'}.
        </motion.p>

        {/* Starting convictions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-3 text-center">
            Set Out Believing
          </h2>
          <div className="space-y-2">
            {journey.convictions.map((c) => (
              <p key={`orig-${c.id}`} className="text-gray-500 italic text-center text-sm">
                "{c.originalText}"
              </p>
            ))}
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.4 }}
          className="text-center text-gray-600 text-2xl mb-8"
        >
          ↓
        </motion.div>

        {/* Final convictions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-3 text-center">
            Now Carries These Truths
          </h2>
          <div className="space-y-4">
            {journey.convictions.map((c, idx) => {
              const wasTransformed = c.text !== c.originalText;
              return (
                <motion.div
                  key={`final-${c.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.8 + idx * 0.2 }}
                  className="text-center"
                >
                  <p className={`italic text-sm ${wasTransformed ? 'text-purple-300' : 'text-amber-300'}`}>
                    "{c.text}"
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    {wasTransformed ? 'transformed' : 'reinforced'} — {c.strength} ({CONVICTION_STRENGTH_DICE[c.strength]})
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Traits accumulated */}
        {journey.character && journey.character.traits.filter(t => t.source === 'fallout').length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5, duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-3 text-center">
              Scars of the Road
            </h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {journey.character.traits
                .filter(t => t.source === 'fallout')
                .map(t => (
                  <span key={t.id} className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400">
                    {t.name}
                  </span>
                ))
              }
            </div>
          </motion.div>
        )}

        {/* New journey button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4, duration: 0.4 }}
          className="text-center"
        >
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
          >
            Begin a New Journey
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
