# Roadmap MVP — Pawzzle

> Basé sur [BRIEF_puzzle_game.md](./BRIEF_puzzle_game.md), section 8 (plan de validation). Ordre strict : moteur de jeu → test interne → PWA/sauvegarde → LP/SEO. Pas de landing page, pas de Supabase, pas de PWA installable tant que la Phase 1 n'est pas validée fun.

## Phase 0 — Setup projet

- [ ] `pnpm create vite` (React + TS) — dossier vide requis (⚠️ GLRN-120 : bloque en CWD non vide, créer les fichiers à la main sinon)
- [ ] Tailwind v4 via `@tailwindcss/vite` (pas de config JS — GLRN-004)
- [ ] `.npmrc` racine si erreur `workspace-root-check` (GLRN-194)
- [ ] shadcn/ui init — vérifier `tsconfig.json` racine a bien `paths` (GLRN-178), vérifier les imports générés en `src\` et pas `@\` (GLRN-121)
- [ ] ESLint 9 flat config minimal (GLRN-179)
- [ ] `vite-env.d.ts` si besoin d'imports CSS en `.ts` (GLRN-122)

**Sortie** : `pnpm dev` tourne, un composant shadcn s'affiche.

## Phase 1 — Moteur de règles + génération (le vrai cœur du MVP)

Scope figé par le brief (4.0) : **grille carrée classique uniquement**, aucune forme exotique, aucune contrainte échecs.

- [ ] Modèle de grille : `size × size`, chaque case a une région colorée (1 région = 1 couleur, autant de régions que de lignes)
- [ ] 3 règles de validation : un animal par ligne, par colonne, par région, aucun contact (8 voisins) entre deux animaux
- [ ] Générateur procédural : grille candidate → vérif solution unique (backtracking/CSP) → régénère si 0 ou plusieurs solutions
- [ ] Solveur dans un **Web Worker** (le brief anticipe un coût calcul non négligeable — ne pas geler l'UI)
- [ ] Indicateur de chargement léger si génération > quelques dizaines de ms

**Sortie** : `generateLevel(size)` renvoie une grille valide à solution unique, appelable en boucle sans freeze UI. Testable en dehors de toute UI (script/console).

## Phase 2 — UI de jeu minimale

- [ ] Grille cliquable : 1 clic = pose un animal, re-clic = retire
- [ ] Feedback visuel erreur (contact adjacent, doublon ligne/colonne/région)
- [ ] Budget d'erreur : compteur d'erreurs autorisées avant échec du niveau (pas un système d'indice — décision actée, brief section 9)
- [ ] Détection victoire (3 règles respectées partout) → écran de fin simple
- [ ] Bouton "nouveau niveau" (appelle le générateur de la Phase 1)

**Sortie** : on peut jouer un niveau du début à la fin dans le navigateur, en local, sans compte ni sauvegarde.

## Phase 3 — Test interne (gate avant d'aller plus loin)

- [ ] Faire tester à l'entourage (brief section 8, point 2)
- [ ] Valider : plus engageant que Queens standard ? Sessions de 2-5 min tenables (insight utilisateur, section 5) ?
- [ ] Go/no-go avant Phase 4

**Ne pas commencer la Phase 4 sans ce go.**

## Phase 4 — Hors scope MVP (pour mémoire, ne pas anticiper)

- Formes de grille non carrées + contraintes échecs (brief 4.1)
- PWA installable, Supabase (auth, progression, sauvegarde)
- Landing page + SEO (brief section 3)

---

**Prochaine étape immédiate** : Phase 0 dès validation de cette roadmap.
