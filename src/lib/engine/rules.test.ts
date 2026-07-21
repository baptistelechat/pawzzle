import { describe, expect, it } from "vitest";
import type { Grid } from "@/lib/engine/types";
import {
  getViolations,
  hasColumnConflict,
  hasRegionConflict,
  hasRowConflict,
  isAdjacent,
  isSolved,
} from "@/lib/engine/rules";

const grid: Grid = {
  size: 3,
  regions: [
    [0, 0, 1],
    [0, 1, 1],
    [2, 2, 2],
  ],
};

describe("hasRowConflict", () => {
  it("détecte deux positions sur la même ligne", () => {
    expect(hasRowConflict([{ row: 0, col: 0 }], { row: 0, col: 2 })).toBe(true);
  });
  it("ignore des lignes différentes", () => {
    expect(hasRowConflict([{ row: 0, col: 0 }], { row: 1, col: 0 })).toBe(
      false,
    );
  });
});

describe("hasColumnConflict", () => {
  it("détecte deux positions sur la même colonne", () => {
    expect(hasColumnConflict([{ row: 0, col: 1 }], { row: 2, col: 1 })).toBe(
      true,
    );
  });
});

describe("hasRegionConflict", () => {
  it("détecte deux positions dans la même région", () => {
    expect(
      hasRegionConflict(grid, [{ row: 0, col: 0 }], { row: 1, col: 0 }),
    ).toBe(true);
  });
  it("ignore des régions différentes", () => {
    expect(
      hasRegionConflict(grid, [{ row: 0, col: 0 }], { row: 2, col: 0 }),
    ).toBe(false);
  });
});

describe("isAdjacent", () => {
  it("détecte les 8 voisins, diagonales incluses", () => {
    expect(isAdjacent({ row: 1, col: 1 }, { row: 0, col: 0 })).toBe(true);
    expect(isAdjacent({ row: 1, col: 1 }, { row: 2, col: 2 })).toBe(true);
    expect(isAdjacent({ row: 1, col: 1 }, { row: 1, col: 2 })).toBe(true);
  });
  it("ignore une position hors voisinage ou identique", () => {
    expect(isAdjacent({ row: 0, col: 0 }, { row: 2, col: 0 })).toBe(false);
    expect(isAdjacent({ row: 0, col: 0 }, { row: 0, col: 0 })).toBe(false);
  });
});

describe("isSolved", () => {
  // grille 4x4, une région par colonne — solution avec colonnes non adjacentes ligne à ligne
  const solvableGrid: Grid = {
    size: 4,
    regions: [
      [0, 1, 2, 3],
      [0, 1, 2, 3],
      [0, 1, 2, 3],
      [0, 1, 2, 3],
    ],
  };

  it("valide une solution correcte", () => {
    const positions = [
      { row: 0, col: 1 },
      { row: 1, col: 3 },
      { row: 2, col: 0 },
      { row: 3, col: 2 },
    ];
    expect(getViolations(solvableGrid, positions)).toEqual([]);
    expect(isSolved(solvableGrid, positions)).toBe(true);
  });
  it("rejette une solution incomplète", () => {
    expect(isSolved(solvableGrid, [{ row: 0, col: 1 }])).toBe(false);
  });
});
