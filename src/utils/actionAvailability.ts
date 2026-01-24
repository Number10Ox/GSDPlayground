import type { LocationId } from '@/types/game';
import type { TimedAction, ConflictDefinition, UnlockCondition } from '@/types/actions';
import type { TownData } from '@/types/town';
import type { InvestigationState } from '@/types/investigation';
import type { DescentClock } from '@/types/descent';

/**
 * Context needed to evaluate unlock conditions and filter available actions.
 */
export interface ActionContext {
  descentClock: DescentClock;
  investigationState: InvestigationState;
  npcTrust: Record<string, number>; // npcId -> trust level
  completedActionIds: string[];
}

/**
 * AvailableActions - The filtered set of actions available at a location.
 */
export interface AvailableActions {
  timed: { action: TimedAction; locked: boolean; lockReason?: string }[];
  conflicts: { definition: ConflictDefinition; locked: boolean; lockReason?: string }[];
}

/**
 * isUnlocked - Evaluates an unlock condition against the current game context.
 */
export function isUnlocked(condition: UnlockCondition | undefined, context: ActionContext): boolean {
  if (!condition) return true;

  switch (condition.type) {
    case 'descent_min':
      return context.descentClock.filled >= condition.value;
    case 'descent_max':
      return context.descentClock.filled <= condition.value;
    case 'sin_discovered':
      return context.investigationState.sinProgression.some(
        s => s.id === condition.sinId && s.discovered
      );
    case 'clue_found':
      return context.investigationState.clues.some(
        c => c.id === condition.clueId && c.found
      );
    case 'trust_min':
      return (context.npcTrust[condition.npcId] ?? 0) >= condition.value;
    default:
      return true;
  }
}

/**
 * getLockReason - Human-readable description of why an action is locked.
 */
function getLockReason(condition: UnlockCondition): string {
  switch (condition.type) {
    case 'descent_min':
      return `Requires descent ${condition.value}+`;
    case 'descent_max':
      return `Requires descent ${condition.value} or below`;
    case 'sin_discovered':
      return 'Requires discovery';
    case 'clue_found':
      return 'Requires a clue';
    case 'trust_min':
      return `Requires trust ${condition.value}+`;
    default:
      return 'Locked';
  }
}

/**
 * getAvailableActions - Determines which actions are available at a location.
 * Returns free, timed, and conflict actions with lock status.
 */
export function getAvailableActions(
  locationId: LocationId,
  town: TownData,
  context: ActionContext
): AvailableActions {
  // Timed actions at this location (filter out completed one-shots)
  const timed = (town.timedActions ?? [])
    .filter(a => a.locationId === locationId)
    .filter(a => !a.oneShot || !context.completedActionIds.includes(a.id))
    .map(action => {
      const locked = !isUnlocked(action.unlockCondition, context);
      return {
        action,
        locked,
        lockReason: locked && action.unlockCondition
          ? getLockReason(action.unlockCondition)
          : undefined,
      };
    });

  // Conflicts at this location
  const conflicts = (town.conflictDefinitions ?? [])
    .filter(d => d.locationId === locationId)
    .map(definition => {
      const locked = !isUnlocked(definition.unlockCondition, context);
      return {
        definition,
        locked,
        lockReason: locked && definition.unlockCondition
          ? getLockReason(definition.unlockCondition)
          : undefined,
      };
    });

  return { timed, conflicts };
}
