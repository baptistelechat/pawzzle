import { useCallback, useEffect, useRef, useState } from "react";
import type { Vibration } from "web-haptics";
import type { Level, Position } from "@/lib/engine/types";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

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
  // Miroirs synchrones de `errors`/`placed`/`status` : évitent de lire une
  // valeur figée par closure si deux poses se déclenchent avant que React ait
  // re-rendu. Ces refs sont la source de vérité lue par les handlers ; les
  // states homonymes ne servent qu'au rendu (cf. BDR-034, LRN-024).
  const errorsRef = useRef(0);
  const placedRef = useRef<PlacedPawn[]>([]);
  const statusRef = useRef<Status>("loading");
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

  // Seul point d'écriture du statut : met le ref et le state à jour d'un même
  // geste, pour qu'aucun futur appel ne puisse oublier le miroir — c'est
  // exactement l'oubli qui avait laissé `status` figé dans togglePaw (LRN-024).
  const updateStatus = useCallback((next: Status) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const newLevel = useCallback(() => {
    updateStatus("loading");
    setPlaced([]);
    setMarkers([]);
    setErrors(0);
    errorsRef.current = 0;
    placedRef.current = [];
    workerRef.current?.postMessage({ size: GRID_SIZE });
  }, [updateStatus]);

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
      updateStatus("playing");
      setLevelId((id) => id + 1);
    };
    workerRef.current = worker;
    worker.postMessage({ size: GRID_SIZE });
    return () => worker.terminate();
  }, [updateStatus]);

  const togglePaw = useCallback(
    (candidate: Position) => {
      if (!level || statusRef.current !== "playing") return;
      const existing = placedRef.current.find((p) =>
        samePosition(p, candidate),
      );
      if (existing) return; // case déjà tentée (correcte ou fautive) : figée, non retirable

      setMarkers((prev) => prev.filter((m) => !samePosition(m, candidate)));
      const invalid = !level.solution.some((s) => samePosition(s, candidate));
      const next = [...placedRef.current, { ...candidate, invalid }];
      placedRef.current = next;
      setPlaced(next);

      const willWin =
        !invalid &&
        next.filter((p) => !p.invalid).length === level.solution.length;
      const willLose = invalid && errorsRef.current + 1 >= MAX_ERRORS;

      haptics.cancel();
      haptics.trigger(
        invalid ? (willLose ? "error" : "warning") : SUCCESS_HAPTIC,
      );
      sounds.play(
        invalid
          ? willLose
            ? "game_over"
            : "paw_incorrect"
          : willWin
            ? "victory"
            : "paw_correct",
      );

      if (invalid) {
        // Borné à MAX_ERRORS : au-delà, HeartsRow annoncerait « Erreurs : 4 / 3 »
        // et `isLastHeart` (maxErrors - errors === 1) ne matcherait plus jamais.
        errorsRef.current = Math.min(errorsRef.current + 1, MAX_ERRORS);
        setErrors(errorsRef.current);
        if (willLose) updateStatus("lost");
      } else if (willWin) {
        updateStatus("won");
      }
    },
    [level, updateStatus],
  );

  const toggleMarker = useCallback(
    (candidate: Position) => {
      if (statusRef.current !== "playing" || !help) return;
      if (placedRef.current.some((p) => samePosition(p, candidate))) return;
      setMarkers((prev) => {
        const exists = prev.some((m) => samePosition(m, candidate));
        sounds.play(exists ? "marker_remove" : "marker_add");
        return exists
          ? prev.filter((m) => !samePosition(m, candidate))
          : [...prev, candidate];
      });
    },
    [help],
  );

  const setMarker = useCallback(
    (candidate: Position, shouldMark: boolean) => {
      if (statusRef.current !== "playing" || !help) return;
      // Lu depuis le ref, pas depuis `placed` : togglePaw écrit placedRef en
      // synchrone, donc un glisser concurrent voyait l'ancien state et pouvait
      // re-marquer une case venant de recevoir un pion (marqueur fantôme,
      // invisible car CellContent court-circuite sur pawn, et non retirable).
      if (placedRef.current.some((p) => samePosition(p, candidate))) return;
      setMarkers((prev) => {
        const exists = prev.some((m) => samePosition(m, candidate));
        if (exists === shouldMark) return prev;
        sounds.play("drag_paint_tick");
        return shouldMark
          ? [...prev, candidate]
          : prev.filter((m) => !samePosition(m, candidate));
      });
    },
    [help],
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
