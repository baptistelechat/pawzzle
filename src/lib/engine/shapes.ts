import type { GridShape } from "@/lib/engine/types";

const createSquareMask = (size: number): boolean[][] =>
  Array.from({ length: size }, () => Array(size).fill(true));

// radius = size / 2 garantit que la case centrale de chaque ligne/colonne
// extrême (distance max (size-1)/2) reste toujours active, quelle que soit
// la taille — aucune ligne/colonne totalement vide.
//
// ponytail: un rayon plus serré (ex. -0.25 sur 6×6) donne un contour plus
// rond visuellement, mais réduit tellement les lignes que la génération à
// solution unique force systématiquement les chats sur les bords (mesuré :
// 100% des cases-solution en bord vs 47% avec ce rayon) — niveau ennuyeux.
// Rayon inchangé pour toutes les tailles, quitte à avoir un 6×6 moins rond.
const createCircleMask = (size: number): boolean[][] => {
  const center = (size - 1) / 2;
  const radius = size / 2;
  return Array.from({ length: size }, (_, row) =>
    Array.from(
      { length: size },
      (_, col) => Math.hypot(row - center, col - center) <= radius,
    ),
  );
};

export const createShapeMask = (shape: GridShape, size: number): boolean[][] =>
  shape === "circle" ? createCircleMask(size) : createSquareMask(size);
