import type { Difficulty } from "@/lib/engine/types";

// Seuils calibrés empiriquement sur 600 générations (100 par combinaison
// taille×forme, carré+cercle poolés par taille — biais assumé, voir
// docs/DIFFICULTY_RATING.md). Score = nodesExplored / activeCells.
// À refaire avec `pnpm difficulty:calibrate` si generateRegions ou
// GRID_SIZES change.
const THRESHOLDS: Record<number, { p33: number; p67: number }> = {
  6: { p33: 1.41, p67: 2.03 },
  8: { p33: 3.24, p67: 7.75 },
  10: { p33: 10.8, p67: 44.12 },
};

export const computeDifficulty = (score: number, size: number): Difficulty => {
  const thresholds = THRESHOLDS[size];
  // ponytail: taille hors calibration (hors GRID_SIZES) → valeur neutre plutôt qu'un crash
  if (!thresholds) return "medium";
  if (score <= thresholds.p33) return "easy";
  if (score <= thresholds.p67) return "medium";
  return "hard";
};
