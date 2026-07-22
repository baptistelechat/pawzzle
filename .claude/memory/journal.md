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

Session `/brand-creator` complète : moodboard UI de 6 directions (`docs/design/identity-moodboard.html`), puis 3 hybrides bois/pastel sur demande (`identity-moodboard-v2.html`) après que Baptiste a aimé "Atelier Feutrine" et "Plateau de Jeu" sans trancher — direction finale retenue : "Atelier Feutrine" (palette pastel corail/sauge/crème). Ajout d'un aperçu typographique (Display/Body/Mono) par direction dans les deux moodboards à la demande de Baptiste. Moodboard logo de 15 propositions généré (`logo-creation.html`), combinaison choisie : icône `Cat` + dégradé vertical H. Export en `public/icon.svg`, setup PWA complet (`vite-plugin-pwa`, `@vite-pwa/assets-generator`), assets générés puis fond blanc parasite corrigé sur le maskable ET l'apple-touch-icon ([ZBLK-007](archive/blockers/ZBLK-007.md)). Application de la direction dans l'app : palette + polices (Fredoka/IBM Plex) écrites dans `src/index.css` avec `primary-foreground`/`accent-foreground` recalculés en brun foncé plutôt que blanc pour respecter le contraste WCAG AA sur les boutons réels ([LRN-004](learnings/LRN-004.md)), vérifié visuellement via agent-browser ([BDR-009](decisions/BDR-009.md)).

Polish itératif de l'app pour la phase POC (plusieurs allers-retours) : titre agrandi, bug de décalage de grille au message "Niveau réussi !" diagnostiqué et corrigé en fusionnant le message dans le même slot DOM que l'indicateur d'erreurs plutôt que d'ajouter un élément ([LRN-005](learnings/LRN-005.md)), nav ajoutée avec cartes "Niveau 12/Série/Défi du jour" recréées du moodboard — puis retirées sur demande explicite de Baptiste, leurs données étant statiques/factices sans système de progression réel ([LRN-006](learnings/LRN-006.md)). Nav finalisée : logo réel + liens ancres (#niveaux/#regle/#profile), `Avatar` shadcn factice en attente d'un vrai compte utilisateur, bouton d'action unique sous la grille au libellé dynamique ("Nouvelle partie" / "Rejouer"), bascule en menu hamburger sous 768px ([BDR-010](decisions/BDR-010.md)). Chaque étape vérifiée par `pnpm lint`/`pnpm build` puis test réel dans le navigateur via agent-browser (y compris déclenchement volontaire d'une défaite pour confirmer l'absence de reflow).

**Entrées clés :**

- [BDR-009](decisions/BDR-009.md) — identité visuelle "Atelier Feutrine" retenue
- [BDR-010](decisions/BDR-010.md) — structure Nav + zone de jeu finale
- [ZBLK-007](archive/blockers/ZBLK-007.md) — apple-touch-icon fond blanc (résolu)

---

Lancement de la Phase 4 (animations + sound design différé). Sweep `/find-animation-opportunities` sur le code existant : 4 opportunités retenues (crossfade victoire/défaite, entrée du contenu de niveau, menu mobile qui grandit depuis son déclencheur, pop de pose de pion), plusieurs rejetées explicitement (drag de marqueurs, compteur d'erreurs, hover nav — trop fréquents ou déjà couverts). `/improve-animations plan` a écrit 6 plans dans `docs/plans/` (dont un plan 001 de setup `motion` + tokens centralisés, sur demande explicite de Baptiste, et un plan 006 haptics avec `web-haptics`, exploré au-delà de victoire/défaite jusqu'au switch Aide et au bouton Nouvelle partie). `/improve-animations execute` a implémenté les 6 plans via subagents parallèles (fichiers disjoints) puis séquentiels (dépendances), lint/build/tests verts, vérifié en navigateur réel (agent-browser), puis `docs/plans/` archivé (statuts marqués DONE).

Plusieurs bugs remontés par Baptiste en test réel ont suivi, tous corrigés : icône d'échec devenue minuscule ([LRN-007](learnings/LRN-007.md), wrapper `motion.span` sans taille explicite), case fautive qui pouvait être retirée puis reposée en recomptant une erreur (révision de [BDR-007](decisions/BDR-007.md) — verrouillage étendu aux poses fautives), haptique de victoire jugée trop faible (pattern custom, réutilisé pour toute pose correcte, [BDR-013](decisions/BDR-013.md)), vibrations pas toujours jouées (3 instances `useWebHaptics()` indépendantes pilotant le même `navigator.vibrate()` global, [LRN-010](learnings/LRN-010.md), consolidées en singleton `src/lib/haptics.ts`). Le bug le plus coûteux : "Nouvelle partie" bloqué indéfiniment, d'abord mal diagnostiqué comme un échec silencieux du Worker de génération ([LRN-008](learnings/LRN-008.md), fix appliqué mais insuffisant — Baptiste a rapporté "aucun changement"), puis reproduit en Chrome headless (donc pas mobile-spécifique) et tracé jusqu'à `AnimatePresence mode="wait"` qui se bloquait sur des transitions plus rapides que sa propre durée ([ZBLK-008](archive/blockers/ZBLK-008.md), [LRN-009](learnings/LRN-009.md)) — fix : `mode="popLayout"`. Trois de ces learnings mirés en mémoire globale (GLRN-217/218/219), suffisamment génériques pour tout projet React/motion. Session terminée par du polish UI (bouton "Nouvelle partie"/"Rejouer" agrandi à la largeur de la grille et la hauteur du titre, icônes `PawPrint`/`RotateCcw`).

**Entrées clés :**

- [BDR-012](decisions/BDR-012.md) — motion centralisé (LazyMotion + tokens)
- [BDR-013](decisions/BDR-013.md) — haptique de pose correcte = pattern de victoire
- [ZBLK-008](archive/blockers/ZBLK-008.md) — "Nouvelle partie" bloqué, mauvais diagnostic puis vraie cause (résolu)
- [LRN-009](learnings/LRN-009.md) — `AnimatePresence mode="wait"` en race condition

---

Session de polish sur la direction "Atelier Feutrine" ([BDR-009](decisions/BDR-009.md)) : cases de grille passées d'un `rounded-md` classique à un rendu squircle (`rounded-[28%]` + `corner-shape:squircle`, progressive enhancement Chrome/Edge — [BDR-014](decisions/BDR-014.md), [LRN-013](learnings/LRN-013.md)), puis ajout d'une animation d'entrée en vague diagonale sur les cases (fade + scale, stagger par `row+col`).

La demande suivante — une animation de sortie puis entrée sur "Nouvelle partie"/"Rejouer" — a déclenché une investigation en plusieurs manches. `mode="popLayout"` (hérité du fix [ZBLK-008](archive/blockers/ZBLK-008.md)) laissait sortie et entrée se jouer en parallèle ; passer à `mode="wait"` n'a rien changé côté visible. Plutôt que deviner depuis le code, instrumentation réelle du navigateur via agent-browser (`MutationObserver` + échantillonnage d'opacité en `requestAnimationFrame`, déclenchés dans le même appel JS que le clic pour éviter la latence inter-commande — [LRN-014](learnings/LRN-014.md)) : verdict, la grille ne remontait **jamais** (0 mutation DOM), le panneau parent gardant une clé statique `"level"` alors que le Worker répond plus vite qu'un cycle de rendu observable ([LRN-011](learnings/LRN-011.md)). Fix : `Grid` clé par un compteur `levelId` dédié dans sa propre `AnimatePresence`, découplée du statut loading ([BDR-015](decisions/BDR-015.md)) — trace d'opacité confirmant sortie 1→0 puis entrée 0→1. Un dernier aller-retour a suivi : `initial={false}` recopié sur cette nouvelle `AnimatePresence` supprimait l'animation au tout premier chargement de l'app (fonctionnait seulement sur les relances) — `initial={false}` ne s'applique qu'au premier rendu de SON instance, pas de l'app entière ([LRN-012](learnings/LRN-012.md)). Retiré, revérifié à froid via un script d'init agent-browser enregistré avant navigation ([ZBLK-009](archive/blockers/ZBLK-009.md)). `pnpm lint`/`pnpm build` verts après chaque étape.

