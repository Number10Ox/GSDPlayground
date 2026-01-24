import type { FalloutSeverity } from '@/types/conflict';
import type { DescentClock } from '@/types/descent';

export type LocationId = string;

export interface Location {
  id: LocationId;
  name: string;
  description: string;
  x: number;  // SVG coordinate (0-1000 range)
  y: number;  // SVG coordinate (0-800 range)
  connections: LocationId[];  // IDs of connected locations
}

export interface Scene {
  id: string;
  locationId: LocationId;
  title: string;
  text: string;
}

// Game phases (free-roam with conflicts)
export type GamePhase = 'EXPLORING' | 'IN_DIALOGUE' | 'IN_CONFLICT' | 'TOWN_EVENT';

export interface GameState {
  // Map & navigation
  currentLocation: LocationId;
  isPanelOpen: boolean;
  currentScene: Scene | null;
  locations: Location[];

  // Game phase (replaces CyclePhase)
  gamePhase: GamePhase;

  // Descent clock (replaces daily cycle urgency)
  descentClock: DescentClock;

  // Clocks for tracking threats and progress
  clocks: Clock[];

  // Character condition (affects conflict performance)
  characterCondition: number;  // 0-100

  // Active conflict tracking (null when not in conflict)
  activeConflict: {
    npcId: string;
    stakes: string;
    conflictDefinitionId?: string;
  } | null;

  // Completed one-shot timed actions
  completedActionIds: string[];
}

export type GameAction =
  // Navigation
  | { type: 'NAVIGATE'; locationId: LocationId }
  | { type: 'OPEN_PANEL'; scene: Scene }
  | { type: 'CLOSE_PANEL' }
  // Phase transitions
  | { type: 'SET_GAME_PHASE'; phase: GamePhase }
  // Descent clock
  | { type: 'ADVANCE_DESCENT'; amount: number }
  | { type: 'RESET_DESCENT_CLOCK' }
  // Clocks
  | { type: 'ADVANCE_CLOCK'; clockId: string; amount: number }
  // Condition
  | { type: 'UPDATE_CONDITION'; delta: number }
  // Actions
  | { type: 'MARK_ACTION_COMPLETE'; actionId: string }
  // Conflict
  | { type: 'APPLY_FALLOUT'; severity: FalloutSeverity }
  | { type: 'START_GAME_CONFLICT'; npcId: string; stakes: string; conflictDefinitionId?: string }
  | { type: 'END_GAME_CONFLICT' };

// Dice types (DitV polyhedral)
export type DieType = 'd4' | 'd6' | 'd8' | 'd10';

export interface Die {
  id: string;
  type: DieType;
  value: number;        // Rolled value (1-max based on type)
  assignedTo: string | null;  // Action ID or null if in pool
}

// Clock types for tracking threats, opportunities, and progress
export type ClockType = 'danger' | 'progress' | 'opportunity';

export interface Clock {
  id: string;
  label: string;
  segments: 4 | 6 | 8;
  filled: number;       // How many segments filled (0 to segments)
  type: ClockType;
}
