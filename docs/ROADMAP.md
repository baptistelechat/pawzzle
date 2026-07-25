# Roadmap MVP — Pawzzle

> Basé sur [BRIEF_puzzle_game.md](./BRIEF_puzzle_game.md), section 8 (plan de validation). Ordre strict : moteur de jeu → test interne → PWA/sauvegarde → LP/SEO. Pas de landing page, pas de Supabase, pas de PWA installable tant que la Phase 1 n'est pas validée fun.

## Phase 0 — Setup projet ✅

- [x] `pnpm create vite` (React + TS) — dossier vide requis (⚠️ GLRN-120 : bloque en CWD non vide, fichiers créés à la main)
- [x] Tailwind v4 via `@tailwindcss/vite` (pas de config JS — GLRN-004)
- [x] `.npmrc` racine si erreur `workspace-root-check` (GLRN-194) — non nécessaire, pas de `pnpm-workspace.yaml`
- [x] shadcn/ui init (Base UI + preset Nova) — `tsconfig.json` racine a bien `paths` (GLRN-178), imports générés en `src\` et pas `@\` (GLRN-121)
- [x] ESLint 9 flat config minimal (GLRN-179)
- [x] `vite-env.d.ts` (GLRN-122)

**Sortie** : `pnpm dev` tourne, `pnpm lint` et `pnpm build` passent, un composant shadcn (`Button`) s'affiche — vérifié visuellement via agent-browser.

## Phase 1 — Moteur de règles + génération (le vrai cœur du MVP)

Scope figé par le brief (4.0) : **grille carrée classique uniquement**, aucune forme exotique, aucune contrainte échecs.

- [x] Modèle de grille : `size × size`, chaque case a une région colorée (1 région = 1 couleur, autant de régions que de lignes)
- [x] 3 règles de validation : un animal par ligne, par colonne, par région, aucun contact (8 voisins) entre deux animaux
- [x] Générateur procédural : grille candidate → vérif solution unique (backtracking/CSP) → régénère si 0 ou plusieurs solutions
- [x] Solveur dans un **Web Worker** (le brief anticipe un coût calcul non négligeable — ne pas geler l'UI)
- [x] Indicateur de chargement léger si génération > quelques dizaines de ms _(fait en Phase 2 — spinner `Loader2` dans `App.tsx` tant que `status === "loading"`)_

**Sortie** : `generateLevel(size)` renvoie une grille valide à solution unique, appelable en boucle sans freeze UI. Testable en dehors de toute UI (script/console).

## Phase 2 — UI de jeu minimale

- [x] Grille cliquable : 1 clic = pose un animal, re-clic = retire
- [x] Feedback visuel erreur (contact adjacent, doublon ligne/colonne/région)
- [x] Budget d'erreur : compteur d'erreurs autorisées avant échec du niveau (pas un système d'indice — décision actée, brief section 9)
- [x] Détection victoire (3 règles respectées partout) → écran de fin simple
- [x] Bouton "nouveau niveau" (appelle le générateur de la Phase 1)

**Sortie** : on peut jouer un niveau du début à la fin dans le navigateur, en local, sans compte ni sauvegarde.

## Phase 3 — Test interne (gate avant d'aller plus loin)

- [x] Faire tester à l'entourage (brief section 8, point 2)
- [x] Valider : plus engageant que Queens standard ? Sessions de 2-5 min tenables (insight utilisateur, section 5) ? _(ressenti proche de Queens pour l'instant — attendu, le gameplay différenciant n'est pas encore développé)_
- [x] Go/no-go avant Phase 4 → **Go**

**Phase 4 débloquée.**

## Phase 4 — Post-MVP (ordre imposé par le brief, section 8)

### Phase 4.0 — Game feel : animation, son, haptique

- [x] Micro-animations : pose de pion, secousse de grille sur erreur, confettis à la victoire — Motion centralisé (`LazyMotion` + tokens, BDR-012)
- [x] Sound design : feedback sonore pose/erreur/victoire + mute persistant (`localStorage`) — Web Audio API pour les SFX, `<audio loop>` natif pour l'ambiance (BDR-016, BDR-017)
- [x] ~~Curseur de réglage du volume des sons~~ — abandonné, mix déjà calibré, exposer un curseur risquait de dégrader l'expérience (BDR-026)
- [x] Retour haptique mobile : vibration courte sur pose/erreur/victoire (`web-haptics`, singleton `src/lib/haptics.ts`, BDR-013)
- [x] Panneau "Réglages" (Dialog) : vibrations/sons/ambiance en toggles + aide au marquage (BDR-025). Remplace une tentative de popover volume au survol du mini-player `AmbientPlayer` (retirée — Base UI Popover en hover+clic combinés trop capricieux pour un simple réglage, BDR-021)
- [x] Panneau "Règles du jeu" (Dialog) : 3 règles illustrées + section "Comment jouer ?" (BDR-025, BDR-029)
- [x] Ouvrir `HowToPlayDialog` automatiquement au tout premier lancement (`localStorage: pawzzle:seenIntro`, une seule fois)

**Sortie** : les 3 règles de base (Phase 1-2) ont un feedback sensoriel complet.

### Phase 4.1 — Mécaniques différenciantes (brief 4.1)

- [ ] Formes de grille non carrées (hexagone, cercle, triangle... en pixel art) — casse la lecture visuelle sans changer la logique de base
- [ ] Contraintes inspirées des échecs (diagonale/L/ligne interdite) — nomenclature par mouvement décrit, jamais par nom de pièce
- [ ] Niveau-tutoriel dédié pour introduire chaque nouvelle contrainte (pas de surlignage permanent en jeu — piège d'onboarding identifié en 4.1 du brief)
- [ ] Combinaison forme + contrainte pour niveaux inédits

**Sortie** : au moins une forme non carrée + une contrainte échecs jouables. Retest interne pour confirmer le gain d'engagement vs Queens (le test Phase 3 était encore trop proche du clone strict).

### Phase 4.2 — PWA installable + Supabase (brief 8, point 3)

- [ ] Manifest + service worker (installable, fonctionne hors-ligne pour un niveau en cours)
- [ ] Auth Supabase (compte utilisateur)
- [ ] Sauvegarde de progression (niveaux complétés, stats) en base Supabase
- [ ] Vigilance plan Free : pause après 7j d'inactivité, cap dur Vercel sans overage (brief section 2)

**Sortie** : le jeu s'installe en PWA, la progression persiste entre sessions/appareils via un compte.

### Phase 4.3 — Landing page + SEO (brief section 3)

- [ ] Trancher l'outil : `vite-plugin-seo-prerender` / React Router v7 pré-rendu / Astro séparé
- [ ] Pages vitrine : accueil, règles, à propos
- [ ] Stratégie SEO de base (meta tags, sitemap, OG image)

**Sortie** : LP indexable séparée de l'app, avec les pages clés.

---

**Prochaine étape immédiate** : Phase 4.0 close — passer à la Phase 4.1.
