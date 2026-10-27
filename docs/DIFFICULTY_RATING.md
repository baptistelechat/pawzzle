# Notation de difficulté — Phase 4.1

Badge cosmétique Facile / Intermédiaire / Difficile affiché après génération d'un niveau. **Affichage pur, aucun pilotage de la génération.**

## L'approche : classification par techniques de déduction

`src/lib/engine/deduction.ts::classifyDifficulty(grid)` rejoue la grille avec un solveur à **propagation de contraintes** qui imite le raisonnement humain (élimination directe, jamais de backtracking), et classe selon la technique la plus avancée nécessaire pour la résoudre entièrement :

- **Facile** : résolu par élimination de base seule — cascade d'élimination (une reine placée élimine sa ligne/colonne/région/voisinage immédiat) + singles forcés (une unité non résolue avec un seul candidat restant est forcée), répétés jusqu'à point fixe.
- **Intermédiaire** : l'élimination de base seule ne suffit pas, il faut en plus la réduction **"pointing"** : si tous les candidats restants d'une région tiennent sur une même ligne/colonne, cette ligne/colonne ne peut recevoir que la reine de cette région — les autres candidats de la ligne/colonne sont éliminés, ce qui débloque de nouveaux singles forcés.
- **Difficile** : même avec les deux techniques, un point fixe est atteint sans que toutes les reines soient placées — un joueur devrait deviner/tâtonner pour terminer.

**Aucun seuil numérique ni calibration** : la classification est une propriété structurelle du puzzle (quelle technique de raisonnement le résout), pas un score continu normalisé à comparer par percentile. Ça élimine par construction les deux biais qui affectaient l'ancienne approche (voir "Historique" plus bas).

**Auto-vérification** : si la logique déclare le puzzle résolu (Facile/Intermédiaire), `classifyDifficulty` vérifie que le placement déduit satisfait bien `rules.isSolved` — sinon `throw` (bug de propagation, pas un cas légitime). Remplace l'infra de test retirée du projet (BDR-054).

## Mesure de répartition (pas une calibration)

`scripts/measure-difficulty-distribution.mjs` (réimplémentation JS autonome, indépendante de `src/`, même pattern que `normalize-sounds.mjs`) génère 100 niveaux par combinaison `{6,8,10} × {carré,cercle}` et affiche la répartition easy/medium/hard obtenue — un contrôle de non-dégénérescence, pas un calcul de seuils (il n'y en a plus). Lancer avec :

```
pnpm difficulty:measure
```

Résultat mesuré (600 niveaux) :

| Combo        | Facile | Intermédiaire | Difficile |
| ------------ | ------ | ------------- | --------- |
| carré 6×6    | 33%    | 24%           | 43%       |
| carré 8×8    | 19%    | 34%           | 47%       |
| carré 10×10  | 9%     | 25%           | 66%       |
| cercle 6×6   | 44%    | 11%           | 45%       |
| cercle 8×8   | 31%    | 26%           | 43%       |
| cercle 10×10 | 20%    | 27%           | 53%       |
| **Global**   | 26%    | 25%           | 50%       |

Aucun tier n'est vide ou quasi-vide sur aucune combinaison — pas de dégénérescence. Le glissement vers "Difficile" aux grandes tailles (66% en carré 10×10) est attendu et légitime ici : plus de cases actives veut dire plus de contraintes à faire interagir avant qu'un raisonnement pur suffise, contrairement à l'ancien score où le lien taille↔score était un artefact de normalisation (voir Historique).

## Hors scope (pour l'instant)

- **Pilotage de la génération par difficulté cible** : nécessiterait de composer la condition d'acceptation de la boucle `MAX_ATTEMPTS` avec un filtre de classification, ce qui multiplie mécaniquement le nombre d'essais nécessaires. Pas construit tant que le besoin reste hypothétique.
- **Comptage de "guesses"** pour distinguer plusieurs niveaux de difficulté à l'intérieur du tier "Difficile" : le classifieur s'arrête à "il faut deviner", sans mesurer combien. À reconsidérer si un 4ᵉ niveau redevient utile.

## Historique

- **v1 (BDR-062/063)** : `score = nodesExplored / activeCells`, où `nodesExplored` comptait tous les appels récursifs du backtracking de `solver.ts` pendant la vérification d'unicité. Seuils calibrés empiriquement par percentile (terciles), poolés par taille et par forme. Deux biais mesurés et documentés : non-invariance d'échelle (médiane ×15 entre 6×6 et 10×10 même après normalisation par `activeCells` — LRN-042) et biais de poolage carré/cercle (un carré avait 2× plus de chances d'être étiqueté "Difficile" qu'un cercle à seuils égaux — LRN-043).
- **v2 (testée, abandonnée)** : hypothèse que `nodesToFirstSolution` (nœuds explorés jusqu'à la 1ère solution, plutôt que le total de la recherche d'unicité) corrigerait ces biais. Testé empiriquement sur 600 générations fraîches : biais carré/cercle quasi identique (voire légèrement pire à 10×10), facteur d'échelle 6×6→10×10 quasi identique (×31 dans les deux cas). Les deux métriques sont trop corrélées (même structure combinatoire, même ordre de parcours fixe du backtracking) pour que l'une résolve ce que l'autre ne résout pas — changement testé puis intégralement annulé, code de prod jamais impacté.
- **v3 (actuelle)** : moteur de déduction logique décrit ci-dessus. Remplace un proxy de complexité combinatoire du solveur (qui ne mesurait rien de la difficulté humaine) par une classification directe du raisonnement nécessaire.
