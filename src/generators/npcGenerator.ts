/**
 * NPC Generator
 *
 * Produces interconnected NPCs from a sin chain using seeded random selection.
 * Each NPC gets knowledge facts, personality, speech patterns, conflict thresholds,
 * and meaningful linkages to sin nodes. Generated NPCs form a connected graph
 * via shared sin assignments.
 */

import type { SinNode } from '@/types/investigation';
import type { ApproachType, KnowledgeFact } from '@/types/dialogue';
import type { NPC, NPCKnowledge, ConflictThreshold } from '@/types/npc';
import { NPC_ARCHETYPES } from '@/templates/npcArchetypes';
import type { NPCArchetype } from '@/templates/npcArchetypes';
import { SIN_TEMPLATES } from '@/templates/sinTemplates';
import { RELATIONSHIP_PATTERNS } from '@/templates/relationshipPatterns';
import type { NPCRelationship } from '@/templates/relationshipPatterns';
import { createRNG } from '@/utils/seededRandom';
import type { SeededRNG } from '@/utils/seededRandom';
import { fillTemplate } from '@/generators/sinChainGenerator';

/**
 * NPCGenerationResult - The output of the NPC generator.
 * Contains generated NPCs, their relationships, and updated sin chain
 * with linkedNpcs populated.
 */
export interface NPCGenerationResult {
  npcs: NPC[];
  relationships: NPCRelationship[];
  updatedSinChain: SinNode[];
}

/** Minimum number of NPCs to generate */
const MIN_NPCS = 5;
/** Maximum number of NPCs to generate */
const MAX_NPCS = 7;
/** Minimum linked NPCs per sin node */
const MIN_NPCS_PER_SIN = 2;

/**
 * Maps sin template role slots to archetype roles.
 * Used to find the best archetype match for a given template role.
 */
const ROLE_SLOT_TO_ARCHETYPE: Record<string, string[]> = {
  // Pride roles
  steward: ['steward'],
  elder: ['elder'],
  preacher: ['preacher'],
  patriarch: ['farmer', 'elder'],
  matriarch: ['widow', 'healer'],
  'eldest-son': ['farmer', 'sheriff'],
  teacher: ['teacher'],
  midwife: ['healer'],
  // Injustice roles
  widow: ['widow'],
  orphan: ['widow', 'healer'],
  healer: ['healer'],
  laborer: ['farmer'],
  farmer: ['farmer'],
  merchant: ['merchant'],
  outcast: ['widow', 'farmer'],
  convert: ['farmer', 'teacher'],
  // Sin roles
  thief: ['farmer', 'merchant'],
  shopkeeper: ['merchant'],
  watchman: ['sheriff'],
  lover: ['farmer', 'merchant'],
  'betrayed-spouse': ['widow', 'healer'],
  confidant: ['teacher', 'elder'],
  abuser: ['farmer', 'sheriff'],
  'victim-kin': ['widow', 'healer'],
  witness: ['teacher', 'merchant'],
  // Demonic roles
  'sick-elder': ['elder'],
  accused: ['farmer', 'merchant'],
  herbalist: ['healer'],
  rancher: ['farmer'],
  'bereaved-parent': ['widow', 'elder'],
  tracker: ['sheriff'],
  // False Doctrine roles
  zealot: ['preacher', 'sheriff'],
  doubter: ['teacher', 'farmer'],
  beggar: ['widow', 'farmer'],
  'frightened-child': ['widow'],
  skeptic: ['teacher', 'merchant'],
  // Sorcery roles
  sorcerer: ['farmer', 'merchant'],
  enabler: ['merchant', 'elder'],
  crafter: ['farmer', 'healer'],
  target: ['widow', 'healer'],
  'complicit-elder': ['elder'],
  binder: ['preacher', 'farmer'],
  'bound-victim': ['widow', 'healer'],
  'horrified-kin': ['elder', 'widow'],
  // Murder roles
  killer: ['farmer', 'sheriff'],
  accomplice: ['merchant', 'sheriff'],
  mourner: ['widow', 'elder'],
  sacrificer: ['preacher', 'farmer'],
  discoverer: ['teacher', 'sheriff'],
  'silent-elder': ['elder'],
  instigator: ['preacher', 'steward'],
  bystander: ['merchant', 'teacher'],
  survivor: ['widow', 'healer'],
};

