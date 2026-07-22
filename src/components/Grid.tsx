import { useEffect, useRef } from "react";
import { PawPrint, X } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import type { Grid as GridType, Position } from "@/lib/engine/types";
import type { PlacedPawn } from "@/hooks/useLevel";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { REGION_COLORS } from "@/lib/regionColors";

// ponytail: le comptage tap/double-tap était fragile à la vitesse d'appui
// (un double-tap trop lent posait puis retirait un marqueur). Geste par nature
// au lieu de geste par timing : tap = marqueur, appui long = animal, glisser =
// pose en chaîne de marqueurs (inchangé). 450ms = seuil usuel mobile.
const LONG_PRESS_MS = 450;

// Exportées pour que App.tsx puisse caler le son `new_game` sur la fin réelle
// de l'animation d'apparition (dernière case = delay max + durée).
export const CELL_TRANSITION_MS = 220;
export const CELL_STAGGER_MS = 20;

interface GridProps {
  grid: GridType;
  placed: PlacedPawn[];
  markers: Position[];
  help: boolean;
  onTogglePaw: (position: Position) => void;
  onToggleMarker: (position: Position) => void;
  onSetMarker: (position: Position, shouldMark: boolean) => void;
}

export const Grid = ({
  grid,
  placed,
  markers,
  help,
  onTogglePaw,
  onToggleMarker,
  onSetMarker,
}: GridProps) => {
  const getPawn = (row: number, col: number) =>
    placed.find((p) => p.row === row && p.col === col);
  const isMarked = (row: number, col: number) =>
    markers.some((p) => p.row === row && p.col === col);
  const reduceMotion = useReducedMotion();

  // Ref miroir : le pointermove global lit toujours l'état de marqueurs le plus
  // récent, sans dépendre de `markers` dans les deps de l'effet (fige la closure).
  const markersRef = useRef(markers);
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  // Suit le glissement au pixel près (elementFromPoint) plutôt qu'aux événements
  // pointerenter des boutons, car le capture implicite du tactile les bloquerait.
  const dragStart = useRef<Position | null>(null);
  const dragActive = useRef(false);
  const dragShouldMark = useRef(true);
  const visited = useRef(new Set<string>());

  // Cellule sous le doigt/curseur depuis le pointerdown, suivie même quand
  // `help` est désactivé (l'appui long pour poser l'animal ne dépend pas de l'aide).
  const pressStart = useRef<Position | null>(null);
  const longPressTimeout = useRef<number | null>(null);
  const longPressFired = useRef(false);

  const clearLongPress = () => {
    if (longPressTimeout.current !== null) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };
  useEffect(() => clearLongPress, []);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!help || !dragStart.current) return;
      const cell = (event.target as HTMLElement | null)?.ownerDocument
        ?.elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("[data-row]");
      if (!cell) return;
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);

      if (!dragActive.current) {
        if (row === dragStart.current.row && col === dragStart.current.col)
          return;
        dragActive.current = true;
        clearLongPress(); // un vrai glissement n'est pas un appui long
        dragShouldMark.current = !markersRef.current.some(
          (m) =>
            m.row === dragStart.current?.row &&
            m.col === dragStart.current?.col,
        );
        visited.current.add(
          `${dragStart.current.row}-${dragStart.current.col}`,
        );
        onSetMarker(dragStart.current, dragShouldMark.current);
      }

      const key = `${row}-${col}`;
      if (visited.current.has(key)) return;
      visited.current.add(key);
      onSetMarker({ row, col }, dragShouldMark.current);
    };

    const handleUp = () => {
      clearLongPress();
      if (
        help &&
        !longPressFired.current &&
        !dragActive.current &&
        pressStart.current
      ) {
        onToggleMarker(pressStart.current);
      }
      longPressFired.current = false;
      pressStart.current = null;
      dragStart.current = null;
      dragActive.current = false;
      visited.current = new Set();
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [help, onSetMarker, onToggleMarker]);

  return (
    <div
      className="grid touch-none gap-1"
      style={{ gridTemplateColumns: `repeat(${grid.size}, minmax(0, 1fr))` }}
    >
      {grid.regions.map((rowRegions, row) =>
        rowRegions.map((region, col) => {
          const pawn = getPawn(row, col);
          return (
            <m.button
              key={`${row}-${col}`}
              type="button"
              data-row={row}
              data-col={col}
              aria-label={`Case ligne ${row + 1}, colonne ${col + 1}`}
              onPointerDown={() => {
                pressStart.current = { row, col };
                if (help) dragStart.current = { row, col };
                longPressFired.current = false;
                longPressTimeout.current = window.setTimeout(() => {
                  longPressFired.current = true;
                  onTogglePaw({ row, col });
                }, LONG_PRESS_MS);
              }}
              initial={
                reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
              transition={{
                duration: CELL_TRANSITION_MS / 1000,
                ease: EASE_OUT,
                delay: reduceMotion
                  ? 0
                  : ((row + col) * CELL_STAGGER_MS) / 1000,
              }}
              className={cn(
                "flex aspect-square items-center justify-center rounded-[28%] border-2 transition-colors [corner-shape:squircle]",
                pawn?.invalid ? "border-destructive" : "border-transparent",
              )}
              style={{
                backgroundColor: REGION_COLORS[region % REGION_COLORS.length],
              }}
            >
              {pawn ? (
                <m.span
                  key={`${pawn.invalid ? "x" : "paw"}-${row}-${col}`}
                  className={cn(
                    "flex items-center justify-center",
                    pawn.invalid ? "size-1/2" : "size-2/3",
                  )}
                  initial={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.14, ease: EASE_OUT }}
                >
                  {pawn.invalid ? (
                    <X className="size-full text-destructive" />
                  ) : (
                    <PawPrint className="size-full text-foreground" />
                  )}
                </m.span>
              ) : (
                isMarked(row, col) && (
                  <X className="size-1/2 text-foreground/60" />
                )
              )}
            </m.button>
          );
        }),
      )}
    </div>
  );
};
