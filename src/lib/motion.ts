// Centralized motion tokens for `motion/react` — import these instead of
// hand-typing curves so every animated element in the app stays consistent.
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const; // iOS-like drawer curve
export const SPRING_BOUNCE = {
  type: "spring",
  duration: 0.5,
  bounce: 0.2,
} as const;
