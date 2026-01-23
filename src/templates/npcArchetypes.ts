/**
 * NPC Archetypes
 *
 * Hand-authored role templates for Dogs in the Vineyard NPCs.
 * Each archetype provides personality, speech patterns, resist profiles,
 * and knowledge fact templates spanning multiple trust levels.
 */

import type { ApproachType } from '@/types/dialogue';
import type { SinLevel } from '@/types/investigation';

/**
 * FactTemplate - A template for generating NPC knowledge facts.
 * Uses {slot} placeholders filled during NPC generation.
 */
export interface FactTemplate {
  contentPattern: string;
  tags: string[];
  minTrustLevel: number;
  requiredApproach?: ApproachType;
  forSinLevel?: SinLevel;
}

/**
 * NPCArchetype - A role template for generating NPCs.
 * Provides personality, speech, resistance, and knowledge patterns.
 */
export interface NPCArchetype {
  role: string;
  nameTemplates: { prefix: string; names: string[] };
  personalityTemplates: string[];
  speechPatternTemplates: string[];
  defaultLocationType: string;
  resistProfile: { body: number; will: number; heart: number; acuity: number };
  factTemplates: FactTemplate[];
}

/**
 * NPC_ARCHETYPES - 8+ role archetypes for DitV frontier towns.
 * Each archetype has rich personality, speech, and fact templates.
 */
