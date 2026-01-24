import type { DescentClock, DescentThreshold } from '@/types/descent';
import type { UnlockCondition } from '@/types/actions';
import type { ConflictOutcome } from '@/types/conflict';
import type { ConflictDefinition } from '@/types/actions';

/**
 * Result of advancing the descent clock.
 */
export interface DescentAdvanceResult {
  newClock: DescentClock;
  triggeredThresholds: DescentThreshold[];
  overflowed: boolean;  // True if clock reached max (8/8) — triggers sin escalation
}

/**
 * advanceDescent - Advance the descent clock and return triggered thresholds.
 * When clock reaches max (8), sets overflowed flag for sin escalation.
 */
export function advanceDescent(clock: DescentClock, amount: number): DescentAdvanceResult {
  const newFilled = Math.min(clock.segments, clock.filled + amount);
  const overflowed = newFilled >= clock.segments;

  // Find thresholds that should fire (crossed by this advancement, not already fired)
  const triggeredThresholds = clock.thresholds.filter(
    t => !t.fired && t.at > clock.filled && t.at <= newFilled
  );

  // Mark triggered thresholds as fired
  const updatedThresholds = clock.thresholds.map(t =>
    triggeredThresholds.includes(t) ? { ...t, fired: true } : t
  );

  return {
    newClock: {
      ...clock,
      filled: overflowed ? 0 : newFilled,  // Reset on overflow
      thresholds: overflowed
        ? updatedThresholds.map(t => ({ ...t, fired: false }))  // Reset all on overflow
        : updatedThresholds,
    },
    triggeredThresholds,
    overflowed,
  };
}

/**
 * Context needed to evaluate unlock conditions.
 */
export interface UnlockContext {
  descentFilled: number;
  discoveredSinIds: string[];
  foundClueIds: string[];
  npcTrustLevels: Map<string, number>;
}

/**
 * checkUnlockCondition - Evaluate whether a condition is met.
 */
export function checkUnlockCondition(
  condition: UnlockCondition,
  context: UnlockContext
): boolean {
  switch (condition.type) {
    case 'descent_min':
      return context.descentFilled >= condition.value;
    case 'descent_max':
      return context.descentFilled <= condition.value;
    case 'sin_discovered':
      return context.discoveredSinIds.includes(condition.sinId);
    case 'clue_found':
      return context.foundClueIds.includes(condition.clueId);
    case 'trust_min': {
      const trust = context.npcTrustLevels.get(condition.npcId) ?? 0;
      return trust >= condition.value;
    }
    default:
      return false;
  }
}

/**
 * calculateConflictDescentCost - Determine how many descent ticks a conflict outcome costs.
 *
 * @param outcome - How the conflict ended
 * @param escalationsJumped - Number of escalation levels jumped during conflict (0+)
 * @param hadFallout - Whether non-NONE fallout was taken
 * @param definition - The conflict definition with cost multipliers
 */
export function calculateConflictDescentCost(
  outcome: ConflictOutcome,
  escalationsJumped: number,
  hadFallout: boolean,
  definition: ConflictDefinition
): number {
  let cost = 0;

  if (outcome === 'PLAYER_GAVE') {
    cost += definition.descentCost.onGive;
  }

  cost += definition.descentCost.onEscalate * escalationsJumped;

  if (hadFallout) {
    cost += definition.descentCost.onFallout;
  }

  return cost;
}
