import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LazyMotion, domAnimation } from "motion/react";
import App from "./App.tsx";
import { playAmbient, sounds } from "./lib/sounds.ts";
import "./index.css";

void sounds.preload();
// ponytail: "pointerup" (fin de geste), pas "pointerdown" — Safari/iOS
// n'autorise le déblocage audio que sur un événement de fin de geste
// (touchend/pointerup/click), pas sur son déclenchement.
window.addEventListener(
  "pointerup",
  () => {
    sounds.unlock();
    playAmbient();
  },
  { once: true },
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LazyMotion features={domAnimation}>
      <App />
    </LazyMotion>
  </StrictMode>,
);
