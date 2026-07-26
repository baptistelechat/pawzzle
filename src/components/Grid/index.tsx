import { AnimatePresence, m } from "motion/react";
import type { Grid as GridType, Position } from "@/lib/engine/types";
import type { PlacedPawn } from "@/hooks/useLevel";
import { RING_DURATION_MS, useGridGestures } from "@/hooks/useGridGestures";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { REGION_COLORS } from "@/lib/regionColors";
import { CellContent } from "./components/CellContent";
import { PressRing } from "./components/PressRing";

// Exportées pour que App.tsx puisse caler le son `new_game` sur la fin réelle
// de l'animation d'apparition (dernière case = delay max + durée).
export const CELL_TRANSITION_MS = 220;
export const CELL_STAGGER_MS = 20;

interface GridProps {
  grid: GridType;
  placed: PlacedPawn[];
  markers: Position[];
  help: boolean;
  errors: number;
  disabled: boolean;
  showSolution: boolean;
  solution: Position[];
  onTogglePaw: (position: Position) => void;
  onToggleMarker: (position: Position) => void;
  onSetMarker: (position: Position, shouldMark: boolean) => void;
}

export const Grid = ({
  grid,
  placed,
  markers,
  help,
  errors,
  disabled,
  showSolution,
  solution,
  onTogglePaw,
  onToggleMarker,
  onSetMarker,
}: GridProps) => {
  const getPawn = (row: number, col: number) =>
    placed.find((p) => p.row === row && p.col === col);
  const isMarked = (row: number, col: number) =>
    markers.some((p) => p.row === row && p.col === col);
  const isSolution = (row: number, col: number) =>
    solution.some((p) => p.row === row && p.col === col);

  const { reduceMotion, shakeControls, pressingCell, handleCellPointerDown } =
    useGridGestures({
      help,
      disabled,
      errors,
      markers,
      onTogglePaw,
      onToggleMarker,
      onSetMarker,
    });

  return (
    // Fondu simple au niveau du bloc entier quand la grille disparaît (retour
    // au skeleton) : seule l'apparition (par case, en cascade) garde l'effet
    // spectaculaire, pour ne pas le rejouer une seconde fois à la sortie.
    <m.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: EASE_OUT }}
    >
      <m.div
        className="grid touch-none gap-1"
        style={{ gridTemplateColumns: `repeat(${grid.size}, minmax(0, 1fr))` }}
        animate={shakeControls}
      >
        {grid.regions.map((rowRegions, row) =>
          rowRegions.map((region, col) => {
            const pawn = getPawn(row, col);
            // Uniquement les cases jamais tentées : celles déjà trouvées par
            // le joueur gardent leur rendu normal (pas de bordure verte en trop).
            const isSolutionCell =
              !pawn && showSolution && isSolution(row, col);
            return (
              <m.button
                key={`${row}-${col}`}
                type="button"
                data-row={row}
                data-col={col}
                aria-label={`Case ligne ${row + 1}, colonne ${col + 1}`}
                onPointerDown={(event) =>
                  handleCellPointerDown(row, col, !!pawn, event)
                }
                initial={
                  reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: CELL_TRANSITION_MS / 1000,
                  ease: EASE_OUT,
                  delay: reduceMotion
                    ? 0
                    : ((row + col) * CELL_STAGGER_MS) / 1000,
                }}
                className={cn(
                  "relative flex aspect-square items-center justify-center rounded-[28%] border-2 transition-colors [corner-shape:squircle]",
                  pawn?.invalid
                    ? "border-destructive"
                    : isSolutionCell
                      ? "border-emerald-600 dark:border-emerald-400"
                      : "border-transparent",
                )}
                style={{
                  backgroundColor: REGION_COLORS[region % REGION_COLORS.length],
                }}
              >
                <CellContent
                  pawn={pawn}
                  marked={isMarked(row, col)}
                  showSolution={isSolutionCell}
                  row={row}
                  col={col}
                  staggerDelay={((row + col) * CELL_STAGGER_MS) / 1000}
                  reduceMotion={!!reduceMotion}
                />
                {!reduceMotion && (
                  <AnimatePresence>
                    {pressingCell?.row === row && pressingCell?.col === col && (
                      <PressRing durationMs={RING_DURATION_MS} />
                    )}
                  </AnimatePresence>
                )}
              </m.button>
            );
          }),
        )}
      </m.div>
    </m.div>
  );
};
