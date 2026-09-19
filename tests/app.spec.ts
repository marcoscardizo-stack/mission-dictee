import { test, expect, type Page } from '@playwright/test';

const ROUTES = ['accueil', 'homophones', 'accords', 'verbes', 'dictee', 'trophees', 'parametres'] as const;

/** Remplace la synthèse vocale par un espion pour vérifier ce qui est prononcé. */
async function stubSpeech(page: Page) {
  await page.addInitScript(() => {
    const spoken: { text: string; lang: string; rate: number }[] = [];
    (window as unknown as { __spoken: typeof spoken }).__spoken = spoken;
    class FakeUtterance {
      text: string; lang = ''; rate = 1; pitch = 1; voice: unknown = null;
      onend: (() => void) | null = null; onerror: (() => void) | null = null;
      constructor(t: string) { this.text = t; }
    }
    const synth = {
      speaking: false, pending: false,
      getVoices: () => [{ lang: 'fr-FR', name: 'Amélie', localService: true }],
      speak(u: FakeUtterance) { spoken.push({ text: u.text, lang: u.lang, rate: u.rate }); setTimeout(() => u.onend?.(), 30); },
      cancel() {}, addEventListener() {}, removeEventListener() {},
    };
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: FakeUtterance, configurable: true });
  });
  await page.reload(); // les scripts d'init ne s'appliquent qu'au chargement d'une page
}

const getSpoken = (page: Page) =>
  page.evaluate(() => (window as unknown as { __spoken: { text: string; lang: string; rate: number }[] }).__spoken);

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollW, innerW } = await page.evaluate(() => ({
    scrollW: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    innerW: window.innerWidth,
  }));
  expect(scrollW, 'pas de scroll horizontal').toBeLessThanOrEqual(innerW);
}

const stat = async (page: Page, id: 'xp' | 'streak' | 'hearts') =>
  Number((await page.getByTestId(id).locator('b').textContent())?.trim());

/** Répond à la question en cours (bonne ou mauvaise réponse). */
async function answer(page: Page, correct: boolean) {
  const sel = correct ? '[data-testid="choice"][data-correct="true"]' : '[data-testid="choice"]:not([data-correct])';
  await page.locator(sel).first().click();
  await expect(page.getByTestId('feedback')).toBeVisible();
}

async function closeCelebrations(page: Page) {
  for (let i = 0; i < 10 && (await page.getByTestId('celebration').isVisible()); i++) {
    await page.getByTestId('celebration-close').click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/#/');
});

test('accueil : textes et missions affichés', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Deviens une championne de dictée.' })).toBeVisible();
  await expect(page.getByText('Joue, écoute, réfléchis, écris.')).toBeVisible();
  for (const t of ['Le détective', 'La reine des accords', 'Le labo des verbes', 'Grande dictée']) {
    await expect(page.getByText(t, { exact: true })).toBeVisible();
  }
  await expect(page.getByTestId('xp')).toContainText('0');
  await expect(page.getByTestId('hearts')).toContainText('5');
});

