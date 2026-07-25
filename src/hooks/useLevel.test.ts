// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Level, Position } from "@/lib/engine/types";

// sounds/haptics touchent Web Audio / navigator.vibrate au moment de l'import
// (cf. LRN-021) : mockés au niveau module, et réutilisés comme sondes pour
// vérifier qu'une pose ne joue pas deux sons contradictoires.
const play = vi.fn();
vi.mock("@/lib/sounds", () => ({ sounds: { play: (id: string) => play(id) } }));
vi.mock("@/lib/haptics", () => ({
  haptics: { cancel: vi.fn(), trigger: vi.fn() },
}));

// Grille 6×6 dont la solution est la diagonale : toute case hors diagonale est
// une erreur. Suffisant pour piloter willWin/willLose sans le vrai générateur.
const SOLUTION: Position[] = Array.from({ length: 6 }, (_, i) => ({
  row: i,
  col: i,
}));
const LEVEL: Level = {
  grid: {
    size: 6,
    regions: Array.from({ length: 6 }, (_, r) =>
      Array.from({ length: 6 }, (_, c) => (r + c) % 6),
    ),
  },
  solution: SOLUTION,
};

// Worker stub : renvoie LEVEL de façon synchrone à chaque postMessage, ce qui
// reproduit le passage "loading" -> "playing" sans le vrai moteur.
class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage() {
    queueMicrotask(() =>
      this.onmessage?.({ data: { ok: true, level: LEVEL } } as MessageEvent),
    );
  }
  terminate() {}
}

beforeEach(() => {
  play.mockClear();
  vi.stubGlobal("Worker", FakeWorker);
});

const setupLevel = async () => {
  const { useLevel } = await import("@/hooks/useLevel");
  const view = renderHook(() => useLevel());
  await waitFor(() => expect(view.result.current.status).toBe("playing"));
  return view;
};

describe("useLevel — poses concurrentes avant re-render", () => {
  it("démarre en playing avec un niveau et zéro erreur", async () => {
    const view = await setupLevel();
    expect(view.result.current.level).not.toBeNull();
    expect(view.result.current.errors).toBe(0);
    expect(view.result.current.placed).toHaveLength(0);
  });

  // Régression BLK-011 / finding #1 : deux poses dans le même tick lisaient le
  // même `status` figé. Ici la 1re pose fait gagner, la 2e (case fausse) doit
  // être refusée par le garde — sinon la victoire est écrasée par un échec.
  it("refuse une pose fautive émise dans le même tick que la pose gagnante", async () => {
    const view = await setupLevel();
    act(() => {
      // 5 premières cases de la diagonale : pas encore gagné.
      SOLUTION.slice(0, 5).forEach((p) => view.result.current.togglePaw(p));
    });
    expect(view.result.current.status).toBe("playing");

    act(() => {
      view.result.current.togglePaw({ row: 5, col: 5 }); // complète -> won
      view.result.current.togglePaw({ row: 0, col: 3 }); // fautive, même tick
    });

    expect(view.result.current.status).toBe("won");
    expect(view.result.current.errors).toBe(0);
    expect(play).toHaveBeenCalledWith("victory");
    expect(play).not.toHaveBeenCalledWith("paw_incorrect");
  });

  // Finding #2 : le compteur d'erreurs ne doit jamais dépasser maxErrors,
  // sinon HeartsRow annonce "Erreurs : 4 / 3" et isLastHeart ne matche plus.
  it("borne les erreurs à maxErrors même sous poses fautives en rafale", async () => {
    const view = await setupLevel();
    const { maxErrors } = view.result.current;
    act(() => {
      // 5 cases hors diagonale, toutes fautives, dans le même tick.
      [
        { row: 0, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 3 },
        { row: 3, col: 4 },
        { row: 4, col: 5 },
      ].forEach((p) => view.result.current.togglePaw(p));
    });
    expect(view.result.current.status).toBe("lost");
    expect(view.result.current.errors).toBeLessThanOrEqual(maxErrors);
    expect(view.result.current.errors).toBe(maxErrors);
    expect(maxErrors - view.result.current.errors).not.toBe(-1);
  });

  it("ignore toute pose après la fin de partie", async () => {
    const view = await setupLevel();
    act(() => {
      SOLUTION.forEach((p) => view.result.current.togglePaw(p));
    });
    expect(view.result.current.status).toBe("won");
    const placedCount = view.result.current.placed.length;
    act(() => void view.result.current.togglePaw({ row: 0, col: 3 }));
    expect(view.result.current.placed).toHaveLength(placedCount);
    expect(view.result.current.errors).toBe(0);
  });
});

describe("useLevel — marqueurs vs pions", () => {
  // Finding #3 : setMarker lisait `placed` (state) alors que togglePaw écrit
  // `placedRef` (synchrone) -> un glisser concurrent re-marquait une case
  // venant de recevoir un pion, créant un marqueur fantôme invisible et
  // non retirable (CellContent court-circuite sur pawn).
  it("ne marque pas une case qui vient de recevoir un pion dans le même tick", async () => {
    const view = await setupLevel();
    const cell = { row: 2, col: 2 };
    act(() => {
      view.result.current.togglePaw(cell); // écrit placedRef
      view.result.current.setMarker(cell, true); // glisser concurrent
    });
    expect(view.result.current.placed).toHaveLength(1);
    expect(view.result.current.markers).toHaveLength(0);
  });

  it("ne bascule pas de marqueur sur une case pionnée dans le même tick", async () => {
    const view = await setupLevel();
    const cell = { row: 3, col: 3 };
    act(() => {
      view.result.current.togglePaw(cell);
      view.result.current.toggleMarker(cell);
    });
    expect(view.result.current.markers).toHaveLength(0);
  });

  it("efface le marqueur existant quand la case reçoit un pion", async () => {
    const view = await setupLevel();
    const cell = { row: 4, col: 4 };
    act(() => void view.result.current.toggleMarker(cell));
    expect(view.result.current.markers).toHaveLength(1);
    act(() => void view.result.current.togglePaw(cell));
    expect(view.result.current.markers).toHaveLength(0);
  });

  it("réinitialise erreurs, pions et marqueurs sur nouvelle partie", async () => {
    const view = await setupLevel();
    act(() => {
      view.result.current.togglePaw({ row: 0, col: 1 }); // fautive
      view.result.current.toggleMarker({ row: 5, col: 0 });
    });
    expect(view.result.current.errors).toBe(1);

    act(() => void view.result.current.newLevel());
    await waitFor(() => expect(view.result.current.status).toBe("playing"));
    expect(view.result.current.errors).toBe(0);
    expect(view.result.current.placed).toHaveLength(0);
    expect(view.result.current.markers).toHaveLength(0);
  });
});
