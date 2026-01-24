/**
 * Location Generator
 *
 * Produces Location[] arrays from layout templates using deterministic
 * seeded random selection. Coordinates are fixed per-template to ensure
 * readable SVG maps. Variety comes from template selection and
 * name/description variant picks.
 */

import type { Location } from '@/types/game';
import { createRNG } from '@/utils/seededRandom';
import { LOCATION_TEMPLATES } from '@/templates/locationTemplates';
import type { LocationSlot } from '@/templates/locationTemplates';

/**
 * Converts a name string to a kebab-case ID.
 * e.g., "The Chapel" -> "the-chapel", "Sheriff's Office" -> "sheriffs-office"
 */
function toKebabId(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Maps slot types to connection reference keys used in templates.
 * Each slot type maps to the key used in connection arrays.
 */
function getSlotKey(slot: LocationSlot, index: number, allSlots: LocationSlot[]): string {
  const type = slot.type;
  // Count how many of this type came before this index
  const typeCount = allSlots.slice(0, index).filter(s => s.type === type).length;

  if (typeCount === 0) return type;
  return `${type}-${typeCount + 1}`;
}

/**
 * Generates locations from templates using deterministic seeded selection.
 * Selects a layout template, picks enough slots for the NPC count,
 * and generates Location objects with proper IDs, coordinates, and connections.
 *
 * @param npcCount - Number of NPCs (determines minimum locations needed)
 * @param seed - Seed string for deterministic generation
 * @returns Array of Location objects with connected graph
 */
export function generateLocations(npcCount: number, seed: string): Location[] {
  const rng = createRNG(seed);

  // Select a layout template
  const template = rng.pick(LOCATION_TEMPLATES);

  // Determine how many slots to use (npcCount + 2 for discovery locations, capped at template size)
  const targetSlots = Math.min(npcCount + 2, template.slots.length);
  const slotsToUse = Math.max(targetSlots, 6); // Minimum 6 locations

  // Build slot key map for the full template (needed for connection resolution)
  const slotKeyMap = new Map<string, number>();
  for (let i = 0; i < template.slots.length; i++) {
    const key = getSlotKey(template.slots[i], i, template.slots);
    slotKeyMap.set(key, i);
  }

  // Select slots: always include all slots up to slotsToUse count
  // (template slots are ordered by importance: gathering first, then key locations)
  const selectedIndices: number[] = [];
  for (let i = 0; i < Math.min(slotsToUse, template.slots.length); i++) {
    selectedIndices.push(i);
  }

  // Build the selected slot keys set for connection filtering
  const selectedKeys = new Set<string>();
  for (const idx of selectedIndices) {
    selectedKeys.add(getSlotKey(template.slots[idx], idx, template.slots));
  }

  // Generate locations from selected slots
  const locations: Location[] = selectedIndices.map(idx => {
    const slot = template.slots[idx];
    // Pick name and description variants using RNG
    const name = rng.pick(slot.nameVariants);
    const description = rng.pick(slot.descriptionVariants);
    const id = toKebabId(name);

    // Filter connections to only include selected slots
    const validConnections = slot.connections.filter(connKey => selectedKeys.has(connKey));

    return {
      id,
      name,
      description,
      x: slot.x,
      y: slot.y,
      connections: validConnections, // Temporary: uses slot keys, resolved below
    };
  });

  // Build a map from slot key to generated location ID
  const keyToId = new Map<string, string>();
  for (let i = 0; i < selectedIndices.length; i++) {
    const idx = selectedIndices[i];
    const slotKey = getSlotKey(template.slots[idx], idx, template.slots);
    keyToId.set(slotKey, locations[i].id);
  }

  // Resolve connection keys to actual location IDs
  for (const location of locations) {
    location.connections = location.connections
      .map(connKey => keyToId.get(connKey))
      .filter((id): id is string => id !== undefined);
  }

  // Ensure bidirectional connections (if A connects to B, B connects to A)
  for (const location of locations) {
    for (const connId of location.connections) {
      const connLoc = locations.find(l => l.id === connId);
      if (connLoc && !connLoc.connections.includes(location.id)) {
        connLoc.connections.push(location.id);
      }
    }
  }

  // Ensure the graph is connected (every location reachable from every other)
  ensureConnectedGraph(locations);

  return locations;
}

/**
 * Ensures the location graph is fully connected using BFS.
 * If disconnected components exist, adds edges between them.
 */
function ensureConnectedGraph(locations: Location[]): void {
  if (locations.length <= 1) return;

  const visited = new Set<string>();
  const queue: string[] = [locations[0].id];
  visited.add(locations[0].id);

  // BFS from first location
  while (queue.length > 0) {
    const current = queue.shift()!;
    const loc = locations.find(l => l.id === current);
    if (!loc) continue;

    for (const connId of loc.connections) {
      if (!visited.has(connId)) {
        visited.add(connId);
        queue.push(connId);
      }
    }
  }

  // Connect any unreached locations to the first location
  for (const location of locations) {
    if (!visited.has(location.id)) {
      // Connect to the first location (hub/gathering point)
      const hub = locations[0];
      hub.connections.push(location.id);
      location.connections.push(hub.id);
      visited.add(location.id);
    }
  }
}
