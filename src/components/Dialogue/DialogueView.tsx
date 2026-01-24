import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDialogue } from '@/hooks/useDialogue';
import { useCharacter } from '@/hooks/useCharacter';
import { useNPCMemory } from '@/hooks/useNPCMemory';
import { TopicChips } from '@/components/Dialogue/TopicChips';
import { TypewriterText } from '@/components/Dialogue/TypewriterText';
import { InnerVoice } from '@/components/Dialogue/InnerVoice';
import { DiscoverySummary } from '@/components/Dialogue/DiscoverySummary';
import { DialogueOptionCard } from '@/components/Dialogue/DialogueOptionCard';
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
 * - SELECTING_TOPIC: TopicChips + optional "Press the Matter" button
 * - STREAMING_RESPONSE: TypewriterText streaming
 * - SHOWING_DISCOVERY: DiscoverySummary overlay
 */
export function DialogueView() {
  const { state, generateOptions, sendSelectedOption, endConversation, dispatch } = useDialogue();
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
  // Include both player dialogue and NPC response for the player voice experience
  const historyText = state.conversationHistory
    .map((turn) => {
      const playerLine = turn.playerDialogue && !turn.playerDialogue.startsWith('[Topic:')
        ? `**You:** "${turn.playerDialogue}"\n\n`
        : '';
      return playerLine + turn.npcResponse;
    })
    .join('\n\n---\n\n');
  const currentPlayerLine = state.selectedOption && state.phase === 'STREAMING_RESPONSE'
    ? `**You:** "${state.selectedOption.text}"\n\n`
    : '';
  const displayText = state.phase === 'STREAMING_RESPONSE'
    ? (historyText
        ? historyText + '\n\n---\n\n' + currentPlayerLine + state.streamingText
        : currentPlayerLine + state.streamingText)
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
            <>
              <TopicChips
                topics={state.availableTopics}
                onSelect={(topic) => {
                  generateOptions(topic);
                }}
              />

              {/* "Press the Matter" — shown when NPC deflected a topic */}
              {state.npcDeflected && state.currentNPC && npc && (
                <button
                  data-testid="press-the-matter"
                  onClick={() => {
                    endConversation();
                    window.dispatchEvent(new CustomEvent('dialogue-conflict', {
                      detail: {
                        npcId: state.currentNPC,
                        stakes: `Force ${npc.name} to reveal what they know about ${state.deflectedTopicLabel}`,
                      },
                    }));
                  }}
                  className="mt-3 w-full text-center text-amber-300 hover:text-amber-100 text-sm py-2 px-3 rounded border border-amber-600/50 hover:border-amber-400 bg-amber-900/20 transition-colors cursor-pointer"
                >
                  Press the matter — Force {npc.name} to talk about {state.deflectedTopicLabel}
                </button>
              )}
            </>
          )}

          {state.phase === 'GENERATING_OPTIONS' && (
            <p className="text-gray-500 text-sm italic text-center py-2">
              You consider your words...
            </p>
          )}

          {state.phase === 'SELECTING_OPTION' && (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                How do you speak?
              </p>
              {state.dialogueOptions.map((option) => (
                <DialogueOptionCard
                  key={option.id}
                  option={option}
                  onSelect={sendSelectedOption}
                />
              ))}
            </div>
          )}

          {state.phase === 'STREAMING_RESPONSE' && (
            <p className="text-gray-500 text-sm italic text-center py-2">
              Listening...
            </p>
          )}

          {state.phase === 'RESPONSE_COMPLETE' && (
            <button
              data-testid="dialogue-continue"
              onClick={() => dispatch({ type: 'ACKNOWLEDGE_RESPONSE' })}
              className="w-full text-center text-gray-300 hover:text-white text-sm py-2 rounded border border-gray-600 hover:border-gray-400 transition-colors cursor-pointer"
            >
              Continue...
            </button>
          )}
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
