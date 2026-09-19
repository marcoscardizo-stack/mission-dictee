import type { MissionMeta } from '../data/missions';

export function MissionHeader({ meta }: { meta: MissionMeta }) {
  return (
    <header className={`mission-header tone-${meta.color}`}>
      <span className="mission-header-emoji" aria-hidden>{meta.emoji}</span>
      <div>
        <h1 className="mission-header-title">{meta.title}</h1>
        <p className="mission-header-intro">{meta.intro}</p>
      </div>
    </header>
  );
}
