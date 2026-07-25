// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LONG_PRESS_MS, useGridGestures } from "@/hooks/useGridGestures";

const setup = () => {
  const onTogglePaw = vi.fn();
  const onToggleMarker = vi.fn();
  const onSetMarker = vi.fn();
  const view = renderHook(() =>
    useGridGestures({
      help: true,
      disabled: false,
      errors: 0,
      markers: [],
      onTogglePaw,
      onToggleMarker,
      onSetMarker,
    }),
  );
  return { view, onTogglePaw, onToggleMarker, onSetMarker };
};

const press = (
  view: ReturnType<typeof setup>["view"],
  row: number,
  col: number,
  hasPawn = false,
) => {
  act(() => {
    view.result.current.handleCellPointerDown(row, col, hasPawn, {
      clientX: col * 50,
      clientY: row * 50,
    });
  });
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useGridGestures — appui long", () => {
  it("pose l'animal après LONG_PRESS_MS", () => {
    const { view, onTogglePaw } = setup();
    press(view, 2, 3);
    act(() => void vi.advanceTimersByTime(LONG_PRESS_MS));
    expect(onTogglePaw).toHaveBeenCalledExactlyOnceWith({ row: 2, col: 3 });
  });

  // Régression BLK-011 : un second pointerdown écrasait `longPressTimeout` sans
  // annuler le timer déjà armé — les deux appelaient onTogglePaw, produisant
  // deux togglePaw concurrents avant le moindre re-render.
  it("n'arme qu'un seul appui long quand deux doigts pressent deux cases", () => {
    const { view, onTogglePaw } = setup();
    press(view, 0, 0);
    press(view, 1, 1);
    act(() => void vi.advanceTimersByTime(LONG_PRESS_MS * 2));
    expect(onTogglePaw).toHaveBeenCalledTimes(1);
    expect(onTogglePaw).toHaveBeenCalledWith({ row: 1, col: 1 });
  });

  it("n'arme qu'un seul appui long même sur la même case pressée deux fois", () => {
    const { view, onTogglePaw } = setup();
    press(view, 4, 4);
    press(view, 4, 4);
    act(() => void vi.advanceTimersByTime(LONG_PRESS_MS * 2));
    expect(onTogglePaw).toHaveBeenCalledTimes(1);
  });

  // Le clearLongPress est volontairement placé APRÈS le garde disabled/hasPawn :
  // presser une case figée est un no-op et ne doit pas tuer un appui en cours.
  it("ne casse pas un appui en cours si l'autre doigt touche une case figée", () => {
    const { view, onTogglePaw } = setup();
    press(view, 0, 0);
    press(view, 5, 5, true);
    act(() => void vi.advanceTimersByTime(LONG_PRESS_MS));
    expect(onTogglePaw).toHaveBeenCalledExactlyOnceWith({ row: 0, col: 0 });
  });

  it("annule l'appui long au relâchement et pose un marqueur à la place", () => {
    const { view, onTogglePaw, onToggleMarker } = setup();
    press(view, 1, 2);
    act(() => {
      window.dispatchEvent(new Event("pointerup"));
      vi.advanceTimersByTime(LONG_PRESS_MS * 2);
    });
    expect(onTogglePaw).not.toHaveBeenCalled();
    expect(onToggleMarker).toHaveBeenCalledExactlyOnceWith({ row: 1, col: 2 });
  });
});
