import { Lightbulb, Hand, Heart, Cross } from 'lucide-react';
import type { Stat, StatName } from '@/types/character';
import type { DieType } from '@/types/game';

interface StatDisplayProps {
  stat: Stat;
  dimmed?: boolean;
  compact?: boolean;
}

const STAT_ICONS: Record<StatName, typeof Lightbulb> = {
  acuity: Lightbulb,
  body: Hand,
  heart: Heart,
  will: Cross,
};

const STAT_LABELS: Record<StatName, string> = {
  acuity: 'Acuity',
  body: 'Body',
  heart: 'Heart',
  will: 'Will',
};

const DIE_COLORS: Record<DieType, string> = {
  d4: 'bg-red-500',
  d6: 'bg-amber-500',
  d8: 'bg-green-500',
  d10: 'bg-blue-500',
};

/**
 * StatDisplay - Shows a single character stat with icon and dice visualization.
 *
 * Features:
 * - Western-religious Lucide icon per stat
 * - Colored die shapes showing each die type
 * - Modifier display when injuries reduce dice
 * - Dimmed mode for inactive stats during conflict
 */
export function StatDisplay({ stat, dimmed = false, compact = false }: StatDisplayProps) {
  const Icon = STAT_ICONS[stat.name];
  const label = STAT_LABELS[stat.name];

  // Calculate effective dice count after modifier
  const effectiveDiceCount = Math.max(0, stat.dice.length - Math.abs(stat.modifier));
  const hasModifier = stat.modifier !== 0;

  // Count dice by type for notation
  const diceNotation = getDiceNotation(stat.dice);
  const modifierNotation = hasModifier ? `(-${Math.abs(stat.modifier)}d6)` : '';

  return (
    <div
      data-testid={`stat-${stat.name}`}
      className={`flex items-center gap-2 ${dimmed ? 'opacity-40' : ''} ${compact ? 'py-1' : 'py-2'}`}
    >
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <span className={`text-gray-200 ${compact ? 'text-xs w-12' : 'text-sm w-16'}`}>
        {label}
      </span>

      {/* Dice visualization */}
      <div className="flex items-center gap-1 flex-1">
        {stat.dice.slice(0, effectiveDiceCount).map((die) => (
          <div
            key={die.id}
            className={`${DIE_COLORS[die.type]} ${compact ? 'w-2 h-2' : 'w-3 h-3'} rounded-sm`}
            title={die.type}
          />
        ))}
        {/* Show removed dice as faded */}
        {hasModifier && stat.dice.slice(effectiveDiceCount).map((die) => (
          <div
            key={die.id}
            className={`${DIE_COLORS[die.type]} ${compact ? 'w-2 h-2' : 'w-3 h-3'} rounded-sm opacity-25`}
            title={`${die.type} (injured)`}
          />
        ))}
      </div>

      {/* Text notation */}
      <span className={`text-gray-400 ${compact ? 'text-xs' : 'text-xs'} whitespace-nowrap`}>
        {diceNotation}
        {hasModifier && (
          <span className="text-red-400 ml-1">{modifierNotation}</span>
        )}
      </span>
    </div>
  );
}

/** Convert dice array to readable notation like "3d6" or "2d6+1d8" */
function getDiceNotation(dice: { type: DieType }[]): string {
  const counts: Partial<Record<DieType, number>> = {};
  for (const die of dice) {
    counts[die.type] = (counts[die.type] || 0) + 1;
  }

  const order: DieType[] = ['d4', 'd6', 'd8', 'd10'];
  return order
    .filter((type) => counts[type])
    .map((type) => `${counts[type]}${type}`)
    .join('+');
}
