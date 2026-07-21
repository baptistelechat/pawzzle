# 004 — Grow the mobile nav menu from its trigger instead of teleporting

- **Status**: DONE
- **Commit**: 20223ee
- **Severity**: MEDIUM
- **Category**: Missed opportunities (spatial consistency) / Physicality & origin
- **Estimated scope**: 1 file (`src/components/Nav.tsx`)

**Depends on**: 001 (needs `motion/react`/`src/lib/motion.ts`). Independent of plans 002/003/005.

## Problem

`src/components/Nav.tsx:59-79`, current code:

```tsx
{
  open && (
    <div
      id="mobile-nav"
      className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm md:hidden"
    >
      {NAV_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={() => setOpen(false)}
          className={cn(
            link.active ? "font-medium text-primary" : "text-muted-foreground",
          )}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
```

The menu appears/disappears with a plain conditional render — no connection to the hamburger button that opens it, no sense of where it came from (it's attached to the border directly under the navbar, but nothing shows that spatial relationship).

## Target

```tsx
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { EASE_DRAWER } from "@/lib/motion";

// inside Nav(), alongside `const [open, setOpen] = useState(false);`:
const reduceMotion = useReducedMotion();

// replacing src/components/Nav.tsx:59-79:
<AnimatePresence initial={false}>
  {open && (
    <m.div
      key="mobile-nav"
      id="mobile-nav"
      className="overflow-hidden border-t border-border px-4 text-sm md:hidden"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={
        reduceMotion
          ? { duration: 0.15 }
          : { duration: 0.22, ease: EASE_DRAWER }
      }
    >
      <div className="flex flex-col gap-3 py-3">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              link.active
                ? "font-medium text-primary"
                : "text-muted-foreground",
            )}
          >
            {link.label}
          </a>
        ))}
      </div>
    </m.div>
  )}
</AnimatePresence>;
```

Notes on the exact values:

- `height: 0 → "auto"` animates directly (no `layout` prop, no `domMax` needed — `motion` measures `"auto"` heights natively).
- Vertical padding (`py-3`) moves to an **inner** `<div>` while the animated outer node keeps only `border-t`/`px-4`/`overflow-hidden` — this keeps the `height: 0` measurement exact; animating an element whose own padding contributes to its box can clip asymmetrically at `height: 0`.
- `EASE_DRAWER` (`cubic-bezier(0.32, 0.72, 0, 1)`, the iOS-like drawer curve) fits this "panel growing from its attachment edge" motion better than a generic `EASE_OUT`.
- `initial={false}` on `AnimatePresence` — the menu starts closed; without this, nothing changes visually here since `open` starts `false`, but it's the correct default for any enter/exit list keyed on a boolean that starts hidden.

## Repo conventions to follow

- Same as plans 002/003: `m`/`AnimatePresence`/`useReducedMotion` from `motion/react`; new tokens (`EASE_DRAWER`) from `@/lib/motion` (created in plan 001) — do not hand-type the cubic-bezier.

## Steps

1. Add `import { AnimatePresence, m, useReducedMotion } from "motion/react";` and `import { EASE_DRAWER } from "@/lib/motion";` to `src/components/Nav.tsx`.
2. Inside the `Nav` component, add `const reduceMotion = useReducedMotion();` next to the existing `const [open, setOpen] = useState(false);`.
3. Replace `src/components/Nav.tsx:59-79` with the target JSX above — note the `py-3` class moved from the outer `id="mobile-nav"` div onto the new inner wrapper div.

## Boundaries

- Do NOT change the desktop nav (`hidden ... md:flex` block above) — out of scope.
- Do NOT animate the hamburger icon's `Menu`/`X` swap (`src/components/Nav.tsx:54`) — it's an instant, unambiguous state indicator; leave it as-is.
- Do NOT remove `md:hidden` from the animated wrapper.
- If `src/components/Nav.tsx:59-79` doesn't match the excerpt above (drift since commit `20223ee`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` and `pnpm lint` both pass.
- **Feel check**: `pnpm dev`, resize to a mobile viewport, open/close the hamburger menu repeatedly.
  - Confirm the menu grows downward from the border under the navbar (not a plain fade, not from center).
  - Rapidly double-click the hamburger mid-animation — confirm it retargets smoothly (no glitch, no restart-from-zero flash), since `transition` (not `@keyframes`) is used.
  - In DevTools Animations panel, set playback to 10% and confirm a smooth height grow, no visible clipping of link text during the animation.
  - Toggle `prefers-reduced-motion` and confirm the menu still grows/shrinks but with a flat, fast fade instead of the drawer curve.
- **Done when**: all of the above hold and no console errors appear.
