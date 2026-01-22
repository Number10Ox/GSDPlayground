import { useCharacter } from '@/hooks/useCharacter';
import { StatDisplay } from './StatDisplay';
import { TraitList } from './TraitList';
import { InventoryPanel } from './InventoryPanel';
import type { StatName } from '@/types/character';
import type { DieType } from '@/types/game';

/**
 * CharacterSheet - Full character view showing all stats, traits, inventory, and relationships.
 *
 * Displays:
 * - Name and background
 * - All four stats with StatDisplay
 * - Traits with dice notation
 * - Inventory items with category and dice
 * - Relationships with NPC names and dice
 */
export function CharacterSheet() {
  const { character } = useCharacter();

  if (!character) {
    return (
      <div data-testid="character-sheet" className="bg-surface rounded-lg p-6 text-center">
        <p className="text-gray-400">No character created</p>
      </div>
    );
  }

  const statOrder: StatName[] = ['acuity', 'body', 'heart', 'will'];

  return (
    <div data-testid="character-sheet" className="bg-surface rounded-lg p-6 space-y-6 max-w-md">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-100">{character.name}</h2>
        <p className="text-sm text-gray-400 capitalize">
          {character.background.replace(/-/g, ' ')}
        </p>
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Stats
        </h3>
        <div className="space-y-1">
          {statOrder.map((name) => (
            <StatDisplay key={name} stat={character.stats[name]} />
          ))}
        </div>
      </div>

      {/* Traits */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Traits
        </h3>
        <TraitList traits={character.traits} />
      </div>

      {/* Inventory */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Inventory
        </h3>
        <InventoryPanel items={character.inventory} />
      </div>

      {/* Relationships */}
      {character.relationships.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Relationships
          </h3>
          <div className="space-y-2">
            {character.relationships.map((rel) => (
              <div key={rel.id} className="flex items-center justify-between">
                <span className="text-gray-200 text-sm">{rel.npcName}</span>
                <span className="text-gray-400 text-xs">{formatDice(rel.dice)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Format dice array to notation like "1d6+1d4" */
function formatDice(dice: { type: DieType }[]): string {
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
