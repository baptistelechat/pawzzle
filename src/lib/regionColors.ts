// 6 couleurs de base (teintes pastel espacées à 60°) + 4 couleurs plus foncées
// et désaturées (brun/gris/marine/olive) pour les tailles 8 et 10 — l'écart de
// luminosité/chroma évite la confusion qu'un simple cercle de teintes à 10
// crans produit (deux teintes voisines deviennent indissociables).
export const REGION_COLORS = [
  "oklch(0.85 0.1 30)", // rouge
  "oklch(0.85 0.1 90)", // jaune
  "oklch(0.85 0.1 150)", // vert
  "oklch(0.85 0.1 210)", // bleu
  "oklch(0.85 0.1 270)", // violet
  "oklch(0.85 0.1 330)", // rose
  "oklch(0.72 0.08 55)", // brun
  "oklch(0.82 0.015 250)", // gris
  "oklch(0.68 0.08 250)", // marine
  "oklch(0.72 0.08 120)", // olive
];
