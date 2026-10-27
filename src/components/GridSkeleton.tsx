import { m } from "motion/react";
import { EASE_OUT } from "@/lib/motion";

interface GridSkeletonProps {
  size: number;
}

// Affiché pendant la génération (worker) : le 10×10 peut prendre plusieurs
// secondes (cf. MAX_ATTEMPTS dans generator.ts) contre quasi instantané en
// 6×6/8×8. Dimensionné à la taille demandée pour ne pas sauter visuellement
// une fois la vraie grille reçue. Fondu simple (pas de pop par case) : la
// grille réelle qui apparaît ensuite garde seule l'animation d'entrée en
// cascade, pour ne pas la jouer deux fois.
export const GridSkeleton = ({ size }: GridSkeletonProps) => (
  <m.div
    className="grid gap-1"
    style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15, ease: EASE_OUT }}
  >
    {Array.from({ length: size * size }, (_, i) => (
      <div
        key={i}
        className="aspect-square animate-pulse rounded-[28%] bg-muted [corner-shape:squircle]"
      />
    ))}
  </m.div>
);
