/**
 * Investigation types - Models the DitV sin progression chain,
 * discovery tracking, and fatigue clock economy.
 */

/**
 * SinLevel - The 7 levels of the Dogs in the Vineyard sin progression chain.
 * Each town's moral rot follows this linear escalation from Pride to Murder.
 */
export type SinLevel =
  | 'pride'
  | 'injustice'
  | 'sin'
  | 'demonic-attacks'
  | 'false-doctrine'
  | 'sorcery'
  | 'hate-and-murder';

/**
 * ResolutionStatus - Tracks how a sin node has been addressed.
 */
export type ResolutionStatus = 'unresolved' | 'confronted' | 'resolved';

/**
 * SinNode - A single node in the town's sin progression chain.
 * Players discover these through investigation and resolve them through confrontation.
 */
export interface SinNode {
  id: string;
  level: SinLevel;
  name: string;
  description: string;
  discovered: boolean;
  resolved: boolean;
  linkedNpcs: string[];
}

/**
 * Discovery - A piece of information uncovered during conversation.
 * Connects dialogue output to the mental map and sin progression.
 */
export interface Discovery {
  id: string;
  factId: string;
  sinId: string | null;
  npcId: string;
  content: string;
  timestamp: number;
  newConnections: string[];
}

/**
 * FatigueClock - Tracks conversation cost per cycle.
 * Each conversation advances the clock by 1 segment.
 * Max defaults to 6 segments per cycle.
 */
export interface FatigueClock {
  current: number;
  max: number;
}

/**
 * InvestigationState - Central state for the investigation system.
 */
export interface InvestigationState {
  discoveries: Discovery[];
  sinProgression: SinNode[];
  fatigueClock: FatigueClock;
  townResolved: boolean;
  sinEscalatedToMurder: boolean;
}

/**
 * InvestigationAction - All actions the investigation reducer handles.
 */
export type InvestigationAction =
  | { type: 'START_INVESTIGATION'; sinNodes: SinNode[] }
  | { type: 'RECORD_DISCOVERY'; discovery: Discovery }
  | { type: 'ADVANCE_FATIGUE' }
  | { type: 'RESET_FATIGUE' }
  | { type: 'MARK_SIN_RESOLVED'; sinId: string }
  | { type: 'MARK_TOWN_RESOLVED' }
  | { type: 'ADVANCE_SIN_PROGRESSION' }
  | { type: 'CONFRONT_SIN'; sinId: string };
