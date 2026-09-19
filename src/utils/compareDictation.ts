/**
 * Correction « intelligente » d'une dictée :
 * - normalise espaces, apostrophes et guillemets (aucune pénalité pour ces détails) ;
 * - découpe en mots et signes de ponctuation ;
 * - aligne le texte écrit avec le texte attendu (distance d'édition pondérée),
 *   ce qui permet de repérer précisément les mots faux, oubliés ou en trop.
 */

export type TokenKind = 'word' | 'punct';
export type DiffStatus = 'ok' | 'case' | 'accent' | 'wrong' | 'missing' | 'extra';

export interface Token {
  text: string;
  kind: TokenKind;
}

export interface DiffItem {
  status: DiffStatus;
  kind: TokenKind;
  expected?: string;
  typed?: string;
}

export interface DictationResult {
  score: number; // 0 → 100
  items: DiffItem[];
  correctWords: number;
  totalWords: number;
  toReview: DiffItem[];
}

export function normalize(input: string): string {
  return input
    .normalize('NFC')
    .replace(/[’‘`´ʼ]/g, "'")
    .replace(/[«»“”„]/g, '"')
    .replace(/…/g, '...')
    .replace(/[   \t\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const TOKEN_RE = /[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*'?|[.,;:!?"()]/gu;

export function tokenize(input: string): Token[] {
  const out: Token[] = [];
  for (const m of normalize(input).matchAll(TOKEN_RE)) {
    const text = m[0];
    out.push({ text, kind: /^[.,;:!?"()]$/.test(text) ? 'punct' : 'word' });
  }
  return out;
}

const stripAccents = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '');
const weight = (t: Token) => (t.kind === 'word' ? 1 : 0.5);

function compareTokens(expected: Token, typed: Token): DiffStatus | null {
  if (expected.kind !== typed.kind) return null;
  if (expected.text === typed.text) return 'ok';
  if (expected.text.toLowerCase() === typed.text.toLowerCase()) return 'case';
  if (expected.kind === 'word' && stripAccents(expected.text).toLowerCase() === stripAccents(typed.text).toLowerCase()) {
    return 'accent';
  }
  return 'wrong';
}

const SUB_COST: Record<DiffStatus, number> = { ok: 0, case: 0.3, accent: 0.6, wrong: 1, missing: 0, extra: 0 };

export function compareDictation(expectedText: string, typedText: string): DictationResult {
  const exp = tokenize(expectedText);
  const typ = tokenize(typedText);
  const n = exp.length;
  const m = typ.length;

  // Table de distance d'édition pondérée.
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i++) dp[i][0] = dp[i - 1][0] + weight(exp[i - 1]);
  for (let j = 1; j <= m; j++) dp[0][j] = dp[0][j - 1] + weight(typ[j - 1]);
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const st = compareTokens(exp[i - 1], typ[j - 1]);
      const sub = st === null ? Infinity : dp[i - 1][j - 1] + SUB_COST[st] * weight(exp[i - 1]);
      dp[i][j] = Math.min(sub, dp[i - 1][j] + weight(exp[i - 1]), dp[i][j - 1] + weight(typ[j - 1]));
    }
  }

  // Remontée pour reconstruire l'alignement.
  const items: DiffItem[] = [];
  let i = n;
  let j = m;
  const EPS = 1e-9;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const st = compareTokens(exp[i - 1], typ[j - 1]);
      if (st !== null && Math.abs(dp[i][j] - (dp[i - 1][j - 1] + SUB_COST[st] * weight(exp[i - 1]))) < EPS) {
        items.push({ status: st, kind: exp[i - 1].kind, expected: exp[i - 1].text, typed: typ[j - 1].text });
        i--; j--;
        continue;
      }
    }
    if (i > 0 && Math.abs(dp[i][j] - (dp[i - 1][j] + weight(exp[i - 1]))) < EPS) {
      items.push({ status: 'missing', kind: exp[i - 1].kind, expected: exp[i - 1].text });
      i--;
    } else {
      items.push({ status: 'extra', kind: typ[j - 1].kind, typed: typ[j - 1].text });
      j--;
    }
  }
  items.reverse();

  // Score : points gagnés sur les éléments attendus, les mots en trop comptent un peu.
  let earned = 0;
  let total = 0;
  for (const it of items) {
    const w = it.kind === 'word' ? 1 : 0.5;
    if (it.status === 'extra') { total += w * 0.5; continue; }
    total += w;
    if (it.status === 'ok') earned += w;
    else if (it.status === 'case') earned += w * 0.5;
  }
  const score = m === 0 || total === 0 ? 0 : Math.round((earned / total) * 100);

  const words = items.filter((it) => it.kind === 'word' && it.status !== 'extra');
  return {
    score,
    items,
    correctWords: words.filter((it) => it.status === 'ok').length,
    totalWords: words.length,
    toReview: items.filter((it) => it.status !== 'ok' && !(it.kind === 'punct' && it.status === 'extra')),
  };
}
