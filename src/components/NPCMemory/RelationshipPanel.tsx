import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNPCMemory } from '@/hooks/useNPCMemory';
import type { EscalationLevel } from '@/types/conflict';

interface RelationshipPanelProps {
  npcId: string;
  onClose: () => void;
}

/**
 * Relationship labels based on level.
 */
function getRelationshipLabel(level: number): {
  label: string;
  color: string;
} {
  if (level <= -60) {
    return { label: 'Hostile', color: 'text-red-500' };
  }
  if (level <= -20) {
    return { label: 'Distrustful', color: 'text-red-400' };
  }
  if (level < 20) {
    return { label: 'Neutral', color: 'text-gray-400' };
  }
  if (level < 60) {
    return { label: 'Friendly', color: 'text-green-400' };
  }
  return { label: 'Trusted', color: 'text-green-500' };
}

/**
 * Format timestamp as relative time.
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  return 'Just now';
}

/**
 * Get escalation level display info.
 */
function getEscalationBadge(level: EscalationLevel): {
  label: string;
  className: string;
} {
  switch (level) {
    case 'JUST_TALKING':
      return { label: 'Words', className: 'bg-gray-600 text-gray-200' };
    case 'PHYSICAL':
      return { label: 'Physical', className: 'bg-amber-600 text-amber-100' };
    case 'FIGHTING':
      return { label: 'Fighting', className: 'bg-red-600 text-red-100' };
    case 'GUNPLAY':
      return { label: 'Gunplay', className: 'bg-red-900 text-red-100' };
  }
}

/**
 * RelationshipPanel - Slide-out panel showing detailed NPC history.
 *
 * Displays:
 * - NPC name and role
 * - Relationship meter (-100 to +100)
 * - Relationship label (Hostile/Distrustful/Neutral/Friendly/Trusted)
 * - Conflict history with timestamps and escalation badges
 */
export function RelationshipPanel({ npcId, onClose }: RelationshipPanelProps) {
  const { getNPCById, getMemoryForNPC } = useNPCMemory();

  const npc = useMemo(() => getNPCById(npcId), [npcId, getNPCById]);
  const memory = useMemo(() => getMemoryForNPC(npcId), [npcId, getMemoryForNPC]);

  const relationshipLevel = memory?.relationshipLevel ?? 0;
  const relationshipInfo = getRelationshipLabel(relationshipLevel);

  // Calculate meter position (0-100 range for display)
  const meterPosition = ((relationshipLevel + 100) / 200) * 100;

  if (!npc) {
    return null;
  }

  return (
    <motion.div
      data-testid="relationship-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-full w-96 bg-surface shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-100">{npc.name}</h2>
            <p className="text-sm text-gray-400">{npc.role}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Close panel"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6L18 18" />
            </svg>
          </button>
        </div>

        <p className="mt-2 text-sm text-gray-500">{npc.description}</p>
      </div>

      {/* Trust broken indicator */}
      {memory?.trustBroken && (
        <div
          data-testid={`trust-broken-${npcId}`}
          className="mx-6 mt-4 px-3 py-1.5 bg-red-900/30 border border-red-800/50 rounded text-xs text-red-300 font-medium"
        >
          Trust Broken
        </div>
      )}

      {/* Relationship meter */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Relationship</span>
          <span
            data-testid={`trust-level-${npcId}`}
            data-trust-value={relationshipLevel}
            className={`text-sm font-semibold ${relationshipInfo.color}`}
          >
            {relationshipInfo.label}
          </span>
        </div>

        {/* Meter bar */}
        <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 flex">
            <div className="w-1/2 bg-gradient-to-r from-red-600 to-yellow-500" />
            <div className="w-1/2 bg-gradient-to-r from-yellow-500 to-green-500" />
          </div>

          {/* Indicator */}
          <div
            className="absolute top-0 h-full w-1 bg-white shadow-lg transition-all duration-300"
            style={{ left: `${meterPosition}%`, transform: 'translateX(-50%)' }}
          />

          {/* Center line */}
          <div className="absolute top-0 left-1/2 h-full w-0.5 bg-gray-900/50" />
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-1 text-xs text-gray-600">
          <span>-100</span>
          <span>0</span>
          <span>+100</span>
        </div>
      </div>

      {/* Conflict history */}
      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          History
        </h3>

        {(!memory || memory.events.length === 0) ? (
          <p className="text-gray-500 text-sm italic">
            You have no notable history with {npc.name}.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Show events in reverse chronological order */}
            {[...memory.events].reverse().map((event) => {
              const badge = getEscalationBadge(event.escalationLevel);
              const outcomeText =
                event.outcome === 'PLAYER_WON'
                  ? 'You prevailed'
                  : event.outcome === 'PLAYER_GAVE'
                    ? 'You backed down'
                    : 'They backed down';

              return (
                <div
                  key={event.id}
                  className="bg-surface-light rounded-lg p-4"
                >
                  {/* Time and badge */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-300 mb-1">
                    {event.description}
                  </p>

                  {/* Outcome */}
                  <p className="text-xs text-gray-500">
                    {outcomeText}
                  </p>

                  {/* Event type indicator */}
                  {event.type === 'TARGETED_BY_VIOLENCE' && (
                    <p className="text-xs text-red-400 mt-1">
                      Directly involved
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
