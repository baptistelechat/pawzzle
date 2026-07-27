import { Flame } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { SPRING_BOUNCE } from "@/lib/motion";
import type { Difficulty } from "@/lib/engine/types";

const LABELS: Record<Difficulty, string> = {
  easy: "Facile",
  medium: "Intermédiaire",
  hard: "Difficile",
};

const FILLED_COUNT: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

interface DifficultyFireProps {
  difficulty: Difficulty;
}

export function DifficultyFire({ difficulty }: DifficultyFireProps) {
  const reduceMotion = useReducedMotion();
  const filled = FILLED_COUNT[difficulty];

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Difficulté : ${LABELS[difficulty]}`}
    >
      {Array.from({ length: 3 }, (_, i) => {
        const isFilled = i < filled;
        return (
          <AnimatePresence key={i} mode="wait">
            <m.span
              key={isFilled ? "filled" : "outline"}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.5, rotate: isFilled ? -20 : 0 }
              }
              animate={
                reduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, rotate: 0 }
              }
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
              transition={reduceMotion ? { duration: 0.15 } : SPRING_BOUNCE}
              style={{ display: "inline-flex" }}
            >
              <Flame
                className={
                  isFilled
                    ? "size-5 fill-primary text-primary"
                    : "size-5 text-muted-foreground"
                }
              />
            </m.span>
          </AnimatePresence>
        );
      })}
    </div>
  );
}