/**
 * Creates a short kebab-case hash for NPC IDs.
 */
function npcHash(seed: string, role: string, index: number): string {
  let hash = 0;
  const input = `${seed}-npc-${role}-${index}`;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash).toString(36).slice(0, 5).padEnd(5, '0');
}

/**
 * Determines how many NPCs to generate based on chain length.
 */
function determineNPCCount(chainLength: number, rng: SeededRNG): number {
  // Longer chains need more NPCs
  if (chainLength <= 3) return MIN_NPCS;
  if (chainLength >= 6) return MAX_NPCS;
  return rng.nextInt(MIN_NPCS, MAX_NPCS);
}

/**
 * Selects archetypes for the sin chain, ensuring diversity and coverage.
 * Returns an array of archetype assignments: which archetype fills which sin role.
 */
function selectArchetypes(
  sinChain: SinNode[],
  npcCount: number,
  rng: SeededRNG
): { archetype: NPCArchetype; sinIndices: number[]; roleInSin: string }[] {
  const assignments: { archetype: NPCArchetype; sinIndices: number[]; roleInSin: string }[] = [];
  const usedArchetypeRoles = new Set<string>();

  // First pass: assign at least one NPC per sin node using template roles
  for (let sinIdx = 0; sinIdx < sinChain.length; sinIdx++) {
    const sinNode = sinChain[sinIdx];
    // Look up npcRoleSlots from the sin level templates
    const roleSlots = getSinRoleSlots(sinNode, rng);

    for (const roleSlot of roleSlots) {
      if (assignments.length >= npcCount) break;

      const candidateRoles = ROLE_SLOT_TO_ARCHETYPE[roleSlot] || ['farmer'];
      let selectedArchetype: NPCArchetype | undefined;

      // Prefer unused archetypes
      for (const candidateRole of candidateRoles) {
        if (!usedArchetypeRoles.has(candidateRole)) {
          selectedArchetype = NPC_ARCHETYPES.find(a => a.role === candidateRole);
          if (selectedArchetype) {
            usedArchetypeRoles.add(candidateRole);
            break;
          }
        }
      }

      // Fall back to any matching archetype if all preferred are used
      if (!selectedArchetype) {
        const candidateRole = rng.pick(candidateRoles);
        selectedArchetype = NPC_ARCHETYPES.find(a => a.role === candidateRole) || rng.pick(NPC_ARCHETYPES);
      }

      // Check if this archetype is already assigned
      const existing = assignments.find(a => a.archetype.role === selectedArchetype!.role);
      if (existing) {
        // Add this sin to the existing assignment
        if (!existing.sinIndices.includes(sinIdx)) {
          existing.sinIndices.push(sinIdx);
        }
      } else {
        assignments.push({
          archetype: selectedArchetype,
          sinIndices: [sinIdx],
          roleInSin: roleSlot,
        });
      }
    }
  }

  // Second pass: ensure we have at least MIN_NPCS unique NPCs
  while (assignments.length < npcCount) {
    const available = NPC_ARCHETYPES.filter(
      a => !assignments.some(existing => existing.archetype.role === a.role)
    );
    if (available.length === 0) break; // All archetypes used

    const archetype = rng.pick(available);
    // Assign to a random sin
    const sinIdx = rng.nextInt(0, sinChain.length - 1);
    assignments.push({
      archetype,
      sinIndices: [sinIdx],
      roleInSin: archetype.role,
    });
  }

  return assignments;
}

/**
 * Gets the NPC role slots for a sin node.
 * Picks 2 role slots from the sin level templates.
 */
