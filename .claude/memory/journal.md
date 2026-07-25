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
- Latence perçue entre le tap et l'apparition du marqueur/son → identifiée comme un délai artificiel de 300ms (comptage tap/double-tap hérité de Phase 2, [BDR-006](decisions/BDR-006.md)) ; réduire à 0ms a réintroduit un flash visuel croix→patte sur un vrai double-tap, un compromis à 180ms a atténué sans éliminer un bug de fond (double-tap trop lent = pose puis retrait du marqueur). Remplacement complet du geste sur demande de Baptiste : tap = marqueur immédiat, appui long (450ms) = animal, glisser = chaîne inchangée ([BDR-018](decisions/BDR-018.md), [ZBLK-011](archive/blockers/ZBLK-011.md)).
- Son `new_game` jamais joué au 1er chargement, mal synchronisé avec l'animation d'apparition de la grille sur les relances → calé sur la fin réelle de l'animation (constantes `CELL_TRANSITION_MS`/`CELL_STAGGER_MS` exportées de `Grid.tsx`), puis totalement retiré du tout premier niveau auto-généré au montage (un futur écran de démarrage remplacera ce lancement automatique, donc plus la peine de le gérer).
- Musique d'ambiance jamais audible sur mobile alors qu'elle fonctionnait en test desktop → déverrouillage attaché à `pointerdown`, non accepté par Safari/iOS comme geste valide (seul un événement de fin de geste l'est) ; passage à `pointerup` ([ZBLK-012](archive/blockers/ZBLK-012.md)). Tentative de piste "autoplay muet + démute au 1er geste" explorée puis abandonnée sur retour de Baptiste (n'apporte rien puisque le son ne peut de toute façon pas être audible avant interaction) ; question sur un contournement via clic JS synthétique sur un div invisible également écartée (événements non-`isTrusted` explicitement ignorés par les navigateurs).
- Gain individuel poussé jusqu'à 3x sur les sons jugés trop discrets sans aucune amélioration perçue → diagnostic : écrêtage numérique (sortie bornée à ±1.0), un gain plus élevé au-delà de ce seuil n'ajoute que de la distorsion. Fix : `DynamicsCompressorNode` inséré dans la chaîne, `GAIN_OVERRIDES` étendu à tous les sons (réglable individuellement) sur demande de Baptiste.

`pnpm lint`/`pnpm build`/`tsc -b` vérifiés verts après chaque changement (le hook `rtk` local pointant vers un ESLint global cassé, contourné en appelant `./node_modules/.bin/eslint` directement).

Rituel `/memory-close` : proposition initiale de créer des paires locale+globale pour chaque learning générique (pattern déjà suivi en session précédente, LRN-007/008/009 + GLRN-217/218/219) corrigée par Baptiste — un learning de portée globale ne doit avoir qu'une seule entrée (`GLRN-XXX`), pas de doublon local, les index globaux étant déjà lus à chaque démarrage de session quel que soit le projet. Feedback sauvegardé dans la mémoire agent transverse pour les prochains rituels.

**Entrées clés :**

- [BDR-017](decisions/BDR-017.md) — architecture son : Web Audio API (SFX) + `<audio loop>` natif (ambiance)
- [BDR-018](decisions/BDR-018.md) — modèle d'interaction remplacé : tap=marqueur immédiat, appui long=animal
- [ZBLK-011](archive/blockers/ZBLK-011.md) — latence/flash du marqueur, 3 itérations (résolu)
- [ZBLK-012](archive/blockers/ZBLK-012.md) — ambiance jamais audible sur mobile (résolu)
- [ZBLK-013](archive/blockers/ZBLK-013.md) — gain à 3x sans effet perçu, écrêtage (résolu)

## 2026-07-23

