export type QuizMissionId = 'homophones' | 'accords' | 'verbes';
export type MissionId = QuizMissionId | 'dictee';

export interface QuizQuestion {
  id: string;
  /** Petite étiquette affichée au-dessus de la question (ex. « a / à / as »). */
  tag: string;
  /** Consigne facultative (ex. « Choisis la bonne phrase. »). */
  prompt?: string;
  /** Phrase à trous : « ___ » marque l'emplacement de la réponse. */
  sentence?: string;
  choices: string[];
  answer: string;
  explanation: string;
}

export type DictationLevel = 'facile' | 'moyen' | 'champion';

export interface DictationText {
  id: string;
  level: DictationLevel;
  title: string;
  text: string;
}

export interface Trophy {
  id: string;
  emoji: string;
  name: string;
  description: string;
  /** Seuil d'XP pour les trophées d'expérience. */
  xp?: number;
  /** Condition d'obtention, évaluée à partir de l'état du jeu. */
  isEarned: (s: TrophyInput) => boolean;
}

export interface TrophyInput {
  xp: number;
  bestStreak: number;
  bestDictation: number;
}
