import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { GameContext } from './context';
import { applyAction, hydrate, STORAGE_KEY, type GameAction, type GameState } from './gameLogic';
import { loadJSON, removeKey, saveJSON } from '../utils/storage';

interface Store {
  game: GameState;
  /** Trophées obtenus à célébrer (file d'attente, non sauvegardée). */
  celebrate: string[];
}

type StoreAction = GameAction | { type: 'dismissCelebration' };

function reducer(store: Store, action: StoreAction): Store {
  if (action.type === 'dismissCelebration') return { ...store, celebrate: store.celebrate.slice(1) };
  const { state, unlocked } = applyAction(store.game, action);
  return { game: state, celebrate: action.type === 'reset' ? [] : [...store.celebrate, ...unlocked] };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [store, rawDispatch] = useReducer(reducer, undefined, () => ({
    game: hydrate(loadJSON(STORAGE_KEY)),
    celebrate: [],
  }));

  // Sauvegarde automatique à chaque changement.
  useEffect(() => {
    saveJSON(STORAGE_KEY, store.game);
  }, [store.game]);

  const dispatch = useCallback((a: GameAction) => rawDispatch(a), []);
  const dismissCelebration = useCallback(() => rawDispatch({ type: 'dismissCelebration' }), []);
  const resetProgress = useCallback(() => {
    removeKey(STORAGE_KEY);
    rawDispatch({ type: 'reset' });
  }, []);

  const value = useMemo(
    () => ({ game: store.game, celebrate: store.celebrate, dispatch, dismissCelebration, resetProgress }),
    [store, dispatch, dismissCelebration, resetProgress],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
