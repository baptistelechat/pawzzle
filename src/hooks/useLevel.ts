import { useCallback, useEffect, useRef, useState } from "react";
import type { Vibration } from "web-haptics";
import type { Level, Position } from "@/lib/engine/types";
import { haptics } from "@/lib/haptics";

const GRID_SIZE = 6;
const MAX_ERRORS = 3; // ponytail: budget arbitraire, à ajuster après test interne (Phase 3)

// Le preset "success" intégré (30ms+40ms) est perçu comme trop faible — pattern
// custom plus long et plus intense, réutilisé pour toute pose correcte (pas
// seulement la victoire finale) pour que chaque bon coup se sente "réussi".
const SUCCESS_HAPTIC: Vibration[] = [
  { duration: 45, intensity: 0.7 },
  { delay: 60, duration: 45, intensity: 0.9 },
  { delay: 60, duration: 140, intensity: 1 },
];

type Status = "loading" | "playing" | "won" | "lost";

export interface PlacedPawn extends Position {
  invalid: boolean;
}

const samePosition = (a: Position, b: Position) =>
  a.row === b.row && a.col === b.col;

export const useLevel = () => {
  const workerRef = useRef<Worker | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  // Incrémenté à chaque nouvelle grille reçue : sert de clé de remount pour
  // Grid, seul déclencheur fiable de son animation de sortie/entrée (le
  // statut "loading" est trop éphémère pour être peint par React/le worker).
  const [levelId, setLevelId] = useState(0);
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
    worker.onmessage = (
      event: MessageEvent<{ ok: true; level: Level } | { ok: false }>,
    ) => {
      if (!event.data.ok) {
        // Grille sans solution unique trouvée (garde-fou anti-boucle infinie
        // du générateur) : on retente avec un nouveau seed au lieu de laisser
        // le spinner bloqué indéfiniment.
        worker.postMessage({ size: GRID_SIZE });
        return;
      }
      setLevel(event.data.level);
      setStatus("playing");
      setLevelId((id) => id + 1);
    };
    workerRef.current = worker;
    worker.postMessage({ size: GRID_SIZE });
    return () => worker.terminate();
  }, []);

  const togglePaw = useCallback(
    (candidate: Position) => {
      if (!level || status !== "playing") return;
      const existing = placed.find((p) => samePosition(p, candidate));
      if (existing) return; // case déjà tentée (correcte ou fautive) : figée, non retirable

      setMarkers((prev) => prev.filter((m) => !samePosition(m, candidate)));
      const invalid = !level.solution.some((s) => samePosition(s, candidate));
      const next = [...placed, { ...candidate, invalid }];
      setPlaced(next);

      const willWin =
        !invalid &&
        next.filter((p) => !p.invalid).length === level.solution.length;
      const willLose = invalid && errors + 1 >= MAX_ERRORS;

      haptics.cancel();
      haptics.trigger(
        invalid ? (willLose ? "error" : "warning") : SUCCESS_HAPTIC,
      );

      if (invalid) {
        setErrors((prev) => {
          const nextErrors = prev + 1;
          if (nextErrors >= MAX_ERRORS) setStatus("lost");
          return nextErrors;
        });
      } else if (willWin) {
        setStatus("won");
      }
    },
    [level, placed, status, errors],
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
    levelId,
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
