/**
 * Journey types - Models the Dog's multi-town arc with persistent
 * character state, conviction evolution, and journey completion.
 */

import type { Character } from '@/types/character';
import type { Conviction, ConvictionTest, ReflectionChoice } from '@/types/conviction';

/**
 * JourneyPhase - The meta-game state of the Dog's overall arc.
 */
export type JourneyPhase =
  | 'CHARACTER_CREATION'
  | 'TOWN_ACTIVE'
  | 'JUDGMENT'
  | 'TOWN_REFLECTION'
  | 'RIDING_ON'
  | 'JOURNEY_COMPLETE';

/**
 * TownReputation - Overall impression the Dog left on a town.
 */
export type TownReputation = 'merciful' | 'just' | 'harsh' | 'absent';

/**
 * JudgmentRecord - A recorded judgment the Dog pronounced.
 */
export interface JudgmentRecord {
  sinId: string;
  choice: string;
  narrative: string;
}

/**
 * TownRecord - Summary of what happened in a completed town.
 */
export interface TownRecord {
  townId: string;
  townName: string;
  judgments: JudgmentRecord[];
  convictionTests: ConvictionTest[];
  reflectionChoices: { convictionId: string; choice: ReflectionChoice; newText?: string }[];
  traitsGained: string[];
  reputation: TownReputation;
  resolved: boolean;
  escalatedToMurder: boolean;
}

/**
 * JourneyState - Persistent state across the Dog's entire arc.
 */
export interface JourneyState {
  phase: JourneyPhase;
  character: Character | null;
  convictions: Conviction[];
  completedTowns: TownRecord[];
  currentTownIndex: number;
  maxTowns: number;
  pendingTests: ConvictionTest[];
  allConvictionsResolved: boolean;
}

/**
 * JourneyAction - All actions the journey reducer handles.
 */
export type JourneyAction =
  | { type: 'SET_CHARACTER'; character: Character }
  | { type: 'SET_CONVICTIONS'; convictions: Conviction[] }
  | { type: 'ADD_CONVICTION_TEST'; test: ConvictionTest }
  | { type: 'REFLECT_ON_CONVICTION'; convictionId: string; choice: ReflectionChoice; newText?: string }
  | { type: 'COMPLETE_TOWN'; record: TownRecord }
  | { type: 'ADVANCE_TO_NEXT_TOWN' }
  | { type: 'SET_PHASE'; phase: JourneyPhase }
  | { type: 'CHECK_JOURNEY_COMPLETE' }
  | { type: 'UPDATE_CHARACTER'; character: Character };

export const DEFAULT_MAX_TOWNS = 7;

export function createInitialJourneyState(): JourneyState {
  return {
    phase: 'CHARACTER_CREATION',
    character: null,
    convictions: [],
    completedTowns: [],
    currentTownIndex: 0,
    maxTowns: DEFAULT_MAX_TOWNS,
    pendingTests: [],
    allConvictionsResolved: false,
  };
}