test('chaque carte mission change réellement d’écran', async ({ page }) => {
  const cases = [
    ['homophones', 'Le détective'],
    ['accords', 'La reine des accords'],
    ['verbes', 'Le labo des verbes'],
    ['dictee', 'Grande dictée'],
  ] as const;
  for (const [id, title] of cases) {
    await page.goto('/#/');
    await page.getByTestId(`mission-${id}`).click();
    await expect(page).toHaveURL(new RegExp(`#/${id}$`));
    await expect(page.getByTestId(`screen-${id}`)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
  }
  await page.goto('/#/');
  await page.getByTestId('cta-dictee').click();
  await expect(page.getByTestId('screen-dictee')).toBeVisible();
});

test('navigation : tous les onglets fonctionnent, sans débordement horizontal', async ({ page }, info) => {
  const nav = info.project.name === 'desktop' ? 'nav-top' : 'nav-bottom';
  await expect(page.getByTestId(nav)).toBeVisible();
  for (const r of ['homophones', 'accords', 'verbes', 'dictee', 'trophees', 'accueil']) {
    await page.getByTestId(nav).locator(`[data-route="${r}"]`).click();
    await expect(page.getByTestId(`screen-${r}`)).toBeVisible();
    await expect(page.getByTestId(nav).locator(`[data-route="${r}"]`)).toHaveAttribute('aria-current', 'page');
    await expectNoHorizontalOverflow(page);
  }
  await page.getByTestId('settings-link').click();
  await expect(page.getByTestId('screen-parametres')).toBeVisible();
});

test('aucun débordement et zones tactiles ≥ 44 px sur chaque écran', async ({ page }) => {
  for (const r of ROUTES) {
    await page.goto(`/#/${r === 'accueil' ? '' : r}`);
    await expect(page.getByTestId(`screen-${r}`)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('button, a, textarea')]
        .filter((el) => el.offsetParent !== null)
        .map((el) => ({ el: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30), ...el.getBoundingClientRect().toJSON() }))
        .filter((r) => r.height < 44 || r.right > window.innerWidth + 0.5 || r.left < -0.5),
    );
    expect(small, `éléments trop petits ou hors écran sur ${r}`).toEqual([]);
  }
});

test('homophones : réponse, feedback, XP, série, cœurs, question suivante', async ({ page }) => {
  await page.goto('/#/homophones');
  const firstId = await page.getByTestId('question').getAttribute('data-qid');

  await answer(page, true);
  await expect(page.getByTestId('feedback')).toContainText('+10 XP');
  await expect(page.getByTestId('feedback')).toContainText('L’astuce');
  expect(await stat(page, 'xp')).toBe(10);
  expect(await stat(page, 'streak')).toBe(1);
  await closeCelebrations(page);

  await page.getByTestId('next').click();
  await expect(page.getByTestId('q-index')).toHaveText('2');
  const secondId = await page.getByTestId('question').getAttribute('data-qid');
  expect(secondId).not.toBe(firstId);

  await answer(page, false);
  await expect(page.getByTestId('feedback')).toContainText('La bonne réponse est');
  expect(await stat(page, 'hearts')).toBe(4);
  expect(await stat(page, 'streak')).toBe(0);
  expect(await stat(page, 'xp')).toBe(10);
});

test('accords et verbes : feedback avec explication', async ({ page }) => {
  for (const m of ['accords', 'verbes']) {
    await page.goto(`/#/${m}`);
    await answer(page, true);
    await expect(page.getByTestId('feedback')).toContainText('L’astuce');
    await closeCelebrations(page);
    await page.getByTestId('next').click();
    await expect(page.getByTestId('q-index')).toHaveText('2');
  }
});

test('série complète de 10 questions → bilan', async ({ page }) => {
  await page.goto('/#/verbes');
  for (let i = 0; i < 10; i++) {
    await answer(page, i % 3 !== 0);
    await closeCelebrations(page);
    await page.getByTestId('next').click();
  }
  await expect(page.getByTestId('recap')).toContainText('/ 10 bonnes réponses');
  await page.getByTestId('restart').click();
  await expect(page.getByTestId('q-index')).toHaveText('1');
});

test('cœurs : jamais négatifs, pause bienveillante et recharge', async ({ page }) => {
  await page.goto('/#/accords');
  for (let i = 0; i < 6; i++) {
    if (await page.getByTestId('hearts-rest').isVisible()) break;
    await answer(page, false);
    await page.getByTestId('next').click();
  }
  expect(await stat(page, 'hearts')).toBe(0);
  await expect(page.getByTestId('hearts-rest')).toBeVisible();
  await page.getByTestId('refill').click();
  expect(await stat(page, 'hearts')).toBe(5);
  await expect(page.getByTestId('question')).toBeVisible();
});

test('sauvegarde : XP, série et trophées conservés après rechargement', async ({ page }) => {
  await page.goto('/#/homophones');
  await answer(page, true);
  await expect(page.getByTestId('celebration')).toBeVisible();
  await expect(page.getByTestId('celebration')).toContainText('Première victoire');
  await closeCelebrations(page);

  await page.reload();
  expect(await stat(page, 'xp')).toBe(10);
  expect(await stat(page, 'streak')).toBe(1);
  await page.goto('/#/trophees');
  await expect(page.getByTestId('trophy-first')).toHaveAttribute('data-earned', 'true');
  await expect(page.getByTestId('trophy-fire')).toHaveAttribute('data-earned', 'false');
  await expect(page.getByTestId('trophy-count')).toHaveText('1');
});

