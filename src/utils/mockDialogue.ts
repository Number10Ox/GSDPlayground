import type { KnowledgeFact } from '@/types/dialogue';

/**
 * Pre-written DitV-style dialogue responses for local development.
 * Organized by topic for variety without API calls.
 * These are substantive, character-driven exchanges with concrete details,
 * emotional stakes, and NPC agency (requests, demands, confessions).
 */
const MOCK_RESPONSES: Record<string, string[]> = {
  greeting: [
    `[Player]: Good day. I notice the shutters on the east houses are all drawn tight. Curious for midday. And the garden plots — half of them have gone to seed. Someone stopped tending this town weeks ago.
[Sister Martha]: She steps back half a pace, hands twisting in her apron. You see too much for a traveling man, Brother. The shutters... folk are afraid. Ever since the Steward made his decree about the medicine, people have been falling ill. First me, then the Haywood children, then old Matthias. Those who spoke against the Steward's ruling — they are the ones getting sick. I do not say it is connected. But I notice it. And now you notice it too. She leans closer, voice dropping. If you are truly a Dog of the King, then look at who benefits from the silence. Look at who still has their health.`,
    `[Player]: Peace be with you, Sister. You look weary — truly weary, down to the bone. How long has it been since someone asked how you are faring?
[Sister Martha]: Her composure cracks. She presses a hand to her mouth, then steadies herself. Forgive me, Brother. It has been... months. Since before the decree. I was the town midwife — I brought every child in this town into the world. Now the Steward says my sickness is the King's judgment, and folk cross the street when they see me coming. She wrings her hands, voice thickening. Only Thomas still visits. He risks everything to bring me herbs at night. If the Sheriff catches him... Brother, I do not ask you to take my side. I ask you to look at what has happened here and judge with your own eyes. A town that turns away its healer — what kind of faith is that?`,
    `[Player]: I have ridden far and I have little patience for evasion. I am a Dog of the Vineyard and I expect the truth, plainly spoken.
[Sister Martha]: She straightens, something like relief passing across her face. Good. I am glad you are not the gentle sort. Gentleness will not serve you here. She meets his eye directly. The Steward — Ezekiel — has this town in a grip. He made a decree three months past that my illness is divine judgment. No one may sell me medicine or tend to me. But Brother, I was healthy before his decree. The sickness came after, not before. She holds up her trembling hands. I need you to understand what I am telling you. He declared me cursed, and then I became sick. Not the other way around. Whether that is coincidence or something darker, I leave to your judgment. But I beg you — do not simply take his word as gospel. Question him. Press him. He is not accustomed to being challenged.`,
    `[Player]: The King of Life has sent me to judge the state of this congregation. I would hear your testimony, Sister, as one of the faithful.
[Sister Martha]: She clasps her hands as if in prayer, eyes glistening. Praise be. Praise be that He has not forgotten us. She sinks onto a stool, suddenly exhausted with relief. Brother, I will give you my testimony and you may weigh it as you see fit. I was the midwife of this town for twelve years. I served the faithful with my hands and my herbs. Then Steward Ezekiel declared that my illness — which I did not yet have — was the King's judgment. He forbade my treatment. Within a week, I fell sick. She looks up at him with desperate clarity. I believe the Steward's pride has opened a door that should remain shut. The sickness spreading through this town is not natural. It follows his decrees like a shadow follows a man. I do not accuse him of sorcery — but I say his pride has made a crack in this town's faith, and something has crept through it. Please, Brother. Confront him. Before more children fall ill.`,
  ],
  town: [
    `[Player]: I have counted four families but only three plots under till. The Whitfield place has gone to seed. And the chapel bell has not rung since I arrived — that is three days without services.
[Brother Ezra]: He sets down his hoe and wipes his brow, looking at the Dog with a mixture of wariness and hope. You are sharp, Brother. Sharper than the last Dog who came through — that one took the Steward's word and rode on. He lowers his voice. The Whitfield plot lies fallow because old Matthias Whitfield questioned the Steward's decree about Sister Martha. Within a week he was too sick to work. Coincidence, the Steward says. The King's will, the Steward says. He spits in the dust. As for services — Ezekiel stopped holding them when folk started asking why the Book of Life contradicts his teachings. He says we are not ready to hear the Word yet. That we must first prove our obedience. He meets the Dog's eye. Brother, I know what that sounds like. I know it sounds like false doctrine. I am only a farmer. I do not have the authority to say such things. But you do.`,
    `[Player]: How fare the children, friend? They seemed quiet when I rode in. I am used to children running to see a Dog's horse.
[Brother Ezra]: His face crumbles for a moment before he masters himself. The children know something is wrong, Brother. They feel it in their bones the way animals feel a storm coming. He sits on an upturned bucket, suddenly looking ten years older. My own girl — Ruth Ann — she asked me last week why the King of Life makes people sick for asking questions. He pinches the bridge of his nose. I did not know what to tell her. Because the truth is, I do not believe the King does that. I believe the Steward does. Or... something the Steward's pride has let in. He looks up. Three children have fallen ill, Brother. All from families who spoke against the decree. Sister Martha — she is a healer, she would know what to do, but she can barely stand herself. Thomas brings her what herbs he can steal, but she needs proper medicine and rest. She needs someone with authority to lift the Steward's decree. Can you do that, Brother? Can a Dog override a Steward's word?`,
    `[Player]: This town has a problem and I intend to find it. I can smell rot, and I do not mean the crops. Do not make me dig — it goes faster when folk talk willingly.
[Brother Ezra]: He straightens his back, decision firming on his face. Good. Good. I am tired of being afraid. He steps closer. The Steward — Ezekiel — he rules this town like his own kingdom. The Sheriff does his bidding. The store follows his decrees. And anyone who questions him falls sick within the week. He counts off on calloused fingers. Martha — denied medicine, now wasting away. Matthias Whitfield — questioned the decree, bedridden within days. The Haywood children — their father spoke up at what passes for services, and both his little ones took ill. He meets the Dog's eye unflinching. I will not say it is sorcery. I do not know that word's weight well enough to throw it. But I will say this: the Steward's pride has brought something into this town that was not here before. And it feeds on obedience. Those who submit stay healthy. Those who resist get sick. You are a Dog. You have authority he cannot ignore. Use it, Brother. Before we lose anyone else.`,
    `[Player]: The King of Life sees what is hidden. I am His instrument of judgment in this place. I would hear the truth of this town's spiritual state — not rumor, but testimony you would swear before the Throne.
[Brother Ezra]: He removes his hat and holds it to his chest, standing as one might stand before an altar. Then hear my testimony, Brother, and may the King weigh it justly. He speaks with the careful cadence of a man who has rehearsed these words in his mind many times. Steward Ezekiel has set himself above the Book of Life. He preaches doctrine of his own making. He has decreed that sickness is divine judgment, and he alone decides who the King has judged. He used this power to deny care to Sister Martha, the midwife who served this town faithfully for twelve years. Since his decree, a sickness has spread — but only to those who oppose him. The faithful who obey remain healthy. He puts his hat back on, hands trembling. I do not make accusations lightly, Brother. But I believe the Steward's pride has cracked the spiritual foundation of this town, and something has entered through that crack. Whether it is demonic in nature or merely the natural consequence of sin, I cannot say. But the children are sick now, Brother. The children. Whatever judgment you bring, bring it soon.`,
  ],
};

