import { useGameState } from '@/hooks/useGameState';
import { LocationNode } from './LocationNode';

export function NodeMap() {
  const { state, dispatch } = useGameState();
  const { locations, currentLocation } = state;

  // Build connection lines between locations
  const connections: Array<{ from: { x: number; y: number }; to: { x: number; y: number }; key: string }> = [];
  const processedPairs = new Set<string>();

  locations.forEach(loc => {
    loc.connections.forEach(connId => {
      const pairKey = [loc.id, connId].sort().join('-');
      if (!processedPairs.has(pairKey)) {
        processedPairs.add(pairKey);
        const connLoc = locations.find(l => l.id === connId);
        if (connLoc) {
          connections.push({
            from: { x: loc.x, y: loc.y },
            to: { x: connLoc.x, y: connLoc.y },
            key: pairKey,
          });
        }
      }
    });
  });

  return (
    <svg
      viewBox="0 0 1000 500"
      className="w-full h-full"
      role="img"
      aria-label="Town map with navigable locations"
    >
      {/* Connection lines */}
      {connections.map(conn => (
        <line
          key={conn.key}
          x1={conn.from.x}
          y1={conn.from.y}
          x2={conn.to.x}
          y2={conn.to.y}
          className="stroke-gray-700 stroke-2"
        />
      ))}

      {/* Location nodes */}
      {locations.map(loc => (
        <LocationNode
          key={loc.id}
          location={loc}
          isCurrentLocation={loc.id === currentLocation}
          onClick={() => dispatch({ type: 'NAVIGATE', locationId: loc.id })}
        />
      ))}
    </svg>
  );
}
