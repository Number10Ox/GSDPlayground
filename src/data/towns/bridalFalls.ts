/**
 * Bridal Falls - A complete town for Dogs in the Vineyard.
 *
 * Sin Chain (linear, 4 levels):
 * 1. Pride - Steward Ezekiel believes he alone knows God's will (root)
 * 2. Injustice - Sister Martha denied care by Steward's decree
 * 3. Sin - Brother Thomas stealing medicine for Martha
 * 4. Demonic Attacks - Strange sickness spreading (consequence of disrupted order)
 */

import type { TownData, TopicRule, TownEvent } from '@/types/town';
import type { Location } from '@/types/game';
import type { NPC, NPCKnowledge } from '@/types/npc';
import type { SinNode, LocationClue } from '@/types/investigation';
import type { TimedAction, ConflictDefinition } from '@/types/actions';
import type { DescentThreshold } from '@/types/descent';

// ─── Sin Chain ──────────────────────────────────────────────────────────────

const sinChain: SinNode[] = [
  {
    id: 'sin-pride',
    level: 'pride',
    name: "Steward's Pride",
    description: 'Steward Ezekiel believes he alone knows God\'s will for Bridal Falls.',
    discovered: false,
    resolved: false,
    linkedNpcs: ['steward-ezekiel'],
  },
  {
    id: 'sin-injustice',
    level: 'injustice',
    name: 'Denied Care',
    description: 'Sister Martha was denied medicine by the Steward\'s decree.',
    discovered: false,
    resolved: false,
    linkedNpcs: ['steward-ezekiel', 'sister-martha'],
  },
  {
    id: 'sin-theft',
    level: 'sin',
    name: 'Stolen Medicine',
    description: 'Brother Thomas steals medicine from the store for Martha.',
    discovered: false,
    resolved: false,
    linkedNpcs: ['brother-thomas', 'sister-martha'],
  },
  {
    id: 'sin-sickness',
    level: 'demonic-attacks',
    name: 'The Spreading Sickness',
    description: 'A strange illness spreads through Bridal Falls, consequence of the disrupted order.',
    discovered: false,
    resolved: false,
    linkedNpcs: ['sister-ruth', 'sister-martha'],
  },
];

// ─── Locations ──────────────────────────────────────────────────────────────

const locations: Location[] = [
  { id: 'town-square', name: 'Town Square', description: 'The heart of Bridal Falls', x: 500, y: 400, connections: ['church', 'general-store', 'sheriffs-office', 'well', 'homestead'] },
  { id: 'church', name: 'The Chapel', description: 'A modest house of worship where Steward Ezekiel holds court', x: 500, y: 200, connections: ['town-square', 'cemetery'] },
  { id: 'general-store', name: 'General Store', description: 'Where Martha tends to the sick between her own bouts of illness', x: 300, y: 400, connections: ['town-square'] },
  { id: 'sheriffs-office', name: "Sheriff's Office", description: 'Sheriff Jacob keeps the Steward\'s order here', x: 700, y: 400, connections: ['town-square'] },
  { id: 'cemetery', name: 'Cemetery', description: 'The town buries its dead here', x: 500, y: 50, connections: ['church'] },
  { id: 'homestead', name: "Thomas's Homestead", description: 'A small farm on the edge of town, desperately kept', x: 200, y: 250, connections: ['town-square'] },
  { id: 'well', name: 'The Well', description: 'Where the town gathers water and gossip flows', x: 650, y: 250, connections: ['town-square'] },
];

// ─── NPC Knowledge ──────────────────────────────────────────────────────────

