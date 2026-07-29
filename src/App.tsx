import { AmbientPlayer } from "@/components/AmbientPlayer";
import { GameScreen } from "@/components/GameScreen";
import { ModeSelect } from "@/components/ModeSelect";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { Button } from "@/components/ui/button";
import type { GameMode } from "@/lib/gameModes";
import { Trash2 } from "lucide-react";
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

          {mode ? (
            <GameScreen
              key={`${mode}-${runKey}`}
              mode={mode}
              onReplay={() => setRunKey((k) => k + 1)}
              onChangeMode={() => setMode(null)}
            />
          ) : (
            <ModeSelect onSelect={handleSelectMode} />
          )}
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
