import { motion } from 'framer-motion';
import type { Discovery } from '@/types/investigation';

interface DiscoverySummaryProps {
  discoveries: Discovery[];
  onClose: () => void;
}

/**
 * DiscoverySummary - End-of-exchange discovery reveal overlay.
 * Shows what was learned, with sin connections highlighted.
 * Fades in with slight scale animation.
 */
export function DiscoverySummary({ discoveries, onClose }: DiscoverySummaryProps) {
  if (discoveries.length === 0) return null;

  return (
    <motion.div
      data-testid="discovery-summary"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-gray-900 border border-amber-400/30 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-amber-200 text-lg font-semibold mb-4">You learned:</h3>
        <ul className="space-y-3">
          {discoveries.map((discovery) => (
            <li key={discovery.id} className="flex items-start gap-2">
              <span className="text-amber-400 mt-1 text-sm">&#9679;</span>
              <div>
                <p className="text-gray-200 text-sm">{discovery.content}</p>
                {discovery.sinId && (
                  <p className="text-red-300/80 text-xs mt-1 flex items-center gap-1">
                    <span className="inline-block w-3 h-3">
                      <svg viewBox="0 0 12 12" className="w-full h-full fill-red-400/60">
                        <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" />
                      </svg>
                    </span>
                    Connected to: {formatSinName(discovery.sinId)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          data-testid="discovery-continue"
          className="mt-6 w-full py-2 px-4 rounded-lg bg-amber-400/20 border border-amber-400/40
                     text-amber-200 text-sm font-medium hover:bg-amber-400/30 transition-colors cursor-pointer"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}

/**
 * formatSinName - Converts sin IDs to readable names.
 * e.g., "pride-001" -> "Pride", "demonic-attacks-002" -> "Demonic Attacks"
 */
function formatSinName(sinId: string): string {
  // Strip trailing ID numbers
  const baseName = sinId.replace(/-\d+$/, '');
  return baseName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