Ajout d'un feedback visuel pour l'appui long (pose de l'animal, [BDR-018](decisions/BDR-018.md)) dans `Grid.tsx` : un cercle de progression SVG (`strokeDashoffset` animé via `motion/react`) apparaît autour de la case pressée pendant les 450ms de `LONG_PRESS_MS`, et se coupe immédiatement si le geste est relâché avant terme ([BDR-019](decisions/BDR-019.md)).

Deux allers-retours de test réel ont suivi, tous deux corrigés :

- Le cercle flashait sur un simple tap ou un début de glisser destiné à poser plusieurs marqueurs en chaîne → ajout d'un délai d'apparition purement visuel (`RING_APPEAR_DELAY_MS`, 120ms), sans toucher à `LONG_PRESS_MS` ; la durée d'animation restante du cercle est recalculée (`450 - 120ms`) pour finir exactement au moment où le pion se pose.
- Le cercle restait malgré tout visible pendant un glisser plus lent → diagnostic : l'annulation de l'appui long ne se déclenchait qu'au changement de case et uniquement en mode aide (`help`), un glisser lent pouvant dépasser 120ms tout en restant dans la case de départ ([ZBLK-014](archive/blockers/ZBLK-014.md)). Fix généralisable : seuil de distance en pixels (10px) sur le déplacement réel du pointeur depuis `pointerdown`, indépendant de `help` et du changement de case ([LRN-015](learnings/LRN-015.md)).

`pnpm lint`/`pnpm build` vérifiés verts après chaque changement (toujours via `./node_modules/.bin/` directement, le hook `rtk` pointant vers un ESLint global cassé — problème d'environnement déjà connu, non ré-ouvert).

Rituel `/memory-close` : 3 blockers résolus de la session précédente, jamais archivés, archivés maintenant vers `archive/blockers/` (leurs numéros d'alors — 11, 12, 13 — ont été réattribués à l'archivage puis réutilisés par des blockers ultérieurs sans rapport ; se référer aux `ZBLK-` de l'index archive). Sur demande explicite de Baptiste ("full local"), le learning de cette session a été gardé en local (`LRN-015`) plutôt que promu en mémoire globale (`GLRN-`) malgré sa généralité potentielle.

**Entrées clés :**

- [BDR-019](decisions/BDR-019.md) — cercle de progression de l'appui long
- [ZBLK-014](archive/blockers/ZBLK-014.md) — flash du cercle pendant un glisser, 2 itérations (résolu)
- [LRN-015](learnings/LRN-015.md) — seuil de distance pixel > franchissement de case pour distinguer tap/glisser

---

Session démarrée sur une question hors-sujet (recherche de playlists lofi en streaming) reclarifiée en tâche projet : Baptiste voulait plusieurs pistes d'ambiance jouées dans le jeu en ordre aléatoire, pas une recommandation de playlists externes. L'existant (`src/lib/sounds.ts`) ne jouait qu'un seul `ambient.mp3` en boucle native (`<audio loop>`, [BDR-017](decisions/BDR-017.md)).

Implémentation d'une vraie playlist : historique navigable (précédent/suivant, sans répéter la piste précédente), fade séquentiel (pas de vrai crossfade — un seul `<audio>`) amorcé juste avant la fin naturelle de chaque piste. Baptiste ayant déposé 34 pistes lofi Pixabay (`alex-morgan-*.mp3`) dans un dossier `public/sounds/ambient/` dédié (séparé des SFX), le script `pnpm sounds:normalize` a été étendu pour scanner récursivement `public/sounds/` et générer un `manifest.json` listant les pistes disponibles — `sounds.ts` charge ce manifest au lieu d'un tableau codé en dur ([BDR-020](decisions/BDR-020.md)). Le fichier source `ambient.wav` (22 Mo, déjà converti) a été déplacé vers `docs/sound-design/` plutôt que supprimé, sur demande explicite de Baptiste, en respectant la convention existante (sources brutes hors `public/`, [BDR-016](decisions/BDR-016.md)).

Construction d'un mini-player "radio" flottant (`AmbientPlayer`) : titre/auteur (parsé du nom de fichier) + minuteur `mm:ss`, disque vinyle animé (rotation en lecture, figé en pause), précédent/lecture-pause/suivant/mute. Plusieurs itérations infructueuses ont suivi sur deux fronts, chacune signalée "aucun changement" par Baptiste :

- Popover volume au survol du bouton mute (Base UI `openOnHover` + filtrage de la raison `"trigger-press"` pour ne pas ouvrir au clic) → bug où déplacer le slider réactivait le son coupé, plus des interactions hover/clic ambiguës sur le même bouton.
- Animation de largeur de la pilule au changement de piste → plusieurs approches Motion tentées (`layout`, `layout="position"`, `mode="popLayout"` vs `"wait"`) sans transition satisfaisante ; cause identifiée après coup : `layout="position"` anime **uniquement** la position, jamais la taille — l'exact inverse de l'effet recherché ([LRN-016](learnings/LRN-016.md)).

Sur directive explicite de Baptiste ("on va faire plus simple"), les deux fronts ont été résolus par simplification plutôt que par correction : popover retiré entièrement (mute simple au clic conservé, réglage volume/haptique reporté à un futur menu "Son / Vibration" noté dans `docs/ROADMAP.md`), largeur de la pilule fixée sur celle de la grille de jeu (`w-[calc(100%-2rem)] max-w-md`) au lieu d'être animée dynamiquement. Une animation de sortie/entrée du disque vinyle (glisser+rotation, `AnimatePresence mode="wait"`) a été ajoutée pour simuler un changement de disque et compenser l'abandon du redimensionnement animé ([BDR-021](decisions/BDR-021.md), [ZBLK-015](archive/blockers/ZBLK-015.md)).

`pnpm lint`/`pnpm build` vérifiés verts après chaque changement significatif. Deux composants shadcn (`popover`, `slider`) ajoutés puis retirés dans la même session, aucune trace résiduelle (fichiers supprimés, imports nettoyés).

Rituel `/memory-close` : sur demande explicite de Baptiste ("full local"), les deux learnings de cette session ([LRN-016](learnings/LRN-016.md), [LRN-017](learnings/LRN-017.md)) ont été gardés en local plutôt que promus en mémoire globale (`GLRN-`), malgré leur généralité potentielle — cohérent avec la préférence déjà actée en session précédente.

**Entrées clés :**

- [BDR-020](decisions/BDR-020.md) — playlist ambient via manifest.json généré
- [BDR-021](decisions/BDR-021.md) — AmbientPlayer : largeur fixe, mute simple, volume reporté
- [ZBLK-015](archive/blockers/ZBLK-015.md) — itérations UI infructueuses (largeur, mute), résolues par simplification
- [LRN-016](learnings/LRN-016.md) — `layout="position"` (Motion) anime seulement la position
- [LRN-017](learnings/LRN-017.md) — manifest généré au build > liste codée en dur

---

Session reprise après `/clear` sur deux demandes successives de Baptiste. D'abord un nettoyage de layout : navbar (`Nav.tsx`) masquée sans être supprimée, logo replacé à côté du titre au-dessus de la grille, `AmbientPlayer` sorti de son `position: fixed` flottant pour devenir un vrai `<footer>` en flux ([BDR-022](decisions/BDR-022.md)). Vérifié visuellement via `agent-browser` (screenshot) après build/lint verts (`./node_modules/.bin/eslint`/`tsc -b`/`vite build`, le hook `rtk` pointant toujours vers un ESLint global cassé — contournement déjà connu).

Deux régressions signalées juste après livraison, chacune corrigée en une passe :

- Le cercle de progression de l'appui long ([BDR-019](decisions/BDR-019.md)) se relançait sur une case déjà figée (pion correct ou en erreur) alors que `togglePaw`/`toggleMarker` y étaient des no-op silencieux par design ([BDR-007](decisions/BDR-007.md)) — fix : garde `if (pawn) return;` en tête de `onPointerDown` dans `Grid.tsx`, avant même de démarrer le timer.
- Le passage de l'`AmbientPlayer` en footer statique poussait la grille vers le haut à son apparition (`<main>` en `flex-1 justify-center` recalculant son espace disponible) — fix : `min-h-20` sur le `<footer>`, hauteur réservée en permanence qu'il soit peuplé ou non.

Les deux fixes ont chacun été résolus en une seule itération, aucun n'a nécessité de diagnostic prolongé — pas de blocker créé pour cette session.

Rituel `/memory-close` : `BLK-015` (résolu, session concurrente précédente non encore archivée) archivé vers [ZBLK-015](archive/blockers/ZBLK-015.md) en étape 1bis. Les deux learnings de cette session ont été jugés 🌍 globaux (patterns React/CSS et UX génériques, sans lien avec Pawzzle spécifiquement) et classés uniquement en `GLRN-`, sans doublon local — conforme à la règle actée précédemment.

**Entrées clés :**

- [BDR-022](decisions/BDR-022.md) — layout épuré : navbar masquée, logo+titre, footer à hauteur réservée

---

Bug remonté par Baptiste sur la radio d'ambiance : le fondu sortant de 3s en fin de piste fonctionnait bien, mais la piste suivante démarrait en silence total — le temps affiché avançait normalement, sans aucun son. Plutôt que de deviner depuis le code (plusieurs hypothèses statiques explorées sans certitude — course entre `cancelAnimationFrame` et une nouvelle boucle, event `ended` interrompant un fondu sortant en cours), diagnostic en direct via `agent-browser` : exposition temporaire de l'`<audio>` sur `window`, sondage en boucle (`eval --stdin`) et `console.log` temporaires dans `fadeVolumeTo`/`loadAmbientTrack`/l'event `ended`. Preuve obtenue : le fondu entrant démarrait bien (`fadeVolumeTo` appelée) mais son tout premier `requestAnimationFrame` ne se déclenchait jamais, alors qu'un `requestAnimationFrame` indépendant lancé au même moment depuis la console fonctionnait normalement sur la même page. Une première piste de correction (`setTimeout(fn, 0)` pour découpler l'appel du call stack synchrone de l'event `ended`) a été testée et n'a rien changé. Le vrai fix : attendre la résolution de la promesse `ambient.play()` avant de lancer le fondu (`ambient.play().then(() => fadeVolumeTo(...))`), confirmé fonctionnel par un nouveau test en direct ([ZBLK-016](archive/blockers/ZBLK-016.md), [LRN-018](learnings/LRN-018.md)). ESLint local (`./node_modules/.bin/eslint`) vert ; le hook `rtk` reste cassé (ESLint global désynchronisé, problème d'environnement déjà connu, non ré-ouvert).

Rituel `/memory-close` : sur "ok" sans réponse explicite à la question posée, LRN-018 conservé en 🏠 local (cohérent avec la préférence "full local" déjà actée sur ce projet) plutôt que promu en `GLRN-`.

**Entrées clés :**

- [ZBLK-016](archive/blockers/ZBLK-016.md) — piste suivante silencieuse après transition naturelle (résolu)
- [LRN-018](learnings/LRN-018.md) — fondu `requestAnimationFrame` bloqué si lancé juste après `.play()`

## 2026-07-24

Grosse session sur le retour visuel des erreurs/victoire, en plusieurs allers-retours avec Baptiste. Point de départ : remplacer le texte "Erreurs x/3" par une rangée de `Heart`/`HeartCrack` animée (`HeartsRow.tsx`). Puis, sur demande, ajout d'une secousse de la grille à chaque erreur (`useAnimation` + comparaison à l'erreur précédente), d'un burst de confettis à la victoire (`ConfettiBurst.tsx`, pattes de chat colorées), d'un tremblement continu sur le dernier cœur restant, de la désactivation de la grille après fin de partie, et de l'affichage de la solution en cas d'échec.

`Grid.tsx` a explosé à 339 lignes avec ces ajouts (limite du projet : 200/composant) — éclaté en `Grid/index.tsx` (orchestrateur, 122 lignes), `Grid/components/CellContent.tsx` et `PressRing.tsx` (présentation pure), et `hooks/useGridGestures.ts` (state machine tap/glisser/appui long + secousse, 214 lignes — acceptable hors composant). Généralisé en GLRN-229 (global).

Plusieurs tours de feedback ont suivi :

- Bordure verte de la solution qui fuyait vers les cases déjà trouvées par le joueur → fix : condition `!pawn` manquante dans le calcul de `isSolutionCell`. Halo `bg-background` derrière l'icône jugé inutile, retiré. Couleur `--accent` du design system jugée trop pâle sur les régions pastel vertes → remplacée par `emerald-600`/`emerald-400` saturé, patte remplie (voir [BDR-023](decisions/BDR-023.md)).
- Le cercle de progression de l'appui long réapparaissait pendant un glisser lent — récidive de [ZBLK-014](archive/blockers/ZBLK-014.md) dont le seuil de 10px s'est révélé insuffisant. Ajout d'un second seuil dédié plus petit (4px), qui cache le cercle sans affecter l'annulation réelle de l'appui long ([ZBLK-017](archive/blockers/ZBLK-017.md)).
- Le tremblement du dernier cœur ne s'affichait jamais malgré une logique correcte (vérifiée via un attribut `data-debug-*` temporaire) — cause trouvée par inspection directe du DOM (`getComputedStyle(...).transform` figé à `"none"` en boucle via `agent-browser eval`) : `animate={undefined}` n'est pas détecté comme un changement vers un objet de keyframes plus tard. Fix : toujours passer un objet `animate` défini ([ZBLK-018](archive/blockers/ZBLK-018.md), généralisé en GLRN-228 global). Baptiste a aussi demandé un tremblement en scale seul, sans rotation.
- L'animation d'entrée des cœurs ne rejouait pas sur "Nouvelle partie" en cours de partie. Un premier fix (retirer `initial={false}`) n'a rien changé — la vraie cause était déjà documentée pour `Grid` dans [BDR-015](decisions/BDR-015.md)/[LRN-011](learnings/LRN-011.md)/[LRN-012](learnings/LRN-012.md) (statut `"loading"` trop éphémère pour être peint, donc jamais de remount) mais n'avait pas été appliquée à `HeartsRow` — fix : `key={levelId}` ([ZBLK-019](archive/blockers/ZBLK-019.md)), même pattern que `Grid`.
- Confettis jugés peu visibles (burst radial depuis le centre, trop de vide en haut d'écran) → redesign en pluie depuis le haut de l'écran (spawn aléatoire en largeur, chute jusqu'au bas du viewport), particules plus grosses et plus nombreuses (28→56), durée allongée (1.1s→~2s).

Au passage, un bug ESLint (`react-hooks/purity` interdit `Math.random()` même dans `useMemo`) a forcé un passage en initialisation paresseuse `useState(() => ...)` pour le tirage aléatoire des confettis — généralisé en GLRN-227 (global), en complément de GLRN-214 (global) déjà connu.

Baptiste a demandé de ne plus lancer de tests navigateur automatiques en fin de tâche ("je m'occupe de regarder à chaque fois") — préférence de collaboration à respecter dorénavant sur ce projet.

Rituel `/memory-close` : archivage de l'ancien `BLK-002` (piste audio silencieuse, déjà résolu, jamais archivé) vers `ZBLK-016` en étape 1bis — collision de numéro évitée avec le `ZBLK-002` déjà existant (numérotation active repartie de 1 après une purge antérieure).

**Entrées clés :**

- [BDR-023](decisions/BDR-023.md) — style de révélation de solution (bordure+patte vert saturé)
- [ZBLK-017](archive/blockers/ZBLK-017.md) — récidive du cercle de glisser, seuil ZBLK-014 insuffisant (résolu)
- [ZBLK-018](archive/blockers/ZBLK-018.md) — tremblement du dernier cœur invisible (`animate={undefined}`) (résolu)
- [ZBLK-019](archive/blockers/ZBLK-019.md) — entrée des cœurs ne rejouait pas sur nouvelle partie (résolu)

---

Bug remonté par Baptiste : la musique d'ambiance restait muette au changement de piste sur mobile uniquement (temps affiché avançant normalement, sans aucun son), reproduit sur le build Vercel de la branche `development`. Dans `goToAmbientTrack` (`src/lib/sounds.ts`), le swap de piste passait par un fondu sortant puis un `window.setTimeout(() => loadAmbientTrack(track), 300)` — hypothèse initiale posée sans vérifier la plateforme réelle (règle iOS Safari de perte du geste utilisateur, GLRN-222), invalidée par Baptiste qui testait sur Android. Fix appliqué malgré tout valide : suppression du `setTimeout`, `loadAmbientTrack` appelé directement dans le tick du clic — confirmé fonctionnel par Baptiste après test réel sur son téléphone Android, mécanisme exact du délai non ré-instrumenté pour être confirmé avec certitude. `pnpm lint`/`pnpm build` vérifiés verts après le fix.

Rituel `/memory-close` : 3 blockers résolus de la session précédente (BLK-002/003/004, cercle de glisser/tremblement de cœur/remount cœurs) archivés vers `ZBLK-017/018/019` (collision de numéro avec les `ZBLK-002/003/004` déjà existants, repris depuis le max archive courant `ZBLK-016`). Sur confirmation explicite de Baptiste ("le mieux est de rester en local"), `LRN-019` et `BLK-005` de cette session gardés en 🏠 local plutôt que promus en mémoire globale — cohérent avec la préférence "full local" déjà actée sur ce projet, renforcée ici par l'incertitude sur le mécanisme exact.

**Entrées clés :**

- [LRN-019](learnings/LRN-019.md) — `.play()` différé via `setTimeout` : symptôme résolu, mécanisme mobile non confirmé
- [ZBLK-020](archive/blockers/ZBLK-020.md) — musique de piste suivante inaudible sur mobile (Android), diagnostic initial erroné (résolu)

---

Ajout d'un compteur de pattes de chat trouvées (`PawCounter.tsx`, icône + `x/6`) à côté des cœurs de vie, sur demande de Baptiste. Plusieurs allers-retours de polish : repositionnement (compteur à gauche, cœurs au centre), alignement des valeurs d'animation entre le chiffre trouvé et `/6`, avant deux blocages plus consistants.

Premier blocage : après un clic sur "Nouvelle partie", deux instances de `PawCounter` restaient affichées côte à côte en permanence ("0/6 0/6"), sans que `HeartsRow` (juste à côté, même pattern de clé `key={levelId}`) ne soit affecté. Deux hypothèses fausses explorées sans effet (nesting `AnimatePresence mode="popLayout"` imbriqué, wrapper `m.div` racine) — Baptiste a explicitement demandé d'arrêter de déléguer la vérification à des agents en arrière-plan (tués/peu fiables dans cet environnement pour ce type de debug DOM en direct) et de reprendre en direct. Root cause trouvée en inspectant les fibres React réelles des deux nœuds dupliqués puis en testant par bissection (remplacement de `PawCounter` par un `<span>` trivial à la même position, qui dupliquait aussi) : `PawCounter` et `HeartsRow` partageaient la MÊME valeur de clé (`key={levelId}`) en tant que frères — une collision de clé sibling que React ne gère pas proprement ([ZBLK-021](archive/blockers/ZBLK-021.md), généralisé en GLRN-230 global). Fix : clés préfixées par composant (`paw-${levelId}` / `hearts-${levelId}`).

Second blocage, juste après : l'animation d'entrée du compteur (scale+fade) ne jouait plus du tout au relancement d'une partie, malgré une structure `AnimatePresence` par sous-élément identique à celle de `HeartsRow`. Cause : aucune de ces `AnimatePresence` imbriquées ne fixait explicitement sa propre valeur de `initial` — l'ancêtre `AnimatePresence initial={false}` du panneau de statut (`App.tsx`) propage ce `false` via contexte à tout descendant qui ne définit pas le sien, même sans jamais l'avoir écrit localement ([ZBLK-022](archive/blockers/ZBLK-022.md), généralisé en GLRN-231 global, complète [LRN-012](learnings/LRN-012.md) qui couvrait la copie explicite par réflexe plutôt que l'héritage silencieux). Fix : `initial` explicite sur chaque `AnimatePresence` imbriquée du composant. Vérifié par échantillonnage `requestAnimationFrame` d'opacité/transform en direct dans le navigateur (agent-browser, appelé en Bash direct plutôt que via agent délégué).

Convention actée pour les futurs mini-composants stats du projet : [BDR-024](decisions/BDR-024.md).

**Entrées clés :**

- [BDR-024](decisions/BDR-024.md) — PawCounter : clé de remount préfixée + `initial` explicite
- [ZBLK-021](archive/blockers/ZBLK-021.md) — doublon DOM permanent, collision de clé sibling (résolu)
- [ZBLK-022](archive/blockers/ZBLK-022.md) — animation d'entrée absente, héritage `initial` silencieux (résolu)

## 2026-07-25

Longue session de construction de deux nouveaux panneaux demandés par Baptiste : réglages audio/vibration et explication illustrée des 3 règles du jeu. Recherche initiale via un agent Explore pour cartographier l'existant (`sounds.ts`, `haptics.ts`, composants shadcn disponibles) avant de planifier en mode plan, puis implémentation validée ([BDR-025](decisions/BDR-025.md)) : `settings.ts` en singleton + `useSyncExternalStore` + `localStorage`, exactement le pattern déjà utilisé pour l'ambiant ; `SettingsDialog` (vibrations/sons/ambiance en toggles icônes, gros, variant `icon-xl` ajouté à `buttonVariants` pour favoriser le réemploi) et `RulesDialog` (3 mini-grilles 3×3 statiques réutilisant le style visuel de `Grid`).

Nombreux allers-retours de polish sur plusieurs messages successifs : icône engrenage correcte (`Settings`, pas `Settings2` qui est en fait un icône de curseurs), style Switch/Slider retravaillé façon "jeu mobile" (piste épaisse, dégradé, poignée bordée), sliders de volume finalement retirés après une première implémentation — Baptiste a jugé que le mix son est déjà calibré et qu'un curseur exposé au joueur risque de dégrader l'expérience ([BDR-026](decisions/BDR-026.md)). Couleurs des mini-grilles de règles réajustées pour utiliser les 6 couleurs de région du jeu plutôt qu'un gris neutre. Boutons Réglages/Règles déplacés à plusieurs reprises (topbar → ligne du compteur avec `Separator` → de retour à côté du titre, en `flex-col`, masqués tant que le premier niveau n'est pas chargé) au fil des retours de Baptiste.

Deux diagnostics de layout ont suivi un signalement direct de Baptiste ("la grid n'est plus exactement au centre") :

- La grille se décalait du centre réel de l'écran dès qu'un contenu asymétrique (le texte d'instructions ajouté sous le bouton) alourdissait le dessous par rapport au dessus dans le bloc `flex-col justify-center` englobant — comportement généralisé en [LRN-020](learnings/LRN-020.md) (lié à GLRN-225 déjà en mémoire, mais mécanisme distinct : poids interne du contenu du même bloc, pas hauteur d'un frère à montage conditionnel). Fix : isoler titre+contenu de partie dans un wrapper `flex-1 items-center justify-center` dédié, sortir les instructions de ce wrapper.
- Un second problème plus tenace persiste : le titre "descend puis remonte en flash" à chaque clic sur "Nouvelle partie", `AnimatePresence mode="wait"` basculant entre un état chargement court et un état niveau chargé nettement plus haut. Une tentative de fix (remplacer le spinner par un skeleton de même hauteur que le contenu chargé) n'a pas supprimé le flash aux yeux de Baptiste, qui a demandé de revenir purement et simplement au spinner `Loader2` d'origine — non résolu, tracé en [ZBLK-025](archive/blockers/ZBLK-025.md).

Tentative avortée d'ajouter un test unitaire pour `settings.ts` (aucun test dédié pour cette logique de persistance) : `settings.ts` importe `sounds.ts`, qui exécute `new Audio()` au niveau module — crash immédiat en environnement `vitest` Node pur (pas de jsdom configuré sur ce projet). Décision de ne pas ajouter jsdom pour ce seul test et de s'appuyer sur une vérification manuelle à la place, généralisé en [LRN-021](learnings/LRN-021.md).

Tentative de vérification visuelle via `agent-browser` (protocole standard pour les changements UI) : `open` puis `doctor --offline --quick` sont tous deux restés bloqués indéfiniment dans ce sandbox, sans sortie exploitable. Abandon après 2 échecs — en creusant, la vraie leçon était déjà actée le 2026-07-24 en prose dans ce journal (Baptiste préfère vérifier lui-même) mais n'avait jamais été indexée en décision retrouvable par tag ; réparé en indexant [BDR-027](decisions/BDR-027.md) pour que ça ne se reproduise pas.

Rituel `/memory-close` : 2 blockers résolus de la session précédente ([ZBLK-021](archive/blockers/ZBLK-021.md)/[ZBLK-022](archive/blockers/ZBLK-022.md), doublon DOM et animation d'entrée du PawCounter) archivés vers [ZBLK-021](archive/blockers/ZBLK-021.md)/[ZBLK-022](archive/blockers/ZBLK-022.md) en étape 1bis. Les deux learnings de cette session ont d'abord été proposés en 🌍 global, mais Baptiste a tranché "full local" — cohérent avec la préférence déjà actée sur ce projet — donc classés uniquement en `LRN-020`/`LRN-021`, sans entrée `GLRN-`.

**Entrées clés :**

- [BDR-025](decisions/BDR-025.md) — panneaux Réglages/Règles : Dialog + store singleton
- [BDR-026](decisions/BDR-026.md) — pas de slider de volume, mix déjà calibré
- [BDR-027](decisions/BDR-027.md) — pas de vérif navigateur auto sur ce projet
- [LRN-020](learnings/LRN-020.md) — `justify-center` : poids du contenu voisin décale un enfant
- [ZBLK-025](archive/blockers/ZBLK-025.md) — titre qui saute au clic sur "Nouvelle partie" (ouvert)

---

Suite à un retour de Baptiste sur le placement des boutons Réglages/Règles ("pas convaincu"), déplacement du header vers une rangée flanquant le bouton "Nouvelle partie"/"Rejouer" (`size="icon-xl"`), avec correction de la taille des icônes (`size-5` explicite) pour matcher les icônes du bouton d'action — le variant `icon-xl` ne les agrandissait à `size-6` que faute de classe `size-*` propre ([BDR-028](decisions/BDR-028.md), [LRN-022](learnings/LRN-022.md)).

Sur la même session, extraction du bloc d'instructions tactiles ("Appui court : marquer une croix" / "Appui long : poser un chat") en composant partagé `TapInstructions`, retiré de l'affichage permanent sous la grille pour gagner de l'espace, dupliqué dans une nouvelle section de `RulesDialog` ("Comment jouer ?") et préparé dans une modal dédiée `HowToPlayDialog` — créée mais pas encore ouverte automatiquement, le déclenchement au premier lancement étant noté dans `docs/ROADMAP.md` (Phase 4.0) pour plus tard ([BDR-029](decisions/BDR-029.md)). `pnpm lint` vérifié vert après chaque changement.

Rituel `/memory-close` : sur confirmation explicite de Baptiste ("full local"), LRN-022 gardé en 🏠 local plutôt que promu en `GLRN-` — cohérent avec la préférence "full local" déjà actée sur ce projet.

**Entrées clés :**

- [BDR-028](decisions/BDR-028.md) — boutons Réglages/Règles flanquant l'action principale
- [BDR-029](decisions/BDR-029.md) — instructions tactiles extraites en modal (non branchée)
- [LRN-022](learnings/LRN-022.md) — variant CVA n'écrase la taille d'icône que sans classe size-\* propre

---

Branchement du dernier point ouvert de la Phase 4.0 : ouverture automatique de la modal (renommée `HowToPlayDialog`) au tout premier lancement, via un flag `localStorage` (`pawzzle:seenIntro`) lu en initialisation paresseuse de `useState`, posé à la fermeture — `docs/ROADMAP.md` Phase 4.0 entièrement cochée. Ajout au passage d'un bouton dev-only (`import.meta.env.DEV`) pour vider `localStorage` et recharger la page, utile pour retester l'onboarding sans ouvrir les devtools.

Baptiste a ensuite demandé de transformer cette modal "comment jouer" en une vraie page de bienvenue avec du lore, pas seulement les gestes. Renommée `WelcomeDialog`, un premier texte de lore a été écrit autour du thème "Atelier Feutrine" (chats en feutrine épinglés sur un patchwork) — rejeté par Baptiste car ça obligerait à refaire le design de l'app dans un registre couture pour rester cohérent visuellement. Sur sa demande, 5 directions de lore alternatives (sans thème couture) ont été rédigées dans un fichier dédié `docs/welcome-lore-proposals.md` pour comparaison facile plutôt qu'en aller-retours de chat. Baptiste a choisi un mix de deux directions ("village de chats" + "territoire/loi du voisin"), en demandant explicitement de ne jamais chiffrer le nombre de chats/couleurs dans le texte — la taille et la forme du plateau vont évoluer en Phase 4.1, un texte figé sur un compte précis se périmerait ([BDR-030](decisions/BDR-030.md)). Le texte final a ensuite été retravaillé par Baptiste lui-même (mise en emphase `font-semibold text-primary` du rappel des 3 règles), puis dupliqué tel quel dans `RulesDialog` (même pattern que [BDR-029](decisions/BDR-029.md)), avec un `Separator` shadcn ajouté après la description pour séparer visuellement le lore des règles détaillées.

Un défaut de focus a été signalé sur le bouton "C'est parti !" de `WelcomeDialog` : Base UI `Dialog` déplace automatiquement le focus vers le premier élément focusable à l'ouverture, ce qui affichait un anneau `focus-visible` même sans navigation clavier — fixé avec `initialFocus={false}` sur `DialogContent` ([LRN-023](learnings/LRN-023.md)). `pnpm lint`/`tsc -b`/`vite build` vérifiés verts à chaque étape (le hook `rtk` continue de casser sur un fichier non lié à la session, `useInstallPrompt.ts`, non touché et non commité — signalé à Baptiste sans y toucher).

Rituel `/memory-close` : sur "ok" sans réponse explicite à la question de portée, LRN-023 gardé en 🏠 local d'emblée (préférence "full local" déjà confirmée 3 fois sur ce projet cette semaine), sans re-proposer le choix.

**Entrées clés :**

- [BDR-030](decisions/BDR-030.md) — lore de bienvenue sans thème feutrine ni compte fixe
- [LRN-023](learnings/LRN-023.md) — Base UI Dialog autofocus le premier élément focusable

---

Session portant sur le bouton d'installation PWA in-app, repris du pattern déjà validé sur ifecho (`useInstallPrompt` + `InstallButton`, GLRN-136) : hook + composant créés, stylés avec le `Button` shadcn existant (variant `outline`) pour matcher `RulesDialog`/`SettingsDialog`, intégré dans la rangée d'action sous la grille.

Long diagnostic suite au signalement de Baptiste : aucun bouton visible sur Chrome/Edge desktop sans override d'user-agent. Plusieurs tours ont été nécessaires rien que pour localiser le panneau DevTools pertinent (masqué dans les menus, renommé "Appli" en français sur Edge plutôt qu'"Application"). Une fois trouvé : manifest valide, service worker activé, et l'icône native d'install présente dans la barre d'adresse — ce qui a d'abord semblé confirmer que tout fonctionnait côté navigateur. La vraie cause, découverte en creusant plus loin : cette icône native est gérée par le navigateur indépendamment du JS, sa présence ne prouve pas que `beforeinstallprompt` a été capté côté React — le `useEffect` du hook posait son listener après le montage, trop tard si l'event avait déjà été émis (race condition). Fix : capture de l'event au plus tôt via un `<script>` inline dans `index.html`, stockée sur `window.__deferredInstallPrompt`, relue en `useState` lazy initializer au montage du hook ([ZBLK-023](archive/blockers/ZBLK-023.md)). Pattern suffisamment générique pour enrichir l'entrée globale existante plutôt que d'en créer une nouvelle en doublon (GLRN-136, sur confirmation explicite de Baptiste pour la portée globale).

Deux allers-retours de polish visuel ont suivi. D'abord une incohérence de taille d'icône entre `InstallButton` et ses voisins (`RulesDialog`/`SettingsDialog`) — récidive du pattern déjà documenté le jour même ([LRN-022](learnings/LRN-022.md)), corrigée en un premier temps par un `size-5` explicite sur les icônes. Puis, sur demande explicite de Baptiste, refactor pour centraliser cette taille directement dans `button.tsx` (variants `icon`/`icon-xl`) plutôt que de la dupliquer par composant consommateur — remplace l'approche de [BDR-028](decisions/BDR-028.md) (statut mis à jour en `remplacé`), avec `IconToggle` de `SettingsDialog` explicitement fixé à `size-6` pour préserver son apparence antérieure ([BDR-031](decisions/BDR-031.md)).

Enfin, question de Baptiste sur le message d'instructions iOS ("Dans Safari...") : clarifié que le flux "Partager → Sur l'écran d'accueil" est un comportement plateforme WebKit partagé par tous les navigateurs iOS (Chrome iOS, Firefox iOS inclus), pas propre à Safari — texte généralisé, mention "Dans Safari" retirée. Un dernier signalement (icône du bouton iOS toujours différente en taille) reste non confirmé à la fermeture de session — le code semble correct (résolution `twMerge` identique pour toutes les icônes), cause la plus probable : cache du service worker PWA servant encore l'ancien bundle, contournement indiqué à Baptiste sans confirmation retour ([ZBLK-026](archive/blockers/ZBLK-026.md), ouvert).

`pnpm lint`/`pnpm build` vérifiés verts après chaque changement de code.

Rituel `/memory-close` : sur confirmation explicite de Baptiste, les deux patterns génériques de cette session (race condition `beforeinstallprompt`, flux iOS non-Safari-spécifique) ont été promus en portée globale — mais fusionnés dans l'entrée GLRN-136 déjà existante (créée lors de la session ifecho d'origine) plutôt que dupliqués en nouvelles entrées, la même hook/pattern étant concerné.

