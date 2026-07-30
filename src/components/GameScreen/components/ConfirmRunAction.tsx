import type { ReactElement } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ConfirmRunActionProps {
  trigger: ReactElement;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onOpenChange?: (open: boolean) => void;
}

// Guard générique pour toute action qui abandonnerait une run Chrono/Endurance
// en cours (niveaux/vies/temps perdus) — cf. la règle "action irréversible =
// confirmation obligatoire". `onOpenChange` remonte l'état d'ouverture pour
// que GameScreen puisse mettre le chrono de la run en pause tant que le
// dialog est affiché.
export function ConfirmRunAction({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
  onOpenChange,
}: ConfirmRunActionProps) {
  return (
    <AlertDialog onOpenChange={onOpenChange}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
