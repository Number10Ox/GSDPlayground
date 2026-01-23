/**
 * NPC Stakes Validator
 *
 * Validates that NPCs in a town have meaningful stakes and connectivity.
 * Catches failure modes:
 * 1. NPCs missing knowledge entirely
 * 2. NPCs with no sin-linked facts (no stakes in any sin)
 * 3. Sins with fewer than 2 linked NPCs
 * 4. Disconnected NPCs (no shared sin assignments with any other NPC)
 * 5. NPCs with no trust-0 entry point facts
 *
 * Also warns about overly secretive NPCs (>80% high-trust facts).
 */

import type { TownData } from '@/types/town';
import type { ValidationError, ValidationResult } from '@/generators/validators/sinChainValidator';

/**
 * Validates NPC stakes and connectivity within a town.
 *
 * Checks:
 * 1. Every NPC has a knowledge object populated
 * 2. Every NPC with knowledge has at least one fact with a sinId (stakes)
 * 3. Every sin has 2+ NPCs in its linkedNpcs array
 * 4. Every NPC shares at least one sinId with at least one other NPC (connectivity)
 * 5. Every NPC with knowledge has at least one trust-0 fact (entry point)
 * 6. Warning: NPCs with >80% of facts at trust level 60+ (too secretive)
 *
 * @param town - Complete TownData to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateNPCStakes(town: TownData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check 1: Every NPC has knowledge populated
  for (const npc of town.npcs) {
    if (!npc.knowledge) {
      errors.push({
        type: 'missing-knowledge',
        message: `NPC "${npc.name}" (${npc.id}) has no knowledge object. The NPC cannot participate in conversations.`,
        npcId: npc.id,
      });
    }
  }

  // Check 2: Every NPC with knowledge has at least one sin-linked fact
  for (const npc of town.npcs) {
    if (!npc.knowledge) continue;
    const hasSinFact = npc.knowledge.facts.some(f => f.sinId !== undefined);
    if (!hasSinFact) {
      errors.push({
        type: 'no-stakes',
        message: `NPC "${npc.name}" (${npc.id}) has no facts linked to any sin. The NPC has no stakes in the investigation.`,
        npcId: npc.id,
      });
    }
  }

  // Check 3: Every sin has 2+ NPCs in its linkedNpcs array
  for (const sin of town.sinChain) {
    if (sin.linkedNpcs.length < 2) {
      errors.push({
        type: 'insufficient-npc-coverage',
        message: `Sin "${sin.name}" (${sin.id}) has only ${sin.linkedNpcs.length} linked NPC(s). At least 2 are required for meaningful investigation.`,
        sinId: sin.id,
      });
    }
  }

  // Check 4: NPC connectivity via shared sin assignments
  // For each NPC, collect all sinIds they appear in (via linkedNpcs)
  const npcToSins = new Map<string, Set<string>>();

  for (const sin of town.sinChain) {
    for (const npcId of sin.linkedNpcs) {
      if (!npcToSins.has(npcId)) {
        npcToSins.set(npcId, new Set());
      }
      npcToSins.get(npcId)!.add(sin.id);
    }
  }

  // Verify each NPC shares at least one sinId with at least one other NPC
  for (const npc of town.npcs) {
    const mySins = npcToSins.get(npc.id);
    if (!mySins || mySins.size === 0) {
      // NPC is not linked to any sin at all
      errors.push({
        type: 'disconnected-npc',
        message: `NPC "${npc.name}" (${npc.id}) is not linked to any sin in the chain. The NPC is completely disconnected from the investigation.`,
        npcId: npc.id,
      });
      continue;
    }

    // Check if this NPC shares a sin with any other NPC
    let isConnected = false;
    for (const [otherNpcId, otherSins] of npcToSins) {
      if (otherNpcId === npc.id) continue;
      for (const sinId of mySins) {
        if (otherSins.has(sinId)) {
          isConnected = true;
          break;
        }
      }
      if (isConnected) break;
    }

    if (!isConnected) {
      errors.push({
        type: 'isolated-npc',
        message: `NPC "${npc.name}" (${npc.id}) does not share any sin assignment with another NPC. The NPC is isolated in the investigation graph.`,
        npcId: npc.id,
      });
    }
  }

  // Check 5: Every NPC with knowledge has at least one trust-0 fact
  for (const npc of town.npcs) {
    if (!npc.knowledge) continue;
    const hasEntryPoint = npc.knowledge.facts.some(f => f.minTrustLevel === 0);
    if (!hasEntryPoint) {
      errors.push({
        type: 'no-entry-point',
        message: `NPC "${npc.name}" (${npc.id}) has no facts at trust level 0. Players cannot begin conversation with this NPC.`,
        npcId: npc.id,
      });
    }
  }

  // Check 6 (Warning): NPCs with >80% of facts at trust 60+
  for (const npc of town.npcs) {
    if (!npc.knowledge || npc.knowledge.facts.length === 0) continue;

    const highTrustCount = npc.knowledge.facts.filter(f => f.minTrustLevel >= 60).length;
    const ratio = highTrustCount / npc.knowledge.facts.length;

    if (ratio > 0.8) {
      warnings.push({
        type: 'too-secretive',
        message: `NPC "${npc.name}" (${npc.id}) has ${Math.round(ratio * 100)}% of facts at trust level 60+. This NPC may be too difficult for players to crack.`,
        npcId: npc.id,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
