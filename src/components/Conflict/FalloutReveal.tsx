import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FalloutDice, FalloutResult, FalloutSeverity } from '@/types/conflict';
import type { Trait } from '@/types/character';
import { calculateFallout } from '@/utils/fallout';
import { createTraitFromFallout } from '@/utils/falloutTraits';
import { useCharacter } from '@/hooks/useCharacter';
import { DieIcon } from '@/components/DicePool/DieIcon';

interface FalloutRevealProps {
  falloutDice: FalloutDice[];
  onComplete: (result: FalloutResult) => void;
}

// Phase of the reveal sequence
type RevealPhase = 'GATHERING' | 'ROLLING' | 'CALCULATION' | 'VERDICT';

// Labels for escalation levels in the gathering phase
const ESCALATION_LABELS: Record<string, string> = {
  JUST_TALKING: 'From heated words...',
  PHYSICAL: 'From physical confrontation...',
  FIGHTING: 'From the fight...',
  GUNPLAY: 'From the gunfire...',
};

// Severity messages with appropriate tone
const SEVERITY_MESSAGES: Record<FalloutSeverity, { text: string; tone: string }> = {
  NONE: { text: 'You escaped unscathed', tone: 'text-green-400' },
  MINOR: { text: 'A scratch, nothing more', tone: 'text-amber-400' },
  SERIOUS: { text: 'This will leave a mark', tone: 'text-orange-400' },
  DEADLY: { text: 'Your life hangs by a thread', tone: 'text-red-400' },
  DEATH: { text: 'The King of Life calls you home', tone: 'text-red-600' },
};

// Phase durations in milliseconds
const PHASE_DURATIONS = {
  GATHERING: 1000,
  ROLLING: 1500,
  CALCULATION: 1000,
  VERDICT: 500, // Brief pause before calling onComplete
};

/**
 * FalloutReveal - Dramatic animated reveal of fallout dice and calculated severity.
 *
 * Sequence:
 * 1. GATHERING: "The cost of violence..." text fades in, dice appear grouped by escalation
 * 2. ROLLING: Dice animate rolling, values revealed with stagger
 * 3. CALCULATION: All values visible, top 2 highlight, sum displayed
 * 4. VERDICT: Severity revealed with appropriate gravity
 */
