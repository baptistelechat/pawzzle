import { Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { SoundHapticsToggles } from "@/components/SoundHapticsToggles";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

interface SettingsDialogProps {
  help: boolean;
  onHelpChange: (value: boolean) => void;
  size?: "icon" | "icon-lg" | "icon-xl";
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export const SettingsDialog = ({
  help,
  onHelpChange,
  size = "icon",
  className,
  onOpenChange,
}: SettingsDialogProps) => {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size={size}
            className={className}
            aria-label="Réglages"
          >
            <Settings />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="size-4" />
            Réglages
          </DialogTitle>
          <DialogDescription>
            Vibrations, sons et marquage des cases.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <SoundHapticsToggles />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <X className="size-4" />
              Marquage des cases
            </span>
            <Switch
              checked={help}
              onCheckedChange={(checked) => {
                haptics.cancel();
                haptics.trigger("selection");
                sounds.play("ui_toggle");
                onHelpChange(checked);
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
