// Réimplémentation autonome du moteur (src/lib/engine/{generator,solver,shapes,deduction}.ts)
// — même pattern que l'ancien calibrate-difficulty.mjs / BDR-053 / LRN-040 :
// script hors application, pas d'import des modules TS du projet.
//
// Le classifieur par déduction logique (src/lib/engine/deduction.ts) n'a pas
// de seuil à calibrer — ce script mesure juste la répartition easy/medium/hard
// obtenue, pour vérifier qu'elle n'est pas dégénérée (LRN-040/042/043 :
// mesurer plutôt que supposer).

const GRID_SIZES = [6, 8, 10];
const GRID_SHAPES = ["square", "circle"];
const SAMPLES_PER_COMBO = 100;
const MAX_ATTEMPTS = 5000;

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

// Identique à solver.ts::countSolutions — seule l'unicité importe ici, le
// classifieur de difficulté ne dépend plus du solveur brute-force.
const countSolutions = (grid, cap) => {
  const solutions = [];

  const backtrack = (row, placed) => {
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
  return solutions;
};

// Identique à src/lib/engine/deduction.ts — même algorithme, réimplémenté en JS.
const rowUnits = (grid) =>
  Array.from({ length: grid.size }, (_, row) =>
    Array.from({ length: grid.size }, (_, col) => ({ row, col })).filter(
      (cell) => grid.active[cell.row][cell.col],
    ),
  );

const colUnits = (grid) =>
  Array.from({ length: grid.size }, (_, col) =>
    Array.from({ length: grid.size }, (_, row) => ({ row, col })).filter(
      (cell) => grid.active[cell.row][cell.col],
    ),
  );

const regionUnits = (grid) => {
  const units = Array.from({ length: grid.size }, () => []);
  for (let row = 0; row < grid.size; row++) {
    for (let col = 0; col < grid.size; col++) {
      if (!grid.active[row][col]) continue;
      units[grid.regions[row][col]].push({ row, col });
    }
  }
  return units;
};

const eliminateAround = (candidates, grid, placedCell) => {
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

const solveByLogic = (grid) => {
  const candidates = grid.active.map((row) => [...row]);
  const placed = [];
  const solvedRows = new Set();
  const solvedCols = new Set();
  const solvedRegions = new Set();
  const rows = rowUnits(grid);
  const cols = colUnits(grid);
  const regions = regionUnits(grid);
  let usedPointing = false;

  const remaining = (unit) =>
    unit.filter((cell) => candidates[cell.row][cell.col]);

  const place = (cell) => {
    placed.push(cell);
    solvedRows.add(cell.row);
    solvedCols.add(cell.col);
    solvedRegions.add(grid.regions[cell.row][cell.col]);
    eliminateAround(candidates, grid, cell);
  };

  const applyForcedSingles = () => {
    let progressed = false;
    const groups = [
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

  const drainForcedSingles = () => {
    let any = false;
    while (applyForcedSingles()) any = true;
    return any;
  };

  const applyPointingReduction = () => {
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

const classifyDifficulty = (grid) => {
  const result = solveByLogic(grid);
  if (!result.complete) return "hard";
  return result.usedPointing ? "medium" : "easy";
};

const generateClassifiedLevel = (size, shape) => {
  const active = createShapeMask(shape, size);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const grid = { size, regions: generateRegions(size, active), active };
    const solutions = countSolutions(grid, 2);
    if (solutions.length === 1) return classifyDifficulty(grid);
  }
  throw new Error(
    `aucune grille à solution unique pour size=${size} shape=${shape} après ${MAX_ATTEMPTS} tentatives`,
  );
};

const tally = { easy: 0, medium: 0, hard: 0 };
const byCombo = {};

for (const shape of GRID_SHAPES) {
  for (const size of GRID_SIZES) {
    const key = `${shape} ${size}x${size}`;
    console.log(`-- ${key} --`);
    byCombo[key] = { easy: 0, medium: 0, hard: 0 };
    for (let i = 0; i < SAMPLES_PER_COMBO; i++) {
      const difficulty = generateClassifiedLevel(size, shape);
      tally[difficulty]++;
      byCombo[key][difficulty]++;
      if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${SAMPLES_PER_COMBO}`);
    }
  }
}

const pct = (n, total) => `${Math.round((n / total) * 100)}%`;
const total = GRID_SIZES.length * GRID_SHAPES.length * SAMPLES_PER_COMBO;

console.log("\n=== Répartition par combinaison taille×forme ===");
for (const [key, counts] of Object.entries(byCombo)) {
  console.log(
    `${key}: easy=${pct(counts.easy, SAMPLES_PER_COMBO)} medium=${pct(counts.medium, SAMPLES_PER_COMBO)} hard=${pct(counts.hard, SAMPLES_PER_COMBO)}`,
  );
}

console.log("\n=== Répartition globale ===");
console.log(
  `easy=${pct(tally.easy, total)} medium=${pct(tally.medium, total)} hard=${pct(tally.hard, total)} (n=${total})`,
);
