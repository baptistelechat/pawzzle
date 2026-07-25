# 001 — Install `motion` and set up a centralized motion vocabulary

- **Status**: DONE
- **Commit**: 20223ee
- **Severity**: N/A (infrastructure prerequisite for plans 002–005)
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 dependency add, 2 files (1 edited, 1 created)

## Problem

No motion library is installed (`package.json` has no `motion`/`framer-motion` entry). `src/index.css` defines no `--ease-*` duration/curve tokens either. Every animation plan that follows (002–005) needs a shared, centralized place for easing curves and spring configs instead of each file hand-typing its own `cubic-bezier` — otherwise plans 002–005 duplicate near-identical values (a "Cohesion & tokens" finding by definition).

Current `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

## Target

1. `motion` installed as a dependency.
2. A single `<LazyMotion features={domAnimation}>` wrapping the app root in `main.tsx` — per this team's own established convention (see "Repo conventions" below), every animated element downstream must use `m.*` components imported from `motion/react`, never the unbundled `motion.*`.
3. A new `src/lib/motion.ts` exporting the exact tokens plans 002–005 import — this is the "centralized place" for motion values:

```ts
// Centralized motion tokens for `motion/react` — import these instead of
// hand-typing curves so every animated element in the app stays consistent.
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const; // iOS-like drawer curve
export const SPRING_BOUNCE = {
  type: "spring",
  duration: 0.5,
  bounce: 0.2,
} as const;
```

Target `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LazyMotion, domAnimation } from "motion/react";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LazyMotion features={domAnimation}>
      <App />
    </LazyMotion>
  </StrictMode>,
);
```

## Repo conventions to follow

- This is the first use of `motion` in this repo, but the pattern to follow is the team's standing convention for `motion/react`: **one `<LazyMotion>` at the root, `m.*` everywhere else** (never mix in bare `motion.*` — it defeats the point of `LazyMotion`'s bundle-splitting).
- Use `domAnimation` (not `domMax`). None of plans 002–005 use the `layout` prop or drag gestures — they all use `initial`/`animate`/`exit` or animate `height: "auto"` directly, which `domAnimation` fully supports. If a future feature adds the `layout` prop, swap to `domMax` at that point (`domAnimation` silently no-ops `layout` — it won't throw, it just won't animate).
- Tokens live in `src/lib/motion.ts`, sitting next to the existing `src/lib/utils.ts` and `src/lib/regionColors.ts` (same folder convention already used in this repo).

## Steps

1. Run `pnpm add motion` (installs the `motion` package — not the legacy `framer-motion` name).
2. Create `src/lib/motion.ts` with the exact content shown in "Target" above.
3. Edit `src/main.tsx` to the exact target shown above (add the `LazyMotion`/`domAnimation` import and wrap `<App />`).

## Boundaries

- Do NOT install `framer-motion` — the package is `motion`, imported from `motion/react`.
- Do NOT use `domMax` — see "Repo conventions."
- Do NOT touch `App.tsx`, `Grid.tsx`, or `Nav.tsx` in this plan — those are plans 002–005.
- Do NOT add CSS custom properties (`--ease-*`) to `index.css` — plans 002–005 consume the JS constants from `src/lib/motion.ts` directly, no parallel CSS token set is needed since nothing here animates via plain CSS transitions.
- If `src/main.tsx` or `package.json` don't match the excerpts above (drift since commit `20223ee`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` succeeds with zero TypeScript errors on the new imports. `pnpm lint` passes.
- **Feel check**: `pnpm dev`, confirm the app still mounts and renders exactly as before (this plan introduces no visible change yet — it's pure setup). Check the browser console for zero errors mentioning `motion` or missing `LazyMotion` features.
- **Done when**: `motion` appears in `package.json` dependencies, `src/lib/motion.ts` exists with the three exported constants, `src/main.tsx` wraps `<App />` in `<LazyMotion features={domAnimation}>`, and the app behaves identically to before (no visual regressions).
