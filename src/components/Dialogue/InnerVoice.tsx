import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StatName } from '@/types/character';
import { getInnerVoiceInterjection } from '@/utils/innerVoiceTemplates';

interface InnerVoiceProps {
  stat: StatName;
  situation: string;
  visible: boolean;
}

const STAT_COLORS: Record<StatName, string> = {
  acuity: 'text-blue-300',
  heart: 'text-pink-300',
  body: 'text-amber-300',
  will: 'text-purple-300',
};

const STAT_BORDER_COLORS: Record<StatName, string> = {
  acuity: 'border-blue-400/30',
  heart: 'border-pink-400/30',
  body: 'border-amber-400/30',
  will: 'border-purple-400/30',
};

/**
 * InnerVoice - Stat-based inner voice interjection overlay.
 * Slides in from bottom-left, remains visible until parent sets visible=false.
 * Uses template system (no API calls) via getInnerVoiceInterjection.
 */
export function InnerVoice({ stat, situation, visible }: InnerVoiceProps) {
  const [interjection, setInterjection] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShow(false);
      return;
    }

    // Get interjection from template system (includes 30% probability)
    const text = getInnerVoiceInterjection(stat, situation);
    if (text) {
      setInterjection(text);
      setShow(true);
    }
  }, [stat, situation, visible]);

  return (
    <AnimatePresence>
      {show && interjection && (
        <motion.div
          data-testid="inner-voice"
          initial={{ opacity: 0, y: 20, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`
            absolute bottom-20 left-4 max-w-sm p-3 rounded-lg
            bg-gray-900/90 border ${STAT_BORDER_COLORS[stat]}
            backdrop-blur-sm
          `}
        >
          <span className={`text-xs font-semibold uppercase tracking-wider ${STAT_COLORS[stat]}`}>
            [{stat}]
          </span>
          <p className={`mt-1 text-sm italic ${STAT_COLORS[stat]} opacity-90`}>
            {interjection}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
