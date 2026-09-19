import { hrefFor, type Route } from '../hooks/useHashRoute';

const ITEMS: { route: Route; emoji: string; label: string }[] = [
  { route: 'accueil', emoji: '🏠', label: 'Accueil' },
  { route: 'homophones', emoji: '🧩', label: 'Homophones' },
  { route: 'accords', emoji: '🎀', label: 'Accords' },
  { route: 'verbes', emoji: '⚡', label: 'Verbes' },
  { route: 'dictee', emoji: '🎧', label: 'Dictée' },
  { route: 'trophees', emoji: '🏆', label: 'Trophées' },
];

export function NavBar({ route, variant }: { route: Route; variant: 'top' | 'bottom' }) {
  return (
    <nav className={`nav nav-${variant}`} aria-label="Navigation principale" data-testid={`nav-${variant}`}>
      {ITEMS.map((it) => {
        const active = it.route === route;
        return (
          <a
            key={it.route}
            href={hrefFor(it.route)}
            className={`nav-item${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
            data-route={it.route}
          >
            <span className="nav-emoji" aria-hidden>{it.emoji}</span>
            <span className="nav-label">{it.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
