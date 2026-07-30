import {
  LayoutGrid,
  PawPrint,
  RotateCcw,
  Timer as TimerIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";

interface GameOverPanelProps {
  levelsCompleted: number;
  totalPawsPlaced: number;
  elapsedSeconds: number;
  onReplay: () => void;
  onChangeMode: () => void;
}

interface StatTileProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
}

const StatTile = ({ icon: Icon, value, label }: StatTileProps) => (
  <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 py-3">
    <Icon className="size-5 text-muted-foreground" />
    <span className="text-lg font-semibold tabular-nums">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

// Copy volontairement positive/neutre (pas de "Game Over"/"Perdu") : le récap
// reste centré sur ce qui a été accompli, pas sur la fin de la run.
export function GameOverPanel({
  levelsCompleted,
  totalPawsPlaced,
  elapsedSeconds,
  onReplay,
  onChangeMode,
}: GameOverPanelProps) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 py-8 text-center">
      <h2 className="text-2xl font-bold">Partie terminée</h2>
      <div className="grid w-full grid-cols-3 gap-3">
        <StatTile icon={LayoutGrid} value={levelsCompleted} label="niveaux" />
        <StatTile icon={PawPrint} value={totalPawsPlaced} label="chats" />
        <StatTile
          icon={TimerIcon}
          value={formatTime(elapsedSeconds)}
          label="temps"
        />
      </div>
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
