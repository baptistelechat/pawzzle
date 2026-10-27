export type GameMode = "classic" | "marathon";

export interface GameModeConfig {
  id: GameMode;
  label: string;
  description: string;
  hasRun: boolean; // false pour classic : pas de pool de vies/temps partagé entre niveaux
  startLives?: number;
  maxLives?: number;
  livesBonusEvery?: number; // +1 vie tous les N niveaux réussis
  startTime?: number; // secondes
  timeBonusPerPawn?: number; // par chat placé correctement
  timeBonusPerWin?: number; // par niveau réussi
  timeBonusMilestone?: { every: number; bonus: number }; // palier, tous les N niveaux réussis
}

export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  classic: {
    id: "classic",
    label: "Classique",
    description: "Jeu libre, sans limite de temps.",
    hasRun: false,
  },
  marathon: {
    id: "marathon",
    label: "Marathon",
    description:
      "3 vies et une course contre la montre : chaque chat rajoute du temps, progresse pour regagner des vies.",
    hasRun: true,
    startLives: 3,
    maxLives: 3,
    livesBonusEvery: 3,
    startTime: 180,
    timeBonusPerPawn: 5,
    timeBonusPerWin: 10,
    timeBonusMilestone: { every: 5, bonus: 20 },
  },
};

export const GAME_MODE_LIST = Object.values(GAME_MODES);
