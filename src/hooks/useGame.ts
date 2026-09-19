import { useContext } from 'react';
import { GameContext, type GameContextValue } from '../state/context';

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame doit être utilisé dans <GameProvider>');
  return ctx;
}
