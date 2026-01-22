import type { AvailableAction, Die } from '@/types/game';
import { DieIcon } from '@/components/DicePool/DieIcon';

interface ActionCardProps {
  action: AvailableAction;
  assignedDice: Die[];
  onAssign: () => void;
  onUnassign: (dieId: string) => void;
  isAvailable: boolean;
  hasSelectedDie: boolean;
}

/**
 * ActionCard - Displays an available action with its assigned dice.
 *
 * Players can:
 * - Click the card to assign their selected die
 * - Click an assigned die to unassign it back to the pool
 *
 * Visual states:
 * - Unavailable: opacity-50, cursor-not-allowed, lock icon
 * - Has selected die: subtle amber border hint
 * - Assigned dice: row of small DieIcon components
 */
export function ActionCard({
  action,
  assignedDice,
  onAssign,
  onUnassign,
  isAvailable,
  hasSelectedDie,
}: ActionCardProps) {
  const canAssign = isAvailable && hasSelectedDie;
  const totalDiceNeeded = action.diceCost;
  const diceAssigned = assignedDice.length;
  const isFree = action.diceCost === 0;

  const handleCardClick = () => {
    if (canAssign) {
      onAssign();
    }
  };

  const handleDieClick = (e: React.MouseEvent, dieId: string) => {
    e.stopPropagation(); // Prevent card click
    onUnassign(dieId);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        bg-surface-light rounded-lg p-4 transition-all
        ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
        ${canAssign ? 'border-2 border-amber-500/50 cursor-pointer hover:border-amber-500' : 'border-2 border-transparent'}
        ${isAvailable && !hasSelectedDie ? 'cursor-default' : ''}
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-100">{action.name}</h3>
        {!isAvailable && (
          <span className="text-gray-500" aria-label="Locked">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 mt-1">{action.description}</p>

      {/* Requirement hint when unavailable */}
      {!isAvailable && action.requirementHint && (
        <p className="text-xs text-amber-400 mt-2 italic">{action.requirementHint}</p>
      )}

      {/* Cost and assigned dice */}
      <div className="flex items-center justify-between mt-3">
        {/* Cost indicator */}
        <span className="text-xs text-gray-500">
          {isFree ? 'Free' : `Cost: ${totalDiceNeeded} ${totalDiceNeeded === 1 ? 'die' : 'dice'}`}
          {!isFree && diceAssigned > 0 && ` (${diceAssigned}/${totalDiceNeeded})`}
        </span>

        {/* Assigned dice */}
        {assignedDice.length > 0 && (
          <div className="flex gap-1">
            {assignedDice.map((die) => (
              <button
                key={die.id}
                onClick={(e) => handleDieClick(e, die.id)}
                className="hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400 rounded"
                aria-label={`Unassign ${die.type} showing ${die.value}`}
              >
                <DieIcon type={die.type} value={die.value} size="sm" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
