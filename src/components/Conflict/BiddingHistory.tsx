import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConflictTurn, CurrentRaise } from '@/types/conflict';
import type { Die } from '@/types/game';
import { DieIcon } from '@/components/DicePool/DieIcon';

interface BiddingHistoryProps {
  turns: ConflictTurn[];
  currentRaise: CurrentRaise | null;
  npcName: string;
}

/**
 * Get display name for actor
 */
function getActorName(actor: 'PLAYER' | 'NPC', npcName: string): string {
  return actor === 'PLAYER' ? 'You' : npcName;
}

/**
 * Get action label with formatting
 */
function getActionLabel(action: 'RAISE' | 'SEE' | 'GIVE' | 'ESCALATE'): {
  text: string;
  className: string;
} {
  switch (action) {
    case 'RAISE':
      return { text: 'Raised', className: 'text-amber-400' };
    case 'SEE':
      return { text: 'Saw', className: 'text-green-400' };
    case 'GIVE':
      return { text: 'Gave', className: 'text-red-400' };
    case 'ESCALATE':
      return { text: 'Escalated', className: 'text-red-500 font-bold' };
    default:
      return { text: action, className: 'text-gray-400' };
  }
}

/**
 * Get see type description based on dice count (DitV rules)
 */
function getSeeType(diceCount: number): { text: string; dangerous: boolean } {
  if (diceCount === 1) {
    return { text: 'Reversed the Blow', dangerous: false };
  }
  if (diceCount === 2) {
    return { text: 'Blocked/Dodged', dangerous: false };
  }
  return { text: 'Took the Blow', dangerous: true };
}

/**
 * Small dice display for history
 */
function DiceDisplay({ dice }: { dice: Die[] }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {dice.map((die) => (
        <div key={die.id} className="scale-75 origin-center">
          <DieIcon type={die.type} value={die.value} size="sm" />
        </div>
      ))}
    </div>
  );
}

/**
 * Single turn card in history
 */
function TurnCard({
  turn,
  npcName,
}: {
  turn: ConflictTurn;
  npcName: string;
}) {
  const actorName = getActorName(turn.actor, npcName);
  const actionLabel = getActionLabel(turn.action);
  const total = turn.dice.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 bg-surface rounded-lg border border-gray-700"
    >
      {/* Header: Actor and action */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-200">{actorName}</span>
        <span className={`text-sm ${actionLabel.className}`}>{actionLabel.text}</span>
      </div>

      {/* Dice and total */}
      {turn.dice.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <DiceDisplay dice={turn.dice} />
          {turn.action === 'RAISE' && (
            <span className="text-sm text-gray-400">= {total}</span>
          )}
          {turn.action === 'SEE' && (
            <>
              <span className="text-sm text-gray-400">= {total}</span>
              {(() => {
                const seeType = getSeeType(turn.dice.length);
                return (
                  <span
                    className={`text-xs ml-2 ${seeType.dangerous ? 'text-red-400' : 'text-gray-500'}`}
                  >
                    ({seeType.text})
                  </span>
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-gray-400 italic">{turn.description}</p>
    </motion.div>
  );
}

/**
 * BiddingHistory - Scrollable turn history log for conflict.
 *
 * Shows all raises, sees, escalations, and gives with dice and descriptions.
 * Displays special see types (Reversed the Blow, Blocked/Dodged, Took the Blow).
 * Auto-scrolls to bottom when new turns are added.
 */
export function BiddingHistory({
  turns,
  currentRaise,
  npcName,
}: BiddingHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when turns change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns.length, currentRaise]);

  return (
    <div
      ref={scrollRef}
      data-testid="bidding-history"
      className="flex flex-col gap-2 overflow-y-auto max-h-[400px] p-2"
    >
      {/* Pending raise indicator */}
      <AnimatePresence>
        {currentRaise && (
          <motion.div
            key="pending-raise"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-amber-900/30 rounded-lg border border-amber-600/50 mb-2"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 font-medium">Current Raise</span>
              <span className="text-amber-300 text-sm">{currentRaise.total}</span>
            </div>
            <DiceDisplay dice={currentRaise.dice} />
            <p className="text-amber-200/60 text-xs mt-2">Waiting for response...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Turn history */}
      {turns.length === 0 && !currentRaise ? (
        <div className="text-gray-500 text-sm text-center p-4">
          No actions yet. Make your first raise.
        </div>
      ) : (
        turns.map((turn) => (
          <TurnCard key={turn.id} turn={turn} npcName={npcName} />
        ))
      )}
    </div>
  );
}
