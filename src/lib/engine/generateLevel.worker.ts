/// <reference lib="webworker" />
import { generateLevel } from "@/lib/engine/generator";

self.onmessage = (event: MessageEvent<{ size: number }>) => {
  self.postMessage(generateLevel(event.data.size));
};