const ezekielKnowledge: NPCKnowledge = {
  npcId: 'steward-ezekiel',
  personality: 'Proud and authoritative. Speaks with absolute certainty about doctrine. Believes his interpretations are the only correct ones. Dismissive of challenges to his authority.',
  speechPattern: 'Speaks in declarative statements, often quoting scripture. Uses "we" when meaning "I." Pauses meaningfully before answering uncomfortable questions.',
  motivation: 'You believe your authority comes directly from the King of Life, and any challenge to it is blasphemy. You made the decree about Martha because you truly believe illness is divine judgment — but deep down, you are terrified that you might be wrong.',
  desire: 'You want the Dog to validate your leadership and leave quickly without disrupting the order you have built. If the Dog sides with you, it proves the King supports your rule.',
  fear: 'You fear that if your authority is questioned publicly, the town will see you as fallible, and the obedience that holds everything together will collapse.',
  facts: [
    {
      id: 'ez-pride-1',
      content: 'I alone understand the King of Life\'s will for this town. The people need firm guidance.',
      tags: ['pride', 'authority', 'doctrine'],
      minTrustLevel: 60,
      sinId: 'sin-pride',
    },
    {
      id: 'ez-pride-2',
      content: 'My word IS the doctrine here. I don\'t need the Dogs to tell me what\'s right.',
      tags: ['pride', 'defiance'],
      minTrustLevel: 80,
      sinId: 'sin-pride',
    },
    {
      id: 'ez-martha-1',
      content: 'Sister Martha\'s ailment is the King\'s judgment. Medicine won\'t cure a spiritual sickness.',
      tags: ['martha', 'illness', 'doctrine'],
      minTrustLevel: 0,
      sinId: 'sin-injustice',
    },
    {
      id: 'ez-decree-1',
      content: 'I decreed that no medicine be given to those the King has marked. It is for their own salvation.',
      tags: ['decree', 'medicine', 'authority'],
      minTrustLevel: 20,
      sinId: 'sin-injustice',
    },
    {
      id: 'ez-town-1',
      content: 'Bridal Falls is a righteous town under my stewardship. Any troubles are tests of faith.',
      tags: ['town', 'general'],
      minTrustLevel: 0,
    },
    {
      id: 'ez-sickness-1',
      content: 'The sickness spreading is proof that some among us lack faith. Perhaps the King sends it as warning.',
      tags: ['sickness', 'doctrine'],
      minTrustLevel: 10,
    },
  ],
};

const marthaKnowledge: NPCKnowledge = {
  npcId: 'sister-martha',
  personality: 'Suffering but resilient. Grateful for any kindness shown. Speaks softly, often trailing off when discussing the Steward. Protective of Thomas.',
  speechPattern: 'Quiet, measured tone. Coughs between sentences. Uses diminutives and soft language. Avoids direct accusations.',
  motivation: 'You have been denied care by the Steward\'s decree and grow weaker each day. You need someone with authority to lift the decree before you die — but you fear putting Thomas at risk by speaking too openly.',
  desire: 'You want the Dog to confront the Steward and lift the decree so you can receive medicine openly. You also want Thomas protected from punishment for his thefts on your behalf.',
  fear: 'You fear the Dog will side with the Steward and leave, or worse — will discover Thomas\'s thefts and punish him, taking away the only person still trying to save you.',
  facts: [
    {
      id: 'martha-thomas-1',
      content: 'Thomas... he brings me herbs sometimes. I don\'t ask where he gets them. I can\'t afford to ask.',
      tags: ['thomas', 'medicine', 'theft'],
      minTrustLevel: 40,
      sinId: 'sin-theft',
    },
    {
      id: 'martha-thomas-2',
      content: 'He risks everything for me. If the Sheriff caught him taking from the store... I couldn\'t bear it.',
      tags: ['thomas', 'theft', 'risk'],
      minTrustLevel: 55,
      sinId: 'sin-theft',
    },
    {
      id: 'martha-decree-1',
      content: 'The Steward said my illness is a judgment. He told the store not to sell me medicine.',
      tags: ['steward', 'decree', 'injustice'],
      minTrustLevel: 0,
      sinId: 'sin-injustice',
    },
    {
      id: 'martha-sickness-1',
      content: 'It started with me, but now others are falling ill too. Children, even. It spreads like nothing I\'ve seen.',
      tags: ['sickness', 'spreading'],
      minTrustLevel: 0,
      sinId: 'sin-sickness',
    },
    {
      id: 'martha-sickness-2',
      content: 'The sickness isn\'t natural. It came after the Steward made his decree. Like the land itself protests.',
      tags: ['sickness', 'supernatural'],
      minTrustLevel: 30,
      sinId: 'sin-sickness',
    },
    {
      id: 'martha-gratitude-1',
      content: 'A Dog, here in Bridal Falls... perhaps the King hasn\'t forgotten us after all.',
      tags: ['greeting', 'hope'],
      minTrustLevel: 0,
    },
  ],
};

