import type { Difficulty, Grid, Position } from "@/lib/engine/types";
import { isAdjacent, isSolved } from "@/lib/engine/rules";

type Candidates = boolean[][];

const cloneCandidates = (grid: Grid): Candidates =>
  grid.active.map((row) => [...row]);

const rowUnits = (grid: Grid): Position[][] =>
  Array.from({ length: grid.size }, (_, row) =>
    Array.from({ length: grid.size }, (_, col) => ({ row, col })).filter(
      (cell) => grid.active[cell.row][cell.col],
    ),
  );

const colUnits = (grid: Grid): Position[][] =>
  Array.from({ length: grid.size }, (_, col) =>
    Array.from({ length: grid.size }, (_, row) => ({ row, col })).filter(
      (cell) => grid.active[cell.row][cell.col],
    ),
  );

const regionUnits = (grid: Grid): Position[][] => {
  const units: Position[][] = Array.from({ length: grid.size }, () => []);
  for (let row = 0; row < grid.size; row++) {
    for (let col = 0; col < grid.size; col++) {
      if (!grid.active[row][col]) continue;
      units[grid.regions[row][col]].push({ row, col });
    }
  }
  return units;
};

// Après un placement, une seule reine par ligne/colonne/région/voisinage
// immédiat (règles du jeu, voir rules.ts) élimine tous les autres candidats
// de ces unités.
const eliminateAround = (
  candidates: Candidates,
  grid: Grid,
  placedCell: Position,
): void => {
  const region = grid.regions[placedCell.row][placedCell.col];
  for (let row = 0; row < grid.size; row++) {
    for (let col = 0; col < grid.size; col++) {
      if (!candidates[row][col]) continue;
      const cell = { row, col };
      const sameUnit =
        row === placedCell.row ||
        col === placedCell.col ||
        grid.regions[row][col] === region;
      if (sameUnit || isAdjacent(placedCell, cell))
        candidates[row][col] = false;
    }
  }
};

interface LogicSolveResult {
  placed: Position[];
  usedPointing: boolean;
  complete: boolean;
}

const solveByLogic = (grid: Grid): LogicSolveResult => {
  const candidates = cloneCandidates(grid);
  const placed: Position[] = [];
  const solvedRows = new Set<number>();
  const solvedCols = new Set<number>();
  const solvedRegions = new Set<number>();
  const rows = rowUnits(grid);
  const cols = colUnits(grid);
  const regions = regionUnits(grid);
  let usedPointing = false;

  const remaining = (unit: Position[]): Position[] =>
    unit.filter((cell) => candidates[cell.row][cell.col]);

  const place = (cell: Position): void => {
    placed.push(cell);
    solvedRows.add(cell.row);
    solvedCols.add(cell.col);
    solvedRegions.add(grid.regions[cell.row][cell.col]);
    eliminateAround(candidates, grid, cell);
  };

  // "Single forcé" : une unité pas encore résolue n'a plus qu'un candidat → forcé.
  const applyForcedSingles = (): boolean => {
    let progressed = false;
    const groups: { units: Position[][]; solved: Set<number> }[] = [
      { units: rows, solved: solvedRows },
      { units: cols, solved: solvedCols },
      { units: regions, solved: solvedRegions },
    ];
    for (const { units, solved } of groups) {
      units.forEach((unit, id) => {
        if (solved.has(id)) return;
        const left = remaining(unit);
        if (left.length === 1) {
          place(left[0]);
          progressed = true;
        }
      });
    }
    return progressed;
  };

  const drainForcedSingles = (): boolean => {
    let any = false;
    while (applyForcedSingles()) any = true;
    return any;
  };

  // "Pointing" : si les candidats restants d'une région tiennent tous sur une
  // même ligne/colonne, cette ligne/colonne ne peut recevoir que la reine de
  // cette région — les autres candidats de la ligne/colonne sont éliminés.
  const applyPointingReduction = (): boolean => {
    let progressed = false;
    regions.forEach((unit, regionId) => {
      if (solvedRegions.has(regionId)) return;
      const left = remaining(unit);
      if (left.length === 0) return;
      const sameRow = left.every((cell) => cell.row === left[0].row);
      const sameCol = left.every((cell) => cell.col === left[0].col);
      if (sameRow) {
        for (const cell of rows[left[0].row]) {
          if (grid.regions[cell.row][cell.col] === regionId) continue;
          if (candidates[cell.row][cell.col]) {
            candidates[cell.row][cell.col] = false;
            progressed = true;
          }
        }
      }
      if (sameCol) {
        for (const cell of cols[left[0].col]) {
          if (grid.regions[cell.row][cell.col] === regionId) continue;
          if (candidates[cell.row][cell.col]) {
            candidates[cell.row][cell.col] = false;
            progressed = true;
          }
        }
      }
    });
    if (progressed) usedPointing = true;
    return progressed;
  };

  drainForcedSingles();
  while (placed.length < grid.size) {
    const pointed = applyPointingReduction();
    const singled = drainForcedSingles();
    if (!pointed && !singled) break;
  }

  return { placed, usedPointing, complete: placed.length === grid.size };
};

export const classifyDifficulty = (grid: Grid): Difficulty => {
  const result = solveByLogic(grid);
  if (!result.complete) return "hard";
  if (!isSolved(grid, result.placed)) {
    throw new Error(
      "classifyDifficulty: placement déduit invalide — bug de propagation logique",
    );
  }
  return result.usedPointing ? "medium" : "easy";
};
