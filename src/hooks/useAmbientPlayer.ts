import { useSyncExternalStore } from "react";
import { getAmbientState, subscribeAmbient } from "@/lib/sounds";

export const useAmbientPlayer = () =>
  useSyncExternalStore(subscribeAmbient, getAmbientState);
