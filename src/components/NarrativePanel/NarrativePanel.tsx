import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { NarrativeText } from '@/components/ui/NarrativeText';

export function NarrativePanel() {
  const { state, dispatch } = useGameState();
  const { isPanelOpen, currentScene } = state;

  return (
    <AnimatePresence>
      {isPanelOpen && currentScene && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-gray-700"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold text-gray-100">
                {currentScene.title}
              </h2>
              <button
                onClick={() => dispatch({ type: 'CLOSE_PANEL' })}
                className="text-gray-400 hover:text-gray-200 transition-colors p-2"
                aria-label="Close panel"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <NarrativeText>{currentScene.text}</NarrativeText>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
