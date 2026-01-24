/**
 * Conviction types - Models the Dog's core beliefs that evolve
 * across towns through testing, reinforcement, doubt, and transformation.
 */

import type { StatName } from '@/types/character';
import type { DieType } from '@/types/game';

/**
 * ConvictionCategory - Thematic grouping for heuristic test matching.
 */
export type ConvictionCategory = 'mercy' | 'justice' | 'faith' | 'community' | 'duty' | 'truth';

/**
 * ConvictionStrength - Determines dice contributed in conflicts.
 * Starts at 'steady', strengthens via reinforcement, weakens via doubt.
 */
export type ConvictionStrength = 'fragile' | 'wavering' | 'steady' | 'firm' | 'unshakeable';

/**
 * ConvictionLifecycle - Where a conviction sits in its evolution.
 * - held: Active, not yet challenged this town
 * - tested: Challenged this town (awaiting reflection)
 * - shaken: Has been doubted at least once across towns
 * - broken: Doubted 3+ times, must be transformed at next reflection
 * - resolved: Either reinforced to unshakeable or transformed
 */
export type ConvictionLifecycle = 'held' | 'tested' | 'shaken' | 'broken' | 'resolved';

export const CONVICTION_STRENGTH_DICE: Record<ConvictionStrength, DieType> = {
  fragile: 'd4',
  wavering: 'd4',
  steady: 'd6',
  firm: 'd8',
  unshakeable: 'd10',
};

export const STRENGTH_ORDER: ConvictionStrength[] = [
  'fragile', 'wavering', 'steady', 'firm', 'unshakeable',
];

/**
 * ConvictionHistoryEntry - A single event in a conviction's evolution.
 */
export interface ConvictionHistoryEntry {
  townId: string;
  townName: string;
  action: 'reinforced' | 'doubted' | 'transformed' | 'tested';
  context: string;
  previousText?: string; // Only present for 'transformed'
}

/**
 * Conviction - A core belief the Dog carries.
 */
export interface Conviction {
  id: string;
  text: string;
  originalText: string;
  strength: ConvictionStrength;
  lifecycle: ConvictionLifecycle;
  associatedStat: StatName;
  category: ConvictionCategory;
  doubtCount: number;
  reinforceCount: number;
  history: ConvictionHistoryEntry[];
  /** If this conviction was born from transforming another */
  bornFrom?: string;
}

/**
 * ConvictionTestTrigger - What caused a conviction to be challenged.
 */
export type ConvictionTestTrigger =
  | { type: 'discovery'; discoveryId: string; sinId: string }
  | { type: 'judgment'; choice: string; sinId: string }
  | { type: 'conflict_outcome'; outcome: string; npcId: string; escalationLevel: number }
  | { type: 'npc_revelation'; npcId: string; factId: string };

/**
 * ConvictionTest - A recorded moment where a conviction was challenged.
 */
export interface ConvictionTest {
  id: string;
  convictionId: string;
  trigger: ConvictionTestTrigger;
  description: string;
  townId: string;
}

/**
 * ReflectionChoice - What the player does with a tested conviction.
 */
export type ReflectionChoice = 'reinforce' | 'doubt' | 'transform';

/**
 * ConvictionSeed - A starting conviction template for character creation.
 */
export interface ConvictionSeed {
  id: string;
  text: string;
  category: ConvictionCategory;
  associatedStat: StatName;
}
