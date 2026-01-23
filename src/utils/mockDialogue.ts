import type { ApproachType } from '@/types/dialogue';

/**
 * Pre-written DitV-style dialogue responses for local development.
 * Organized by topic x approach for variety without API calls.
 * These are substantive, character-driven exchanges with concrete details,
 * emotional stakes, and NPC agency (requests, demands, confessions).
 */
const MOCK_RESPONSES: Record<string, Record<ApproachType, string[]>> = {
  greeting: {
    acuity: [
      `[Player]: Good day. I notice the shutters on the east houses are all drawn tight. Curious for midday. And the garden plots — half of them have gone to seed. Someone stopped tending this town weeks ago.
[Sister Martha]: She steps back half a pace, hands twisting in her apron. You see too much for a traveling man, Brother. The shutters... folk are afraid. Ever since the Steward made his decree about the medicine, people have been falling ill. First me, then the Haywood children, then old Matthias. Those who spoke against the Steward's ruling — they are the ones getting sick. I do not say it is connected. But I notice it. And now you notice it too. She leans closer, voice dropping. If you are truly a Dog of the King, then look at who benefits from the silence. Look at who still has their health.`,
      `[Player]: Your hands are shaking, Sister. That is not the cold. And there is a fresh bruise beneath your collar you have tried to cover with lace.
[Sister Martha]: Her hand flies to her neck, then drops. She closes her eyes for a moment. You are observant, Brother. More observant than the Sheriff, who sees what he is told to see. She steadies herself against the counter. I need medicine. Thomas brings me what he can, but it is not enough — I grow weaker each week. The Steward decreed my illness is judgment from the King, so the store will not sell to me. But Brother, I have seen the Steward's own wife buying the same herbs in secret. His decree applies to everyone but his own household. I need you to understand — this is not about faith. This is about one man's pride dressed up as doctrine.`,
    ],
    heart: [
      `[Player]: Peace be with you, Sister. You look weary — truly weary, down to the bone. How long has it been since someone asked how you are faring?
[Sister Martha]: Her composure cracks. She presses a hand to her mouth, then steadies herself. Forgive me, Brother. It has been... months. Since before the decree. I was the town midwife — I brought every child in this town into the world. Now the Steward says my sickness is the King's judgment, and folk cross the street when they see me coming. She wrings her hands, voice thickening. Only Thomas still visits. He risks everything to bring me herbs at night. If the Sheriff catches him... Brother, I do not ask you to take my side. I ask you to look at what has happened here and judge with your own eyes. A town that turns away its healer — what kind of faith is that?`,
      `[Player]: I can see you carry a burden, Sister. You need not bear it alone — I am here now.
[Sister Martha]: Tears well but do not fall. She grips the edge of the counter until her knuckles whiten. You say that, Brother, and I want to believe it. But the last outsider who came through — a trader from the eastern settlements — he asked questions too. The Steward had Sheriff Jacob escort him out before sundown. She glances toward the door. I will tell you what I can, but not here. The walls listen in this town. Come to my garden after dark — the one behind the store, where the lavender grows. Thomas will be there too. He has things to tell you. Things about what happens in this town after the lamps are put out. Please, Brother. We have prayed for a Dog to come. Do not leave us as the trader did.`,
    ],
    body: [
      `[Player]: I have ridden far and I have little patience for evasion. I am a Dog of the Vineyard and I expect the truth, plainly spoken.
[Sister Martha]: She straightens, something like relief passing across her face. Good. I am glad you are not the gentle sort. Gentleness will not serve you here. She meets his eye directly. The Steward — Ezekiel — has this town in a grip. He made a decree three months past that my illness is divine judgment. No one may sell me medicine or tend to me. But Brother, I was healthy before his decree. The sickness came after, not before. She holds up her trembling hands. I need you to understand what I am telling you. He declared me cursed, and then I became sick. Not the other way around. Whether that is coincidence or something darker, I leave to your judgment. But I beg you — do not simply take his word as gospel. Question him. Press him. He is not accustomed to being challenged.`,
      `[Player]: The Authority of the Dogs is not to be trifled with. I trust you understand that I will find the truth here, whether folk cooperate or not.
[Sister Martha]: She nods, a fierce light in her eyes despite her frailty. Then find it, Brother. Because the truth is rotting this town from the inside. She coughs, steadies herself. I will tell you plainly: the Steward forbade my care. Thomas steals medicine for me because no one else will help. The Sheriff knows and does nothing because Ezekiel told him to look the other way. Ask yourself why a man of God would let a woman suffer and then order his enforcer to ignore the one person trying to save her. There is a purpose to my suffering, Brother, but it is not the King's purpose. It is Ezekiel's.`,
    ],
    will: [
      `[Player]: The King of Life has sent me to judge the state of this congregation. I would hear your testimony, Sister, as one of the faithful.
[Sister Martha]: She clasps her hands as if in prayer, eyes glistening. Praise be. Praise be that He has not forgotten us. She sinks onto a stool, suddenly exhausted with relief. Brother, I will give you my testimony and you may weigh it as you see fit. I was the midwife of this town for twelve years. I served the faithful with my hands and my herbs. Then Steward Ezekiel declared that my illness — which I did not yet have — was the King's judgment. He forbade my treatment. Within a week, I fell sick. She looks up at him with desperate clarity. I believe the Steward's pride has opened a door that should remain shut. The sickness spreading through this town is not natural. It follows his decrees like a shadow follows a man. I do not accuse him of sorcery — but I say his pride has made a crack in this town's faith, and something has crept through it. Please, Brother. Confront him. Before more children fall ill.`,
      `[Player]: I speak with the authority vested in me by the Faith. Tell me of this town's spiritual health, and hold nothing back.
[Sister Martha]: She rises unsteadily and faces him with the solemnity of one giving witness before the King Himself. Then hear me, Brother. This congregation is sick — in body and in spirit. The Steward rules without counsel, without the Book, without humility. He has made himself a little king in a place where only the true King should reign. She counts on her fingers. He denied me medicine. He told the Sheriff to ignore Thomas's nighttime visits — yes, he knows about the theft and permits it, because a dying woman serves his narrative. He has not opened the Book of Life in services for three months — he preaches from his own authority now. And the sickness... she shudders. The sickness spreads to those who question him. Not to those who obey. Draw what conclusion you will from that, Brother. But do not wait long to act. The children are falling ill now.`,
    ],
  },
  town: {
    acuity: [
      `[Player]: I have counted four families but only three plots under till. The Whitfield place has gone to seed. And the chapel bell has not rung since I arrived — that is three days without services.
[Brother Ezra]: He sets down his hoe and wipes his brow, looking at the Dog with a mixture of wariness and hope. You are sharp, Brother. Sharper than the last Dog who came through — that one took the Steward's word and rode on. He lowers his voice. The Whitfield plot lies fallow because old Matthias Whitfield questioned the Steward's decree about Sister Martha. Within a week he was too sick to work. Coincidence, the Steward says. The King's will, the Steward says. He spits in the dust. As for services — Ezekiel stopped holding them when folk started asking why the Book of Life contradicts his teachings. He says we are not ready to hear the Word yet. That we must first prove our obedience. He meets the Dog's eye. Brother, I know what that sounds like. I know it sounds like false doctrine. I am only a farmer. I do not have the authority to say such things. But you do.`,
      `[Player]: The chapel bell has not rung since I arrived. The general store's shelves are half-empty. And I count at least three homes with boards over the windows. This town is in decline — I want to know why.
[Brother Ezra]: He glances around, then pulls the Dog to the shade of the barn. Because the man who leads us has lost his way, Brother. He scratches the back of his neck, clearly uncomfortable but pushing forward. The Steward made a decree — said Sister Martha's illness was divine judgment. Forbade her treatment. But that was just the beginning. Anyone who objected started falling sick too. My neighbor's boy, the Haywood girl, old Matthias. All of them questioned Ezekiel publicly, and all of them took ill within days. His hands ball into fists at his sides. I have not questioned him. So I am still healthy. But my silence shames me, Brother. I feed my family by keeping my head down while my neighbors suffer. That is its own kind of sin, is it not? He looks at the Dog with desperate hope. Tell me what to do. Tell me how a man does right when doing right might kill his children.`,
    ],
    heart: [
      `[Player]: How fare the children, friend? They seemed quiet when I rode in. I am used to children running to see a Dog's horse.
[Brother Ezra]: His face crumbles for a moment before he masters himself. The children know something is wrong, Brother. They feel it in their bones the way animals feel a storm coming. He sits on an upturned bucket, suddenly looking ten years older. My own girl — Ruth Ann — she asked me last week why the King of Life makes people sick for asking questions. He pinches the bridge of his nose. I did not know what to tell her. Because the truth is, I do not believe the King does that. I believe the Steward does. Or... something the Steward's pride has let in. He looks up. Three children have fallen ill, Brother. All from families who spoke against the decree. Sister Martha — she is a healer, she would know what to do, but she can barely stand herself. Thomas brings her what herbs he can steal, but she needs proper medicine and rest. She needs someone with authority to lift the Steward's decree. Can you do that, Brother? Can a Dog override a Steward's word?`,
      `[Player]: Tell me, friend — when did the joy leave this place? Because I can feel its absence like a cold draft.
[Brother Ezra]: He is quiet for a long time. When he speaks, his voice is barely above a whisper. It went in stages, Brother. First the laughter — that stopped when the Steward started preaching his own doctrine instead of the Book. Then the singing — that stopped when Sister Martha fell ill and no one was allowed to help her. Then the prayers. His voice catches. The prayers stopped when the children got sick. He wipes his eyes roughly with his sleeve. I still pray, Brother. But I pray in secret now, because I pray for the Steward to be brought low. And I do not know if that is righteousness or sin. He grabs the Dog's arm. I know you must judge this town. I accept that judgment, whatever it is. But please — before you judge, look at Martha. Look at the children. See what his pride has done to the weakest among us. Then judge as the King wills.`,
    ],
    body: [
      `[Player]: This town has a problem and I intend to find it. I can smell rot, and I do not mean the crops. Do not make me dig — it goes faster when folk talk willingly.
[Brother Ezra]: He straightens his back, decision firming on his face. Good. Good. I am tired of being afraid. He steps closer. The Steward — Ezekiel — he rules this town like his own kingdom. The Sheriff does his bidding. The store follows his decrees. And anyone who questions him falls sick within the week. He counts off on calloused fingers. Martha — denied medicine, now wasting away. Matthias Whitfield — questioned the decree, bedridden within days. The Haywood children — their father spoke up at what passes for services, and both his little ones took ill. He meets the Dog's eye unflinching. I will not say it is sorcery. I do not know that word's weight well enough to throw it. But I will say this: the Steward's pride has brought something into this town that was not here before. And it feeds on obedience. Those who submit stay healthy. Those who resist get sick. You are a Dog. You have authority he cannot ignore. Use it, Brother. Before we lose anyone else.`,
      `[Player]: I have seen a dozen towns in worse shape than this. They all had one thing in common — someone thought they were above the Faith. Point me at your problem, and I will handle it.
[Brother Ezra]: He nods, something fierce and grateful in his expression. The chapel. Start at the chapel. The Steward holds court there — I will not call it services anymore, because he has not opened the Book of Life in months. He preaches his own words now. He gestures toward the hill. He sits up there and decides who is worthy of the King's grace and who deserves suffering. Sister Martha? Not worthy. Old Matthias? Not worthy. My neighbor's children? He clenches his jaw. Not worthy. But his own family — they stay healthy. His own wife buys herbs from the store with no trouble. His own children play in the sun while ours lie in fever beds. The Dog carries authority, Brother. The Steward knows it. He will try to charm you first, then intimidate you. Do not let him. Push back. He crumbles when you push back — I have seen it. Just once, years ago, when the last Dog came through. For one day, he was humble. Then the Dog left, and the humility went with him.`,
    ],
    will: [
      `[Player]: The King of Life sees what is hidden. I am His instrument of judgment in this place. I would hear the truth of this town's spiritual state — not rumor, but testimony you would swear before the Throne.
[Brother Ezra]: He removes his hat and holds it to his chest, standing as one might stand before an altar. Then hear my testimony, Brother, and may the King weigh it justly. He speaks with the careful cadence of a man who has rehearsed these words in his mind many times. Steward Ezekiel has set himself above the Book of Life. He preaches doctrine of his own making. He has decreed that sickness is divine judgment, and he alone decides who the King has judged. He used this power to deny care to Sister Martha, the midwife who served this town faithfully for twelve years. Since his decree, a sickness has spread — but only to those who oppose him. The faithful who obey remain healthy. He puts his hat back on, hands trembling. I do not make accusations lightly, Brother. But I believe the Steward's pride has cracked the spiritual foundation of this town, and something has entered through that crack. Whether it is demonic in nature or merely the natural consequence of sin, I cannot say. But the children are sick now, Brother. The children. Whatever judgment you bring, bring it soon.`,
      `[Player]: By the authority vested in me as a Dog of the Vineyard, I command an accounting of this town's faith. Speak as you would speak to the King Himself.
[Brother Ezra]: He drops to one knee, then rises again, his face set. We have strayed, Brother. Or rather — we have been led astray. By one man's pride. He speaks quickly now, as if afraid he will lose his nerve. The Steward stopped teaching from the Book three months ago. He makes his own pronouncements and calls them doctrine. He declared Sister Martha's illness a judgment, and forbade her care. Since then, others have fallen ill — always those who question him. Thomas steals medicine for Martha in the night, and the Sheriff knows but looks the other way because the Steward told him to. He takes a shaking breath. I have been silent, Brother. I have kept my head down to protect my family. But silence in the face of injustice is its own sin — I know this. I offer my testimony now, late as it is. The Steward must be confronted. He must be made to answer for what he has done — and for what his pride has invited into this town. I will stand with you if you confront him, Brother. I am done being afraid.`,
    ],
  },
};