function getSinRoleSlots(sinNode: SinNode, rng: SeededRNG): string[] {
  const templates = SIN_TEMPLATES[sinNode.level];
  if (!templates || templates.length === 0) return ['farmer', 'elder'];

  const template = rng.pick(templates);
  // Return first 2 role slots (enough to seed each sin)
  return template.npcRoleSlots.slice(0, 2);
}

/**
 * Generates a name for an NPC from its archetype's name templates.
 */
function generateName(archetype: NPCArchetype, rng: SeededRNG): string {
  const name = rng.pick(archetype.nameTemplates.names);
  if (archetype.nameTemplates.prefix) {
    return `${archetype.nameTemplates.prefix} ${name}`;
  }
  return name;
}

/**
 * Generates knowledge facts for an NPC from its archetype's fact templates.
 * Fills template slots with sin chain context.
 */
function generateKnowledge(
  archetype: NPCArchetype,
  sinChain: SinNode[],
  sinIndices: number[],
  slots: Record<string, string>,
  rng: SeededRNG
): NPCKnowledge {
  const personality = rng.pick(archetype.personalityTemplates);
  const speechPattern = rng.pick(archetype.speechPatternTemplates);

  // Generate facts from templates
  const facts: KnowledgeFact[] = archetype.factTemplates.map((template, idx) => {
    const content = fillTemplate(template.contentPattern, slots);

    // Determine which sin this fact is linked to
    let sinId: string | undefined;
    if (template.forSinLevel) {
      const matchingSin = sinChain.find(s => s.level === template.forSinLevel);
      if (matchingSin) {
        sinId = matchingSin.id;
      }
    } else if (sinIndices.length > 0) {
      // Generic facts link to primary sin
      const primaryIdx = sinIndices[0];
      if (primaryIdx < sinChain.length) {
        sinId = sinChain[primaryIdx].id;
      }
    }

    const fact: KnowledgeFact = {
      id: `fact-${archetype.role}-${idx}`,
      content,
      tags: [...template.tags],
      minTrustLevel: template.minTrustLevel,
    };

    if (template.requiredApproach) {
      fact.requiredApproach = template.requiredApproach;
    }

    if (sinId) {
      fact.sinId = sinId;
    }

    return fact;
  });

  return {
    npcId: '', // Will be set after ID generation
    facts,
    personality,
    speechPattern,
  };
}

/**
 * Generates conflict thresholds from an archetype's resist profile.
 * Maps resist values (0-100) to conflict trigger chances.
 */
function generateConflictThresholds(archetype: NPCArchetype): ConflictThreshold[] {
  const approaches: ApproachType[] = ['body', 'will', 'heart', 'acuity'];
  return approaches.map(approach => ({
    approach,
    resistChance: archetype.resistProfile[approach] / 100,
  }));
}

/**
 * Builds relationships between NPCs based on sin-level patterns.
 * First tries to match NPCs at the same sin, then falls back to
 * matching any NPCs with the right roles.
 */