const thomasKnowledge: NPCKnowledge = {
  npcId: 'brother-thomas',
  personality: 'Desperate and protective. Will do anything for Martha. Suspicious of authority but respects the Dogs. Speaks plainly, sometimes aggressively when cornered.',
  speechPattern: 'Short, direct sentences. Voice drops when discussing anything criminal. Hands fidget. Changes subject when nervous.',
  motivation: 'Martha is dying and you are the only one willing to help her. You steal because the Steward left you no other choice, and you would do it again without hesitation.',
  desire: 'You want the Dog to fix the situation so you can stop stealing — lift the decree, punish the Steward, anything that means Martha gets medicine openly. You want mercy for your thefts, which you committed out of love.',
  fear: 'You fear the Dog will see only the theft and punish you, leaving Martha without anyone to bring her herbs. You also fear the Steward will retaliate against Martha if you cooperate too openly with the Dog.',
  facts: [
    {
      id: 'thomas-theft-1',
      content: 'I take what Martha needs from the store. At night. I know it\'s sin, but watching her suffer is worse.',
      tags: ['theft', 'medicine', 'confession'],
      minTrustLevel: 45,
      sinId: 'sin-theft',
    },
    {
      id: 'thomas-theft-2',
      content: 'The store has plenty of medicine. Ezekiel just won\'t sell it to her. What choice do I have?',
      tags: ['theft', 'justification'],
      minTrustLevel: 35,
      sinId: 'sin-theft',
    },
    {
      id: 'thomas-martha-1',
      content: 'Martha gets worse every day. Without the herbs, she\'d have died weeks ago.',
      tags: ['martha', 'illness'],
      minTrustLevel: 0,
    },
    {
      id: 'thomas-decree-1',
      content: 'The Steward declared her illness a judgment from the King. Said helping her defies divine will.',
      tags: ['steward', 'decree'],
      minTrustLevel: 0,
      sinId: 'sin-injustice',
    },
    {
      id: 'thomas-farm-1',
      content: 'The crops are failing too. Something wrong with the water maybe. Or something worse.',
      tags: ['farm', 'sickness', 'location'],
      minTrustLevel: 0,
    },
  ],
};

const ruthKnowledge: NPCKnowledge = {
  npcId: 'sister-ruth',
  personality: 'Observant and conflicted. Sees the town\'s problems clearly but fears speaking out. Respects authority of the Dogs above the Steward. Careful with words.',
  speechPattern: 'Speaks in observations rather than accusations. Uses "one might notice" constructions. Glances around before sharing sensitive information.',
  motivation: 'You have watched and recorded everything from your schoolhouse window, waiting for someone with real authority to act. The children in your class are falling ill and you cannot protect them alone.',
  desire: 'You want the Dog to use your observations as evidence to bring the Steward to account. You want justice done through proper authority, not vigilante action.',
  fear: 'You fear the Steward will discover you have been keeping records and silence you. You also fear the Dog will dismiss your careful observations as gossip.',
  facts: [
    {
      id: 'ruth-observe-1',
      content: 'I teach the children. I see everything from the schoolhouse window. Thomas walks to the store at night. The Sheriff watches but does nothing.',
      tags: ['observation', 'thomas', 'sheriff'],
      minTrustLevel: 35,
      sinId: 'sin-theft',
    },
    {
      id: 'ruth-observe-2',
      content: 'The Steward meets with Sheriff Jacob every morning. The Sheriff does whatever Ezekiel says, no questions.',
      tags: ['observation', 'steward', 'sheriff'],
      minTrustLevel: 40,
      sinId: 'sin-pride',
    },
    {
      id: 'ruth-sickness-1',
      content: 'The sickness follows a pattern. It started with Martha, then spread to those who spoke against the decree.',
      tags: ['sickness', 'pattern'],
      minTrustLevel: 10,
      sinId: 'sin-sickness',
    },
    {
      id: 'ruth-sickness-2',
      content: 'Three children in my class fell ill last week. Their parents had all questioned the Steward publicly.',
      tags: ['sickness', 'children', 'pattern'],
      minTrustLevel: 50,
      sinId: 'sin-sickness',
    },
    {
      id: 'ruth-steward-1',
      content: 'One might notice that the Steward hasn\'t consulted the Book of Life in months. He speaks from his own authority now.',
      tags: ['steward', 'pride', 'suspicion'],
      minTrustLevel: 45,
      sinId: 'sin-pride',
    },
    {
      id: 'ruth-well-1',
      content: 'The water from this well tastes wrong since the decree. Bitter, like something soured in the earth.',
      tags: ['well', 'sickness', 'location'],
      minTrustLevel: 0,
    },
  ],
};

