import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Relationship } from '@/types/character';
import type { Die } from '@/types/game';
import type { ConflictAction } from '@/types/conflict';
import { rollDie } from '@/utils/dice';
import { DieIcon } from '@/components/DicePool/DieIcon';

interface RelationshipDiceProps {
  relationships: Relationship[];
  conflictNpcId: string;
  usedRelationships: string[];
  dispatch: React.Dispatch<ConflictAction>;
}

/**
 * RelationshipDice - Shows relationships that can provide dice in the current conflict.
 *
 * Relationships with the conflict NPC are highlighted as directly relevant.
 * Other relationships are shown as "may be relevant" (player decides).
 * Each relationship can be used once per conflict.
 */
export function RelationshipDice({
  relationships,
  conflictNpcId,
  usedRelationships,
  dispatch,
}: RelationshipDiceProps) {
  const handleUseRelationship = useCallback(
    (relationship: Relationship) => {
      // Roll the relationship's dice to create game Die objects
      const rolledDice: Die[] = relationship.dice.map((charDie) => ({
        id: `rel-die-${crypto.randomUUID()}`,
        type: charDie.type,
        value: rollDie(charDie.type),
        assignedTo: null,
      }));

      dispatch({
        type: 'USE_RELATIONSHIP',
        relationshipId: relationship.id,
        dice: rolledDice,
      });
    },
    [dispatch]
  );

  if (relationships.length === 0) {
    return null;
  }

  // Sort: direct relationship with conflict NPC first
  const sorted = [...relationships].sort((a, b) => {
    const aIsDirect = a.npcId === conflictNpcId ? -1 : 0;
    const bIsDirect = b.npcId === conflictNpcId ? -1 : 0;
    return aIsDirect - bIsDirect;
  });

  return (
    <div data-testid="relationship-dice-panel" className="mt-4">
      <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2">
        Relationships
      </h3>
      <div className="space-y-2">
        <AnimatePresence>
          {sorted.map((rel) => {
            const isUsed = usedRelationships.includes(rel.id);
            const isDirect = rel.npcId === conflictNpcId;

            return (
              <motion.div
                key={rel.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isUsed ? 0.5 : 1, x: 0 }}
                className={`
                  flex items-center justify-between p-3 rounded-lg
                  ${isDirect ? 'bg-amber-900/20 border border-amber-700/40' : 'bg-surface border border-gray-700/40'}
                  ${isUsed ? 'opacity-50' : ''}
                `}
              >
                <div className="flex flex-col">
                  <span className={`font-medium ${isDirect ? 'text-amber-200' : 'text-gray-200'}`}>
                    {rel.npcName}
                  </span>
                  {isDirect && (
                    <span className="text-xs text-amber-400">Directly involved</span>
                  )}
                  {!isDirect && (
                    <span className="text-xs text-gray-500">May be relevant</span>
                  )}
                  {rel.description && (
                    <span className="text-xs text-gray-500 mt-0.5">{rel.description}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Show dice this relationship would add */}
                  <div className="flex gap-1">
                    {rel.dice.map((die) => (
                      <DieIcon key={die.id} type={die.type} value={0} size="sm" />
                    ))}
                  </div>

                  {isUsed ? (
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded">
                      Applied
                    </span>
                  ) : (
                    <button
                      data-testid={`use-relationship-${rel.id}`}
                      onClick={() => handleUseRelationship(rel)}
                      className="px-3 py-1 text-sm font-medium rounded
                        bg-amber-700 hover:bg-amber-600 text-amber-100 transition-colors"
                    >
                      Use
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
