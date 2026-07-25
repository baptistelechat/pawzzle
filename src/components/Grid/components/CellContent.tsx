import { PawPrint, X } from "lucide-react";
import { m } from "motion/react";
import type { PlacedPawn } from "@/hooks/useLevel";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface CellContentProps {
  pawn: PlacedPawn | undefined;
  marked: boolean;
  showSolution: boolean;
  row: number;
  col: number;
  staggerDelay: number;
  reduceMotion: boolean;
}

export const CellContent = ({
  pawn,
  marked,
  showSolution,
  row,
  col,
  staggerDelay,
  reduceMotion,
}: CellContentProps) => {
  if (pawn) {
    return (
      <m.span
        key={`${pawn.invalid ? "x" : "paw"}-${row}-${col}`}
        className={cn(
          "flex items-center justify-center",
          pawn.invalid ? "size-1/2" : "size-2/3",
        )}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.14, ease: EASE_OUT }}
      >
        {pawn.invalid ? (
          <X className="size-full text-destructive" />
        ) : (
          <PawPrint className="size-full text-foreground" />
        )}
      </m.span>
    );
  }

  // Case correcte jamais tentée, révélée en cas d'échec — patte verte pleine
  // (fill) + bordure de la case assortie (border-emerald-*) : le vert doux de
  // `--accent` se fondait dans les régions pastel, un vert plus saturé
  // reste lisible sur n'importe quel fond de case.
  if (showSolution) {
    return (
      <m.span
        key={`solution-${row}-${col}`}
        className="flex size-2/3 items-center justify-center"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.25,
          ease: EASE_OUT,
          delay: reduceMotion ? 0 : staggerDelay,
        }}
      >
        <PawPrint
          className="size-full text-emerald-600 dark:text-emerald-400"
          strokeWidth={2}
          fill="currentColor"
          fillOpacity={0.25}
        />
      </m.span>
    );
  }

  return marked ? <X className="size-1/2 text-foreground/60" /> : null;
};