const jacobKnowledge: NPCKnowledge = {
  npcId: 'sheriff-jacob',
  personality: 'Loyal to the Steward but respects the authority of the Dogs. Suspicious of outsiders. Tough exterior hiding doubt. Enforces order without questioning it.',
  speechPattern: 'Clipped, official tone. Answers questions with questions. Stands tall, arms crossed. Uses law enforcement language.',
  motivation: 'You enforce the Steward\'s will because order is all that keeps this town from falling apart. But you have done things you are not proud of — looking the other way, following unjust orders — and the doubt is eating at you.',
  desire: 'You want the Dog to restore proper order so you can stop doing the Steward\'s dirty work. You want someone with real authority to tell you it is acceptable to stop following unjust orders.',
  fear: 'You fear that if the Dog investigates too deeply, your own complicity — ignoring Thomas\'s thefts on the Steward\'s orders, turning a blind eye to Martha\'s suffering — will come to light and you will be judged alongside the Steward.',
  facts: [
    {
      id: 'jacob-thomas-1',
      content: 'Thomas moves around at night. I\'ve seen him near the store. Haven\'t caught him at anything... yet.',
      tags: ['thomas', 'suspicion', 'patrol'],
      minTrustLevel: 0,
    },
    {
      id: 'jacob-authority-1',
      content: 'You\'re a Dog of the King. Your authority supersedes the Steward\'s in matters of faith. I know the law.',
      tags: ['authority', 'dogs', 'law'],
      minTrustLevel: 0,
    },
    {
      id: 'jacob-steward-1',
      content: 'The Steward tells me who to watch, who to leave alone. I follow orders. That\'s my duty.',
      tags: ['steward', 'orders', 'duty'],
      minTrustLevel: 50,
      sinId: 'sin-pride',
    },
    {
      id: 'jacob-steward-2',
      content: 'Ezekiel told me to ignore Thomas\'s nighttime visits. Said the theft serves a purpose. I didn\'t ask what purpose.',
      tags: ['steward', 'orders', 'theft'],
      minTrustLevel: 70,
      sinId: 'sin-pride',
    },
    {
      id: 'jacob-sickness-1',
      content: 'People are getting sick. I don\'t know why. The Steward says it\'s faith, but... I\'ve seen plagues before. This ain\'t faith.',
      tags: ['sickness', 'doubt'],
      minTrustLevel: 40,
      sinId: 'sin-sickness',
    },
    {
      id: 'jacob-patrol-1',
      content: 'I patrol the town every night. Nothing gets past me. Well, almost nothing.',
      tags: ['patrol', 'location', 'duty'],
      minTrustLevel: 0,
    },
  ],
};

// ─── NPC Conflict Resistance (0-1 scalar: higher = stronger in conflict) ────

// ─── NPCs ───────────────────────────────────────────────────────────────────

const npcs: NPC[] = [
  {
    id: 'steward-ezekiel',
    name: 'Steward Ezekiel',
    locationId: 'church',
    description: 'The town steward, a man of absolute certainty and unwavering authority.',
    role: 'Town Steward',
    knowledge: ezekielKnowledge,
    conflictResistance: 0.575,
    personalSin: {
      description: 'Ezekiel denied medicine to Martha knowing her illness was natural, not divine. He chose doctrine over a life.',
      justification: 'If I show weakness now, the whole order collapses. One woman\'s suffering preserves the faith of many.',
      sinId: 'sin-pride',
      revealTrust: 75,
    },
  },
  {
    id: 'sister-martha',
    name: 'Sister Martha',
    locationId: 'general-store',
    description: 'The town midwife, weakened by illness but still caring for others.',
    role: 'Midwife',
    knowledge: marthaKnowledge,
    conflictResistance: 0.2,
  },
  {
    id: 'brother-thomas',
    name: 'Brother Thomas',
    locationId: 'homestead',
    description: 'A desperate farmer who will do anything to save the woman he loves.',
    role: 'Farmer',
    knowledge: thomasKnowledge,
    conflictResistance: 0.45,
    personalSin: {
      description: 'Thomas has stolen repeatedly from the general store. He also threatened the storekeeper\'s boy to keep silent.',
      justification: 'Martha would be dead without me. A few herbs weighed against a life — any Dog would do the same.',
      sinId: 'sin-theft',
      revealTrust: 55,
    },
  },
  {
    id: 'sister-ruth',
    name: 'Sister Ruth',
    locationId: 'well',
    description: 'The schoolteacher who sees everything but fears speaking out.',
    role: 'Teacher',
    knowledge: ruthKnowledge,
    conflictResistance: 0.14,
  },
  {
    id: 'sheriff-jacob',
    name: 'Sheriff Jacob',
    locationId: 'sheriffs-office',
    description: 'A lawman loyal to the Steward, torn between duty and doubt.',
    role: 'Sheriff',
    knowledge: jacobKnowledge,
    conflictResistance: 0.55,
    personalSin: {
      description: 'Jacob knew Thomas was stealing and did nothing — on the Steward\'s orders. He let Martha suffer to keep his position.',
      justification: 'I follow the law as it\'s given to me. If the Steward says let it go, that\'s above my pay. I didn\'t make the decree.',
      sinId: 'sin-injustice',
      revealTrust: 65,
    },
  },
];

