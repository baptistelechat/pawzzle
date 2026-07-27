# Notation de difficulté — Phase 4.1

Badge cosmétique Facile / Intermédiaire / Difficile affiché après génération d'un niveau. **Affichage pur, aucun pilotage de la génération** (décision produit — voir "Hors scope" plus bas).

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

Génère 100 niveaux à solution unique pour chacune des 6 combinaisons `{6,8,10} × {carré,cercle}` (600 au total), écrit les enregistrements bruts dans `scripts/output/difficulty-calibration.json` (non committé, régénérable) et affiche un résumé statistique (min/p33/p67/max) par combinaison.

**À relancer si** : l'algorithme de génération de régions change, `GRID_SIZES`/`GRID_SHAPES` changent, ou le masque de forme change — les seuils ci-dessous ne sont valides que pour la version du moteur mesurée.

## Découverte clé : la taille ne se normalise pas

Diviser par `activeCells` ne rend PAS le score comparable entre tailles de grille. Médiane observée (carré+cercle mélangés) :

| Taille | Médiane du score |
| ------ | ---------------- |
| 6×6    | 1,75             |
| 8×8    | 5,42             |
| 10×10  | 26,74            |

×15 entre le 6×6 et le 10×10, après normalisation. **Un jeu de seuils unique poolant toutes les tailles réétiquetterait juste la taille de la grille** ("Facile" = petit, "Difficile" = grand), ce qui n'apporte aucune information utile — voir la première critique de l'approche naïve ("la taille = la difficulté") pendant la session `/rodin` qui a précédé cette mesure. **Décision : un jeu de seuils par taille, jamais poolés entre tailles.**

## Décision : seuils poolés par forme, à l'intérieur de chaque taille

Contrairement à la taille, la forme (carré/cercle) est poolée dans les seuils finaux — **choix assumé avec un biais mesuré**, pas un oubli.

Biais mesuré (sur 100 grilles de chaque forme, tous seuils pooled par taille) : avec des seuils mélangés carré+cercle, un carré a 42-44% de chances d'être étiqueté "Difficile" contre seulement 23-25% pour un cercle — l'idéal neutre serait 33%/33%. Le score des carrés est structurellement plus élevé (plus de cases actives à taille égale — voir BDR-057), donc le pool tiré vers le haut par les carrés sous-estime les cercles difficiles et surestime les carrés faciles. Effet stable sur les 3 tailles.

Choix retenu quand même : le badge est purement cosmétique (pas de pilotage de génération), le joueur ne voit jamais deux grilles de tailles/formes différentes côte à côte pour comparer, et 3 jeux de seuils plutôt que 6 réduit la surface de constantes à maintenir. Si ce biais devient gênant un jour (ex. si le badge sert à autre chose que l'affichage), les seuils séparés par forme sont conservés ci-dessous pour reprise sans redemander une calibration.

## Seuils retenus (production)

3 niveaux (Facile / Intermédiaire / Difficile), coupures aux terciles (p33/p67) — voir décision d'abandon du 4ᵉ niveau "Extrême" plus bas.

| Taille | Facile | Intermédiaire | Difficile |
| ------ | ------ | ------------- | --------- |
| 6×6    | ≤ 1,41 | 1,41 – 2,03   | > 2,03    |
| 8×8    | ≤ 3,24 | 3,24 – 7,75   | > 7,75    |
| 10×10  | ≤ 10,8 | 10,8 – 44,12  | > 44,12   |

## Seuils alternatifs, séparés par forme (conservés pour référence, non utilisés)

| Combo        | Facile  | Intermédiaire | Difficile |
| ------------ | ------- | ------------- | --------- |
| carré 6×6    | ≤ 1,69  | 1,69 – 2,36   | > 2,36    |
| carré 8×8    | ≤ 4,88  | 4,88 – 9,95   | > 9,95    |
| carré 10×10  | ≤ 17,43 | 17,43 – 54,83 | > 54,83   |
| cercle 6×6   | ≤ 1,19  | 1,19 – 1,81   | > 1,81    |
| cercle 8×8   | ≤ 2,73  | 2,73 – 6,62   | > 6,62    |
| cercle 10×10 | ≤ 7,73  | 7,73 – 24,99  | > 24,99   |

## Décision : abandon du 4ᵉ niveau "Extrême"

Passage de 4 niveaux (quartiles p25/médiane/p75) à 3 niveaux (terciles p33/p67) — recalibré le 2026-07-27. Le niveau "Extrême" apportait peu de valeur perçue (jamais plus de 25% des grilles) pour une distinction supplémentaire à maintenir ; 3 niveaux (Facile/Intermédiaire/Difficile) suffisent au MVP.

## Hors scope (pour l'instant)

- **Pilotage de la génération par difficulté cible** (ex. "génère-moi une grille Extrême") : nécessiterait de composer la condition d'acceptation de la boucle `MAX_ATTEMPTS` avec un filtre de score, ce qui multiplie mécaniquement le nombre d'essais nécessaires (~×4 pour viser un quart de la distribution) et dépasserait probablement la marge actuelle de `MAX_ATTEMPTS=5000` sur 10×10. Pas construit tant que le besoin reste hypothétique.
- **Intégration dans `src/`** : le compteur `nodesExplored` n'est pas encore branché dans `solver.ts`/`generator.ts`/`types.ts` (`Level`). Les seuils ci-dessus sont prêts à coder dès que cette étape démarre.
