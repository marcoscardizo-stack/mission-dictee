import { useCallback, useEffect, useState } from 'react';

export const ROUTES = ['accueil', 'homophones', 'accords', 'verbes', 'dictee', 'trophees', 'parametres'] as const;
export type Route = (typeof ROUTES)[number];

/**
 * Routage par hash (#/homophones…) : fonctionne sur n'importe quel hébergeur statique
 * sans configuration de réécriture, et dans la PWA iOS.
 */
function parse(hash: string): Route {
  const r = hash.replace(/^#\/?/, '').split(/[?/]/)[0];
  return (ROUTES as readonly string[]).includes(r) ? (r as Route) : 'accueil';
}

export const hrefFor = (r: Route) => (r === 'accueil' ? '#/' : `#/${r}`);

export function useHashRoute() {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((r: Route) => {
    const target = hrefFor(r);
    if (window.location.hash === target || (r === 'accueil' && window.location.hash === '')) {
      window.scrollTo({ top: 0 });
      return;
    }
    window.location.hash = target;
  }, []);

  return { route, navigate };
}
