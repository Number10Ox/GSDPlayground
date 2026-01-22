import type { Trait } from '@/types/character';
import type { DieType } from '@/types/game';

/**
 * Die color scheme matching DieIcon conventions:
 * d4=red, d6=amber, d8=green, d10=blue
 */
const dieColorClasses: Record<DieType, string> = {
  d4: 'bg-red-600',
  d6: 'bg-amber-600',
  d8: 'bg-green-600',
  d10: 'bg-blue-600',
};

/**
 * Source badge styling
 */
const sourceStyles: Record<'creation' | 'fallout', { bg: string; text: string; label: string }> = {
  creation: { bg: 'bg-amber-900', text: 'text-amber-300', label: 'Creation' },
  fallout: { bg: 'bg-red-900', text: 'text-red-300', label: 'Fallout' },
};

/**
 * Format dice as notation string (e.g., "2d6 + 1d4")
 */
function formatDiceNotation(dice: { type: DieType }[]): string {
  const counts: Partial<Record<DieType, number>> = {};
  for (const die of dice) {
    counts[die.type] = (counts[die.type] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([type, count]) => `${count}${type}`)
    .join(' + ');
}

interface TraitListProps {
  traits: Trait[];
  onInvoke?: (traitId: string) => void;
  usedTraitIds?: Set<string>;
}

/**
 * TraitList - Displays character traits with dice notation and source badges.
 *
 * In conflict mode (onInvoke provided): shows Invoke buttons.
 * In passive mode: just displays trait information.
 * Used traits (in usedTraitIds) are dimmed with a "Used" badge.
 */
export function TraitList({ traits, onInvoke, usedTraitIds }: TraitListProps) {
  if (traits.length === 0) {
    return (
      <div data-testid="trait-list" className="p-4 text-gray-500 text-sm italic">
        No traits
      </div>
    );
  }

  return (
    <div data-testid="trait-list" className="space-y-2">
      {traits.map((trait) => {
        const isUsed = usedTraitIds?.has(trait.id) ?? false;
        const source = sourceStyles[trait.source];

        return (
          <div
            key={trait.id}
            data-testid={`trait-${trait.id}`}
            className={`flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 transition-colors ${
              isUsed ? 'opacity-50' : 'hover:bg-gray-800'
            }`}
          >
            {/* Trait name */}
            <span className="text-gray-100 font-medium flex-1 min-w-0 truncate">
              {trait.name}
            </span>

            {/* Dice notation */}
            <span className="text-sm text-gray-400 flex-shrink-0">
              {formatDiceNotation(trait.dice)}
            </span>

            {/* Dice color indicators */}
            <div className="flex gap-1 flex-shrink-0">
              {trait.dice.map((die) => (
                <span
                  key={die.id}
                  className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold text-white ${dieColorClasses[die.type]}`}
                  title={die.type}
                >
                  {die.type.slice(1)}
                </span>
              ))}
            </div>

            {/* Source badge */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${source.bg} ${source.text} flex-shrink-0`}
            >
              {source.label}
            </span>

            {/* Invoke button or Used badge */}
            {onInvoke && (
              isUsed ? (
                <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-500 flex-shrink-0">
                  Used
                </span>
              ) : (
                <button
                  data-testid={`invoke-trait-${trait.id}`}
                  onClick={() => onInvoke(trait.id)}
                  className="text-xs px-3 py-1 rounded bg-amber-700 hover:bg-amber-600 text-amber-100 font-semibold transition-colors flex-shrink-0"
                >
                  Invoke
                </button>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
