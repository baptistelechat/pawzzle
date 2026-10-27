/// <reference lib="webworker" />
import type { GridShape } from "@/lib/engine/types";
import { generateLevel } from "@/lib/engine/generator";

self.onmessage = (event: MessageEvent<{ size: number; shape: GridShape }>) => {
  try {
    const { size, shape } = event.data;
    self.postMessage({ ok: true, level: generateLevel(size, shape) });
  } catch {
    self.postMessage({ ok: false });
  }
};
