import { Loader2, PawPrint, RotateCcw } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Grid } from "@/components/Grid";
import { Nav } from "@/components/Nav";
import { useLevel } from "@/hooks/useLevel";
import { haptics } from "@/lib/haptics";
import { EASE_OUT, SPRING_BOUNCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

function App() {
  const {
    level,
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

  return (
    <div className="flex min-h-dvh flex-col">
      <Nav />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-5xl font-bold">Pawzzle</h1>

        <AnimatePresence mode="popLayout" initial={false}>
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
              <div className="flex items-center gap-4">
                <p
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
                      {status === "won"
                        ? "Niveau réussi !"
                        : status === "lost"
                          ? "Niveau échoué — budget d'erreur épuisé."
                          : `Erreurs : ${errors} / ${maxErrors}`}
                    </m.span>
                  </AnimatePresence>
                </p>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={help}
                    onCheckedChange={(checked) => {
                      haptics.cancel();
                      haptics.trigger("selection");
                      setHelp(checked);
                    }}
                  />
                  Aide
                </label>
              </div>
              <div className="w-full max-w-md">
                <Grid
                  grid={level.grid}
                  placed={placed}
                  markers={markers}
                  help={help}
                  onTogglePaw={togglePaw}
                  onToggleMarker={toggleMarker}
                  onSetMarker={setMarker}
                />
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
    </div>
  );
}

export default App;
