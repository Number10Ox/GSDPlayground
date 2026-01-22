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

export interface GameState {
  // Existing Phase 1 state
  currentLocation: LocationId;
  isPanelOpen: boolean;
  currentScene: Scene | null;
  locations: Location[];

  // Cycle state
  cyclePhase: CyclePhase;
  cycleNumber: number;
  dicePool: Die[];
  selectedDieId: string | null;
  clocks: Clock[];
  availableActions: AvailableAction[];
}

export type GameAction =
  // Existing Phase 1 actions
  | { type: 'NAVIGATE'; locationId: LocationId }
  | { type: 'OPEN_PANEL'; scene: Scene }
  | { type: 'CLOSE_PANEL' }
  // Cycle actions
  | { type: 'START_CYCLE' }
  | { type: 'SELECT_DIE'; dieId: string }
  | { type: 'ASSIGN_DIE'; actionId: string }
  | { type: 'UNASSIGN_DIE'; dieId: string }
  | { type: 'CONFIRM_ALLOCATIONS' }
  | { type: 'RESOLVE_NEXT' }
  | { type: 'ADVANCE_CLOCK'; clockId: string; amount: number }
  | { type: 'VIEW_SUMMARY' }
  | { type: 'END_CYCLE' }
  | { type: 'REST_EARLY' };

// Dice types (DitV polyhedral)
export type DieType = 'd4' | 'd6' | 'd8' | 'd10';

export interface Die {
  id: string;
  type: DieType;
  value: number;        // Rolled value (1-max based on type)
  assignedTo: string | null;  // Action ID or null if in pool
}

// Cycle phases (Citizen Sleeper-inspired)
export type CyclePhase = 'WAKE' | 'ALLOCATE' | 'RESOLVE' | 'SUMMARY' | 'REST';

// Clock types for tracking threats, opportunities, and progress
export type ClockType = 'danger' | 'progress' | 'opportunity';

export interface Clock {
  id: string;
  label: string;
  segments: 4 | 6 | 8;
  filled: number;       // How many segments filled (0 to segments)
  type: ClockType;
  autoAdvance: boolean; // Whether it advances each cycle automatically
}

// Actions available to player during allocation phase
export interface AvailableAction {
  id: string;
  name: string;
  description: string;
  locationId: LocationId | null;  // null = available anywhere
  diceCost: number;               // 0 = free action (movement, observation)
  available: boolean;             // Requirements met?
  requirementHint?: string;       // "Requires: Talk to Sheriff first"
}
