/**
 * DescentClock - Per-town urgency tracker.
 * Ticks from timed actions, conflict outcomes (Give, escalation, fallout).
 * At max (8/8): sin escalates, clock resets.
 */
export interface DescentClock {
  segments: 8;
  filled: number;
  thresholds: DescentThreshold[];
}

/**
 * DescentThreshold - When descent reaches a certain level, fire an event.
 */
export interface DescentThreshold {
  at: number;
  eventId: string;
  fired: boolean;
}
