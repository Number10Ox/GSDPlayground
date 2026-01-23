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
  motivationTemplates: string[];
  desireTemplates: string[];
  fearTemplates: string[];
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
    motivationTemplates: [
      'You believe your authority comes directly from the King of Life, and any challenge to it is blasphemy.',
      'You have sacrificed everything for this town and cannot accept that your methods might be wrong.',
    ],
    desireTemplates: [
      'You want the Dog to validate your leadership and leave quickly without disrupting the order you have built.',
      'You want the Dog to punish those who defy your authority, proving the King supports your rule.',
    ],
    fearTemplates: [
      'You fear that if your authority is questioned publicly, the town will descend into chaos.',
      'You fear the Dog will see through your certainty to the doubt you buried long ago.',
    ],
    defaultLocationType: 'meeting-house',
    resistProfile: { body: 30, will: 80, heart: 40, acuity: 50 },
    factTemplates: [
      {
        contentPattern: '{town} prospers under my guidance. The faithful are content and the harvest is steady — anyone who says otherwise has their own reasons for stirring trouble.',
        tags: ['pride', 'authority', 'surface'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'There was a gathering last month where three families demanded I share governance with the elders. I refused. Since then, those families have had... difficulties. Crops failing, livestock sickening. The King teaches obedience, does He not?',
        tags: ['pride', 'conflict'],
        minTrustLevel: 20,
        forSinLevel: 'pride',
      },
      {
        contentPattern: 'I stopped consulting the elders two seasons ago. They are weak — they would have let {victim} spread their complaints unchecked. Someone must hold this town together, and I am the only one with the spine for it.',
        tags: ['pride', 'authority', 'abuse'],
        minTrustLevel: 40,
        requiredApproach: 'acuity',
        forSinLevel: 'pride',
      },
      {
        contentPattern: '{victim} came to me weeping, begging for help. I told them their suffering was the King\'s will and sent them away. I hear them crying at night still. I tell myself it was necessary — but I have not slept well since.',
        tags: ['injustice', 'guilt', 'confession'],
        minTrustLevel: 60,
        requiredApproach: 'heart',
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'I built {town} into what it is. Every decision, every sacrifice — mine. And I will not surrender that to some traveling Dog who rides in knowing nothing of what it cost. This town answers to me, not to you.',
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
    motivationTemplates: [
      'You enforce the {authority}\'s will because order is all that keeps this town from falling apart.',
      'You have done things you are not proud of, but you tell yourself it was necessary to keep the peace.',
    ],
    desireTemplates: [
      'You want the Dog to restore proper order so you can stop doing the {authority}\'s dirty work.',
      'You want someone with real authority to tell you it is acceptable to stop following unjust orders.',
    ],
    fearTemplates: [
      'You fear that if the Dog investigates too deeply, your own sins will come to light.',
      'You fear the {authority} will turn on you if you show any disloyalty.',
    ],
    defaultLocationType: 'jail',
    resistProfile: { body: 80, will: 60, heart: 20, acuity: 40 },
    factTemplates: [
      {
        contentPattern: 'I keep order in {town}. Folk sleep safe in their beds because of me. If there are complaints, I have not heard them — and I hear everything.',
        tags: ['authority', 'surface', 'deflection'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'The {authority} gives me orders I do not always agree with. Last week it was turning {victim} away from the well at sundown. A person needs water, Brother. But I did as I was told.',
        tags: ['injustice', 'conflict', 'duty'],
        minTrustLevel: 20,
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'The {authority} told me to keep {victim} away from the meeting house — physically, if need be. Said they were a corrupting influence. I stood at the door and barred their entry while they wept. I can still hear it.',
        tags: ['injustice', 'order', 'shame'],
        minTrustLevel: 40,
        requiredApproach: 'body',
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'Three nights ago the {authority} sent me to {victim}\'s homestead. Said they needed "persuading." I used my fists, Brother. On someone half my size who could not fight back. I washed the blood off my hands in the creek and told myself it was duty. It was not duty.',
        tags: ['injustice', 'violence', 'confession'],
        minTrustLevel: 60,
        requiredApproach: 'heart',
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'If you move against the {authority}, I will not stop you. I will stand aside and let it happen. That is all I can offer — but it is more than you might think. Without me, the {authority} has no enforcer. No muscle. Just words.',
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
    motivationTemplates: [
      'You have seen the suffering firsthand and cannot bear to stay silent any longer, but you fear retaliation.',
      'You care for the sick because no one else will, even when the {authority} forbids it.',
    ],
    desireTemplates: [
      'You want the Dog to protect {victim} and end the cruelty that the {authority} calls righteousness.',
      'You want someone to finally acknowledge the pain this town inflicts on its weakest.',
    ],
    fearTemplates: [
      'You fear that speaking openly will make you the next target of the {authority}\'s wrath.',
      'You fear the Dog will side with the powerful and leave the suffering unchanged.',
    ],
    defaultLocationType: 'homestead',
    resistProfile: { body: 15, will: 25, heart: 10, acuity: 20 },
    factTemplates: [
      {
        contentPattern: 'I tend the sick in {town} — and there are more sick each week. Three new cases this month alone, all with the same fever and dark circles under the eyes. It is not any illness I recognize from my training.',
        tags: ['demonic-attacks', 'surface', 'concern'],
        minTrustLevel: 0,
      },
      {
        contentPattern: '{victim} came to my door last Tuesday at midnight, covered in bruises shaped like finger marks. They said they fell from a horse. Brother, those bruises wrapped around their throat. No horse does that. I treated them in secret and told no one — until now.',
        tags: ['sin', 'violence', 'witness'],
        minTrustLevel: 20,
        forSinLevel: 'sin',
      },
      {
        contentPattern: 'When {victim} collapsed in the street last month, I ran to help. The {authority} grabbed my arm and said "Leave them. Their suffering is earned." I watched {victim} lie in the dust for an hour before someone dared carry them home. I need you to make it so I can do my work again.',
        tags: ['injustice', 'denied-care', 'witness'],
        minTrustLevel: 40,
        requiredApproach: 'heart',
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'The sickness spreading through {town} — I have seen its like only once before, in a settlement where they found an altar in the root cellar. The fever runs cold, not hot. The afflicted speak in their sleep — the same words, over and over, in a language I do not know. This is not disease, Brother. Something is feeding on this town.',
        tags: ['demonic-attacks', 'supernatural', 'knowledge'],
        minTrustLevel: 60,
        requiredApproach: 'acuity',
        forSinLevel: 'demonic-attacks',
      },
      {
        contentPattern: 'I was changing {victim}\'s bandages three days ago when I saw them — marks burned into the skin of their back. Not brands from iron. Symbols. They form a pattern I found drawn in the margins of a book the {sinner} left at my door last spring. I have the book hidden under my floorboards. Take it. Please. I do not want it in my home any longer.',
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
    motivationTemplates: [
      'Your family is hungry and your crops are failing. Desperation has driven you to do things you never imagined.',
      'You did what you had to for survival. You would do it again if your children needed it.',
    ],
    desireTemplates: [
      'You want the Dog to understand that a starving man has no choice, and to show mercy rather than judgment.',
      'You want help — real, practical help — not sermons about faith while your children go hungry.',
    ],
    fearTemplates: [
      'You fear the Dog will punish you for your theft without understanding why you stole.',
      'You fear the {sinner} will expose your involvement in darker matters if you cooperate with the Dog.',
    ],
    defaultLocationType: 'farm',
    resistProfile: { body: 60, will: 30, heart: 40, acuity: 25 },
    factTemplates: [
      {
        contentPattern: 'The harvest has been poor in {town} — worst in twelve years. My winter stores are half what they should be and my youngest has not gained weight in two months. Something is wrong with the soil itself. It smells sour, like something died beneath it.',
        tags: ['demonic-attacks', 'surface', 'hardship'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'My fields are dying while the {sinner}\'s crops grow tall and green. We share the same creek water, the same sun. There is no natural reason their land should thrive while mine rots. I asked them their secret and they just smiled. That smile haunts me, Brother.',
        tags: ['demonic-attacks', 'jealousy', 'suspicion'],
        minTrustLevel: 20,
        forSinLevel: 'demonic-attacks',
      },
      {
        contentPattern: 'My children were crying from hunger. Three nights without a full meal. So I went to {victim}\'s storehouse and took a sack of grain. They had six sacks and I had none. I know it is theft. I know what the Book says. But Brother — have you ever watched your child go hungry while your neighbor feasts? Judge me if you must, but feed my family first.',
        tags: ['sin', 'theft', 'confession'],
        minTrustLevel: 40,
        requiredApproach: 'heart',
        forSinLevel: 'sin',
      },
      {
        contentPattern: 'The {sinner} came to my field at dusk last month. Said they could save my crops — had a bundle of herbs tied with black thread. Said to bury it at the four corners of my plot and speak certain words at moonrise. I did it, Brother. God forgive me, I did it. The crops grew back within a week. But now I hear whispering from the soil at night.',
        tags: ['sorcery', 'complicity', 'desperation'],
        minTrustLevel: 60,
        requiredApproach: 'acuity',
        forSinLevel: 'sorcery',
      },
      {
        contentPattern: 'I could not sleep last week. Went walking. Found {sinner} at the crossroads south of town, past midnight. They were kneeling in a circle of salt with candles at the compass points. Something stood in the circle with them — tall, thin, wrong. It turned toward me and I ran. I have not been back to that field since. Brother, I need you to go there. I need you to see what I saw and tell me I am not losing my mind.',
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
    motivationTemplates: [
      'You have watched and recorded everything, waiting for someone with authority to act on what you know.',
      'You protect the children first, but you also protect the truth — someone must remember what happened here.',
    ],
    desireTemplates: [
      'You want the Dog to use the evidence you have gathered to bring the guilty to account.',
      'You want justice done properly — through authority, not mob vengeance — and you can provide the proof.',
    ],
    fearTemplates: [
      'You fear that if the {authority} discovers your record-keeping, you will be silenced permanently.',
      'You fear the Dog will dismiss your careful observations as the gossip of a meddling woman.',
    ],
    defaultLocationType: 'schoolhouse',
    resistProfile: { body: 15, will: 30, heart: 25, acuity: 60 },
    factTemplates: [
      {
        contentPattern: 'I have taught the children of {town} for nine years. Last month, four families pulled their children from my school without explanation. The {authority} told them to, I suspect — though none will say so openly.',
        tags: ['surface', 'observation', 'change'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'My schoolhouse faces the main road. I see everything — who visits whom, at what hour, carrying what. The {sinner} leaves their homestead every third night after dark, heading south toward the creek. They return before dawn, always carrying something wrapped in cloth.',
        tags: ['observation', 'suspicious', 'general'],
        minTrustLevel: 20,
      },
      {
        contentPattern: 'The {sinner} visits {victim}\'s homestead when the town is at evening prayers. Every week for two months now. I have recorded the dates in my ledger. Whatever passes between them, they do not want witnesses — but they have one.',
        tags: ['sin', 'witness', 'pattern'],
        minTrustLevel: 40,
        requiredApproach: 'acuity',
        forSinLevel: 'sin',
      },
      {
        contentPattern: 'The {authority} summoned the older children to the meeting house last Sunday and taught them things that are not in the Book of Life. Told them the King requires blood sacrifice for atonement — that is doctrine I have never read in any scripture. Two of the children came to me frightened. One would not stop shaking.',
        tags: ['false-doctrine', 'witness', 'corruption'],
        minTrustLevel: 60,
        requiredApproach: 'acuity',
        forSinLevel: 'false-doctrine',
      },
      {
        contentPattern: 'I have kept a record since the trouble began — dates, times, who met whom, what I observed from my window. Three months of entries, cross-referenced. It is all in this book. Take it, Brother. Use it. I copied it in case something happens to the original. If something happens to me, the copy is beneath the third floorboard in my schoolhouse, left of the stove.',
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
    motivationTemplates: [
      'You have built a doctrine that serves your pride, and you cannot admit it is your invention, not revelation.',
      'You believe you are saving souls, even if your methods have strayed from the Book of Life.',
    ],
    desireTemplates: [
      'You want the Dog to accept your teachings as valid doctrine and move on without examining too closely.',
      'You want the faithful to remain under your spiritual guidance, not submit to some traveling Dog\'s authority.',
    ],
    fearTemplates: [
      'You fear the Dog will expose your private revelations as heresy and strip you of your congregation.',
      'You fear that without your doctrine holding them together, the faithful will turn on each other.',
    ],
    defaultLocationType: 'chapel',
    resistProfile: { body: 25, will: 85, heart: 30, acuity: 45 },
    factTemplates: [
      {
        contentPattern: 'The faithful of {town} prosper under my teaching. We have grown from twelve families to twenty in two years. The King speaks through me and the congregation listens — what more proof of righteousness could you ask?',
        tags: ['false-doctrine', 'surface', 'deflection'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'Three families have questioned my teachings this season. I gave them a choice: submit to the doctrine or leave {town}. Two left. The third... reconsidered after their livestock began dying. The King has His ways of teaching obedience.',
        tags: ['false-doctrine', 'threat', 'authority'],
        minTrustLevel: 20,
        forSinLevel: 'false-doctrine',
      },
      {
        contentPattern: 'The King of Life speaks to me directly, Brother. Not through the Book — through visions. He has shown me truths the common scripture does not contain. The elders in the eastern settlements would call it heresy. But they have not seen what I have seen. They have not heard His voice as I hear it.',
        tags: ['false-doctrine', 'heresy', 'pride'],
        minTrustLevel: 40,
        requiredApproach: 'will',
        forSinLevel: 'false-doctrine',
      },
      {
        contentPattern: 'The King revealed to me that some sins cannot be cleansed by prayer or penance. They require blood — the sinner\'s own blood, shed willingly in atonement. I have counseled two souls to this act of holy sacrifice. They thanked me for it, Brother. They wept with gratitude as the blade did its work. This is not murder. This is salvation.',
        tags: ['false-doctrine', 'blood-atonement', 'dangerous'],
        minTrustLevel: 60,
        requiredApproach: 'will',
        forSinLevel: 'false-doctrine',
      },
      {
        contentPattern: 'It began as faith. Genuine faith. But somewhere the voice I heard stopped being the King\'s and became my own pride whispering back at me. I have led {town} into darkness and called it light. The blood-atonements, the private revelations, the casting out of doubters — all of it was me. Not the King. Me. I am so tired, Brother. Tell me how to undo what I have done.',
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
    motivationTemplates: [
      'You survive by knowing everyone\'s business and staying neutral, but the {authority}\'s extortion is pushing you to choose sides.',
      'You have sold things you should not have, and the guilt of what those things were used for weighs on you.',
    ],
    desireTemplates: [
      'You want the Dog to end the {authority}\'s protection racket so you can do honest business again.',
      'You want to trade your knowledge for protection — you will tell the Dog everything if they guarantee your safety.',
    ],
    fearTemplates: [
      'You fear that if you reveal what you know, the {sinner} will burn your store with you in it.',
      'You fear the Dog will judge your complicity as harshly as the sins you enabled.',
    ],
    defaultLocationType: 'general-store',
    resistProfile: { body: 30, will: 40, heart: 35, acuity: 65 },
    factTemplates: [
      {
        contentPattern: 'I run an honest business in {town}. I sell to all comers and keep my opinions behind the counter. A merchant who takes sides does not stay a merchant long — especially in a town like this one.',
        tags: ['surface', 'neutral', 'commerce'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'The {sinner} has been buying supplies with no honest use — rope, lye, iron filings, and lamp oil in quantities no household needs. Always pays in coin, never barter. Never explains. Last week they asked for sulfur. I told them I had none, though I did. Some sales I will not make.',
        tags: ['sin', 'evidence', 'suspicious'],
        minTrustLevel: 20,
        forSinLevel: 'sin',
      },
      {
        contentPattern: 'The {authority} takes a third of my earnings every month. Calls it a tithe to the congregation, but no tithe goes into the collection box. I have watched. That coin goes into the {authority}\'s own strongbox. Anyone who refuses to pay finds their goods spoiled by morning — or their windows broken. I cannot afford to refuse. But I cannot afford to keep paying either.',
        tags: ['injustice', 'extortion', 'resentment'],
        minTrustLevel: 40,
        requiredApproach: 'acuity',
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'The {sinner} came to me four months ago with a list of ingredients — nightshade, graveyard dirt, tallow rendered from... I do not want to say what. I sold it all. I told myself it was none of my business. But last week {victim} fell ill with symptoms I have heard described in old wives\' tales about curses. I sold the tools for that, Brother. That is on my ledger and on my soul.',
        tags: ['sorcery', 'complicity', 'guilt'],
        minTrustLevel: 60,
        requiredApproach: 'heart',
        forSinLevel: 'sorcery',
      },
      {
        contentPattern: 'I keep a ledger of every transaction — names, dates, quantities, what was purchased. Three years of records. It proves the {authority}\'s extortion, the {sinner}\'s strange purchases, everything. I will give it to you, Brother, but I need something in return: guarantee my safety. If they learn I gave you this, I am a dead man before sunrise. Can you promise me that?',
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
    motivationTemplates: [
      'You stayed silent when you should have spoken, and the guilt has grown heavier with each passing day.',
      'You remember when this town was good, and you bear witness to what it has become.',
    ],
    desireTemplates: [
      'You want the Dog to set things right so you can die knowing the town will survive your failures.',
      'You want to confess your silence and be absolved — you are too old to carry this burden further.',
    ],
    fearTemplates: [
      'You fear dying before the truth comes out, leaving the town trapped in its cycle of sin.',
      'You fear the Dog is too young to understand that some sins grow from love, not malice.',
    ],
    defaultLocationType: 'homestead',
    resistProfile: { body: 20, will: 50, heart: 45, acuity: 50 },
    factTemplates: [
      {
        contentPattern: '{town} was a good place once — I remember when neighbors helped each other without asking, when the children played freely and the faithful gathered in genuine fellowship. That was before the {authority} rose to power. Now folk lock their doors and watch their words.',
        tags: ['surface', 'nostalgia', 'concern'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'The trouble started three years ago when {authority} took the Steward\'s seat. Something changed in them after the previous Steward died — a hunger for control that was not there before. They began making decisions alone. Then punishing disagreement. Then the first person fell ill after speaking against them. I marked the date in my mind: the seventh of October.',
        tags: ['pride', 'history', 'insight'],
        minTrustLevel: 20,
        forSinLevel: 'pride',
      },
      {
        contentPattern: 'When {victim} was cast out of the congregation, I sat in my chair and said nothing. I am an elder — my voice carries weight. If I had stood and objected, others would have followed. Instead I let a good soul be thrown into the cold, and I told myself it was not my fight. I have carried that silence like a stone around my neck ever since.',
        tags: ['injustice', 'guilt', 'confession'],
        minTrustLevel: 40,
        requiredApproach: 'heart',
        forSinLevel: 'injustice',
      },
      {
        contentPattern: 'There is something in {town} that was not here before. I feel it at night — a presence, cold and watchful. My dog whimpers and hides under the bed. The candles gutter without wind. Last week I woke to find frost on the inside of my windows in the middle of summer. This is not natural, Brother. This is what happens when pride opens a door that should stay shut.',
        tags: ['demonic-attacks', 'supernatural', 'fear'],
        minTrustLevel: 60,
        requiredApproach: 'will',
        forSinLevel: 'demonic-attacks',
      },
      {
        contentPattern: 'I was walking home from evening prayers when I heard voices by the creek. I crept close and saw — the King forgive me for my cowardice — I saw {sinner} hold {victim} under the water. I watched them struggle and go still. I stood behind the willows and did nothing. That was six weeks ago. I have not slept a full night since. I am telling you now because I am dying, Brother, and I will not meet the King with this on my conscience.',
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
    motivationTemplates: [
      'Your husband was taken from you and no one answered for it. You will not rest until someone does.',
      'You have nothing left to lose, which makes you dangerous to those who took everything.',
    ],
    desireTemplates: [
      'You want the Dog to investigate your husband\'s death and hold the killer accountable before the King of Life.',
      'You want justice — not revenge, but acknowledgment that what was done to your family was wrong.',
    ],
    fearTemplates: [
      'You fear the Dog will call your husband\'s death an accident and move on, as everyone else has.',
      'You fear the killer knows you suspect them, and you will be next.',
    ],
    defaultLocationType: 'homestead',
    resistProfile: { body: 10, will: 40, heart: 15, acuity: 35 },
    factTemplates: [
      {
        contentPattern: 'My husband died eight weeks ago. They buried him fast — too fast, before I could even wash the body. Since then, no one in {town} will look me in the eye. The {authority} told me to grieve quietly and not make trouble. But grief is not quiet, Brother. And neither am I.',
        tags: ['injustice', 'surface', 'grief'],
        minTrustLevel: 0,
      },
      {
        contentPattern: 'They told me it was fever that took my husband. But I held him as he died, Brother. His ribs were broken. There were bruises on his chest the shape of boot heels. Fever does not kick a man to death. Someone in this town murdered him and everyone pretends otherwise. I need you to find out who.',
        tags: ['hate-and-murder', 'suspicion', 'personal'],
        minTrustLevel: 20,
        forSinLevel: 'hate-and-murder',
      },
      {
        contentPattern: 'Three days after the funeral, the {authority} came to my homestead. Alone, after dark. Said that a widow without protection should be... grateful for guidance. Put their hand on my shoulder in a way that was not comfort. I told them to leave. They said I should reconsider, given how easily accidents happen in {town}. I have not slept without a chair against my door since.',
        tags: ['sin', 'abuse', 'victim'],
        minTrustLevel: 40,
        requiredApproach: 'heart',
        forSinLevel: 'sin',
      },
      {
        contentPattern: '{sinner} was the last person to see my husband alive. They argued that evening — I heard raised voices from inside our home. My husband owed {sinner} money from a livestock deal gone wrong. When I came outside, {sinner} was walking away fast, and my husband was sitting on the ground holding his stomach. He said it was nothing. He was dead by morning.',
        tags: ['hate-and-murder', 'motive', 'witness'],
        minTrustLevel: 60,
        requiredApproach: 'acuity',
        forSinLevel: 'hate-and-murder',
      },
      {
        contentPattern: 'I found this letter sewn into the lining of my husband\'s coat last week. He must have hidden it there before he died — he knew he was in danger. It names {sinner} directly: says they threatened him, says the {authority} knew and did nothing because the debt was owed to them too. It names dates, amounts, and witnesses. Take it, Brother. Take it and make them answer for what they did to him. I am asking you — not as a matter of doctrine, but as a woman who loved her husband. Give me justice.',
        tags: ['hate-and-murder', 'evidence', 'proof'],
        minTrustLevel: 80,
        requiredApproach: 'acuity',
        forSinLevel: 'hate-and-murder',
      },
    ],
  },
];
