# 005 — A near-imperceptible pop when a pawn/mistake icon is placed

- **Status**: DONE
- **Commit**: 20223ee
- **Severity**: LOW (deliberately subtle — this is a tens-of-times-per-session interaction)
- **Category**: Feedback
- **Estimated scope**: 1 file (`src/components/Grid.tsx`)

**Depends on**: 001 (needs `motion/react`/`src/lib/motion.ts`). Independent of plans 002/003/004.

## Problem

`src/components/Grid.tsx:162-172`, current code:

```tsx
{
  pawn ? (
    pawn.invalid ? (
      <X className="size-2/3 text-destructive" />
    ) : (
      <PawPrint className="size-2/3 text-foreground" />
    )
  ) : (
    isMarked(row, col) && <X className="size-1/2 text-foreground/60" />
  );
}
```

The pawn/mistake icon appears instantly the moment a cell is tapped, with no confirmation that the tap registered.

**Frequency constraint — this must stay subtle.** Placing a pawn happens tens of times per session (every move of the puzzle). Per the Gate this skill's sibling `find-animation-opportunities` audit applied, this tier only permits "near-imperceptible motion (fast, subtle)" — not a showy animation. The marker `X` (help-mode drag target, `isMarked` branch) is **explicitly out of scope**: it fires 100+ times during a single drag stroke and must stay instant (this was already rejected in the prior audit specifically because the drag handler in this same file avoids `pointerenter` to prevent exactly this kind of lag).

## Target

```tsx
import { m, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";

// inside Grid(), alongside the other hooks at the top:
const reduceMotion = useReducedMotion();

// replacing src/components/Grid.tsx:162-172:
{
  pawn ? (
    <m.span
      key={`${pawn.invalid ? "x" : "paw"}-${row}-${col}`}
      className="flex items-center justify-center"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.14, ease: EASE_OUT }}
    >
      {pawn.invalid ? (
        <X className="size-2/3 text-destructive" />
      ) : (
        <PawPrint className="size-2/3 text-foreground" />
      )}
    </m.span>
  ) : (
    isMarked(row, col) && <X className="size-1/2 text-foreground/60" />
  );
}
```

Notes on the exact values:

- 140ms, `EASE_OUT` — at the very bottom of the "press feedback" duration budget (100–160ms), the fastest a pop can read as intentional rather than laggy.
- `scale: 0.85 → 1` (not `scale(0)`) — nothing in the real world appears from nothing.
- No `exit` animation, no `AnimatePresence` wrapping — removing a pawn (tapping an invalid one again clears it, per `useLevel.ts`'s `togglePaw`) stays instant, deliberately, to keep this interaction fast at its real frequency.
- `useReducedMotion()` drops the `scale` and animates opacity only.

## Repo conventions to follow

- Same as the other plans: `m`/`useReducedMotion` from `motion/react`, `EASE_OUT` from `@/lib/motion` (no `AnimatePresence` needed here, unlike plans 002/003/004).

## Steps

1. Add `import { m, useReducedMotion } from "motion/react";` and `import { EASE_OUT } from "@/lib/motion";` to `src/components/Grid.tsx`.
2. Inside the `Grid` component, add `const reduceMotion = useReducedMotion();` near the other hooks at the top of the function.
3. Replace `src/components/Grid.tsx:162-172` with the target JSX above.

## Boundaries

- Do NOT touch the `isMarked(row, col) && <X .../>` branch — it must stay instant (see "Frequency constraint" above).
- Do NOT add `AnimatePresence` or an `exit` animation for the pawn/mistake icon — removal stays instant.
- Do NOT change the outer `<button>` element, its `key`, `onClick`, `onPointerDown`, or `data-row`/`data-col` attributes.
- If `src/components/Grid.tsx:162-172` doesn't match the excerpt above (drift since commit `20223ee`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` and `pnpm lint` both pass.
- **Feel check**: `pnpm dev`, rapidly tap several different cells in succession.
  - Confirm each placement shows a quick, subtle pop — it should read as "crisp," not "bouncy" or "slow."
  - Confirm rapid tapping across many cells introduces no visible lag or queued/stuttering animations (140ms is short enough to never overlap with the next tap in normal play).
  - Confirm wrong placements (the destructive `X`) get the same quick pop, not a different/slower one.
  - Confirm dragging markers in help mode (the `isMarked` branch) is completely unaffected — still instant.
  - Toggle `prefers-reduced-motion` and confirm the pop becomes a pure opacity fade with no scale.
- **Done when**: all of the above hold and no console errors appear.
