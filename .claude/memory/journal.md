---
register: journal
---

## 2026-07-21

Installation de l'infrastructure mémoire agent (`/memory-setup`) pour le projet Pawzzle. Le projet n'a pas encore de code — seul le brief de cadrage (`docs/BRIEF_puzzle_game.md`) existe à ce stade. `CLAUDE.md` créé à partir de ce brief pour donner le contexte projet (stack, architecture, conventions) dès le prochain démarrage de session.

**Entrées clés :**

- [BDR-001](decisions/BDR-001.md) — Stack Vite+React+TS, Supabase, PWA, Vercel Hobby
- [LRN-001](learnings/LRN-001.md) — MVP = clone strict avant innovation
- [BLK-001](blockers/BLK-001.md) — Vigilance plan Vercel Hobby non-commercial

---

Rédaction de `docs/ROADMAP.md` : découpage du MVP en 4 phases séquentielles suivant l'ordre de validation du brief (section 8) — setup projet, moteur de règles/génération procédurale (Web Worker), UI de jeu minimale, test interne. Une Phase 4 "hors scope" liste explicitement ce qui n'est pas fait avant validation (formes non carrées, contraintes échecs, Supabase, PWA, LP/SEO), avec un gate bloquant avant de s'y attaquer.

**Entrées clés :**

- [BDR-002](decisions/BDR-002.md) — Roadmap MVP en 4 phases avec gate de validation

---

Exécution de la Phase 0 (setup projet) : bootstrap manuel Vite+React+TS (scaffold interactif impossible, dossier non vide), Tailwind v4 via `@tailwindcss/vite`, shadcn/ui initialisé (Base UI + preset Nova, composant Button ajouté), ESLint 9 flat config. `pnpm lint`, `pnpm build` et `pnpm dev` validés — rendu confirmé visuellement via agent-browser. `.gitignore` complété (`dist/`, `*.tsbuildinfo`, `.env*`) et `docs/ROADMAP.md` mis à jour (Phase 0 cochée). Deux frictions : TypeScript 7.x incompatible avec `typescript-eslint` (pinné en 5.9.3) et `shadcn init` nécessitant les flags `-b`/`-p` explicites pour tourner en non-interactif — patterns génériques capturés en mémoire globale (GLRN-208, GLRN-209).

**Entrées clés :**

- [BDR-003](decisions/BDR-003.md) — shadcn/ui : Base UI + preset Nova
- [ZBLK-002](archive/blockers/ZBLK-002.md) — `shadcn init` bloqué 3x en non-interactif (résolu)

---

Exécution de la Phase 1 (moteur de règles + génération) : `src/lib/engine/{types,rules,solver,generator,generateLevel.worker}.ts`, backtracking ligne par ligne pour `generateLevel(size)`, régions générées par flood-fill aléatoire, solveur dans un Web Worker (`?worker` natif Vite). Vitest ajouté pour tester le moteur hors UI (13 tests verts), `pnpm lint`/`pnpm build` validés. `docs/ROADMAP.md` : 4/5 cases Phase 1 cochées, l'indicateur de chargement reste ouvert (rendu UI, hors scope moteur — Phase 2). Ensuite, ajout d'un override ESLint scopé à `src/components/ui/**` pour désactiver `react-refresh/only-export-components` sur tout code généré par shadcn (récurrent à chaque `shadcn add`), et rappel que `vite-plugin-checker` nécessite un restart de `pnpm dev` après changement de `eslint.config.js`.

**Entrées clés :**

- [BDR-004](decisions/BDR-004.md) — architecture moteur Phase 1 (backtracking + Vitest)
- [LRN-002](learnings/LRN-002.md) — grille 3×3 insoluble (contrainte adjacence)

---

Pendant que la Phase 1 (moteur) avance en parallèle, exploration de plugins Vite pour améliorer la DX du sandbox : installation et validation de `vite-plugin-qrcode` (QR code réseau au démarrage), `vite-plugin-checker` (TS+ESLint en overlay live), `vite-plugin-mkcert` (HTTPS local auto-signé) et `rollup-plugin-visualizer` (treemap bundle, activé via `pnpm build:analyze` en mode Vite natif plutôt qu'une variable d'env). Tentative d'ajout de `unplugin-turbo-console` (logs enrichis fichier:ligne + clic-vers-éditeur) : la fonctionnalité de clic n'a jamais fonctionné malgré 3 hypothèses testées successivement (race condition port, mixed-content HTTP/HTTPS, popup blocker) — cause racine non identifiée, plugin finalement retiré et `vite-plugin-mkcert` remis actif par défaut.

