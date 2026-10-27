import { Music2, Vibrate, VibrateOff, Volume2, VolumeX } from "lucide-react";
import { IconToggle } from "@/components/IconToggle";
import { useSettings } from "@/hooks/useSettings";
import {
  setAmbientEnabled,
  setHapticsSetting,
  setSfxEnabled,
} from "@/lib/settings";

// Les 3 réglages ambiants (vibrations/sons/musique), réutilisés tels quels
// dans le dialog Réglages (en jeu) et directement sur l'écran d'accueil —
// pas de wrapper de layout ici, chaque appelant choisit sa disposition
// (grille 3 colonnes dans le dialog, rangée flex sur l'accueil).
export const SoundHapticsToggles = () => {
  const settings = useSettings();

  return (
    <>
      <IconToggle
        icon={settings.hapticsEnabled ? Vibrate : VibrateOff}
        label="Vibrations"
        active={settings.hapticsEnabled}
        onToggle={setHapticsSetting}
      />
      <IconToggle
        icon={settings.sfxEnabled ? Volume2 : VolumeX}
        label="Sons"
        active={settings.sfxEnabled}
        onToggle={setSfxEnabled}
      />
      <IconToggle
        icon={Music2}
        label="Ambiance"
        active={settings.ambientEnabled}
        onToggle={setAmbientEnabled}
      />
    </>
  );
};
