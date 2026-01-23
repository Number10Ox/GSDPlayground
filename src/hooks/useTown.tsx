import { createContext, useContext, type ReactNode } from 'react';
import type { TownData } from '@/types/town';

const TownContext = createContext<TownData | null>(null);

interface TownProviderProps {
  town: TownData;
  children: ReactNode;
}

/**
 * TownProvider - Makes the active town data available to all descendants.
 * The town is passed as a prop so the parent can control which town is active.
 */
export function TownProvider({ town, children }: TownProviderProps) {
  return (
    <TownContext.Provider value={town}>
      {children}
    </TownContext.Provider>
  );
}

/**
 * useTown - Access the current town's data.
 */
export function useTown(): TownData {
  const town = useContext(TownContext);
  if (!town) {
    throw new Error('useTown must be used within a TownProvider');
  }
  return town;
}
