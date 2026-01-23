/**
 * TownSelection - Atmospheric town selection screen.
 *
 * Displays all available towns as cards with key info:
 * town name, description, sin chain depth, and NPC count.
 * Players choose which town to investigate before gameplay begins.
 */

import { ALL_TOWNS } from '@/data/towns';
import type { TownData } from '@/types/town';

interface TownSelectionProps {
  onSelectTown: (town: TownData) => void;
}

/**
 * Renders a visual indicator of sin chain depth.
 * Filled segments show chain length, empty show remaining to max.
 */
function CorruptionIndicator({ depth }: { depth: number }) {
  const maxDepth = 7;
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-stone-400 mr-1">Corruption:</span>
      <div className="flex gap-0.5">
        {Array.from({ length: maxDepth }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-4 rounded-sm ${
              i < depth
                ? 'bg-gradient-to-t from-red-700 to-amber-500'
                : 'bg-stone-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function TownSelection({ onSelectTown }: TownSelectionProps) {
  return (
    <div
      data-testid="town-selection"
      className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-6"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-serif text-amber-100 mb-3">
          The Road Ahead
        </h1>
        <p className="text-stone-400 max-w-lg mx-auto leading-relaxed">
          The Faithful send word of towns in need. As a Dog of the King of Life,
          you ride where doctrine falters and sin takes root. Choose your
          destination.
        </p>
      </div>

      {/* Town Cards */}
      <div className="flex flex-col lg:flex-row gap-6 max-w-5xl w-full">
        {ALL_TOWNS.map((town) => (
          <div
            key={town.id}
            data-testid={`town-card-${town.id}`}
            className="flex-1 bg-stone-800 border border-stone-600 rounded-lg p-6
                       hover:border-amber-500 transition-colors duration-200
                       flex flex-col justify-between"
          >
            {/* Town Info */}
            <div>
              <h2 className="text-2xl font-serif text-amber-50 mb-2">
                {town.name}
              </h2>
              <p className="text-stone-300 text-sm leading-relaxed mb-4">
                {town.description}
              </p>

              {/* Stats */}
              <div className="space-y-2 mb-6">
                <CorruptionIndicator depth={town.sinChain.length} />
                <div className="text-xs text-stone-400">
                  <span className="text-stone-300">{town.npcs.length}</span>{' '}
                  {town.npcs.length === 1 ? 'soul' : 'souls'}
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              data-testid={`select-town-${town.id}`}
              onClick={() => onSelectTown(town)}
              className="w-full py-2 px-4 bg-stone-700 border border-stone-500
                         text-amber-100 font-serif rounded
                         hover:bg-stone-600 hover:border-amber-500
                         transition-colors duration-200"
            >
              Enter Town
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