**Entrées clés :**

- [ZBLK-023](archive/blockers/ZBLK-023.md) — bouton d'installation invisible, race condition `beforeinstallprompt` (résolu)
- [BDR-031](decisions/BDR-031.md) — taille d'icône `size-5` centralisée dans `button.tsx`
- [ZBLK-026](archive/blockers/ZBLK-026.md) — icône du bouton iOS toujours signalée différente, cache SW suspecté (ouvert)

---

Lancement de `/react-doctor` (scan complet) : score initial 53/100. Deux vrais bugs corrigés — `useLevel.ts` avait un updater `setErrors` impur (`setStatus("lost")` appelé depuis son corps), simplifié en réutilisant `willLose` déjà calculé en amont ; `pnpm-workspace.yaml` complété avec `minimumReleaseAge`/`trustPolicy` (hardening supply-chain recommandé par la règle sécurité). Le finding `client-localstorage-no-version` a d'abord été corrigé (`pawzzle:settings` → `:v1`) puis reverted sur demande de Baptiste ("les clés actuelles ne fonctionnent plus") — le merge défensif déjà en place couvre les cas additifs sans versioning ([BDR-032](decisions/BDR-032.md)).

Les 3 derniers findings (`no-layout-property-animation` sur `Nav.tsx`, `no-array-index-as-key` sur `ConfettiBurst.tsx`, `only-export-components` sur les fichiers `ui/`) ont chacun été confirmés faux positifs en récupérant la doc canonique de leur règle (`curl .../prompts/rules/<plugin>/<rule>.md`), qui décrivait exactement le pattern du code comme cas à suppress. Premier réflexe : `rules disable` (désactivation globale de la règle). Baptiste a fait remarquer que ça prive tout futur fichier de la protection — recherche dans la doc de configuration de react-doctor, qui expose `ignore.overrides` (scopé fichier+règle) : `doctor.config.json` corrigé en conséquence, score final 86/100 (le seul finding restant étant `client-localstorage-no-version`, accepté par choix produit). Méthode généralisée en [BDR-033](decisions/BDR-033.md) (local) et GLRN-232 (global, réutilisable sur tout projet react-doctor).

