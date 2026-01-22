import type { DieType } from '@/types/game';

interface DieIconProps {
  type: DieType;
  value: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 32, md: 48, lg: 64 };

/**
 * Colors per die type for quick visual recognition.
 * d4 = red (weakest), d6 = amber (standard), d8 = green (good), d10 = blue (best)
 */
const colors: Record<DieType, { fill: string; stroke: string }> = {
  d4: { fill: '#dc2626', stroke: '#fca5a5' },   // red-600, red-300
  d6: { fill: '#d97706', stroke: '#fcd34d' },   // amber-600, amber-300
  d8: { fill: '#16a34a', stroke: '#86efac' },   // green-600, green-300
  d10: { fill: '#2563eb', stroke: '#93c5fd' },  // blue-600, blue-300
};

/**
 * Generate SVG path for each die shape.
 * - d4: Triangle (upward pointing)
 * - d6: Square (slightly rotated for visual interest)
 * - d8: Diamond (rhombus)
 * - d10: Pentagon-ish shape
 */
function getShapePath(type: DieType, s: number): string {
  const pad = 4; // Padding from edges

  switch (type) {
    case 'd4':
      // Triangle pointing up
      return `M${s / 2},${pad} L${s - pad},${s - pad} L${pad},${s - pad} Z`;

    case 'd6':
      // Square
      return `M${pad},${pad} L${s - pad},${pad} L${s - pad},${s - pad} L${pad},${s - pad} Z`;

    case 'd8':
      // Diamond (rhombus)
      return `M${s / 2},${pad} L${s - pad},${s / 2} L${s / 2},${s - pad} L${pad},${s / 2} Z`;

    case 'd10': {
      // Pentagon-ish (irregular for visual distinction)
      const cx = s / 2;
      const top = pad + 2;
      const upperY = s * 0.35;
      const bottom = s - pad;
      const leftX = pad + 2;
      const rightX = s - pad - 2;
      return `M${cx},${top} L${rightX},${upperY} L${rightX - 4},${bottom} L${leftX + 4},${bottom} L${leftX},${upperY} Z`;
    }

    default:
      return '';
  }
}

/**
 * Calculate text position Y offset for each shape.
 * Different shapes need different vertical centering.
 */
function getTextYOffset(type: DieType): number {
  switch (type) {
    case 'd4':
      return 6; // Triangle text sits a bit lower
    case 'd6':
      return 4;
    case 'd8':
      return 4;
    case 'd10':
      return 6;
    default:
      return 4;
  }
}

/**
 * DieIcon - Renders a 2D SVG shape representing a polyhedral die.
 *
 * Each die type has a distinct shape and color:
 * - d4: Red triangle (weakest)
 * - d6: Amber square (standard)
 * - d8: Green diamond (good)
 * - d10: Blue pentagon (best)
 *
 * The rolled value is displayed as centered text inside the shape.
 */
export function DieIcon({ type, value, size = 'md' }: DieIconProps) {
  const s = sizeMap[size];
  const path = getShapePath(type, s);
  const { fill, stroke } = colors[type];
  const textYOffset = getTextYOffset(type);
  const fontSize = s * 0.4;

  return (
    <svg
      viewBox={`0 0 ${s} ${s}`}
      width={s}
      height={s}
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path
        d={path}
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <text
        x={s / 2}
        y={s / 2 + textYOffset}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={fontSize}
        fontWeight="bold"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
      >
        {value}
      </text>
    </svg>
  );
}
