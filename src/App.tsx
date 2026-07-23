import { useEffect } from "react";
import { Loader2, PawPrint, RotateCcw } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AmbientPlayer } from "@/components/AmbientPlayer";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { CELL_STAGGER_MS, CELL_TRANSITION_MS, Grid } from "@/components/Grid";
import { HeartsRow } from "@/components/HeartsRow";
import { useLevel } from "@/hooks/useLevel";
import { haptics } from "@/lib/haptics";
import { EASE_OUT, SPRING_BOUNCE } from "@/lib/motion";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

function App() {
  const {
    level,
    levelId,
    placed,
    markers,
    errors,
    maxErrors,
    status,
    help,
    setHelp,
    togglePaw,
    toggleMarker,
    setMarker,
    newLevel,
  } = useLevel();
  const reduceMotion = useReducedMotion();

  // Joue `new_game` une fois la grille complètement apparue (dernière case =
  // delay max + durée de sa transition), pas au moment de la demande. Pas sur
  // le tout premier niveau (levelId === 1, auto-généré au montage sans geste
  // utilisateur) — un futur écran de démarrage remplacera ce lancement auto.
  useEffect(() => {
    if (!level || levelId <= 1) return;
    const lastCellDelay = reduceMotion
      ? 0
      : 2 * (level.grid.size - 1) * CELL_STAGGER_MS;
    const timeoutId = window.setTimeout(
      () => sounds.play("new_game"),
      lastCellDelay + CELL_TRANSITION_MS,
    );
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- déclenché uniquement par un changement de grille, pas par reduceMotion
  }, [levelId]);

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 p-4">
        <div className="flex items-center gap-3">
          <img src="/icon.svg" alt="" className="size-10 rounded-lg" />
          <h1 className="text-5xl font-bold">Pawzzle</h1>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {status === "loading" || !level ? (
            <m.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: EASE_OUT }}
            >
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </m.div>
          ) : (
            <m.div
              key="level"
              className="flex w-full flex-col items-center gap-4"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >
              {status === "won" && <ConfettiBurst key={levelId} />}
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "text-sm font-medium",
                    status === "won" && "text-primary",
                    status === "lost" && "text-destructive",
                    status === "playing" && "text-muted-foreground",
                  )}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <m.span
                      key={status}
                      initial={
                        reduceMotion
                          ? { opacity: 0 }
                          : status === "won"
                            ? { opacity: 0, scale: 0.9 }
                            : { opacity: 0, y: 4 }
                      }
                      animate={
                        reduceMotion
                          ? { opacity: 1 }
                          : status === "won"
                            ? { opacity: 1, scale: 1 }
                            : { opacity: 1, y: 0 }
                      }
                      exit={
                        reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }
                      }
                      transition={
                        status === "won" && !reduceMotion
                          ? SPRING_BOUNCE
                          : { duration: 0.25, ease: EASE_OUT }
                      }
                      style={{ display: "inline-block" }}
                    >
                      {status === "won" ? (
                        "Niveau réussi !"
                      ) : status === "lost" ? (
                        "Niveau échoué"
                      ) : (
                        <HeartsRow
                          key={levelId}
                          errors={errors}
                          maxErrors={maxErrors}
                        />
                      )}
                    </m.span>
                  </AnimatePresence>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={help}
                    onCheckedChange={(checked) => {
                      haptics.cancel();
                      haptics.trigger("selection");
                      sounds.play("ui_toggle");
                      setHelp(checked);
                    }}
                  />
                  Aide
                </label>
              </div>
              <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                  <Grid
                    key={levelId}
                    grid={level.grid}
                    placed={placed}
                    markers={markers}
                    help={help}
                    errors={errors}
                    disabled={status !== "playing"}
                    showSolution={status === "lost"}
                    solution={level.solution}
                    onTogglePaw={togglePaw}
                    onToggleMarker={toggleMarker}
                    onSetMarker={setMarker}
                  />
                </AnimatePresence>
              </div>
              <div className="w-full max-w-md">
                <Button
                  className="h-12 w-full text-base"
                  onClick={() => {
                    haptics.cancel();
                    haptics.trigger("light");
                    newLevel();
                  }}
                >
                  {status === "playing" ? (
                    <PawPrint className="size-5" />
                  ) : (
                    <RotateCcw className="size-5" />
                  )}
                  {status === "playing" ? "Nouvelle partie" : "Rejouer"}
                </Button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </main>
      {/* min-h réservée à la hauteur du pill : évite que son apparition/
      disparition (AnimatePresence) ne pousse le contenu de <main> en changeant
      la hauteur disponible pour son justify-center. */}
      <footer className="flex min-h-20 items-center justify-center p-4">
        <AmbientPlayer />
      </footer>
    </div>
  );
}

export default App;
