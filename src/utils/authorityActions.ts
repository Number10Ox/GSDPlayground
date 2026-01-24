/**
 * ActionEffect - Effect of a resolved action (trust changes, etc.)
 */
export interface ActionEffect {
  type: 'TRUST_CHANGE';
  npcId: string;
  delta: number;
}

/**
 * AuthorityActionType - The Dog's divine authority powers.
 */
export type AuthorityActionType = 'HOLD_SERVICE' | 'BLESS_SICK' | 'LAY_DOWN_LAW' | 'PRONOUNCE_JUDGMENT';

/**
 * AuthorityAction - A specific authority action the Dog can perform.
 */
export interface AuthorityAction {
  type: AuthorityActionType;
  label: string;
  description: string;
  diceCost: number;
  available: boolean;
  requirementHint?: string;
}

/**
 * JudgmentChoice - A moral choice when pronouncing judgment.
 */
export type JudgmentChoice = 'mercy' | 'penance' | 'exile' | 'punishment';

/**
 * JudgmentOutcome - Result of pronouncing judgment on a sinner.
 */
export interface JudgmentOutcome {
  choice: JudgmentChoice;
  npcId: string;
  sinId: string;
  effects: ActionEffect[];
  narrative: string;
}

/**
 * resolveHoldService - Gather townsfolk and speak with authority.
 * Raises trust broadly with all NPCs at current location.
 */
export function resolveHoldService(npcIds: string[]): ActionEffect[] {
  return npcIds.map(npcId => ({
    type: 'TRUST_CHANGE' as const,
    npcId,
    delta: 5,
  }));
}

/**
 * resolveBlessSick - Help a specific NPC, gaining significant trust.
 */
export function resolveBlessSick(npcId: string): ActionEffect[] {
  return [
    { type: 'TRUST_CHANGE', npcId, delta: 20 },
  ];
}

/**
 * resolveJudgment - Pronounce judgment on a sinner.
 * Each choice has different trust/narrative consequences.
 */
export function resolveJudgment(
  choice: JudgmentChoice,
  npcId: string,
  sinId: string,
  allNpcIds: string[]
): JudgmentOutcome {
  const effects: ActionEffect[] = [];
  let narrative = '';

  switch (choice) {
    case 'mercy':
      effects.push({ type: 'TRUST_CHANGE', npcId, delta: 30 });
      // Others may lose respect for leniency
      for (const id of allNpcIds.filter(i => i !== npcId)) {
        effects.push({ type: 'TRUST_CHANGE', npcId: id, delta: -5 });
      }
      narrative = `You show mercy. ${npcId} weeps with relief, but others mutter that justice was not served.`;
      break;

    case 'penance':
      effects.push({ type: 'TRUST_CHANGE', npcId, delta: 10 });
      for (const id of allNpcIds.filter(i => i !== npcId)) {
        effects.push({ type: 'TRUST_CHANGE', npcId: id, delta: 5 });
      }
      narrative = `You assign penance — hard, but fair. The town nods. This is the way of the faithful.`;
      break;

    case 'exile':
      effects.push({ type: 'TRUST_CHANGE', npcId, delta: -50 });
      for (const id of allNpcIds.filter(i => i !== npcId)) {
        effects.push({ type: 'TRUST_CHANGE', npcId: id, delta: 10 });
      }
      narrative = `You cast them out. The exile walks away without looking back. The town is lighter — and emptier.`;
      break;

    case 'punishment':
      effects.push({ type: 'TRUST_CHANGE', npcId, delta: -30 });
      for (const id of allNpcIds.filter(i => i !== npcId)) {
        effects.push({ type: 'TRUST_CHANGE', npcId: id, delta: -10 });
      }
      narrative = `You deliver punishment. It is harsh. Some look away. Fear replaces respect — but the sin is answered.`;
      break;
  }

  return { choice, npcId, sinId, effects, narrative };
}

/**
 * JUDGMENT_CHOICES - Display labels for judgment options.
 */
export const JUDGMENT_CHOICES: { choice: JudgmentChoice; label: string; description: string }[] = [
  { choice: 'mercy', label: 'Show Mercy', description: 'Forgive the sin. The sinner is grateful, but justice may feel hollow to others.' },
  { choice: 'penance', label: 'Assign Penance', description: 'The sinner must atone through hardship. Fair and measured — the faithful understand.' },
  { choice: 'exile', label: 'Cast Out', description: 'The sinner must leave. The town is cleansed, but a life is uprooted.' },
  { choice: 'punishment', label: 'Punish', description: 'The King\'s law is absolute. Fear ensures obedience — but at what cost?' },
];
