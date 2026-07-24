import type { LucideIcon } from "lucide-react";
import {
  Music2,
  Settings,
  Vibrate,
  VibrateOff,
  Volume2,
  VolumeX,
} from "lucide-react";
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
import { useSettings } from "@/hooks/useSettings";
import { haptics } from "@/lib/haptics";
import {
  setAmbientEnabled,
  setHapticsSetting,
  setSfxEnabled,
} from "@/lib/settings";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface IconToggleProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onToggle: (value: boolean) => void;
}

const IconToggle = ({
  icon: Icon,
  label,
  active,
  onToggle,
}: IconToggleProps) => (
  <div className="flex flex-col items-center gap-1.5">
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="icon-xl"
      aria-pressed={active}
      aria-label={label}
      onClick={() => {
        haptics.trigger("selection");
        sounds.play("ui_toggle");
        onToggle(!active);
      }}
      className={cn(!active && "text-muted-foreground")}
    >
      <Icon />
    </Button>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

interface SettingsDialogProps {
  help: boolean;
  onHelpChange: (value: boolean) => void;
}

export const SettingsDialog = ({ help, onHelpChange }: SettingsDialogProps) => {
  const settings = useSettings();

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon" aria-label="Réglages">
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
            <IconToggle
              icon={settings.hapticsEnabled ? Vibrate : VibrateOff}
              label="Vibrations"
              active={settings.hapticsEnabled}
              onToggle={setHapticsSetting}
            />
            <IconToggle
              icon={settings.sfxEnabled ? Volume2 : VolumeX}
              label="Sons"
              active={settings.sfxEnabled}
              onToggle={setSfxEnabled}
            />
            <IconToggle
              icon={Music2}
              label="Ambiance"
              active={settings.ambientEnabled}
              onToggle={setAmbientEnabled}
            />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-medium">Marquage des cases</span>
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
