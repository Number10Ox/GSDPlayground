import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Trait, Item } from '@/types/character';
import type { Die, DieType } from '@/types/game';
import type { ConflictAction } from '@/types/conflict';
import { rollDie } from '@/utils/dice';

/**
 * Die color scheme matching DieIcon conventions
 */
const dieColorClasses: Record<DieType, string> = {
  d4: 'bg-red-600',
  d6: 'bg-amber-600',
  d8: 'bg-green-600',
  d10: 'bg-blue-600',
};

/**
 * Generate unique die ID
 */
function generateDieId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `die-${crypto.randomUUID()}`;
  }
  return `die-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Roll character dice into game dice (CharacterDie -> Die with value)
 */
function rollCharacterDice(characterDice: { id: string; type: DieType }[]): Die[] {
  return characterDice.map((cd) => ({
    id: generateDieId(),
    type: cd.type,
    value: rollDie(cd.type),
    assignedTo: null,
  }));
}

interface TraitAndItemInvocationProps {
  traits: Trait[];
  items: Item[];
  usedTraitIds: string[];
  usedItemIds: string[];
  dispatch: (action: ConflictAction) => void;
}

/**
 * TraitAndItemInvocation - Mid-conflict panel for invoking traits and using items.
 *
 * Shows available traits and items the player can invoke/use for bonus dice.
 * Each trait/item can only be used once per conflict.
 * Rolls dice automatically and dispatches INVOKE_TRAIT/USE_ITEM actions.
 *
 * Appears as a collapsible panel with framer-motion slide animation.
 */
export function TraitAndItemInvocation({
  traits,
  items,
  usedTraitIds,
  usedItemIds,
  dispatch,
}: TraitAndItemInvocationProps) {
  const usedTraitSet = useMemo(() => new Set(usedTraitIds), [usedTraitIds]);
  const usedItemSet = useMemo(() => new Set(usedItemIds), [usedItemIds]);

  const hasTraits = traits.length > 0;
  const hasItems = items.length > 0;

  if (!hasTraits && !hasItems) {
    return null;
  }

  const handleInvokeTrait = (trait: Trait) => {
    if (usedTraitSet.has(trait.id)) return;
    const rolledDice = rollCharacterDice(trait.dice);
    dispatch({
      type: 'INVOKE_TRAIT',
      traitId: trait.id,
      dice: rolledDice,
    });
  };

  const handleUseItem = (item: Item) => {
    if (usedItemSet.has(item.id)) return;
    const rolledDice = rollCharacterDice(item.dice);
    dispatch({
      type: 'USE_ITEM',
      itemId: item.id,
      dice: rolledDice,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        data-testid="trait-invocation-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="mt-4 p-3 bg-gray-900/80 rounded-lg border border-gray-700"
      >
        {/* Traits section */}
        {hasTraits && (
          <div className="mb-3">
            <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">
              Traits
            </h4>
            <div className="space-y-1">
              {traits.map((trait) => {
                const isUsed = usedTraitSet.has(trait.id);
                return (
                  <div
                    key={trait.id}
                    className={`flex items-center gap-2 p-2 rounded ${
                      isUsed ? 'opacity-40' : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="text-sm text-gray-200 flex-1 truncate">
                      {trait.name}
                    </span>

                    {/* Dice it would add */}
                    <div className="flex gap-0.5 flex-shrink-0">
                      {trait.dice.map((die) => (
                        <span
                          key={die.id}
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold text-white ${dieColorClasses[die.type]}`}
                        >
                          {die.type.slice(1)}
                        </span>
                      ))}
                    </div>

                    {isUsed ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-500 flex-shrink-0">
                        Used
                      </span>
                    ) : (
                      <button
                        data-testid={`invoke-trait-${trait.id}`}
                        onClick={() => handleInvokeTrait(trait)}
                        className="text-[11px] px-2 py-1 rounded bg-amber-700 hover:bg-amber-600 text-amber-100 font-semibold transition-colors flex-shrink-0"
                      >
                        Invoke
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items section */}
        {hasItems && (
          <div>
            <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">
              Items
            </h4>
            <div className="space-y-1">
              {items.map((item) => {
                const isUsed = usedItemSet.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 p-2 rounded ${
                      isUsed ? 'opacity-40' : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="text-sm text-gray-200 flex-1 truncate">
                      {item.name}
                    </span>

                    {/* Dice it would add */}
                    <div className="flex gap-0.5 flex-shrink-0">
                      {item.dice.map((die) => (
                        <span
                          key={die.id}
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold text-white ${dieColorClasses[die.type]}`}
                        >
                          {die.type.slice(1)}
                        </span>
                      ))}
                    </div>

                    {isUsed ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-500 flex-shrink-0">
                        Used
                      </span>
                    ) : (
                      <button
                        data-testid={`use-item-${item.id}`}
                        onClick={() => handleUseItem(item)}
                        className="text-[11px] px-2 py-1 rounded bg-green-700 hover:bg-green-600 text-green-100 font-semibold transition-colors flex-shrink-0"
                      >
                        Use
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
