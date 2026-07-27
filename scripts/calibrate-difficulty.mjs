import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Réimplémentation autonome du moteur (src/lib/engine/{generator,solver,shapes}.ts)
// — même pattern que normalize-sounds.mjs / BDR-053 / LRN-040 : script de
// calibration hors application, pas d'import des modules TS du projet.

const GRID_SIZES = [6, 8, 10];
const GRID_SHAPES = ["square", "circle"];
const SAMPLES_PER_COMBO = 100;
const MAX_ATTEMPTS = 5000;

const OUTPUT_PATH = path.resolve(
  import.meta.dirname,
  "output/difficulty-calibration.json",
);

const NEIGHBOR_OFFSETS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const createShapeMask = (shape, size) => {
  if (shape === "square")
    return Array.from({ length: size }, () => Array(size).fill(true));
  const center = (size - 1) / 2;
  const radius = size / 2;
  return Array.from({ length: size }, (_, row) =>
    Array.from(
      { length: size },
      (_, col) => Math.hypot(row - center, col - center) <= radius,
    ),
  );
};

const generateRegions = (size, active) => {
  const regions = Array.from({ length: size }, () => Array(size).fill(-1));
  const frontier = [];

  const activeCells = Array.from({ length: size * size }, (_, i) => ({
    row: Math.floor(i / size),
    col: i % size,
  })).filter(({ row, col }) => active[row][col]);
  const seeds = shuffle(activeCells).slice(0, size);
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
        !active[row][col] ||
        regions[row][col] !== -1
      )
        continue;
      regions[row][col] = regionId;
      frontier.push({ row, col });
    }
  }

  return regions;
};

const isAdjacent = (a, b) =>
  Math.abs(a.row - b.row) <= 1 &&
  Math.abs(a.col - b.col) <= 1 &&
  !(a.row === b.row && a.col === b.col);

const canPlace = (grid, placed, candidate) => {
  const hasColumnConflict = placed.some((p) => p.col === candidate.col);
  const candidateRegion = grid.regions[candidate.row][candidate.col];
  const hasRegionConflict = placed.some(
    (p) => grid.regions[p.row][p.col] === candidateRegion,
  );
  if (hasColumnConflict || hasRegionConflict) return false;
  const previousRow = placed[placed.length - 1];
  return previousRow === undefined || !isAdjacent(previousRow, candidate);
};

// Identique à solver.ts::countSolutions, + compteur nodesExplored
const countSolutions = (grid, cap) => {
  const solutions = [];
  let nodesExplored = 0;

  const backtrack = (row, placed) => {
    nodesExplored++;
    if (solutions.length >= cap) return;
    if (row === grid.size) {
      solutions.push([...placed]);
      return;
    }
    for (let col = 0; col < grid.size; col++) {
      if (!grid.active[row][col]) continue;
      const candidate = { row, col };
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

const generateInstrumentedLevel = (size, shape) => {
  const active = createShapeMask(shape, size);
  const activeCells = active.flat().filter(Boolean).length;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const grid = { size, regions: generateRegions(size, active), active };
    const { solutions, nodesExplored } = countSolutions(grid, 2);
    if (solutions.length === 1) {
      return { nodesExplored, activeCells, generationAttempts: attempt + 1 };
    }
  }
  throw new Error(
    `aucune grille à solution unique pour size=${size} shape=${shape} après ${MAX_ATTEMPTS} tentatives`,
  );
};

const percentile = (sorted, p) => {
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
};

const summarize = (scores) => {
  const sorted = [...scores].sort((a, b) => a - b);
  const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;
  return {
    n: sorted.length,
    min: sorted[0],
    p33: percentile(sorted, 1 / 3),
    p67: percentile(sorted, 2 / 3),
    max: sorted[sorted.length - 1],
    mean: Number(mean.toFixed(3)),
  };
};

const records = [];

for (const shape of GRID_SHAPES) {
  for (const size of GRID_SIZES) {
    console.log(`-- size=${size} shape=${shape} --`);
    for (let i = 0; i < SAMPLES_PER_COMBO; i++) {
      const { nodesExplored, activeCells, generationAttempts } =
        generateInstrumentedLevel(size, shape);
      records.push({
        size,
        shape,
        nodesExplored,
        activeCells,
        score: nodesExplored / activeCells,
        generationAttempts,
      });
      if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${SAMPLES_PER_COMBO}`);
    }
  }
}

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(
  OUTPUT_PATH,
  JSON.stringify(
    {
      meta: {
        generatedAt: new Date().toISOString(),
        samplesPerCombo: SAMPLES_PER_COMBO,
        gridSizes: GRID_SIZES,
        gridShapes: GRID_SHAPES,
      },
      records,
    },
    null,
    2,
  ),
);
console.log(`\nDonnées brutes écrites : ${OUTPUT_PATH}`);

console.log("\n=== Résumé (score = nodesExplored / activeCells) ===");
console.log("Pooled:", summarize(records.map((r) => r.score)));
for (const size of GRID_SIZES) {
  const scores = records.filter((r) => r.size === size).map((r) => r.score);
  console.log(`toutes formes ${size}x${size}:`, summarize(scores));
}
for (const shape of GRID_SHAPES) {
  for (const size of GRID_SIZES) {
    const scores = records
      .filter((r) => r.shape === shape && r.size === size)
      .map((r) => r.score);
    console.log(`${shape} ${size}x${size}:`, summarize(scores));
  }
}
