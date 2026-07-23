import { Heart, HeartCrack } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { SPRING_BOUNCE } from "@/lib/motion";

interface HeartsRowProps {
  errors: number;
  maxErrors: number;
}

export function HeartsRow({ errors, maxErrors }: HeartsRowProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Erreurs : ${errors} / ${maxErrors}`}
    >
      {Array.from({ length: maxErrors }, (_, i) => {
        const broken = i < errors;
        // Dernier cœur restant : tremblement continu — tension du "dernier essai".
        const isLastHeart = !broken && maxErrors - errors === 1;
        return (
          <AnimatePresence key={i} mode="wait">
            <m.span
              key={broken ? "broken" : "full"}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.5, rotate: broken ? -20 : 0 }
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
              {broken ? (
                <HeartCrack className="size-5 text-destructive" />
              ) : (
                <m.span
                  style={{ display: "inline-flex" }}
                  animate={
                    isLastHeart && !reduceMotion
                      ? { scale: [1, 1.2, 1] }
                      : { scale: 1 }
                  }
                  transition={
                    isLastHeart && !reduceMotion
                      ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.2 }
                  }
                >
                  <Heart className="size-5 fill-primary text-primary" />
                </m.span>
              )}
            </m.span>
          </AnimatePresence>
        );
      })}
    </div>
  );
}
