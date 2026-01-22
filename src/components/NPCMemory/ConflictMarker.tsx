import { useMemo } from 'react';
import { useNPCMemory } from '@/hooks/useNPCMemory';

interface ConflictMarkerProps {
  npcId: string;
  size?: 'sm' | 'md';
}

/**
 * Icon sizes in pixels
 */
const SIZES = {
  sm: 16,
  md: 24,
};

/**
 * ConflictMarker - Icon overlay showing NPC's violence history at a glance.
 *
 * Displays different icons based on severity:
 * - No conflict history: no marker (returns null)
 * - Witnessed violence (not gunplay): Crossed fists (amber)
 * - Witnessed gunplay: Crossed guns (red)
 * - Was targeted: Broken trust (dark red)
 */
export function ConflictMarker({ npcId, size = 'md' }: ConflictMarkerProps) {
  const { getMemoryForNPC, getHighestEscalationWitnessed } = useNPCMemory();

  const markerInfo = useMemo(() => {
    const memory = getMemoryForNPC(npcId);
    if (!memory || memory.events.length === 0) {
      return null;
    }

    // Check if NPC was directly targeted
    const wasTargeted = memory.events.some(
      (event) => event.type === 'TARGETED_BY_VIOLENCE'
    );

    if (wasTargeted) {
      return {
        type: 'targeted' as const,
        icon: 'broken-trust',
        color: 'text-red-900',
        bgColor: 'bg-red-200',
        tooltip: 'Was targeted by violence',
      };
    }

    // Check highest escalation witnessed
    const highestEscalation = getHighestEscalationWitnessed(npcId);

    if (highestEscalation === 'GUNPLAY') {
      return {
        type: 'gunplay' as const,
        icon: 'crossed-guns',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        tooltip: 'Witnessed gunplay',
      };
    }

    if (
      highestEscalation === 'FIGHTING' ||
      highestEscalation === 'PHYSICAL'
    ) {
      return {
        type: 'violence' as const,
        icon: 'crossed-fists',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        tooltip: 'Witnessed violence',
      };
    }

    // JUST_TALKING only - no marker
    return null;
  }, [npcId, getMemoryForNPC, getHighestEscalationWitnessed]);

  if (!markerInfo) {
    return null;
  }

  const iconSize = SIZES[size];

  return (
    <div
      data-testid={`conflict-marker-${npcId}`}
      className={`
        absolute -top-1 -right-1 rounded-full p-0.5
        ${markerInfo.bgColor}
        shadow-sm
      `}
      title={markerInfo.tooltip}
    >
      {markerInfo.icon === 'broken-trust' && (
        <BrokenTrustIcon size={iconSize} className={markerInfo.color} />
      )}
      {markerInfo.icon === 'crossed-guns' && (
        <CrossedGunsIcon size={iconSize} className={markerInfo.color} />
      )}
      {markerInfo.icon === 'crossed-fists' && (
        <CrossedFistsIcon size={iconSize} className={markerInfo.color} />
      )}
    </div>
  );
}

/**
 * Crossed fists icon - for physical violence
 */
function CrossedFistsIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Left fist */}
      <path
        d="M4 14L10 8M6 16L12 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Right fist */}
      <path
        d="M20 14L14 8M18 16L12 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Fist shapes */}
      <circle cx="6" cy="18" r="2" fill="currentColor" />
      <circle cx="18" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}

/**
 * Crossed guns icon - for gunplay
 */
function CrossedGunsIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Left gun */}
      <path
        d="M3 18L12 9M3 18H6M3 18V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right gun */}
      <path
        d="M21 18L12 9M21 18H18M21 18V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center cross point */}
      <circle cx="12" cy="9" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Broken trust icon - for being directly targeted
 */
function BrokenTrustIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Broken heart/shield shape */}
      <path
        d="M12 21L4 13C2 11 2 8 4 6C6 4 9 4 11 6L12 7L13 6C15 4 18 4 20 6C22 8 22 11 20 13L12 21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Break line */}
      <path
        d="M12 7L11 11L13 13L11 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
