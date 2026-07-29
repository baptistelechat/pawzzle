import { useCallback, useEffect, useRef, useState } from "react";
import { useLevel } from "@/hooks/useLevel";
import { haptics } from "@/lib/haptics";
import { GAME_MODES, type GameMode } from "@/lib/gameModes";
import { sounds } from "@/lib/sounds";

export type RunStatus = "active" | "gameOver";

export interface TimeBonus {
  amount: number;
  key: number;
}

// Hook unique pour les 3 modes (GameScreen ne doit jamais appeler des hooks
// différents selon le mode — interdit par les règles de hooks React, `mode`
// pouvant varier d'un rendu à l'autre du point de vue du linter même si en
// pratique GameScreen est remonté via `key={mode}`). Pour classic
// (config.hasRun === false), tout le mécanisme de run est un no-op : le
// comportement reste identique à useLevel() nu (maxErrors=3, pas de pool de
// vies/temps).
export const useGameRun = (mode: GameMode) => {
  const config = GAME_MODES[mode];
  const [lives, setLives] = useState(config.startLives ?? 0);
  const [timeLeft, setTimeLeft] = useState(config.startTime);
  const [levelsCompleted, setLevelsCompleted] = useState(0);
  const [runStatus, setRunStatus] = useState<RunStatus>("active");
  const [timeBonus, setTimeBonus] = useState<TimeBonus | null>(null);
  // Miroir synchrone : `endRun` peut être appelé depuis un updater `setLives`
  // fonctionnel, avant que le prochain rendu n'ait vu `runStatus` changer.
  const runStatusRef = useRef<RunStatus>("active");
  const bonusKeyRef = useRef(0);

  // Regroupe l'ajout de temps et le flash "+X" affiché à côté du Timer, pour
  // qu'un bonus par chat et un bonus de fin de niveau ne s'écrasent jamais
  // silencieusement l'un l'autre (cf. l'effet de victoire ci-dessous, qui
  // additionne les deux avant un unique appel).
  const addTime = useCallback((amount: number) => {
    if (!amount) return;
    setTimeLeft((prev) => (prev ?? 0) + amount);
    bonusKeyRef.current += 1;
    setTimeBonus({ amount, key: bonusKeyRef.current });
  }, []);

  useEffect(() => {
    if (!timeBonus) return;
    const timeoutId = window.setTimeout(() => setTimeBonus(null), 1200);
    return () => window.clearTimeout(timeoutId);
  }, [timeBonus]);

  const endRun = useCallback(() => {
    if (runStatusRef.current === "gameOver") return;
    runStatusRef.current = "gameOver";
    setRunStatus("gameOver");
    haptics.cancel();
    haptics.trigger("error");
    sounds.play("game_over");
  }, []);

  const handleInvalidPlacement = useCallback(() => {
    if (!config.hasRun) return;
    setLives((prev) => {
      const next = Math.max(0, prev - 1);
      if (next === 0) endRun();
      return next;
    });
  }, [config.hasRun, endRun]);

  const handleValidPlacement = useCallback(() => {
    const bonus = config.timeBonusPerPawn;
    if (!config.hasRun || !bonus) return;
    addTime(bonus);
  }, [config.hasRun, config.timeBonusPerPawn, addTime]);

  const level = useLevel({
    maxErrors: config.hasRun ? Infinity : undefined,
    onInvalidPlacement: handleInvalidPlacement,
    onValidPlacement: handleValidPlacement,
  });

  // Applique les bonus de palier une seule fois par victoire de niveau (pas à
  // chaque rendu tant que le statut reste "won", en attendant que le joueur
  // enchaîne sur le niveau suivant).
  const prevLevelStatus = useRef(level.status);
  useEffect(() => {
    if (level.status === "won" && prevLevelStatus.current !== "won") {
      setLevelsCompleted((prev) => {
        const next = prev + 1;
        // Bonus de fin de niveau + palier additionnés avant un unique appel
        // à addTime : sinon le second écraserait le flash "+X" du premier.
        let levelBonus = 0;
        if (config.timeBonusPerWin) levelBonus += config.timeBonusPerWin;
        if (
          config.timeBonusMilestone &&
          next % config.timeBonusMilestone.every === 0
        ) {
          levelBonus += config.timeBonusMilestone.bonus;
        }
        if (levelBonus) addTime(levelBonus);
        if (config.livesBonusEvery && next % config.livesBonusEvery === 0) {
          setLives((l) => Math.min(config.maxLives ?? l, l + 1));
        }
        return next;
      });
    }
    prevLevelStatus.current = level.status;
  }, [level.status, config, addTime]);

  // Chrono uniquement (config.startTime défini) : décompte actif seulement
  // pendant une partie jouable de la run (pause au chargement et sur l'écran
  // de victoire d'un niveau, le temps que le joueur enchaîne).
  // ponytail: setInterval brut, pas de correction de dérive — l'écart cumulé
  // sur une run de quelques minutes est imperceptible ici.
  const hasTimer = config.startTime !== undefined;
  useEffect(() => {
    if (!hasTimer || runStatus !== "active" || level.status !== "playing")
      return;
    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === undefined) return prev;
        const next = prev - 1;
        if (next <= 0) {
          endRun();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [hasTimer, runStatus, level.status, endRun]);

  return {
    ...level,
    lives,
    maxLives: config.maxLives ?? lives,
    timeLeft,
    timeBonus,
    levelsCompleted,
    runStatus,
  };
};
