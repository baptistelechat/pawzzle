import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "@/lib/engine/types";

const LABELS: Record<Difficulty, string> = {
  easy: "Facile",
  medium: "Intermédiaire",
  hard: "Difficile",
  extreme: "Extrême",
};

// Progression volontairement sobre : les variants shadcn existants
// (pas de nouvelle couleur ajoutée) suffisent à distinguer les 4 niveaux.
const VARIANTS: Record<
  Difficulty,
  "secondary" | "outline" | "default" | "destructive"
> = {
  easy: "secondary",
  medium: "outline",
  hard: "default",
  extreme: "destructive",
};

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return <Badge variant={VARIANTS[difficulty]}>{LABELS[difficulty]}</Badge>;
}
