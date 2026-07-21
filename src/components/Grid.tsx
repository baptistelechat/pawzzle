import { useCallback, useEffect, useRef } from "react";
import { PawPrint, X } from "lucide-react";
import type { Grid as GridType, Position } from "@/lib/engine/types";
import type { PlacedPawn } from "@/hooks/useLevel";
import { cn } from "@/lib/utils";
import { REGION_COLORS } from "@/lib/regionColors";

const DOUBLE_TAP_MS = 300;

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

  useEffect(() => {
    if (!help) return;

    const handleMove = (event: PointerEvent) => {
      if (!dragStart.current) return;
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
  }, [help, onSetMarker]);

  // Détection manuelle du double-tap : le `dblclick` natif n'est pas fiable au
  // tactile. Le marqueur du 1er tap est retardé (au lieu d'appliqué immédiatement)
  // pour ne pas flasher à l'écran juste avant d'être remplacé par l'animal.
  const lastTap = useRef<{
    row: number;
    col: number;
    time: number;
    timeoutId: number;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (lastTap.current) clearTimeout(lastTap.current.timeoutId);
    };
  }, []);

  const handleClick = useCallback(
    (row: number, col: number) => {
      const now = performance.now();
      const last = lastTap.current;
      if (
        last &&
        last.row === row &&
        last.col === col &&
        now - last.time < DOUBLE_TAP_MS
      ) {
        clearTimeout(last.timeoutId);
        lastTap.current = null;
        onTogglePaw({ row, col });
        return;
      }

      const timeoutId = window.setTimeout(() => {
        if (help) onToggleMarker({ row, col });
      }, DOUBLE_TAP_MS);
      lastTap.current = { row, col, time: now, timeoutId };
    },
    [help, onTogglePaw, onToggleMarker],
  );

  return (
    <div
      className="grid touch-none gap-1"
      style={{ gridTemplateColumns: `repeat(${grid.size}, minmax(0, 1fr))` }}
    >
      {grid.regions.map((rowRegions, row) =>
        rowRegions.map((region, col) => {
          const pawn = getPawn(row, col);
          return (
            <button
              key={`${row}-${col}`}
              type="button"
              data-row={row}
              data-col={col}
              aria-label={`Case ligne ${row + 1}, colonne ${col + 1}`}
              onPointerDown={() => {
                if (help) dragStart.current = { row, col };
              }}
              onClick={() => handleClick(row, col)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md border-2 transition-colors",
                pawn?.invalid ? "border-destructive" : "border-transparent",
              )}
              style={{
                backgroundColor: REGION_COLORS[region % REGION_COLORS.length],
              }}
            >
              {pawn ? (
                pawn.invalid ? (
                  <X className="size-2/3 text-destructive" />
                ) : (
                  <PawPrint className="size-2/3 text-foreground" />
                )
              ) : (
                isMarked(row, col) && (
                  <X className="size-1/2 text-foreground/60" />
                )
              )}
            </button>
          );
        }),
      )}
    </div>
  );
};
