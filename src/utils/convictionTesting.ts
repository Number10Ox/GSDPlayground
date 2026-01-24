import type { Conviction, ConvictionTest, ConvictionTestTrigger, ConvictionCategory } from '@/types/conviction';
import type { EscalationLevel } from '@/types/conflict';

/**
 * Category opposition map - which categories challenge each other.
 * Used for heuristic conviction testing without LLM inference.
 */
export const CATEGORY_OPPOSITIONS: Record<ConvictionCategory, ConvictionCategory[]> = {
  mercy: ['justice'],
  justice: ['mercy', 'community'],
  faith: ['truth'],
  community: ['justice', 'duty'],
  duty: ['mercy', 'community'],
  truth: ['faith'],
};

/**
 * Determines if a conflict outcome should test a conviction.
 * Violence-related convictions are tested when violence is used (or avoided).
 */
export function shouldTestFromConflict(
  conviction: Conviction,
  escalationLevel: EscalationLevel,
  outcome: string,
): boolean {
  if (conviction.lifecycle === 'resolved' || conviction.lifecycle === 'tested') return false;

  // "Violence is the last refuge" type convictions tested when player escalates to fighting/gunplay
  if (conviction.category === 'truth' && conviction.associatedStat === 'body') {
    if (escalationLevel === 'FIGHTING' || escalationLevel === 'GUNPLAY') {
      return true;
    }
  }

  // Mercy convictions tested when player wins through violence
  if (conviction.category === 'mercy' && outcome === 'PLAYER_WON') {
    if (escalationLevel === 'FIGHTING' || escalationLevel === 'GUNPLAY') {
      return true;
    }
  }

  // Justice convictions tested when player gives (shows leniency under pressure)
  if (conviction.category === 'justice' && outcome === 'PLAYER_GAVE') {
    return true;
  }

  return false;
}

/**
 * Determines if a discovery should test a conviction.
 * Uses category opposition: discovering facts about opposing values challenges belief.
 */
export function shouldTestFromDiscovery(
  conviction: Conviction,
  sinLevel: string,
): boolean {
  if (conviction.lifecycle === 'resolved' || conviction.lifecycle === 'tested') return false;

  // Mercy convictions tested when discovering that "victims" are perpetrators
  // (sin levels above 'sin' suggest the original victim has become complicit)
  if (conviction.category === 'mercy') {
    if (sinLevel === 'false-doctrine' || sinLevel === 'sorcery') {
      return true;
    }
  }

  // Faith convictions tested when discovering false doctrine
  if (conviction.category === 'faith' && sinLevel === 'false-doctrine') {
    return true;
  }

  // Community convictions tested when discovering hate-and-murder
  if (conviction.category === 'community' && sinLevel === 'hate-and-murder') {
    return true;
  }

  // Truth convictions tested when discovering sorcery (supernatural undermines observation)
  if (conviction.category === 'truth' && sinLevel === 'sorcery') {
    return true;
  }

  return false;
}

/**
 * Generate a test description for a conflict-triggered conviction test.
 */
export function getConflictTestDescription(
  conviction: Conviction,
  escalationLevel: EscalationLevel,
  outcome: string,
): string {
  if (conviction.category === 'mercy' && outcome === 'PLAYER_WON') {
    return `You used ${escalationLevel === 'GUNPLAY' ? 'lethal force' : 'violence'} to prevail. Can you still believe "${conviction.text}"?`;
  }
  if (conviction.category === 'justice' && outcome === 'PLAYER_GAVE') {
    return `You backed down rather than press your judgment. Does "${conviction.text}" still hold?`;
  }
  if (conviction.associatedStat === 'body' && conviction.category === 'truth') {
    return `You escalated to ${escalationLevel === 'GUNPLAY' ? 'gunplay' : 'violence'}. What does that say about "${conviction.text}"?`;
  }
  return `Your actions in conflict tested your belief: "${conviction.text}"`;
}

/**
 * Generate a test description for a discovery-triggered conviction test.
 */
export function getDiscoveryTestDescription(
  conviction: Conviction,
  sinLevel: string,
): string {
  switch (sinLevel) {
    case 'false-doctrine':
      return `You discovered false doctrine at work in this town. What does that mean for "${conviction.text}"?`;
    case 'sorcery':
      return `Sorcery has taken root here. Your belief "${conviction.text}" faces a truth you did not expect.`;
    case 'hate-and-murder':
      return `Hate has blossomed into murder. Can "${conviction.text}" survive what you have witnessed?`;
    default:
      return `What you have discovered challenges your conviction: "${conviction.text}"`;
  }
}

/**
 * Build conviction tests from a conflict outcome.
 * Returns tests for all convictions that should be challenged.
 */
export function buildConflictTests(
  convictions: Conviction[],
  escalationLevel: EscalationLevel,
  outcome: string,
  npcId: string,
  townId: string,
): ConvictionTest[] {
  const tests: ConvictionTest[] = [];

  for (const conviction of convictions) {
    if (shouldTestFromConflict(conviction, escalationLevel, outcome)) {
      const trigger: ConvictionTestTrigger = {
        type: 'conflict_outcome',
        outcome,
        npcId,
        escalationLevel: ['JUST_TALKING', 'PHYSICAL', 'FIGHTING', 'GUNPLAY'].indexOf(escalationLevel),
      };

      tests.push({
        id: crypto.randomUUID(),
        convictionId: conviction.id,
        trigger,
        description: getConflictTestDescription(conviction, escalationLevel, outcome),
        townId,
      });
    }
  }

  return tests;
}

/**
 * Build conviction tests from a discovery.
 * Returns tests for all convictions challenged by discovering this sin level.
 */
export function buildDiscoveryTests(
  convictions: Conviction[],
  sinLevel: string,
  discoveryId: string,
  sinId: string,
  townId: string,
): ConvictionTest[] {
  const tests: ConvictionTest[] = [];

  for (const conviction of convictions) {
    if (shouldTestFromDiscovery(conviction, sinLevel)) {
      const trigger: ConvictionTestTrigger = {
        type: 'discovery',
        discoveryId,
        sinId,
      };

      tests.push({
        id: crypto.randomUUID(),
        convictionId: conviction.id,
        trigger,
        description: getDiscoveryTestDescription(conviction, sinLevel),
        townId,
      });
    }
  }

  return tests;
}
