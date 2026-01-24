import { useState, useCallback, useMemo } from 'react';
import { Lightbulb, Hand, Heart, Cross } from 'lucide-react';
import { useCharacter } from '@/hooks/useCharacter';
import { useJourney } from '@/hooks/useJourney';
import { createCharacter, BACKGROUND_DICE, STAT_POINT_TO_DIE_TYPE } from '@/types/character';
import type { Background, StatName, Item, Trait } from '@/types/character';
import type { Conviction, ConvictionSeed } from '@/types/conviction';
import { drawBelongings, type BelongingTemplate } from '@/data/belongingsTable';
import { INITIATION_SCENES, type InitiationScene, type InitiationApproach } from '@/data/initiationScenes';
import { ConvictionPicker } from '@/components/Conviction/ConvictionPicker';

type CreationStep = 'name' | 'background' | 'allocate' | 'belongings' | 'initiation' | 'convictions';

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
    statDice: 8,
    traitSummary: '5d6 + 3d4 + 1d10',
    relationshipSummary: '4d6',
  },
  {
    id: 'strong-community',
    title: 'Strong Community',
    description: 'Your bonds with your community run deep. More relationship dice and a d8.',
    statDice: 9,
    traitSummary: '3d6 + 2d4',
    relationshipSummary: '1d8 + 5d6',
  },
  {
    id: 'well-rounded',
    title: 'Well-Rounded',
    description: 'Balanced and capable. More stat points to upgrade your abilities.',
    statDice: 10,
    traitSummary: '2d6 + 2d4',
    relationshipSummary: '3d6 + 1d4',
  },
];

