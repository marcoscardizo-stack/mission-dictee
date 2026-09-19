import { missions } from '../data/missions';
import { xpTrophies } from '../data/trophies';
import { useGame } from '../hooks/useGame';

export function Home() {
  const { game } = useGame();
  const nextTrophy = xpTrophies.find((t) => t.xp > game.xp);
  const prevGoal = [...xpTrophies].reverse().find((t) => t.xp <= game.xp)?.xp ?? 0;
  const pct = nextTrophy ? Math.round(((game.xp - prevGoal) / (nextTrophy.xp - prevGoal)) * 100) : 100;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-sparkles" aria-hidden>
          <span>✨</span><span>⭐</span><span>💫</span>
        </div>
        <p className="hero-kicker">Mission Dictée</p>
        <h1 className="hero-title">Deviens une championne de dictée.</h1>
        <p className="hero-sub">Joue, écoute, réfléchis, écris. Chaque défi t’aide à mémoriser les bons réflexes.</p>
        <a href="#/dictee" className="btn btn-primary btn-lg" data-testid="cta-dictee">
          Commencer une dictée <span aria-hidden>→</span>
        </a>
      </section>

      <section className="goal-card" aria-label="Prochain objectif">
        {nextTrophy ? (
          <>
            <div className="goal-head">
              <span className="goal-emoji" aria-hidden>{nextTrophy.emoji}</span>
              <div>
                <p className="goal-label">Prochain trophée</p>
                <p className="goal-name">{nextTrophy.name}</p>
              </div>
              <span className="goal-left">encore {nextTrophy.xp - game.xp} XP</span>
            </div>
            <div className="bar"><span style={{ width: `${pct}%` }} /></div>
          </>
        ) : (
          <div className="goal-head">
            <span className="goal-emoji" aria-hidden>👑</span>
            <div>
              <p className="goal-label">Bravo !</p>
              <p className="goal-name">Tu as débloqué tous les trophées d’XP.</p>
            </div>
          </div>
        )}
      </section>

      <h2 className="section-title">Choisis ta mission</h2>
      <div className="mission-grid">
        {missions.map((m) => (
          <a key={m.id} href={`#/${m.id}`} className={`mission-card tone-${m.color}`} data-testid={`mission-${m.id}`}>
            <span className="mission-emoji" aria-hidden>{m.emoji}</span>
            <span className="mission-text">
              <span className="mission-title">{m.title}</span>
              <span className="mission-tagline">{m.tagline}</span>
            </span>
            <span className="mission-arrow" aria-hidden>→</span>
          </a>
        ))}
      </div>
    </div>
  );
}
