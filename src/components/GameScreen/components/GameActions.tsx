import { ArrowRight, Eye, Home, PawPrint } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import type { ReactElement } from "react";
import { ConfirmRunAction } from "@/components/GameScreen/components/ConfirmRunAction";
import { InstallButton } from "@/components/InstallButton";
import { RulesDialog } from "@/components/RulesDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";
import { EASE_OUT } from "@/lib/motion";

type Status = "loading" | "playing" | "won" | "lost";

interface GameActionsProps {
  isRunActive: boolean;
  // Run Chrono/Endurance terminée (vies/temps épuisés) : la grille affiche
  // encore la solution, le bouton principal devient "Voir les résultats"
  // avant de basculer sur le récap (GameOverPanel).
  runEnded: boolean;
  status: Status;
  help: boolean;
  onHelpChange: (value: boolean) => void;
  onNewLevel: () => void;
  onReplayRun: () => void;
  onChangeMode: () => void;
  onShowRecap: () => void;
  // Signale l'ouverture de n'importe quel dialog de cette rangée (confirmation
  // d'abandon, réglages, règles) pour que GameScreen mette le chrono de la
  // run en pause tant qu'un panneau est affiché par-dessus le jeu.
  onRunPauseChange: (open: boolean) => void;
}

export function GameActions({
  isRunActive,
  runEnded,
  status,
  help,
  onHelpChange,
  onNewLevel,
  onReplayRun,
  onChangeMode,
  onShowRecap,
  onRunPauseChange,
}: GameActionsProps) {
  const reduceMotion = useReducedMotion();
  const homeButton = (
    <Button variant="outline" size="icon-xl" aria-label="Accueil">
      <Home />
    </Button>
  );

  // `primaryKey` distingue chaque variante du bouton principal : sert de clé
  // à l'AnimatePresence ci-dessous pour fondre l'une dans l'autre (ex:
  // "Nouvelle partie" → "Voir les résultats") plutôt que de la remplacer sans
  // transition.
  let primaryKey: string;
  let primaryButton: ReactElement;
  if (runEnded) {
    primaryKey = "recap";
    primaryButton = (
      <Button className="h-12 w-full text-base" onClick={onShowRecap}>
        <Eye className="size-5" />
        Résultats
      </Button>
    );
  } else if (isRunActive && status === "playing") {
    // "Nouvelle partie" en cours de run (pas "Rejouer", réservé au récap de
    // fin de run — cf. GameOverPanel) : ce bouton relance la run depuis le
    // début pendant qu'on joue encore.
    primaryKey = "restart-run";
    primaryButton = (
      <ConfirmRunAction
        trigger={
          <Button className="h-12 w-full text-base">
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
        onOpenChange={onRunPauseChange}
      />
    );
  } else if (isRunActive && status === "won") {
    // Niveau réussi mais la run continue : on enchaîne sur le suivant, pas
    // une relance de la run — "Continuer" évite l'ambiguïté de "Rejouer".
    primaryKey = "continue";
    primaryButton = (
      <Button
        className="h-12 w-full text-base"
        onClick={() => {
          haptics.cancel();
          haptics.trigger("light");
          onNewLevel();
        }}
      >
        <ArrowRight className="size-5" />
        Continuer
      </Button>
    );
  } else {
    // Mode Classique (ou brève transition entre 2 niveaux d'une run) :
    // toujours "Nouvelle partie" — "Rejouer" est réservé au récap de fin de
    // run (GameOverPanel).
    primaryKey = "default";
    primaryButton = (
      <Button
        className="h-12 w-full text-base"
        disabled={status === "loading"}
        onClick={() => {
          haptics.cancel();
          haptics.trigger("light");
          onNewLevel();
        }}
      >
        <PawPrint className="size-5" />
        Nouvelle partie
      </Button>
    );
  }

  return (
    <div className="flex w-full max-w-md items-center gap-2">
      <div className="flex items-center gap-2">
        {isRunActive ? (
          <ConfirmRunAction
            trigger={homeButton}
            title="Quitter la partie ?"
            description="La run en cours (niveaux, vies, temps) sera perdue."
            confirmLabel="Quitter"
            onConfirm={onChangeMode}
            onOpenChange={onRunPauseChange}
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
        <SettingsDialog
          help={help}
          onHelpChange={onHelpChange}
          size="icon-xl"
          onOpenChange={onRunPauseChange}
        />
        <RulesDialog size="icon-xl" onOpenChange={onRunPauseChange} />
        <InstallButton size="icon-xl" />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={primaryKey}
          className="flex-1"
          initial={
            reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.94 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.94 }
          }
          transition={{ duration: 0.32, ease: EASE_OUT }}
        >
          {primaryButton}
        </m.div>
      </AnimatePresence>
    </div>
  );
}
