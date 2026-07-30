import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { CELL_STAGGER_MS, CELL_TRANSITION_MS, Grid } from "@/components/Grid";
import { GameActions } from "@/components/GameScreen/components/GameActions";
import { GameOverPanel } from "@/components/GameScreen/components/GameOverPanel";
import { RunHeader } from "@/components/GameScreen/components/RunHeader";
import { GridSkeleton } from "@/components/GridSkeleton";
import { useGameRun } from "@/hooks/useGameRun";
import { GAME_MODES, type GameMode } from "@/lib/gameModes";
import { EASE_OUT } from "@/lib/motion";
import { sounds } from "@/lib/sounds";

interface GameScreenProps {
  mode: GameMode;
  onReplay: () => void;
  onChangeMode: () => void;
}

export function GameScreen({ mode, onReplay, onChangeMode }: GameScreenProps) {
  const config = GAME_MODES[mode];
  // Gèle le chrono de la run tant qu'un panneau modal (confirmation
  // d'abandon, réglages, règles) est ouvert par-dessus le jeu — perdre du
  // temps pendant qu'on consulte un menu serait déloyal envers le joueur.
  const [runPaused, setRunPaused] = useState(false);
  // Fin de run (vies/temps épuisés) : la grille reste affichée avec la
  // solution le temps que le joueur clique "Voir les résultats", plutôt que
  // de basculer immédiatement sur le récap — cf. le comportement "lost" déjà
  // en place pour le mode Classique.
  const [recapConfirmed, setRecapConfirmed] = useState(false);
  const {
    level,
    levelId,
    placed,
    markers,
    errors,
    maxErrors,
    status,
    pendingSize,
    help,
    setHelp,
    togglePaw,
    toggleMarker,
    setMarker,
    newLevel,
    lives,
    maxLives,
    timeLeft,
    timeBonus,
    levelsCompleted,
    totalPawsPlaced,
    elapsedSeconds,
    runStatus,
  } = useGameRun(mode, { paused: runPaused });
  const reduceMotion = useReducedMotion();

  // Une régénération repasse `status` à "loading" alors que `level` reste en
  // mémoire : l'affichage continue de montrer la partie en cours plutôt que de
  // basculer sur le spinner. `status` brut reste la source pour `disabled`,
  // qui doit bien bloquer la grille pendant la génération.
  const displayStatus = status === "loading" ? "playing" : status;
  // La ligne d'entête (HeartsRow) affiche le pool de vies de la run pour
  // Chrono/Endurance, mais Grid garde les erreurs brutes du niveau (feedback
  // de secousse immédiat, indépendant du pool de vies partagé).
  const headerErrors = config.hasRun ? maxLives - lives : errors;
  const headerMaxErrors = config.hasRun ? maxLives : maxErrors;
  // Quitter ou relancer perd la progression de la run (niveaux/vies/temps) :
  // guard de confirmation obligatoire pour Chrono/Endurance. Classique n'a
  // pas de run à perdre (entraînement libre, niveaux indépendants).
  const isRunActive = config.hasRun && runStatus === "active";

  // Joue `new_game` une fois la grille complètement apparue (dernière case =
  // delay max + durée de sa transition), pas au moment de la demande. Pas sur
  // le tout premier niveau (levelId === 1, auto-généré au montage sans geste
  // utilisateur).
  useEffect(() => {
    if (!level || levelId <= 1) return;
    const lastCellDelay = reduceMotion
      ? 0
      : 2 * (level.grid.size - 1) * CELL_STAGGER_MS;
    const timeoutId = window.setTimeout(
      () => sounds.play("new_game"),
      lastCellDelay + CELL_TRANSITION_MS,
    );
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- déclenché uniquement par un changement de grille, pas par reduceMotion
  }, [levelId]);

  if (runStatus === "gameOver" && recapConfirmed) {
    return (
      <GameOverPanel
        levelsCompleted={levelsCompleted}
        totalPawsPlaced={totalPawsPlaced}
        elapsedSeconds={elapsedSeconds}
        onReplay={onReplay}
        onChangeMode={onChangeMode}
      />
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!level ? (
        <div key="loading" className="w-full max-w-md">
          <GridSkeleton size={pendingSize} />
        </div>
      ) : (
        <m.div
          key="level"
          // Le reste de la colonne (titre, statut, boutons, gaps, padding
          // de `main`, footer) mesure ~19rem. Au-delà, la grille doit
          // rétrécir plutôt que pousser le contenu hors de l'écran — sinon
          // la page déborde de quelques pixels et scrolle sur mobile.
          // Plafond posé ici et pas sur la grille seule : le bloc entier
          // suit, donc la rangée de boutons reste alignée sur la grille.
          // Sur un écran haut, `min()` retombe sur 28rem = `max-w-md`
          // d'origine, rien ne change. En PWA standalone (pas de barre
          // d'URL), `100dvh` inclut la zone sous l'encoche/l'indicateur
          // d'accueil — non comptée dans les 19rem — d'où les
          // `env(safe-area-inset-*)` en plus, à 0 hors PWA.
          className="flex w-full max-w-[min(28rem,calc(100dvh-19rem-env(safe-area-inset-top)-env(safe-area-inset-bottom)))] flex-col items-center gap-4"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          {status === "won" && <ConfettiBurst key={levelId} />}
          <RunHeader
            displayStatus={displayStatus}
            levelId={levelId}
            difficulty={level.difficulty}
            found={placed.filter((p) => !p.invalid).length}
            total={level.solution.length}
            errors={headerErrors}
            maxErrors={headerMaxErrors}
            timeLeft={timeLeft}
            timeBonus={timeBonus}
            levelsCompleted={config.hasRun ? levelsCompleted : undefined}
          />
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {status === "loading" ? (
                <GridSkeleton key="skeleton" size={pendingSize} />
              ) : (
                <Grid
                  key={levelId}
                  grid={level.grid}
                  placed={placed}
                  markers={markers}
                  help={help}
                  errors={errors}
                  disabled={status !== "playing" || runStatus === "gameOver"}
                  showSolution={status === "lost" || runStatus === "gameOver"}
                  solution={level.solution}
                  onTogglePaw={togglePaw}
                  onToggleMarker={toggleMarker}
                  onSetMarker={setMarker}
                />
              )}
            </AnimatePresence>
          </div>
          <GameActions
            isRunActive={isRunActive}
            runEnded={runStatus === "gameOver"}
            status={status}
            help={help}
            onHelpChange={setHelp}
            onNewLevel={newLevel}
            onReplayRun={onReplay}
            onChangeMode={onChangeMode}
            onShowRecap={() => setRecapConfirmed(true)}
            onRunPauseChange={setRunPaused}
          />
        </m.div>
      )}
    </AnimatePresence>
  );
}