// ─── Topic Rules ────────────────────────────────────────────────────────────

const topicRules: TopicRule[] = [
  // Default topics (always available to every NPC)
  { kind: 'default', label: 'greeting' },
  { kind: 'default', label: 'the-town' },

  // Discovery-gated topics
  { kind: 'discovery', label: 'steward-decree', requiredSinIds: ['sin-injustice', 'sin-pride'] },
  { kind: 'discovery', label: 'medicine-theft', requiredSinIds: ['sin-theft'] },
  { kind: 'discovery', label: 'the-sickness', requiredSinIds: ['sin-sickness'] },

  // Location-specific topics (only for specific NPCs at their locations)
  { kind: 'location', label: 'chapel-doctrine', npcId: 'steward-ezekiel', locationId: 'church', topicId: 'ez-chapel-doctrine' },
  { kind: 'location', label: 'store-remedy', npcId: 'sister-martha', locationId: 'general-store', topicId: 'martha-store-remedy' },
  { kind: 'location', label: 'farm-crops', npcId: 'brother-thomas', locationId: 'homestead', topicId: 'thomas-farm-crops' },
  { kind: 'location', label: 'well-water', npcId: 'sister-ruth', locationId: 'well', topicId: 'ruth-well-water' },
  { kind: 'location', label: 'office-records', npcId: 'sheriff-jacob', locationId: 'sheriffs-office', topicId: 'jacob-office-records' },

  // Clue-gated topics (unlocked by finding physical evidence)
  { kind: 'clue', label: 'the-decree', requiredClueId: 'clue-chapel-decree', npcId: 'steward-ezekiel' },
  { kind: 'clue', label: 'the-ledger', requiredClueId: 'clue-store-ledger' },
  { kind: 'clue', label: 'the-herbs', requiredClueId: 'clue-homestead-herbs', npcId: 'brother-thomas' },
  { kind: 'clue', label: 'tainted-water', requiredClueId: 'clue-well-taint' },
];

// ─── Arrival ──────────────────────────────────────────────────────────────────

const arrival: TownData['arrival'] = {
  narrative: `The trail opens to a cluster of buildings huddled against the mountain's flank. Bridal Falls. The waterfall that gives the town its name is barely a trickle — drought, or something worse. Shutters drawn on half the houses. No children playing. A dog watches you from a porch but doesn't bark. The chapel bell is silent.

As you ride in, a figure emerges from the general store — a woman, thin and pale, who fixes you with desperate eyes.`,
  greeterNpcId: 'sister-martha',
  rumors: [
    'A trader on the road mentioned sickness in Bridal Falls — said folk were afraid to speak openly.',
    'The territorial authority asked you to check on the Steward here. No reports in months.',
  ],
  observation: 'The gardens have gone to seed. The well rope looks frayed. This town has been neglecting the basics — a sign that something has broken the community\'s spirit.',
};

// ─── Location Clues ─────────────────────────────────────────────────────────

const clues: LocationClue[] = [
  {
    id: 'clue-store-ledger',
    locationId: 'general-store',
    description: 'The store ledger shows medicine purchases crossed out with the Steward\'s mark. Someone has been striking entries after hours.',
    discoveryId: 'sin-injustice',
    found: false,
  },
  {
    id: 'clue-chapel-decree',
    locationId: 'church',
    description: 'A formal decree nailed to the chapel door: "No succor for those the King has marked." The ink is fresh, the tone absolute.',
    discoveryId: 'sin-pride',
    found: false,
  },
  {
    id: 'clue-homestead-herbs',
    locationId: 'homestead',
    description: 'Behind the farmhouse, a hidden patch of medicinal herbs — recently harvested. Footprints lead toward the general store.',
    discoveryId: 'sin-theft',
    found: false,
  },
  {
    id: 'clue-well-taint',
    locationId: 'well',
    description: 'The well water has a bitter, unnatural taste. Dark residue clings to the stones below the waterline. This sickness may not be divine.',
    discoveryId: 'sin-sickness',
    found: false,
  },
  {
    id: 'clue-cemetery-graves',
    locationId: 'cemetery',
    description: 'Three fresh graves, unmarked. The earth was turned hastily. The dates on nearby stones show no one has died here in years — until now.',
    discoveryId: 'sin-sickness',
    found: false,
  },
];

