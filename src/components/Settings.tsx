import { useState } from 'react';
import { missions } from '../data/missions';
import { LEVELS } from '../data/dictees';
import { useGame } from '../hooks/useGame';
import { useSpeech } from '../hooks/useSpeech';
import type { QuizMissionId } from '../data/types';

const QUIZ: QuizMissionId[] = ['homophones', 'accords', 'verbes'];

export function Settings() {
  const { game, resetProgress } = useGame();
  const speech = useSpeech();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div className="settings">
      <header className="page-header">
        <span className="page-emoji" aria-hidden>⚙️</span>
        <div>
          <h1>Paramètres</h1>
          <p>Ta progression est sauvegardée sur cet appareil.</p>
        </div>
      </header>

      <section className="card">
        <h2 className="card-title">📊 Mes statistiques</h2>
        <ul className="stat-list">
          {QUIZ.map((id) => {
            const m = missions.find((x) => x.id === id)!;
            const s = game.stats[id];
            const pct = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;
            return (
              <li key={id}>
                <span>{m.emoji} {m.navLabel}</span>
                <span><b>{s.correct}</b> / {s.answered} {s.answered ? `(${pct} %)` : ''}</span>
              </li>
            );
          })}
          {LEVELS.map((l) => (
            <li key={l.id}>
              <span>{l.emoji} Dictée {l.label.toLowerCase()}</span>
              <span>meilleur : <b>{game.dictation.best[l.id]} %</b></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="card-title">🔊 Lecture à voix haute</h2>
        <p className="muted">
          {speech.supported
            ? speech.hasFrenchVoice
              ? 'Disponible, avec une voix française.'
              : 'Disponible, mais aucune voix française n’est installée. Sur iPhone : Réglages › Accessibilité › Contenu énoncé › Voix › Français.'
            : 'Non disponible sur ce navigateur. Le mode mémoire prend le relais dans la Grande dictée.'}
        </p>
        {speech.supported && speech.hasFrenchVoice && (
          <button type="button" className="btn btn-ghost" onClick={() => speech.speak('Bonjour ! Prête pour ta mission dictée ?')}>
            Tester la voix 🔊
          </button>
        )}
      </section>

      <section className="card danger-zone">
        <h2 className="card-title">🧹 Recommencer à zéro</h2>
        <p className="muted">Efface l’XP, la série, les cœurs, les trophées et les scores de dictée.</p>
        {done && <p className="success" role="status" data-testid="reset-done">Progression réinitialisée. Nouveau départ ! 🌱</p>}
        {confirming ? (
          <div className="actions">
            <button
              type="button"
              className="btn btn-danger"
              data-testid="reset-confirm"
              onClick={() => { resetProgress(); setConfirming(false); setDone(true); }}
            >
              Oui, tout effacer
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>Annuler</button>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => { setConfirming(true); setDone(false); }} data-testid="reset">
            Réinitialiser ma progression
          </button>
        )}
      </section>

      <p className="version">Mission Dictée · v1.0</p>
    </div>
  );
}
