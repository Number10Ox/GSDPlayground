import { motion } from 'framer-motion';
import { useJourney } from '@/hooks/useJourney';
import { CONVICTION_STRENGTH_DICE } from '@/types/conviction';

/**
 * JourneyProgress - Between-towns screen showing the Dog's arc so far.
 * Displays conviction evolution timeline and completed town summaries.
 */
export function JourneyProgress() {
  const { journey, dispatch } = useJourney();

  function handleContinue() {
    dispatch({ type: 'CHECK_JOURNEY_COMPLETE' });
    // If not complete, advance to next town
    if (!journey.allConvictionsResolved && journey.currentTownIndex < journey.maxTowns - 1) {
      dispatch({ type: 'ADVANCE_TO_NEXT_TOWN' });
    }
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full px-8 py-10"
      >
        <h1 className="text-2xl font-serif text-gray-100 text-center mb-2">
          The Road Ahead
        </h1>
        <p className="text-gray-500 text-sm text-center mb-8">
          Town {journey.currentTownIndex + 1} of {journey.maxTowns}
        </p>

        {/* Conviction arcs */}
        <div className="space-y-6 mb-10">
          <h2 className="text-gray-400 text-sm uppercase tracking-wider">
            Your Convictions
          </h2>

          {journey.convictions.map((conviction, idx) => (
            <motion.div
              key={conviction.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-gray-100 italic text-sm flex-1">
                  "{conviction.text}"
                </p>
                <span className={`text-xs px-2 py-0.5 rounded ml-3 ${
                  conviction.lifecycle === 'resolved'
                    ? 'bg-amber-900/30 text-amber-300'
                    : conviction.lifecycle === 'shaken'
                      ? 'bg-gray-700 text-gray-400'
                      : 'bg-gray-800 text-gray-500'
                }`}>
                  {conviction.strength} ({CONVICTION_STRENGTH_DICE[conviction.strength]})
                </span>
              </div>

              {/* History timeline */}
              {conviction.history.length > 0 && (
                <div className="flex items-center gap-1 mt-3 flex-wrap">
                  <span className="text-gray-600 text-xs">Created</span>
                  {conviction.history.map((entry, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="text-gray-600 text-xs">→</span>
                      <span className={`text-xs ${
                        entry.action === 'reinforced' ? 'text-amber-400' :
                        entry.action === 'doubted' ? 'text-gray-400' :
                        entry.action === 'transformed' ? 'text-purple-400' :
                        'text-gray-500'
                      }`}>
                        {entry.action} ({entry.townName})
                      </span>
                    </span>
                  ))}
                </div>
              )}

              {conviction.originalText !== conviction.text && (
                <p className="text-gray-600 text-xs mt-2 line-through">
                  Originally: "{conviction.originalText}"
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Completed towns summary */}
        {journey.completedTowns.length > 0 && (
          <div className="mb-10">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-3">
              Towns Visited
            </h2>
            <div className="flex gap-2 flex-wrap">
              {journey.completedTowns.map((town) => (
                <div
                  key={town.townId}
                  className={`px-3 py-1.5 rounded border text-xs ${
                    town.resolved
                      ? 'bg-amber-900/20 border-amber-700 text-amber-300'
                      : 'bg-red-900/20 border-red-700 text-red-300'
                  }`}
                >
                  {town.townName} — {town.reputation}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
          >
            Continue to Next Town
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
