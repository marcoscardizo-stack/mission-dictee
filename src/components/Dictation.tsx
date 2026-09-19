import { useEffect, useRef, useState } from 'react';
import type { DictationLevel } from '../data/types';
import { LEVELS, dicteesByLevel } from '../data/dictees';
import { missionById } from '../data/missions';
import { useGame } from '../hooks/useGame';
import { dictationXp } from '../state/gameLogic';
import { useSpeech, splitForSpeech } from '../hooks/useSpeech';
import { compareDictation, type DictationResult } from '../utils/compareDictation';
import { loadJSON, saveJSON } from '../utils/storage';
import { MissionHeader } from './MissionHeader';
import { DictationCorrection } from './DictationCorrection';

const PREFS_KEY = 'mission-dictee:dictee-prefs';
const MEMORY_SECONDS = 12;

interface Prefs { level: DictationLevel; index: Record<DictationLevel, number> }
const defaultPrefs: Prefs = { level: 'facile', index: { facile: 0, moyen: 0, champion: 0 } };

export function Dictation() {
  const meta = missionById('dictee');
  const { game, dispatch } = useGame();
  const speech = useSpeech();

  const [prefs, setPrefs] = useState<Prefs>(() => {
    const p = loadJSON<Prefs>(PREFS_KEY);
    return p && LEVELS.some((l) => l.id === p.level) ? { ...defaultPrefs, ...p, index: { ...defaultPrefs.index, ...p.index } } : defaultPrefs;
  });
  const texts = dicteesByLevel(prefs.level);
  const current = texts[(prefs.index[prefs.level] ?? 0) % texts.length];

  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<DictationResult | null>(null);
  const [gained, setGained] = useState(0);
  const [memoryLeft, setMemoryLeft] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);
  const sentences = splitForSpeech(current.text, false);

  useEffect(() => saveJSON(PREFS_KEY, prefs), [prefs]);

  // Mode mémoire (repli si la synthèse vocale est indisponible) : compte à rebours.
  useEffect(() => {
    if (memoryLeft <= 0) return;
    const t = window.setTimeout(() => setMemoryLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [memoryLeft]);

  const resetAttempt = () => {
    speech.stop();
    setTyped('');
    setResult(null);
    setMemoryLeft(0);
  };

  const chooseLevel = (level: DictationLevel) => {
    if (level === prefs.level) return;
    resetAttempt();
    setPrefs((p) => ({ ...p, level }));
  };

  const nextText = () => {
    resetAttempt();
    setPrefs((p) => ({ ...p, index: { ...p.index, [p.level]: (p.index[p.level] + 1) % texts.length } }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const correct = () => {
    if (!typed.trim()) return;
    speech.stop();
    const r = compareDictation(current.text, typed);
    setResult(r);
    setGained(dictationXp(r.score));
    dispatch({ type: 'dictation', level: prefs.level, score: r.score });
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const setTyping = (on: boolean) => {
    document.body.classList.toggle('is-typing', on);
  };
  useEffect(() => () => setTyping(false), []);

  const speechUsable = speech.supported && speech.hasFrenchVoice;

  return (
    <div className="dictation">
      <MissionHeader meta={meta} />

      <div className="levels" role="tablist" aria-label="Niveau de la dictée">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            aria-selected={prefs.level === l.id}
            className={`level${prefs.level === l.id ? ' is-active' : ''}`}
            onClick={() => chooseLevel(l.id)}
            data-testid={`level-${l.id}`}
          >
            <span className="level-emoji" aria-hidden>{l.emoji}</span>
            <span className="level-label">{l.label}</span>
            <span className="level-best">{game.dictation.best[l.id] ? `${game.dictation.best[l.id]} %` : '—'}</span>
          </button>
        ))}
      </div>

      <section className="card listen-card">
        <div className="listen-head">
          <div>
            <p className="eyebrow">Texte {texts.indexOf(current) + 1} / {texts.length}</p>
            <h2 className="listen-title" data-testid="dictation-title">{current.title}</h2>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={nextText} data-testid="other-text">
            Autre texte ↻
          </button>
        </div>

        {speechUsable ? (
          <>
            <div className="listen-actions">
              <button type="button" className="btn btn-listen" onClick={() => speech.speak(current.text)} data-testid="listen">
                🔊 Écouter
              </button>
              <button type="button" className="btn btn-slow" onClick={() => speech.speak(current.text, { slow: true })} data-testid="listen-slow">
                🐢 Lentement
              </button>
            </div>
            <div className="sentence-chips" aria-label="Réécouter une phrase">
              <span className="chips-label">Réécouter :</span>
              {sentences.map((s, i) => (
                <button key={i} type="button" className="chip" onClick={() => speech.speak(s, { slow: true })}>
                  Phrase {i + 1}
                </button>
              ))}
              {speech.speaking && (
                <button type="button" className="chip chip-stop" onClick={speech.stop} data-testid="stop">⏹ Stop</button>
              )}
            </div>
            {speech.speaking && <p className="speaking" aria-live="polite"><span className="wave" aria-hidden><i /><i /><i /></span> Lecture en cours…</p>}
          </>
        ) : (
          <div className="fallback" data-testid="speech-fallback">
            <p>
              🔇 La lecture à voix haute n’est pas disponible sur cet appareil
              {speech.supported ? ' (aucune voix française installée)' : ''}.
              Utilise le <b>mode mémoire</b> : lis le texte, il se cachera, puis écris-le de mémoire.
            </p>
            {memoryLeft > 0 ? (
              <div className="memory-text">
                <p>{current.text}</p>
                <span className="memory-count">Il se cache dans {memoryLeft} s</span>
              </div>
            ) : (
              <button type="button" className="btn btn-slow" onClick={() => setMemoryLeft(MEMORY_SECONDS)} data-testid="memory">
                👀 Voir le texte ({MEMORY_SECONDS} s)
              </button>
            )}
          </div>
        )}
      </section>

      <section className="card write-card">
        <label htmlFor="dictation-input" className="write-label">✏️ Écris ta dictée ici</label>
        <textarea
          id="dictation-input"
          className="write-input"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onFocus={() => setTyping(true)}
          onBlur={() => setTyping(false)}
          rows={6}
          placeholder="Écoute, puis écris chaque phrase…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
          spellCheck={false}
          lang="fr"
          readOnly={result !== null}
          data-testid="dictation-input"
        />
        {result === null ? (
          <div className="actions">
            <button type="button" className="btn btn-primary btn-block" onClick={correct} disabled={!typed.trim()} data-testid="correct">
              ✅ Corriger ma dictée
            </button>
            {typed && (
              <button type="button" className="btn btn-ghost" onClick={() => setTyped('')}>Effacer</button>
            )}
          </div>
        ) : null}
      </section>

      {result && (
        <div ref={resultRef}>
          <DictationCorrection result={result} xp={gained} />
          <div className="actions actions-stack">
            <button type="button" className="btn btn-primary btn-block" onClick={resetAttempt} data-testid="retry">
              ↻ Réessayer ce texte
            </button>
            <button type="button" className="btn btn-ghost btn-block" onClick={nextText} data-testid="next-text">
              Texte suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
