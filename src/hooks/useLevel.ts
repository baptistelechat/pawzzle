import { useCallback, useEffect, useRef, useState } from "react";
import type { Level, Position } from "@/lib/engine/types";

const GRID_SIZE = 6;
const MAX_ERRORS = 3; // ponytail: budget arbitraire, à ajuster après test interne (Phase 3)

type Status = "loading" | "playing" | "won" | "lost";

export interface PlacedPawn extends Position {
  invalid: boolean;
}

const samePosition = (a: Position, b: Position) =>
  a.row === b.row && a.col === b.col;

export const useLevel = () => {
  const workerRef = useRef<Worker | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [placed, setPlaced] = useState<PlacedPawn[]>([]);
  const [markers, setMarkers] = useState<Position[]>([]);
  const [errors, setErrors] = useState(0);
  const [status, setStatus] = useState<Status>("loading");
  const [help, setHelp] = useState(true);

  const newLevel = useCallback(() => {
    setStatus("loading");
    setPlaced([]);
    setMarkers([]);
    setErrors(0);
    workerRef.current?.postMessage({ size: GRID_SIZE });
  }, []);

  useEffect(() => {
    const worker = new Worker(
      new URL("@/lib/engine/generateLevel.worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.onmessage = (event: MessageEvent<Level>) => {
      setLevel(event.data);
      setStatus("playing");
    };
    workerRef.current = worker;
    worker.postMessage({ size: GRID_SIZE });
    return () => worker.terminate();
  }, []);

  const togglePaw = useCallback(
    (candidate: Position) => {
      if (!level || status !== "playing") return;
      const existing = placed.find((p) => samePosition(p, candidate));
      if (existing) {
        if (!existing.invalid) return; // réponse correcte : ne se retire pas
        setPlaced((prev) => prev.filter((p) => !samePosition(p, candidate)));
        return;
      }

      setMarkers((prev) => prev.filter((m) => !samePosition(m, candidate)));
      const invalid = !level.solution.some((s) => samePosition(s, candidate));
      const next = [...placed, { ...candidate, invalid }];
      setPlaced(next);

      if (invalid) {
        setErrors((prev) => {
          const nextErrors = prev + 1;
          if (nextErrors >= MAX_ERRORS) setStatus("lost");
          return nextErrors;
        });
      } else if (
        next.filter((p) => !p.invalid).length === level.solution.length
      ) {
        setStatus("won");
      }
    },
    [level, placed, status],
  );

  const toggleMarker = useCallback(
    (candidate: Position) => {
      if (status !== "playing" || !help) return;
      if (placed.some((p) => samePosition(p, candidate))) return;
      setMarkers((prev) =>
        prev.some((m) => samePosition(m, candidate))
          ? prev.filter((m) => !samePosition(m, candidate))
          : [...prev, candidate],
      );
    },
    [placed, status, help],
  );

  const setMarker = useCallback(
    (candidate: Position, shouldMark: boolean) => {
      if (status !== "playing" || !help) return;
      if (placed.some((p) => samePosition(p, candidate))) return;
      setMarkers((prev) => {
        const exists = prev.some((m) => samePosition(m, candidate));
        if (exists === shouldMark) return prev;
        return shouldMark
          ? [...prev, candidate]
          : prev.filter((m) => !samePosition(m, candidate));
      });
    },
    [placed, status, help],
  );

  return {
    level,
    placed,
    markers,
    errors,
    maxErrors: MAX_ERRORS,
    status,
    help,
    setHelp,
    togglePaw,
    toggleMarker,
    setMarker,
    newLevel,
  };
};
