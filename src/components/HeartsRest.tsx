/** Écran bienveillant quand il n'y a plus de cœurs : une pause, jamais une punition. */
export function HeartsRest({ onRefill }: { onRefill: () => void }) {
  return (
    <section className="card hearts-rest" data-testid="hearts-rest">
      <p className="hearts-rest-emoji" aria-hidden>💤💖</p>
      <h2>Tes cœurs se reposent</h2>
      <p>
        Tu as beaucoup travaillé ! Prends une grande respiration et relis une astuce dans ta tête.
        Se tromper, c’est normal : c’est comme ça que le cerveau apprend.
      </p>
      <button type="button" className="btn btn-primary btn-block" onClick={onRefill} data-testid="refill">
        Recharger mes cœurs 💖
      </button>
    </section>
  );
}
