import { motion } from 'framer-motion';
import type { Die } from '@/types/game';
import { DieIcon } from './DieIcon';

interface DieComponentProps {
  die: Die;
  isSelected: boolean;
  isFocused: boolean;
  onSelect: () => void;
}

/**
 * DieComponent - Individual die button wrapper with selection and focus states.
 *
 * Uses Framer Motion with layoutId for future animation support
 * (dice will animate to actions in Plan 04).
 *
 * Accessibility:
 * - role="option" for listbox pattern
 * - aria-selected for selection state
 * - aria-label describes die type and value
 * - Visual focus ring on keyboard navigation
 */
export function DieComponent({ die, isSelected, isFocused, onSelect }: DieComponentProps) {
  return (
    <motion.button
      layoutId={die.id}
      layout
      initial={false}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onClick={onSelect}
      role="option"
      aria-selected={isSelected}
      aria-label={`${die.type} showing ${die.value}`}
      tabIndex={-1}
      data-testid="die"
      data-die-id={die.id}
      data-die-type={die.type}
      data-die-value={die.value}
      data-selected={isSelected}
      className={`
        relative p-1 rounded-lg transition-all duration-150
        focus:outline-none
        ${isSelected ? 'scale-110 ring-2 ring-amber-400 bg-amber-400/20' : ''}
        ${isFocused && !isSelected ? 'ring-2 ring-amber-400/60' : ''}
        ${!isSelected && !isFocused ? 'hover:bg-white/10' : ''}
      `}
    >
      <DieIcon type={die.type} value={die.value} size="md" />
    </motion.button>
  );
}
