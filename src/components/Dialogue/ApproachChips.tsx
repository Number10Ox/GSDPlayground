import { Lightbulb, Heart, Hand, Cross } from 'lucide-react';
import type { ApproachType } from '@/types/dialogue';
import type { Character } from '@/types/character';

interface ApproachChipsProps {
  onSelect: (approach: ApproachType) => void;
  stats: Character['stats'];
}

const APPROACH_CONFIG: {
  approach: ApproachType;
  label: string;
  Icon: typeof Lightbulb;
  borderColor: string;
  textColor: string;
}[] = [
  { approach: 'acuity', label: 'Acuity', Icon: Lightbulb, borderColor: 'border-blue-400', textColor: 'text-blue-300' },
  { approach: 'heart', label: 'Heart', Icon: Heart, borderColor: 'border-pink-400', textColor: 'text-pink-300' },
  { approach: 'body', label: 'Body', Icon: Hand, borderColor: 'border-amber-400', textColor: 'text-amber-300' },
  { approach: 'will', label: 'Will', Icon: Cross, borderColor: 'border-purple-400', textColor: 'text-purple-300' },
];

/**
 * getEffectivenessOpacity - Returns opacity class based on dice count.
 * 2-3 dice: dim, 4-5: normal, 6: bright
 */
function getEffectivenessOpacity(diceCount: number): string {
  if (diceCount >= 6) return 'opacity-100';
  if (diceCount >= 4) return 'opacity-80';
  return 'opacity-60';
}

/**
 * ApproachChips - Four approach buttons with stat icons and dice indicators.
 * Subtle color tint based on stat dice count for effectiveness hint.
 */
export function ApproachChips({ onSelect, stats }: ApproachChipsProps) {
  return (
    <div className="flex gap-3 p-3" data-testid="approach-chips">
      {APPROACH_CONFIG.map(({ approach, label, Icon, borderColor, textColor }) => {
        const diceCount = stats[approach]?.dice.length ?? 2;
        const opacity = getEffectivenessOpacity(diceCount);

        return (
          <button
            key={approach}
            data-testid={`approach-chip-${approach}`}
            onClick={() => onSelect(approach)}
            className={`
              flex items-center gap-2 rounded-lg px-4 py-3
              bg-gray-800 border ${borderColor} ${opacity}
              hover:bg-gray-700 transition-all duration-200 cursor-pointer
            `}
          >
            <Icon className={`w-4 h-4 ${textColor}`} />
            <span className="text-sm text-gray-200">{label}</span>
            <span className="text-xs text-gray-400">({diceCount}d6)</span>
          </button>
        );
      })}
    </div>
  );
}