Question annexe de Baptiste sur la pertinence de `/review` sur la branche `development` (15 commits d'avance sur `main`, aucune PR GitHub, `gh` non installé sur ce poste) : clarifié que `/review` cible une PR GitHub inexistante ici, `/code-review` (sans argument, bundle la branche locale vs `main`) est l'outil pertinent — pas d'action prise, juste une recommandation.

**Entrées clés :**

- [BDR-032](decisions/BDR-032.md) — clé localStorage settings reste sans version
- [BDR-033](decisions/BDR-033.md) — faux positifs react-doctor confinés par fichier via `ignore.overrides`

---

`/code-review` (workflow, effort élevé) sur le diff en cours a trouvé un bug confirmé dans `useLevel.ts` : `willLose` était calculé depuis la valeur `errors` figée par closure au lieu d'un updater fonctionnel — deux placements invalides rapprochés avant re-render pouvaient tous deux évaluer `willLose=false` alors que le compteur réel atteignait `MAX_ERRORS`, laissant le joueur continuer après avoir dépassé le seuil de défaite. Premier fix : `errorsRef`, miroir synchrone de `errors`, lu à la place de la valeur de closure. Lint/`tsc --noEmit`/vitest vérifiés verts.

En expliquant le scénario de repro à Baptiste, le terme "double-tap" employé par erreur a été corrigé après relecture de `useGridGestures.ts` — ce geste a été explicitement abandonné en Phase 2 ([BDR-006](decisions/BDR-006.md), remplacé par [BDR-018](decisions/BDR-018.md)) ; le jeu ne connaît que l'appui simple (marqueur) et l'appui long (animal). Le vrai vecteur identifié après relecture du code : les refs de suivi de l'appui long (`pressStart`, `longPressTimeout`) sont singleton, pas per-pointer — un second doigt sur une case écrase les refs du premier sans annuler son timer déjà lancé, donc deux appuis longs simultanés (multi-touch) peuvent déclencher deux `onTogglePaw` à quelques ms d'écart.

Baptiste a testé en conditions réelles (deux doigts simultanés) et confirmé une première fois que la fin de partie se déclenchait bien — puis, sur un second test (deux doigts sur la MÊME case), a révélé que le bug était en réalité toujours là sous une autre forme : 2 erreurs comptées pour une seule pose. Cause : la garde anti-doublon de `togglePaw` (`placed.find(...)`) lisait elle aussi `placed` par closure figée, laissant passer les deux appels avant que React n'ait pu re-render entre eux — le premier fix n'avait couvert qu'une partie du problème. Deuxième fix : `placedRef`, même traitement que `errorsRef` ([BDR-034](decisions/BDR-034.md)). Lint/`tsc --noEmit`/vitest revérifiés verts, comportement confirmé par Baptiste en re-test manuel multi-touch.

**Entrées clés :**

- [BDR-034](decisions/BDR-034.md) — miroir par ref pour tout état lu-puis-écrit dans `togglePaw`
- [ZBLK-024](archive/blockers/ZBLK-024.md) — `willLose`/`placed` figés en multi-touch, 2 fixes en 2 passes (résolu)
- [LRN-024](learnings/LRN-024.md) — corriger la stale closure sur un seul état ne suffit pas si le handler en touche plusieurs

---

Nouvelle `/code-review` (workflow, effort élevé, 17 agents) sur le diff de `development` : 17 candidats bruts réduits à 6 défauts distincts après vérification adversariale. Découverte principale — les 3 findings sur `useLevel.ts` n'étaient pas 3 bugs mais **une seule classe de race**, et sa cause racine était dans `useGridGestures.ts`, pas dans `useLevel.ts` : `handleCellPointerDown` armait un timer d'appui long sans annuler celui en attente, donc N doigts produisaient N `togglePaw` concurrents. Les miroirs par ref de [BDR-034](decisions/BDR-034.md) traitaient les symptômes un par un ; deux lignes au point d'étranglement (`clearLongPress()` + `setPressingCell(null)`, placées après le garde `disabled || hasPawn` pour qu'un appui sur case figée n'annule pas un appui légitime) ferment la classe entière ([BDR-035](decisions/BDR-035.md)). Les 3 correctifs de détail ont été appliqués en plus, en défense en profondeur : `statusRef` + fonction `updateStatus` comme point d'écriture unique du statut, clamp `Math.min(…, MAX_ERRORS)` sur le compteur d'erreurs, et `placedRef.current` substitué à `placed` dans `toggleMarker`/`setMarker` pour supprimer les deux sources de vérité.

Sur `doctor.config.json`, la review a signalé que le bloc `rules` global désactivant `client-localstorage-no-version` contredisait [BDR-032](decisions/BDR-032.md) (« accepté, pas suppress ») et [BDR-033](decisions/BDR-033.md) (politique `ignore.overrides` par fichier). Le bloc a été retiré puis remis sur arbitrage de Baptiste — exception assumée, désormais tracée en [BDR-036](decisions/BDR-036.md) pour que la prochaine review ne resorte pas le même finding.

Côté pnpm, le finding « `trustPolicy: no-downgrade` sans échappatoire » s'est matérialisé en direct : `pnpm add` a échoué deux fois d'affilée sur `ERR_PNPM_TRUST_DOWNGRADE`, sur deux paquets transitifs de workbox-build que personne n'avait choisis et déjà présents dans le lockfile ([ZBLK-028](archive/blockers/ZBLK-028.md)). Plutôt que d'empiler des exclusions permanentes, la portée réelle a été mesurée : `pnpm install --frozen-lockfile` passe avec la politique active — la CI et Vercel ne risquent rien — et `--trust-policy=none` débloque un `add` ponctuel (flag vérifié réellement supporté, pnpm rejetant les options inconnues). La politique est conservée telle quelle, l'échappatoire documentée dans le yaml (GBDR-007, GLRN-234 en global). `packageManager: pnpm@10.30.3` épinglé au passage, pour que ce type d'échec se reproduise en local et pas seulement en CI.

Le point le plus coûteux de la session n'est pas technique. La question de Baptiste « comment tester que tu n'as rien cassé ? » a été lue comme une demande de tests automatisés : `jsdom` + `@testing-library/react` installés et 12 tests écrits, soit ~12 min sur 20, alors qu'elle demandait simplement quelles actions faire lui-même — le bug principal se vérifiant en 10 s avec deux doigts sur un téléphone. Trois relances ont été nécessaires pour lever le malentendu ([ZBLK-029](archive/blockers/ZBLK-029.md)). Les tests ont malgré tout été conservés sur sa décision ([BDR-037](decisions/BDR-037.md)), avec périmètre gelé : pas d'extension spontanée. Point positif de l'épisode : les correctifs ont été retirés un à un pour vérifier que les tests échouaient bien (`called 2 times` au lieu de 1, `expected 5 to be less than or equal to 3`, `to have a length of +0 but got 1`), ce qui a prouvé empiriquement que les 3 bugs étaient réels et pas hypothétiques (GLRN-235).

Enfin, `pnpm lint` s'est révélé cassé indépendamment de tout changement du projet ([ZBLK-027](archive/blockers/ZBLK-027.md)). Premier diagnostic erroné — « un ESLint global masque celui du projet dans la résolution de `pnpm run` » — corrigé après que Baptiste ait contesté l'attribution (« je ne l'avais jamais rencontré »). Cause réelle : le hook rtk réécrit `pnpm lint` en `rtk lint`, qui résout eslint depuis le PATH global (9.9.0) au lieu de `node_modules/.bin` (10.7.0), d'où le crash sur `no-unassigned-vars`, règle propre à ESLint 10. Visible seulement en lisant la commande réellement exécutée dans la sortie de `TaskStop`. `npm uninstall -g eslint` a réglé le problème : `pnpm lint` renvoie « No issues found », exit 0. Build vert, bundle strictement identique (même hash `index-Dz5LWUNf.js`), 26 tests verts.

**Entrées clés :**

- [BDR-035](decisions/BDR-035.md) — geste mono-pointeur sérialisé au point d'étranglement (la vraie cause racine)
- [BDR-036](decisions/BDR-036.md) — exception assumée sur la règle localStorage
- [ZBLK-029](archive/blockers/ZBLK-029.md) — harnais de test non demandé, 12 min sur 20 (résolu)
- [ZBLK-027](archive/blockers/ZBLK-027.md) — `pnpm lint` cassé par rtk captant un ESLint global 9.9.0, diagnostic initial erroné (résolu)

---

Bug signalé par Baptiste sur l'app en production : la pill du lecteur radio ne s'affichait plus sur mobile, mais réapparaissait après une rotation paysage puis retour portrait. Le raisonnement d'élimination a évité de partir sur une fausse piste — rien dans l'app ne re-render sur un changement d'orientation (`useSyncExternalStore` sur le store ambiant, aucun listener resize), donc si la rotation la fait apparaître, c'est que la pill était déjà montée avec son titre : le bug ne pouvait pas être un état, seulement un layout ([LRN-025](learnings/LRN-025.md)). Cause : le bloc de jeu dépasse de quelques pixels la hauteur visible d'un mobile quand la barre d'URL est déployée, ce qui suffit à faire passer le `<footer>` sous la ligne de flottaison ; la rotation replie la barre et rend ~60 px. Fix : `sticky bottom-0 z-10` sur le footer, le lecteur étant un contrôle persistant qui doit rester atteignable quelle que soit la hauteur du contenu ([BDR-038](decisions/BDR-038.md)) — plafonner la hauteur de la grille ou passer la racine en `h-dvh overflow-hidden` ont été écartés. `pnpm lint` / `pnpm build` verts, correctif confirmé fonctionnel par Baptiste ([ZBLK-030](archive/blockers/ZBLK-030.md)).

La vérification sur téléphone a elle-même été bloquée : `https://192.168.1.74:4173` répondait sur le PC mais restait injoignable depuis le mobile du même réseau. Diagnostic donné à côté — certificat mkcert non approuvé sur le téléphone, piste étayée en vérifiant dans le code du plugin qu'il patche bien `preview.https` en plus de `server.https`, mais qui n'était pas le vecteur. La vraie cause, trouvée par Baptiste : le script `preview` du `package.json` est un simple `vite preview`, sans le `--host` que porte le script `dev` depuis toujours — donc bind sur `localhost` uniquement. Trois hypothèses réseau/TLS explorées avant la plus simple, la commande elle-même ([ZBLK-031](archive/blockers/ZBLK-031.md), [LRN-026](learnings/LRN-026.md)).

Rituel `/memory-close` : 5 blockers résolus des sessions précédentes (BLK-008/010/012/013/014) archivés en étape 1bis vers [ZBLK-025](archive/blockers/ZBLK-025.md) à [ZBLK-029](archive/blockers/ZBLK-029.md), en reprenant depuis le max archive courant pour cause de collision de numéros. Les nouveaux blockers repartent de `BLK-030`, au-dessus de ce max, pour clore le cycle de collisions qui polluait les rituels depuis plusieurs sessions. Quelques liens morts hérités de ces renumérotations ont été réparés au passage (`journal.md` lignes 154 et 288, `BDR-016`). Sans réponse explicite à la question de portée, les deux learnings sont restés en 🏠 local, conformément à la préférence "full local" déjà actée plusieurs fois sur ce projet.

**Entrées clés :**

- [BDR-038](decisions/BDR-038.md) — lecteur ambiant épinglé en bas du viewport
- [LRN-025](learnings/LRN-025.md) — symptôme réparé par une rotation d'écran = layout, jamais état
- [ZBLK-031](archive/blockers/ZBLK-031.md) — preview injoignable sur mobile, diagnostic initial erroné (résolu)

---

Suite immédiate du correctif précédent : le `sticky bottom-0` avait bien fait réapparaître la pill du lecteur, mais Baptiste a signalé dans la foulée une scrollbar verticale sur mobile. Diagnostic : `sticky` laisse l'élément dans le flux, donc la hauteur du document n'a jamais bougé — le débordement de quelques pixels identifié en [ZBLK-030](archive/blockers/ZBLK-030.md) était toujours là, simplement devenu perceptible au lieu d'être masqué sous la ligne de flottaison ([LRN-027](learnings/LRN-027.md)). L'épinglage répondait à « rendre atteignable », pas à « faire tenir la page ».

Le vrai correctif plafonne le bloc de niveau par un budget de hauteur dérivé du viewport : `max-w-[min(28rem,calc(100dvh-19rem))]` ([BDR-039](decisions/BDR-039.md)). Posé sur le bloc entier plutôt que sur la grille seule, pour que la rangée de boutons suive et reste alignée. Les 19rem sont un budget assumé (32 px de padding + 48 titre + 28 statut + 48 gaps + 48 boutons + 80 footer = 284 px, arrondi avec marge) — c'était l'alternative explicitement écartée en [BDR-038](decisions/BDR-038.md) au motif du « nombre magique », amendée en conséquence. Trois autres pistes ont été pesées puis écartées : une chaîne flex `min-h-0`/`flex-1`/`aspect-square` (tient sans nombre magique mais décentre le groupe titre/grille/boutons sur desktop), le footer en `fixed` (libère les 80 px réservés mais recouvre le bouton d'action sur petit écran et contredit [BDR-022](decisions/BDR-022.md)), et `h-dvh overflow-hidden` (rogne au lieu d'adapter). Le `sticky` est conservé en filet.

Sur écran haut, `min()` retombe sur 28rem, donc le desktop est censé être strictement inchangé — c'est le point à confirmer en priorité, puisque c'est le seul endroit où une sous-estimation du budget se verrait. `pnpm lint`/`pnpm build` verts, vérification appareil en attente ([BLK-032](blockers/BLK-032.md), ouvert).

Rituel `/memory-close` : deuxième passage de la journée. [ZBLK-030](archive/blockers/ZBLK-030.md) et [ZBLK-031](archive/blockers/ZBLK-031.md), créés résolus au rituel précédent, archivés en étape 1bis — pour une fois sans collision de numéro, la renumérotation de la veille ayant aligné le compteur actif sur le max archive. Les deux entrées de cette session sont restées en 🏠 local sans re-poser la question de portée, la préférence « full local » étant établie sur ce projet.

**Entrées clés :**

- [BDR-039](decisions/BDR-039.md) — grille plafonnée par un budget de hauteur `100dvh`
- [LRN-027](learnings/LRN-027.md) — `sticky` rend visible, ne supprime pas le débordement
- [BLK-032](blockers/BLK-032.md) — scrollbar verticale sur mobile (ouvert, vérification appareil en attente)
