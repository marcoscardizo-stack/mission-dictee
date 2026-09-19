import { trophies } from '../data/trophies';
import { LEVELS } from '../data/dictees';
import { useGame } from '../hooks/useGame';
import { bestDictation, levelReached } from '../state/gameLogic';

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' });

export function Trophies() {
  const { game } = useGame();
  const earnedCount = trophies.filter((t) => game.trophies[t.id]).length;
  const level = levelReached(game);
  const levelMeta = LEVELS.find((l) => l.id === level);

  const progress = (id: string, xp?: number): { pct: number; hint: string } => {
    if (xp) return { pct: Math.min(100, (game.xp / xp) * 100), hint: `encore ${Math.max(0, xp - game.xp)} XP` };
    if (id === 'streak10') return { pct: Math.min(100, game.bestStreak * 10), hint: `record : ${game.bestStreak} / 10` };
    if (id === 'plume') {
      const b = bestDictation(game);
      return { pct: Math.min(100, (b / 95) * 100), hint: `meilleure dictée : ${b} %` };
    }
    return { pct: 0, hint: '' };
  };

  return (
    <div className="trophies">
      <header className="page-header">
        <span className="page-emoji" aria-hidden>🏆</span>
        <div>
          <h1>Mes trophées</h1>
          <p><b data-testid="trophy-count">{earnedCount}</b> / {trophies.length} débloqués</p>
        </div>
      </header>

      <div className="summary-row">
        <div className="summary"><span>⭐</span><b>{game.xp}</b><small>XP</small></div>
        <div className="summary"><span>🔥</span><b>{game.bestStreak}</b><small>record</small></div>
        <div className="summary">
          <span>{levelMeta?.emoji ?? '🎧'}</span><b>{levelMeta?.label ?? '—'}</b><small>dictée</small>
        </div>
      </div>

      <div className="trophy-grid">
        {trophies.map((t) => {
          const earnedAt = game.trophies[t.id];
          const p = progress(t.id, t.xp);
          return (
            <article
              key={t.id}
              className={`trophy${earnedAt ? ' is-earned' : ' is-locked'}`}
              data-testid={`trophy-${t.id}`}
              data-earned={earnedAt ? 'true' : 'false'}
            >
              <div className="trophy-medal" aria-hidden>
                <span className="trophy-emoji">{t.emoji}</span>
                {!earnedAt && <span className="trophy-lock">🔒</span>}
              </div>
              <h2 className="trophy-name">{t.name}</h2>
              <p className="trophy-desc">{t.description}</p>
              {earnedAt ? (
                <p className="trophy-date">Obtenu le {dateFmt.format(new Date(earnedAt))}</p>
              ) : (
                <>
                  <div className="bar bar-sm"><span style={{ width: `${p.pct}%` }} /></div>
                  <p className="trophy-hint">{p.hint}</p>
                </>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
