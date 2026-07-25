import { useSyncExternalStore } from "react";
import { getSettings, subscribeSettings } from "@/lib/settings";

export const useSettings = () =>
  useSyncExternalStore(subscribeSettings, getSettings);
