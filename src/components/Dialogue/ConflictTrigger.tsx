import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ApproachType } from '@/types/dialogue';
import type { ConflictThreshold } from '@/types/npc';

interface ConflictTriggerProps {
  npcId: string;
  approach: ApproachType;
  conflictThresholds?: ConflictThreshold[];
  onConflictStart: (npcId: string, stakes: string) => void;
  /** For deterministic testing: force trigger regardless of roll */
  forceTriggered?: boolean;
}

/**
 * ConflictTrigger - Approach-triggered conflict escalation from dialogue.
 *
 * Only Body and Will approaches can trigger conflicts (Acuity/Heart never trigger).
 * Rolls against NPC's resistChance for the given approach.
 * If triggered: shows warning text, then calls onConflictStart after 1s delay.
 *
 * Integration note: This component is wired into DialogueView in Plan 05-06.
 * This plan creates the component with its props interface only.
 */
export function ConflictTrigger({
  npcId,
  approach,
  conflictThresholds,
  onConflictStart,
  forceTriggered,
}: ConflictTriggerProps) {
  const [triggered, setTriggered] = useState(false);
  const [showing, setShowing] = useState(false);

  const canTrigger = approach === 'body' || approach === 'will';

  const checkConflict = useCallback(() => {
    if (!canTrigger) return;

    // Find threshold for this approach
    const threshold = conflictThresholds?.find((t) => t.approach === approach);
    if (!threshold) return;

    // In dev mode with force flag, always trigger
    const shouldForce = import.meta.env.DEV && forceTriggered;

    // Roll against resistChance
    const roll = Math.random();
    if (shouldForce || roll < threshold.resistChance) {
      setTriggered(true);
      setShowing(true);
    }
  }, [canTrigger, approach, conflictThresholds, forceTriggered]);

  // Check on mount (when approach is selected)
  useEffect(() => {
    checkConflict();
  }, [checkConflict]);

  // After showing warning for 1s, trigger the conflict
  useEffect(() => {
    if (!triggered) return;

    const timer = setTimeout(() => {
      const stakes = approach === 'body'
        ? 'The NPC resists your physical intimidation'
        : 'The NPC refuses to bend to your will';
      onConflictStart(npcId, stakes);
    }, 1000);

    return () => clearTimeout(timer);
  }, [triggered, npcId, approach, onConflictStart]);

  // Only Body/Will can trigger - Acuity/Heart never show anything
  if (!canTrigger || !showing) return null;

  return (
    <div data-testid="conflict-trigger">
      <AnimatePresence>
        {showing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="text-center py-3"
          >
            <p className="text-red-400 italic text-sm font-medium">
              They won&apos;t stand for this...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
