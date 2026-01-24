import type { ConvictionSeed } from '@/types/conviction';

/**
 * Seed convictions for character creation.
 * Players select 3 (or write custom text).
 * Each has a category for heuristic test matching and an associated stat.
 */
export const CONVICTION_SEEDS: ConvictionSeed[] = [
  // Mercy
  {
    id: 'mercy-faithful',
    text: 'The faithful deserve mercy',
    category: 'mercy',
    associatedStat: 'heart',
  },
  {
    id: 'mercy-repentance',
    text: 'All who repent deserve forgiveness',
    category: 'mercy',
    associatedStat: 'heart',
  },
  // Justice
  {
    id: 'justice-punished',
    text: 'Sin must be punished openly',
    category: 'justice',
    associatedStat: 'will',
  },
  {
    id: 'justice-authority',
    text: 'Authority must be earned, not claimed',
    category: 'justice',
    associatedStat: 'will',
  },
  // Faith
  {
    id: 'faith-doctrine',
    text: 'Doctrine stands above personal feeling',
    category: 'faith',
    associatedStat: 'will',
  },
  {
    id: 'faith-king',
    text: 'The King of Life speaks through the faithful',
    category: 'faith',
    associatedStat: 'will',
  },
  // Community
  {
    id: 'community-family',
    text: 'Family bonds are sacred',
    category: 'community',
    associatedStat: 'heart',
  },
  {
    id: 'community-together',
    text: 'A town stands or falls together',
    category: 'community',
    associatedStat: 'heart',
  },
  // Duty
  {
    id: 'duty-protect',
    text: 'The strong must protect the weak',
    category: 'duty',
    associatedStat: 'body',
  },
  {
    id: 'duty-order',
    text: 'Order has a price, and someone must pay it',
    category: 'duty',
    associatedStat: 'acuity',
  },
  // Truth
  {
    id: 'truth-free',
    text: 'The truth will set the faithful free',
    category: 'truth',
    associatedStat: 'acuity',
  },
  {
    id: 'truth-violence',
    text: 'Violence is the last refuge of the faithless',
    category: 'truth',
    associatedStat: 'body',
  },
];
