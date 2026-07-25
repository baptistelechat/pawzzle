import { useEffect, useRef, useState } from "react";
import { useAnimation, useReducedMotion } from "motion/react";
import type { Position } from "@/lib/engine/types";

// ponytail: le comptage tap/double-tap était fragile à la vitesse d'appui
// (un double-tap trop lent posait puis retirait un marqueur). Geste par nature
// au lieu de geste par timing : tap = marqueur, appui long = animal, glisser =
// pose en chaîne de marqueurs (inchangé). 450ms = seuil usuel mobile.
export const LONG_PRESS_MS = 450;

// Délai avant l'apparition visuelle du cercle : un tap ou un début de glisser
// ne doit pas le faire flasher. Purement visuel, ne change pas LONG_PRESS_MS.
const RING_APPEAR_DELAY_MS = 120;

// Distance (px) au-delà de laquelle on considère qu'il y a glissement plutôt
// qu'un appui immobile — annule l'appui long, même avant de changer de case.
const SLIDE_THRESHOLD_PX = 10;

// Seuil (plus petit que SLIDE_THRESHOLD_PX) qui cache le cercle dès les
// premiers pixels de mouvement : purement cosmétique, ne touche pas à
// l'appui long lui-même — évite que le cercle flashe en début de glisser.
const RING_CANCEL_THRESHOLD_PX = 4;

export const RING_DURATION_MS = LONG_PRESS_MS - RING_APPEAR_DELAY_MS;

interface UseGridGesturesParams {
  help: boolean;
  disabled: boolean;
  errors: number;
  markers: Position[];
  onTogglePaw: (position: Position) => void;
  onToggleMarker: (position: Position) => void;
  onSetMarker: (position: Position, shouldMark: boolean) => void;
}

// Machine à états du geste (tap / appui long / glisser) + secousse de la
// grille sur erreur. Isolé de Grid en hook pour garder le composant sous la
// limite de 200 lignes — cette logique n'a pas de rendu propre.
export const useGridGestures = ({
  help,
  disabled,
  errors,
  markers,
  onTogglePaw,
  onToggleMarker,
  onSetMarker,
}: UseGridGesturesParams) => {
  const reduceMotion = useReducedMotion();

  // Secoue la grille à chaque nouvelle erreur (pas au montage ni sur une
  // simple pose correcte) — signal visuel court, indépendant du son/haptique.
  const shakeControls = useAnimation();
  const prevErrors = useRef(errors);
  useEffect(() => {
    const increased = errors > prevErrors.current;
    prevErrors.current = errors;
    if (!increased || reduceMotion) return;
    shakeControls.start({
      x: [0, -10, 10, -8, 8, -4, 4, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    });
  }, [errors, reduceMotion, shakeControls]);

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
  const pressOrigin = useRef<{ x: number; y: number } | null>(null);
  const longPressTimeout = useRef<number | null>(null);
  const longPressFired = useRef(false);
  // Pilote l'affichage du cercle de chargement (une seule cellule à la fois).
  const [pressingCell, setPressingCell] = useState<Position | null>(null);
  const ringAppearTimeout = useRef<number | null>(null);

  const clearLongPress = () => {
    if (longPressTimeout.current !== null) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
    if (ringAppearTimeout.current !== null) {
      clearTimeout(ringAppearTimeout.current);
      ringAppearTimeout.current = null;
    }
  };
  useEffect(() => clearLongPress, []);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      // Glissement détecté au pixel près, indépendamment de `help` : un vrai
      // déplacement annule l'appui long même sans avoir changé de case.
      if (pressOrigin.current) {
        const dx = event.clientX - pressOrigin.current.x;
        const dy = event.clientY - pressOrigin.current.y;
        const distSq = dx * dx + dy * dy;
        // Cache le cercle dès un tout petit mouvement, sans attendre le
        // seuil (plus large) qui annule réellement l'appui long.
        if (
          distSq > RING_CANCEL_THRESHOLD_PX * RING_CANCEL_THRESHOLD_PX &&
          ringAppearTimeout.current !== null
        ) {
          clearTimeout(ringAppearTimeout.current);
          ringAppearTimeout.current = null;
          setPressingCell(null);
        }
        if (
          longPressTimeout.current !== null &&
          distSq > SLIDE_THRESHOLD_PX * SLIDE_THRESHOLD_PX
        ) {
          clearLongPress();
          setPressingCell(null);
        }
      }

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
        setPressingCell(null);
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
      setPressingCell(null);
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
      pressOrigin.current = null;
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

  const handleCellPointerDown = (
    row: number,
    col: number,
    hasPawn: boolean,
    event: { clientX: number; clientY: number },
  ) => {
    // Case déjà tentée (correcte ou fautive) : figée, ou partie terminée :
    // aucune action possible — pas la peine de lancer l'appui long ni son cercle.
    if (disabled || hasPawn) return;
    // Un second doigt écrasait `longPressTimeout` sans annuler le timer déjà
    // armé : les deux finissaient par appeler onTogglePaw, d'où deux togglePaw
    // concurrents avant le moindre re-render (cf. BLK-011). Tout l'état de
    // geste ci-dessous est déjà mono-pointeur (refs uniques) — on annule donc
    // le geste en cours pour de vrai avant d'en armer un nouveau.
    clearLongPress();
    setPressingCell(null);
    pressStart.current = { row, col };
    pressOrigin.current = { x: event.clientX, y: event.clientY };
    if (help) dragStart.current = { row, col };
    longPressFired.current = false;
    ringAppearTimeout.current = window.setTimeout(() => {
      setPressingCell({ row, col });
    }, RING_APPEAR_DELAY_MS);
    longPressTimeout.current = window.setTimeout(() => {
      longPressFired.current = true;
      setPressingCell(null);
      onTogglePaw({ row, col });
    }, LONG_PRESS_MS);
  };

  return {
    reduceMotion,
    shakeControls,
    pressingCell,
    handleCellPointerDown,
  };
};
