import { createContext } from 'react';
import type { GameAction, GameState } from './gameLogic';

export interface GameContextValue {
  game: GameState;
  /** Trophées obtenus à célébrer (file d'attente, non sauvegardée). */
  celebrate: string[];
  dispatch: (action: GameAction) => void;
  dismissCelebration: () => void;
  resetProgress: () => void;
}

export const GameContext = createContext<GameContextValue | null>(null);
