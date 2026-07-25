import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LazyMotion, domAnimation } from "motion/react";
import App from "./App.tsx";
import { playAmbient, sounds } from "./lib/sounds.ts";
import "./index.css";

// Les entrées d'historique poussées par le Dialog (fermeture via le
// bouton/geste retour) ne servent qu'à intercepter la navigation, pas à une
// vraie page — la restauration auto du scroll/zoom du navigateur sur
// back/forward n'a donc pas lieu d'être ici.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

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
