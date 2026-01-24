import { useState } from 'react';
import { motion } from 'framer-motion';
import { useJourney } from '@/hooks/useJourney';
import { CONVICTION_STRENGTH_DICE, STRENGTH_ORDER } from '@/types/conviction';
import type { Conviction, ReflectionChoice } from '@/types/conviction';

/**
 * ConvictionReflection - Post-town screen where the player confronts
 * each tested conviction and decides: reinforce, doubt, or transform.
 */
export function ConvictionReflection() {
  const { journey, dispatch, getTestedConvictions } = useJourney();
  const testedConvictions = getTestedConvictions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transformText, setTransformText] = useState('');
  const [showTransformInput, setShowTransformInput] = useState(false);

  const current = testedConvictions[currentIndex] as Conviction | undefined;

  // If no convictions were tested, skip reflection
  if (testedConvictions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-gray-300 text-lg mb-6 italic">
            Your convictions went untested in this town.
          </p>
          <button
            onClick={() => dispatch({ type: 'SET_PHASE', phase: 'RIDING_ON' })}
            className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
          >
            Ride On
          </button>
        </motion.div>
      </div>
    );
  }

  if (!current) {
    // All reflections complete
    dispatch({ type: 'SET_PHASE', phase: 'RIDING_ON' });
    return null;
  }

  const pendingTest = journey.pendingTests.find(t => t.convictionId === current.id);
  const strengthIdx = STRENGTH_ORDER.indexOf(current.strength);
  const nextStrength = strengthIdx < STRENGTH_ORDER.length - 1 ? STRENGTH_ORDER[strengthIdx + 1] : current.strength;
  const prevStrength = strengthIdx > 0 ? STRENGTH_ORDER[strengthIdx - 1] : current.strength;
  const isBroken = current.lifecycle === 'broken';

  function handleChoice(choice: ReflectionChoice, newText?: string) {
    dispatch({ type: 'REFLECT_ON_CONVICTION', convictionId: current!.id, choice, newText });
    setShowTransformInput(false);
    setTransformText('');

    if (currentIndex < testedConvictions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      dispatch({ type: 'SET_PHASE', phase: 'RIDING_ON' });
    }
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full px-8"
      >
        <h2 className="text-gray-400 text-sm uppercase tracking-wider text-center mb-8">
          Conviction {currentIndex + 1} of {testedConvictions.length}
        </h2>

        <p className="text-2xl text-gray-100 font-serif text-center italic mb-4">
          "{current.text}"
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-gray-500 text-sm">{current.strength}</span>
          <span className="text-gray-600 text-xs">({CONVICTION_STRENGTH_DICE[current.strength]})</span>
        </div>

        {pendingTest && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-8">
            <p className="text-gray-400 text-sm italic">{pendingTest.description}</p>
          </div>
        )}

        {isBroken && (
          <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 mb-6">
            <p className="text-red-300 text-sm">
              This conviction has been doubted too many times. It must be transformed.
            </p>
          </div>
        )}

        {showTransformInput ? (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm text-center">
              What does this conviction become?
            </p>
            <input
              type="text"
              value={transformText}
              onChange={(e) => setTransformText(e.target.value)}
              placeholder="Write your new conviction..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowTransformInput(false)}
                className="flex-1 py-2 text-gray-400 hover:text-gray-200 text-sm border border-gray-700 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => handleChoice('transform', transformText)}
                disabled={transformText.trim().length < 3}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  transformText.trim().length >= 3
                    ? 'bg-purple-700 hover:bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Transform
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {!isBroken && (
              <>
                <button
                  onClick={() => handleChoice('reinforce')}
                  className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-amber-500 rounded-lg p-4 transition-colors"
                >
                  <div className="font-medium text-amber-300 text-sm">Reinforce</div>
                  <p className="text-gray-400 text-xs mt-1">
                    "I have seen the cost, and I still believe."
                    <span className="text-gray-500 ml-2">
                      {current.strength} → {nextStrength} ({CONVICTION_STRENGTH_DICE[nextStrength]})
                    </span>
                  </p>
                </button>

                <button
                  onClick={() => handleChoice('doubt')}
                  className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-400 rounded-lg p-4 transition-colors"
                >
                  <div className="font-medium text-gray-300 text-sm">Doubt</div>
                  <p className="text-gray-400 text-xs mt-1">
                    "Perhaps this is not as certain as I once believed."
                    <span className="text-gray-500 ml-2">
                      {current.strength} → {prevStrength} ({CONVICTION_STRENGTH_DICE[prevStrength]})
                    </span>
                  </p>
                </button>
              </>
            )}

            <button
              onClick={() => {
                setTransformText(current.text);
                setShowTransformInput(true);
              }}
              className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-purple-500 rounded-lg p-4 transition-colors"
            >
              <div className="font-medium text-purple-300 text-sm">Transform</div>
              <p className="text-gray-400 text-xs mt-1">
                "What I believed was wrong. The truth is something else."
                <span className="text-gray-500 ml-2">
                  Rewrite conviction, reset to steady (d6)
                </span>
              </p>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
