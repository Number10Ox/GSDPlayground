import type { ClockType } from '@/types/game';

interface ClockProps {
  segments: 4 | 6 | 8;
  filled: number;
  label: string;
  variant?: ClockType;
}

const variantColors: Record<ClockType, { filled: string; empty: string }> = {
  danger: { filled: '#ef4444', empty: '#374151' },      // red-500, gray-700
  progress: { filled: '#3b82f6', empty: '#374151' },    // blue-500, gray-700
  opportunity: { filled: '#22c55e', empty: '#374151' }, // green-500, gray-700
};

export function Clock({ segments, filled, label, variant = 'progress' }: ClockProps) {
  const colors = variantColors[variant];
  const radius = 40;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * radius;
  const segmentLength = circumference / segments;
  const gapLength = 4; // Visual gap between segments
  const arcLength = segmentLength - gapLength;

  // Generate segment arcs
  const segmentElements = [];
  for (let i = 0; i < segments; i++) {
    const isFilled = i < filled;
    const rotation = (360 / segments) * i - 90; // Start at 12 o'clock

    segmentElements.push(
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={isFilled ? colors.filled : colors.empty}
        strokeWidth={8}
        strokeDasharray={`${arcLength} ${circumference - arcLength}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform={`rotate(${rotation} ${cx} ${cy})`}
        className="transition-colors duration-300"
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 100 100"
        className="w-16 h-16"
        aria-label={`${label}: ${filled} of ${segments} segments filled`}
      >
        {segmentElements}
      </svg>
      <span className="text-xs text-gray-400 mt-1 text-center max-w-16 truncate">
        {label}
      </span>
    </div>
  );
}
