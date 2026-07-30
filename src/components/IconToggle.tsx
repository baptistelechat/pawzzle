import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface IconToggleProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onToggle: (value: boolean) => void;
}

export const IconToggle = ({
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
