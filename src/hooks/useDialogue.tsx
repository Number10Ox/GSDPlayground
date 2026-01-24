import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
  type Dispatch,
} from 'react';
import { dialogueReducer, initialDialogueState } from '@/reducers/dialogueReducer';
import type { DialogueState, DialogueAction, Topic, ConversationTurn } from '@/types/dialogue';
import type { Discovery } from '@/types/investigation';
import type { StatName } from '@/types/character';
import { useInvestigation } from '@/hooks/useInvestigation';
import { useCharacter } from '@/hooks/useCharacter';
import { useNPCMemory } from '@/hooks/useNPCMemory';
import { useTown } from '@/hooks/useTown';
import { mockDialogueEndpoint } from '@/utils/mockDialogue';
import { getInnerVoiceInterjection } from '@/utils/innerVoiceTemplates';

interface DialogueContextValue {
  state: DialogueState;
  dispatch: Dispatch<DialogueAction>;
  sendMessage: (topic: Topic) => Promise<void>;
  endConversation: () => void;
}

const DialogueContext = createContext<DialogueContextValue | null>(null);

/**
 * parseDiscoveryMarkers - Extracts [DISCOVERY: factId|sinId|content] markers from response text.
 * Returns the cleaned text and extracted discoveries.
 */
function parseDiscoveryMarkers(
  responseText: string,
  npcId: string
): { cleanText: string; discoveries: Discovery[] } {
  const discoveryPattern = /\[DISCOVERY:\s*([^|]+)\|([^|]*)\|([^\]]+)\]/g;
  const discoveries: Discovery[] = [];
  let match: RegExpExecArray | null;

  while ((match = discoveryPattern.exec(responseText)) !== null) {
    const factId = match[1]?.trim() ?? '';
    const sinId = match[2]?.trim() || null;
    const content = match[3]?.trim() ?? '';

    discoveries.push({
      id: `discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      factId,
      sinId,
      npcId,
      content,
      timestamp: Date.now(),
      newConnections: sinId ? [sinId] : [],
    });
  }

  // Remove discovery markers from display text
  const cleanText = responseText.replace(discoveryPattern, '').trim();

  return { cleanText, discoveries };
}

/**
 * extractSafeDisplayText - Splits buffered text into safe-to-display and held-back portions.
 * Strips complete [DISCOVERY:...] and [DEFLECTED] markers entirely.
 * Holds back any trailing text that starts with '[' and could be the beginning of a marker.
 */
function extractSafeDisplayText(buffer: string): { safe: string; held: string } {
  // Strip any complete markers
  let cleaned = buffer
    .replace(/\[DISCOVERY:\s*[^\]]*\]/g, '')
    .replace(/\[DEFLECTED\]/g, '');

  // Check if there's an incomplete bracket sequence at the end
  // that could be the start of a marker
  const lastBracket = cleaned.lastIndexOf('[');
  if (lastBracket !== -1) {
    const afterBracket = cleaned.slice(lastBracket);
    // If there's no closing bracket, this might be a partial marker — hold it back
    if (!afterBracket.includes(']')) {
      const markerStarts = ['[D', '[DE', '[DISC', '[DEFLEC'];
      const couldBeMarker = markerStarts.some(prefix => afterBracket.startsWith(prefix)) || afterBracket === '[';
      if (couldBeMarker) {
        return {
          safe: cleaned.slice(0, lastBracket),
          held: buffer.slice(buffer.lastIndexOf('[')),
        };
      }
    }
  }

  return { safe: cleaned, held: '' };
}

/**
 * parseDeflectionMarker - Checks for [DEFLECTED] marker in response text.
 * Returns the cleaned text and whether deflection occurred.
 */
function parseDeflectionMarker(text: string): { cleanText: string; deflected: boolean } {
  const deflected = text.includes('[DEFLECTED]');
  const cleanText = text.replace(/\[DEFLECTED\]/g, '').trim();
  return { cleanText, deflected };
}

/**
 * getHighestStat - Returns the stat name with the most dice.
 */
function getHighestStat(stats: Record<StatName, { dice: { id: string }[] }>): StatName {
  const statNames: StatName[] = ['acuity', 'heart', 'body', 'will'];
  let highest: StatName = 'acuity';
  let highestCount = 0;

  for (const name of statNames) {
    const count = stats[name]?.dice.length ?? 0;
    if (count > highestCount) {
      highest = name;
      highestCount = count;
    }
  }

  return highest;
}

/**
 * DialogueProvider - Wraps children with dialogue state and actions.
 *
 * Manages the dialogue FSM, streaming from /api/dialogue endpoint,
 * discovery extraction, deflection detection, inner voice interjections,
 * and trust tracking.
 */
/**
 * buildRelationshipStrings - Derives human-readable relationship descriptions
 * for an NPC from the town's NPC list and sin chain context.
 */
function buildRelationshipStrings(npcId: string, npcs: import('@/types/npc').NPC[], sinChain: import('@/types/investigation').SinNode[]): string[] {
  const relationships: string[] = [];
  const thisNpc = npcs.find(n => n.id === npcId);
  if (!thisNpc) return relationships;

  // Find other NPCs linked to the same sins
  for (const sin of sinChain) {
    if (!sin.linkedNpcs.includes(npcId)) continue;
    const otherNpcs = sin.linkedNpcs
      .filter(id => id !== npcId)
      .map(id => npcs.find(n => n.id === id))
      .filter(Boolean);
    for (const other of otherNpcs) {
      relationships.push(`You are connected to ${other!.name} (${other!.role}) through the matter of "${sin.name}".`);
    }
  }

  return relationships;
}

/**
 * buildTownSituation - Creates a narrative summary of the town's state
 * from the NPC's perspective, filtered by what they know.
 */
function buildTownSituation(npcId: string, sinChain: import('@/types/investigation').SinNode[], townName: string): string {
  const linkedSins = sinChain.filter(s => s.linkedNpcs.includes(npcId));
  if (linkedSins.length === 0) {
    return `${townName} has troubles, though you are not privy to all of them.`;
  }
  const sinDescriptions = linkedSins.map(s => s.description).join(' ');
  return `You know the following about ${townName}'s troubles: ${sinDescriptions}`;
}

export function DialogueProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dialogueReducer, initialDialogueState);
  const { dispatch: investigationDispatch } = useInvestigation();
  const { character } = useCharacter();
  const { getMemoryForNPC, getNPCById, dispatch: npcDispatch } = useNPCMemory();
  const town = useTown();

  /**
   * sendMessage - Handles a complete exchange: topic -> streaming response -> discoveries.
   */
  const sendMessage = useCallback(
    async (topic: Topic) => {
      if (!state.currentNPC) return;

      // Advance FSM: select topic (transitions directly to STREAMING_RESPONSE)
      dispatch({ type: 'SELECT_TOPIC', topic });

      const npcId = state.currentNPC;
      const npc = getNPCById(npcId);
      const memory = getMemoryForNPC(npcId);
      const trustLevel = memory?.relationshipLevel ?? 0;

      // Build rich context for the NPC prompt
      const npcRelationships = npc
        ? buildRelationshipStrings(npcId, town.npcs, town.sinChain)
        : [];
      const townSituation = npc
        ? buildTownSituation(npcId, town.sinChain, town.name)
        : undefined;

      let response: Response;

      try {
        response = await fetch('/api/dialogue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            npcId,
            npcName: npc?.name ?? 'Unknown',
            npcRole: npc?.role ?? 'Townsperson',
            npcPersonality: npc?.knowledge?.personality ?? '',
            npcFacts: npc?.knowledge?.facts ?? [],
            npcMotivation: npc?.knowledge?.motivation,
            npcDesire: npc?.knowledge?.desire,
            npcFear: npc?.knowledge?.fear,
            npcRelationships,
            townSituation,
            topic: topic.label,
            trustLevel,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
      } catch {
        // Fall back to mock in dev mode
        if (import.meta.env.DEV) {
          response = mockDialogueEndpoint(topic.label, npc?.name ?? 'NPC', trustLevel, npc?.knowledge?.facts);
        } else {
          // In production, dispatch an error state (reset to topic selection)
          dispatch({ type: 'END_CONVERSATION' });
          return;
        }
      }

      // Stream response
      const reader = response.body?.getReader();
      if (!reader) {
        dispatch({ type: 'END_CONVERSATION' });
        return;
      }

      const decoder = new TextDecoder();
      let fullText = '';
      let displayBuffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;

          // Buffer text and strip markers before displaying.
          // We hold back any trailing partial marker (text starting with '[' that
          // could be the beginning of [DISCOVERY:...] or [DEFLECTED]).
          displayBuffer += chunk;
          const { safe, held } = extractSafeDisplayText(displayBuffer);
          displayBuffer = held;

          if (safe) {
            dispatch({ type: 'APPEND_RESPONSE', text: safe });
          }
        }

        // Flush any remaining buffered text that wasn't a marker
        if (displayBuffer) {
          const flushed = displayBuffer
            .replace(/\[DISCOVERY:\s*[^\]]*\]/g, '')
            .replace(/\[DEFLECTED\]/g, '')
            .trim();
          if (flushed) {
            dispatch({ type: 'APPEND_RESPONSE', text: flushed });
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Parse deflection marker
      const { cleanText: textAfterDeflection, deflected } = parseDeflectionMarker(fullText);

      // Parse discovery markers from full response
      const { cleanText, discoveries } = parseDiscoveryMarkers(textAfterDeflection, npcId);

      // Record discoveries in investigation state
      for (const discovery of discoveries) {
        investigationDispatch({ type: 'RECORD_DISCOVERY', discovery });
      }

      // Determine inner voice interjection
      let innerVoice: ConversationTurn['innerVoice'] = undefined;
      if (character) {
        const highestStat = getHighestStat(character.stats);
        // Determine situation based on context
        const situation = discoveries.length > 0
          ? (discoveries.some(d => d.sinId) ? 'sin-connection' : 'new-discovery')
          : deflected
            ? 'npc-evasion'
            : trustLevel < -20
              ? 'trust-low'
              : trustLevel > 30
                ? 'trust-high'
                : 'npc-evasion';

        const interjection = getInnerVoiceInterjection(highestStat, situation);
        if (interjection) {
          innerVoice = { stat: highestStat, text: interjection };
        }
      }

      // Create conversation turn
      const turn: ConversationTurn = {
        topic: topic.label,
        playerDialogue: `[Topic: ${topic.label}]`,
        npcResponse: cleanText || textAfterDeflection,
        innerVoice,
      };

      // Finish response - transitions to RESPONSE_COMPLETE
      dispatch({ type: 'FINISH_RESPONSE', turn, discoveries });

      // Mark deflection if NPC withheld info
      if (deflected) {
        dispatch({ type: 'MARK_DEFLECTION', topicLabel: topic.label });
      }

      // Build trust from conversation — +8 per exchange with this NPC
      npcDispatch({ type: 'UPDATE_RELATIONSHIP', npcId, delta: 8 });

      // Ripple trust to sin-linked NPCs (word spreads that you're trustworthy)
      const linkedNpcIds = town.sinChain
        .filter(sin => sin.linkedNpcs.includes(npcId))
        .flatMap(sin => sin.linkedNpcs);
      const uniqueLinked = [...new Set(linkedNpcIds)];
      if (uniqueLinked.length > 1) {
        npcDispatch({ type: 'RIPPLE_TRUST', sourceNpcId: npcId, delta: 8, linkedNpcIds: uniqueLinked });
      }

      // Discovery trust bonus: discovering sin-linked facts builds trust with other NPCs on that sin
      for (const discovery of discoveries) {
        if (discovery.sinId) {
          const sinNode = town.sinChain.find(s => s.id === discovery.sinId);
          if (sinNode && sinNode.linkedNpcs.length > 0) {
            npcDispatch({
              type: 'RIPPLE_TRUST',
              sourceNpcId: npcId,
              delta: 10,
              linkedNpcIds: sinNode.linkedNpcs,
            });
          }
        }
      }
    },
    [state.currentNPC, dispatch, character, getNPCById, getMemoryForNPC, town, npcDispatch, investigationDispatch]
  );

  /**
   * endConversation - Immediately ends the current conversation.
   */
  const endConversation = useCallback(() => {
    dispatch({ type: 'END_CONVERSATION' });
  }, [dispatch]);

  return (
    <DialogueContext.Provider value={{ state, dispatch, sendMessage, endConversation }}>
      {children}
    </DialogueContext.Provider>
  );
}

/**
 * useDialogue - Hook for accessing dialogue state and actions.
 * Must be used within a DialogueProvider.
 */
export function useDialogue() {
  const context = useContext(DialogueContext);
  if (!context) {
    throw new Error('useDialogue must be used within a DialogueProvider');
  }
  return context;
}
