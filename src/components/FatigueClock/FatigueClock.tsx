import { useMemo } from 'react';

interface FatigueClockProps {
  current: number;
  max: number;
}

/**
 * FatigueClock - SVG circular progress clock showing conversation fatigue.
 *
 * Displays filled segments representing conversations used this cycle.
 * Turns red and pulses when the player is exhausted (current >= max).
 */
export function FatigueClock({ current, max }: FatigueClockProps) {
  const isExhausted = current >= max;
  const progressColor = isExhausted ? '#e74c3c' : '#3498db';

  const radius = 50;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress arc
  const progress = max > 0 ? current / max : 0;
  const strokeDashoffset = circumference * (1 - progress);

  // Generate segment markers (thin white lines dividing the circle)
  const segmentMarkers = useMemo(() => {
    if (max <= 1) return [];

    const markers = [];
    for (let i = 0; i < max; i++) {
      const angle = (360 / max) * i - 90; // Start at top (12 o'clock)
      const angleRad = (angle * Math.PI) / 180;

      // Inner and outer points for the segment line
      const innerRadius = radius - 6;
      const outerRadius = radius + 6;

      const x1 = cx + innerRadius * Math.cos(angleRad);
      const y1 = cy + innerRadius * Math.sin(angleRad);
      const x2 = cx + outerRadius * Math.cos(angleRad);
      const y2 = cy + outerRadius * Math.sin(angleRad);

      markers.push(
        <line
          key={`segment-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="white"
          strokeWidth={1.5}
          opacity={0.6}
        />
      );
    }
    return markers;
  }, [max, cx, cy, radius]);

  return (
    <div
      data-testid="fatigue-clock"
      data-fatigue-current={current}
      data-fatigue-max={max}
      className="flex flex-col items-center"
    >
      <svg
        viewBox="0 0 120 120"
        className="w-16 h-16"
        aria-label={`Fatigue: ${current} of ${max} conversations used`}
      >
        {/* Background circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#333"
          strokeWidth={8}
          fill="none"
        />

        {/* Progress circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={progressColor}
          strokeWidth={8}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
          className={isExhausted ? 'animate-fatigue-pulse' : ''}
        />

        {/* Segment markers */}
        {segmentMarkers}

        {/* Center text */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontWeight="bold"
          fontSize="16"
        >
          {current}/{max}
        </text>
      </svg>

      {/* Inline keyframe for pulse animation */}
      {isExhausted && (
        <style>{`
          @keyframes fatigue-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          .animate-fatigue-pulse {
            animation: fatigue-pulse 1s ease-in-out infinite;
          }
        `}</style>
      )}
    </div>
  );
}
