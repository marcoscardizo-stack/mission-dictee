import { useRef, useState } from 'react';
import type { QuizMissionId, QuizQuestion } from '../data/types';
import { missionById, questionBank, ROUND_SIZE } from '../data/missions';
import { useGame } from '../hooks/useGame';
import { XP_PER_CORRECT } from '../state/gameLogic';
import { shuffle } from '../utils/shuffle';
import { MissionHeader } from './MissionHeader';
import { SentenceWithBlank } from './SentenceWithBlank';
import { HeartsRest } from './HeartsRest';

const PRAISE = ['Bravo !', 'Excellent !', 'Super réflexe !', 'Bien joué !', 'Parfait !', 'Tu gères !'];
const ENCOURAGE = ['Presque !', 'Pas tout à fait…', 'On apprend en se trompant.', 'Bien essayé !'];
const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Paquet de questions par mission, conservé pendant la session :
 * on épuise toutes les questions avant de repiocher, pour éviter les répétitions.
 */
const decks: Partial<Record<QuizMissionId, QuizQuestion[]>> = {};
function drawRound(mission: QuizMissionId): QuizQuestion[] {
  const bank = questionBank[mission];
  const size = Math.min(ROUND_SIZE, bank.length);
  let deck = decks[mission] ?? [];
  if (deck.length < size) deck = [...deck, ...shuffle(bank.filter((q) => !deck.includes(q)))];
  const round = deck.slice(0, size);
  decks[mission] = deck.slice(size);
  return round.map((q) => ({ ...q, choices: shuffle(q.choices) }));
}

export function QuizMission({ mission }: { mission: QuizMissionId }) {
  const meta = missionById(mission);
  const { game, dispatch } = useGame();
  const [round, setRound] = useState(() => drawRound(mission));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState('');
  const feedbackRef = useRef<HTMLDivElement>(null);

  const q = round[index];
  const isCorrect = selected !== null && selected === q.answer;

  const choose = (choice: string) => {
    if (selected !== null) return;
    const ok = choice === q.answer;
    setSelected(choice);
    setMessage(pick(ok ? PRAISE : ENCOURAGE));
    if (ok) setRoundCorrect((c) => c + 1);
    dispatch({ type: 'answer', mission, correct: ok });
    navigator.vibrate?.(ok ? 15 : [10, 40, 10]);
    requestAnimationFrame(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };

  const next = () => {
    if (index + 1 >= round.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const restart = () => {
    setRound(drawRound(mission));
    setIndex(0);
    setSelected(null);
    setRoundCorrect(0);
    setFinished(false);
  };

  if (finished) {
    const ratio = roundCorrect / round.length;
    return (
      <div className="quiz">
        <MissionHeader meta={meta} />
        <section className={`card recap tone-${meta.color}`} data-testid="recap">
          <p className="recap-emoji" aria-hidden>{ratio >= 0.8 ? '🏆' : ratio >= 0.5 ? '🌟' : '🌱'}</p>
          <h2 className="recap-title">
            {ratio >= 0.8 ? 'Mission accomplie !' : ratio >= 0.5 ? 'Belle progression !' : 'Chaque essai te fait grandir !'}
          </h2>
          <p className="recap-score"><b>{roundCorrect}</b> / {round.length} bonnes réponses</p>
          <p className="recap-xp">+{roundCorrect * XP_PER_CORRECT} XP gagnés pendant cette série</p>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={restart} data-testid="restart">
              Nouvelle série ↻
            </button>
            <a href="#/" className="btn btn-ghost">Retour à l’accueil</a>
          </div>
        </section>
      </div>
    );
  }

  const resting = game.hearts === 0 && selected === null;

  return (
    <div className="quiz">
      <MissionHeader meta={meta} />

      <div className="progress" aria-label={`Question ${index + 1} sur ${round.length}`}>
        <div className="progress-text">
          <span>Question <b data-testid="q-index">{index + 1}</b> / {round.length}</span>
          <span className="tag">{q.tag}</span>
        </div>
        <div className="bar"><span style={{ width: `${((index + (selected ? 1 : 0)) / round.length) * 100}%` }} /></div>
      </div>

      {resting ? (
        <HeartsRest onRefill={() => dispatch({ type: 'refillHearts' })} />
      ) : (
        <section className="card question-card" data-testid="question" data-qid={q.id}>
          {q.prompt && <p className="question-prompt">{q.prompt}</p>}
          {q.sentence && (
            <p className="question-sentence">
              <SentenceWithBlank sentence={q.sentence} fill={selected ? q.answer : null} />
            </p>
          )}

          <div className={`choices${q.choices.some((c) => c.length > 8) ? ' choices-long' : ''}`} role="group" aria-label="Réponses">
            {q.choices.map((c) => {
              let state = '';
              if (selected !== null) {
                if (c === q.answer) state = 'is-right';
                else if (c === selected) state = 'is-wrong';
                else state = 'is-dim';
              }
              return (
                <button
                  key={c}
                  type="button"
                  className={`choice ${state}`}
                  onClick={() => choose(c)}
                  disabled={selected !== null}
                  aria-pressed={selected === c}
                  data-testid="choice"
                  data-correct={c === q.answer ? 'true' : undefined}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div ref={feedbackRef} className={`feedback ${isCorrect ? 'feedback-ok' : 'feedback-ko'}`} role="status" data-testid="feedback">
              <p className="feedback-title">
                {isCorrect ? (
                  <>🎉 {message} <span className="xp-gain">+{XP_PER_CORRECT} XP</span></>
                ) : (
                  <>💡 {message} La bonne réponse est « <b>{q.answer}</b> ».</>
                )}
              </p>
              <p className="feedback-explain"><span className="feedback-label">L’astuce :</span> {q.explanation}</p>
              {!isCorrect && game.hearts === 0 && (
                <p className="feedback-note">Tes cœurs vont se reposer un instant, puis tu pourras continuer. 💤</p>
              )}
              <button type="button" className="btn btn-primary btn-block" onClick={next} data-testid="next">
                {index + 1 >= round.length ? 'Voir mon bilan' : 'Question suivante'} <span aria-hidden>→</span>
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
