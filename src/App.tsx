import { AmbientPlayer } from "@/components/AmbientPlayer";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { CELL_STAGGER_MS, CELL_TRANSITION_MS, Grid } from "@/components/Grid";
import { HeartsRow } from "@/components/HeartsRow";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { InstallButton } from "@/components/InstallButton";
import { PawCounter } from "@/components/PawCounter";
import { RulesDialog } from "@/components/RulesDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Button } from "@/components/ui/button";
import { useLevel } from "@/hooks/useLevel";
import { haptics } from "@/lib/haptics";
import { EASE_OUT, SPRING_BOUNCE } from "@/lib/motion";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { Loader2, PawPrint, RotateCcw, Trash2 } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const SEEN_INTRO_KEY = "pawzzle:seenIntro";

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
  const [showIntro, setShowIntro] = useState(
    () => !localStorage.getItem(SEEN_INTRO_KEY),
  );

  // Une régénération repasse `status` à "loading" alors que `level` reste en
  // mémoire : l'affichage continue de montrer la partie en cours plutôt que de
  // basculer sur le spinner. Démonter tout le bloc (statut+grille+boutons) le
  // temps du worker faisait se recentrer le parent `justify-center`, d'où le
  // titre qui sautait (BLK-008). `status` brut reste la source pour `disabled`,
  // qui doit bien bloquer la grille pendant la génération.
  const displayStatus = status === "loading" ? "playing" : status;

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
      {import.meta.env.DEV && (
        <Button
          variant="destructive"
          size="icon-sm"
          aria-label="Vider le localStorage (dev)"
          className="fixed top-2 right-2 z-50"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          <Trash2 />
        </Button>
      )}
      <WelcomeDialog
        open={showIntro}
        onOpenChange={(open) => {
          setShowIntro(open);
          if (!open) localStorage.setItem(SEEN_INTRO_KEY, "1");
        }}
      />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col p-4">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/icon.svg" alt="" className="size-10 rounded-lg" />
              <h1 className="text-5xl font-bold">Pawzzle</h1>
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {!level ? (
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
                // Le reste de la colonne (titre, statut, boutons, gaps, padding
                // de `main`, footer) mesure ~19rem. Au-delà, la grille doit
                // rétrécir plutôt que pousser le contenu hors de l'écran — sinon
                // la page déborde de quelques pixels et scrolle sur mobile.
                // Plafond posé ici et pas sur la grille seule : le bloc entier
                // suit, donc la rangée de boutons reste alignée sur la grille.
                // Sur un écran haut, `min()` retombe sur 28rem = `max-w-md`
                // d'origine, rien ne change. En PWA standalone (pas de barre
                // d'URL), `100dvh` inclut la zone sous l'encoche/l'indicateur
                // d'accueil — non comptée dans les 19rem — d'où les
                // `env(safe-area-inset-*)` en plus, à 0 hors PWA.
                className="flex w-full max-w-[min(28rem,calc(100dvh-19rem-env(safe-area-inset-top)-env(safe-area-inset-bottom)))] flex-col items-center gap-4"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
              >
                {status === "won" && <ConfettiBurst key={levelId} />}
                <div className="flex items-end gap-3">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      displayStatus === "won" && "text-primary",
                      displayStatus === "lost" && "text-destructive",
                      displayStatus === "playing" && "text-muted-foreground",
                    )}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      <m.span
                        key={displayStatus}
                        initial={
                          reduceMotion
                            ? { opacity: 0 }
                            : displayStatus === "won"
                              ? { opacity: 0, scale: 0.9 }
                              : { opacity: 0, y: 4 }
                        }
                        animate={
                          reduceMotion
                            ? { opacity: 1 }
                            : displayStatus === "won"
                              ? { opacity: 1, scale: 1 }
                              : { opacity: 1, y: 0 }
                        }
                        exit={
                          reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }
                        }
                        transition={
                          displayStatus === "won" && !reduceMotion
                            ? SPRING_BOUNCE
                            : { duration: 0.25, ease: EASE_OUT }
                        }
                        style={{ display: "inline-block" }}
                      >
                        {displayStatus === "won" ? (
                          "Niveau réussi !"
                        ) : displayStatus === "lost" ? (
                          "Niveau échoué"
                        ) : (
                          <div className="flex items-center gap-3">
                            <PawCounter
                              key={`paw-${levelId}`}
                              found={placed.filter((p) => !p.invalid).length}
                              total={level.solution.length}
                            />
                            <HeartsRow
                              key={`hearts-${levelId}`}
                              errors={errors}
                              maxErrors={maxErrors}
                            />
                          </div>
                        )}
                      </m.span>
                    </AnimatePresence>
                  </div>
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
                <div className="flex w-full max-w-md items-center gap-2">
                  <SettingsDialog
                    help={help}
                    onHelpChange={setHelp}
                    size="icon-xl"
                  />
                  <Button
                    className="h-12 flex-1 text-base"
                    onClick={() => {
                      haptics.cancel();
                      haptics.trigger("light");
                      newLevel();
                    }}
                  >
                    {displayStatus === "playing" ? (
                      <PawPrint className="size-5" />
                    ) : (
                      <RotateCcw className="size-5" />
                    )}
                    {displayStatus === "playing"
                      ? "Nouvelle partie"
                      : "Rejouer"}
                  </Button>
                  <RulesDialog size="icon-xl" />
                  <InstallButton size="icon-xl" />
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      {/* min-h réservée à la hauteur du pill : évite que son apparition/
      disparition (AnimatePresence) ne pousse le contenu de <main> en changeant
      la hauteur disponible pour son justify-center.
      `sticky` : sur mobile le contenu dépasse de peu la hauteur visible (barre
      d'URL déployée), le footer passait alors sous la ligne de flottaison et la
      pill semblait absente — elle ne réapparaissait qu'après une rotation, qui
      replie la barre. Épinglé en bas du viewport, le lecteur reste visible quelle
      que soit la hauteur du contenu. */}
      <footer className="sticky bottom-0 z-10 flex min-h-20 items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <AmbientPlayer />
      </footer>
    </div>
  );
}

export default App;
