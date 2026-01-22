import { useCharacter } from '@/hooks/useCharacter';
import { useGameState } from '@/hooks/useGameState';
import { StatDisplay } from '@/components/Character/StatDisplay';
import type { StatName } from '@/types/character';

interface CharacterInfoProps {
  onCreateCharacter?: () => void;
}

/**
 * CharacterInfo - Sidebar widget showing character stats and cycle info.
 *
 * When character exists: shows name, all four stats (compact mode), cycle number, condition.
 * When character is null: shows "Create Character" prompt.
 */
export function CharacterInfo({ onCreateCharacter }: CharacterInfoProps) {
  const { character } = useCharacter();
  const { state } = useGameState();

  const statOrder: StatName[] = ['acuity', 'body', 'heart', 'will'];

  if (!character) {
    return (
      <div data-testid="character-info" className="bg-surface rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2">
          Your Dog
        </h3>
        <p className="text-gray-400 text-sm">No character yet.</p>
        <button
          data-testid="create-character-button"
          onClick={onCreateCharacter}
          className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Create Character
        </button>
      </div>
    );
  }

  // Condition color based on value
  const conditionColor =
    state.characterCondition >= 75
      ? 'text-green-400'
      : state.characterCondition >= 50
        ? 'text-amber-400'
        : state.characterCondition >= 25
          ? 'text-orange-400'
          : 'text-red-400';

  return (
    <div data-testid="character-info" className="bg-surface rounded-lg p-4 space-y-3">
      <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2">
        {character.name}
      </h3>

      {/* Stats - compact mode */}
      <div className="space-y-0">
        {statOrder.map((name) => (
          <StatDisplay key={name} stat={character.stats[name]} compact />
        ))}
      </div>

      {/* Cycle and condition info */}
      <div className="border-t border-gray-700 pt-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Cycle</span>
          <span className="text-amber-400 font-medium text-sm">Day {state.cycleNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Condition</span>
          <span className={`font-medium text-sm ${conditionColor}`}>
            {state.characterCondition}%
          </span>
        </div>
      </div>

      {/* View full sheet link */}
      <button className="w-full text-sm text-gray-400 hover:text-gray-200 transition-colors pt-2 border-t border-gray-700">
        View Character Sheet
      </button>
    </div>
  );
}
