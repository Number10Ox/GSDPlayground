import { Target } from 'lucide-react';
import type { Item, ItemCategory } from '@/types/character';
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
 * Category badge styling
 */
const categoryStyles: Record<ItemCategory, { bg: string; text: string; label: string }> = {
  normal: { bg: 'bg-gray-700', text: 'text-gray-300', label: 'Normal' },
  big: { bg: 'bg-blue-900', text: 'text-blue-300', label: 'Big' },
  excellent: { bg: 'bg-green-900', text: 'text-green-300', label: 'Excellent' },
  'big-excellent': { bg: 'bg-emerald-900', text: 'text-emerald-300', label: 'Big & Excellent' },
  crap: { bg: 'bg-red-900', text: 'text-red-300', label: 'Crap' },
};

interface InventoryPanelProps {
  items: Item[];
}

/**
 * InventoryPanel - Displays the player's inventory items with categories and dice.
 *
 * Each item shows:
 * - Name
 * - Category badge (colored by quality)
 * - Dice notation with colored dots
 * - Gun indicator (target icon for firearms)
 */
export function InventoryPanel({ items }: InventoryPanelProps) {
  if (items.length === 0) {
    return (
      <div data-testid="inventory-panel" className="p-4 text-gray-500 text-sm italic">
        No items
      </div>
    );
  }

  return (
    <div data-testid="inventory-panel" className="space-y-2">
      {items.map((item) => {
        const category = categoryStyles[item.category];
        return (
          <div
            key={item.id}
            data-testid={`item-${item.id}`}
            className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
          >
            {/* Gun indicator */}
            {item.isGun && (
              <Target className="w-4 h-4 text-red-400 flex-shrink-0" aria-label="Firearm" />
            )}

            {/* Item name */}
            <span className="text-gray-100 font-medium flex-1 min-w-0 truncate">
              {item.name}
            </span>

            {/* Category badge */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${category.bg} ${category.text} flex-shrink-0`}
            >
              {category.label}
            </span>

            {/* Dice indicators */}
            <div className="flex gap-1 flex-shrink-0">
              {item.dice.map((die) => (
                <span
                  key={die.id}
                  className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white ${dieColorClasses[die.type]}`}
                  title={die.type}
                >
                  {die.type.slice(1)}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
