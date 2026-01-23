/**
 * Sin Chain Validator
 *
 * Validates that a town's sin chain is discoverable by the player.
 * Catches three failure modes:
 * 1. Unreachable sins (no starter facts accessible early)
 * 2. Circular knowledge dependencies (infinite loops)
 * 3. Sins not reachable from default topics (isolated subgraphs)
 *
 * Also warns about single-point-of-failure sins (only one NPC knows about them).
 */

import type { TownData } from '@/types/town';

/**
 * ValidationError - A single validation issue found in a town.
 */
export interface ValidationError {
  type: string;
  message: string;
  sinId?: string;
  npcId?: string;
}

/**
 * ValidationResult - Aggregated validation output.
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validates that all sins in a town's sin chain are discoverable.
 *
 * Checks:
 * 1. Every sin has at least one NPC fact with minTrustLevel <= 30 (starter fact)
 * 2. No circular knowledge dependencies in discovery gates
 * 3. Every sin is reachable from default topics (trust 0 facts)
 * 4. Warning: sins with only one NPC having knowledge (single point of failure)
 *
 * @param town - Complete TownData to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateSinChainDiscoverable(town: TownData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check 1: Every sin has at least one starter fact (minTrustLevel <= 30)
  for (const sin of town.sinChain) {
    let hasStarterFact = false;

    for (const npc of town.npcs) {
      if (!npc.knowledge) continue;
      for (const fact of npc.knowledge.facts) {
        if (fact.sinId === sin.id && fact.minTrustLevel <= 30) {
          hasStarterFact = true;
          break;
        }
      }
      if (hasStarterFact) break;
    }

    if (!hasStarterFact) {
      errors.push({
        type: 'unreachable-sin',
        message: `Sin "${sin.name}" (${sin.id}) has no starter fact with minTrustLevel <= 30. Players cannot discover this sin early enough.`,
        sinId: sin.id,
      });
    }
  }

  // Check 2: No circular knowledge dependencies
  // Build dependency graph: discovery-gated topic rules create edges
  // If discovering sin A unlocks topics that can reveal sin B, that's an edge A -> B
  const sinIds = new Set(town.sinChain.map(s => s.id));
  const dependencyGraph = new Map<string, Set<string>>();

  for (const sinId of sinIds) {
    dependencyGraph.set(sinId, new Set());
  }

  // Find which sins can be discovered through discovery-gated topics
  for (const rule of town.topicRules) {
    if (rule.kind !== 'discovery') continue;

    // This topic is unlocked by discovering any of requiredSinIds
    // Find which sins' facts match this topic's label (via tags or content)
    // The topic unlocks conversations that may reveal other sins
    for (const requiredSinId of rule.requiredSinIds) {
      // Find sins that could be revealed through topics unlocked by this rule
      for (const npc of town.npcs) {
        if (!npc.knowledge) continue;
        for (const fact of npc.knowledge.facts) {
          if (fact.sinId && fact.sinId !== requiredSinId && sinIds.has(fact.sinId)) {
            // Discovering requiredSinId can lead to discovering fact.sinId
            const edges = dependencyGraph.get(requiredSinId);
            if (edges) {
              edges.add(fact.sinId);
            }
          }
        }
      }
    }
  }

  // Detect cycles using iterative DFS
  const visited = new Set<string>();
  const inStack = new Set<string>();

  for (const startNode of sinIds) {
    if (visited.has(startNode)) continue;

    const stack: { node: string; iterator: Iterator<string> }[] = [];
    stack.push({ node: startNode, iterator: (dependencyGraph.get(startNode) || new Set()).values() });
    inStack.add(startNode);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const next = current.iterator.next();

      if (next.done) {
        stack.pop();
        inStack.delete(current.node);
        visited.add(current.node);
      } else {
        const neighbor = next.value;
        if (inStack.has(neighbor)) {
          errors.push({
            type: 'circular-dependency',
            message: `Circular knowledge dependency detected: sin "${neighbor}" is part of a cycle. Players may get stuck in an infinite discovery loop.`,
            sinId: neighbor,
          });
          // Mark as visited to avoid re-reporting
          visited.add(neighbor);
        } else if (!visited.has(neighbor)) {
          inStack.add(neighbor);
          stack.push({ node: neighbor, iterator: (dependencyGraph.get(neighbor) || new Set()).values() });
        }
      }
    }
  }

  // Check 3: Every sin is reachable from default topics (trust 0 facts)
  // Start from facts accessible at trust level 0 (no prior relationship needed)
  const reachableSins = new Set<string>();

  // Seed: sins discoverable from trust-0 facts
  for (const npc of town.npcs) {
    if (!npc.knowledge) continue;
    for (const fact of npc.knowledge.facts) {
      if (fact.sinId && fact.minTrustLevel === 0) {
        reachableSins.add(fact.sinId);
      }
    }
  }

  // BFS through discovery gates
  const queue = [...reachableSins];
  while (queue.length > 0) {
    const currentSinId = queue.shift()!;
    const neighbors = dependencyGraph.get(currentSinId);
    if (!neighbors) continue;

    for (const neighbor of neighbors) {
      if (!reachableSins.has(neighbor)) {
        reachableSins.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  for (const sin of town.sinChain) {
    if (!reachableSins.has(sin.id)) {
      errors.push({
        type: 'isolated-sin',
        message: `Sin "${sin.name}" (${sin.id}) is not reachable from default topics. No path from trust-0 facts leads to discovering this sin.`,
        sinId: sin.id,
      });
    }
  }

  // Check 4 (Warning): Single point of failure - only one NPC knows about a sin
  for (const sin of town.sinChain) {
    let npcCount = 0;
    for (const npc of town.npcs) {
      if (!npc.knowledge) continue;
      const hasFact = npc.knowledge.facts.some(f => f.sinId === sin.id);
      if (hasFact) npcCount++;
    }

    if (npcCount === 1) {
      warnings.push({
        type: 'single-source',
        message: `Sin "${sin.name}" (${sin.id}) has only one NPC with knowledge about it. If the player misses that NPC, the sin may be hard to discover.`,
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