/**
 * Discovery markers embedded in mock responses.
 * These allow the mental map to populate during dev mode.
 * Format: [DISCOVERY: factId|sinId|content]
 */
const DISCOVERY_MARKERS: Record<string, string> = {
  greeting: '[DISCOVERY: martha-decree-1|sin-injustice|The Steward decreed Sister Martha\'s illness is divine judgment]',
  town: '[DISCOVERY: ruth-observe-2|sin-pride|The Steward meets with Sheriff Jacob every morning and the Sheriff does whatever he says]',
};

/**
 * Deflection responses used when NPC has trust-gated knowledge the player cannot access yet.
 */
const DEFLECTION_RESPONSES: string[] = [
  `[Player]: I need to know more about this. Tell me everything.
[NPC]: They shift uncomfortably, looking past the Dog toward the chapel. I... I have said what I can say, Brother. Some things are not mine to tell. Not yet. Not until I know... She trails off, wringing her hands. Perhaps if you spoke with others first. Built some understanding of what we face here. Then I might speak more freely.`,
  `[Player]: Do not hold back from me. I need the full truth of this matter.
[NPC]: Their jaw sets, a flash of something — guilt? fear? — crossing their face before they master it. You ask for more than I can give, Brother. Not because I doubt your authority. But because... She glances at the door. ...because words spoken cannot be unspoken. And some truths carry consequences for those who voice them. Earn the trust of this town first. Then perhaps the truth will come more easily.`,
  `[Player]: I can see you know more than you are saying. The King demands honesty.
[NPC]: They flinch at the invocation but hold their ground. The King also demands wisdom, Brother. And wisdom says that some knowledge is dangerous in the hands of one who does not yet understand the full picture. They meet the Dog's eyes briefly, then look away. I am not your enemy. But I am afraid. Come back when you have spoken to others. When you understand what is at stake. Then I will tell you what I know.`,
];

/**
 * Generic fallback responses when no specific topic match exists.
 */
