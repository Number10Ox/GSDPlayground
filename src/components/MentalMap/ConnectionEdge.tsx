import { BaseEdge, getStraightPath, type EdgeProps } from '@xyflow/react';
import type { SinLevel } from '@/types/investigation';

/**
 * Edge data payload for connection edges.
 */
interface ConnectionEdgeData {
  edgeType: 'chain' | 'npc';
  discovered: boolean;
  level: SinLevel;
}

/**
 * Color mapping for sin chain edges based on severity level.
 */
const CHAIN_COLORS: Record<SinLevel, string> = {
  'pride': '#d97706',           // amber-600
  'injustice': '#b45309',       // amber-700
  'sin': '#ea580c',             // orange-600
  'demonic-attacks': '#c2410c', // orange-700
  'false-doctrine': '#dc2626', // red-600
  'sorcery': '#b91c1c',        // red-700
  'hate-and-murder': '#7f1d1d', // red-900
};

/**
 * ConnectionEdgeComponent - Custom React Flow edge for sin chain and NPC connections.
 *
 * Visual styles:
 * - Sin chain edges: thicker (2px), colored by severity gradient
 * - NPC edges: thinner (1px), gray
 * - Undiscovered: dashed, animated
 * - Discovered: solid with subtle glow
 */
export function ConnectionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) {
  const edgeData = data as unknown as ConnectionEdgeData | undefined;
  const edgeType = edgeData?.edgeType ?? 'chain';
  const discovered = edgeData?.discovered ?? false;
  const level = edgeData?.level ?? 'pride';

  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const isChain = edgeType === 'chain';
  const strokeWidth = isChain ? 2 : 1;
  const strokeColor = isChain ? CHAIN_COLORS[level] : '#6b7280'; // gray-500 for NPC edges
  const strokeDasharray = discovered ? undefined : '5 5';
  const opacity = discovered ? 0.9 : 0.4;

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        strokeWidth,
        stroke: strokeColor,
        strokeDasharray,
        opacity,
        filter: discovered && isChain ? `drop-shadow(0 0 3px ${strokeColor})` : undefined,
      }}
    />
  );
}