test('trophées débloqués automatiquement en gagnant de l’XP', async ({ page }) => {
  await page.goto('/#/homophones');
  for (let i = 0; i < 5; i++) {
    await answer(page, true);
    await closeCelebrations(page);
    await page.getByTestId('next').click();
  }
  expect(await stat(page, 'xp')).toBe(50);
  await page.goto('/#/trophees');
  await expect(page.getByTestId('trophy-fire')).toHaveAttribute('data-earned', 'true');
});

test('dictée : Écouter / Lentement prononcent le texte en fr-FR', async ({ page }) => {
  await stubSpeech(page);
  await page.goto('/#/dictee');
  await page.getByTestId('listen').click();
  let spoken = await getSpoken(page);
  expect(spoken.map((s) => s.text).join(' ')).toBe(
    'Ce matin, Léa se promène dans le jardin. Elle regarde les fleurs et écoute les oiseaux. Le soleil brille doucement.',
  );
  expect(spoken.every((s) => s.lang === 'fr-FR')).toBe(true);
  const normalRate = spoken[0].rate;

  await page.evaluate(() => ((window as unknown as { __spoken: unknown[] }).__spoken.length = 0));
  await page.getByTestId('listen-slow').click();
  spoken = await getSpoken(page);
  expect(spoken.length).toBeGreaterThan(0);
  expect(spoken[0].rate).toBeLessThan(normalRate);
  expect(spoken.map((s) => s.text).join(' ').replace(/\s+/g, ' ')).toBe(
    'Ce matin, Léa se promène dans le jardin. Elle regarde les fleurs et écoute les oiseaux. Le soleil brille doucement.',
  );
});

test('dictée : correction parfaite, puis correction avec erreurs', async ({ page }) => {
  await stubSpeech(page);
  await page.goto('/#/dictee');
  const input = page.getByTestId('dictation-input');
  const fontSize = await input.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(16);

  await input.fill('Ce matin,  Léa se promène dans le jardin. Elle regarde les fleurs et écoute les oiseaux.  Le soleil brille doucement.');
  await page.getByTestId('correct').click();
  await expect(page.getByTestId('dictation-score')).toContainText('100 %');
  await expect(page.getByTestId('dictation-score')).toContainText('Excellent');
  await closeCelebrations(page);
  expect(await stat(page, 'xp')).toBe(30);

  await page.getByTestId('retry').click();
  await input.fill('Ce matin, Léa se promene dans le jardain. Elle regarde les fleur et écoute les oiseaux. Le soleil brille doucement.');
  await page.getByTestId('correct').click();
  await expect(page.getByTestId('dictation-score')).toContainText('%');
  const list = page.getByTestId('review-list');
  await expect(list).toContainText('jardain');
  await expect(list).toContainText('jardin');
  await expect(list).toContainText('promène');
  await expect(page.getByTestId('diff')).toBeVisible();
  await closeCelebrations(page);

  await page.getByTestId('next-text').click();
  await expect(page.getByTestId('dictation-title')).toHaveText('Mon chat');

  await page.getByTestId('level-champion').click();
  await expect(page.getByTestId('dictation-title')).toHaveText('Après la pluie');
  await page.reload();
  await expect(page.getByTestId('level-facile')).toContainText('100 %');
});

test('dictée : repli élégant sans synthèse vocale', async ({ page }) => {
  await page.addInitScript(() => {
    // Simulation d'un navigateur sans synthèse vocale.
    Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: undefined, configurable: true });
  });
  await page.goto('/#/dictee');
  await page.reload();
  await expect(page.getByTestId('speech-fallback')).toBeVisible();
  await page.getByTestId('memory').click();
  await expect(page.getByText('Il se cache dans')).toBeVisible();
});