/**
 * Discovery markers embedded in mock responses.
 * These allow the mental map to populate during dev mode.
 * Format: [DISCOVERY: factId|sinId|content]
 */
const DISCOVERY_MARKERS: Record<string, Record<ApproachType, string>> = {
  greeting: {
    acuity: '[DISCOVERY: martha-decree-1|sin-injustice|The Steward decreed Sister Martha\'s illness is divine judgment]',
    heart: '[DISCOVERY: martha-sickness-1|sin-sickness|A strange sickness is spreading through the town]',
    body: '[DISCOVERY: martha-decree-1|sin-injustice|The Steward forbade medicine for Sister Martha]',
    will: '[DISCOVERY: ez-martha-1|sin-injustice|The Steward considers Martha\'s ailment the King\'s judgment]',
  },
  town: {
    acuity: '[DISCOVERY: ruth-observe-2|sin-pride|The Steward meets with Sheriff Jacob every morning and the Sheriff does whatever he says]',
    heart: '[DISCOVERY: martha-sickness-1|sin-sickness|People are falling ill, especially those who questioned the Steward]',
    body: '[DISCOVERY: thomas-decree-1|sin-injustice|The Steward declared Martha\'s illness divine judgment]',
    will: '[DISCOVERY: ruth-steward-1|sin-pride|The Steward has not consulted the Book of Life in months]',
  },
};