function buildRelationships(
  npcs: NPC[],
  sinChain: SinNode[],
  assignments: { archetype: NPCArchetype; sinIndices: number[] }[]
): NPCRelationship[] {
  const relationships: NPCRelationship[] = [];

  // All NPCs indexed for global matching
  const allNpcsWithIndex = assignments.map((a, npcIdx) => ({
    archetype: a.archetype,
    npcIdx,
    sinIndices: a.sinIndices,
  }));

  for (let sinIdx = 0; sinIdx < sinChain.length; sinIdx++) {
    const sinNode = sinChain[sinIdx];
    const patterns = RELATIONSHIP_PATTERNS[sinNode.level];
    if (!patterns) continue;

    // Find NPCs assigned to this sin
    const npcsAtSin = allNpcsWithIndex.filter(a => a.sinIndices.includes(sinIdx));

    for (const pattern of patterns) {
      // Try local match first (both NPCs at same sin)
      let fromNpc = npcsAtSin.find(a => a.archetype.role === pattern.roles[0]);
      let toNpc = npcsAtSin.find(a => a.archetype.role === pattern.roles[1] && a !== fromNpc);

      // Fall back to global match (any NPC with matching role)
      if (!fromNpc) {
        fromNpc = allNpcsWithIndex.find(a => a.archetype.role === pattern.roles[0]);
      }
      if (!toNpc) {
        toNpc = allNpcsWithIndex.find(
          a => a.archetype.role === pattern.roles[1] && a !== fromNpc
        );
      }

      if (fromNpc && toNpc && fromNpc.npcIdx !== toNpc.npcIdx) {
        const fromId = npcs[fromNpc.npcIdx]?.id;
        const toId = npcs[toNpc.npcIdx]?.id;

        if (fromId && toId) {
          // Avoid duplicate relationships
          const exists = relationships.some(
            r => r.from === fromId && r.to === toId && r.type === pattern.type
          );

          if (!exists) {
            relationships.push({
              from: fromId,
              to: toId,
              type: pattern.type,
              secret: pattern.secret,
              sinId: sinNode.id,
            });
          }
        }
      }
    }
  }

  return relationships;
}

/**
 * Ensures every sin node has at least MIN_NPCS_PER_SIN linked NPCs.
 * If a sin has fewer, assigns additional NPCs from adjacent sins.
 */
function ensureSinCoverage(
  sinChain: SinNode[],
  assignments: { archetype: NPCArchetype; sinIndices: number[] }[]
): void {
  for (let sinIdx = 0; sinIdx < sinChain.length; sinIdx++) {
    const npcsAtSin = assignments.filter(a => a.sinIndices.includes(sinIdx));

    while (npcsAtSin.length < MIN_NPCS_PER_SIN) {
      // Find an NPC from an adjacent sin to also link here
      const adjacentIdx = sinIdx > 0 ? sinIdx - 1 : sinIdx + 1;
      if (adjacentIdx >= sinChain.length) break;

      const candidateFromAdjacent = assignments.find(
        a => a.sinIndices.includes(adjacentIdx) && !a.sinIndices.includes(sinIdx)
      );

      if (candidateFromAdjacent) {
        candidateFromAdjacent.sinIndices.push(sinIdx);
        npcsAtSin.push(candidateFromAdjacent);
      } else {
        // If no adjacent candidate, pick any NPC not already at this sin
        const anyCandidate = assignments.find(a => !a.sinIndices.includes(sinIdx));
        if (anyCandidate) {
          anyCandidate.sinIndices.push(sinIdx);
          npcsAtSin.push(anyCandidate);
        } else {
          break; // All NPCs already linked to this sin
        }
      }
    }
  }
}

/**
 * Ensures every NPC shares at least one sin with at least one other NPC.
 * If an NPC is isolated, links them to an adjacent sin in the chain.
 */
function ensureConnectivity(
  sinChain: SinNode[],
  assignments: { archetype: NPCArchetype; sinIndices: number[] }[]
): void {
  for (const assignment of assignments) {
    // Check if this NPC shares any sin with another NPC
    const isConnected = assignment.sinIndices.some(sinIdx => {
      const othersAtSin = assignments.filter(
        a => a !== assignment && a.sinIndices.includes(sinIdx)
      );
      return othersAtSin.length > 0;
    });

    if (!isConnected && sinChain.length > 0) {
      // Find a sin that has other NPCs and add this NPC to it
      for (let sinIdx = 0; sinIdx < sinChain.length; sinIdx++) {
        const othersAtSin = assignments.filter(
          a => a !== assignment && a.sinIndices.includes(sinIdx)
        );
        if (othersAtSin.length > 0) {
          assignment.sinIndices.push(sinIdx);
          break;
        }
      }
    }
  }
}

