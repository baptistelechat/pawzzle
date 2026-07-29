import { LayoutGrid, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameOverPanelProps {
  levelsCompleted: number;
  onReplay: () => void;
  onChangeMode: () => void;
}

// Copy volontairement positive/neutre (pas de "Game Over"/"Perdu") : le récap
// reste centré sur ce qui a été accompli, pas sur la fin de la run.
export function GameOverPanel({
  levelsCompleted,
  onReplay,
  onChangeMode,
}: GameOverPanelProps) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 py-8 text-center">
      <h2 className="text-2xl font-bold">Partie terminée</h2>
      <p className="text-muted-foreground">
        {levelsCompleted} niveau{levelsCompleted !== 1 && "x"} complété
        {levelsCompleted !== 1 && "s"}
      </p>
      <div className="flex w-full gap-2">
        <Button
          variant="outline"
          className="h-12 flex-1"
          onClick={onChangeMode}
        >
          <LayoutGrid className="size-5" />
          Changer de mode
        </Button>
        <Button className="h-12 flex-1" onClick={onReplay}>
          <RotateCcw className="size-5" />
          Rejouer
        </Button>
      </div>
    </div>
  );
}
