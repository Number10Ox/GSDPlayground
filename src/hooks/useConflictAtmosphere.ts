import { useEffect } from 'react';
import type { EscalationLevel } from '@/types/conflict';
import { ESCALATION_ORDER } from '@/types/conflict';

// Color palettes for each escalation level
// Index matches ESCALATION_ORDER value
const ESCALATION_COLORS: { bg: string; accent: string }[] = [
  // 0: JUST_TALKING - subtle blue-gray (calm conversation)
  { bg: 'rgba(71, 85, 105, 0.1)', accent: 'rgba(148, 163, 184, 0.8)' },
  // 1: PHYSICAL - warm amber tint (tension rising)
  { bg: 'rgba(180, 83, 9, 0.15)', accent: 'rgba(251, 191, 36, 0.9)' },
  // 2: FIGHTING - deep red tint (violence)
  { bg: 'rgba(153, 27, 27, 0.2)', accent: 'rgba(239, 68, 68, 0.9)' },
  // 3: GUNPLAY - dark crimson (deadly)
  { bg: 'rgba(127, 29, 29, 0.25)', accent: 'rgba(185, 28, 28, 1)' },
];

// Default colors when no conflict active
const DEFAULT_COLORS = { bg: 'transparent', accent: 'rgba(148, 163, 184, 0.5)' };

/**
 * Hook to manage CSS variables for conflict escalation theming.
 * Updates document.body CSS variables based on current escalation level.
 *
 * @param escalationLevel - Current escalation level, or null if no active conflict
 */
export function useConflictAtmosphere(escalationLevel: EscalationLevel | null): void {
  useEffect(() => {
    const colors =
      escalationLevel !== null
        ? ESCALATION_COLORS[ESCALATION_ORDER[escalationLevel]]
        : DEFAULT_COLORS;

    // Set CSS custom properties on body for global theming
    document.body.style.setProperty('--conflict-bg', colors.bg);
    document.body.style.setProperty('--conflict-accent', colors.accent);

    // Cleanup: reset to defaults on unmount
    return () => {
      document.body.style.setProperty('--conflict-bg', DEFAULT_COLORS.bg);
      document.body.style.setProperty('--conflict-accent', DEFAULT_COLORS.accent);
    };
  }, [escalationLevel]);
}
