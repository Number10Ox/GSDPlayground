import type { ApproachType } from '@/types/dialogue';

/**
 * Pre-written DitV-style dialogue responses for local development.
 * Organized by topic x approach for variety without API calls.
 */
const MOCK_RESPONSES: Record<string, Record<ApproachType, string[]>> = {
  greeting: {
    acuity: [
      '[Player]: Good day. I notice the shutters on the east houses are all drawn tight. Curious for midday.\n[Sister Martha]: Bless you, Brother. Folk have their reasons for keeping indoors. The sun is not the only thing that burns in this town.',
      '[Player]: Your hands are shaking, Sister. That is not the cold.\n[Sister Martha]: You see too much for a traveling man, Brother. The King of Life sends sharp eyes when He sends His Dogs.',
    ],
    heart: [
      '[Player]: Peace be with you, Sister. You look weary -- is all well?\n[Sister Martha]: Bless you for asking, Brother. It has been... a difficult season. But the King provides.',
      '[Player]: I can see you carry a burden. You need not bear it alone.\n[Sister Martha]: Your kindness undoes me, Brother. We have waited long for someone to notice.',
    ],
    body: [
      '[Player]: I have ridden far. I expect honest answers in this town.\n[Sister Martha]: We are God-fearing folk here, Brother. You will find no liars under this roof.',
      '[Player]: The Authority of the Dogs is not to be trifled with. I trust you understand.\n[Sister Martha]: Of course, Brother. We know our duty to the Faith.',
    ],
    will: [
      '[Player]: The King of Life has sent me. I would hear the state of your congregation.\n[Sister Martha]: Praise be, Brother. We have prayed for guidance. The faithful are... tested of late.',
      '[Player]: I speak with the authority of Bridal Falls. Tell me of this town.\n[Sister Martha]: As you command, Brother. We are obedient to the Dogs of the Vineyard.',
    ],
  },
  town: {
    acuity: [
      '[Player]: I have counted four families but only three plots under till. Who stopped working?\n[Brother Ezra]: You are observant, Brother. The Whitfield plot lies fallow since... since the trouble began.',
      '[Player]: The chapel bell has not rung since I arrived. That is irregular.\n[Brother Ezra]: The Steward has not called services in three Sabbaths, Brother. He says the faithful are not ready.',
    ],
    heart: [
      '[Player]: How fare the children? They seemed quiet when I rode in.\n[Brother Ezra]: The little ones feel what their parents try to hide, Brother. Fear runs through this town like creek water.',
      '[Player]: Tell me, friend -- when did the joy leave this place?\n[Brother Ezra]: It went piece by piece, Brother. First the laughter, then the singing, then the prayers.',
    ],
    body: [
      '[Player]: This town has a problem and I intend to find it. Do not make me dig.\n[Brother Ezra]: No need for threats, Brother. We are not the ones hiding. Look to the hill.',
      '[Player]: I have seen troubles before. Most folk cooperate once they see the coat.\n[Brother Ezra]: Your reputation precedes you, Brother. The Dog is not easily turned aside.',
    ],
    will: [
      '[Player]: The King of Life sees what is hidden. I am His instrument of sight. Speak.\n[Brother Ezra]: Then hear me, Brother -- there is a sickness in this congregation. It started with pride.',
      '[Player]: By the authority vested in me, I command an accounting of this town.\n[Brother Ezra]: The accounting is grim, Brother. We have strayed. The Steward most of all.',
    ],
  },
};

/**
 * Generic fallback responses when no specific topic/approach match exists.
 */
const FALLBACK_RESPONSES: Record<ApproachType, string> = {
  acuity: '[Player]: Something about this does not add up. Explain yourself.\n[NPC]: You ask difficult questions, Brother. I can only tell you what I know, and that is precious little.',
  heart: '[Player]: I can see this troubles you. Speak freely -- I am here to help.\n[NPC]: You are kind to ask, Brother. But some things are too heavy for words alone.',
  body: '[Player]: I did not ride all this way for silence. Out with it.\n[NPC]: Peace, Brother. I mean no disrespect. The truth is... complicated.',
  will: '[Player]: The King of Life demands honesty from His children. Do not test my patience.\n[NPC]: Forgive me, Brother. I will tell you what I can, though it shames me.',
};

/**
 * mockDialogueResponse - Returns a pre-written DitV-style dialogue response
 * for local development without requiring API keys.
 *
 * Used when import.meta.env.DEV is true, replacing the real LLM endpoint.
 *
 * @param topic - The conversation topic
 * @param approach - The approach type used
 * @param npcName - The NPC's name (used for personalization in fallbacks)
 * @returns A complete dialogue response string
 */
export function mockDialogueResponse(
  topic: string,
  approach: ApproachType,
  npcName: string
): string {
  // Try to find a specific response for this topic/approach combo
  const topicResponses = MOCK_RESPONSES[topic];
  if (topicResponses) {
    const approachResponses = topicResponses[approach];
    if (approachResponses && approachResponses.length > 0) {
      const index = Math.floor(Math.random() * approachResponses.length);
      return approachResponses[index] ?? FALLBACK_RESPONSES[approach];
    }
  }

  // Fall back to generic response, replacing NPC placeholder with name
  return FALLBACK_RESPONSES[approach].replace(/\[NPC\]/g, `[${npcName}]`);
}

/**
 * createMockStream - Creates a ReadableStream that simulates streaming
 * by emitting characters with a small delay.
 *
 * @param text - The full response text to stream
 * @param charDelay - Milliseconds between each character (default 20ms)
 * @returns A ReadableStream of text chunks
 */
export function createMockStream(text: string, charDelay = 20): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (index >= text.length) {
        controller.close();
        return;
      }

      // Emit 1-3 characters at a time for natural pacing
      const chunkSize = Math.min(1 + Math.floor(Math.random() * 3), text.length - index);
      const chunk = text.slice(index, index + chunkSize);
      index += chunkSize;

      controller.enqueue(encoder.encode(chunk));

      // Small delay to simulate streaming
      await new Promise((resolve) => setTimeout(resolve, charDelay));
    },
  });
}

/**
 * mockDialogueEndpoint - Simulates the full API endpoint for dev mode.
 * Returns a Response object with a streaming body.
 *
 * @param topic - The conversation topic
 * @param approach - The approach type
 * @param npcName - The NPC name
 * @returns A Response with streaming body
 */
export function mockDialogueEndpoint(
  topic: string,
  approach: ApproachType,
  npcName: string
): Response {
  const text = mockDialogueResponse(topic, approach, npcName);
  const stream = createMockStream(text);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}
