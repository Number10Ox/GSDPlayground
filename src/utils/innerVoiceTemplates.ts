import type { StatName } from '@/types/character';

/**
 * InnerVoiceSituation - Contexts where the inner voice may interject.
 */
export type InnerVoiceSituation =
  | 'npc-evasion'
  | 'new-discovery'
  | 'sin-connection'
  | 'conflict-risk'
  | 'trust-low'
  | 'trust-high';

/**
 * INNER_VOICE_TEMPLATES - Stat-based inner voice interjection templates.
 *
 * Inspired by Disco Elysium's skill system: each stat notices different things.
 * - Acuity: inconsistencies, logical gaps, hidden meanings
 * - Heart: emotional pain, fear, love, desperation
 * - Body: physical threats, readiness, weakness
 * - Will: moral weight, duty, spiritual corruption
 *
 * All templates use DitV frontier religious period voice.
 */
export const INNER_VOICE_TEMPLATES: Record<StatName, Record<InnerVoiceSituation, string[]>> = {
  acuity: {
    'npc-evasion': [
      'Their eyes shifted left when they said that. The truth hides behind those words.',
      'That answer came too quick -- rehearsed, like Scripture memorized but not believed.',
      'Notice how they skipped past your question entirely. What are they protecting?',
      'The gap between what they said and what they meant is wide as the desert.',
    ],
    'new-discovery': [
      'There it is. The thread that connects. Pull it carefully now.',
      'This piece fits the puzzle -- but the picture forming is darker than you expected.',
      'File that away. It contradicts what the Sister told you yesterday.',
    ],
    'sin-connection': [
      'The pattern emerges like tracks in fresh snow. One sin leading to another.',
      'You can see it now -- cause and consequence, clear as ink on parchment.',
      'Each transgression feeds the next. The chain is longer than anyone admits.',
    ],
    'conflict-risk': [
      'They are calculating whether to fight or flee. Watch their hands.',
      'The tension in this room has a geometry to it. You are at the sharp end.',
      'They have told you enough to be dangerous. They know it too.',
    ],
    'trust-low': [
      'They are measuring you with careful eyes. You have not earned their confidence yet.',
      'Every word they speak is weighed and found wanting of truth. Give them reason to trust.',
      'Their guard is up. You will need to prove yourself before they open that door.',
    ],
    'trust-high': [
      'They speak freely now. The walls have come down -- listen carefully.',
      'You have earned something precious here. Do not squander their trust.',
      'Their words flow easier now. They believe you can carry what they are about to share.',
    ],
  },

  heart: {
    'npc-evasion': [
      'There is pain behind that evasion. They are not hiding guilt -- they are hiding grief.',
      'Feel how they pull away from the subject. Something there wounds them deeply.',
      'The silence after your question carried more sorrow than any words could.',
      'They deflect not from malice but from a hurt too raw to speak aloud.',
    ],
    'new-discovery': [
      'The weight of this truth settles heavy on you. Someone has been suffering.',
      'Now you understand the sadness in their eyes when they spoke of this before.',
      'This discovery brings no joy. Only the ache of understanding.',
    ],
    'sin-connection': [
      'Each sin in this chain was born from love twisted wrong. Pity them.',
      'The sorrow runs deeper than the sin. Hurt people hurting people, on and on.',
      'You can feel the desperation that drove them to this. It does not excuse -- but it explains.',
    ],
    'conflict-risk': [
      'They are afraid. Cornered animals bite hardest -- tread gently here.',
      'The fear in their voice tells you more than their words. They dread what comes next.',
      'You can feel their desperation rising. This could turn ugly if you push too hard.',
    ],
    'trust-low': [
      'They are wounded and wary. Someone has betrayed their trust before.',
      'Patience. The frightened lamb does not come to the shepherd by force.',
      'Their coldness is armor. There is warmth beneath, but they need time.',
    ],
    'trust-high': [
      'They look at you with something like hope. Do not let them down.',
      'The vulnerability in their voice -- they are trusting you with something precious.',
      'You feel the warmth of genuine connection. They are ready to share their burden.',
    ],
  },

  body: {
    'npc-evasion': [
      'Their jaw tightened when you asked that. Muscle memory of guarding a secret.',
      'Watch their posture close up like a fist. They are bracing against your questions.',
      'The way they shifted their weight -- ready to bolt if you press harder.',
      'Their breathing changed. Shallow now. The body cannot lie the way the tongue can.',
    ],
    'new-discovery': [
      'Your gut told you something was wrong here. Now you know what.',
      'The hairs on your neck stood for a reason. This town has rot at its core.',
      'You feel it in your bones -- this discovery changes everything.',
    ],
    'sin-connection': [
      'The violence in this chain is escalating. You can smell it like gunpowder on the wind.',
      'Each link in this sin is heavier than the last. Soon someone will break under the weight.',
      'Blood calls to blood. This progression ends in a grave if no one intervenes.',
    ],
    'conflict-risk': [
      'Their hands are moving toward something. Be ready.',
      'You know that look. They are deciding if they can take you. Let them decide wisely.',
      'The room feels smaller now. If this goes sideways, you need to know your exits.',
    ],
    'trust-low': [
      'They keep their distance. Smart -- they do not know what you are capable of.',
      'You can see them sizing you up. The coat and gun tell a story they are reading carefully.',
      'Their stance says it all: guarded, ready to move. They do not trust your hands.',
    ],
    'trust-high': [
      'They have relaxed around you. Shoulders down, breathing easy. That is trust in the body.',
      'They no longer flinch when you move. You have become safe in their eyes.',
      'The tension has left their frame. They stand open to you now -- vulnerable.',
    ],
  },

  will: {
    'npc-evasion': [
      'They evade because the truth would convict them before the King of Life.',
      'Their conscience writhes beneath those lies. The Spirit knows, even if they will not speak.',
      'There is a moral weight pressing on their silence. They know what they hide is wrong.',
      'The evasion itself is confession. The righteous do not flee from honest questions.',
    ],
    'new-discovery': [
      'The King of Life has shown you this for a purpose. Act on it.',
      'Now you carry this knowledge. With it comes the duty to bring correction.',
      'The truth revealed is a sacred burden. You were sent here to bear it.',
    ],
    'sin-connection': [
      'The wages of sin compound like interest. This town owes a debt it cannot pay.',
      'One transgression opens the door to the next. The Enemy works through such chains.',
      'You see the corruption spreading like blight through wheat. It must be cut out at the root.',
    ],
    'conflict-risk': [
      'If they choose violence, let it be on their head. You came to bring peace.',
      'The authority of your office stands behind you. Do not doubt your right to press.',
      'Sometimes the shepherd must become the rod. If they force your hand, so be it.',
    ],
    'trust-low': [
      'They resist your authority. Remind them who sent you and what you represent.',
      'Their stubbornness is pride -- the very sin that starts the chain. Note it.',
      'They will come to understand that a Dog speaks with more than mortal voice.',
    ],
    'trust-high': [
      'They see the authority you carry. Use it wisely -- the King of Life watches.',
      'Their submission to your office is proper. Now guide them toward what is right.',
      'They trust the mantle you wear. Honor that trust with righteous judgment.',
    ],
  },
};

/**
 * getInnerVoiceInterjection - Returns a random inner voice template for the
 * given stat and situation, with a 30% trigger chance.
 *
 * The inner voice system is inspired by Disco Elysium: the player's highest
 * stat occasionally "speaks up" during conversations, offering insight
 * colored by that stat's perspective.
 *
 * @param stat - The stat providing the inner voice (typically highest stat)
 * @param situation - The current dialogue situation
 * @returns Template string or null (70% chance of null for natural pacing)
 */
export function getInnerVoiceInterjection(
  stat: StatName,
  situation: string
): string | null {
  // 30% chance to trigger
  if (Math.random() > 0.3) return null;

  const statTemplates = INNER_VOICE_TEMPLATES[stat];
  if (!statTemplates) return null;

  const situationTemplates = statTemplates[situation as InnerVoiceSituation];
  if (!situationTemplates || situationTemplates.length === 0) return null;

  // Random selection for variety
  const index = Math.floor(Math.random() * situationTemplates.length);
  return situationTemplates[index] ?? null;
}
