import { describe, it, expect } from 'vitest';
import {
  shouldTestFromConflict,
  shouldTestFromDiscovery,
  buildConflictTests,
  buildDiscoveryTests,
  getConflictTestDescription,
  getDiscoveryTestDescription,
} from './convictionTesting';
import type { Conviction } from '@/types/conviction';

function makeConviction(overrides: Partial<Conviction> = {}): Conviction {
  return {
    id: 'conv-1',
    text: 'The faithful deserve mercy',
    originalText: 'The faithful deserve mercy',
    strength: 'steady',
    lifecycle: 'held',
    associatedStat: 'heart',
    category: 'mercy',
    doubtCount: 0,
    reinforceCount: 0,
    history: [],
    ...overrides,
  };
}

describe('shouldTestFromConflict', () => {
  it('tests mercy convictions when player wins through violence', () => {
    const conv = makeConviction({ category: 'mercy' });
    expect(shouldTestFromConflict(conv, 'FIGHTING', 'PLAYER_WON')).toBe(true);
    expect(shouldTestFromConflict(conv, 'GUNPLAY', 'PLAYER_WON')).toBe(true);
  });

  it('does not test mercy when player wins through talking', () => {
    const conv = makeConviction({ category: 'mercy' });
    expect(shouldTestFromConflict(conv, 'JUST_TALKING', 'PLAYER_WON')).toBe(false);
  });

  it('tests justice convictions when player gives', () => {
    const conv = makeConviction({ category: 'justice' });
    expect(shouldTestFromConflict(conv, 'JUST_TALKING', 'PLAYER_GAVE')).toBe(true);
    expect(shouldTestFromConflict(conv, 'FIGHTING', 'PLAYER_GAVE')).toBe(true);
  });

  it('does not test justice when player wins', () => {
    const conv = makeConviction({ category: 'justice' });
    expect(shouldTestFromConflict(conv, 'FIGHTING', 'PLAYER_WON')).toBe(false);
  });

  it('tests truth+body convictions when escalation reaches fighting/gunplay', () => {
    const conv = makeConviction({ category: 'truth', associatedStat: 'body' });
    expect(shouldTestFromConflict(conv, 'FIGHTING', 'PLAYER_WON')).toBe(true);
    expect(shouldTestFromConflict(conv, 'GUNPLAY', 'NPC_GAVE')).toBe(true);
  });

  it('skips resolved convictions', () => {
    const conv = makeConviction({ category: 'mercy', lifecycle: 'resolved' });
    expect(shouldTestFromConflict(conv, 'GUNPLAY', 'PLAYER_WON')).toBe(false);
  });

  it('skips already-tested convictions', () => {
    const conv = makeConviction({ category: 'mercy', lifecycle: 'tested' });
    expect(shouldTestFromConflict(conv, 'GUNPLAY', 'PLAYER_WON')).toBe(false);
  });

  it('does not test unrelated categories', () => {
    const conv = makeConviction({ category: 'faith' });
    expect(shouldTestFromConflict(conv, 'FIGHTING', 'PLAYER_WON')).toBe(false);
  });
});

describe('shouldTestFromDiscovery', () => {
  it('tests mercy convictions on false-doctrine or sorcery', () => {
    const conv = makeConviction({ category: 'mercy' });
    expect(shouldTestFromDiscovery(conv, 'false-doctrine')).toBe(true);
    expect(shouldTestFromDiscovery(conv, 'sorcery')).toBe(true);
  });

  it('tests faith convictions on false-doctrine', () => {
    const conv = makeConviction({ category: 'faith' });
    expect(shouldTestFromDiscovery(conv, 'false-doctrine')).toBe(true);
  });

  it('does not test faith on sorcery', () => {
    const conv = makeConviction({ category: 'faith' });
    expect(shouldTestFromDiscovery(conv, 'sorcery')).toBe(false);
  });

  it('tests community convictions on hate-and-murder', () => {
    const conv = makeConviction({ category: 'community' });
    expect(shouldTestFromDiscovery(conv, 'hate-and-murder')).toBe(true);
  });

  it('tests truth convictions on sorcery', () => {
    const conv = makeConviction({ category: 'truth' });
    expect(shouldTestFromDiscovery(conv, 'sorcery')).toBe(true);
  });

  it('tests duty convictions on hate-and-murder', () => {
    const conv = makeConviction({ category: 'duty' });
    expect(shouldTestFromDiscovery(conv, 'hate-and-murder')).toBe(true);
  });

  it('does not test duty on lower sin levels', () => {
    const conv = makeConviction({ category: 'duty' });
    expect(shouldTestFromDiscovery(conv, 'pride')).toBe(false);
    expect(shouldTestFromDiscovery(conv, 'sorcery')).toBe(false);
  });

  it('does not test on lower sin levels', () => {
    const conv = makeConviction({ category: 'mercy' });
    expect(shouldTestFromDiscovery(conv, 'pride')).toBe(false);
    expect(shouldTestFromDiscovery(conv, 'injustice')).toBe(false);
    expect(shouldTestFromDiscovery(conv, 'sin')).toBe(false);
  });

  it('skips resolved convictions', () => {
    const conv = makeConviction({ category: 'faith', lifecycle: 'resolved' });
    expect(shouldTestFromDiscovery(conv, 'false-doctrine')).toBe(false);
  });
});

