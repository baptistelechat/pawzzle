import type { Grid, Position } from "@/lib/engine/types";
import {
  hasColumnConflict,
  hasRegionConflict,
  isAdjacent,
} from "@/lib/engine/rules";

const canPlace = (
  grid: Grid,
  placed: Position[],
  candidate: Position,
): boolean => {
  if (
    hasColumnConflict(placed, candidate) ||
    hasRegionConflict(grid, placed, candidate)
  )
    return false;
  const previousRow = placed[placed.length - 1];
  return previousRow === undefined || !isAdjacent(previousRow, candidate);
};

// S'arrête dès que `cap` solutions sont trouvées (usage : vérifier l'unicité sans épuiser l'espace de recherche)
// `nodesExplored` : nombre d'appels récursifs du backtracking, réutilisé
// comme proxy de difficulté (voir docs/DIFFICULTY_RATING.md) — coût nul
// puisque le comptage se fait sur une recherche déjà exécutée.
export const countSolutions = (
  grid: Grid,
  cap: number,
): { solutions: Position[][]; nodesExplored: number } => {
  const solutions: Position[][] = [];
  let nodesExplored = 0;

  const backtrack = (row: number, placed: Position[]): void => {
    nodesExplored++;
    if (solutions.length >= cap) return;
    if (row === grid.size) {
      solutions.push([...placed]);
      return;
    }
    for (let col = 0; col < grid.size; col++) {
      if (!grid.active[row][col]) continue;
      const candidate: Position = { row, col };
      if (canPlace(grid, placed, candidate)) {
        placed.push(candidate);
        backtrack(row + 1, placed);
        placed.pop();
        if (solutions.length >= cap) return;
      }
    }
  };

  backtrack(0, []);
  return { solutions, nodesExplored };
};
