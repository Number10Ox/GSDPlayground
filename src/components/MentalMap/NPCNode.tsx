import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NPCNodeData } from '@/hooks/useMentalMap';

/**
 * NPCNodeComponent - Custom React Flow node for NPCs linked to sins.
 *
 * Visual states:
 * - Discovered: shows NPC name and role
 * - Undiscovered: shows "Someone..." placeholder
 *
 * Shape: rounded pill/capsule, smaller than sin nodes (120px width).
 */
export function NPCNodeComponent({ data }: NodeProps) {
  const { name, role, npcId, discovered } = data as unknown as NPCNodeData;

  const baseClasses = 'w-[120px] px-2 py-1.5 rounded-full text-center text-xs transition-all duration-300 border';

  let stateClasses: string;
  let content: React.ReactNode;

  if (discovered) {
    stateClasses = 'border-gray-500 bg-gray-800/70';
    content = (
      <div className="flex flex-col items-center">
        <span className="text-gray-200 font-medium truncate w-full">{name}</span>
        {role && <span className="text-gray-400 text-[10px] truncate w-full">{role}</span>}
      </div>
    );
  } else {
    stateClasses = 'border-gray-700 border-dashed bg-gray-900/50';
    content = <span className="text-gray-500 italic">Someone...</span>;
  }

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      data-testid={`npc-node-${npcId}`}
    >
      {/* Left handle connects to sin node */}
      <Handle
        type="source"
        position={Position.Left}
        className="!bg-gray-500 !w-2 !h-2"
      />

      {content}
    </div>
  );
}
