import {
  Disc3,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAmbientPlayer } from "@/hooks/useAmbientPlayer";
import { useSettings } from "@/hooks/useSettings";
import { haptics } from "@/lib/haptics";
import { EASE_OUT } from "@/lib/motion";
import { setAmbientEnabled } from "@/lib/settings";
import {
  nextAmbientTrack,
  previousAmbientTrack,
  sounds,
  toggleAmbientPlayback,
} from "@/lib/sounds";

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

export const AmbientPlayer = () => {
  const { title, artist, isPlaying, currentTime, duration } =
    useAmbientPlayer();
  const { ambientEnabled } = useSettings();
  const isMuted = !ambientEnabled;
  const reduceMotion = useReducedMotion();

  const subtitle = [
    artist,
    `${formatTime(currentTime)} / ${formatTime(duration)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <AnimatePresence>
      {title && (
        <m.div
          key="ambient-player"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="flex w-full max-w-md items-center gap-1 rounded-full border border-border bg-background/95 py-1.5 pr-2 pl-3 shadow-lg backdrop-blur"
        >
          {/* Le disque sort (glisse+fade) puis le suivant entre — simule un
          changement de vinyle plutôt qu'un simple cross-fade de texte. */}
          <div className="relative size-4 shrink-0">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={title}
                initial={{
                  opacity: 0,
                  x: reduceMotion ? 0 : -8,
                  rotate: reduceMotion ? 0 : -45,
                }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{
                  opacity: 0,
                  x: reduceMotion ? 0 : 8,
                  rotate: reduceMotion ? 0 : 45,
                }}
                transition={{
                  duration: reduceMotion ? 0 : 0.25,
                  ease: EASE_OUT,
                }}
              >
                <Disc3
                  className="size-4 animate-[spin_3s_linear_infinite] text-muted-foreground"
                  style={{
                    animationPlayState:
                      isPlaying && !reduceMotion ? "running" : "paused",
                  }}
                />
              </m.div>
            </AnimatePresence>
          </div>
          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={title}
                className="flex min-w-0 flex-col leading-tight pl-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.2,
                  ease: EASE_OUT,
                }}
              >
                <span className="truncate text-xs font-medium">{title}</span>
                <span className="truncate text-[0.65rem] text-muted-foreground">
                  {subtitle}
                </span>
              </m.div>
            </AnimatePresence>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Piste précédente"
            onClick={() => {
              haptics.trigger("selection");
              sounds.play("ui_click");
              previousAmbientTrack();
            }}
          >
            <SkipBack className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isPlaying ? "Mettre en pause" : "Reprendre la lecture"}
            onClick={() => {
              haptics.trigger("selection");
              sounds.play("ui_toggle");
              toggleAmbientPlayback();
            }}
          >
            {isPlaying ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Piste suivante"
            onClick={() => {
              haptics.trigger("selection");
              sounds.play("ui_click");
              nextAmbientTrack();
            }}
          >
            <SkipForward className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isMuted ? "Réactiver le son" : "Couper le son"}
            onClick={() => {
              haptics.trigger("selection");
              sounds.play("ui_toggle");
              setAmbientEnabled(isMuted);
            }}
          >
            {isMuted ? (
              <VolumeX className="size-3.5" />
            ) : (
              <Volume2 className="size-3.5" />
            )}
          </Button>
        </m.div>
      )}
    </AnimatePresence>
  );
};
