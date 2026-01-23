import type { AvailableAction, LocationId } from '@/types/game';
import type { LocationClue } from '@/types/investigation';
import type { NPC } from '@/types/npc';
import type { DutyDefinition } from '@/data/duties';
import type { NPCMemory } from '@/types/npc';

/**
 * ActionType - Category tag stored in action ID prefix for resolution.
 */
export type ActionType = 'investigate' | 'observe' | 'pray' | 'talk' | 'authority' | 'duty';

/**
 * parseActionType - Extract the action type from an action ID.
 * Action IDs are prefixed with type: "investigate-church", "observe-well", etc.
 */
export function parseActionType(actionId: string): ActionType {
  if (actionId.startsWith('investigate-')) return 'investigate';
  if (actionId.startsWith('observe-')) return 'observe';
  if (actionId.startsWith('pray')) return 'pray';
  if (actionId.startsWith('authority-')) return 'authority';
  if (actionId.startsWith('talk-')) return 'talk';
  if (actionId.startsWith('duty-')) return 'duty';
  return 'investigate'; // fallback
}

/**
 * generateActionsForLocation - Produces meaningful actions based on game state.
 *
 * Actions are contextual: investigate appears when clues remain, observe when NPCs
 * are present, pray is always available.
 */
export function generateActionsForLocation(
  locationId: LocationId,
  allClues: LocationClue[],
  npcsAtLocation: NPC[],
  discoveredSinIds: string[],
  currentLocation: LocationId
): AvailableAction[] {
  const actions: AvailableAction[] = [];

  // Investigate: available when undiscovered clues exist at this location
  const locationClues = allClues.filter(c => c.locationId === locationId && !c.found);
  if (locationClues.length > 0) {
    actions.push({
      id: `investigate-${locationId}`,
      name: 'Investigate',
      description: `Search ${getLocationShortName(locationId)} for evidence`,
      locationId,
      diceCost: 1,
      available: locationId === currentLocation,
      requirementHint: locationId !== currentLocation ? `Requires: Travel to ${getLocationShortName(locationId)}` : undefined,
    });
  }

  // Observe: available when NPCs are at the location
  if (npcsAtLocation.length > 0) {
    actions.push({
      id: `observe-${locationId}`,
      name: 'Observe',
      description: `Watch the people here — note their habits and worries`,
      locationId,
      diceCost: 1,
      available: locationId === currentLocation,
      requirementHint: locationId !== currentLocation ? `Requires: Travel to ${getLocationShortName(locationId)}` : undefined,
    });
  }

  // Talk: per-NPC conversation actions
  for (const npc of npcsAtLocation) {
    actions.push({
      id: `talk-${npc.id}`,
      name: `Talk to ${npc.name}`,
      description: npc.description,
      locationId,
      diceCost: 1,
      available: locationId === currentLocation,
    });
  }

  return actions;
}

/**
 * generateGlobalActions - Actions available regardless of location.
 */
export function generateGlobalActions(hasAuthority: boolean): AvailableAction[] {
  const actions: AvailableAction[] = [
    {
      id: 'pray',
      name: 'Pray for Guidance',
      description: 'Seek wisdom from the King of Life. Restores condition.',
      locationId: null,
      diceCost: 1,
      available: true,
    },
    {
      id: 'rest-early',
      name: 'Rest Early',
      description: 'End the day and recover your strength.',
      locationId: null,
      diceCost: 0,
      available: true,
    },
  ];

  if (hasAuthority) {
    actions.push({
      id: 'authority-hold-service',
      name: 'Hold a Service',
      description: 'Gather the faithful and speak with the King\'s authority. Raises trust broadly.',
      locationId: null,
      diceCost: 2,
      available: true,
    });
  }

  return actions;
}

/**
 * DutyContext - Information needed to check duty triggers.
 */
export interface DutyContext {
  duties: DutyDefinition[];
  fulfilledDutyIds: string[];
  cycleNumber: number;
  npcMemories: NPCMemory[];
  foundClueIds: string[];
}

/**
 * generateDutyActions - Check which duties have their triggers met and return as actions.
 */
export function generateDutyActions(context: DutyContext): AvailableAction[] {
  const actions: AvailableAction[] = [];

  for (const duty of context.duties) {
    // Skip already fulfilled duties
    if (context.fulfilledDutyIds.includes(duty.id)) continue;

    // Check trigger condition
    let triggered = false;
    switch (duty.trigger.type) {
      case 'CYCLE_REACHED':
        triggered = context.cycleNumber >= duty.trigger.min;
        break;
      case 'TRUST_THRESHOLD': {
        const memory = context.npcMemories.find(m => m.npcId === duty.trigger.npcId);
        triggered = (memory?.relationshipLevel ?? 0) >= duty.trigger.min;
        break;
      }
      case 'CLUE_FOUND':
        triggered = context.foundClueIds.includes(duty.trigger.clueId);
        break;
    }

    if (triggered) {
      actions.push({
        id: duty.id,
        name: duty.name,
        description: duty.description,
        locationId: duty.locationId,
        diceCost: duty.diceCost,
        available: true,
        isDuty: true,
        dutyId: duty.id,
      });
    }
  }

  return actions;
}

/**
 * generateAllActions - Combine location-specific, global, and duty actions.
 */
export function generateAllActions(
  locations: { id: LocationId }[],
  allClues: LocationClue[],
  allNpcs: NPC[],
  discoveredSinIds: string[],
  currentLocation: LocationId,
  hasAuthority: boolean,
  dutyContext?: DutyContext
): AvailableAction[] {
  const locationActions: AvailableAction[] = [];

  // Only generate actions for current location (player can't act elsewhere)
  const npcsHere = allNpcs.filter(n => n.locationId === currentLocation);
  const localActions = generateActionsForLocation(
    currentLocation,
    allClues,
    npcsHere,
    discoveredSinIds,
    currentLocation
  );
  locationActions.push(...localActions);

  const globalActions = generateGlobalActions(hasAuthority);

  // Generate duty actions if context provided
  const dutyActions = dutyContext ? generateDutyActions(dutyContext) : [];

  return [...dutyActions, ...locationActions, ...globalActions];
}

function getLocationShortName(locationId: string): string {
  const names: Record<string, string> = {
    'town-square': 'the town square',
    'church': 'the chapel',
    'general-store': 'the general store',
    'sheriffs-office': 'the sheriff\'s office',
    'cemetery': 'the cemetery',
    'homestead': 'the homestead',
    'well': 'the well',
  };
  return names[locationId] ?? locationId;
}
