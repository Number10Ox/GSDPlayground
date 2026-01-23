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
  // Build dependency graph from discovery-gated topic rules.
  // An edge A -> B means: discovering sin A is a prerequisite for accessing
  // facts about sin B (sin B's facts are ONLY accessible through topics gated by sin A).
  const sinIds = new Set(town.sinChain.map(s => s.id));
  const dependencyGraph = new Map<string, Set<string>>();

  for (const sinId of sinIds) {
    dependencyGraph.set(sinId, new Set());
  }

  // First, determine which sins have facts accessible without any discovery gate
  // (i.e., facts at trust level 0 that can be reached through default topics)
  const independentlyDiscoverable = new Set<string>();
  for (const npc of town.npcs) {
    if (!npc.knowledge) continue;
    for (const fact of npc.knowledge.facts) {
      if (fact.sinId && fact.minTrustLevel === 0) {
        independentlyDiscoverable.add(fact.sinId);
      }
    }
  }

  // Build edges: discovery topic rules create dependencies.
  // If a discovery rule requires sin A and the rule's label matches a sin B topic,
  // then B depends on A (you must discover A before unlocking B's topic).
  // However, if sin B is independently discoverable (has trust-0 facts), no dependency exists.
  const sinLabelToId = new Map<string, string>();
  for (const sin of town.sinChain) {
    // Map the sin's discovery topic label to its ID
    const label = sin.name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    sinLabelToId.set(label, sin.id);
  }

  for (const rule of town.topicRules) {
    if (rule.kind !== 'discovery') continue;

    // Check if this rule's label corresponds to a sin's discovery topic
    const targetSinId = sinLabelToId.get(rule.label);
    if (!targetSinId) continue;

    // Skip if target sin is independently discoverable (has trust-0 facts)
    if (independentlyDiscoverable.has(targetSinId)) continue;

    // This topic requires discovering one of requiredSinIds first
    // Create edges: requiredSinId -> targetSinId
    for (const requiredSinId of rule.requiredSinIds) {
      if (requiredSinId === targetSinId) continue; // Self-reference is not a dependency
      const edges = dependencyGraph.get(requiredSinId);
      if (edges) {
        edges.add(targetSinId);
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
