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
import { track } from "@/lib/analytics";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

const CreditLink = ({ href, children }: { href: string; children: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="underline underline-offset-2 hover:text-foreground"
    onClick={() => track("credits_link_clicked", { credit: children })}
  >
    {children}
  </a>
);

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
    <Dialog
      onOpenChange={(open) => {
        if (open) track("settings_opened");
        onOpenChange?.(open);
      }}
    >
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
          <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            Musique :{" "}
            <CreditLink href="https://pixabay.com/music/search/alex%20morgan/">
              Alex Morgan
            </CreditLink>{" "}
            via Pixabay · Effets sonores :{" "}
            <CreditLink href="https://kenney.nl/assets/interface-sounds">
              Kenney
            </CreditLink>{" "}
            (CC0)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
