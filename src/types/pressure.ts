/**
 * PressureClock - Per-town urgency tracker.
 * Ticks from timed actions, conflict outcomes (Give, escalation, fallout).
 * At max (8/8): sin escalates, clock resets.
 */
export interface PressureClock {
  segments: 8;
  filled: number;
  thresholds: PressureThreshold[];
}

/**
 * PressureThreshold - When pressure reaches a certain level, fire an event.
 */
export interface PressureThreshold {
  at: number;
  eventId: string;
  fired: boolean;
}