**Entrées clés :**

- [BDR-005](decisions/BDR-005.md) — plugins Vite DX retenus pour le sandbox
- [ZBLK-003](archive/blockers/ZBLK-003.md) — unplugin-turbo-console abandonné (clic-vers-éditeur non fonctionnel)

---

Exécution de la Phase 2 (UI de jeu minimale) : `src/hooks/useLevel.ts` + `src/components/Grid.tsx` + `App.tsx`, grille cliquable, budget d'erreur, détection victoire/défaite, bouton "nouveau niveau" — les 5 cases de `docs/ROADMAP.md` cochées, `pnpm lint`/`build`/`test` verts, comportement vérifié à chaque étape via agent-browser. Plusieurs allers-retours de retour utilisateur ont ensuite fait évoluer le modèle d'interaction initial (clic simple = pose directe) vers un modèle plus riche : tap simple = marqueur d'aide "X" (retardé de 300ms pour éviter un flash), double-tap = pose de l'animal, glisser = peint ou efface plusieurs marqueurs selon l'état de la case de départ (technique `elementFromPoint` car le tactile capture implicitement le pointeur sur l'élément de départ). Un toggle "Aide" (`Switch` shadcn, ON par défaut) désactive marqueur et glisser, ne laissant que le double-tap actif — jamais le simple clic, pour rester cohérent avec l'esprit "pas de système d'indice" du brief. Le geste double-tap a nécessité 3 itérations avant d'être fiable : `onDoubleClick` natif s'est révélé pas toujours fiable en usage réel (remplacé par une détection manuelle par chronométrage), puis cette détection appliquait le marqueur immédiatement au 1er tap (flash visible) — corrigé en le retardant, annulable par un 2e tap rapide. Le modèle de validation des pions a aussi été revu : chaque pion gèle son statut de validité au moment de la pose (au lieu d'un recalcul continu des violations sur tout le plateau), ce qui verrouille les bonnes réponses (non retirables) et cible le rouge uniquement sur la case fautive nouvellement posée. Enfin, nettoyage d'un mélange de langues détecté dans le code : la prop/state `aide`/`setAide` renommée en `help`/`setHelp` (le libellé UI "Aide" reste en français, seul le code redevient full anglais).

**Entrées clés :**

- [BDR-006](decisions/BDR-006.md) — modèle d'interaction : tap=aide, double-tap=animal, glisser=marqueurs
- [BDR-007](decisions/BDR-007.md) — statut de validité figé par pion, rouge ciblé sur la case fautive
- [ZBLK-004](archive/blockers/ZBLK-004.md) — geste double-tap fiable, 3 itérations (résolu)

---

Correction de `tsconfig.app.json` : l'avertissement de dépréciation sur `baseUrl` a d'abord été traité par un `ignoreDeprecations: "6.0"` (silence cosmétique), avant que Baptiste ne redirige vers le vrai fix — `paths` fonctionne sans `baseUrl` depuis TS 4.1+ (résolution relative au tsconfig), donc suppression pure et simple de `baseUrl` plutôt qu'ignorer l'avertissement. Pattern déjà documenté en mémoire globale (voir aussi GLRN-011), aucune nouvelle entrée créée.

---

Session de test de gameplay réel (screenshots mobile) ayant révélé puis fait corriger un vrai bug de validation. Baptiste a perdu une partie 6×6 en pensant la configuration insoluble ; une résolution par force brute (script Python) a confirmé qu'une solution unique existait bel et bien. L'investigation du code (`rules.ts`, `useLevel.ts` via agents Explore) a montré que chaque pion gèle son statut de validité au moment de la pose (règle métier [BDR-007](decisions/BDR-007.md)) sans jamais être re-vérifié — un pion localement valide (aucun conflit à cet instant) mais absent de la solution unique restait verrouillé pour toujours, condamnant une région à devenir injouable sans recours pour le joueur ([ZBLK-005](archive/blockers/ZBLK-005.md), [LRN-003](learnings/LRN-003.md)). Sur demande explicite de Baptiste, le mécanisme a été remplacé : `togglePaw` compare désormais chaque pose directement à `level.solution` plutôt que de recalculer les conflits de règles ([BDR-008](decisions/BDR-008.md)).

