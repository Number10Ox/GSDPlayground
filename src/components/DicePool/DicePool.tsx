import { useState, useRef, useCallback } from 'react';
import type { Die } from '@/types/game';
import { DieComponent } from './DieComponent';

interface DicePoolProps {
  dice: Die[];
  selectedDieId: string | null;
  onSelect: (dieId: string) => void;
}

/**
 * DicePool - Container for dice with keyboard navigation using ARIA listbox pattern.
 *
 * Keyboard interaction:
 * - Arrow Left/Right: Navigate between dice
 * - Arrow Up/Down: Also navigate (for accessibility)
 * - Enter/Space: Select focused die
 * - Home: Jump to first die
 * - End: Jump to last die
 *
 * Accessibility:
 * - role="listbox" with aria-label
 * - aria-activedescendant tracks focused die
 * - Single tab stop for entire pool (tabIndex={0} on container)
 * - Each die uses role="option"
 */
export function DicePool({ dice, selectedDieId, onSelect }: DicePoolProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const poolRef = useRef<HTMLDivElement>(null);

  // Keep focused index in bounds when dice array changes
  const safeFocusedIndex = Math.min(focusedIndex, Math.max(0, dice.length - 1));

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (dice.length === 0) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + 1, dice.length - 1));
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - 1, 0));
          break;

        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;

        case 'End':
          e.preventDefault();
          setFocusedIndex(dice.length - 1);
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          if (dice[safeFocusedIndex]) {
            onSelect(dice[safeFocusedIndex].id);
          }
          break;
      }
    },
    [dice, safeFocusedIndex, onSelect]
  );

  // Empty state
  if (dice.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 bg-surface rounded-lg text-gray-500">
        No dice in pool
      </div>
    );
  }

  return (
    <div
      ref={poolRef}
      role="listbox"
      aria-label="Dice pool"
      aria-activedescendant={dice[safeFocusedIndex]?.id}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="
        flex gap-2 p-4 bg-surface rounded-lg
        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
      "
    >
      {dice.map((die, index) => (
        <DieComponent
          key={die.id}
          die={die}
          isSelected={die.id === selectedDieId}
          isFocused={index === safeFocusedIndex}
          onSelect={() => onSelect(die.id)}
        />
      ))}
    </div>
  );
}
