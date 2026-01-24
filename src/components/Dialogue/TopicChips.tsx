import type { Topic } from '@/types/dialogue';

interface TopicChipsProps {
  topics: Topic[];
  onSelect: (topic: Topic) => void;
}

/**
 * TopicChips - Horizontal row of selectable conversation topic chips.
 * Shows a lock icon for trust-gated topics and a dot for unexplored topics.
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
            rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-1.5
            ${topic.available
              ? 'bg-gray-800 text-gray-200 border border-gray-600 hover:border-amber-400 hover:text-amber-200 cursor-pointer'
              : 'bg-gray-900 text-gray-500 border border-gray-700 opacity-50 cursor-not-allowed'
            }
          `}
        >
          {topic.trustGated && <span className="text-amber-500 text-xs" title="Trust-gated">{'\uD83D\uDD12'}</span>}
          {topic.label}
          {!topic.explored && topic.available && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" title="Unexplored" />}
        </button>
      ))}
    </div>
  );
}
