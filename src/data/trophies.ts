import type { Trophy } from './types';

export const trophies: Trophy[] = [
  { id: 'first', emoji: '🌱', name: 'Première victoire', description: 'Gagne 10 XP', xp: 10, isEarned: (s) => s.xp >= 10 },
  { id: 'fire', emoji: '🔥', name: 'Série en feu', description: 'Gagne 50 XP', xp: 50, isEarned: (s) => s.xp >= 50 },
  { id: 'detective', emoji: '🧩', name: 'Détective', description: 'Gagne 100 XP', xp: 100, isEarned: (s) => s.xp >= 100 },
  { id: 'accords', emoji: '🎀', name: 'Maîtresse des accords', description: 'Gagne 200 XP', xp: 200, isEarned: (s) => s.xp >= 200 },
  { id: 'eclair', emoji: '⚡', name: 'Éclair du français', description: 'Gagne 300 XP', xp: 300, isEarned: (s) => s.xp >= 300 },
  { id: 'champion', emoji: '👑', name: 'Championne', description: 'Gagne 500 XP', xp: 500, isEarned: (s) => s.xp >= 500 },
  { id: 'streak10', emoji: '💫', name: 'Inarrêtable', description: '10 bonnes réponses d’affilée', isEarned: (s) => s.bestStreak >= 10 },
  { id: 'plume', emoji: '🪶', name: 'Plume d’or', description: 'Une dictée à 95 % ou plus', isEarned: (s) => s.bestDictation >= 95 },
];

export const xpTrophies = trophies.filter((t): t is Trophy & { xp: number } => typeof t.xp === 'number');
