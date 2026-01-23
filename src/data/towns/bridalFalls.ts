/**
 * Bridal Falls - A complete town for Dogs in the Vineyard.
 *
 * Sin Chain (linear, 4 levels):
 * 1. Pride - Steward Ezekiel believes he alone knows God's will (root)
 * 2. Injustice - Sister Martha denied care by Steward's decree
 * 3. Sin - Brother Thomas stealing medicine for Martha
 * 4. Demonic Attacks - Strange sickness spreading (consequence of disrupted order)
 */

import type { TownData, TopicRule } from '@/types/town';
import type { Location } from '@/types/game';
import type { NPC, NPCKnowledge, ConflictThreshold } from '@/types/npc';
import type { SinNode } from '@/types/investigation';

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
  { id: 'town-square', name: 'Town Square', description: 'The heart of Bridal Falls', x: 500, y: 400, connections: ['church', 'general-store', 'sheriffs-office', 'well'] },
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
      requiredApproach: 'will',
      sinId: 'sin-pride',
    },
    {
      id: 'ez-martha-1',
      content: 'Sister Martha\'s ailment is the King\'s judgment. Medicine won\'t cure a spiritual sickness.',
      tags: ['martha', 'illness', 'doctrine'],
      minTrustLevel: 20,
      sinId: 'sin-injustice',
    },
    {
      id: 'ez-decree-1',
      content: 'I decreed that no medicine be given to those the King has marked. It is for their own salvation.',
      tags: ['decree', 'medicine', 'authority'],
      minTrustLevel: 40,
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
      minTrustLevel: 25,
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
      minTrustLevel: 20,
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
      minTrustLevel: 30,
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
      requiredApproach: 'will',
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

// ─── NPC Conflict Thresholds ────────────────────────────────────────────────

const ezekielThresholds: ConflictThreshold[] = [
  { approach: 'body', resistChance: 0.8 },
  { approach: 'will', resistChance: 0.4 },
  { approach: 'heart', resistChance: 0.6 },
  { approach: 'acuity', resistChance: 0.5 },
];

const marthaThresholds: ConflictThreshold[] = [
  { approach: 'body', resistChance: 0.2 },
  { approach: 'will', resistChance: 0.3 },
  { approach: 'heart', resistChance: 0.1 },
  { approach: 'acuity', resistChance: 0.2 },
];

const thomasThresholds: ConflictThreshold[] = [
  { approach: 'body', resistChance: 0.6 },
  { approach: 'will', resistChance: 0.5 },
  { approach: 'heart', resistChance: 0.3 },
  { approach: 'acuity', resistChance: 0.4 },
];

const ruthThresholds: ConflictThreshold[] = [
  { approach: 'body', resistChance: 0.1 },
  { approach: 'will', resistChance: 0.2 },
  { approach: 'heart', resistChance: 0.1 },
  { approach: 'acuity', resistChance: 0.15 },
];

const jacobThresholds: ConflictThreshold[] = [
  { approach: 'body', resistChance: 0.7 },
  { approach: 'will', resistChance: 0.6 },
  { approach: 'heart', resistChance: 0.5 },
  { approach: 'acuity', resistChance: 0.4 },
];

// ─── NPCs ───────────────────────────────────────────────────────────────────

const npcs: NPC[] = [
  {
    id: 'steward-ezekiel',
    name: 'Steward Ezekiel',
    locationId: 'church',
    description: 'The town steward, a man of absolute certainty and unwavering authority.',
    role: 'Town Steward',
    knowledge: ezekielKnowledge,
    conflictThresholds: ezekielThresholds,
  },
  {
    id: 'sister-martha',
    name: 'Sister Martha',
    locationId: 'general-store',
    description: 'The town midwife, weakened by illness but still caring for others.',
    role: 'Midwife',
    knowledge: marthaKnowledge,
    conflictThresholds: marthaThresholds,
  },
  {
    id: 'brother-thomas',
    name: 'Brother Thomas',
    locationId: 'homestead',
    description: 'A desperate farmer who will do anything to save the woman he loves.',
    role: 'Farmer',
    knowledge: thomasKnowledge,
    conflictThresholds: thomasThresholds,
  },
  {
    id: 'sister-ruth',
    name: 'Sister Ruth',
    locationId: 'well',
    description: 'The schoolteacher who sees everything but fears speaking out.',
    role: 'Teacher',
    knowledge: ruthKnowledge,
    conflictThresholds: ruthThresholds,
  },
  {
    id: 'sheriff-jacob',
    name: 'Sheriff Jacob',
    locationId: 'sheriffs-office',
    description: 'A lawman loyal to the Steward, torn between duty and doubt.',
    role: 'Sheriff',
    knowledge: jacobKnowledge,
    conflictThresholds: jacobThresholds,
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
];

// ─── Assembled Town ─────────────────────────────────────────────────────────

export const bridalFalls: TownData = {
  id: 'bridal-falls',
  name: 'Bridal Falls',
  description: 'A small town nestled in the mountains. Something feels wrong here.',
  locations,
  npcs,
  sinChain,
  topicRules,
};
