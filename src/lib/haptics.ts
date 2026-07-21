import { WebHaptics } from "web-haptics";

// Instance unique partagée par toute l'app — trois `useWebHaptics()` indépendants
// (Nav/App/useLevel) pilotaient chacun leur propre minuteur interne tout en
// déclenchant le même `navigator.vibrate()` global : leurs patterns pouvaient se
// couper/s'écraser mutuellement quand deux actions se suivaient de près.
export const haptics = new WebHaptics();
