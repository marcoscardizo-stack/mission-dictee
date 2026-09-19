import { useEffect, useRef } from 'react';
import { trophies } from '../data/trophies';
import { useGame } from '../hooks/useGame';

const COLORS = ['#8b5cf6', '#ff6fb1', '#7cc8ff', '#4fd1a5', '#ffd45c'];

/** Pseudo-aléatoire déterministe (suite de Weyl) : confettis bien répartis, rendu stable. */
const frac = (n: number) => n - Math.floor(n);
const PIECES = Array.from({ length: 36 }, (_, i) => ({
  left: frac(i * 0.618034) * 100,
  delay: frac(i * 0.414214) * 0.4,
  duration: 1.4 + frac(i * 0.732051) * 1.2,
  rotate: frac(i * 0.236068) * 360,
  color: COLORS[i % COLORS.length],
  round: i % 3 === 0,
}));

function Confetti() {
  const pieces = PIECES;
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <i
          key={i}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
            borderRadius: p.round ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

/** Fenêtre de félicitations quand un trophée est débloqué. */
export function TrophyCelebration() {
  const { celebrate, dismissCelebration } = useGame();
  const trophy = trophies.find((t) => t.id === celebrate[0]);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (trophy) btnRef.current?.focus({ preventScroll: true });
  }, [trophy]);

  if (!trophy) return null;
  return (
    <div className="celebration" role="dialog" aria-modal="true" aria-labelledby="celebration-title" data-testid="celebration">
      <Confetti />
      <div className="celebration-card" key={trophy.id}>
        <p className="celebration-kicker">Nouveau trophée !</p>
        <div className="celebration-medal" aria-hidden>{trophy.emoji}</div>
        <h2 id="celebration-title">{trophy.name}</h2>
        <p className="celebration-desc">{trophy.description}</p>
        <button ref={btnRef} type="button" className="btn btn-primary btn-block" onClick={dismissCelebration} data-testid="celebration-close">
          Super ! 🎉
        </button>
        <a href="#/trophees" className="celebration-link" onClick={dismissCelebration}>Voir mes trophées</a>
      </div>
    </div>
  );
}
