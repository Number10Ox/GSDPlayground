import type { Clock as ClockType } from '@/types/game';
import { Clock } from './Clock';

interface ClockListProps {
  clocks: ClockType[];
}

export function ClockList({ clocks }: ClockListProps) {
  if (clocks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {clocks.map((clock) => (
        <Clock
          key={clock.id}
          segments={clock.segments}
          filled={clock.filled}
          label={clock.label}
          variant={clock.type}
        />
      ))}
    </div>
  );
}
