import { Home, PawPrint, RotateCcw } from "lucide-react";
import { ConfirmRunAction } from "@/components/GameScreen/components/ConfirmRunAction";
import { InstallButton } from "@/components/InstallButton";
import { RulesDialog } from "@/components/RulesDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";

type Status = "loading" | "playing" | "won" | "lost";
type DisplayStatus = "playing" | "won" | "lost";

interface GameActionsProps {
  isRunActive: boolean;
  status: Status;
  displayStatus: DisplayStatus;
  help: boolean;
  onHelpChange: (value: boolean) => void;
  onNewLevel: () => void;
  onReplayRun: () => void;
  onChangeMode: () => void;
}

export function GameActions({
  isRunActive,
  status,
  displayStatus,
  help,
  onHelpChange,
  onNewLevel,
  onReplayRun,
  onChangeMode,
}: GameActionsProps) {
  const homeButton = (
    <Button variant="outline" size="icon-xl" aria-label="Accueil">
      <Home />
    </Button>
  );

  return (
    <div className="flex w-full max-w-md items-center gap-2">
      {isRunActive ? (
        <ConfirmRunAction
          trigger={homeButton}
          title="Quitter la partie ?"
          description="La run en cours (niveaux, vies, temps) sera perdue."
          confirmLabel="Quitter"
          onConfirm={onChangeMode}
        />
      ) : (
        <Button
          variant="outline"
          size="icon-xl"
          aria-label="Accueil"
          onClick={onChangeMode}
        >
          <Home />
        </Button>
      )}
      <SettingsDialog help={help} onHelpChange={onHelpChange} size="icon-xl" />
      {isRunActive && status === "playing" ? (
        <ConfirmRunAction
          trigger={
            <Button className="h-12 flex-1 text-base">
              <PawPrint className="size-5" />
              Nouvelle partie
            </Button>
          }
          title="Recommencer la run ?"
          description="La progression actuelle (niveaux, vies, temps) sera perdue et une nouvelle run démarrera de zéro."
          confirmLabel="Recommencer"
          onConfirm={() => {
            haptics.cancel();
            haptics.trigger("light");
            onReplayRun();
          }}
        />
      ) : (
        <Button
          className="h-12 flex-1 text-base"
          disabled={status === "loading"}
          onClick={() => {
            haptics.cancel();
            haptics.trigger("light");
            onNewLevel();
          }}
        >
          {displayStatus === "playing" ? (
            <PawPrint className="size-5" />
          ) : (
            <RotateCcw className="size-5" />
          )}
          {displayStatus === "playing" ? "Nouvelle partie" : "Rejouer"}
        </Button>
      )}
      <RulesDialog size="icon-xl" />
      <InstallButton size="icon-xl" />
    </div>
  );
}
