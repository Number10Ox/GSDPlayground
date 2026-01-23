import type { TownData } from '@/types/town';
import { generateValidTown } from '@/generators/townGenerator';

export { bridalFalls } from './bridalFalls';
import { bridalFalls } from './bridalFalls';

// Pre-generate towns at module load time with fixed seeds for deterministic output
const hollowCreek = generateValidTown({ seed: 'hollow-creek-001', chainLength: 5, name: 'Hollow Creek' });
const shepherdsRidge = generateValidTown({ seed: 'shepherds-ridge-001', chainLength: 6, name: "Shepherd's Ridge" });

/** All available towns: 1 hand-crafted + 2 generated */
export const ALL_TOWNS: TownData[] = [bridalFalls, hollowCreek, shepherdsRidge];

/** Look up a town by its ID */
export function getTownById(id: string): TownData | undefined {
  return ALL_TOWNS.find(t => t.id === id);
}

export { hollowCreek, shepherdsRidge };
