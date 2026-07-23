import { m } from "motion/react";

// Cercle de progression de l'appui long (SVG, viewBox 0 0 36 36).
const PRESS_RING_RADIUS = 15;
const PRESS_RING_CIRCUMFERENCE = 2 * Math.PI * PRESS_RING_RADIUS;

interface PressRingProps {
  durationMs: number;
}

export const PressRing = ({ durationMs }: PressRingProps) => (
  <m.svg
    viewBox="0 0 36 36"
    className="pointer-events-none absolute inset-0 size-full -rotate-90"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.1 }}
  >
    <circle
      cx="18"
      cy="18"
      r={PRESS_RING_RADIUS}
      fill="none"
      strokeWidth="3"
      className="stroke-foreground/20"
    />
    <m.circle
      cx="18"
      cy="18"
      r={PRESS_RING_RADIUS}
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      className="stroke-foreground"
      strokeDasharray={PRESS_RING_CIRCUMFERENCE}
      initial={{ strokeDashoffset: PRESS_RING_CIRCUMFERENCE }}
      animate={{ strokeDashoffset: 0 }}
      transition={{ duration: durationMs / 1000, ease: "linear" }}
    />
  </m.svg>
);
