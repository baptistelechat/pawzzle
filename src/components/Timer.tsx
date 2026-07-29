import { Timer as TimerIcon } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import type { TimeBonus } from "@/hooks/useGameRun";
import { SPRING_BOUNCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface TimerProps {
  seconds: number;
  bonus?: TimeBonus | null;
}

const LOW_TIME_THRESHOLD = 10;

const formatTime = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function Timer({ seconds, bonus }: TimerProps) {
  const reduceMotion = useReducedMotion();
  const low = seconds <= LOW_TIME_THRESHOLD;

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-sm font-medium tabular-nums",
        low ? "text-destructive" : "text-muted-foreground",
      )}
      aria-label={`Temps restant : ${formatTime(seconds)}`}
    >
      <TimerIcon className="size-4" />
      <m.span
        animate={low && !reduceMotion ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={
          low && !reduceMotion
            ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 }
        }
        style={{ display: "inline-block" }}
      >
        {formatTime(seconds)}
      </m.span>
      <AnimatePresence>
        {bonus && (
          <m.span
            key={bonus.key}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: -6 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0.15 } : SPRING_BOUNCE}
            className="font-semibold text-primary"
            style={{ display: "inline-block" }}
          >
            +{bonus.amount}
          </m.span>
        )}
      </AnimatePresence>
    </div>
  );
}
