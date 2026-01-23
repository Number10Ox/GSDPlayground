import { motion } from 'framer-motion';
import { useInvestigation } from '@/hooks/useInvestigation';
import { useNPCMemory } from '@/hooks/useNPCMemory';
import { SIN_CHAIN_ORDER } from '@/reducers/investigationReducer';
import type { SinLevel } from '@/types/investigation';

/**
 * Get the outcome text for the town resolution scenario.
 */
function getOutcomeText(townResolved: boolean, sinEscalatedToMurder: boolean): {
  text: string;
  tone: 'positive' | 'bittersweet' | 'tragedy';
} {
  if (townResolved && !sinEscalatedToMurder) {
    return { text: 'You addressed the root of the rot.', tone: 'positive' };
  }
  if (townResolved && sinEscalatedToMurder) {
    return { text: 'Justice came, but not before blood was spilled.', tone: 'bittersweet' };
  }
  // sinEscalatedToMurder && !townResolved
  return { text: 'The town fell to its own darkness.', tone: 'tragedy' };
}

/**
 * Get a brief outcome description for an NPC based on their situation.
 */
function getNPCOutcomeText(
  relationshipLevel: number,
  hasConflictHistory: boolean,
  linkedSinsResolved: boolean,
): { text: string; color: 'amber' | 'gray' | 'red' } {
  if (linkedSinsResolved && relationshipLevel >= 0 && !hasConflictHistory) {
    return { text: 'Found peace through your judgment.', color: 'amber' };
  }
  if (linkedSinsResolved && hasConflictHistory) {
    return { text: 'Accepted your authority, though scarred.', color: 'gray' };
  }
  if (!linkedSinsResolved && relationshipLevel < -30) {
    return { text: 'Left broken by unresolved sin and violence.', color: 'red' };
  }
  if (!linkedSinsResolved && hasConflictHistory) {
    return { text: 'Remains in the grip of darkness.', color: 'red' };
  }
  if (!linkedSinsResolved) {
    return { text: 'Carries on, unchanged by your passage.', color: 'gray' };
  }
  return { text: 'Endures, as the faithful do.', color: 'gray' };
}

/**
 * Get relationship label from numeric level.
 */
function getRelationshipLabel(level: number): string {
  if (level >= 50) return 'Trusting';
  if (level >= 20) return 'Favorable';
  if (level >= -20) return 'Neutral';
  if (level >= -50) return 'Wary';
  return 'Hostile';
}

const outcomeColorMap = {
  amber: 'text-amber-400',
  gray: 'text-gray-400',
  red: 'text-red-400',
} as const;

const sinLevelLabels: Record<SinLevel, string> = {
  'pride': 'Pride',
  'injustice': 'Injustice',
  'sin': 'Sin',
  'demonic-attacks': 'Demonic Attacks',
  'false-doctrine': 'False Doctrine',
  'sorcery': 'Sorcery',
  'hate-and-murder': 'Hate & Murder',
};

/**
 * ResolutionSummary - End-of-town summary showing NPC outcomes.
 *
 * Full-screen overlay with dark backdrop showing:
 * - Overall resolution outcome (3 variants: positive, bittersweet, tragedy)
 * - NPC outcome list with relationship levels and brief descriptions
 * - Sin chain visualization showing resolved vs reached levels
 * - "Ride On" button (placeholder for Phase 6 town transition)
 */
export function ResolutionSummary() {
  const { state: investigationState } = useInvestigation();
  const { npcs, memories } = useNPCMemory();

  const { townResolved, sinProgression, sinEscalatedToMurder } = investigationState;

  // Don't render if neither resolved nor escalated to murder
  if (!townResolved && !sinEscalatedToMurder) return null;

  const { text: outcomeText, tone } = getOutcomeText(townResolved, sinEscalatedToMurder);

  // Build sin chain status: which levels were reached and resolved
  const sinChainStatus = SIN_CHAIN_ORDER.map((level) => {
    const nodesAtLevel = sinProgression.filter((node) => node.level === level);
    const reached = nodesAtLevel.length > 0;
    const resolved = nodesAtLevel.some((node) => node.resolved);
    return { level, reached, resolved };
  });

  // Build NPC outcomes
  const npcOutcomes = npcs.map((npc) => {
    const memory = memories.find((m) => m.npcId === npc.id);
    const relationshipLevel = memory?.relationshipLevel ?? 0;
    const hasConflictHistory = (memory?.events.length ?? 0) > 0;

    // Check if this NPC's linked sins are resolved
    const linkedSins = sinProgression.filter((node) => node.linkedNpcs.includes(npc.id));
    const linkedSinsResolved = linkedSins.length > 0 && linkedSins.every((node) => node.resolved);

    const outcome = getNPCOutcomeText(relationshipLevel, hasConflictHistory, linkedSinsResolved);

    return {
      npc,
      relationshipLevel,
      relationshipLabel: getRelationshipLabel(relationshipLevel),
      ...outcome,
    };
  });

  const toneColorMap = {
    positive: 'text-amber-300',
    bittersweet: 'text-yellow-500',
    tragedy: 'text-red-400',
  } as const;

  return (
    <div
      data-testid="resolution-summary"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto px-8 py-10"
      >
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-3xl font-serif text-gray-100 text-center mb-2"
        >
          The Dog Rides On
        </motion.h1>

        {/* Outcome text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className={`text-center text-lg italic mb-8 ${toneColorMap[tone]}`}
        >
          {outcomeText}
        </motion.p>

        {/* Sin Chain Visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-3 text-center">
            Sin Progression
          </h2>
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {sinChainStatus.map(({ level, reached, resolved }) => (
              <div
                key={level}
                className={`px-2 py-1 text-xs rounded border ${
                  resolved
                    ? 'bg-amber-900/30 border-amber-600 text-amber-300'
                    : reached
                      ? 'bg-red-900/30 border-red-600 text-red-300'
                      : 'bg-gray-800/50 border-gray-700 text-gray-500'
                }`}
              >
                {sinLevelLabels[level]}
              </div>
            ))}
          </div>
        </motion.div>

        {/* NPC Outcomes */}
        <div className="space-y-3 mb-8">
          <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-3 text-center">
            The Faithful
          </h2>
          {npcOutcomes.map(({ npc, relationshipLabel, text, color }, index) => (
            <motion.div
              key={npc.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.15, duration: 0.3 }}
              className="flex items-start gap-4 bg-gray-800/50 rounded-lg px-4 py-3 border border-gray-700"
            >
              {/* NPC avatar */}
              <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-500 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-200 font-bold text-sm">
                  {npc.name.charAt(0)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-100 font-medium text-sm">{npc.name}</span>
                  <span className="text-gray-500 text-xs">({npc.role})</span>
                  <span className="text-gray-500 text-xs ml-auto">{relationshipLabel}</span>
                </div>
                <p className={`text-sm italic ${outcomeColorMap[color]}`}>
                  {text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ride On button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="text-center"
        >
          <button
            data-testid="resolution-ride-on"
            className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            Ride On
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
