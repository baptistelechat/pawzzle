import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const AUTOPLAY_INTERVAL_MS = 4000;
const RESUME_AFTER_MS = 6000;
const SCROLL_END_DELAY_MS = 120;

export interface RuleSlide {
  title: string;
  description?: string;
  content: React.ReactNode;
}

export const RulesCarousel = ({ slides }: { slides: RuleSlide[] }) => {
  const total = slides.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startScrollLeft: number } | null>(
    null,
  );
  const scrollEndTimeoutRef = useRef<number | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [pauseVersion, setPauseVersion] = useState(0);

  // Boucle infinie sans à-coup : un clone de la dernière slide précède la
  // première, un clone de la première suit la dernière (voir le rendu plus
  // bas). Le scroll natif peut donc continuer dans la même direction au lieu
  // de buter sur une borne ; une fois arrivé sur un clone, on se
  // re-téléporte silencieusement (sans animation, `handleScroll`) sur la
  // vraie slide identique — ni vu ni connu.
  const scrollToDomPosition = (domPosition: number, smooth = true) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({
      left: domPosition * track.clientWidth,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const pause = () => {
    setIsPlaying(false);
    setPauseVersion((v) => v + 1);
  };

  const advance = (direction: 1 | -1) =>
    scrollToDomPosition(index + 1 + direction);

  const next = () => {
    pause();
    advance(1);
  };

  const prev = () => {
    pause();
    advance(-1);
  };

  const goToIndex = (target: number) => {
    pause();
    scrollToDomPosition(target + 1);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    const domPosition = Math.round(scrollLeft / clientWidth);
    setIndex(
      domPosition === 0
        ? total - 1
        : domPosition === total + 1
          ? 0
          : domPosition - 1,
    );

    window.clearTimeout(scrollEndTimeoutRef.current);
    scrollEndTimeoutRef.current = window.setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;
      const settled = Math.round(track.scrollLeft / track.clientWidth);
      if (settled === 0) track.scrollLeft = total * track.clientWidth;
      else if (settled === total + 1) track.scrollLeft = track.clientWidth;
    }, SCROLL_END_DELAY_MS);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = { startX: e.clientX, startScrollLeft: track.scrollLeft };
    setIsDragging(true);
    pause();
  };

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = track.clientWidth;
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      const track = trackRef.current;
      const drag = dragRef.current;
      if (!track || !drag) return;
      track.scrollLeft = drag.startScrollLeft - (e.clientX - drag.startX);
    };
    const handleUp = () => {
      const track = trackRef.current;
      dragRef.current = null;
      setIsDragging(false);
      if (!track) return;
      scrollToDomPosition(Math.round(track.scrollLeft / track.clientWidth));
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => advance(1), AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, index]);

  useEffect(() => {
    if (isPlaying) return;
    const id = window.setTimeout(() => setIsPlaying(true), RESUME_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [isPlaying, pauseVersion]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={prev}
          aria-label="Règle précédente"
        >
          <ChevronLeft />
        </Button>
        <div
          ref={trackRef}
          onScroll={handleScroll}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") pause();
          }}
          onMouseDown={handleMouseDown}
          onDragStart={(e) => e.preventDefault()}
          className={cn(
            "flex flex-1 snap-x overflow-x-auto select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            isDragging
              ? "cursor-grabbing snap-none"
              : "cursor-grab snap-mandatory",
          )}
        >
          {[slides[total - 1], ...slides, slides[0]].map((slide, i) => (
            <section
              key={
                i === 0
                  ? "clone-start"
                  : i === total + 1
                    ? "clone-end"
                    : slide.title
              }
              className="flex w-full shrink-0 snap-center snap-always flex-col gap-3 px-1"
            >
              <div>
                <h3 className="text-sm font-semibold">{slide.title}</h3>
                {slide.description && (
                  <p className="text-sm text-muted-foreground">
                    {slide.description}
                  </p>
                )}
              </div>
              {slide.content}
            </section>
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={next}
          aria-label="Règle suivante"
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="grid grid-cols-3 items-center">
        <div />
        <div className="flex justify-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => goToIndex(i)}
              aria-label={`Aller à : ${slide.title}`}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === index ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setPauseVersion((v) => v + 1);
              setIsPlaying((p) => !p);
            }}
            aria-label={isPlaying ? "Mettre en pause" : "Lecture automatique"}
          >
            {isPlaying ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
          </Button>
          <span>
            {index + 1}/{slides.length}
          </span>
        </div>
      </div>
    </div>
  );
};
