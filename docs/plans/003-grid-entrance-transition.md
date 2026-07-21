# 003 — Fade the level content in as it replaces the loading spinner

- **Status**: DONE (amended post-implementation — see note below)
- **Commit**: 20223ee
- **Severity**: MEDIUM
- **Category**: Missed opportunities (preventing a jarring change)
- **Estimated scope**: 1 file (`src/App.tsx`)

> **Post-implementation fix (2026-07-21)**: `mode="wait"` as specified below caused a real, reliably reproducible bug — clicking "Nouvelle partie" got the UI permanently stuck on the loading spinner even though the worker responded correctly and React state (`status`/`level`) updated fine. Root cause: clicking the button flips `status` `playing→loading→playing` fast enough (worker round-trip ~ms) to fire a **third** children-swap before `AnimatePresence`'s `mode="wait"` had resolved the **second** one — its sequential exit-then-enter queue never recovered, and the "level" content silently never (re)mounted. Fixed by switching to `mode="popLayout"` (matching plan 002's own choice, for the same reason: no sequential waiting queue to race) and adding an explicit `exit={{ opacity: 0 }}` to the `key="level"` node (it previously had none). See [LRN-009](../../.claude/memory/learnings/LRN-009.md).

**Depends on**: 001 (needs `motion/react`/`src/lib/motion.ts`) and **002** (this plan wraps the same JSX region plan 002 edits — apply 002 first; the excerpt below shows the code _after_ 002 has been applied).

## Problem

`src/App.tsx:31-70`, current code (after plan 002 has been applied — the `<p>` now contains the `AnimatePresence`/`m.span` from plan 002, omitted below for brevity but present in the real file):

```tsx
{
  status === "loading" || !level ? (
    <Loader2 className="size-8 animate-spin text-muted-foreground" />
  ) : (
    <>
      <div className="flex items-center gap-4">
        <p className={cn(/* … from plan 002 … */)}>{/* … */}</p>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={help} onCheckedChange={setHelp} />
          Aide
        </label>
      </div>
      <div className="w-full max-w-md">
        <Grid
          grid={level.grid}
          placed={placed}
          markers={markers}
          help={help}
          onTogglePaw={togglePaw}
          onToggleMarker={toggleMarker}
          onSetMarker={setMarker}
        />
      </div>
      <Button onClick={newLevel}>
        {status === "playing" ? "Nouvelle partie" : "Rejouer"}
      </Button>
    </>
  );
}
```

The spinner is replaced by the entire status row + grid + button in a single instant swap, every time a level finishes generating — on first load and every "Nouvelle partie"/"Rejouer" click. No bridge between the two states.

## Target

```tsx
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";

// inside App(), reuse the same `reduceMotion` from plan 002 — do not declare it twice.

<AnimatePresence mode="wait">
  {status === "loading" || !level ? (
    <m.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: EASE_OUT }}
    >
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </m.div>
  ) : (
    <m.div
      key="level"
      className="flex w-full flex-col items-center gap-4"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
    >
      <div className="flex items-center gap-4">
        <p className={cn(/* unchanged from plan 002 */)}>
          {/* unchanged from plan 002 */}
        </p>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={help} onCheckedChange={setHelp} />
          Aide
        </label>
      </div>
      <div className="w-full max-w-md">
        <Grid
          grid={level.grid}
          placed={placed}
          markers={markers}
          help={help}
          onTogglePaw={togglePaw}
          onToggleMarker={toggleMarker}
          onSetMarker={setMarker}
        />
      </div>
      <Button onClick={newLevel}>
        {status === "playing" ? "Nouvelle partie" : "Rejouer"}
      </Button>
    </m.div>
  )}
</AnimatePresence>;
```

Notes on the exact values:

- `mode="wait"` (not `"popLayout"`, unlike plan 002) — here the size change (small spinner → full game content) is a _legitimate_ layout change under `justify-center`, not the LRN-005 bug case (that bug was about already-visible content jumping; this is content appearing for the first time). A brief wait between exit and enter is imperceptible at this frequency (occasional, once per level).
- The `key="level"` wrapper's own class (`flex w-full flex-col items-center gap-4`) replaces the bare `<>...</>` fragment — it must produce the same visual layout as the fragment did (the parent `<main>` already provides `items-center`/`gap-4`, so this inner wrapper mainly exists to give `m.div` something to animate; verify no double gap/spacing appears).
- No stagger between the status row / grid / button — three elements is not a "group entrance" list, and adding one would be unrequested polish at this frequency tier.

## Repo conventions to follow

- Same as plan 002: `m`/`AnimatePresence`/`useReducedMotion` from `motion/react`, `EASE_OUT` from `@/lib/motion`.
- Reuse the single `reduceMotion` declaration already added in plan 002 — do not call `useReducedMotion()` a second time in the same component.

## Steps

1. Confirm plan 002 has already been applied to `src/App.tsx` (the status `<p>` should already contain the `AnimatePresence`/`m.span` from that plan). If not, STOP and apply plan 002 first.
2. Add `import { AnimatePresence, m, useReducedMotion } from "motion/react";` if not already present from plan 002 (same import line — do not duplicate it), and `import { EASE_OUT } from "@/lib/motion";` if not already present.
3. Replace the `{status === "loading" || !level ? (...) : (<>...</>)}` block at `src/App.tsx:31-70` with the target JSX above, preserving every prop passed to `<Grid>` and the `<Button>` children exactly as they are today.

## Boundaries

- Do NOT change any props passed to `<Grid>` or `<Button>`.
- Do NOT add a stagger between the three children of the `key="level"` wrapper.
- Do NOT animate the `Loader2` spin itself (`animate-spin` stays as-is) — only its container's opacity.
- If the JSX at `src/App.tsx:31-70` doesn't match the excerpt above (accounting for plan 002 already being applied), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` and `pnpm lint` both pass.
- **Feel check**: `pnpm dev`, click "Nouvelle partie" repeatedly.
  - Confirm the spinner fades out, then the full game content fades up (opacity + slight rise) — no flash where both are visible at once, no flash of unstyled/empty gap longer than ~150ms.
  - Confirm the column recentering (from `justify-center`) reads as part of the same smooth motion, not a separate jump after the fade completes.
  - In DevTools Animations panel, set playback to 10% and confirm the entrance rises from `y: 8` to `y: 0` (or from `y: 0` with the reduced-motion flag set).
  - Toggle `prefers-reduced-motion` and confirm the entrance keeps the opacity fade but drops the `y` rise.
- **Done when**: all of the above hold, and rapidly clicking "Nouvelle partie" several times in a row never leaves the UI in a stuck/half-transitioned state.
