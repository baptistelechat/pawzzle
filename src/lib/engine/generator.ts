import type { Grid, Level, Position } from "@/lib/engine/types";
import { countSolutions } from "@/lib/engine/solver";

// ponytail: garde-fou anti-boucle infinie. Mesuré empiriquement : le 10×10
// nécessite jusqu'à ~2100 tentatives dans le pire cas observé (échantillon de
// 50 générations) — 5000 laisse une marge confortable sans bloquer le worker
// indéfiniment.
const MAX_ATTEMPTS = 5000;

const NEIGHBOR_OFFSETS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

const shuffle = <T>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Fait croître `size` régions contiguës par flood-fill aléatoire jusqu'à couvrir toute la grille
const generateRegions = (size: number): number[][] => {
  const regions: number[][] = Array.from({ length: size }, () =>
    Array(size).fill(-1),
  );
  const frontier: Position[] = [];

  const seeds = shuffle(
    Array.from({ length: size * size }, (_, i) => ({
      row: Math.floor(i / size),
      col: i % size,
    })),
  ).slice(0, size);
  seeds.forEach((seed, regionId) => {
    regions[seed.row][seed.col] = regionId;
    frontier.push(seed);
  });

  while (frontier.length > 0) {
    const index = Math.floor(Math.random() * frontier.length);
    const cell = frontier[index];
    frontier.splice(index, 1);
    const regionId = regions[cell.row][cell.col];

    for (const { row: dr, col: dc } of shuffle(NEIGHBOR_OFFSETS)) {
      const row = cell.row + dr;
      const col = cell.col + dc;
      if (
        row < 0 ||
        row >= size ||
        col < 0 ||
        col >= size ||
        regions[row][col] !== -1
      )
        continue;
      regions[row][col] = regionId;
      frontier.push({ row, col });
    }
  }

  return regions;
};

export const generateLevel = (size: number): Level => {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const grid: Grid = { size, regions: generateRegions(size) };
    const solutions = countSolutions(grid, 2);
    if (solutions.length === 1) return { grid, solution: solutions[0] };
  }
  throw new Error(
    `generateLevel: aucune grille à solution unique trouvée pour size=${size} après ${MAX_ATTEMPTS} tentatives`,
  );
};
