import type { DictationLevel, QuizMissionId } from '../data/types';
import { trophies } from '../data/trophies';

export const STORAGE_KEY = 'mission-dictee:v1';
export const MAX_HEARTS = 5;
export const XP_PER_CORRECT = 10;
export const DICTATION_PASS = 80;

export interface MissionStats {
  answered: number;
  correct: number;
}

export interface GameState {
  version: 1;
  xp: number;
  streak: number;
  bestStreak: number;
  hearts: number;
  /** id du trophée → date ISO d'obtention */
  trophies: Record<string, string>;
  stats: Record<QuizMissionId, MissionStats>;
  dictation: {
    best: Record<DictationLevel, number>;
    attempts: number;
  };
}

export type GameAction =
  | { type: 'answer'; mission: QuizMissionId; correct: boolean }
  | { type: 'dictation'; level: DictationLevel; score: number }
  | { type: 'refillHearts' }
  | { type: 'reset' };

export const initialState = (): GameState => ({
  version: 1,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  hearts: MAX_HEARTS,
  trophies: {},
  stats: {
    homophones: { answered: 0, correct: 0 },
    accords: { answered: 0, correct: 0 },
    verbes: { answered: 0, correct: 0 },
  },
  dictation: { best: { facile: 0, moyen: 0, champion: 0 }, attempts: 0 },
});

const num = (v: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : fallback;

/** Reconstruit un état valide à partir de données sauvegardées (éventuellement corrompues ou anciennes). */
export function hydrate(saved: unknown): GameState {
  const base = initialState();
  if (!saved || typeof saved !== 'object') return base;
  const s = saved as Partial<GameState>;
  const stat = (k: QuizMissionId): MissionStats => ({
    answered: num(s.stats?.[k]?.answered, 0),
    correct: num(s.stats?.[k]?.correct, 0),
  });
  const best = (k: DictationLevel) => num(s.dictation?.best?.[k], 0, 0, 100);
  const tr: Record<string, string> = {};
  if (s.trophies && typeof s.trophies === 'object') {
    for (const [k, v] of Object.entries(s.trophies)) if (typeof v === 'string') tr[k] = v;
  }
  return {
    version: 1,
    xp: num(s.xp, 0),
    streak: num(s.streak, 0),
    bestStreak: num(s.bestStreak, 0),
    hearts: num(s.hearts, MAX_HEARTS, 0, MAX_HEARTS),
    trophies: tr,
    stats: { homophones: stat('homophones'), accords: stat('accords'), verbes: stat('verbes') },
    dictation: {
      best: { facile: best('facile'), moyen: best('moyen'), champion: best('champion') },
      attempts: num(s.dictation?.attempts, 0),
    },
  };
}

export function dictationXp(score: number): number {
  if (score >= 85) return 30;
  if (score >= 60) return 15;
  return 5; // on récompense toujours l'effort
}

export const bestDictation = (s: GameState) => Math.max(...Object.values(s.dictation.best));

/** Niveau de dictée atteint : plus haut niveau réussi à 80 % ou plus. */
export function levelReached(s: GameState): DictationLevel | null {
  const order: DictationLevel[] = ['champion', 'moyen', 'facile'];
  return order.find((l) => s.dictation.best[l] >= DICTATION_PASS) ?? null;
}

/** Ajoute les trophées nouvellement obtenus ; renvoie leurs identifiants. */
function awardTrophies(s: GameState): { state: GameState; unlocked: string[] } {
  const input = { xp: s.xp, bestStreak: s.bestStreak, bestDictation: bestDictation(s) };
  const unlocked = trophies.filter((t) => !s.trophies[t.id] && t.isEarned(input)).map((t) => t.id);
  if (!unlocked.length) return { state: s, unlocked };
  const now = new Date().toISOString();
  const next = { ...s.trophies };
  for (const id of unlocked) next[id] = now;
  return { state: { ...s, trophies: next }, unlocked };
}

export function applyAction(s: GameState, action: GameAction): { state: GameState; unlocked: string[] } {
  switch (action.type) {
    case 'answer': {
      const st = s.stats[action.mission];
      const stats = {
        ...s.stats,
        [action.mission]: { answered: st.answered + 1, correct: st.correct + (action.correct ? 1 : 0) },
      };
      if (action.correct) {
        const streak = s.streak + 1;
        return awardTrophies({
          ...s, stats, streak, bestStreak: Math.max(s.bestStreak, streak), xp: s.xp + XP_PER_CORRECT,
        });
      }
      return { state: { ...s, stats, streak: 0, hearts: Math.max(0, s.hearts - 1) }, unlocked: [] };
    }
    case 'dictation': {
      const score = Math.max(0, Math.min(100, Math.round(action.score)));
      const best = { ...s.dictation.best, [action.level]: Math.max(s.dictation.best[action.level], score) };
      const good = score >= DICTATION_PASS;
      const streak = good ? s.streak + 1 : s.streak;
      return awardTrophies({
        ...s,
        xp: s.xp + dictationXp(score),
        streak,
        bestStreak: Math.max(s.bestStreak, streak),
        dictation: { best, attempts: s.dictation.attempts + 1 },
      });
    }
    case 'refillHearts':
      return { state: { ...s, hearts: MAX_HEARTS }, unlocked: [] };
    case 'reset':
      return { state: initialState(), unlocked: [] };
  }
}
