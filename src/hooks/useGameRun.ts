import { useCallback, useEffect, useRef, useState } from "react";
import { useLevel } from "@/hooks/useLevel";
import { countLevelPlayed, track } from "@/lib/analytics";
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
interface UseGameRunOptions {
  // Gèle le décompte du chrono (ex: pendant l'AlertDialog de confirmation
  // d'abandon de run) sans toucher au reste de l'état de la run.
  paused?: boolean;
}

export const useGameRun = (
  mode: GameMode,
  { paused = false }: UseGameRunOptions = {},
) => {
  const config = GAME_MODES[mode];
  const [lives, setLives] = useState(config.startLives ?? 0);
  const [timeLeft, setTimeLeft] = useState(config.startTime);
  const [levelsCompleted, setLevelsCompleted] = useState(0);
  const [runStatus, setRunStatus] = useState<RunStatus>("active");
  const [timeBonus, setTimeBonus] = useState<TimeBonus | null>(null);
  const [totalPawsPlaced, setTotalPawsPlaced] = useState(0);
  // Temps réel écoulé depuis le début de la run (récap de fin de run) —
  // distinct de `timeLeft`, qui suit le budget Chrono et ses bonus.
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // `useState(() => ...)` plutôt que `useRef(Date.now())` : le lazy
  // initializer est le seul appel impur toléré au rendu par
  // `react-hooks/purity` (cf. GLRN-227).
  const [startedAt] = useState(() => Date.now());
  // Miroir synchrone : `endRun` peut être appelé depuis un updater `setLives`
  // fonctionnel, avant que le prochain rendu n'ait vu `runStatus` changer.
  const runStatusRef = useRef<RunStatus>("active");
  const bonusKeyRef = useRef(0);
  const levelsCompletedRef = useRef(0);
  const totalPawsRef = useRef(0);

  // --- Analytics : instantané du niveau en cours, lu par les events de fin
  // (endRun/abandon/démontage), mis à jour par effet — jamais pendant le rendu.
  const liveLevelRef = useRef<{
    props: Record<string, string | number | boolean>;
    startedAt: number;
    status: string;
    found: number;
    errors: number;
    markers: number;
    help: boolean;
    ended: boolean;
  } | null>(null);

  // Un seul `level_ended` par niveau (`ended`), quelle que soit la sortie :
  // won/lost, run terminée, niveau passé, ou partie quittée.
  const endLevel = useCallback(
    (outcome: "won" | "lost" | "run_over" | "skipped" | "abandoned") => {
      const live = liveLevelRef.current;
      if (!live || live.ended) return;
      live.ended = true;
      track("level_ended", {
        ...live.props,
        outcome,
        duration_s: Math.round((Date.now() - live.startedAt) / 1000),
        paws_found: live.found,
        errors: live.errors,
        markers_count: live.markers,
        marking_help: live.help,
        lifetime_levels: countLevelPlayed(),
      });
    },
    [],
  );

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

  const endRun = useCallback(
    (reason: "lives" | "time") => {
      if (runStatusRef.current === "gameOver") return;
      runStatusRef.current = "gameOver";
      setRunStatus("gameOver");
      const duration = Math.round((Date.now() - startedAt) / 1000);
      setElapsedSeconds(duration);
      endLevel("run_over");
      track("run_ended", {
        mode,
        reason,
        levels_completed: levelsCompletedRef.current,
        paws_placed: totalPawsRef.current,
        duration_s: duration,
      });
      haptics.cancel();
      haptics.trigger("error");
      sounds.play("game_over");
    },
    [startedAt, endLevel, mode],
  );

  const handleInvalidPlacement = useCallback(() => {
    if (!config.hasRun) return;
    setLives((prev) => {
      const next = Math.max(0, prev - 1);
      if (next === 0) endRun("lives");
      return next;
    });
  }, [config.hasRun, endRun]);

  const handleValidPlacement = useCallback(() => {
    if (!config.hasRun) return;
    totalPawsRef.current += 1;
    setTotalPawsPlaced(totalPawsRef.current);
    const bonus = config.timeBonusPerPawn;
    if (bonus) addTime(bonus);
  }, [config.hasRun, config.timeBonusPerPawn, addTime]);

  const level = useLevel({
    maxErrors: config.hasRun ? Infinity : undefined,
    onInvalidPlacement: handleInvalidPlacement,
    onValidPlacement: handleValidPlacement,
  });

  // Applique les bonus de palier une seule fois par victoire de niveau (pas à
  // chaque rendu tant que le statut reste "won", en attendant que le joueur
  // enchaîne sur le niveau suivant).
  //
  // `next` est calculé via un ref (levelsCompletedRef) et `setLevelsCompleted`
  // reçoit une valeur directe, pas un updater fonctionnel : un updater
  // `(prev) => {...}` contenant des effets de bord (setLives/addTime) serait
  // invoqué deux fois par React en StrictMode (vérif de pureté), doublant le
  // gain de vie/temps à chaque palier — cf. GLRN-140, même classe de bug.
  const prevLevelStatus = useRef(level.status);
  useEffect(() => {
    if (level.status === "won" && prevLevelStatus.current !== "won") {
      const next = levelsCompletedRef.current + 1;
      levelsCompletedRef.current = next;
      setLevelsCompleted(next);

      // Bonus de fin de niveau + palier additionnés avant un unique appel à
      // addTime : sinon le second écraserait le flash "+X" du premier.
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
    }
    prevLevelStatus.current = level.status;
  }, [level.status, config, addTime]);

  // --- Analytics : début/fin de niveau.
  const { level: currentLevel, levelId, status: levelStatus } = level;
  useEffect(() => {
    if (!currentLevel) return;
    const { grid } = currentLevel;
    const props = {
      mode,
      shape: grid.active.flat().every(Boolean) ? "square" : "circle",
      size: grid.size,
      difficulty: currentLevel.difficulty,
      level_number: levelId,
      ...(config.hasRun && { run_level: levelsCompletedRef.current + 1 }),
    };
    liveLevelRef.current = {
      props,
      startedAt: Date.now(),
      status: "playing",
      found: 0,
      errors: 0,
      markers: 0,
      help: true,
      ended: false,
    };
    track("level_started", props);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- un event par nouvelle grille (levelId), pas à chaque rendu
  }, [levelId]);

  const found = level.placed.filter((p) => !p.invalid).length;
  const invalidCount = level.placed.length - found;
  const markersCount = level.markers.length;
  const { help } = level;
  useEffect(() => {
    const live = liveLevelRef.current;
    if (!live) return;
    live.status = levelStatus;
    live.found = found;
    // En Marathon, `errors` du niveau est le nombre de poses fautives (le pool
    // de vies est suivi à part dans run_ended).
    live.errors = invalidCount;
    live.markers = markersCount;
    live.help = help;
    if (levelStatus === "won" || levelStatus === "lost") endLevel(levelStatus);
  }, [levelStatus, found, invalidCount, markersCount, help, endLevel]);

  // Démontage (retour accueil / relance de run) en plein niveau.
  useEffect(
    () => () => {
      if (liveLevelRef.current?.status === "playing") endLevel("abandoned");
    },
    [endLevel],
  );

  // "Nouvelle partie" pendant un niveau non terminé = niveau passé.
  const { newLevel: requestNewLevel } = level;
  const newLevel = useCallback(() => {
    if (liveLevelRef.current?.status === "playing") endLevel("skipped");
    requestNewLevel();
  }, [requestNewLevel, endLevel]);

  const abandonRun = useCallback(
    (action: "restart" | "home") =>
      track("run_abandoned", {
        mode,
        action,
        levels_completed: levelsCompletedRef.current,
        duration_s: Math.round((Date.now() - startedAt) / 1000),
      }),
    [mode, startedAt],
  );

  // Chrono uniquement (config.startTime défini) : décompte actif seulement
  // pendant une partie jouable de la run (pause au chargement et sur l'écran
  // de victoire d'un niveau, le temps que le joueur enchaîne).
  // ponytail: setInterval brut, pas de correction de dérive — l'écart cumulé
  // sur une run de quelques minutes est imperceptible ici.
  const hasTimer = config.startTime !== undefined;
  useEffect(() => {
    if (
      !hasTimer ||
      runStatus !== "active" ||
      level.status !== "playing" ||
      paused
    )
      return;
    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === undefined) return prev;
        const next = prev - 1;
        if (next <= 0) {
          endRun("time");
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [hasTimer, runStatus, level.status, paused, endRun]);

  return {
    ...level,
    newLevel,
    abandonRun,
    lives,
    maxLives: config.maxLives ?? lives,
    timeLeft,
    timeBonus,
    levelsCompleted,
    totalPawsPlaced,
    elapsedSeconds,
    runStatus,
  };
};
