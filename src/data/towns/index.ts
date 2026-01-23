import type { TownData } from '@/types/town';
import { generateValidTown } from '@/generators/townGenerator';

export { bridalFalls } from './bridalFalls';
import { bridalFalls } from './bridalFalls';

/**
 * Safely generate a town, falling back to a shorter chain length if needed.
 * Prevents the app from crashing if generation fails for longer chains.
 */
function safeGenerateValidTown(config: { seed: string; chainLength: number; name: string }): TownData {
  try {
    return generateValidTown(config);
  } catch {
    // If the requested chain length fails, try with a shorter chain
    console.warn(`[towns] Generation failed for "${config.name}" with chainLength ${config.chainLength}, retrying with chainLength ${config.chainLength - 1}`);
    try {
      return generateValidTown({ ...config, chainLength: config.chainLength - 1 });
    } catch {
      // Final fallback: use minimum chain length (3)
      console.warn(`[towns] Generation failed again for "${config.name}", using chainLength 3`);
      return generateValidTown({ ...config, chainLength: 3 });
    }
  }
}

// Pre-generate towns at module load time with fixed seeds for deterministic output
const hollowCreek = safeGenerateValidTown({ seed: 'hollow-creek-001', chainLength: 5, name: 'Hollow Creek' });
const shepherdsRidge = safeGenerateValidTown({ seed: 'shepherds-ridge-001', chainLength: 5, name: "Shepherd's Ridge" });

/** All available towns: 1 hand-crafted + 2 generated */
export const ALL_TOWNS: TownData[] = [bridalFalls, hollowCreek, shepherdsRidge];

/** Look up a town by its ID */
export function getTownById(id: string): TownData | undefined {
  return ALL_TOWNS.find(t => t.id === id);
}

export { hollowCreek, shepherdsRidge };
