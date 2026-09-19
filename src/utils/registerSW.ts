/** Enregistre le service worker (uniquement en production, pour ne pas gêner le développement). */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* l'application fonctionne aussi sans service worker */
    });
  });
}
