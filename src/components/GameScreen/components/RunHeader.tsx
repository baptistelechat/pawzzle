import { AnimatePresence, m, useReducedMotion } from "motion/react";
import type { Difficulty } from "@/lib/engine/types";
import type { TimeBonus } from "@/hooks/useGameRun";
import { DifficultyFire } from "@/components/DifficultyFire";
import { HeartsRow } from "@/components/HeartsRow";
import { PawCounter } from "@/components/PawCounter";
import { RunProgress } from "@/components/GameScreen/components/RunProgress";
import { Timer } from "@/components/Timer";
import { EASE_OUT, SPRING_BOUNCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type DisplayStatus = "playing" | "won" | "lost";

interface RunHeaderProps {
  displayStatus: DisplayStatus;
  levelId: number;
  difficulty: Difficulty;
  found: number;
  total: number;
  errors: number;
  maxErrors: number;
  timeLeft?: number;
  timeBonus?: TimeBonus | null;
  levelsCompleted?: number;
}

export function RunHeader({
  displayStatus,
  levelId,
  difficulty,
  found,
  total,
  errors,
  maxErrors,
  timeLeft,
  timeBonus,
  levelsCompleted,
}: RunHeaderProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex items-end gap-3">
      <div
        className={cn(
          "text-sm font-medium",
          displayStatus === "won" && "text-primary",
          displayStatus === "lost" && "text-destructive",
          displayStatus === "playing" && "text-muted-foreground",
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={displayStatus}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : displayStatus === "won"
                  ? { opacity: 0, scale: 0.9 }
                  : { opacity: 0, y: 4 }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : displayStatus === "won"
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 1, y: 0 }
            }
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={
              displayStatus === "won" && !reduceMotion
                ? SPRING_BOUNCE
                : { duration: 0.25, ease: EASE_OUT }
            }
            style={{ display: "inline-block" }}
          >
            {displayStatus === "won" ? (
              "Niveau réussi !"
            ) : displayStatus === "lost" ? (
              "Niveau échoué"
            ) : (
              <div className="flex items-center gap-3">
                <DifficultyFire
                  key={`difficulty-${levelId}`}
                  difficulty={difficulty}
                />
                <PawCounter
                  key={`paw-${levelId}`}
                  found={found}
                  total={total}
                />
                <HeartsRow
                  key={`hearts-${levelId}`}
                  errors={errors}
                  maxErrors={maxErrors}
                />
                {levelsCompleted !== undefined && (
                  <RunProgress
                    key={`progress-${levelId}`}
                    levelsCompleted={levelsCompleted}
                  />
                )}
                {timeLeft !== undefined && (
                  <Timer
                    key={`timer-${levelId}`}
                    seconds={timeLeft}
                    bonus={timeBonus}
                  />
                )}
              </div>
            )}
          </m.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
