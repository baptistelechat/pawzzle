# Notation de difficulté — Phase 4.1

Badge cosmétique Facile / Intermédiaire / Difficile / Extrême affiché après génération d'un niveau. **Affichage pur, aucun pilotage de la génération** (décision produit — voir "Hors scope" plus bas).

## Le métrique

```
score = nodesExplored / activeCells
```

- `nodesExplored` : nombre d'appels récursifs du solveur (`backtrack()` dans `src/lib/engine/solver.ts`) pendant la vérification d'unicité de solution — déjà calculé par `countSolutions` à chaque génération, coût additionnel nul.
- `activeCells` : nombre de cases jouables de la grille (`grid.active` aplati), donné par le masque de forme (`src/lib/engine/shapes.ts`).

**Ce que ça mesure** : la taille de l'arbre de recherche qu'un solveur brute-force doit explorer pour trouver l'unique solution. C'est un proxy de complexité combinatoire, pas une mesure de difficulté humaine — il n'y a pas de moteur de déduction logique (pas de "naked/hidden single" façon Sudoku). Un score élevé veut dire "dur à trouver par force brute", ce qui corrèle avec la difficulté perçue sans lui être identique.

## Calibration

Script autonome `scripts/calibrate-difficulty.mjs` (réimplémentation JS du moteur, indépendante de `src/` — même pattern que la calibration de `MAX_ATTEMPTS`, voir BDR-053 et LRN-040). Lancer avec :

```
pnpm difficulty:calibrate
```

Génère 100 niveaux à solution unique pour chacune des 6 combinaisons `{6,8,10} × {carré,cercle}` (600 au total), écrit les enregistrements bruts dans `scripts/output/difficulty-calibration.json` (non committé, régénérable) et affiche un résumé statistique (min/p25/médiane/p75/max) par combinaison.

**À relancer si** : l'algorithme de génération de régions change, `GRID_SIZES`/`GRID_SHAPES` changent, ou le masque de forme change — les seuils ci-dessous ne sont valides que pour la version du moteur mesurée.

## Découverte clé : la taille ne se normalise pas

Diviser par `activeCells` ne rend PAS le score comparable entre tailles de grille. Médiane observée (carré+cercle mélangés) :

| Taille | Médiane du score |
| ------ | ---------------- |
| 6×6    | 1,75             |
| 8×8    | 5,42             |
| 10×10  | 26,74            |

×15 entre le 6×6 et le 10×10, après normalisation. **Un jeu de seuils unique poolant toutes les tailles réétiquetterait juste la taille de la grille** ("Facile" = petit, "Extrême" = grand), ce qui n'apporte aucune information utile — voir la première critique de l'approche naïve ("la taille = la difficulté") pendant la session `/rodin` qui a précédé cette mesure. **Décision : un jeu de seuils par taille, jamais poolés entre tailles.**

## Décision : seuils poolés par forme, à l'intérieur de chaque taille

Contrairement à la taille, la forme (carré/cercle) est poolée dans les seuils finaux — **choix assumé avec un biais mesuré**, pas un oubli.

Biais mesuré (10×10, sur 100 grilles de chaque forme) : avec des seuils mélangés carré+cercle, un carré a 33% de chances d'être étiqueté "Extrême" contre seulement 17% pour un cercle — l'idéal neutre serait 25%/25%. Le score des carrés est structurellement plus élevé (plus de cases actives à taille égale — voir BDR-057), donc le pool tiré vers le haut par les carrés sous-estime les cercles difficiles et surestime les carrés faciles. L'effet grandit avec la taille (6×6 : ~19/31 vs idéal 25/25 ; 10×10 : ~16/34).

Choix retenu quand même : le badge est purement cosmétique (pas de pilotage de génération), le joueur ne voit jamais deux grilles de tailles/formes différentes côte à côte pour comparer, et 3 jeux de seuils plutôt que 6 réduit la surface de constantes à maintenir. Si ce biais devient gênant un jour (ex. si le badge sert à autre chose que l'affichage), les seuils séparés par forme sont conservés ci-dessous pour reprise sans redemander une calibration.

## Seuils retenus (production)

| Taille | Facile  | Intermédiaire | Difficile     | Extrême |
| ------ | ------- | ------------- | ------------- | ------- |
| 6×6    | ≤ 1,21  | 1,21 – 1,75   | 1,75 – 2,53   | > 2,53  |
| 8×8    | ≤ 2,76  | 2,76 – 5,42   | 5,42 – 10,05  | > 10,05 |
| 10×10  | ≤ 10,43 | 10,43 – 26,74 | 26,74 – 68,91 | > 68,91 |

## Seuils alternatifs, séparés par forme (conservés pour référence, non utilisés)

| Combo        | Facile  | Intermédiaire | Difficile     | Extrême |
| ------------ | ------- | ------------- | ------------- | ------- |
| carré 6×6    | ≤ 1,31  | 1,31 – 1,86   | 1,86 – 2,74   | > 2,74  |
| carré 8×8    | ≤ 2,93  | 2,93 – 6,49   | 6,49 – 11,95  | > 11,95 |
| carré 10×10  | ≤ 12,78 | 12,78 – 31,64 | 31,64 – 95,64 | > 95,64 |
| cercle 6×6   | ≤ 1,02  | 1,02 – 1,56   | 1,56 – 2,22   | > 2,22  |
| cercle 8×8   | ≤ 2,14  | 2,14 – 5,06   | 5,06 – 8,70   | > 8,70  |
| cercle 10×10 | ≤ 7,33  | 7,33 – 20,45  | 20,45 – 48,50 | > 48,50 |

## Hors scope (pour l'instant)

- **Pilotage de la génération par difficulté cible** (ex. "génère-moi une grille Extrême") : nécessiterait de composer la condition d'acceptation de la boucle `MAX_ATTEMPTS` avec un filtre de score, ce qui multiplie mécaniquement le nombre d'essais nécessaires (~×4 pour viser un quart de la distribution) et dépasserait probablement la marge actuelle de `MAX_ATTEMPTS=5000` sur 10×10. Pas construit tant que le besoin reste hypothétique.
- **Intégration dans `src/`** : le compteur `nodesExplored` n'est pas encore branché dans `solver.ts`/`generator.ts`/`types.ts` (`Level`). Les seuils ci-dessus sont prêts à coder dès que cette étape démarre.
