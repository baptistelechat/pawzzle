import type { Difficulty } from "@/lib/engine/types";

// Seuils calibrés empiriquement sur 600 générations (100 par combinaison
// taille×forme, carré+cercle poolés par taille — biais assumé, voir
// docs/DIFFICULTY_RATING.md). Score = nodesExplored / activeCells.
// À refaire avec `pnpm difficulty:calibrate` si generateRegions ou
// GRID_SIZES change.
const THRESHOLDS: Record<number, { p25: number; median: number; p75: number }> =
  {
    6: { p25: 1.21, median: 1.75, p75: 2.53 },
    8: { p25: 2.76, median: 5.42, p75: 10.05 },
    10: { p25: 10.43, median: 26.74, p75: 68.91 },
  };

export const computeDifficulty = (score: number, size: number): Difficulty => {
  const thresholds = THRESHOLDS[size];
  // ponytail: taille hors calibration (hors GRID_SIZES) → valeur neutre plutôt qu'un crash
  if (!thresholds) return "medium";
  if (score <= thresholds.p25) return "easy";
  if (score <= thresholds.median) return "medium";
  if (score <= thresholds.p75) return "hard";
  return "extreme";
};
