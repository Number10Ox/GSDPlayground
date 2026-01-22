import type { AvailableAction, Die, LocationId } from '@/types/game';
import { ActionCard } from './ActionCard';

interface ActionListProps {
  actions: AvailableAction[];
  dicePool: Die[];
  currentLocation: LocationId;
  selectedDieId: string | null;
  onAssign: (actionId: string) => void;
  onUnassign: (dieId: string) => void;
}

/**
 * ActionList - Container for available actions at the current location.
 *
 * Filters actions to show:
 * - Actions specific to current location
 * - Actions with locationId: null (available anywhere)
 *
 * Passes assigned dice to each ActionCard by filtering
 * dicePool where assignedTo matches action.id
 */
export function ActionList({
  actions,
  dicePool,
  currentLocation,
  selectedDieId,
  onAssign,
  onUnassign,
}: ActionListProps) {
  // Filter actions for current location or global (null)
  const visibleActions = actions.filter(
    (action) => action.locationId === null || action.locationId === currentLocation
  );

  // Check if a die is currently selected
  const hasSelectedDie = selectedDieId !== null;

  if (visibleActions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No actions available here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {visibleActions.map((action) => {
        // Get dice assigned to this action
        const assignedDice = dicePool.filter((die) => die.assignedTo === action.id);

        return (
          <ActionCard
            key={action.id}
            action={action}
            assignedDice={assignedDice}
            onAssign={() => onAssign(action.id)}
            onUnassign={onUnassign}
            isAvailable={action.available}
            hasSelectedDie={hasSelectedDie}
          />
        );
      })}
    </div>
  );
}