/**
 * Generates a complete NPC cast for a town from its sin chain.
 * Produces 5-7 interconnected NPCs with knowledge, thresholds, and relationships.
 *
 * @param sinChain - The town's sin progression nodes
 * @param seed - Seed string for deterministic generation
 * @returns NPCGenerationResult with NPCs, relationships, and updated sin chain
 */
export function generateNPCs(sinChain: SinNode[], seed: string): NPCGenerationResult {
  const rng = createRNG(`${seed}-npcs`);

  // Deep clone sin chain to avoid mutation
  const updatedSinChain: SinNode[] = sinChain.map(s => ({
    ...s,
    linkedNpcs: [...s.linkedNpcs],
  }));

  // Determine NPC count
  const npcCount = determineNPCCount(updatedSinChain.length, rng);

  // Select archetypes and assign to sins
  const assignments = selectArchetypes(updatedSinChain, npcCount, rng);

  // Ensure every sin has minimum coverage
  ensureSinCoverage(updatedSinChain, assignments);

  // Ensure graph connectivity
  ensureConnectivity(updatedSinChain, assignments);

  // Derive slot values for template filling (same pattern as sinChainGenerator)
  const authorityNames = ['Steward Ezra', 'Elder Harmon', 'Brother Josiah', 'Sister Adelaide'];
  const sinnerNames = ['Caleb', 'Thaddeus', 'Miriam', 'Obadiah', 'Ruth'];
  const victimNames = ['young Sarah', 'old Matthias', 'the widow Leah', 'Brother Amos', 'Sister Naomi'];

  const slotRng = createRNG(`${seed}-slots`);
  const slots: Record<string, string> = {
    town: deriveTownNameFromSinChain(updatedSinChain),
    authority: slotRng.pick(authorityNames),
    sinner: slotRng.pick(sinnerNames),
    victim: slotRng.pick(victimNames),
  };

  // Generate NPCs
  const npcs: NPC[] = assignments.map((assignment, idx) => {
    const { archetype, sinIndices } = assignment;

    const id = `npc-${archetype.role}-${npcHash(seed, archetype.role, idx)}`;
    const name = generateName(archetype, rng);
    const description = `${rng.pick(archetype.personalityTemplates)}`;

    // Generate knowledge
    const knowledge = generateKnowledge(archetype, updatedSinChain, sinIndices, slots, rng);
    knowledge.npcId = id;

    // Generate conflict thresholds
    const conflictThresholds = generateConflictThresholds(archetype);

    // Map defaultLocationType to a location ID
    const locationId = `loc-${archetype.defaultLocationType}`;

    return {
      id,
      name,
      locationId,
      description,
      role: archetype.role,
      knowledge,
      conflictThresholds,
    };
  });

  // Link NPCs to sin nodes
  for (let assignIdx = 0; assignIdx < assignments.length; assignIdx++) {
    const { sinIndices } = assignments[assignIdx];
    const npcId = npcs[assignIdx].id;

    for (const sinIdx of sinIndices) {
      if (sinIdx < updatedSinChain.length) {
        if (!updatedSinChain[sinIdx].linkedNpcs.includes(npcId)) {
          updatedSinChain[sinIdx].linkedNpcs.push(npcId);
        }
      }
    }
  }

  // Build relationships
  const relationships = buildRelationships(npcs, updatedSinChain, assignments);

  return { npcs, relationships, updatedSinChain };
}

/**
 * Derives town name from the sin chain descriptions (extracts from first sin).
 */
function deriveTownNameFromSinChain(sinChain: SinNode[]): string {
  if (sinChain.length === 0) return 'Unknown Town';

  // Try to extract town name from the first sin description
  const desc = sinChain[0].description;
  // Look for "of [TownName]" pattern
  const match = desc.match(/of ([A-Z][a-z]+ [A-Z][a-z]+)/);
  if (match) return match[1];

  // Look for "in [TownName]" pattern
  const matchIn = desc.match(/in ([A-Z][a-z]+ [A-Z][a-z]+)/);
  if (matchIn) return matchIn[1];

  return 'the town';
}
