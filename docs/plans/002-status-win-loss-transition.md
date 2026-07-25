# 002 — Crossfade the status text, with a delight pop on win

- **Status**: DONE
- **Commit**: 20223ee
- **Severity**: HIGH (highest-leverage moment in the whole game loop — currently flat)
- **Category**: Missed opportunities (delight) / State indication
- **Estimated scope**: 1 file (`src/App.tsx`)

**Depends on**: 001 (needs `motion/react` installed and `src/lib/motion.ts`).

## Problem

`src/App.tsx:36-49` (current code):

```tsx
<p
  className={cn(
    "text-sm font-medium",
    status === "won" && "text-primary",
    status === "lost" && "text-destructive",
    status === "playing" && "text-muted-foreground",
  )}
>
  {status === "won"
    ? "Niveau réussi !"
    : status === "lost"
      ? "Niveau échoué — budget d'erreur épuisé."
      : `Erreurs : ${errors} / ${maxErrors}`}
</p>
```

The text swaps instantly between the error counter, "Niveau réussi !", and "Niveau échoué…". Winning a level — the single payoff moment of the entire game loop — gets zero delight. Losing gets no distinct cue beyond a color change on a fully-replaced string.

## Hard constraint — do not re-litigate

`.claude/memory/learnings/LRN-005.md` documents a deliberate, already-verified fix: in this `flex-col justify-center` `<main>`, this `<p>` must **never be added or removed as a DOM element** — a prior bug had a new element appearing/disappearing here reflow the whole centered column and make the grid above visibly jump. The fix was to always keep a single fixed slot and only ever replace its _text content_.

This plan **preserves that invariant**: the outer `<p>` stays permanently mounted, unconditionally, for the lifetime of the component. Only an inner `<span>` (wrapped as `m.span`, keyed by `status`) is mounted/unmounted by `AnimatePresence` — and because it's inline content on a single line, its width changing (not height) does not trigger the `justify-center` recenter bug LRN-005 fixed.

## Target

```tsx
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { EASE_OUT, SPRING_BOUNCE } from "@/lib/motion";

// inside App(), before the return:
const reduceMotion = useReducedMotion();

// replacing src/App.tsx:36-49:
<p
  className={cn(
    "text-sm font-medium",
    status === "won" && "text-primary",
    status === "lost" && "text-destructive",
    status === "playing" && "text-muted-foreground",
  )}
>
  <AnimatePresence mode="popLayout" initial={false}>
    <m.span
      key={status}
      initial={
        reduceMotion
          ? { opacity: 0 }
          : status === "won"
            ? { opacity: 0, scale: 0.9 }
            : { opacity: 0, y: 4 }
      }
      animate={
        reduceMotion
          ? { opacity: 1 }
          : status === "won"
            ? { opacity: 1, scale: 1 }
            : { opacity: 1, y: 0 }
      }
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
      transition={
        status === "won" && !reduceMotion
          ? SPRING_BOUNCE
          : { duration: 0.25, ease: EASE_OUT }
      }
      style={{ display: "inline-block" }}
    >
      {status === "won"
        ? "Niveau réussi !"
        : status === "lost"
          ? "Niveau échoué — budget d'erreur épuisé."
          : `Erreurs : ${errors} / ${maxErrors}`}
    </m.span>
  </AnimatePresence>
</p>;
```

Notes on the exact values:

- `mode="popLayout"` (not `"wait"`) — an exiting span is taken out of flow immediately so the entering one doesn't wait for it, avoiding any moment where the `<p>` briefly contains nothing.
- `initial={false}` on the outer `AnimatePresence` — suppresses the fade-in on the very first mount (this row's first real `status` is `"playing"`, handled by plan 003's entrance instead; without `initial={false}` it would double-animate).
- Win gets `scale: 0.9 → 1` with `SPRING_BOUNCE` (a visible, deliberate overshoot) — this is the one place in the app allowed a bounce, per the "Rare / first-time" frequency tier.
- Loss and the running error counter get a plain `y: 4 → 0` fade with `EASE_OUT`, no bounce — a state-indication cue, not a celebration.
- `display: "inline-block"` is required — `scale`/`y` transforms on a `<span>` (inline by default) don't render reliably in all browsers without it.

## Repo conventions to follow

- Import `m`/`AnimatePresence`/`useReducedMotion` from `motion/react` (never `motion.*` — see plan 001).
- Import `EASE_OUT`/`SPRING_BOUNCE` from `@/lib/motion` (created in plan 001) — do not hand-type the cubic-bezier or spring object again.

## Steps

1. Add the import line `import { AnimatePresence, m, useReducedMotion } from "motion/react";` and `import { EASE_OUT, SPRING_BOUNCE } from "@/lib/motion";` to `src/App.tsx`.
2. Inside the `App` function body, add `const reduceMotion = useReducedMotion();` near the top (alongside the `useLevel()` destructure).
3. Replace the `<p>` block at `src/App.tsx:36-49` with the target JSX above, keeping every existing Tailwind class on the `<p>` unchanged.

## Boundaries

- Do NOT remove, conditionally render, or add a `key` prop to the outer `<p>` element itself — it must stay a single, permanently-mounted DOM node (see "Hard constraint" above).
- Do NOT touch the `<label>`/`<Switch>` sibling in the same row.
- Do NOT add haptics here — haptic feedback for win/loss lives in plan 006 (`useLevel.ts`), not in this UI-only plan.
- If `src/App.tsx:36-49` doesn't match the excerpt above (drift since commit `20223ee`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` and `pnpm lint` both pass with zero errors.
- **Feel check**: `pnpm dev`, play a level to a win and to a loss (or temporarily lower `MAX_ERRORS` in `useLevel.ts` to force a loss quickly, then revert).
  - Confirm the `<p>` element itself never disappears from the DOM (Elements panel: same node persists across all three states — only its child `<span>` changes).
  - Confirm the grid does **not** shift vertically when the status text changes (this is the exact regression LRN-005 fixed — compare the grid's bounding box before/after a status change; it must be pixel-identical).
  - Confirm the win text visibly overshoots slightly (spring bounce) while the loss text does not.
  - In DevTools Animations panel, set playback to 10% and confirm the win pop reads as a spring (decelerating overshoot), not a linear tween.
  - Toggle `prefers-reduced-motion` (Rendering panel) and confirm the text still crossfades via opacity, with no scale/y movement.
- **Done when**: all of the above hold and no console errors appear.
