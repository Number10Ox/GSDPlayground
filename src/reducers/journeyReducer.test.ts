import { describe, it, expect } from 'vitest';
import { journeyReducer, createInitialJourneyState } from './journeyReducer';
import type { JourneyState } from '@/types/journey';
import type { Conviction, ConvictionTest } from '@/types/conviction';

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

function makeTest(overrides: Partial<ConvictionTest> = {}): ConvictionTest {
  return {
    id: 'test-1',
    convictionId: 'conv-1',
    trigger: { type: 'discovery', discoveryId: 'd1', sinId: 's1' },
    description: 'Your conviction was tested',
    townId: 'town-0',
    ...overrides,
  };
}

function stateWithConvictions(convictions: Conviction[], extras: Partial<JourneyState> = {}): JourneyState {
  return {
    ...createInitialJourneyState(),
    convictions,
    phase: 'TOWN_ACTIVE',
    ...extras,
  };
}

describe('journeyReducer', () => {
  describe('createInitialJourneyState', () => {
    it('starts in TOWN_ACTIVE with empty state', () => {
      const state = createInitialJourneyState();
      expect(state.phase).toBe('TOWN_ACTIVE');
      expect(state.convictions).toEqual([]);
      expect(state.completedTowns).toEqual([]);
      expect(state.currentTownIndex).toBe(0);
      expect(state.maxTowns).toBe(7);
      expect(state.allConvictionsResolved).toBe(false);
    });
  });

  describe('SET_CONVICTIONS', () => {
    it('sets convictions on the journey state', () => {
      const conv = makeConviction();
      const state = journeyReducer(createInitialJourneyState(), {
        type: 'SET_CONVICTIONS',
        convictions: [conv],
      });
      expect(state.convictions).toEqual([conv]);
    });
  });

  describe('ADD_CONVICTION_TEST', () => {
    it('adds a test and marks conviction as tested', () => {
      const conv = makeConviction();
      const test = makeTest();
      const initial = stateWithConvictions([conv]);
      const state = journeyReducer(initial, { type: 'ADD_CONVICTION_TEST', test });
      expect(state.pendingTests).toHaveLength(1);
      expect(state.convictions[0].lifecycle).toBe('tested');
    });

    it('does not duplicate tests for same conviction in same town', () => {
      const conv = makeConviction({ lifecycle: 'tested' });
      const test = makeTest();
      const initial = stateWithConvictions([conv], { pendingTests: [test] });
      const state = journeyReducer(initial, { type: 'ADD_CONVICTION_TEST', test: { ...test, id: 'test-2' } });
      expect(state.pendingTests).toHaveLength(1);
    });

    it('does not change lifecycle if already resolved', () => {
      const conv = makeConviction({ lifecycle: 'resolved' });
      const test = makeTest();
      const initial = stateWithConvictions([conv]);
      const state = journeyReducer(initial, { type: 'ADD_CONVICTION_TEST', test });
      expect(state.convictions[0].lifecycle).toBe('resolved');
    });
  });

  describe('REFLECT_ON_CONVICTION', () => {
    describe('reinforce', () => {
      it('strengthens conviction by one step', () => {
        const conv = makeConviction({ strength: 'steady', lifecycle: 'tested' });
        const initial = stateWithConvictions([conv], {
          completedTowns: [{ townId: 't0', townName: 'Test Town', judgments: [], convictionTests: [], reflectionChoices: [], traitsGained: [], reputation: 'just', resolved: true, escalatedToMurder: false }],
        });
        const state = journeyReducer(initial, {
          type: 'REFLECT_ON_CONVICTION',
          convictionId: 'conv-1',
          choice: 'reinforce',
        });
        expect(state.convictions[0].strength).toBe('firm');
        expect(state.convictions[0].reinforceCount).toBe(1);
      });

      it('resolves conviction when reaching unshakeable', () => {
        const conv = makeConviction({ strength: 'firm', lifecycle: 'tested' });
        const initial = stateWithConvictions([conv], {
          completedTowns: [{ townId: 't0', townName: 'Test Town', judgments: [], convictionTests: [], reflectionChoices: [], traitsGained: [], reputation: 'just', resolved: true, escalatedToMurder: false }],
        });
        const state = journeyReducer(initial, {
          type: 'REFLECT_ON_CONVICTION',
          convictionId: 'conv-1',
          choice: 'reinforce',
        });
        expect(state.convictions[0].strength).toBe('unshakeable');
        expect(state.convictions[0].lifecycle).toBe('resolved');
      });

      it('adds history entry', () => {
        const conv = makeConviction({ lifecycle: 'tested' });
        const initial = stateWithConvictions([conv], {
          completedTowns: [{ townId: 't0', townName: 'Clearwater', judgments: [], convictionTests: [], reflectionChoices: [], traitsGained: [], reputation: 'just', resolved: true, escalatedToMurder: false }],
        });
        const state = journeyReducer(initial, {
          type: 'REFLECT_ON_CONVICTION',
          convictionId: 'conv-1',
          choice: 'reinforce',
        });
        expect(state.convictions[0].history).toHaveLength(1);
        expect(state.convictions[0].history[0].action).toBe('reinforced');
        expect(state.convictions[0].history[0].townName).toBe('Clearwater');
      });
    });

    describe('doubt', () => {
      it('weakens conviction by one step', () => {
        const conv = makeConviction({ strength: 'steady', lifecycle: 'tested' });
        const initial = stateWithConvictions([conv], {
          completedTowns: [{ townId: 't0', townName: 'Test Town', judgments: [], convictionTests: [], reflectionChoices: [], traitsGained: [], reputation: 'just', resolved: true, escalatedToMurder: false }],
        });
        const state = journeyReducer(initial, {
          type: 'REFLECT_ON_CONVICTION',
          convictionId: 'conv-1',
          choice: 'doubt',
        });
        expect(state.convictions[0].strength).toBe('wavering');
        expect(state.convictions[0].doubtCount).toBe(1);
        expect(state.convictions[0].lifecycle).toBe('shaken');
      });

      it('breaks conviction at 3 doubts', () => {
        const conv = makeConviction({ strength: 'wavering', lifecycle: 'tested', doubtCount: 2 });
        const initial = stateWithConvictions([conv], {
          completedTowns: [{ townId: 't0', townName: 'Test Town', judgments: [], convictionTests: [], reflectionChoices: [], traitsGained: [], reputation: 'just', resolved: true, escalatedToMurder: false }],
        });
        const state = journeyReducer(initial, {
          type: 'REFLECT_ON_CONVICTION',
          convictionId: 'conv-1',
          choice: 'doubt',
        });
        expect(state.convictions[0].doubtCount).toBe(3);
        expect(state.convictions[0].lifecycle).toBe('broken');
      });
    });

    describe('transform', () => {
      it('rewrites text and resets to steady/resolved', () => {
        const conv = makeConviction({ strength: 'fragile', lifecycle: 'broken', doubtCount: 3 });
        const initial = stateWithConvictions([conv], {
          completedTowns: [{ townId: 't0', townName: 'Test Town', judgments: [], convictionTests: [], reflectionChoices: [], traitsGained: [], reputation: 'just', resolved: true, escalatedToMurder: false }],
        });
        const state = journeyReducer(initial, {
          type: 'REFLECT_ON_CONVICTION',
          convictionId: 'conv-1',
          choice: 'transform',
          newText: 'Mercy must be earned',
        });
        expect(state.convictions[0].text).toBe('Mercy must be earned');
        expect(state.convictions[0].strength).toBe('steady');
        expect(state.convictions[0].lifecycle).toBe('held'); // Transform doesn't resolve — must be tested again
        expect(state.convictions[0].doubtCount).toBe(0);
      });

      it('preserves previousText in history', () => {
        const conv = makeConviction({ text: 'Old belief', lifecycle: 'broken' });
        const initial = stateWithConvictions([conv], {
          completedTowns: [{ townId: 't0', townName: 'Test Town', judgments: [], convictionTests: [], reflectionChoices: [], traitsGained: [], reputation: 'just', resolved: true, escalatedToMurder: false }],
        });
        const state = journeyReducer(initial, {
          type: 'REFLECT_ON_CONVICTION',
          convictionId: 'conv-1',
          choice: 'transform',
          newText: 'New belief',
        });
        expect(state.convictions[0].history[0].previousText).toBe('Old belief');
      });

      it('does nothing without newText', () => {
        const conv = makeConviction({ lifecycle: 'broken' });
        const initial = stateWithConvictions([conv], {
          completedTowns: [{ townId: 't0', townName: 'Test Town', judgments: [], convictionTests: [], reflectionChoices: [], traitsGained: [], reputation: 'just', resolved: true, escalatedToMurder: false }],
        });
        const state = journeyReducer(initial, {
          type: 'REFLECT_ON_CONVICTION',
          convictionId: 'conv-1',
          choice: 'transform',
        });
        expect(state.convictions[0].text).toBe('The faithful deserve mercy');
      });

      it('rejects whitespace-only newText', () => {
        const conv = makeConviction({ lifecycle: 'broken' });
        const initial = stateWithConvictions([conv], {
          completedTowns: [{ townId: 't0', townName: 'Test Town', judgments: [], convictionTests: [], reflectionChoices: [], traitsGained: [], reputation: 'just', resolved: true, escalatedToMurder: false }],
        });
        const state = journeyReducer(initial, {
          type: 'REFLECT_ON_CONVICTION',
          convictionId: 'conv-1',
          choice: 'transform',
          newText: '   ',
        });
        expect(state.convictions[0].text).toBe('The faithful deserve mercy');
      });
    });

    it('sets allConvictionsResolved when all originals are resolved', () => {
      const convictions = [
        makeConviction({ id: 'c1', lifecycle: 'resolved' }),
        makeConviction({ id: 'c2', lifecycle: 'tested', strength: 'firm' }),
        makeConviction({ id: 'c3', lifecycle: 'resolved' }),
      ];
      const initial = stateWithConvictions(convictions, {
        completedTowns: [{ townId: 't0', townName: 'Test Town', judgments: [], convictionTests: [], reflectionChoices: [], traitsGained: [], reputation: 'just', resolved: true, escalatedToMurder: false }],
      });
      const state = journeyReducer(initial, {
        type: 'REFLECT_ON_CONVICTION',
        convictionId: 'c2',
        choice: 'reinforce',
      });
      // c2: firm → unshakeable → resolved
      expect(state.convictions[1].lifecycle).toBe('resolved');
      expect(state.allConvictionsResolved).toBe(true);
    });
  });

  describe('COMPLETE_TOWN', () => {
    it('adds town record and clears pending tests', () => {
      const initial = stateWithConvictions([], {
        pendingTests: [makeTest()],
      });
      const record = { townId: 't0', townName: 'Town 1', judgments: [], convictionTests: [], reflectionChoices: [], traitsGained: [], reputation: 'just' as const, resolved: true, escalatedToMurder: false };
      const state = journeyReducer(initial, { type: 'COMPLETE_TOWN', record });
      expect(state.completedTowns).toHaveLength(1);
      expect(state.pendingTests).toEqual([]);
    });
  });

  describe('ADVANCE_TO_NEXT_TOWN', () => {
    it('increments town index and resets tested convictions to held', () => {
      const convictions = [
        makeConviction({ id: 'c1', lifecycle: 'tested' }),
        makeConviction({ id: 'c2', lifecycle: 'resolved' }),
        makeConviction({ id: 'c3', lifecycle: 'held' }),
      ];
      const initial = stateWithConvictions(convictions);
      const state = journeyReducer(initial, { type: 'ADVANCE_TO_NEXT_TOWN' });
      expect(state.currentTownIndex).toBe(1);
      expect(state.phase).toBe('TOWN_ACTIVE');
      expect(state.convictions[0].lifecycle).toBe('held'); // tested → held
      expect(state.convictions[1].lifecycle).toBe('resolved'); // unchanged
      expect(state.convictions[2].lifecycle).toBe('held'); // unchanged
    });
  });

  describe('CHECK_JOURNEY_COMPLETE', () => {
    it('sets JOURNEY_COMPLETE when all convictions resolved', () => {
      const convictions = [
        makeConviction({ id: 'c1', lifecycle: 'resolved' }),
        makeConviction({ id: 'c2', lifecycle: 'resolved' }),
      ];
      const initial = stateWithConvictions(convictions);
      const state = journeyReducer(initial, { type: 'CHECK_JOURNEY_COMPLETE' });
      expect(state.phase).toBe('JOURNEY_COMPLETE');
      expect(state.allConvictionsResolved).toBe(true);
    });

    it('sets JOURNEY_COMPLETE at max towns even if not all resolved', () => {
      const convictions = [makeConviction({ lifecycle: 'held' })];
      const initial = stateWithConvictions(convictions, { currentTownIndex: 6, maxTowns: 7 });
      const state = journeyReducer(initial, { type: 'CHECK_JOURNEY_COMPLETE' });
      expect(state.phase).toBe('JOURNEY_COMPLETE');
    });

    it('does nothing if conditions not met', () => {
      const convictions = [makeConviction({ lifecycle: 'held' })];
      const initial = stateWithConvictions(convictions, { currentTownIndex: 2 });
      const state = journeyReducer(initial, { type: 'CHECK_JOURNEY_COMPLETE' });
      expect(state.phase).toBe('TOWN_ACTIVE');
    });

    it('ignores born-from convictions for resolution check', () => {
      const convictions = [
        makeConviction({ id: 'c1', lifecycle: 'resolved' }),
        makeConviction({ id: 'c2', lifecycle: 'held', bornFrom: 'c1' }),
      ];
      const initial = stateWithConvictions(convictions);
      const state = journeyReducer(initial, { type: 'CHECK_JOURNEY_COMPLETE' });
      expect(state.phase).toBe('JOURNEY_COMPLETE');
    });
  });

  describe('SET_PHASE', () => {
    it('directly sets the journey phase', () => {
      const state = journeyReducer(createInitialJourneyState(), {
        type: 'SET_PHASE',
        phase: 'TOWN_REFLECTION',
      });
      expect(state.phase).toBe('TOWN_REFLECTION');
    });
  });
});
