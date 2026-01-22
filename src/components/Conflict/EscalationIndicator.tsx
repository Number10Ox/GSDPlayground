import { motion } from 'framer-motion';
import type { EscalationLevel } from '@/types/conflict';

interface EscalationIndicatorProps {
  playerLevel: EscalationLevel;
  npcLevel: EscalationLevel;
  npcName: string;
}

/**
 * Display names for escalation levels (canonical DitV terms)
 */
const LEVEL_NAMES: Record<EscalationLevel, string> = {
  JUST_TALKING: 'Just Talking',
  PHYSICAL: 'Physical',
  FIGHTING: 'Fighting',
  GUNPLAY: 'Gunplay',
};

/**
 * Badge colors for each escalation level
 */
const LEVEL_STYLES: Record<EscalationLevel, { bg: string; text: string; border: string }> = {
  JUST_TALKING: {
    bg: 'bg-gray-700',
    text: 'text-gray-200',
    border: 'border-gray-500',
  },
  PHYSICAL: {
    bg: 'bg-amber-800',
    text: 'text-amber-100',
    border: 'border-amber-500',
  },
  FIGHTING: {
    bg: 'bg-red-800',
    text: 'text-red-100',
    border: 'border-red-500',
  },
  GUNPLAY: {
    bg: 'bg-red-950',
    text: 'text-red-100',
    border: 'border-red-700',
  },
};

/**
 * Level badge component with pulse animation on change
 */
function LevelBadge({
  level,
  testIdPrefix,
}: {
  level: EscalationLevel;
  testIdPrefix: string;
}) {
  const styles = LEVEL_STYLES[level];

  return (
    <motion.span
      key={level}
      initial={{ scale: 1.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15 }}
      data-testid={`${testIdPrefix}-escalation-${level.toLowerCase()}`}
      className={`
        px-3 py-1.5 rounded-full text-sm font-semibold
        border-2 ${styles.bg} ${styles.text} ${styles.border}
      `}
    >
      {LEVEL_NAMES[level]}
    </motion.span>
  );
}

/**
 * EscalationIndicator - Split display showing player and NPC escalation levels.
 *
 * Displays both participant's escalation levels side-by-side with color-coded
 * badges. Animates with a pulse when levels change.
 */
export function EscalationIndicator({
  playerLevel,
  npcLevel,
  npcName,
}: EscalationIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-8 p-4 bg-surface/50 rounded-lg">
      {/* Player side */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-400 uppercase tracking-wider">You</span>
        <LevelBadge level={playerLevel} testIdPrefix="player" />
      </div>

      {/* Divider */}
      <div className="w-px h-12 bg-gray-600" />

      {/* NPC side */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs text-gray-400 uppercase tracking-wider truncate max-w-24">
          {npcName}
        </span>
        <LevelBadge level={npcLevel} testIdPrefix="npc" />
      </div>
    </div>
  );
}
