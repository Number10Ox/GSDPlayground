import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDialogue } from '@/hooks/useDialogue';
import { useInvestigation } from '@/hooks/useInvestigation';
import { useCharacter } from '@/hooks/useCharacter';
import { useNPCMemory } from '@/hooks/useNPCMemory';
import { TopicChips } from '@/components/Dialogue/TopicChips';
import { ApproachChips } from '@/components/Dialogue/ApproachChips';
import { TypewriterText } from '@/components/Dialogue/TypewriterText';
import { InnerVoice } from '@/components/Dialogue/InnerVoice';
import { DiscoverySummary } from '@/components/Dialogue/DiscoverySummary';
import { ConflictTrigger } from '@/components/Dialogue/ConflictTrigger';
import type { StatName } from '@/types/character';

import type { DieType } from '@/types/game';

const DIE_TYPE_VALUE: Record<DieType, number> = { d4: 1, d6: 2, d8: 3, d10: 4 };

/**
 * getHighestStat - Returns the character's strongest stat (by die type quality).
 */
function getHighestStat(stats: Record<StatName, { dice: { id: string; type: DieType }[] }>): StatName {
  const statNames: StatName[] = ['acuity', 'heart', 'body', 'will'];
  let highest: StatName = 'acuity';
  let highestValue = 0;

  for (const name of statNames) {
    const dieType = stats[name]?.dice[0]?.type ?? 'd4';
    const value = DIE_TYPE_VALUE[dieType] ?? 0;
    if (value > highestValue) {
      highest = name;
      highestValue = value;
    }
  }

  return highest;
}

/**
 * DialogueView - Main dialogue container orchestrating all sub-components.
 *
 * Full-screen overlay with dark backdrop, centered content panel.
 * Renders phase-appropriate UI:
 * - SELECTING_TOPIC: TopicChips
 * - SELECTING_APPROACH: ApproachChips
 * - STREAMING_RESPONSE: TypewriterText streaming
 * - SHOWING_DISCOVERY: DiscoverySummary overlay
 */
export function DialogueView() {
  const { state, sendMessage, endConversation, dispatch } = useDialogue();
  const { state: investigationState } = useInvestigation();
  const { character } = useCharacter();
  const { getNPCById } = useNPCMemory();
  const scrollRef = useRef<HTMLDivElement>(null);

  const npc = state.currentNPC ? getNPCById(state.currentNPC) : null;

  // Auto-scroll to bottom during streaming
  useEffect(() => {
    if (scrollRef.current && state.phase === 'STREAMING_RESPONSE') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.streamingText, state.phase]);

  // Don't render if not in a conversation (after all hooks to satisfy rules of hooks)
  if (state.phase === 'IDLE') return null;

  // Build full display text from conversation history + current streaming
  const historyText = state.conversationHistory
    .map((turn) => turn.npcResponse)
    .join('\n\n');
  const displayText = state.phase === 'STREAMING_RESPONSE'
    ? (historyText ? historyText + '\n\n' + state.streamingText : state.streamingText)
    : historyText;

  // Determine inner voice params
  const highestStat = character ? getHighestStat(character.stats) : 'acuity';
  const lastTurn = state.conversationHistory[state.conversationHistory.length - 1];
  const innerVoiceSituation = lastTurn?.innerVoice ? 'new-discovery' : 'npc-evasion';
  const showInnerVoice = state.phase === 'SELECTING_TOPIC' && state.conversationHistory.length > 0;

  return (
    <div
      data-testid="dialogue-view"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl h-[80vh] bg-gray-900 border border-gray-700 rounded-xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header: NPC info */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {/* NPC avatar - circle with initial */}
            <div className="w-10 h-10 rounded-full bg-gray-700 border border-gray-500 flex items-center justify-center">
              <span className="text-gray-200 font-bold text-lg">
                {npc?.name?.charAt(0) ?? '?'}
              </span>
            </div>
            <div>
              <h2 className="text-gray-100 font-semibold text-lg">{npc?.name ?? 'Unknown'}</h2>
              <p className="text-gray-400 text-sm">{npc?.role ?? 'Townsperson'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Fatigue indicator */}
            <span className="text-gray-500 text-xs">
              {investigationState.fatigueClock.current}/{investigationState.fatigueClock.max} fatigue
            </span>
            {/* Leave button */}
            <button
              onClick={endConversation}
              data-testid="dialogue-leave"
              className="text-gray-400 hover:text-gray-200 text-sm px-3 py-1 rounded border border-gray-600 hover:border-gray-400 transition-colors cursor-pointer"
            >
              Leave Conversation
            </button>
          </div>
        </div>

        {/* Middle: Conversation display */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-4 relative"
        >
          {displayText && (
            <TypewriterText
              text={displayText}
              isStreaming={state.phase === 'STREAMING_RESPONSE'}
            />
          )}

          {!displayText && state.phase === 'SELECTING_TOPIC' && (
            <p className="text-gray-500 italic text-sm">
              Choose a topic to begin the conversation...
            </p>
          )}

          {/* Inner Voice - positioned at bottom-left of content area */}
          <InnerVoice
            stat={highestStat}
            situation={innerVoiceSituation}
            visible={showInnerVoice}
          />
        </div>

        {/* Bottom: Interaction chips */}
        <div className="border-t border-gray-700 px-4 py-3">
          {state.phase === 'SELECTING_TOPIC' && (
            <TopicChips
              topics={state.availableTopics}
              onSelect={(topic) => {
                // When a topic is selected, we need to wait for approach
                dispatch({ type: 'SELECT_TOPIC', topic });
              }}
            />
          )}

          {state.phase === 'SELECTING_APPROACH' && character && (
            <ApproachChips
              onSelect={(approach) => {
                // Topic already selected (FSM at SELECTING_APPROACH).
                // sendMessage will handle SELECT_APPROACH dispatch and streaming.
                if (state.selectedTopic) {
                  sendMessage(state.selectedTopic, approach);
                }
              }}
              stats={character.stats}
            />
          )}

          {state.phase === 'STREAMING_RESPONSE' && (
            <p className="text-gray-500 text-sm italic text-center py-2">
              Listening...
            </p>
          )}

          {/* Conflict trigger - only for body/will approaches after response */}
          {state.phase === 'SELECTING_TOPIC' && state.currentNPC && npc?.conflictThresholds && (() => {
            const lastTurnApproach = state.conversationHistory[state.conversationHistory.length - 1]?.approach;
            if (lastTurnApproach === 'body' || lastTurnApproach === 'will') {
              return (
                <ConflictTrigger
                  npcId={state.currentNPC}
                  approach={lastTurnApproach}
                  conflictThresholds={npc.conflictThresholds}
                  onConflictStart={(npcId, stakes) => {
                    endConversation();
                    // Conflict will be handled by GameView via conflict start
                    window.dispatchEvent(new CustomEvent('dialogue-conflict', { detail: { npcId, stakes } }));
                  }}
                  forceTriggered={import.meta.env.DEV}
                />
              );
            }
            return null;
          })()}
        </div>

        {/* Discovery overlay */}
        <AnimatePresence>
          {state.phase === 'SHOWING_DISCOVERY' && (
            <DiscoverySummary
              discoveries={state.newDiscoveries}
              onClose={() => dispatch({ type: 'CLOSE_DISCOVERY' })}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