// ─── Town Events ────────────────────────────────────────────────────────────

const events: TownEvent[] = [
  {
    id: 'event-martha-collapse',
    description: 'Sister Martha collapses in the general store. Thomas rushes to her side, shouting for help. The Steward watches from the chapel steps but does not move.',
    trigger: { type: 'DESCENT_REACHED', value: 2 },
    effects: [
      { type: 'TRUST_CHANGE', npcId: 'brother-thomas', delta: 10 },
      { type: 'NARRATIVE', text: 'Martha\'s condition is worsening. Time is running out.' },
    ],
    fired: false,
  },
  {
    id: 'event-sheriff-doubt',
    description: 'Sheriff Jacob is seen standing alone at the well at dawn, staring into the water. When he notices you watching, he quickly walks away.',
    trigger: { type: 'CLUE_FOUND', clueId: 'clue-well-taint' },
    effects: [
      { type: 'TRUST_CHANGE', npcId: 'sheriff-jacob', delta: 5 },
      { type: 'NARRATIVE', text: 'The Sheriff knows something about the water. His loyalty wavers.' },
    ],
    fired: false,
  },
  {
    id: 'event-steward-sermon',
    description: 'Steward Ezekiel holds an emergency sermon, declaring the sickness proof of sin among the faithless. He names no names, but his eyes fix on Martha\'s empty seat.',
    trigger: { type: 'DESCENT_REACHED', value: 3 },
    effects: [
      { type: 'ADVANCE_SIN' },
      { type: 'NARRATIVE', text: 'The Steward tightens his grip. Fear spreads faster than the sickness.' },
    ],
    fired: false,
  },
  {
    id: 'event-thomas-caught',
    description: 'A crash in the night. Thomas is caught leaving the store with a satchel of herbs. The Sheriff holds him by the collar, waiting for the Steward\'s word.',
    trigger: { type: 'DESCENT_REACHED', value: 4 },
    effects: [
      { type: 'TRUST_CHANGE', npcId: 'brother-thomas', delta: -10 },
      { type: 'UNLOCK_CLUE', clueId: 'clue-store-ledger' },
      { type: 'NARRATIVE', text: 'Thomas has been caught. Without intervention, the Steward will make an example of him.' },
    ],
    fired: false,
  },
  {
    id: 'event-child-sick',
    description: 'Ruth\'s youngest student does not come to school. Then another. The sickness has reached the children.',
    trigger: { type: 'DESCENT_REACHED', value: 5 },
    effects: [
      { type: 'ADVANCE_SIN' },
      { type: 'NARRATIVE', text: 'Children are falling ill. The town cannot endure much more.' },
    ],
    fired: false,
  },
  {
    id: 'event-descent-overflow',
    description: 'The rot deepens. You feel it in the air — something has shifted in Bridal Falls. The sin that festers here has taken another step toward damnation. What was hidden grows bolder. What was whispered is now spoken aloud.',
    trigger: { type: 'DESCENT_REACHED', value: 8 },
    effects: [
      { type: 'NARRATIVE', text: 'The town descends further. Sin escalates.' },
    ],
    fired: false,
  },
];

// ─── Timed Actions ──────────────────────────────────────────────────────────