Ce changement a immédiatement introduit une régression détectée par Baptiste sur le tour suivant : un niveau a été déclaré "réussi" avec un pion invalide resté sur le plateau et une colonne entière vide, parce que la condition de victoire comptait la longueur brute du tableau de pions posés au lieu du seul sous-ensemble valide ([ZBLK-006](archive/blockers/ZBLK-006.md), pattern généralisé en mémoire globale sous GLRN-216). Corrigé en filtrant sur le flag `invalid` avant de comparer à la taille de la solution. Enfin, changement UI mineur demandé par Baptiste : l'icône affichée sur une case invalide passe de `PawPrint` (rouge) à `X` (`lucide-react`, déjà utilisée pour les marqueurs d'aide), confirmé comme composant icône et non caractère texte. `pnpm lint`/`pnpm build` verts après chaque changement.

**Entrées clés :**

- [BDR-008](decisions/BDR-008.md) — validation par comparaison directe à la solution
- [ZBLK-005](archive/blockers/ZBLK-005.md) — diagnostic du dead-end (résolu)
- [ZBLK-006](archive/blockers/ZBLK-006.md) — régression faux "Niveau réussi" (résolu)
- [LRN-003](learnings/LRN-003.md) — pattern local-valid ≠ solution-valid

---

Session `/brand-creator` complète : moodboard UI de 6 directions (`docs/design/identity-moodboard.html`), puis 3 hybrides bois/pastel sur demande (`identity-moodboard-v2.html`) après que Baptiste a aimé "Atelier Feutrine" et "Plateau de Jeu" sans trancher — direction finale retenue : "Atelier Feutrine" (palette pastel corail/sauge/crème). Ajout d'un aperçu typographique (Display/Body/Mono) par direction dans les deux moodboards à la demande de Baptiste. Moodboard logo de 15 propositions généré (`logo-creation.html`), combinaison choisie : icône `Cat` + dégradé vertical H. Export en `public/icon.svg`, setup PWA complet (`vite-plugin-pwa`, `@vite-pwa/assets-generator`), assets générés puis fond blanc parasite corrigé sur le maskable ET l'apple-touch-icon ([BLK-007](blockers/BLK-007.md)). Application de la direction dans l'app : palette + polices (Fredoka/IBM Plex) écrites dans `src/index.css` avec `primary-foreground`/`accent-foreground` recalculés en brun foncé plutôt que blanc pour respecter le contraste WCAG AA sur les boutons réels ([LRN-004](learnings/LRN-004.md)), vérifié visuellement via agent-browser ([BDR-009](decisions/BDR-009.md)).

Polish itératif de l'app pour la phase POC (plusieurs allers-retours) : titre agrandi, bug de décalage de grille au message "Niveau réussi !" diagnostiqué et corrigé en fusionnant le message dans le même slot DOM que l'indicateur d'erreurs plutôt que d'ajouter un élément ([LRN-005](learnings/LRN-005.md)), nav ajoutée avec cartes "Niveau 12/Série/Défi du jour" recréées du moodboard — puis retirées sur demande explicite de Baptiste, leurs données étant statiques/factices sans système de progression réel ([LRN-006](learnings/LRN-006.md)). Nav finalisée : logo réel + liens ancres (#niveaux/#regle/#profile), `Avatar` shadcn factice en attente d'un vrai compte utilisateur, bouton d'action unique sous la grille au libellé dynamique ("Nouvelle partie" / "Rejouer"), bascule en menu hamburger sous 768px ([BDR-010](decisions/BDR-010.md)). Chaque étape vérifiée par `pnpm lint`/`pnpm build` puis test réel dans le navigateur via agent-browser (y compris déclenchement volontaire d'une défaite pour confirmer l'absence de reflow).

**Entrées clés :**

- [BDR-009](decisions/BDR-009.md) — identité visuelle "Atelier Feutrine" retenue
- [BDR-010](decisions/BDR-010.md) — structure Nav + zone de jeu finale
- [BLK-007](blockers/BLK-007.md) — apple-touch-icon fond blanc (résolu)
