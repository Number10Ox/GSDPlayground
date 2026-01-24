import { useState } from 'react';
import { Lightbulb, Hand, Heart, Cross } from 'lucide-react';
import { CONVICTION_SEEDS } from '@/data/convictionSeeds';
import type { ConvictionSeed, ConvictionCategory } from '@/types/conviction';
import type { StatName } from '@/types/character';

const STAT_ICONS: Record<StatName, typeof Lightbulb> = {
  acuity: Lightbulb,
  body: Hand,
  heart: Heart,
  will: Cross,
};

const CATEGORY_LABELS: Record<ConvictionCategory, string> = {
  mercy: 'Mercy',
  justice: 'Justice',
  faith: 'Faith',
  community: 'Community',
  duty: 'Duty',
  truth: 'Truth',
};

const REQUIRED_CONVICTIONS = 3;

interface ConvictionPickerProps {
  onConfirm: (selections: { seed: ConvictionSeed; editedText: string }[]) => void;
  onBack: () => void;
}

/**
 * ConvictionPicker - Character creation step where the player
 * selects 3 convictions from seeds or writes custom ones.
 */
export function ConvictionPicker({ onConfirm, onBack }: ConvictionPickerProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const selected = CONVICTION_SEEDS.filter(s => selectedIds.has(s.id));

  function toggleSeed(seed: ConvictionSeed) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(seed.id)) {
        next.delete(seed.id);
      } else if (next.size < REQUIRED_CONVICTIONS) {
        next.add(seed.id);
      }
      return next;
    });
  }

  function handleEditText(id: string, text: string) {
    setEditedTexts(prev => ({ ...prev, [id]: text }));
  }

  function handleConfirm() {
    const selections = selected.map(seed => ({
      seed,
      editedText: (editedTexts[seed.id]?.trim() || '') || seed.text,
    }));
    onConfirm(selections);
  }

  // Group seeds by category
  const categories = [...new Set(CONVICTION_SEEDS.map(s => s.category))] as ConvictionCategory[];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-gray-300 text-sm font-medium">What Do You Believe?</p>
        <p className="text-gray-500 text-xs mt-1">
          Choose {REQUIRED_CONVICTIONS} convictions. These beliefs will be tested on the road ahead.
        </p>
        <p className={`text-sm font-bold mt-2 ${
          selectedIds.size === REQUIRED_CONVICTIONS ? 'text-green-400' : 'text-amber-400'
        }`}>
          {REQUIRED_CONVICTIONS - selectedIds.size} remaining
        </p>
      </div>

      <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
        {categories.map(category => {
          const seeds = CONVICTION_SEEDS.filter(s => s.category === category);
          return (
            <div key={category}>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 px-1">
                {CATEGORY_LABELS[category]}
              </p>
              <div className="space-y-1.5">
                {seeds.map(seed => {
                  const isSelected = selectedIds.has(seed.id);
                  const canSelect = selectedIds.size < REQUIRED_CONVICTIONS || isSelected;
                  const Icon = STAT_ICONS[seed.associatedStat];
                  const isEditing = editingId === seed.id;
                  const displayText = editedTexts[seed.id] || seed.text;

                  return (
                    <div key={seed.id} className="flex items-stretch gap-1.5">
                      <button
                        data-testid={`conviction-seed-${seed.id}`}
                        onClick={() => toggleSeed(seed)}
                        disabled={!canSelect}
                        className={`flex-1 text-left rounded-lg p-3 transition-colors border ${
                          isSelected
                            ? 'bg-amber-900/30 border-amber-500'
                            : canSelect
                              ? 'bg-gray-800 border-gray-600 hover:border-amber-500'
                              : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className={`text-sm ${isSelected ? 'text-gray-100' : 'text-gray-300'}`}>
                            {displayText}
                          </span>
                        </div>
                      </button>

                      {isSelected && (
                        <button
                          onClick={() => setEditingId(isEditing ? null : seed.id)}
                          className="px-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 hover:text-gray-200 text-xs transition-colors"
                          title="Edit wording"
                        >
                          ✎
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Inline editor */}
              {seeds.some(s => editingId === s.id) && (
                <div className="mt-2 ml-6">
                  <input
                    type="text"
                    value={editedTexts[editingId!] || CONVICTION_SEEDS.find(s => s.id === editingId)?.text || ''}
                    onChange={(e) => handleEditText(editingId!, e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') setEditingId(null); }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected summary */}
      {selected.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <p className="text-gray-500 text-xs mb-2">Your convictions:</p>
          {selected.map(seed => (
            <p key={seed.id} className="text-amber-300 text-xs italic ml-2">
              "{editedTexts[seed.id] || seed.text}"
            </p>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-2 text-gray-400 hover:text-gray-200 text-sm transition-colors border border-gray-700 rounded-lg"
        >
          Back
        </button>
        <button
          data-testid="conviction-confirm"
          onClick={handleConfirm}
          disabled={selectedIds.size !== REQUIRED_CONVICTIONS}
          className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
            selectedIds.size === REQUIRED_CONVICTIONS
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          These Are My Beliefs
        </button>
      </div>
    </div>
  );
}
