import { PawPrint, X } from "lucide-react";

export const TapInstructions = () => (
  <div className="flex flex-col gap-2 text-xs text-muted-foreground">
    <div className="flex items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-[28%] bg-muted [corner-shape:squircle]">
        <X className="size-3.5 text-foreground/60" />
      </span>
      Appui court : marquer une case d'une croix.
    </div>
    <div className="flex items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-[28%] bg-muted [corner-shape:squircle]">
        <PawPrint className="size-3.5 text-foreground" />
      </span>
      Appui long : poser un chat.
    </div>
  </div>
);