const FALLBACK_RESPONSES: string[] = [
  `[Player]: I would hear what you know of this matter. Speak freely, friend.
[NPC]: They shift uncomfortably, avoiding the Dog's gaze. You ask difficult questions, Brother. Ones I am not certain I should answer. They glance toward the chapel on the hill. There are things happening in this town that... I notice them. Everyone notices them. But noticing and speaking are different matters when the Steward's Sheriff patrols the streets. They lower their voice. I can tell you what I have seen, if you promise me something — promise me you will not leave this town until the matter is settled. The last outsider who asked questions was escorted out before sundown. I cannot afford to speak and then be left alone with the consequences.`,
  `[Player]: Tell me, friend — when did the joy leave this place? Because I can feel its absence like a cold draft.
[NPC]: Their composure wavers. For a moment they look as though they might weep, then they master themselves. You are kind to ask, Brother. Kinder than... than most have been of late. They press their palms together to stop the trembling. There is a weight on this town. Not just the sickness — though that is terrible enough. It is the silence. We used to speak freely. We used to help each other. Now everyone watches what they say, who they are seen with. They look up with desperate eyes. I want to tell you everything. I do. But you must understand — if I speak and you leave, I will pay for it. My family will pay for it. Can you promise me protection, Brother? Can a Dog's word shield me from what comes after?`,
  `[Player]: The King of Life demands honesty from His children. I carry His authority in this place. Do not test my patience with evasion.
[NPC]: They bow their head briefly, then raise it with something approaching resolve. Forgive me, Brother. I have been silent too long, and silence becomes a habit that is hard to break. They fold their hands as if in prayer. The town is sick, Brother. Not just in body — in spirit. The Steward has set himself above the Book of Life. He preaches his own doctrine. He decides who receives the King's mercy and who receives His wrath. And somehow — I do not claim to understand how — his pronouncements come true. Those he declares judged fall ill. Those he favors remain healthy. Their voice drops to barely a whisper. I have obeyed. I have kept silent. And I am healthy. What does that tell you about me, Brother? What does my health say about my faithfulness — or my cowardice? They look at the Dog with haunted eyes. Judge me if you must. But judge him first. Please.`,
];

/**
 * mockDialogueResponse - Returns a pre-written DitV-style dialogue response
 * for local development without requiring API keys.
 *
 * If the topic has trust-gated facts that exceed the current trust level,
 * returns a deflection response with [DEFLECTED] marker.
 *
 * @param topic - The conversation topic
 * @param npcName - The NPC's name (used for personalization in fallbacks)
 * @param trustLevel - Current trust level with this NPC
 * @param npcFacts - NPC's knowledge facts (for deflection detection)
 * @returns A complete dialogue response string
 */
export function mockDialogueResponse(
  topic: string,
  npcName: string,
  trustLevel: number,
  npcFacts?: KnowledgeFact[]
): string {
  // Check if this topic has trust-gated facts the player can't access
  const hasGatedFacts = npcFacts?.some(
    f => f.tags.includes(topic) && f.minTrustLevel > trustLevel
  );

  if (hasGatedFacts) {
    // Return a deflection response
    const index = Math.floor(Math.random() * DEFLECTION_RESPONSES.length);
    let responseText = DEFLECTION_RESPONSES[index] ?? DEFLECTION_RESPONSES[0];
    responseText = responseText.replace(/\[NPC\]/g, `[${npcName}]`);
    return responseText + '\n[DEFLECTED]';
  }

  let responseText: string;

  // Try to find a specific response for this topic
  const topicResponses = MOCK_RESPONSES[topic];
  if (topicResponses && topicResponses.length > 0) {
    const index = Math.floor(Math.random() * topicResponses.length);
    responseText = topicResponses[index] ?? FALLBACK_RESPONSES[0];
  } else {
    // Fall back to generic response, replacing NPC placeholder with name
    const index = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
    responseText = (FALLBACK_RESPONSES[index] ?? FALLBACK_RESPONSES[0]).replace(/\[NPC\]/g, `[${npcName}]`);
  }

  // Append discovery marker if available for this topic
  const marker = DISCOVERY_MARKERS[topic];
  if (marker) {
    responseText += '\n' + marker;
  }

  return responseText;
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
 * @param npcName - The NPC name
 * @param trustLevel - Current trust with this NPC
 * @param npcFacts - NPC's knowledge facts (for deflection detection)
 * @returns A Response with streaming body
 */
export function mockDialogueEndpoint(
  topic: string,
  npcName: string,
  trustLevel: number,
  npcFacts?: KnowledgeFact[]
): Response {
  const text = mockDialogueResponse(topic, npcName, trustLevel, npcFacts);
  const stream = createMockStream(text);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}
