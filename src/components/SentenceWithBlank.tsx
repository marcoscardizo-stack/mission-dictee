/** Affiche une phrase à trous ; le trou « ___ » est rempli avec la bonne réponse après validation. */
export function SentenceWithBlank({ sentence, fill }: { sentence: string; fill: string | null }) {
  const [before, after] = sentence.split('___');
  if (after === undefined) return <>{sentence}</>;
  return (
    <>
      {before}
      <span className={`blank${fill ? ' blank-filled' : ''}`} aria-label={fill ?? 'mot manquant'}>
        {fill ?? '     '}
      </span>
      {after}
    </>
  );
}