export const NPC_ARCHETYPES: NPCArchetype[] = [
  // 1. Steward (authority, high will resist, pride-linked)
  {
    role: 'steward',
    nameTemplates: {
      prefix: 'Steward',
      names: ['Ezra', 'Josiah', 'Elkanah', 'Hiram', 'Zachariah', 'Mordecai'],
    },
    personalityTemplates: [
      'speaks with quiet authority, expecting obedience without raising voice',
      'carries the weight of decisions like a man who never doubts himself',
      'addresses everyone as if granting them an audience',
      'measures each word carefully, always steering conversation toward duty',
    ],
    speechPatternTemplates: [
      'uses formal address and biblical phrasing',
      'speaks in measured declarations, rarely asks questions',
      'punctuates statements with "as the King wills" or "it is so"',
    ],
    defaultLocationType: 'meeting-house',
    resistProfile: { body: 30, will: 80, heart: 40, acuity: 50 },
    factTemplates: [
      {
        contentPattern: 'The town of {town} is well-ordered under faithful leadership.',
        tags: ['pride', 'authority', 'surface'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'There have been... disagreements about how {town} should be governed.',
        tags: ['pride', 'conflict'],
        minTrustLevel: 20,
        forSinLevel: 'pride',
      },
      {
        contentPattern: 'The {authority} makes decisions without consulting the elders or the faithful.',
        tags: ['pride', 'authority', 'abuse'],
        minTrustLevel: 40,
        requiredApproach: 'acuity',
        forSinLevel: 'pride',
      },
      {
        contentPattern: '{victim} came to me for help once. I told them to pray harder.',
        tags: ['injustice', 'guilt', 'confession'],
        minTrustLevel: 60,
        requiredApproach: 'heart',
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'I have ruled {town} as I see fit, and I answer to no Dog or man for it.',
        tags: ['pride', 'defiance', 'confession'],
        minTrustLevel: 80,
        requiredApproach: 'will',
        forSinLevel: 'pride',
      },
    ],
  },

  // 2. Sheriff (enforcer, high body resist, pride/injustice-linked)
  {
    role: 'sheriff',
    nameTemplates: {
      prefix: 'Sheriff',
      names: ['Harmon', 'Colt', 'Silas', 'Virgil', 'Boone', 'Wyatt'],
    },
    personalityTemplates: [
      'stands with arms crossed, watching everything and everyone',
      'moves with the deliberate calm of a man used to violence',
      'speaks only when necessary, preferring to let silence do the work',
      'treats every conversation like an interrogation he is losing patience with',
    ],
    speechPatternTemplates: [
      'clips words short, never wastes a syllable',
      'speaks in flat statements with an undercurrent of threat',
      'uses law enforcement language mixed with frontier colloquialisms',
    ],
    defaultLocationType: 'jail',
    resistProfile: { body: 80, will: 60, heart: 20, acuity: 40 },
    factTemplates: [
      {
        contentPattern: 'I keep the peace in {town}. That is all anyone needs to know.',
        tags: ['authority', 'surface', 'deflection'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'There are things I have been asked to overlook. I do not like it.',
        tags: ['injustice', 'conflict', 'duty'],
        minTrustLevel: 20,
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'The {authority} told me to keep {victim} away from the meeting house.',
        tags: ['injustice', 'order', 'shame'],
        minTrustLevel: 40,
        requiredApproach: 'body',
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'I have used my fists on {victim} when the {authority} demanded it. God forgive me.',
        tags: ['injustice', 'violence', 'confession'],
        minTrustLevel: 60,
        requiredApproach: 'heart',
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'If someone were to challenge the {authority}, I would not stand in their way. Not anymore.',
        tags: ['pride', 'turning-point', 'ally'],
        minTrustLevel: 80,
        requiredApproach: 'will',
        forSinLevel: 'pride',
      },
    ],
  },

  // 3. Midwife/Healer (victim, low resist all, injustice/sin-linked)
  {
    role: 'healer',
    nameTemplates: {
      prefix: 'Sister',
      names: ['Adelaide', 'Constance', 'Mercy', 'Patience', 'Prudence', 'Hope'],
    },
    personalityTemplates: [
      'moves with quiet purpose, hands always busy with herbs or bandages',
      'looks at people with deep compassion but carries a sadness in her eyes',
      'speaks softly as if afraid the walls might hear',
      'touches people gently on the arm when she speaks, needing connection',
    ],
    speechPatternTemplates: [
      'speaks in gentle whispers with frequent pauses for composure',
      'uses healing metaphors and references to natural remedies',
      'trails off mid-sentence when approaching dangerous topics',
    ],
    defaultLocationType: 'homestead',
    resistProfile: { body: 15, will: 25, heart: 10, acuity: 20 },
    factTemplates: [
      {
        contentPattern: 'I tend to the sick and injured in {town}. There has been... more of both lately.',
        tags: ['demonic-attacks', 'surface', 'concern'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'The {victim} came to me with bruises. They said they fell. They did not fall.',
        tags: ['sin', 'violence', 'witness'],
        minTrustLevel: 20,
        forSinLevel: 'sin',
      },
      {
        contentPattern: 'I tried to help {victim}, but the {authority} forbade it. Said their suffering was deserved.',
        tags: ['injustice', 'denied-care', 'witness'],
        minTrustLevel: 40,
        requiredApproach: 'heart',
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'The sickness in {town} is not natural. I have seen its like before, in places where dark things are done.',
        tags: ['demonic-attacks', 'supernatural', 'knowledge'],
        minTrustLevel: 60,
        requiredApproach: 'acuity',
        forSinLevel: 'demonic-attacks',
      },
      {
        contentPattern: 'I found strange marks on {victim} — not wounds, but symbols. Burned into the skin.',
        tags: ['sorcery', 'evidence', 'horror'],
        minTrustLevel: 80,
        requiredApproach: 'acuity',
        forSinLevel: 'sorcery',
      },
    ],
  },

  // 4. Farmer (desperate, medium body, sin-linked)
  {
    role: 'farmer',
    nameTemplates: {
      prefix: 'Brother',
      names: ['Caleb', 'Thaddeus', 'Obadiah', 'Amos', 'Gideon', 'Seth'],
    },
    personalityTemplates: [
      'works-hardened hands fidget when he is not holding a tool',
      'speaks with the directness of a man who values action over words',
      'shifts his weight from foot to foot, uncomfortable with stillness',
      'looks at the ground more than at people, shame or exhaustion in equal measure',
    ],
    speechPatternTemplates: [
      'uses farming metaphors and references to seasons and harvests',
      'speaks in short declarative bursts, then goes silent',
      'mutters half to himself, half to the listener',
    ],
    defaultLocationType: 'farm',
    resistProfile: { body: 60, will: 30, heart: 40, acuity: 25 },
    factTemplates: [
      {
        contentPattern: 'The harvest has been poor in {town}. We are all feeling the strain.',
        tags: ['demonic-attacks', 'surface', 'hardship'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'My fields suffer while the {sinner} prospers. It is not natural.',
        tags: ['demonic-attacks', 'jealousy', 'suspicion'],
        minTrustLevel: 20,
        forSinLevel: 'demonic-attacks',
      },
      {
        contentPattern: 'I took what was not mine. The {victim} had more than they needed, and my children were hungry.',
        tags: ['sin', 'theft', 'confession'],
        minTrustLevel: 40,
        requiredApproach: 'heart',
        forSinLevel: 'sin',
      },
      {
        contentPattern: 'The {sinner} offered me something — a charm, a fetish. Said it would save my crops. I took it.',
        tags: ['sorcery', 'complicity', 'desperation'],
        minTrustLevel: 60,
        requiredApproach: 'acuity',
        forSinLevel: 'sorcery',
      },
      {
        contentPattern: 'I saw {sinner} at the crossroads at midnight. They were not alone. Something answered them.',
        tags: ['sorcery', 'witness', 'horror'],
        minTrustLevel: 80,
        requiredApproach: 'will',
        forSinLevel: 'sorcery',
      },
    ],
  },

  // 5. Teacher (observer, low resist, sees everything)
  {
    role: 'teacher',
    nameTemplates: {
      prefix: 'Teacher',
      names: ['Abigail', 'Martha', 'Ruth', 'Deborah', 'Hannah', 'Lydia'],
    },
    personalityTemplates: [
      'observes everything with sharp eyes that miss no detail',
      'speaks with the patience of someone used to explaining things multiple times',
      'keeps a careful distance from everyone, watching from the margins',
      'writes things down in a small book she carries everywhere',
    ],
    speechPatternTemplates: [
      'speaks precisely, choosing each word as if writing a lesson',
      'asks probing questions that reveal more than they seem',
      'uses conditional language: "one might notice" or "it would appear"',
    ],
    defaultLocationType: 'schoolhouse',
    resistProfile: { body: 15, will: 30, heart: 25, acuity: 60 },
    factTemplates: [
      {
        contentPattern: 'The children of {town} are well-taught. Though some have stopped attending lately.',
        tags: ['surface', 'observation', 'change'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'I see things from my schoolhouse window. People coming and going at odd hours.',
        tags: ['observation', 'suspicious', 'general'],
        minTrustLevel: 20,
      },
      {
        contentPattern: 'The {sinner} visits the {victim} when they think no one watches. But I watch.',
        tags: ['sin', 'witness', 'pattern'],
        minTrustLevel: 40,
        requiredApproach: 'acuity',
        forSinLevel: 'sin',
      },
      {
        contentPattern: '{authority} has been teaching the children things that are not in the Book of Life.',
        tags: ['false-doctrine', 'witness', 'corruption'],
        minTrustLevel: 60,
        requiredApproach: 'acuity',
        forSinLevel: 'false-doctrine',
      },
      {
        contentPattern: 'I keep a record. Dates, times, who met whom. It is all in my book. Take it.',
        tags: ['evidence', 'ally', 'proof'],
        minTrustLevel: 80,
        requiredApproach: 'acuity',
      },
    ],
  },

  // 6. Preacher (doctrine, high will, false-doctrine/pride-linked)
  {
    role: 'preacher',
    nameTemplates: {
      prefix: 'Brother',
      names: ['Josiah', 'Ephraim', 'Nehemiah', 'Solomon', 'Malachi', 'Levi'],
    },
    personalityTemplates: [
      'speaks with the fire of absolute conviction, eyes burning with certainty',
      'gestures broadly as if always addressing a congregation',
      'leans close when speaking of doctrine, voice dropping to urgent whisper',
      'quotes scripture constantly, bending verses to support his every point',
    ],
    speechPatternTemplates: [
      'speaks in sermonic cadence with dramatic pauses and rising emphasis',
      'peppers speech with "the King teaches" and "it is written"',
      'uses rhetorical questions that expect no answer',
    ],
    defaultLocationType: 'chapel',
    resistProfile: { body: 25, will: 85, heart: 30, acuity: 45 },
    factTemplates: [
      {
        contentPattern: 'The faithful of {town} are blessed. We worship in truth and righteousness.',
        tags: ['false-doctrine', 'surface', 'deflection'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'There are those who question the teachings. They will learn, or they will be cast out.',
        tags: ['false-doctrine', 'threat', 'authority'],
        minTrustLevel: 20,
        forSinLevel: 'false-doctrine',
      },
      {
        contentPattern: 'The King has shown me things that are not in the common Book. Private revelation.',
        tags: ['false-doctrine', 'heresy', 'pride'],
        minTrustLevel: 40,
        requiredApproach: 'will',
        forSinLevel: 'false-doctrine',
      },
      {
        contentPattern: 'Some sins require blood to cleanse. This is not murder — it is holy necessity.',
        tags: ['false-doctrine', 'blood-atonement', 'dangerous'],
        minTrustLevel: 60,
        requiredApproach: 'will',
        forSinLevel: 'false-doctrine',
      },
      {
        contentPattern: 'I have led {town} astray. The doctrine I preach is my own invention, born of pride.',
        tags: ['false-doctrine', 'confession', 'truth'],
        minTrustLevel: 80,
        requiredApproach: 'heart',
        forSinLevel: 'false-doctrine',
      },
    ],
  },

  // 7. Merchant (practical, medium acuity, sin/injustice-linked)
  {
    role: 'merchant',
    nameTemplates: {
      prefix: '',
      names: ['Miriam', 'Naomi', 'Tabitha', 'Priscilla', 'Hezekiah', 'Barnabas'],
    },
    personalityTemplates: [
      'keeps a running tally of favors and debts, spoken and unspoken',
      'smiles easily but the warmth never quite reaches the eyes',
      'arranges and rearranges goods while talking, hands never idle',
      'assesses everyone who enters as customer, threat, or opportunity',
    ],
    speechPatternTemplates: [
      'speaks in transactional terms: costs, values, fair trades',
      'uses mercantile metaphors and weighs words like coin',
      'drops hints about what they know as if selling information',
    ],
    defaultLocationType: 'general-store',
    resistProfile: { body: 30, will: 40, heart: 35, acuity: 65 },
    factTemplates: [
      {
        contentPattern: 'Business is business in {town}. I trade with all who come, no questions asked.',
        tags: ['surface', 'neutral', 'commerce'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'The {sinner} has been buying strange things. Rope, lye, things with no honest use.',
        tags: ['sin', 'evidence', 'suspicious'],
        minTrustLevel: 20,
        forSinLevel: 'sin',
      },
      {
        contentPattern: 'The {authority} takes a cut of every sale I make. Protection, they call it.',
        tags: ['injustice', 'extortion', 'resentment'],
        minTrustLevel: 40,
        requiredApproach: 'acuity',
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'I sold {sinner} ingredients for... I did not want to know what they were making.',
        tags: ['sorcery', 'complicity', 'guilt'],
        minTrustLevel: 60,
        requiredApproach: 'heart',
        forSinLevel: 'sorcery',
      },
      {
        contentPattern: 'I have the ledger. Every transaction. It proves who paid whom and when. Names and dates.',
        tags: ['evidence', 'proof', 'ally'],
        minTrustLevel: 80,
        requiredApproach: 'acuity',
      },
    ],
  },

  // 8. Elder (respected, medium all, any level)
  {
    role: 'elder',
    nameTemplates: {
      prefix: 'Elder',
      names: ['Matthias', 'Enoch', 'Barnabas', 'Simeon', 'Tobias', 'Nathaniel'],
    },
    personalityTemplates: [
      'moves slowly and deliberately, every gesture carrying the weight of years',
      'speaks with the weariness of someone who has seen too much and said too little',
      'watches the young with a mixture of hope and sorrow',
      'sits in silence for long moments before answering, choosing truth carefully',
    ],
    speechPatternTemplates: [
      'speaks in parables and stories from the old days',
      'uses long pauses and sighs between thoughts',
      'references "how things used to be" and "before the trouble came"',
    ],
    defaultLocationType: 'homestead',
    resistProfile: { body: 20, will: 50, heart: 45, acuity: 50 },
    factTemplates: [
      {
        contentPattern: '{town} was a good place once. I remember when the faithful were truly faithful.',
        tags: ['surface', 'nostalgia', 'concern'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'The trouble started when {authority} took charge. Something changed in them.',
        tags: ['pride', 'history', 'insight'],
        minTrustLevel: 20,
        forSinLevel: 'pride',
      },
      {
        contentPattern: 'I should have spoken up when {victim} was cast out. My silence is its own sin.',
        tags: ['injustice', 'guilt', 'confession'],
        minTrustLevel: 40,
        requiredApproach: 'heart',
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'There is a darkness in {town} now. Not a metaphor — I have felt it. Cold and watching.',
        tags: ['demonic-attacks', 'supernatural', 'fear'],
        minTrustLevel: 60,
        requiredApproach: 'will',
        forSinLevel: 'demonic-attacks',
      },
      {
        contentPattern: 'I know who killed the {victim}. I saw it happen and did nothing. That is my burden.',
        tags: ['hate-and-murder', 'witness', 'confession'],
        minTrustLevel: 80,
        requiredApproach: 'heart',
        forSinLevel: 'hate-and-murder',
      },
    ],
  },

  // 9. Widow (grieving, low body, personal-stakes)
  {
    role: 'widow',
    nameTemplates: {
      prefix: 'Widow',
      names: ['Leah', 'Sarah', 'Rebecca', 'Rachel', 'Esther', 'Miriam'],
    },
    personalityTemplates: [
      'clutches a worn shawl around her shoulders as if cold even in summer',
      'speaks with the hollow clarity of someone who has already lost everything',
      'looks through people rather than at them, seeing ghosts',
      'alternates between quiet resignation and sudden fierce anger',
    ],
    speechPatternTemplates: [
      'speaks in past tense about her husband, present tense about injustice',
      'voice breaks mid-sentence on emotional topics, then hardens',
      'uses possessive language about the dead: "my husband knew" or "he told me"',
    ],
    defaultLocationType: 'homestead',
    resistProfile: { body: 10, will: 40, heart: 15, acuity: 35 },
    factTemplates: [
      {
        contentPattern: 'My husband is gone. {town} has not been kind to widows since.',
        tags: ['injustice', 'surface', 'grief'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'They say my husband died of fever. But fever does not leave bruises on a man.',
        tags: ['hate-and-murder', 'suspicion', 'personal'],
        minTrustLevel: 20,
        forSinLevel: 'hate-and-murder',
      },
      {
        contentPattern: 'The {authority} came to my homestead after the funeral. Made certain... demands.',
        tags: ['sin', 'abuse', 'victim'],
        minTrustLevel: 40,
        requiredApproach: 'heart',
        forSinLevel: 'sin',
      },
      {
        contentPattern: '{sinner} was the last to see my husband alive. They argued that night about money owed.',
        tags: ['hate-and-murder', 'motive', 'witness'],
        minTrustLevel: 60,
        requiredApproach: 'acuity',
        forSinLevel: 'hate-and-murder',
      },
      {
        contentPattern: 'I found this hidden in my husband\'s things. It is a letter naming who would harm him and why.',
        tags: ['hate-and-murder', 'evidence', 'proof'],
        minTrustLevel: 80,
        requiredApproach: 'acuity',
        forSinLevel: 'hate-and-murder',
      },
    ],
  },
];