const MIN_PER_STAT = 1;
const MAX_PER_STAT = 4;

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
  const { dispatch: journeyDispatch } = useJourney();

  const [step, setStep] = useState<CreationStep>('name');
  const [name, setName] = useState('');
  const [background, setBackground] = useState<Background | null>(null);
  const [allocation, setAllocation] = useState<Record<StatName, number>>({
    acuity: MIN_PER_STAT,
    body: MIN_PER_STAT,
    heart: MIN_PER_STAT,
    will: MIN_PER_STAT,
  });

  // Belongings state
  const [drawnBelongings, setDrawnBelongings] = useState<BelongingTemplate[]>([]);
  const [selectedBelongingIds, setSelectedBelongingIds] = useState<Set<string>>(new Set());

  // Initiation state
  const [initiationScene, setInitiationScene] = useState<InitiationScene | null>(null);
  const [chosenApproach, setChosenApproach] = useState<InitiationApproach | null>(null);

  // Total available stat points for the selected background
  const totalDice = background ? BACKGROUND_DICE[background].statPoints : 0;
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

  // Convert selected belongings to Item objects
  const selectedItems: Item[] = useMemo(() => {
    return drawnBelongings
      .filter(b => selectedBelongingIds.has(b.id))
      .map(b => ({
        id: crypto.randomUUID(),
        name: b.name,
        category: b.category,
        dice: b.dice.map(d => ({ id: crypto.randomUUID(), type: d })),
        isGun: b.isGun,
      }));
  }, [drawnBelongings, selectedBelongingIds]);

  // Convert chosen approach to Trait
  const initiationTrait: Trait | null = useMemo(() => {
    if (!chosenApproach) return null;
    return {
      id: crypto.randomUUID(),
      name: chosenApproach.traitName,
      dice: chosenApproach.traitDice.map(d => ({ id: crypto.randomUUID(), type: d })),
      source: 'creation' as const,
      description: chosenApproach.traitDescription,
    };
  }, [chosenApproach]);

  const handleProceedToConvictions = useCallback(() => {
    if (!chosenApproach) return;
    setStep('convictions');
  }, [chosenApproach]);

  const handleConfirm = useCallback((convictionSelections: { seed: ConvictionSeed; editedText: string }[]) => {
    if (!background || remaining !== 0) return;
    if (selectedBelongingIds.size !== 2) return;
    if (!initiationTrait) return;

    const character = createCharacter(name.trim(), background, allocation);
    // Add unusual belongings to inventory
    character.inventory.push(...selectedItems);
    // Add initiation trait
    character.traits.push(initiationTrait);
    dispatch({ type: 'SET_CHARACTER', character });

    // Create convictions from selections
    const convictions: Conviction[] = convictionSelections.map(({ seed, editedText }) => ({
      id: crypto.randomUUID(),
      text: editedText,
      originalText: editedText,
      strength: 'steady' as const,
      lifecycle: 'held' as const,
      associatedStat: seed.associatedStat,
      category: seed.category,
      doubtCount: 0,
      reinforceCount: 0,
      history: [],
    }));

    journeyDispatch({ type: 'SET_CHARACTER', character });
    journeyDispatch({ type: 'SET_CONVICTIONS', convictions });

    onComplete?.();
  }, [name, background, allocation, remaining, selectedBelongingIds, selectedItems, initiationTrait, dispatch, journeyDispatch, onComplete]);

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
                    <span>Stats: {bg.statDice} pts (8 dice)</span>
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
                Distribute points across your stats. Higher points = better dice.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                1 = 2d4 &middot; 2 = 2d6 &middot; 3 = 2d8 &middot; 4 = 2d10
              </p>
              <p className={`text-lg font-bold mt-2 ${remaining === 0 ? 'text-green-400' : 'text-amber-400'}`}>
                {remaining} points remaining
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

                    <span className="text-gray-500 text-xs w-10">2{STAT_POINT_TO_DIE_TYPE[value] || 'd6'}</span>
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
                data-testid="creation-allocate-next"
                onClick={() => {
                  if (remaining === 0) {
                    const drawn = drawBelongings(4);
                    setDrawnBelongings(drawn);
                    setSelectedBelongingIds(new Set());
                    setStep('belongings');
                  }
                }}
                disabled={remaining !== 0}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  remaining === 0
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        {/* Step 4: Belongings Selection */}
        {step === 'belongings' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-300 text-sm font-medium">Unusual Belongings</p>
              <p className="text-gray-500 text-xs mt-1">
                Every Dog carries strange things. Pick 2 from what fate has dealt you.
              </p>
              <p className={`text-sm font-bold mt-2 ${selectedBelongingIds.size === 2 ? 'text-green-400' : 'text-amber-400'}`}>
                {2 - selectedBelongingIds.size} remaining
              </p>
            </div>

            <div className="space-y-2">
              {drawnBelongings.map((belonging) => {
                const isSelected = selectedBelongingIds.has(belonging.id);
                const canSelect = selectedBelongingIds.size < 2 || isSelected;

                return (
                  <button
                    key={belonging.id}
                    data-testid={`creation-belonging-${belonging.id}`}
                    onClick={() => {
                      setSelectedBelongingIds(prev => {
                        const next = new Set(prev);
                        if (next.has(belonging.id)) {
                          next.delete(belonging.id);
                        } else if (next.size < 2) {
                          next.add(belonging.id);
                        }
                        return next;
                      });
                    }}
                    disabled={!canSelect}
                    className={`w-full text-left rounded-lg p-3 transition-colors border ${
                      isSelected
                        ? 'bg-amber-900/30 border-amber-500 text-gray-100'
                        : canSelect
                          ? 'bg-gray-800 border-gray-600 hover:border-amber-500 text-gray-300'
                          : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{belonging.name}</span>
                      <span className="text-xs text-gray-500">
                        {belonging.dice.join('+')} · {belonging.category}
                        {belonging.isGun && ' · gun'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{belonging.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep('allocate')}
                className="flex-1 py-2 text-gray-400 hover:text-gray-200 text-sm transition-colors border border-gray-700 rounded-lg"
              >
                Back
              </button>
              <button
                data-testid="creation-belongings-next"
                onClick={() => {
                  if (selectedBelongingIds.size === 2) {
                    // Pick a random initiation scene
                    const scene = INITIATION_SCENES[Math.floor(Math.random() * INITIATION_SCENES.length)];
                    setInitiationScene(scene);
                    setChosenApproach(null);
                    setStep('initiation');
                  }
                }}
                disabled={selectedBelongingIds.size !== 2}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  selectedBelongingIds.size === 2
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Initiation Scene */}
        {step === 'initiation' && initiationScene && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-300 text-sm font-medium">Initiation</p>
              <p className="text-gray-500 text-xs mt-1">
                Before you ride, you must prove yourself. What happened at your initiation?
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <p className="text-gray-200 text-sm italic">{initiationScene.scenario}</p>
            </div>

            <div className="space-y-2">
              {initiationScene.approaches.map((approach) => {
                const isChosen = chosenApproach?.id === approach.id;

                return (
                  <button
                    key={approach.id}
                    data-testid={`creation-approach-${approach.id}`}
                    onClick={() => setChosenApproach(approach)}
                    className={`w-full text-left rounded-lg p-3 transition-colors border ${
                      isChosen
                        ? 'bg-amber-900/30 border-amber-500'
                        : 'bg-gray-800 border-gray-600 hover:border-amber-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-100">{approach.label}</span>
                      <span className="text-xs text-gray-500">
                        +{approach.traitName} ({approach.traitDice.join('+')})
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{approach.description}</p>
                  </button>
                );
              })}
            </div>

            {chosenApproach && (
              <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3">
                <p className="text-xs text-green-300 italic">{chosenApproach.resolution}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep('belongings')}
                className="flex-1 py-2 text-gray-400 hover:text-gray-200 text-sm transition-colors border border-gray-700 rounded-lg"
              >
                Back
              </button>
              <button
                data-testid="creation-to-convictions"
                onClick={handleProceedToConvictions}
                disabled={!chosenApproach}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  chosenApproach
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        {/* Step 6: Convictions */}
        {step === 'convictions' && (
          <ConvictionPicker
            onConfirm={handleConfirm}
            onBack={() => setStep('initiation')}
          />
        )}
      </div>
    </div>
  );
}