const timedActions: TimedAction[] = [
  {
    id: 'action-pray-chapel',
    name: 'Pray at the Chapel',
    description: 'Spend time in quiet prayer, restoring your spirit.',
    locationId: 'church',
    descentCost: 1,
    effects: [{ type: 'RESTORE_CONDITION', amount: 15 }],
    oneShot: false,
  },
  {
    id: 'action-tend-martha',
    name: 'Tend to Martha',
    description: 'Help ease her suffering with faith and care.',
    locationId: 'general-store',
    descentCost: 1,
    effects: [
      { type: 'TRUST_CHANGE', npcId: 'sister-martha', delta: 10 },
      { type: 'TRUST_CHANGE', npcId: 'brother-thomas', delta: 5 },
    ],
    oneShot: true,
  },
  {
    id: 'action-search-homestead',
    name: 'Search the Homestead',
    description: 'Look through Thomas\'s things for clues about his desperation.',
    locationId: 'homestead',
    descentCost: 1,
    effects: [{ type: 'DISCOVER_CLUE', clueId: 'clue-homestead-herbs' }],
    unlockCondition: { type: 'trust_min', npcId: 'brother-thomas', value: 20 },
    oneShot: true,
  },
  {
    id: 'action-inspect-well',
    name: 'Inspect the Well Water',
    description: 'Something about this water isn\'t right.',
    locationId: 'well',
    descentCost: 1,
    effects: [{ type: 'DISCOVER_CLUE', clueId: 'clue-well-taint' }],
    oneShot: true,
  },
  {
    id: 'action-read-decree',
    name: 'Read the Posted Decree',
    description: 'Study the Steward\'s decree nailed to the chapel door.',
    locationId: 'church',
    descentCost: 1,
    effects: [{ type: 'DISCOVER_CLUE', clueId: 'clue-chapel-decree' }],
    oneShot: true,
  },
  {
    id: 'action-visit-graves',
    name: 'Visit the Fresh Graves',
    description: 'Someone has been buried recently. The earth is still soft.',
    locationId: 'cemetery',
    descentCost: 1,
    effects: [{ type: 'DISCOVER_CLUE', clueId: 'clue-cemetery-graves' }],
    oneShot: true,
  },
  {
    id: 'action-check-ledger',
    name: 'Examine the Store Ledger',
    description: 'The ledger might show who has been buying what — and who has been denied.',
    locationId: 'general-store',
    descentCost: 1,
    effects: [{ type: 'DISCOVER_CLUE', clueId: 'clue-store-ledger' }],
    unlockCondition: { type: 'descent_min', value: 3 },
    oneShot: true,
  },
  {
    id: 'action-consecrate-well',
    name: 'Consecrate the Well',
    description: 'Bless the water and purify what you can.',
    locationId: 'well',
    descentCost: 1,
    effects: [
      { type: 'RESTORE_CONDITION', amount: 10 },
      { type: 'NARRATIVE', text: 'The water runs clear, if only for now.' },
    ],
    unlockCondition: { type: 'clue_found', clueId: 'clue-well-taint' },
    oneShot: true,
  },
];

// ─── Conflict Definitions ───────────────────────────────────────────────────

