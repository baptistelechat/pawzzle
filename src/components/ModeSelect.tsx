import { Heart, PawPrint, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GAME_MODE_LIST, type GameMode } from "@/lib/gameModes";
import { REGION_COLORS } from "@/lib/regionColors";

// Couleurs reprises de la palette des régions de la grille (REGION_COLORS) :
// chaque mode hérite d'une teinte déjà vue en jeu pour créer un lien visuel
// direct entre le choix du mode et le gameplay qui l'attend.
const MODE_COLORS: Record<GameMode, string> = {
  classic: REGION_COLORS[2], // vert — libre, sans pression
  marathon: REGION_COLORS[0], // rouge — urgence vies + chrono
};

interface ModeSelectProps {
  onSelect: (mode: GameMode) => void;
}

export function ModeSelect({ onSelect }: ModeSelectProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {GAME_MODE_LIST.map((mode) => {
        const color = MODE_COLORS[mode.id];
        return (
          <Button
            key={mode.id}
            type="button"
            variant="outline"
            className="h-auto w-full items-center justify-start gap-3 p-4 text-left whitespace-normal"
            onClick={() => onSelect(mode.id)}
          >
            {/* Puce à coins squircle teintée d'une couleur de REGION_COLORS :
                miniature d'une case de grille (même style que RuleGrid dans
                RulesDialog), pour ancrer visuellement le mode au gameplay. */}
            <span
              className="relative flex size-12 shrink-0 items-center justify-center rounded-[28%] [corner-shape:squircle]"
              style={{ backgroundColor: color }}
            >
              {mode.id === "classic" ? (
                <PawPrint className="size-6 text-foreground" />
              ) : (
                <>
                  {/* Aucune icône Lucide ne fusionne chrono+vies : composition
                      chrono principal + badge cœur, faute de mieux. */}
                  <TimerIcon className="size-6 text-foreground" />
                  <Heart className="absolute right-0.5 bottom-0.5 size-3 fill-foreground text-foreground" />
                </>
              )}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-base font-semibold">{mode.label}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {mode.description}
              </span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}
