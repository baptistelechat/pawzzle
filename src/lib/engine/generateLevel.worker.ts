/// <reference lib="webworker" />
import { generateLevel } from "@/lib/engine/generator";

self.onmessage = (event: MessageEvent<{ size: number }>) => {
  try {
    self.postMessage({ ok: true, level: generateLevel(event.data.size) });
  } catch {
    self.postMessage({ ok: false });
  }
};
