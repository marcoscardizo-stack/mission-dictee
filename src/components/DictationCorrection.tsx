import type { DiffItem, DictationResult } from '../utils/compareDictation';

const REASON: Record<DiffItem['status'], string> = {
  ok: '',
  case: 'majuscule',
  accent: 'accent',
  wrong: 'orthographe',
  missing: 'oublié',
  extra: 'en trop',
};

function verdict(score: number) {
  if (score >= 90) return { emoji: '🎉', text: 'Excellent !', tone: 'great' };
  if (score >= 80) return { emoji: '👏', text: 'Très bien !', tone: 'good' };
  if (score >= 60) return { emoji: '💡', text: 'On réessaie !', tone: 'retry' };
  return { emoji: '🌱', text: 'Courage, on réessaie !', tone: 'retry' };
}

/** Recolle les jetons avec des espaces « naturels » (pas d'espace avant . ou ,). */
const needsSpace = (item: DiffItem, i: number) =>
  i > 0 && !(item.kind === 'punct' && /^[.,)]$/.test(item.expected ?? item.typed ?? ''));

export function DictationCorrection({ result, xp }: { result: DictationResult; xp: number }) {
  const v = verdict(result.score);
  const review = result.toReview.filter((it) => it.kind === 'word');

  return (
    <section className={`card correction tone-${v.tone}`} data-testid="dictation-result" aria-live="polite">
      <p className="score" data-testid="dictation-score">
        <span aria-hidden>{v.emoji}</span> <b>{result.score} %</b> — {v.text}
      </p>
      <p className="score-xp">+{xp} XP</p>

      <div className="score-counts">
        <span className="count count-ok">✅ <b>{result.correctWords}</b> mot{result.correctWords > 1 ? 's' : ''} correct{result.correctWords > 1 ? 's' : ''}</span>
        <span className="count count-ko">❌ <b>{review.length}</b> à revoir</span>
      </div>

      <h3 className="correction-title">La correction</h3>
      <p className="diff" data-testid="diff">
        {result.items.map((it, i) => {
          const sp = needsSpace(it, i) ? ' ' : '';
          if (it.status === 'ok') return <span key={i}>{sp}<span className="d-ok">{it.expected}</span></span>;
          if (it.status === 'missing') return <span key={i}>{sp}<span className="d-missing" title="Oublié">{it.expected}</span></span>;
          if (it.status === 'extra') return <span key={i}>{sp}<del className="d-extra" title="En trop">{it.typed}</del></span>;
          return (
            <span key={i}>
              {sp}
              <span className="d-wrong">
                <del>{it.typed}</del> <ins>{it.expected}</ins>
              </span>
            </span>
          );
        })}
      </p>
      <p className="legend">
        <span className="d-ok">bien écrit</span> <span className="d-wrong"><ins>corrigé</ins></span>{' '}
        <span className="d-missing">oublié</span> <del className="d-extra">en trop</del>
      </p>

      {review.length > 0 && (
        <>
          <h3 className="correction-title">❌ Mots à revoir</h3>
          <ul className="review-list" data-testid="review-list">
            {review.map((it, i) => (
              <li key={i}>
                {it.typed && it.expected ? (
                  <><del>{it.typed}</del> → <b>{it.expected}</b></>
                ) : it.expected ? (
                  <b>{it.expected}</b>
                ) : (
                  <del>{it.typed}</del>
                )}
                <span className="reason">{REASON[it.status]}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