**Entrées clés :**

- [BDR-015](decisions/BDR-015.md) — Grid remonté via `levelId` dédié, découplé du statut loading
- [ZBLK-009](archive/blockers/ZBLK-009.md) — animation sortie/entrée grille invisible puis perte au 1er chargement (résolu)
- [LRN-011](learnings/LRN-011.md) — clé statique `AnimatePresence` jamais remontée si l'async est plus rapide qu'un rendu observable

---

Préparation du sound design de la Phase 4 (en parallèle d'une autre session de travail sur le projet) : liste de 12 sons à trouver rédigée avec descriptions ciblées sur l'esthétique "Atelier Feutrine" ([BDR-009](decisions/BDR-009.md)), documentée dans `docs/sound-design/SOUND_DESIGN.md` avec les sites de sourcing recommandés (Kenney CC0 pour l'UI générique, Freesound filtré CC0 pour les sons signature). Baptiste ayant proposé de piocher dans deux packs Kenney puis compléter manuellement, mise en place de la convention de nommage/emplacement (`public/sounds/`, nom de fichier = ID du son) et de l'outillage de conversion : script `pnpm sounds:normalize` scannant `public/sounds/` pour convertir tout format brut en `.mp3` et réencoder les mp3 déjà présents avec les mêmes réglages (mono, 44.1kHz), via `ffmpeg-static` (binaire embarqué, pas de dépendance système). Un blocage pnpm est survenu à l'installation — `ffmpeg-static` build-scripté ignoré silencieusement — résolu en l'ajoutant à `onlyBuiltDependencies` dans `pnpm-workspace.yaml` (même pattern que GLRN-135, déjà rencontré avec `sharp`). Script testé (round-trip `.wav` → `.mp3`, réencodage en place d'un `.mp3` existant).

**Entrées clés :**

- [BDR-016](decisions/BDR-016.md) — pipeline sons Phase 4 : `public/sounds/` + normalisation `ffmpeg-static`
- [ZBLK-010](archive/blockers/ZBLK-010.md) — build script `ffmpeg-static` ignoré par pnpm (résolu)

## 2026-07-22

Implémentation du son de la Phase 4 (les fichiers `.mp3` étant ajoutés par Baptiste au fur et à mesure, en parallèle de l'implémentation) : `src/lib/sounds.ts` créé sur le modèle singleton de `haptics.ts`, préchargement silencieux des 12 sons listés dans `SOUND_DESIGN.md` (un fichier absent ne bloque rien), branché dans tous les points d'appel déjà identifiés pour l'haptique (`useLevel.ts`, `App.tsx`, `Nav.tsx`, `Grid.tsx`) — décision d'architecture actée en [BDR-017](decisions/BDR-017.md) : Web Audio API pour les SFX one-shot (superposition possible, gain réglable), `<audio loop>` natif pour l'ambiance (flux unique, pas besoin de la complexité Web Audio).

Plusieurs allers-retours de test réel ont suivi, chacun corrigé :

- Volume perçu bien plus fort que le fichier source → `GainNode` maître ajouté (Web Audio ne normalise pas le loudness contrairement à un lecteur média classique).
- Latence perçue entre le tap et l'apparition du marqueur/son → identifiée comme un délai artificiel de 300ms (comptage tap/double-tap hérité de Phase 2, [BDR-006](decisions/BDR-006.md)) ; réduire à 0ms a réintroduit un flash visuel croix→patte sur un vrai double-tap, un compromis à 180ms a atténué sans éliminer un bug de fond (double-tap trop lent = pose puis retrait du marqueur). Remplacement complet du geste sur demande de Baptiste : tap = marqueur immédiat, appui long (450ms) = animal, glisser = chaîne inchangée ([BDR-018](decisions/BDR-018.md), [BLK-011](blockers/BLK-011.md)).
- Son `new_game` jamais joué au 1er chargement, mal synchronisé avec l'animation d'apparition de la grille sur les relances → calé sur la fin réelle de l'animation (constantes `CELL_TRANSITION_MS`/`CELL_STAGGER_MS` exportées de `Grid.tsx`), puis totalement retiré du tout premier niveau auto-généré au montage (un futur écran de démarrage remplacera ce lancement automatique, donc plus la peine de le gérer).
- Musique d'ambiance jamais audible sur mobile alors qu'elle fonctionnait en test desktop → déverrouillage attaché à `pointerdown`, non accepté par Safari/iOS comme geste valide (seul un événement de fin de geste l'est) ; passage à `pointerup` ([BLK-012](blockers/BLK-012.md)). Tentative de piste "autoplay muet + démute au 1er geste" explorée puis abandonnée sur retour de Baptiste (n'apporte rien puisque le son ne peut de toute façon pas être audible avant interaction) ; question sur un contournement via clic JS synthétique sur un div invisible également écartée (événements non-`isTrusted` explicitement ignorés par les navigateurs).
- Gain individuel poussé jusqu'à 3x sur les sons jugés trop discrets sans aucune amélioration perçue → diagnostic : écrêtage numérique (sortie bornée à ±1.0), un gain plus élevé au-delà de ce seuil n'ajoute que de la distorsion. Fix : `DynamicsCompressorNode` inséré dans la chaîne, `GAIN_OVERRIDES` étendu à tous les sons (réglable individuellement) sur demande de Baptiste.

`pnpm lint`/`pnpm build`/`tsc -b` vérifiés verts après chaque changement (le hook `rtk` local pointant vers un ESLint global cassé, contourné en appelant `./node_modules/.bin/eslint` directement).

Rituel `/memory-close` : proposition initiale de créer des paires locale+globale pour chaque learning générique (pattern déjà suivi en session précédente, LRN-007/008/009 + GLRN-217/218/219) corrigée par Baptiste — un learning de portée globale ne doit avoir qu'une seule entrée (`GLRN-XXX`), pas de doublon local, les index globaux étant déjà lus à chaque démarrage de session quel que soit le projet. Feedback sauvegardé dans la mémoire agent transverse pour les prochains rituels.

**Entrées clés :**

- [BDR-017](decisions/BDR-017.md) — architecture son : Web Audio API (SFX) + `<audio loop>` natif (ambiance)
- [BDR-018](decisions/BDR-018.md) — modèle d'interaction remplacé : tap=marqueur immédiat, appui long=animal
- [BLK-011](blockers/BLK-011.md) — latence/flash du marqueur, 3 itérations (résolu)
- [BLK-012](blockers/BLK-012.md) — ambiance jamais audible sur mobile (résolu)
- [BLK-013](blockers/BLK-013.md) — gain à 3x sans effet perçu, écrêtage (résolu)
