import type { Die, DieType } from '@/types/game';
import type { Character } from '@/types/character';
import type { NPC } from '@/types/npc';
import type { ApproachType } from '@/types/dialogue';

/**
 * Roll a single die of the given type, returning a random value 1-max.
 */
function rollDie(type: DieType): number {
  const max = parseInt(type.slice(1)); // d4->4, d6->6, d8->8, d10->10
  return Math.floor(Math.random() * max) + 1;
}

/**
 * buildPlayerDicePool - Builds the player's starting conflict dice from their character.
 *
 * In DitV, the initial pool is the stat dice for the relevant approach.
 * The player starts with their approach stat dice (2 dice) rolled fresh.
 * Dogs are meant to be powerful — they also get their second-highest stat.
 */
export function buildPlayerDicePool(character: Character, approach: ApproachType): Die[] {
  const dice: Die[] = [];
  let counter = 0;

  // Primary stat: the approach used to initiate the conflict
  const primaryStat = character.stats[approach];
  for (const charDie of primaryStat.dice) {
    dice.push({
      id: `player-${counter++}`,
      type: charDie.type,
      value: rollDie(charDie.type),
      assignedTo: null,
    });
  }

  // Secondary stat: highest other stat (Dogs are well-rounded)
  const otherStats = (['acuity', 'heart', 'body', 'will'] as ApproachType[])
    .filter(s => s !== approach)
    .map(s => ({ name: s, dice: character.stats[s].dice }))
    .sort((a, b) => {
      const aMax = Math.max(...a.dice.map(d => parseInt(d.type.slice(1))));
      const bMax = Math.max(...b.dice.map(d => parseInt(d.type.slice(1))));
      return bMax - aMax;
    });

  if (otherStats[0]) {
    for (const charDie of otherStats[0].dice) {
      dice.push({
        id: `player-${counter++}`,
        type: charDie.type,
        value: rollDie(charDie.type),
        assignedTo: null,
      });
    }
  }

  return dice;
}

/**
 * buildNPCDicePool - Builds an NPC's conflict dice based on their role and resistance.
 *
 * NPCs are generally weaker than Dogs (the Dog carries divine authority).
 * The conflictResistance scalar (0-1) determines pool strength.
 * High resistance = more/better dice. Low resistance = fewer/weaker dice.
 */
export function buildNPCDicePool(npc: NPC): Die[] {
  const dice: Die[] = [];
  let counter = 0;

  const resistance = npc.conflictResistance ?? 0.4;

  // Base pool size: 2-5 dice depending on resistance
  // resistance 0.1 -> 2 dice, 0.5 -> 3 dice, 0.8 -> 5 dice
  const poolSize = Math.max(2, Math.min(5, Math.round(2 + resistance * 4)));

  // Die quality: resistance determines the best die type available
  // Low resistance NPCs get d4/d6, high resistance get d6/d8
  const dieTypes: DieType[] = resistance >= 0.6
    ? ['d8', 'd6', 'd6', 'd6', 'd4']
    : resistance >= 0.4
      ? ['d6', 'd6', 'd6', 'd4', 'd4']
      : ['d6', 'd4', 'd4', 'd4', 'd4'];

  for (let i = 0; i < poolSize; i++) {
    const type = dieTypes[i] ?? 'd4';
    dice.push({
      id: `npc-${counter++}`,
      type,
      value: rollDie(type),
      assignedTo: null,
    });
  }

  return dice;
}
