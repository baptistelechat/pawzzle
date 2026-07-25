import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TapInstructions } from "@/components/TapInstructions";
import { Button } from "@/components/ui/button";
import { PawPrint } from "lucide-react";

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WelcomeDialog = ({ open, onOpenChange }: WelcomeDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="flex flex-col gap-5" initialFocus={false}>
      <DialogHeader className="items-center text-center">
        <img src="/icon.svg" alt="" className="size-14 rounded-xl" />
        <DialogTitle className="text-xl">Bienvenue à Pawzzle</DialogTitle>
        <DialogDescription>
          Dans ce village, chaque chat a son quartier préféré et déteste avoir
          un voisin trop collé. Aide chacun à trouver sa place, sans jamais
          croiser la moustache d'un autre :<br />
          <span className="font-semibold text-primary">
            Un chat par couleur, par ligne, par colonne.<br/>
          Zéro contact, même du bout de la patte.
          </span>
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Comment jouer</h3>
        <TapInstructions />
      </div>
      <DialogFooter>
        <Button className="w-full" onClick={() => onOpenChange(false)}>
          <PawPrint className="size-4" />
          C'est parti !
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
