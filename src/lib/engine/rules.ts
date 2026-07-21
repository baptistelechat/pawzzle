import type { Grid, Position } from "@/lib/engine/types";

export const hasRowConflict = (
  positions: Position[],
  candidate: Position,
): boolean => positions.some((p) => p.row === candidate.row);

export const hasColumnConflict = (
  positions: Position[],
  candidate: Position,
): boolean => positions.some((p) => p.col === candidate.col);

export const hasRegionConflict = (
  grid: Grid,
  positions: Position[],
  candidate: Position,
): boolean => {
  const candidateRegion = grid.regions[candidate.row][candidate.col];
  return positions.some((p) => grid.regions[p.row][p.col] === candidateRegion);
};

export const isAdjacent = (a: Position, b: Position): boolean =>
  Math.abs(a.row - b.row) <= 1 &&
  Math.abs(a.col - b.col) <= 1 &&
  !(a.row === b.row && a.col === b.col);

export const hasAdjacencyConflict = (
  positions: Position[],
  candidate: Position,
): boolean => positions.some((p) => isAdjacent(p, candidate));

export const getViolations = (grid: Grid, positions: Position[]): Position[] =>
  positions.filter((candidate) => {
    const others = positions.filter((p) => p !== candidate);
    return (
      hasRowConflict(others, candidate) ||
      hasColumnConflict(others, candidate) ||
      hasRegionConflict(grid, others, candidate) ||
      hasAdjacencyConflict(others, candidate)
    );
  });

export const isSolved = (grid: Grid, positions: Position[]): boolean =>
  positions.length === grid.size && getViolations(grid, positions).length === 0;
