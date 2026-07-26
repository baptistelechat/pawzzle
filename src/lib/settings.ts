import { setHapticsEnabled } from "@/lib/haptics";
import type { GridShape } from "@/lib/engine/types";
import {
  setAmbientMuted,
  setAmbientVolume as setSoundsAmbientVolume,
  sounds,
} from "@/lib/sounds";

export const GRID_SIZE_OPTIONS = [6, 8, 10] as const;
export type GridSize = (typeof GRID_SIZE_OPTIONS)[number];

export const GRID_SHAPE_OPTIONS: { value: GridShape; label: string }[] = [
  { value: "square", label: "Carré" },
  { value: "circle", label: "Rond" },
];

export interface SettingsState {
  hapticsEnabled: boolean;
  sfxEnabled: boolean;
  sfxVolume: number;
  ambientEnabled: boolean;
  ambientVolume: number;
  gridSize: GridSize;
  gridShape: GridShape;
}

const STORAGE_KEY = "pawzzle:settings";

const DEFAULT_SETTINGS: SettingsState = {
  hapticsEnabled: true,
  sfxEnabled: true,
  sfxVolume: 0.5,
  ambientEnabled: true,
  ambientVolume: 0.5,
  gridSize: 6,
  gridShape: "square",
};

const readStored = (): SettingsState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

let state = readStored();
const listeners = new Set<() => void>();

const applyToAudio = () => {
  sounds.setMuted(!state.sfxEnabled);
  sounds.setVolume(state.sfxVolume);
  setAmbientMuted(!state.ambientEnabled);
  setSoundsAmbientVolume(state.ambientVolume);
  setHapticsEnabled(state.hapticsEnabled);
};
applyToAudio();

export const subscribeSettings = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getSettings = () => state;

const update = (partial: Partial<SettingsState>) => {
  state = { ...state, ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  applyToAudio();
  listeners.forEach((listener) => listener());
};

export const setHapticsSetting = (value: boolean) =>
  update({ hapticsEnabled: value });
export const setSfxEnabled = (value: boolean) => update({ sfxEnabled: value });
export const setSfxVolume = (value: number) => update({ sfxVolume: value });
export const setAmbientEnabled = (value: boolean) =>
  update({ ambientEnabled: value });
export const setAmbientVolume = (value: number) =>
  update({ ambientVolume: value });
export const setGridSize = (value: GridSize) => update({ gridSize: value });
export const setGridShape = (value: GridShape) => update({ gridShape: value });
