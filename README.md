# ✍️ Mission Dictée

Jeu éducatif de français pour le CM2 : homophones, accords, verbes et grande dictée.
Application web (PWA) indépendante, pensée d’abord pour l’iPhone (Safari, écran d’accueil), qui fonctionne aussi sur ordinateur.

- **Stack** : React 19 + TypeScript + Vite. Aucune dépendance à un service externe.
- **Sauvegarde** : `localStorage` de l’appareil (XP, série, cœurs, trophées, scores de dictée, niveau choisi).
- **Voix** : Web Speech API du navigateur (`speechSynthesis`, `fr-FR`). Si elle n’est pas disponible, un « mode mémoire » prend le relais.
- **Hors ligne** : service worker simple (`public/sw.js`).

---

## Démarrer en local

Prérequis : [Node.js](https://nodejs.org) 20.19 ou plus récent (22 recommandé).

```bash
npm install
npm run dev          # http://localhost:5173
```

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run typecheck` | vérification TypeScript |
| `npm run build` | build de production dans `dist/` |
| `npm run preview` | sert la version de production en local |
| `npm run lint` | analyse du code (oxlint) |
| `npm run test:e2e` | tests Playwright (iPhone 16 Plus, iPhone SE, ordinateur) |
| `npm run icons` | régénère les icônes PNG (nécessite `npm i -D sharp`) |

Pour les tests, la première fois : `npx playwright install chromium`.

---

## Organisation du code

```
src/
  App.tsx                 # structure : barre de stats, navigation, écran courant
  components/             # écrans et éléments d’interface
    Home.tsx              # accueil
    QuizMission.tsx       # moteur commun Homophones / Accords / Verbes
    Dictation.tsx         # grande dictée (écoute, saisie, correction)
    DictationCorrection.tsx
    Trophies.tsx, Settings.tsx, StatsBar.tsx, NavBar.tsx, TrophyCelebration.tsx…
  data/                   # contenu pédagogique (questions, textes, trophées)
  hooks/                  # useHashRoute (navigation), useSpeech (voix), useGame
  state/                  # règles du jeu (XP, série, cœurs, trophées) + sauvegarde
  utils/                  # correction de dictée, stockage, mélange
public/                   # manifest, service worker, icônes
tests/                    # tests Playwright
```

**Ajouter des questions** : il suffit d’ajouter une ligne dans `src/data/homophones.ts`, `accords.ts` ou `verbes.ts`.
**Ajouter une dictée** : ajouter un objet dans `src/data/dictees.ts` (niveau `facile`, `moyen` ou `champion`).

La navigation utilise des adresses du type `#/homophones` : aucune configuration serveur n’est nécessaire.

---

## Mettre en ligne

### 1. Créer le dépôt GitHub

1. Sur <https://github.com/new>, nommer le dépôt `mission-dictee` (Public ou Private), **sans** cocher « Add a README ».
2. Dans le dossier du projet :

```bash
git init
git add .
git commit -m "Mission Dictée v1"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/mission-dictee.git
git push -u origin main
```

Fichiers envoyés : tout le dossier, sauf ce qui est listé dans `.gitignore` (`node_modules/`, `dist/`, `test-results/`).

### 2A. Vercel

1. <https://vercel.com> → **Sign up with GitHub**.
2. **Add New… → Project** → importer `mission-dictee`.
3. Vercel détecte Vite (réglages déjà fournis dans `vercel.json`) : Build `npm run build`, Output `dist`. Cliquer **Deploy**.
4. L’URL publique s’affiche à la fin (ex. `https://mission-dictee.vercel.app`).

### 2B. Netlify

1. <https://app.netlify.com> → **Add new site → Import an existing project → GitHub**.
2. Choisir `mission-dictee`. Les réglages viennent de `netlify.toml` (Build `npm run build`, Publish `dist`). Cliquer **Deploy**.
3. L’URL publique s’affiche (ex. `https://mission-dictee.netlify.app`, renommable dans *Site configuration → Change site name*).

Ensuite, chaque `git push` sur `main` redéploie automatiquement.

### 3. Installer sur iPhone

1. Ouvrir l’URL dans **Safari**.
2. Bouton **Partager** (carré avec une flèche) → **Sur l’écran d’accueil** → **Ajouter**.
3. L’icône Mission Dictée apparaît : l’app s’ouvre en plein écran, sans barre Safari.

Astuce voix : si la lecture est muette, vérifier que l’iPhone n’est pas en mode silencieux et qu’une voix française est installée (*Réglages › Accessibilité › Contenu énoncé › Voix › Français*).

La progression est enregistrée **sur l’appareil** (et séparément pour Safari et pour l’app installée sur l’écran d’accueil) : utiliser toujours l’icône de l’écran d’accueil.
