/**
 * Sin Progression Templates
 *
 * Hand-authored templates for each of the 7 DitV sin levels.
 * Used by the sin chain generator to produce varied town moral structures.
 * Templates use placeholder slots ({town}, {authority}, {victim}, {sinner})
 * that are filled during generation.
 */

import type { SinLevel } from '@/types/investigation';

/**
 * SinSlotTemplate - A template for generating a specific sin node.
 * Slots are filled by the generator with town-specific names and roles.
 */
export interface SinSlotTemplate {
  level: SinLevel;
  name: string;
  descriptionPattern: string;
  npcRoleSlots: string[];
  causeSlot?: string;
  effectSlot?: string;
}

/**
 * SIN_TEMPLATES - 3+ templates per sin level (21+ total).
 * Content is authentic to Dogs in the Vineyard's frontier faith setting.
 */
export const SIN_TEMPLATES: Record<SinLevel, SinSlotTemplate[]> = {
  pride: [
    {
      level: 'pride',
      name: 'Authority Hubris',
      descriptionPattern:
        'The {authority} of {town} believes their judgment supersedes the King of Life. They make decisions for the flock without counsel or prayer.',
      npcRoleSlots: ['steward', 'elder', 'preacher'],
      effectSlot: 'injustice',
    },
    {
      level: 'pride',
      name: 'Family Supremacy',
      descriptionPattern:
        'The {sinner} family in {town} considers themselves above the other faithful. They hoard the best land and dismiss their neighbors as lesser.',
      npcRoleSlots: ['patriarch', 'matriarch', 'eldest-son'],
      effectSlot: 'injustice',
    },
    {
      level: 'pride',
      name: 'Secret Knowledge',
      descriptionPattern:
        'The {authority} of {town} claims private revelation from the King of Life. They hold secret meetings and whisper of truths only they can understand.',
      npcRoleSlots: ['elder', 'teacher', 'midwife'],
      effectSlot: 'false-doctrine',
    },
  ],

  injustice: [
    {
      level: 'injustice',
      name: 'Denied Care',
      descriptionPattern:
        'The {victim} in {town} has been refused healing and comfort by the {authority}. Their suffering is called a test of faith.',
      npcRoleSlots: ['widow', 'orphan', 'healer'],
      causeSlot: 'pride',
      effectSlot: 'sin',
    },
    {
      level: 'injustice',
      name: 'Unfair Labor',
      descriptionPattern:
        'The {sinner} forces the {victim} of {town} to work their fields without fair share. The community turns a blind eye.',
      npcRoleSlots: ['farmer', 'laborer', 'merchant'],
      causeSlot: 'pride',
      effectSlot: 'sin',
    },
    {
      level: 'injustice',
      name: 'Exclusion from Worship',
      descriptionPattern:
        'The {authority} has barred the {victim} from the {town} meeting house. They say the unworthy must earn their place among the faithful.',
      npcRoleSlots: ['steward', 'outcast', 'convert'],
      causeSlot: 'pride',
      effectSlot: 'sin',
    },
  ],

  sin: [
    {
      level: 'sin',
      name: 'Theft in the Night',
      descriptionPattern:
        'The {sinner} has been stealing from the {victim} of {town}. Grain stores dwindle and suspicion poisons every gathering.',
      npcRoleSlots: ['thief', 'shopkeeper', 'watchman'],
      causeSlot: 'injustice',
      effectSlot: 'demonic-attacks',
    },
    {
      level: 'sin',
      name: 'Forbidden Union',
      descriptionPattern:
        'The {sinner} of {town} has taken up with the {victim}\'s spouse. The affair is whispered about but no one dares confront it openly.',
      npcRoleSlots: ['lover', 'betrayed-spouse', 'confidant'],
      causeSlot: 'injustice',
      effectSlot: 'demonic-attacks',
    },
    {
      level: 'sin',
      name: 'Violence Against Kin',
      descriptionPattern:
        'The {sinner} has raised their hand against the {victim} in {town}. Blood has been drawn within a family that should know only love.',
      npcRoleSlots: ['abuser', 'victim-kin', 'witness'],
      causeSlot: 'injustice',
      effectSlot: 'demonic-attacks',
    },
  ],

  'demonic-attacks': [
    {
      level: 'demonic-attacks',
      name: 'Plague Upon the Faithful',
      descriptionPattern:
        'A wasting sickness spreads through {town}. The {victim} suffer most while the {sinner}\'s household remains untouched, breeding dark suspicion.',
      npcRoleSlots: ['healer', 'sick-elder', 'accused'],
      causeSlot: 'sin',
      effectSlot: 'false-doctrine',
    },
    {
      level: 'demonic-attacks',
      name: 'Blighted Harvest',
      descriptionPattern:
        'The crops of {town} wither and die despite good weather. The {authority} claims it is punishment, but only the {victim}\'s fields are afflicted.',
      npcRoleSlots: ['farmer', 'steward', 'herbalist'],
      causeSlot: 'sin',
      effectSlot: 'false-doctrine',
    },
    {
      level: 'demonic-attacks',
      name: 'Livestock Madness',
      descriptionPattern:
        'The animals of {town} turn vicious without cause. The {victim}\'s cattle have killed a child, and the {sinner} whispers it is divine will.',
      npcRoleSlots: ['rancher', 'bereaved-parent', 'tracker'],
      causeSlot: 'sin',
      effectSlot: 'sorcery',
    },
  ],

  'false-doctrine': [
    {
      level: 'false-doctrine',
      name: 'Blood Atonement',
      descriptionPattern:
        'The {authority} of {town} preaches that some sins can only be cleansed by the shedding of blood. The faithful listen with terrible eagerness.',
      npcRoleSlots: ['preacher', 'zealot', 'doubter'],
      causeSlot: 'demonic-attacks',
      effectSlot: 'sorcery',
    },
    {
      level: 'false-doctrine',
      name: 'Prosperity Gospel',
      descriptionPattern:
        'The {authority} teaches that wealth is proof of the King\'s favor. The poor of {town} are shunned as sinners while the {sinner} grows fat.',
      npcRoleSlots: ['preacher', 'merchant', 'beggar'],
      causeSlot: 'demonic-attacks',
      effectSlot: 'sorcery',
    },
    {
      level: 'false-doctrine',
      name: 'Fear-Based Worship',
      descriptionPattern:
        'The {authority} rules {town} through terror, claiming the Demons watch every moment. Children weep at prayer and the {victim} cannot sleep.',
      npcRoleSlots: ['elder', 'frightened-child', 'skeptic'],
      causeSlot: 'demonic-attacks',
      effectSlot: 'sorcery',
    },
  ],

  sorcery: [
    {
      level: 'sorcery',
      name: 'Communion with Demons',
      descriptionPattern:
        'The {sinner} of {town} speaks to things in the dark. The {victim} has seen them at the crossroads, making offerings to what answers back.',
      npcRoleSlots: ['sorcerer', 'witness', 'enabler'],
      causeSlot: 'false-doctrine',
      effectSlot: 'hate-and-murder',
    },
    {
      level: 'sorcery',
      name: 'Cursed Objects',
      descriptionPattern:
        'Strange fetishes appear on doorsteps in {town}. The {sinner} crafts them in secret while the {authority} pretends not to see.',
      npcRoleSlots: ['crafter', 'target', 'complicit-elder'],
      causeSlot: 'false-doctrine',
      effectSlot: 'hate-and-murder',
    },
    {
      level: 'sorcery',
      name: 'Binding Rituals',
      descriptionPattern:
        'The {sinner} has bound the will of the {victim} in {town} through unholy rites. They move as if in a dream, obeying without question.',
      npcRoleSlots: ['binder', 'bound-victim', 'horrified-kin'],
      causeSlot: 'false-doctrine',
      effectSlot: 'hate-and-murder',
    },
  ],

  'hate-and-murder': [
    {
      level: 'hate-and-murder',
      name: 'Revenge Killing',
      descriptionPattern:
        'The {sinner} has taken a life in {town}. They call it justice for what was done to the {victim}, but it is murder plain and cold.',
      npcRoleSlots: ['killer', 'accomplice', 'mourner'],
      causeSlot: 'sorcery',
    },
    {
      level: 'hate-and-murder',
      name: 'Ritual Sacrifice',
      descriptionPattern:
        'The {sinner} of {town} has offered the {victim} to the Demons. The {authority} found the body at the altar stone and covered it in silence.',
      npcRoleSlots: ['sacrificer', 'discoverer', 'silent-elder'],
      causeSlot: 'sorcery',
    },
    {
      level: 'hate-and-murder',
      name: 'Mob Violence',
      descriptionPattern:
        'The people of {town} have turned on the {victim} as one. The {authority} stood aside while the mob did what mobs do. None will speak of it.',
      npcRoleSlots: ['instigator', 'bystander', 'survivor'],
      causeSlot: 'sorcery',
    },
  ],
};
