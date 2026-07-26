import type { LucideIcon } from "lucide-react";
import {
  Circle,
  Grid2x2,
  Grid3x3,
  LayoutGrid,
  Music2,
  Settings,
  Shapes,
  Square,
  Vibrate,
  VibrateOff,
  Volume2,
  VolumeX,
  X,
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
import type { GridShape } from "@/lib/engine/types";
import {
  GRID_SHAPE_OPTIONS,
  GRID_SIZE_OPTIONS,
  type GridSize,
  setAmbientEnabled,
  setGridShape,
  setGridSize,
  setHapticsSetting,
  setSfxEnabled,
} from "@/lib/settings";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const SIZE_ICONS: Record<GridSize, LucideIcon> = {
  6: LayoutGrid,
  8: Grid2x2,
  10: Grid3x3,
};

const SHAPE_ICONS: Record<GridShape, LucideIcon> = {
  square: Square,
  circle: Circle,
};

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
      <Icon className="size-6" />
    </Button>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

interface SettingsDialogProps {
  help: boolean;
  onHelpChange: (value: boolean) => void;
  onLevelSettingsChange: () => void;
  size?: "icon" | "icon-lg" | "icon-xl";
  className?: string;
}

export const SettingsDialog = ({
  help,
  onHelpChange,
  onLevelSettingsChange,
  size = "icon",
  className,
}: SettingsDialogProps) => {
  const settings = useSettings();

  return (
    <Dialog>
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
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Grid3x3 className="size-4" />
              Taille de grille
            </span>
            <div className="flex gap-1.5">
              {GRID_SIZE_OPTIONS.map((size) => {
                const Icon = SIZE_ICONS[size];
                return (
                  <Button
                    key={size}
                    type="button"
                    variant={settings.gridSize === size ? "default" : "outline"}
                    size="sm"
                    aria-pressed={settings.gridSize === size}
                    onClick={() => {
                      if (settings.gridSize === size) return;
                      haptics.trigger("selection");
                      sounds.play("ui_toggle");
                      setGridSize(size);
                      onLevelSettingsChange();
                    }}
                  >
                    <Icon />
                    {size}×{size}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Shapes className="size-4" />
              Forme
            </span>
            <div className="flex gap-1.5">
              {GRID_SHAPE_OPTIONS.map((shape) => {
                const Icon = SHAPE_ICONS[shape.value];
                return (
                  <Button
                    key={shape.value}
                    type="button"
                    variant={
                      settings.gridShape === shape.value ? "default" : "outline"
                    }
                    size="sm"
                    aria-pressed={settings.gridShape === shape.value}
                    onClick={() => {
                      if (settings.gridShape === shape.value) return;
                      haptics.trigger("selection");
                      sounds.play("ui_toggle");
                      setGridShape(shape.value);
                      onLevelSettingsChange();
                    }}
                  >
                    <Icon />
                    {shape.label}
                  </Button>
                );
              })}
            </div>
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