test('paramètres : réinitialisation de la progression', async ({ page }) => {
  await page.goto('/#/homophones');
  await answer(page, true);
  await closeCelebrations(page);
  await page.goto('/#/parametres');
  await page.getByTestId('reset').click();
  await page.getByTestId('reset-confirm').click();
  await expect(page.getByTestId('reset-done')).toBeVisible();
  expect(await stat(page, 'xp')).toBe(0);
  await page.reload();
  expect(await stat(page, 'xp')).toBe(0);
});

test('PWA : manifeste, icônes, métadonnées Apple et service worker', async ({ page, request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.name).toBe('Mission Dictée');
  expect(manifest.short_name).toBe('Mission Dictée');
  expect(manifest.display).toBe('standalone');
  expect(manifest.lang).toBe('fr');
  expect(manifest.theme_color).toBeTruthy();
  expect(manifest.background_color).toBeTruthy();
  for (const icon of manifest.icons) {
    const res = await request.get(icon.src);
    expect(res.status(), icon.src).toBe(200);
  }
  expect(manifest.icons.some((i: { sizes: string }) => i.sizes === '180x180')).toBe(true);

  for (const name of ['apple-mobile-web-app-capable', 'apple-mobile-web-app-status-bar-style', 'apple-mobile-web-app-title']) {
    await expect(page.locator(`meta[name="${name}"]`)).toHaveCount(1);
  }
  expect((await request.get('/icons/apple-touch-icon.png')).status()).toBe(200);
  expect(await page.locator('meta[name="viewport"]').getAttribute('content')).toContain('viewport-fit=cover');

  const scope = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return reg.scope;
  });
  expect(scope).toContain('localhost:4173/');
});

test('liens : aucun lien mort', async ({ page, request }) => {
  const hrefs = new Set<string>();
  for (const r of ROUTES) {
    await page.goto(`/#/${r === 'accueil' ? '' : r}`);
    for (const h of await page.locator('a[href]').evaluateAll((els) => els.map((e) => e.getAttribute('href')!))) hrefs.add(h);
  }
  for (const h of hrefs) {
    if (h.startsWith('#')) {
      await page.goto(`/${h}`);
      const route = h.replace(/^#\/?/, '') || 'accueil';
      await expect(page.getByTestId(`screen-${route}`)).toBeVisible();
    } else {
      expect((await request.get(h)).status(), h).toBe(200);
    }
  }
});

test('captures d’écran', async ({ page }, info) => {
  test.skip(info.project.name === 'iphone-se');
  await stubSpeech(page);
  const dir = `test-results/screens/${info.project.name}`;
  await page.goto('/#/');
  await page.screenshot({ path: `${dir}/1-accueil.png`, fullPage: true });
  await page.goto('/#/homophones');
  await answer(page, true);
  await page.screenshot({ path: `${dir}/2-trophee.png` });
  await closeCelebrations(page);
  await page.screenshot({ path: `${dir}/3-homophones.png`, fullPage: true });
  await page.goto('/#/accords');
  await answer(page, false);
  await page.screenshot({ path: `${dir}/4-accords.png`, fullPage: true });
  await page.goto('/#/verbes');
  await page.screenshot({ path: `${dir}/5-verbes.png`, fullPage: true });
  await page.goto('/#/dictee');
  await page.getByTestId('dictation-input').fill('Ce matin, Léa se promene dans le jardain. Elle regarde les fleur et écoute les oiseaux.');
  await page.getByTestId('correct').click();
  await closeCelebrations(page);
  await page.screenshot({ path: `${dir}/6-dictee.png`, fullPage: true });
  await page.goto('/#/trophees');
  await page.screenshot({ path: `${dir}/7-trophees.png`, fullPage: true });
  await page.goto('/#/parametres');
  await page.screenshot({ path: `${dir}/8-parametres.png`, fullPage: true });
});

test('libellés de navigation entièrement visibles', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop');
  const clipped = await page.getByTestId('nav-bottom').locator('.nav-label').evaluateAll((els) =>
    els.filter((e) => e.scrollWidth > e.clientWidth + 0.5).map((e) => e.textContent),
  );
  expect(clipped).toEqual([]);
});
