import { PawPrint } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { SPRING_BOUNCE } from "@/lib/motion";

interface PawCounterProps {
  found: number;
  total: number;
}

export function PawCounter({ found, total }: PawCounterProps) {
  const reduceMotion = useReducedMotion();
  // `total` est fixe pour toute la durée d'un niveau (seul `found` varie, et
  // PawCounter est de toute façon remonté à chaque niveau via sa clé
  // `paw-${levelId}`) : réserver la largeur du pire cas propre à CE total
  // (pas un pire cas global "10/10") suffit à empêcher tout jump pendant la
  // partie, sans mou résiduel sur les grilles 6×6/8×8 — qui rendait l'écart
  // avec HeartsRow plus large que le reste de la rangée.
  const digits = String(total).length;

  return (
    <div
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
      style={{ width: `calc(1rem + 0.25rem + ${digits * 2 + 1}ch)` }}
      aria-label={`Pattes trouvées : ${found} / ${total}`}
    >
      <AnimatePresence initial mode="wait">
        <m.span
          key="icon"
          initial={
            reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: 4 }
          }
          animate={
            reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
          }
          transition={reduceMotion ? { duration: 0.15 } : SPRING_BOUNCE}
          style={{ display: "inline-flex" }}
        >
          <PawPrint className="size-4" />
        </m.span>
      </AnimatePresence>
      <span className="tabular-nums">
        <AnimatePresence initial mode="wait">
          <m.span
            key={found}
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: -6 }
            }
            animate={
              reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
            }
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
            transition={reduceMotion ? { duration: 0.15 } : SPRING_BOUNCE}
            style={{ display: "inline-block" }}
          >
            {found}
          </m.span>
        </AnimatePresence>
        <AnimatePresence initial mode="wait">
          <m.span
            key="total"
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: -6 }
            }
            animate={
              reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
            }
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
            transition={reduceMotion ? { duration: 0.15 } : SPRING_BOUNCE}
            style={{ display: "inline-block" }}
          >
            /{total}
          </m.span>
        </AnimatePresence>
      </span>
    </div>
  );
}
