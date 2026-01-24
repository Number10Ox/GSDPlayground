import type { LocationId } from '@/types/game';
import type { TownData } from '@/types/town';
import type { TimedAction, ConflictDefinition } from '@/types/actions';
import type { EscalationLevel } from '@/types/conflict';
import { ESCALATION_ORDER } from '@/types/conflict';
import {
  getAvailableActions,
  type ActionContext,
  type FreeAction,
} from '@/utils/actionAvailability';

interface ActionMenuProps {
  locationId: LocationId;
  town: TownData;
  context: ActionContext;
  onFreeAction: (action: FreeAction) => void;
  onTimedAction: (action: TimedAction) => void;
  onConflict: (definition: ConflictDefinition) => void;
}

const ESCALATION_LABELS: Record<EscalationLevel, string> = {
  JUST_TALKING: 'Talking',
  PHYSICAL: 'Physical',
  FIGHTING: 'Fighting',
  GUNPLAY: 'Gunplay',
};

function getEscalationRange(min: EscalationLevel, max: EscalationLevel): string {
  if (ESCALATION_ORDER[min] === ESCALATION_ORDER[max]) {
    return ESCALATION_LABELS[min];
  }
  return `${ESCALATION_LABELS[min]} → ${ESCALATION_LABELS[max]}`;
}

export function ActionMenu({
  locationId,
  town,
  context,
  onFreeAction,
  onTimedAction,
  onConflict,
}: ActionMenuProps) {
  const { free, timed, conflicts } = getAvailableActions(locationId, town, context);

  return (
    <div className="bg-surface rounded-lg p-4 space-y-4" data-testid="action-menu">
      {/* Free Actions */}
      {free.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Free
          </h4>
          <div className="space-y-1">
            {free.map(action => (
              <button
                key={action.id}
                onClick={() => onFreeAction(action)}
                className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700/50 rounded transition-colors cursor-pointer"
                data-testid={`action-${action.id}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timed Actions */}
      {timed.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Actions
          </h4>
          <div className="space-y-1">
            {timed.map(({ action, locked, lockReason }) => (
              <button
                key={action.id}
                onClick={() => !locked && onTimedAction(action)}
                disabled={locked}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between ${
                  locked
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-200 hover:bg-gray-700/50 cursor-pointer'
                }`}
                data-testid={`action-${action.id}`}
              >
                <span className="flex items-center gap-2">
                  {locked && <span className="text-gray-600">🔒</span>}
                  <span>{action.name}</span>
                </span>
                <span className="text-red-400 text-xs font-mono">
                  {locked ? lockReason : `+${action.pressureCost}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Conflicts
          </h4>
          <div className="space-y-1">
            {conflicts.map(({ definition, locked, lockReason }) => (
              <button
                key={definition.id}
                onClick={() => !locked && onConflict(definition)}
                disabled={locked}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  locked
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-amber-200 hover:bg-amber-900/30 cursor-pointer'
                }`}
                data-testid={`conflict-${definition.id}`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {locked && <span className="text-gray-600">🔒</span>}
                    <span>{definition.stakes}</span>
                  </span>
                </div>
                <div className="text-xs mt-0.5">
                  {locked ? (
                    <span className="text-gray-600">{lockReason}</span>
                  ) : (
                    <span className="text-gray-500">
                      {getEscalationRange(definition.minEscalation, definition.maxEscalation)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {free.length === 0 && timed.length === 0 && conflicts.length === 0 && (
        <p className="text-gray-600 text-sm text-center py-2">No actions available here.</p>
      )}
    </div>
  );
}