const conflictDefinitions: ConflictDefinition[] = [
  {
    id: 'conflict-confront-steward',
    npcId: 'steward-ezekiel',
    stakes: 'Confront the Steward about his decree',
    locationId: 'church',
    minEscalation: 'JUST_TALKING',
    maxEscalation: 'FIGHTING',
    npcAggression: 0.6,
    descentCost: { onGive: 1, onEscalate: 1, onFallout: 1 },
    unlockCondition: { type: 'sin_discovered', sinId: 'sin-pride' },
    consequences: {
      playerWins: [
        { type: 'RESOLVE_SIN', sinId: 'sin-pride' },
        { type: 'NARRATIVE', text: 'The Steward yields. His pride cracks, if only for a moment.' },
      ],
      playerGives: [
        { type: 'ADVANCE_DESCENT', amount: 1 },
        { type: 'NARRATIVE', text: 'The Steward smiles coldly. Your words failed to move him.' },
      ],
      npcGives: [
        { type: 'TRUST_CHANGE', npcId: 'steward-ezekiel', delta: -20 },
        { type: 'NARRATIVE', text: 'Ezekiel backs down, hatred burning in his eyes.' },
      ],
    },
  },
  {
    id: 'conflict-demand-truth-thomas',
    npcId: 'brother-thomas',
    stakes: 'Demand the truth about the herbs',
    locationId: 'homestead',
    minEscalation: 'JUST_TALKING',
    maxEscalation: 'PHYSICAL',
    npcAggression: 0.3,
    descentCost: { onGive: 1, onEscalate: 1, onFallout: 1 },
    unlockCondition: { type: 'clue_found', clueId: 'clue-homestead-herbs' },
    consequences: {
      playerWins: [
        { type: 'DISCOVER_SIN', sinId: 'sin-theft' },
        { type: 'NARRATIVE', text: 'Thomas confesses — he\'s been stealing from the store to treat Martha.' },
      ],
      playerGives: [
        { type: 'NARRATIVE', text: 'Thomas clams up. You\'ll need another way to learn the truth.' },
      ],
      npcGives: [
        { type: 'TRUST_CHANGE', npcId: 'brother-thomas', delta: -15 },
        { type: 'UNLOCK_CLUE', clueId: 'clue-store-ledger' },
        { type: 'NARRATIVE', text: 'Thomas breaks down and points you to the store ledger.' },
      ],
    },
  },
  {
    id: 'conflict-challenge-sheriff',
    npcId: 'sheriff-jacob',
    stakes: 'Challenge the Sheriff\'s loyalty',
    locationId: 'sheriffs-office',
    minEscalation: 'JUST_TALKING',
    maxEscalation: 'GUNPLAY',
    npcAggression: 0.5,
    descentCost: { onGive: 1, onEscalate: 1, onFallout: 1 },
    unlockCondition: { type: 'descent_min', value: 4 },
    consequences: {
      playerWins: [
        { type: 'TRUST_CHANGE', npcId: 'sheriff-jacob', delta: 30 },
        { type: 'NARRATIVE', text: 'Jacob\'s resolve breaks. He admits the Steward has gone too far.' },
      ],
      playerGives: [
        { type: 'ADVANCE_DESCENT', amount: 2 },
        { type: 'NARRATIVE', text: 'Jacob stands firm. The Steward\'s grip tightens on the law.' },
      ],
      npcGives: [
        { type: 'TRUST_CHANGE', npcId: 'sheriff-jacob', delta: 15 },
        { type: 'NARRATIVE', text: 'The Sheriff lowers his weapon. "You\'re right. This isn\'t the King\'s way."' },
      ],
    },
  },
  {
    id: 'conflict-convince-martha',
    npcId: 'sister-martha',
    stakes: 'Convince Martha to testify against the Steward',
    locationId: 'general-store',
    minEscalation: 'JUST_TALKING',
    maxEscalation: 'JUST_TALKING',
    npcAggression: 0.2,
    descentCost: { onGive: 1, onEscalate: 0, onFallout: 1 },
    unlockCondition: { type: 'sin_discovered', sinId: 'sin-injustice' },
    consequences: {
      playerWins: [
        { type: 'TRUST_CHANGE', npcId: 'sister-martha', delta: 20 },
        { type: 'NARRATIVE', text: 'Martha nods, tears in her eyes. "I\'ll speak. Someone has to."' },
      ],
      playerGives: [
        { type: 'NARRATIVE', text: 'Martha shakes her head. "I can\'t. He\'ll hurt Thomas."' },
      ],
      npcGives: [
        { type: 'TRUST_CHANGE', npcId: 'sister-martha', delta: 10 },
        { type: 'NARRATIVE', text: 'Martha agrees reluctantly. Her hands tremble.' },
      ],
    },
  },
  {
    id: 'conflict-ambush-store',
    npcId: 'steward-ezekiel',
    stakes: 'The Steward\'s men ambush you at the store',
    locationId: 'general-store',
    minEscalation: 'PHYSICAL',
    maxEscalation: 'GUNPLAY',
    npcAggression: 0.8,
    descentCost: { onGive: 2, onEscalate: 1, onFallout: 1 },
    unlockCondition: { type: 'descent_min', value: 6 },
    consequences: {
      playerWins: [
        { type: 'ADVANCE_DESCENT', amount: 1 },
        { type: 'NARRATIVE', text: 'You fight them off. The Steward will think twice before trying that again.' },
      ],
      playerGives: [
        { type: 'ADVANCE_DESCENT', amount: 2 },
        { type: 'NARRATIVE', text: 'They beat you and leave you in the dirt. The message is clear.' },
      ],
      npcGives: [
        { type: 'TRUST_CHANGE', npcId: 'steward-ezekiel', delta: -30 },
        { type: 'NARRATIVE', text: 'His men scatter. The Steward\'s authority cracks.' },
      ],
    },
  },
];

// ─── Descent Thresholds ─────────────────────────────────────────────────────

const descentThresholds: DescentThreshold[] = [
  { at: 2, eventId: 'event-martha-collapse', fired: false },
  { at: 3, eventId: 'event-steward-sermon', fired: false },
  { at: 4, eventId: 'event-thomas-caught', fired: false },
  { at: 5, eventId: 'event-child-sick', fired: false },
  { at: 8, eventId: 'event-descent-overflow', fired: false },
];

// ─── Assembled Town ─────────────────────────────────────────────────────────

export const bridalFalls: TownData = {
  id: 'bridal-falls',
  name: 'Bridal Falls',
  description: 'A small town nestled in the mountains. Something feels wrong here.',
  locations,
  npcs,
  sinChain,
  clues,
  topicRules,
  arrival,
  events,
  hasLaw: true,
  timedActions,
  conflictDefinitions,
  descentThresholds,
};
