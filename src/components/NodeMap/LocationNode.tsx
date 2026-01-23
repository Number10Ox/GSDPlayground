import type { Location } from '@/types/game';

interface LocationNodeProps {
  location: Location;
  isCurrentLocation: boolean;
  onClick: () => void;
}

export function LocationNode({ location, isCurrentLocation, onClick }: LocationNodeProps) {
  return (
    <g
      onClick={onClick}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      data-testid={`map-node-${location.id}`}
    >
      <circle
        cx={location.x}
        cy={location.y}
        r={isCurrentLocation ? 35 : 30}
        className={`transition-all duration-200 ${
          isCurrentLocation
            ? 'fill-amber-500 stroke-amber-300 stroke-2'
            : 'fill-surface-light hover:fill-surface stroke-gray-600 stroke-1 hover:stroke-gray-400'
        }`}
      />
      <text
        x={location.x}
        y={location.y + 55}
        textAnchor="middle"
        className={`text-sm fill-current ${isCurrentLocation ? 'text-amber-200' : 'text-gray-400'}`}
      >
        {location.name}
      </text>
    </g>
  );
}
