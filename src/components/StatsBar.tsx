import { useEffect, useRef, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { MAX_HEARTS } from '../state/gameLogic';

/** Petite animation quand une valeur augmente. */
function useBump(value: number) {
  const prev = useRef(value);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (value > prev.current) setBump((b) => b + 1);
    prev.current = value;
  }, [value]);
  return bump;
}

export function StatsBar() {
  const { game } = useGame();
  const xpBump = useBump(game.xp);
  const streakBump = useBump(game.streak);

  return (
    <div className="stats">
      <a href="#/" className="brand" aria-label="Mission Dictée — accueil">
        <span className="brand-mark" aria-hidden>✍️</span>
        <span className="brand-name">Mission Dictée</span>
      </a>
      <div className="stats-pills" role="group" aria-label="Ta progression">
        <span className="pill pill-xp" key={`xp${xpBump}`} data-bump={xpBump > 0} data-testid="xp" title="Points d’expérience">
          ⭐ <b>{game.xp}</b> <small>XP</small>
        </span>
        <span className="pill pill-streak" key={`st${streakBump}`} data-bump={streakBump > 0} data-testid="streak" title="Série de bonnes réponses">
          🔥 <b>{game.streak}</b>
        </span>
        <span className="pill pill-hearts" data-testid="hearts" title={`Cœurs (${game.hearts} sur ${MAX_HEARTS})`}>
          💖 <b>{game.hearts}</b>
        </span>
        <a href="#/parametres" className="pill pill-icon" aria-label="Paramètres" data-testid="settings-link">
          ⚙️
        </a>
      </div>
    </div>
  );
}
