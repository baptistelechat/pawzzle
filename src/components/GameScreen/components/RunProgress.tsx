import { ListChecks } from "lucide-react";

interface RunProgressProps {
  levelsCompleted: number;
}

export function RunProgress({ levelsCompleted }: RunProgressProps) {
  return (
    <div
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground tabular-nums"
      aria-label={`Niveaux complétés dans cette partie : ${levelsCompleted}`}
    >
      <ListChecks className="size-4" />
      {levelsCompleted}
    </div>
  );
}
