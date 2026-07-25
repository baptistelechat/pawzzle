import { WebHaptics } from "web-haptics";

// Instance unique partagée par toute l'app — trois `useWebHaptics()` indépendants
// (Nav/App/useLevel) pilotaient chacun leur propre minuteur interne tout en
// déclenchant le même `navigator.vibrate()` global : leurs patterns pouvaient se
// couper/s'écraser mutuellement quand deux actions se suivaient de près.
const client = new WebHaptics();
let enabled = true;

export const setHapticsEnabled = (value: boolean) => {
  enabled = value;
};

// Enveloppe trigger/cancel plutôt que d'exposer directement `client`, pour
// que le réglage "Vibrations" du panneau audio coupe tous les appels
// existants (App.tsx, Nav.tsx, AmbientPlayer.tsx, useLevel.ts) sans les
// toucher un par un.
export const haptics = {
  trigger: (...args: Parameters<WebHaptics["trigger"]>) =>
    enabled ? client.trigger(...args) : undefined,
  cancel: () => client.cancel(),
};
