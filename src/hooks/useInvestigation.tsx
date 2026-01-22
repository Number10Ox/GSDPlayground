import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { investigationReducer, initialInvestigationState } from '@/reducers/investigationReducer';
import type { InvestigationState, InvestigationAction } from '@/types/investigation';

interface InvestigationContextValue {
  state: InvestigationState;
  dispatch: Dispatch<InvestigationAction>;
}

const InvestigationContext = createContext<InvestigationContextValue | null>(null);

export function InvestigationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(investigationReducer, initialInvestigationState);
  return (
    <InvestigationContext.Provider value={{ state, dispatch }}>
      {children}
    </InvestigationContext.Provider>
  );
}

export function useInvestigation() {
  const context = useContext(InvestigationContext);
  if (!context) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return context;
}
