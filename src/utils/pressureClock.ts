import type { PressureClock, PressureThreshold } from '@/types/pressure';
import type { UnlockCondition } from '@/types/actions';
import type { ConflictOutcome } from '@/types/conflict';
import type { ConflictDefinition } from '@/types/actions';

/**
 * Result of advancing the pressure clock.
 */
export interface PressureAdvanceResult {
  newClock: PressureClock;
  triggeredThresholds: PressureThreshold[];
  overflowed: boolean;  // True if clock reached max (8/8) — triggers sin escalation
}

/**
 * advancePressure - Advance the pressure clock and return triggered thresholds.
 * When clock reaches max (8), sets overflowed flag for sin escalation.
 */
export function advancePressure(clock: PressureClock, amount: number): PressureAdvanceResult {
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
  pressureFilled: number;
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
    case 'pressure_min':
      return context.pressureFilled >= condition.value;
    case 'pressure_max':
      return context.pressureFilled <= condition.value;
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
 * calculateConflictPressureCost - Determine how many pressure ticks a conflict outcome costs.
 *
 * @param outcome - How the conflict ended
 * @param escalationsJumped - Number of escalation levels jumped during conflict (0+)
 * @param hadFallout - Whether non-NONE fallout was taken
 * @param definition - The conflict definition with cost multipliers
 */
export function calculateConflictPressureCost(
  outcome: ConflictOutcome,
  escalationsJumped: number,
  hadFallout: boolean,
  definition: ConflictDefinition
): number {
  let cost = 0;

  if (outcome === 'PLAYER_GAVE') {
    cost += definition.pressureCost.onGive;
  }

  cost += definition.pressureCost.onEscalate * escalationsJumped;

  if (hadFallout) {
    cost += definition.pressureCost.onFallout;
  }

  return cost;
}
