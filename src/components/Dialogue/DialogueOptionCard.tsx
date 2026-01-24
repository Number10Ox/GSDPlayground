import { Lightbulb, Hand, Heart, Cross, AlertTriangle } from 'lucide-react';
import type { DialogueOption } from '@/types/dialogue';
import type { StatName } from '@/types/character';

const STAT_ICONS: Record<StatName, typeof Lightbulb> = {
  acuity: Lightbulb,
  body: Hand,
  heart: Heart,
  will: Cross,
};

const TONE_COLORS: Record<string, string> = {
  compassionate: 'text-blue-400',
  authoritative: 'text-amber-400',
  inquisitive: 'text-cyan-400',
  confrontational: 'text-red-400',
  gentle: 'text-green-400',
  stern: 'text-orange-400',
};

interface DialogueOptionCardProps {
  option: DialogueOption;
  onSelect: (option: DialogueOption) => void;
  disabled?: boolean;
}

/**
 * DialogueOptionCard - A single player voice option shown during SELECTING_OPTION phase.
 * Shows the Dog's words, stat icon, tone, and risk/conviction indicators.
 */
export function DialogueOptionCard({ option, onSelect, disabled }: DialogueOptionCardProps) {
  const Icon = STAT_ICONS[option.associatedStat];
  const toneColor = TONE_COLORS[option.tone] ?? 'text-gray-400';

  return (
    <button
      data-testid={`dialogue-option-${option.id}`}
      onClick={() => onSelect(option)}
      disabled={disabled}
      className={`w-full text-left rounded-lg p-3 transition-colors border cursor-pointer ${
        option.risky
          ? 'bg-gray-800 border-amber-700/50 hover:border-amber-500'
          : option.convictionAligned
            ? 'bg-gray-800 border-purple-700/30 hover:border-purple-500'
            : 'bg-gray-800 border-gray-600 hover:border-gray-400'
      }`}
    >
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs ${toneColor}`}>{option.tone}</span>
            {option.risky && (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                {option.riskDescription ?? 'Risky'}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-200 italic leading-snug">
            "{option.text}"
          </p>
        </div>
      </div>
    </button>
  );
}