/**
 * Generic fallback responses when no specific topic/approach match exists.
 * These are longer and more substantive than the original 60-word responses.
 */
const FALLBACK_RESPONSES: Record<ApproachType, string> = {
  acuity: `[Player]: Something about this does not add up. I have been watching, and what I see does not match what I am being told. The details do not align — explain yourself.
[NPC]: They shift uncomfortably, avoiding the Dog's gaze. You ask difficult questions, Brother. Ones I am not certain I should answer. They glance toward the chapel on the hill. There are things happening in this town that... I notice them. Everyone notices them. But noticing and speaking are different matters when the Steward's Sheriff patrols the streets. They lower their voice. I can tell you what I have seen, if you promise me something — promise me you will not leave this town until the matter is settled. The last outsider who asked questions was escorted out before sundown. I cannot afford to speak and then be left alone with the consequences.`,
  heart: `[Player]: I can see this troubles you deeply. Your hands are shaking, and you have not met my eye since I arrived. Speak freely, friend — I am here to help, not to judge you.
[NPC]: Their composure wavers. For a moment they look as though they might weep, then they master themselves. You are kind to ask, Brother. Kinder than... than most have been of late. They press their palms together to stop the trembling. There is a weight on this town. Not just the sickness — though that is terrible enough. It is the silence. We used to speak freely. We used to help each other. Now everyone watches what they say, who they are seen with. They look up with desperate eyes. I want to tell you everything. I do. But you must understand — if I speak and you leave, I will pay for it. My family will pay for it. Can you promise me protection, Brother? Can a Dog's word shield me from what comes after?`,
  body: `[Player]: I did not ride three days through dust and heat for silence. I am a Dog of the Vineyard and I carry authority here. So you can speak to me willingly, or I can start asking questions in public where everyone can hear. Your choice.
[NPC]: They straighten, a complex expression crossing their face — fear, but also something like relief. Peace, Brother. I mean no disrespect. It is only... they glance around, lowering their voice. The truth is dangerous here. People who speak openly get sick. I do not mean that as a figure of speech. I mean they fall ill within days of questioning the Steward. They meet the Dog's eyes. You carry authority. Good. You will need it. The Steward has built himself a little kingdom here, and he does not welcome challenges to his rule. But a Dog — a Dog he cannot simply dismiss. They step closer. Ask about the decree. Ask about Sister Martha. Ask why the Sheriff patrols at night but never catches the thief everyone knows about. The answers will tell you everything you need to know about who runs this town and how.`,
  will: `[Player]: The King of Life demands honesty from His children. I carry His authority in this place, and I will use it as He wills. Do not test my patience with evasion — speak your truth.
[NPC]: They bow their head briefly, then raise it with something approaching resolve. Forgive me, Brother. I have been silent too long, and silence becomes a habit that is hard to break. They fold their hands as if in prayer. The town is sick, Brother. Not just in body — in spirit. The Steward has set himself above the Book of Life. He preaches his own doctrine. He decides who receives the King's mercy and who receives His wrath. And somehow — I do not claim to understand how — his pronouncements come true. Those he declares judged fall ill. Those he favors remain healthy. Their voice drops to barely a whisper. I have obeyed. I have kept silent. And I am healthy. What does that tell you about me, Brother? What does my health say about my faithfulness — or my cowardice? They look at the Dog with haunted eyes. Judge me if you must. But judge him first. Please.`,
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
  let responseText: string;

  // Try to find a specific response for this topic/approach combo
  const topicResponses = MOCK_RESPONSES[topic];
  if (topicResponses) {
    const approachResponses = topicResponses[approach];
    if (approachResponses && approachResponses.length > 0) {
      const index = Math.floor(Math.random() * approachResponses.length);
      responseText = approachResponses[index] ?? FALLBACK_RESPONSES[approach];
    } else {
      responseText = FALLBACK_RESPONSES[approach].replace(/\[NPC\]/g, `[${npcName}]`);
    }
  } else {
    // Fall back to generic response, replacing NPC placeholder with name
    responseText = FALLBACK_RESPONSES[approach].replace(/\[NPC\]/g, `[${npcName}]`);
  }

  // Append discovery marker if available for this topic/approach
  const marker = DISCOVERY_MARKERS[topic]?.[approach];
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
