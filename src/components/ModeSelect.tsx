import {
  Heart,
  PawPrint,
  Timer as TimerIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GAME_MODE_LIST, type GameMode } from "@/lib/gameModes";

const MODE_ICONS: Record<GameMode, LucideIcon> = {
  classic: PawPrint,
  timeAttack: TimerIcon,
  endurance: Heart,
};

interface ModeSelectProps {
  onSelect: (mode: GameMode) => void;
}

export function ModeSelect({ onSelect }: ModeSelectProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {GAME_MODE_LIST.map((mode) => {
        const Icon = MODE_ICONS[mode.id];
        return (
          <Button
            key={mode.id}
            variant="outline"
            className="h-auto w-full flex-col items-start gap-1.5 p-4 text-left whitespace-normal"
            onClick={() => onSelect(mode.id)}
          >
            <span className="flex items-center gap-2 text-base font-semibold">
              <Icon className="size-5" />
              {mode.label}
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {mode.description}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
