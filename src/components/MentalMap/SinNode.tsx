import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { SinNodeData } from '@/hooks/useMentalMap';
import type { SinLevel } from '@/types/investigation';

/**
 * Color mapping for sin severity levels.
 * Escalates from amber (mild) to dark red with glow (severe).
 */
const SEVERITY_COLORS: Record<SinLevel, { text: string; border: string; glow?: string }> = {
  'pride': { text: 'text-amber-400', border: 'border-amber-600' },
  'injustice': { text: 'text-amber-500', border: 'border-amber-700' },
  'sin': { text: 'text-orange-400', border: 'border-orange-600' },
  'demonic-attacks': { text: 'text-orange-500', border: 'border-orange-700' },
  'false-doctrine': { text: 'text-red-400', border: 'border-red-600' },
  'sorcery': { text: 'text-red-500', border: 'border-red-700' },
  'hate-and-murder': { text: 'text-red-700', border: 'border-red-900', glow: 'shadow-red-900/50 shadow-lg' },
};

/**
 * SinNodeComponent - Custom React Flow node for sin progression chain.
 *
 * Visual states:
 * - Undiscovered: "???" with dashed border, muted gray
 * - Discovered: sin name in bold, colored by severity
 * - Resolved: green border with checkmark overlay
 */
export function SinNodeComponent({ data }: NodeProps) {
  const { label, level, discovered, resolved } = data as unknown as SinNodeData;
  const severity = SEVERITY_COLORS[level] || SEVERITY_COLORS['pride'];

  const baseClasses = 'w-[160px] px-3 py-2 rounded-lg text-center text-sm transition-all duration-300';

  let stateClasses: string;
  let content: React.ReactNode;

  if (!discovered) {
    // Undiscovered: obscured placeholder
    stateClasses = 'border-2 border-dashed border-gray-600 bg-gray-800/50 text-gray-500';
    content = <span className="italic">???</span>;
  } else if (resolved) {
    // Resolved: green border with checkmark
    stateClasses = `border-2 border-green-500 bg-gray-800/80 ${severity.text}`;
    content = (
      <div className="relative">
        <span className="font-bold line-through opacity-70">{label}</span>
        <span className="absolute -top-1 -right-1 text-green-400 text-xs">&#10003;</span>
      </div>
    );
  } else {
    // Discovered: show sin name with severity color
    stateClasses = `border-2 ${severity.border} bg-gray-800/80 ${severity.text} ${severity.glow || ''}`;
    content = <span className="font-bold">{label}</span>;
  }

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      data-testid={`sin-node-${level}`}
    >
      {/* Top handle for chain edge from previous sin */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-500 !w-2 !h-2"
      />

      {content}

      {/* Bottom handle for chain edge to next sin */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-500 !w-2 !h-2"
      />

      {/* Right handle for NPC connections */}
      <Handle
        type="target"
        position={Position.Right}
        id="npc-target"
        className="!bg-gray-500 !w-2 !h-2"
      />
    </div>
  );
}
