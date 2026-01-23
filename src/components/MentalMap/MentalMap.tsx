import { useEffect, useMemo } from 'react';
import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMentalMap } from '@/hooks/useMentalMap';
import { SinNodeComponent } from '@/components/MentalMap/SinNode';
import { NPCNodeComponent } from '@/components/MentalMap/NPCNode';
import { ConnectionEdgeComponent } from '@/components/MentalMap/ConnectionEdge';

/**
 * MentalMap - React Flow wrapper for the investigation knowledge graph.
 *
 * Displays the DitV sin progression chain as vertical nodes with NPC
 * connections branching to the right. Supports pan, zoom, and
 * reactively updates when investigation state changes.
 *
 * Note: Not wired into GameView yet (deferred to 05-06 integration plan).
 */
export function MentalMap() {
  const { nodes: mapNodes, edges: mapEdges } = useMentalMap();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync nodes/edges from useMentalMap when investigation state changes
  useEffect(() => {
    setNodes(mapNodes);
  }, [mapNodes, setNodes]);

  useEffect(() => {
    setEdges(mapEdges);
  }, [mapEdges, setEdges]);

  // Register custom node types (memoized to avoid re-registration)
  const nodeTypes = useMemo(() => ({
    sinNode: SinNodeComponent,
    npcNode: NPCNodeComponent,
  }), []);

  // Register custom edge types
  const edgeTypes = useMemo(() => ({
    connectionEdge: ConnectionEdgeComponent,
  }), []);

  return (
    <div
      className="h-[400px] w-full bg-surface rounded-lg overflow-hidden"
      data-testid="mental-map"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        panOnDrag
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
        className="bg-surface"
      />
    </div>
  );
}
