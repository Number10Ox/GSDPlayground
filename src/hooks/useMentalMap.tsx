import { useMemo, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { useInvestigation } from '@/hooks/useInvestigation';
import { useNPCMemory } from '@/hooks/useNPCMemory';
import type { SinNode } from '@/types/investigation';

/**
 * SinNodeData - Data payload for sin node rendering.
 */
export interface SinNodeData {
  label: string;
  level: SinNode['level'];
  discovered: boolean;
  resolved: boolean;
  [key: string]: unknown;
}

/**
 * NPCNodeData - Data payload for NPC node rendering.
 */
export interface NPCNodeData {
  name: string;
  role: string;
  npcId: string;
  discovered: boolean;
  [key: string]: unknown;
}

/**
 * useMentalMap - Converts investigation state into React Flow graph data.
 *
 * Reads sinProgression and discoveries from useInvestigation,
 * NPC names from useNPCMemory, and produces positioned nodes + edges
 * for the mental map visualization.
 */
export function useMentalMap() {
  const { state: investigationState } = useInvestigation();
  const { getNPCById } = useNPCMemory();

  const { sinProgression, discoveries } = investigationState;

  const nodes = useMemo<Node[]>(() => {
    const result: Node[] = [];

    // Sin nodes: positioned vertically in a column
    sinProgression.forEach((sin, index) => {
      const sinNode: Node = {
        id: `sin-${sin.id}`,
        type: 'sinNode',
        position: { x: 300, y: index * 120 },
        data: {
          label: sin.discovered ? sin.name : '???',
          level: sin.level,
          discovered: sin.discovered,
          resolved: sin.resolved,
        } satisfies SinNodeData,
      };
      result.push(sinNode);
    });

    // NPC nodes: positioned to the right of their linked sin nodes
    const npcOffsets: Record<string, number> = {};
    sinProgression.forEach((sin, sinIndex) => {
      // Only render NPC nodes if the linked sin is discovered
      if (!sin.discovered) return;

      sin.linkedNpcs.forEach((npcId) => {
        // Skip if NPC node already added (NPC could be linked to multiple sins)
        if (result.some((n) => n.id === `npc-${npcId}`)) return;

        // Track offset for multiple NPCs on same sin
        const offsetKey = `sin-${sinIndex}`;
        npcOffsets[offsetKey] = (npcOffsets[offsetKey] || 0);
        const yOffset = npcOffsets[offsetKey] * 50;
        npcOffsets[offsetKey]++;

        const npc = getNPCById(npcId);
        const npcNode: Node = {
          id: `npc-${npcId}`,
          type: 'npcNode',
          position: { x: 550, y: sinIndex * 120 + yOffset },
          data: {
            name: npc?.name ?? 'Unknown',
            role: npc?.role ?? '',
            npcId,
            discovered: !!npc,
          } satisfies NPCNodeData,
        };
        result.push(npcNode);
      });
    });

    return result;
  }, [sinProgression, discoveries.length, getNPCById]);

  const edges = useMemo<Edge[]>(() => {
    const result: Edge[] = [];

    // Sin chain edges: connect each sin to the next in progression
    sinProgression.forEach((sin, index) => {
      if (index === sinProgression.length - 1) return;

      const nextSin = sinProgression[index + 1];
      const bothDiscovered = sin.discovered && nextSin.discovered;

      const chainEdge: Edge = {
        id: `chain-${sin.id}-${nextSin.id}`,
        source: `sin-${sin.id}`,
        target: `sin-${nextSin.id}`,
        type: 'connectionEdge',
        data: {
          edgeType: 'chain',
          discovered: bothDiscovered,
          level: sin.level,
        },
        animated: bothDiscovered,
      };
      result.push(chainEdge);
    });

    // NPC-to-sin edges: connect NPC nodes to their linked sin nodes
    sinProgression.forEach((sin) => {
      if (!sin.discovered) return;

      sin.linkedNpcs.forEach((npcId) => {
        const npc = getNPCById(npcId);
        // Only show edge if both sin discovered AND NPC encountered
        if (!npc) return;

        const npcEdge: Edge = {
          id: `link-${npcId}-${sin.id}`,
          source: `npc-${npcId}`,
          target: `sin-${sin.id}`,
          type: 'connectionEdge',
          data: {
            edgeType: 'npc',
            discovered: true,
            level: sin.level,
          },
        };
        result.push(npcEdge);
      });
    });

    return result;
  }, [sinProgression, discoveries.length, getNPCById]);

  const onNodeClick = useCallback((_nodeId: string) => {
    // No-op for now (future: could show details panel)
  }, []);

  return { nodes, edges, onNodeClick };
}
