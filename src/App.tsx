import { AmbientPlayer } from "@/components/AmbientPlayer";
import { GameScreen } from "@/components/GameScreen";
import { ModeSelect } from "@/components/ModeSelect";
import { RulesDialog } from "@/components/RulesDialog";
import { SoundHapticsToggles } from "@/components/SoundHapticsToggles";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { Button } from "@/components/ui/button";
import type { GameMode } from "@/lib/gameModes";
import { EASE_OUT } from "@/lib/motion";
import { Trash2 } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useState } from "react";

const SEEN_INTRO_KEY = "pawzzle:seenIntro";

function App() {
  const [mode, setMode] = useState<GameMode | null>(null);
  // Bump pour forcer un remount complet de GameScreen (worker + état de run
  // repartent de zéro) quand le joueur rejoue après une fin de run — plus
  // simple qu'un `resetRun()` qui dupliquerait la remise à zéro de useGameRun.
  const [runKey, setRunKey] = useState(0);
  const [showIntro, setShowIntro] = useState(
    () => !localStorage.getItem(SEEN_INTRO_KEY),
  );
  const reduceMotion = useReducedMotion();

  const handleSelectMode = (selected: GameMode) => {
    setMode(selected);
    setRunKey((k) => k + 1);
  };

  return (
    // `h-full` (100% de `body`, lui-même verrouillé à 100% de `html` dans
    // index.css) plutôt que `h-dvh` : ne dépend d'aucun calcul `dvh`, qui peut
    // surestimer l'espace réellement visible en PWA standalone.
    // `overflow-hidden` en défense supplémentaire.
    <div className="flex h-full flex-col overflow-hidden">
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

          {/* AnimatePresence dédiée à la bascule accueil ⇄ partie (clé
          "mode-select"/"game", stable tant qu'on reste du même côté) —
          distincte du remount interne de GameScreen (sa propre clé
          `${mode}-${runKey}`), pour ne pas refaire ce fondu à chaque relance
          d'une run déjà en cours. */}
          <AnimatePresence mode="wait" initial={false}>
            {mode ? (
              <m.div
                key="game"
                // `w-full` obligatoire : dans un flex `items-center`, un enfant
                // sans largeur explicite se réduit à son contenu (shrink-to-fit)
                // au lieu de s'étirer — le `w-full max-w-[...]` de GameScreen
                // (racine) se résolvait alors contre CE wrapper rétréci plutôt
                // que contre l'espace réellement disponible, rétrécissant toute
                // la colonne (grille comprise) sans que sa propre classe n'ait
                // changé. `flex-col items-center` (pas `justify-center` en row,
                // premier essai qui laissait le contenu collé à gauche) :
                // reproduit exactement le pattern dont GameScreen dépendait
                // avant l'ajout de ce wrapper (et qu'utilise déjà le wrapper
                // "mode-select" juste en dessous).
                className="flex w-full flex-col items-center"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
              >
                <GameScreen
                  key={`${mode}-${runKey}`}
                  mode={mode}
                  onReplay={() => setRunKey((k) => k + 1)}
                  onChangeMode={() => setMode(null)}
                />
              </m.div>
            ) : (
              // `mt-4` scopé à ce seul écran : le budget de hauteur de
              // GameScreen (cf. son commentaire "~19rem") est calculé sur le
              // `gap-4` du parent, l'augmenter globalement le ferait déborder.
              <m.div
                key="mode-select"
                // `mt-4` + `gap-4` du parent = 32px (titre ↔ modes), à égalité
                // avec le `gap-8` ci-dessous (modes ↔ réglages) — un `gap-8`
                // global sur le parent aurait aussi élargi l'écart titre ↔
                // grille de GameScreen, dont le budget de hauteur (~19rem) ne
                // doit pas bouger.
                className="mt-4 flex w-full flex-col items-center gap-8"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
              >
                <ModeSelect onSelect={handleSelectMode} />
                <div className="flex items-center gap-3">
                  <SoundHapticsToggles />
                  <div className="flex flex-col items-center gap-1.5">
                    <RulesDialog size="icon-xl" />
                    <span className="text-xs text-muted-foreground">
                      Règles
                    </span>
                  </div>
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
