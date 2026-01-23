/**
 * Playability Validator
 *
 * Validates structural integrity of a generated town and composes
 * all validators into a single validateTown() function.
 *
 * Structural checks:
 * 1. All NPC locationIds reference valid locations
 * 2. All TopicRule npcId/locationId references are valid
 * 3. Location connection graph is connected (BFS from first location)
 * 4. Topic rules cover all sin levels (every sin has a discovery rule)
 *
 * The composed validateTown() runs all three validators and merges results.
 */

import type { TownData } from '@/types/town';
import type { ValidationError, ValidationResult } from '@/generators/validators/sinChainValidator';
import { validateSinChainDiscoverable } from '@/generators/validators/sinChainValidator';
import { validateNPCStakes } from '@/generators/validators/npcStakesValidator';

/**
 * Validates structural playability of a town.
 *
 * Checks:
 * 1. All NPC locationIds exist in town.locations
 * 2. All LocationTopicRule npcId/locationId references are valid
 * 3. Location connection graph is connected (all locations reachable from first)
 * 4. Every sin has at least one discovery topic rule referencing it
 *
 * @param town - Complete TownData to validate
 * @returns ValidationResult with structural errors and warnings
 */
export function validatePlayability(town: TownData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const locationIds = new Set(town.locations.map(l => l.id));
  const npcIds = new Set(town.npcs.map(n => n.id));

  // Check 1: All NPC locationIds reference valid locations
  for (const npc of town.npcs) {
    if (!locationIds.has(npc.locationId)) {
      errors.push({
        type: 'invalid-npc-location',
        message: `NPC "${npc.name}" (${npc.id}) references location "${npc.locationId}" which does not exist in town.locations.`,
        npcId: npc.id,
      });
    }
  }

  // Check 2: All TopicRule npcId/locationId references are valid
  for (const rule of town.topicRules) {
    if (rule.kind === 'location') {
      if (!npcIds.has(rule.npcId)) {
        errors.push({
          type: 'invalid-topic-npc',
          message: `Location topic rule "${rule.label}" references NPC "${rule.npcId}" which does not exist.`,
        });
      }
      if (!locationIds.has(rule.locationId)) {
        errors.push({
          type: 'invalid-topic-location',
          message: `Location topic rule "${rule.label}" references location "${rule.locationId}" which does not exist.`,
        });
      }
    }
  }

  // Check 3: Location connection graph is connected
  // BFS from first location using the connections array
  if (town.locations.length > 0) {
    const visited = new Set<string>();
    const queue = [town.locations[0].id];
    visited.add(town.locations[0].id);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const current = town.locations.find(l => l.id === currentId);
      if (!current) continue;

      for (const connId of current.connections) {
        if (!visited.has(connId)) {
          visited.add(connId);
          queue.push(connId);
        }
      }
    }

    for (const location of town.locations) {
      if (!visited.has(location.id)) {
        errors.push({
          type: 'disconnected-location',
          message: `Location "${location.name}" (${location.id}) is not reachable from the starting location. Players cannot navigate there.`,
        });
      }
    }
  }

  // Check 4: Topic rules cover all sin levels
  // Every sin should have at least one discovery rule that references it
  const coveredSinIds = new Set<string>();
  for (const rule of town.topicRules) {
    if (rule.kind === 'discovery') {
      for (const sinId of rule.requiredSinIds) {
        coveredSinIds.add(sinId);
      }
    }
  }

  for (const sin of town.sinChain) {
    if (!coveredSinIds.has(sin.id)) {
      errors.push({
        type: 'uncovered-sin',
        message: `Sin "${sin.name}" (${sin.id}) has no discovery topic rule referencing it. Players cannot unlock conversations about this sin.`,
        sinId: sin.id,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Runs all validators and merges results into a single ValidationResult.
 *
 * Composes:
 * 1. validateSinChainDiscoverable - Sin chain reachability and cycles
 * 2. validateNPCStakes - NPC stakes and connectivity
 * 3. validatePlayability - Structural integrity
 *
 * A town is valid only if ALL three validators pass with zero errors.
 *
 * @param town - Complete TownData to validate
 * @returns Merged ValidationResult from all validators
 */
export function validateTown(town: TownData): ValidationResult {
  const sinChainResult = validateSinChainDiscoverable(town);
  const npcStakesResult = validateNPCStakes(town);
  const playabilityResult = validatePlayability(town);

  const allErrors = [
    ...sinChainResult.errors,
    ...npcStakesResult.errors,
    ...playabilityResult.errors,
  ];

  const allWarnings = [
    ...sinChainResult.warnings,
    ...npcStakesResult.warnings,
    ...playabilityResult.warnings,
  ];

  return {
    valid: sinChainResult.valid && npcStakesResult.valid && playabilityResult.valid,
    errors: allErrors,
    warnings: allWarnings,
  };
}