describe('buildConflictTests', () => {
  it('returns tests for matching convictions', () => {
    const convictions = [
      makeConviction({ id: 'c1', category: 'mercy' }),
      makeConviction({ id: 'c2', category: 'justice' }),
      makeConviction({ id: 'c3', category: 'faith' }),
    ];
    const tests = buildConflictTests(convictions, 'FIGHTING', 'PLAYER_WON', 'npc-1', 'town-0');
    expect(tests).toHaveLength(1);
    expect(tests[0].convictionId).toBe('c1');
    expect(tests[0].trigger.type).toBe('conflict_outcome');
  });

  it('returns multiple tests when multiple convictions match', () => {
    const convictions = [
      makeConviction({ id: 'c1', category: 'mercy' }),
      makeConviction({ id: 'c2', category: 'truth', associatedStat: 'body' }),
    ];
    const tests = buildConflictTests(convictions, 'FIGHTING', 'PLAYER_WON', 'npc-1', 'town-0');
    expect(tests).toHaveLength(2);
  });

  it('returns empty array when nothing matches', () => {
    const convictions = [makeConviction({ category: 'faith' })];
    const tests = buildConflictTests(convictions, 'JUST_TALKING', 'PLAYER_WON', 'npc-1', 'town-0');
    expect(tests).toEqual([]);
  });
});

describe('buildDiscoveryTests', () => {
  it('returns tests for matching convictions', () => {
    const convictions = [
      makeConviction({ id: 'c1', category: 'faith' }),
      makeConviction({ id: 'c2', category: 'mercy' }),
      makeConviction({ id: 'c3', category: 'duty' }),
    ];
    const tests = buildDiscoveryTests(convictions, 'false-doctrine', 'd1', 's1', 'town-0');
    expect(tests).toHaveLength(2); // faith + mercy both match false-doctrine
    expect(tests.map(t => t.convictionId).sort()).toEqual(['c1', 'c2']);
  });

  it('includes correct trigger data', () => {
    const convictions = [makeConviction({ id: 'c1', category: 'truth' })];
    const tests = buildDiscoveryTests(convictions, 'sorcery', 'd1', 's1', 'town-0');
    expect(tests[0].trigger).toEqual({ type: 'discovery', discoveryId: 'd1', sinId: 's1' });
    expect(tests[0].townId).toBe('town-0');
  });
});

describe('getConflictTestDescription', () => {
  it('describes mercy conviction tested by violence', () => {
    const conv = makeConviction({ category: 'mercy', text: 'Show compassion' });
    const desc = getConflictTestDescription(conv, 'FIGHTING', 'PLAYER_WON');
    expect(desc).toContain('violence');
    expect(desc).toContain('Show compassion');
  });

  it('describes mercy conviction tested by gunplay', () => {
    const conv = makeConviction({ category: 'mercy', text: 'Be kind' });
    const desc = getConflictTestDescription(conv, 'GUNPLAY', 'PLAYER_WON');
    expect(desc).toContain('lethal force');
  });

  it('describes justice conviction when player gives', () => {
    const conv = makeConviction({ category: 'justice', text: 'Punish the wicked' });
    const desc = getConflictTestDescription(conv, 'JUST_TALKING', 'PLAYER_GAVE');
    expect(desc).toContain('backed down');
    expect(desc).toContain('Punish the wicked');
  });
});

describe('getDiscoveryTestDescription', () => {
  it('describes false-doctrine discovery', () => {
    const conv = makeConviction({ text: 'Faith guides all' });
    const desc = getDiscoveryTestDescription(conv, 'false-doctrine');
    expect(desc).toContain('false doctrine');
    expect(desc).toContain('Faith guides all');
  });

  it('describes sorcery discovery', () => {
    const conv = makeConviction({ text: 'Trust your senses' });
    const desc = getDiscoveryTestDescription(conv, 'sorcery');
    expect(desc).toContain('Sorcery');
    expect(desc).toContain('Trust your senses');
  });

  it('describes hate-and-murder discovery', () => {
    const conv = makeConviction({ text: 'We are all family' });
    const desc = getDiscoveryTestDescription(conv, 'hate-and-murder');
    expect(desc).toContain('murder');
    expect(desc).toContain('We are all family');
  });

  it('uses generic description for unknown sin levels', () => {
    const conv = makeConviction({ text: 'Something' });
    const desc = getDiscoveryTestDescription(conv, 'pride');
    expect(desc).toContain('challenges your conviction');
  });
});
