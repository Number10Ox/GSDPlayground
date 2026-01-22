import { useState, useCallback } from 'react';
import { Lightbulb, Hand, Heart, Cross } from 'lucide-react';
import { useCharacter } from '@/hooks/useCharacter';
import { createCharacter, BACKGROUND_DICE } from '@/types/character';
import type { Background, StatName } from '@/types/character';

type CreationStep = 'name' | 'background' | 'allocate' | 'confirm';

const STAT_ICONS: Record<StatName, typeof Lightbulb> = {
  acuity: Lightbulb,
  body: Hand,
  heart: Heart,
  will: Cross,
};

const STAT_LABELS: Record<StatName, string> = {
  acuity: 'Acuity',
  body: 'Body',
  heart: 'Heart',
  will: 'Will',
};

interface BackgroundInfo {
  id: Background;
  title: string;
  description: string;
  statDice: number;
  traitSummary: string;
  relationshipSummary: string;
}

const BACKGROUNDS: BackgroundInfo[] = [
  {
    id: 'complicated-history',
    title: 'Complicated History',
    description: 'You carry the weight of a troubled past. More trait dice, including a powerful d10.',
    statDice: 13,
    traitSummary: '5d6 + 3d4 + 1d10',
    relationshipSummary: '4d6',
  },
  {
    id: 'strong-community',
    title: 'Strong Community',
    description: 'Your bonds with your community run deep. More relationship dice and a d8.',
    statDice: 15,
    traitSummary: '3d6 + 2d4',
    relationshipSummary: '1d8 + 5d6',
  },
  {
    id: 'well-rounded',
    title: 'Well-Rounded',
    description: 'Balanced and capable. More stat dice to distribute across your abilities.',
    statDice: 17,
    traitSummary: '2d6 + 2d4',
    relationshipSummary: '3d6 + 1d4',
  },
];

const MIN_PER_STAT = 2;
const MAX_PER_STAT = 6;

/**
 * CharacterCreation - Point-buy allocation UI for creating a new Dog character.
 *
 * Steps:
 * 1. Name input (min 2 chars)
 * 2. Background selection (3 cards with descriptions)
 * 3. Stat allocation (distribute d6s with min/max constraints)
 * 4. Confirm and create
 */
export function CharacterCreation({ onComplete }: { onComplete?: () => void }) {
  const { dispatch } = useCharacter();

  const [step, setStep] = useState<CreationStep>('name');
  const [name, setName] = useState('');
  const [background, setBackground] = useState<Background | null>(null);
  const [allocation, setAllocation] = useState<Record<StatName, number>>({
    acuity: MIN_PER_STAT,
    body: MIN_PER_STAT,
    heart: MIN_PER_STAT,
    will: MIN_PER_STAT,
  });

  // Total available dice for the selected background
  const totalDice = background ? BACKGROUND_DICE[background].statDice : 0;
  const allocated = allocation.acuity + allocation.body + allocation.heart + allocation.will;
  const remaining = totalDice - allocated;

  const handleNameNext = useCallback(() => {
    if (name.trim().length >= 2) {
      setStep('background');
    }
  }, [name]);

  const handleBackgroundSelect = useCallback((bg: Background) => {
    setBackground(bg);
    // Reset allocation to minimums when changing background
    setAllocation({
      acuity: MIN_PER_STAT,
      body: MIN_PER_STAT,
      heart: MIN_PER_STAT,
      will: MIN_PER_STAT,
    });
    setStep('allocate');
  }, []);

  const handleStatChange = useCallback((stat: StatName, delta: number) => {
    setAllocation((prev) => {
      const newValue = prev[stat] + delta;
      if (newValue < MIN_PER_STAT || newValue > MAX_PER_STAT) return prev;
      return { ...prev, [stat]: newValue };
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (!background || remaining !== 0) return;

    const character = createCharacter(name.trim(), background, allocation);
    dispatch({ type: 'SET_CHARACTER', character });
    onComplete?.();
  }, [name, background, allocation, remaining, dispatch, onComplete]);

  const statOrder: StatName[] = ['acuity', 'body', 'heart', 'will'];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-100 mb-6 text-center">Create Your Dog</h2>

        {/* Step 1: Name */}
        {step === 'name' && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-300 text-sm font-medium">Name your Dog</span>
              <input
                data-testid="creation-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameNext()}
                placeholder="Brother Ezekiel..."
                className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
            </label>
            <button
              onClick={handleNameNext}
              disabled={name.trim().length < 2}
              className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                name.trim().length >= 2
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Background */}
        {step === 'background' && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm text-center mb-4">
              Choose your Dog's background. This determines your starting dice.
            </p>
            <div className="space-y-3">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  data-testid={`creation-background-${bg.id}`}
                  onClick={() => handleBackgroundSelect(bg.id)}
                  className="w-full text-left bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-amber-500 rounded-lg p-4 transition-colors"
                >
                  <div className="font-semibold text-gray-100">{bg.title}</div>
                  <p className="text-gray-400 text-sm mt-1">{bg.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Stats: {bg.statDice}d6</span>
                    <span>Traits: {bg.traitSummary}</span>
                    <span>Relationships: {bg.relationshipSummary}</span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep('name')}
              className="w-full py-2 text-gray-400 hover:text-gray-200 text-sm transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Stat Allocation */}
        {step === 'allocate' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Distribute d6 dice across your stats.
              </p>
              <p className={`text-lg font-bold mt-2 ${remaining === 0 ? 'text-green-400' : 'text-amber-400'}`}>
                {remaining} dice remaining
              </p>
            </div>

            <div className="space-y-3">
              {statOrder.map((statName) => {
                const Icon = STAT_ICONS[statName];
                const value = allocation[statName];
                const canIncrease = remaining > 0 && value < MAX_PER_STAT;
                const canDecrease = value > MIN_PER_STAT;

                return (
                  <div key={statName} className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-200 text-sm w-16">{STAT_LABELS[statName]}</span>

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        data-testid={`creation-stat-${statName}-minus`}
                        onClick={() => handleStatChange(statName, -1)}
                        disabled={!canDecrease}
                        className={`w-7 h-7 rounded flex items-center justify-center font-bold text-lg transition-colors ${
                          canDecrease
                            ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        -
                      </button>

                      <span className="text-gray-100 font-bold text-lg w-6 text-center">
                        {value}
                      </span>

                      <button
                        data-testid={`creation-stat-${statName}-plus`}
                        onClick={() => handleStatChange(statName, 1)}
                        disabled={!canIncrease}
                        className={`w-7 h-7 rounded flex items-center justify-center font-bold text-lg transition-colors ${
                          canIncrease
                            ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        +
                      </button>
                    </div>

                    <span className="text-gray-500 text-xs w-8">{value}d6</span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep('background')}
                className="flex-1 py-2 text-gray-400 hover:text-gray-200 text-sm transition-colors border border-gray-700 rounded-lg"
              >
                Back
              </button>
              <button
                data-testid="creation-confirm"
                onClick={handleConfirm}
                disabled={remaining !== 0}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  remaining === 0
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
