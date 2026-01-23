import type { DieType } from '@/types/game';

export interface InitiationApproach {
  id: string;
  label: string;
  description: string;
  resolution: string;
  traitName: string;
  traitDescription: string;
  traitDice: DieType[];
}

export interface InitiationScene {
  id: string;
  scenario: string;
  approaches: [InitiationApproach, InitiationApproach, InitiationApproach];
}

/**
 * Initiation scenes - trial-by-fire scenarios presented during character creation.
 * The player chooses an approach (talk/physical/pray) and receives a bonus trait.
 */
export const INITIATION_SCENES: InitiationScene[] = [
  {
    id: 'initiation-sick-child',
    scenario: 'A family refuses to let you bless their sick child. They say the Steward told them prayer is poison — that the old ways are the only cure. The child whimpers from the next room.',
    approaches: [
      {
        id: 'sick-child-talk',
        label: 'Talk them around',
        description: 'Speak gently about the King of Life\'s mercy. Appeal to their love for the child.',
        resolution: 'Your words cut through their fear. The mother weeps and lets you in. The child recovers by morning.',
        traitName: 'Silver-tongued',
        traitDescription: 'Your words carry the weight of genuine compassion.',
        traitDice: ['d6'],
      },
      {
        id: 'sick-child-physical',
        label: 'Push past them',
        description: 'Shoulder through the doorway. The child needs help now, not in an hour.',
        resolution: 'They curse you but stand aside. Your hands steady the child. Afterward, the father shakes your hand.',
        traitName: 'Unflinching',
        traitDescription: 'When lives hang in the balance, you do not hesitate.',
        traitDice: ['d6'],
      },
      {
        id: 'sick-child-pray',
        label: 'Pray at the threshold',
        description: 'Kneel right there in the doorway. Let the King of Life work through you for all to see.',
        resolution: 'Light pours from your clasped hands. The child laughs from inside. The family falls to their knees beside you.',
        traitName: 'Vessel of light',
        traitDescription: 'The King of Life\'s grace flows visibly through you.',
        traitDice: ['d6'],
      },
    ],
  },
  {
    id: 'initiation-false-dog',
    scenario: 'On the trail you encounter a man wearing a Dog\'s coat — stolen, you realize, from Brother Caleb who went missing last winter. The man reaches for a gun when he sees you watching.',
    approaches: [
      {
        id: 'false-dog-talk',
        label: 'Call him out by name',
        description: 'You recognize him. Ezra Cole, wanted for robbery. Tell him you know who he is and what he\'s done.',
        resolution: 'His gun hand trembles. He drops it. "You can\'t know me," he whispers. But you do. You bring him in alive.',
        traitName: 'I know your sins',
        traitDescription: 'Sinners cannot hide what they are from your gaze.',
        traitDice: ['d6'],
      },
      {
        id: 'false-dog-physical',
        label: 'Draw first',
        description: 'He\'s going for his weapon. Put a bullet in the dirt by his feet before he clears the holster.',
        resolution: 'The crack echoes off the canyon walls. He freezes. You take back Brother Caleb\'s coat without another word.',
        traitName: 'Quick draw',
        traitDescription: 'Your hand moves before conscious thought. The gun is simply there.',
        traitDice: ['d6'],
      },
      {
        id: 'false-dog-pray',
        label: 'Invoke judgment',
        description: 'Raise your hand and speak the words of binding. "In the name of the King of Life, be still."',
        resolution: 'His muscles lock. He cannot move, cannot speak. You walk up calmly and take the coat from his shoulders.',
        traitName: 'Voice of authority',
        traitDescription: 'When you speak with the King\'s authority, even the wicked obey.',
        traitDice: ['d6'],
      },
    ],
  },
  {
    id: 'initiation-burning-barn',
    scenario: 'A barn is burning outside town. Inside, livestock screams. The farmer stands frozen, staring at the flames. You smell lamp oil — this was no accident. Someone is watching from the tree line.',
    approaches: [
      {
        id: 'burning-barn-talk',
        label: 'Confront the watcher',
        description: 'March toward the tree line. Whoever set this fire will answer for it now.',
        resolution: 'A teenage boy breaks from the trees, sobbing. His father beat him raw. You promised justice. Now you must deliver it.',
        traitName: 'No one hides from me',
        traitDescription: 'The guilty cannot resist your pursuit.',
        traitDice: ['d6'],
      },
      {
        id: 'burning-barn-physical',
        label: 'Rush into the fire',
        description: 'Soak your coat in the horse trough and charge in. The animals need saving first.',
        resolution: 'You drag out three goats and a mare. Your coat is ruined. Your hands are burned. You\'d do it again.',
        traitName: 'Walk through fire',
        traitDescription: 'You have literally walked through fire and survived.',
        traitDice: ['d6'],
      },
      {
        id: 'burning-barn-pray',
        label: 'Call down rain',
        description: 'Drop to your knees. The King of Life controls all things — even the weather. Ask.',
        resolution: 'The sky darkens. Rain falls in sheets. The farmer stares at you with something between gratitude and terror.',
        traitName: 'Heaven answers',
        traitDescription: 'Your prayers produce visible, undeniable results.',
        traitDice: ['d6'],
      },
    ],
  },
  {
    id: 'initiation-demon-well',
    scenario: 'The well water has turned black in a small settlement. People are sick. At the bottom of the well, something moves in the dark — something that whispers your name and knows things it shouldn\'t.',
    approaches: [
      {
        id: 'demon-well-talk',
        label: 'Answer it back',
        description: 'Lean over the edge. Speak to the thing. Learn what it wants — and deny it.',
        resolution: 'It offers you power, secrets, revenge. You refuse each one. By dawn, the water runs clear. But you remember everything it said.',
        traitName: 'Heard the demon speak',
        traitDescription: 'You have conversed with the enemy and remained faithful.',
        traitDice: ['d6'],
      },
      {
        id: 'demon-well-physical',
        label: 'Climb down',
        description: 'Rope around your waist, sacred earth in your pocket. Go down and face it.',
        resolution: 'In the dark, something cold touches your face. You throw the sacred earth. A shriek. Silence. The water clears.',
        traitName: 'Descended into darkness',
        traitDescription: 'You went where others feared to go and came back changed.',
        traitDice: ['d6'],
      },
      {
        id: 'demon-well-pray',
        label: 'Consecrate the well',
        description: 'Pour sacred earth into the water. Recite the binding words. Seal it with prayer.',
        resolution: 'The whispering rises to a scream, then cuts off. When you open your eyes, the water is crystal clear. The sick recover by nightfall.',
        traitName: 'Sanctifier',
        traitDescription: 'Your consecrations carry true divine power.',
        traitDice: ['d6'],
      },
    ],
  },
];