export function FalloutReveal({ falloutDice, onComplete }: FalloutRevealProps) {
  const { dispatch: charDispatch } = useCharacter();
  const [phase, setPhase] = useState<RevealPhase>('GATHERING');
  const [falloutResult, setFalloutResult] = useState<FalloutResult | null>(null);
  const [highlightIndices, setHighlightIndices] = useState<number[]>([]);
  const [gainedTrait, setGainedTrait] = useState<Trait | null>(null);

  // Calculate fallout on mount (dice are rolled inside calculateFallout)
  useEffect(() => {
    const result = calculateFallout(falloutDice);
    setFalloutResult(result);

    // Find indices of top 2 dice values for highlighting
    if (result.diceRolled.length >= 2) {
      const sorted = [...result.diceRolled]
        .map((die, idx) => ({ value: die.value, idx }))
        .sort((a, b) => b.value - a.value);
      setHighlightIndices([sorted[0].idx, sorted[1].idx]);
    }
  }, [falloutDice]);

  // Advance through phases with timers
  useEffect(() => {
    if (phase === 'GATHERING') {
      const timer = setTimeout(() => setPhase('ROLLING'), PHASE_DURATIONS.GATHERING);
      return () => clearTimeout(timer);
    }
    if (phase === 'ROLLING') {
      const timer = setTimeout(() => setPhase('CALCULATION'), PHASE_DURATIONS.ROLLING);
      return () => clearTimeout(timer);
    }
    if (phase === 'CALCULATION') {
      const timer = setTimeout(() => setPhase('VERDICT'), PHASE_DURATIONS.CALCULATION);
      return () => clearTimeout(timer);
    }
    if (phase === 'VERDICT' && falloutResult) {
      // Create trait from fallout if severity warrants it
      if (
        falloutResult.severity === 'MINOR' ||
        falloutResult.severity === 'SERIOUS' ||
        falloutResult.severity === 'DEADLY'
      ) {
        const newTrait = createTraitFromFallout(falloutResult.severity, falloutResult.falloutType);
        if (newTrait) {
          setGainedTrait(newTrait);
          charDispatch({ type: 'ADD_TRAIT', trait: newTrait });
        }
      }

      // Longer pause when trait is gained so player can read it
      const delay = falloutResult.severity !== 'NONE' && falloutResult.severity !== 'DEATH'
        ? 2500
        : PHASE_DURATIONS.VERDICT;
      const timer = setTimeout(() => onComplete(falloutResult), delay);
      return () => clearTimeout(timer);
    }
  }, [phase, falloutResult, onComplete, charDispatch]);

  // Handle no fallout dice case
  if (falloutDice.length === 0) {
    useEffect(() => {
      const result: FalloutResult = {
        severity: 'NONE',
        falloutType: 'SOCIAL',
        total: 0,
        diceRolled: [],
      };
      onComplete(result);
    }, [onComplete]);

    return (
      <div data-testid="fallout-reveal" className="text-center">
        <p className="text-gray-400">No fallout accumulated.</p>
      </div>
    );
  }

  // Get top 2 values and sum for display
  const top2Values = falloutResult?.diceRolled
    .map((d) => d.value)
    .sort((a, b) => b - a)
    .slice(0, 2) || [];
  const sum = top2Values.reduce((acc, v) => acc + v, 0);

  return (
    <div data-testid="fallout-reveal" className="flex flex-col items-center gap-6 p-4">
      {/* Phase 1: Gathering text */}
      <AnimatePresence mode="wait">
        {phase === 'GATHERING' && (
          <motion.h3
            key="gathering-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xl text-gray-300 italic"
          >
            The cost of violence...
          </motion.h3>
        )}
      </AnimatePresence>

      {/* Dice display - grouped by escalation */}
      <div className="flex flex-col gap-4">
        {falloutDice.map((group, groupIdx) => (
          <motion.div
            key={`group-${groupIdx}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIdx * 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            {/* Escalation label */}
            <span className="text-sm text-gray-500">
              {ESCALATION_LABELS[group.escalationLevel] || group.escalationLevel}
            </span>

            {/* Dice in this group */}
            <div className="flex gap-2">
              {group.dice.map((die, dieIdx) => {
                // Calculate overall index for highlighting
                const overallIdx = falloutDice
                  .slice(0, groupIdx)
                  .reduce((acc, g) => acc + g.dice.length, 0) + dieIdx;
                const isHighlighted = highlightIndices.includes(overallIdx);
                const rolledDie = falloutResult?.diceRolled[overallIdx];

                return (
                  <motion.div
                    key={die.id}
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{
                      scale: 1,
                      rotate: phase === 'ROLLING' ? [0, 360, 720, 1080] : 0,
                    }}
                    transition={{
                      scale: { delay: groupIdx * 0.2 + dieIdx * 0.1, duration: 0.3 },
                      rotate: { duration: 1.5, ease: 'easeOut' },
                    }}
                    className={`
                      relative flex flex-col items-center p-2 rounded
                      ${phase === 'CALCULATION' && isHighlighted ? 'ring-2 ring-amber-400 bg-amber-900/30' : ''}
                    `}
                  >
                    <DieIcon type={die.type} value={die.value} size="md" />
                    {/* Show value after ROLLING phase */}
                    {(phase === 'CALCULATION' || phase === 'VERDICT') && rolledDie && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: isHighlighted ? 1.2 : 1 }}
                        className={`
                          text-lg font-bold mt-1
                          ${isHighlighted ? 'text-amber-300' : 'text-gray-300'}
                        `}
                      >
                        {rolledDie.value}
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Phase 3: Calculation display */}
      <AnimatePresence>
        {(phase === 'CALCULATION' || phase === 'VERDICT') && falloutResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-gray-400">
              Highest: {top2Values[0] || 0} + {top2Values[1] || 0} ={' '}
              <span className="text-xl font-bold text-white">{sum}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 4: Verdict */}
      <AnimatePresence>
        {phase === 'VERDICT' && falloutResult && (
          <motion.div
            data-testid={`fallout-severity-${falloutResult.severity.toLowerCase()}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className={`text-2xl font-bold ${SEVERITY_MESSAGES[falloutResult.severity].tone}`}>
              {SEVERITY_MESSAGES[falloutResult.severity].text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trait gained from fallout */}
      <AnimatePresence>
        {phase === 'VERDICT' && gainedTrait && (
          <motion.div
            data-testid="fallout-trait-gained"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-4 p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg"
          >
            <p className="text-sm text-amber-400 uppercase tracking-wider mb-1">
              New Trait Gained
            </p>
            <p className="text-lg text-amber-200 font-semibold">
              {gainedTrait.name}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {gainedTrait.dice[0].type} die
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
