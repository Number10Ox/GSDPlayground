import type { Topic } from '@/types/dialogue';

interface TopicChipsProps {
  topics: Topic[];
  onSelect: (topic: Topic) => void;
}

/**
 * TopicChips - Horizontal row of selectable conversation topic chips.
 * Unavailable topics are dimmed and disabled.
 * Uses amber accent for selected/hover state matching project convention.
 */
export function TopicChips({ topics, onSelect }: TopicChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 p-3" data-testid="topic-chips">
      {topics.map((topic) => (
        <button
          key={topic.id}
          data-testid={`topic-chip-${topic.id}`}
          disabled={!topic.available}
          onClick={() => topic.available && onSelect(topic)}
          className={`
            rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
            ${topic.available
              ? 'bg-gray-800 text-gray-200 border border-gray-600 hover:border-amber-400 hover:text-amber-200 cursor-pointer'
              : 'bg-gray-900 text-gray-500 border border-gray-700 opacity-50 cursor-not-allowed'
            }
          `}
        >
          {topic.label}
        </button>
      ))}
    </div>
  );
}
