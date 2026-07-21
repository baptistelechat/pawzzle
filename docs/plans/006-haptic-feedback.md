# 006 — Haptic feedback across the game loop and secondary UI (web-haptics)

- **Status**: DONE
- **Commit**: 20223ee
- **Severity**: HIGH (explicit ask — success/failure feedback, extended to every meaningful tap)
- **Category**: Feedback (non-visual)
- **Estimated scope**: 3 files (`src/hooks/useLevel.ts`, `src/App.tsx`, `src/components/Nav.tsx`)

**Depends on**: none of plans 001–005 — this plan uses `web-haptics` (already installed, `package.json` has `"web-haptics": "^0.0.6"`), not `motion`. It can be applied independently, in any order relative to 001–005.

**Ordering note**: this plan's `src/App.tsx` and `src/components/Nav.tsx` excerpts below show the code **as of commit `20223ee`** (before plans 002/003/004 touch those files). If 002/003/004 have already been applied, the JSX will be nested differently — locate the exact same elements by their `onCheckedChange={setHelp}` / `onClick={newLevel}` / `onClick={() => setOpen((prev) => !prev)}` handlers (which plans 002–004 do not change) rather than by line number, and apply the same handler-body edits shown here in whatever surrounding JSX you find.

## Problem

No haptic feedback exists anywhere in the app. `web-haptics` (`useWebHaptics()` from `web-haptics/react`) is already installed but unused. On mobile — this is a mobile-first PWA per `CLAUDE.md` — every meaningful game action (placing a pawn correctly or incorrectly, winning, losing) and several secondary UI toggles currently give zero physical feedback.

`web-haptics` presets available (from `node_modules/web-haptics/dist/index.d.ts`, `defaultPatterns`): `success`, `warning`, `error`, `light`, `medium`, `heavy`, `soft`, `rigid`, `selection`, `nudge`, `buzz`.

Known device caveat (already documented in this project's own memory, `~/.claude/global-memory/learnings/GLRN-070.md`): on many Android devices, `navigator.vibrate()` is silently ignored if a vibration is already in progress — so `cancel()` must be called immediately before `trigger()` for any **repeatable** action (placements, toggles). One-shot events (a final win/loss) don't strictly need it, but calling it costs nothing, so this plan calls it everywhere for consistency.

## Target

### 1. `src/hooks/useLevel.ts` — the core feedback loop

Current code (`togglePaw`, full function):

```ts
const togglePaw = useCallback(
  (candidate: Position) => {
    if (!level || status !== "playing") return;
    const existing = placed.find((p) => samePosition(p, candidate));
    if (existing) {
      if (!existing.invalid) return; // réponse correcte : ne se retire pas
      setPlaced((prev) => prev.filter((p) => !samePosition(p, candidate)));
      return;
    }

    setMarkers((prev) => prev.filter((m) => !samePosition(m, candidate)));
    const invalid = !level.solution.some((s) => samePosition(s, candidate));
    const next = [...placed, { ...candidate, invalid }];
    setPlaced(next);

    if (invalid) {
      setErrors((prev) => {
        const nextErrors = prev + 1;
        if (nextErrors >= MAX_ERRORS) setStatus("lost");
        return nextErrors;
      });
    } else if (
      next.filter((p) => !p.invalid).length === level.solution.length
    ) {
      setStatus("won");
    }
  },
  [level, placed, status],
);
```

Target:

```ts
import { useWebHaptics } from "web-haptics/react";

// inside useLevel(), alongside the other hooks at the top:
const { trigger, cancel } = useWebHaptics();

const togglePaw = useCallback(
  (candidate: Position) => {
    if (!level || status !== "playing") return;
    const existing = placed.find((p) => samePosition(p, candidate));
    if (existing) {
      if (!existing.invalid) return; // réponse correcte : ne se retire pas
      setPlaced((prev) => prev.filter((p) => !samePosition(p, candidate)));
      return;
    }

    setMarkers((prev) => prev.filter((m) => !samePosition(m, candidate)));
    const invalid = !level.solution.some((s) => samePosition(s, candidate));
    const next = [...placed, { ...candidate, invalid }];
    setPlaced(next);

    const willWin =
      !invalid &&
      next.filter((p) => !p.invalid).length === level.solution.length;
    const willLose = invalid && errors + 1 >= MAX_ERRORS;

    cancel();
    trigger(
      willWin
        ? "success"
        : willLose
          ? "error"
          : invalid
            ? "warning"
            : "selection",
    );

    if (invalid) {
      setErrors((prev) => {
        const nextErrors = prev + 1;
        if (nextErrors >= MAX_ERRORS) setStatus("lost");
        return nextErrors;
      });
    } else if (willWin) {
      setStatus("won");
    }
  },
  [level, placed, status, errors, trigger, cancel],
);
```

**Why this shape, exactly:**

- The existing `setErrors((prev) => {...})` functional-updater form is left **byte-for-byte unchanged**. Do NOT move `trigger()`/`setStatus()` calls inside that updater callback — React may invoke a functional updater more than once (notably under `StrictMode` in dev), and this app is rendered inside `<StrictMode>` (`src/main.tsx`). A side effect like a vibration call inside the updater would risk firing twice in dev. `trigger`/`cancel`/`setStatus` are called directly in the `togglePaw` event-handler body instead, which is a safe place for side effects.
- `willWin`/`willLose` are computed from the current closure (`errors`, `placed`, `level`) purely to **pick which haptic preset to fire** — they do not replace or duplicate the actual state-transition logic below them (`setErrors`'s functional updater and the `willWin` branch still independently decide the real state change, exactly as before).
- `errors` is added to the `useCallback` deps array because the function body now reads it (required by the exhaustive-deps rule). This does not change `togglePaw`'s behavior — `errors` was already correct in scope, just previously unread directly.
- `cancel()` immediately before `trigger()` — every call site, per `GLRN-070`.
- When a placement is simultaneously the losing/winning move, `success`/`error` (the strongest, most meaningful pattern) fires instead of `selection`/`warning` for that same tap — `cancel()` ensures the weaker pattern doesn't linger underneath it.

### 2. `src/App.tsx` — secondary haptic touchpoints

Current code:

```tsx
<Switch checked={help} onCheckedChange={setHelp} />
```

```tsx
<Button onClick={newLevel}>
  {status === "playing" ? "Nouvelle partie" : "Rejouer"}
</Button>
```

Target:

```tsx
import { useWebHaptics } from "web-haptics/react";

// inside App(), alongside the useLevel() destructure:
const { trigger, cancel } = useWebHaptics();
```

```tsx
<Switch
  checked={help}
  onCheckedChange={(checked) => {
    cancel();
    trigger("selection");
    setHelp(checked);
  }}
/>
```

```tsx
<Button
  onClick={() => {
    cancel();
    trigger("light");
    newLevel();
  }}
>
  {status === "playing" ? "Nouvelle partie" : "Rejouer"}
</Button>
```

- `selection` on the "Aide" toggle — it's a repeatable, low-stakes toggle (same preset family as the grid's valid-placement tap).
- `light` on "Nouvelle partie"/"Rejouer" — a deliberate one-shot action, lighter than the in-grid `selection` tap since this is a navigation/reset action, not gameplay feedback.

### 3. `src/components/Nav.tsx` — hamburger toggle

Current code:

```tsx
<button
  type="button"
  aria-expanded={open}
  aria-controls="mobile-nav"
  aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
  onClick={() => setOpen((prev) => !prev)}
  className="text-foreground md:hidden"
>
```

Target:

```tsx
import { useWebHaptics } from "web-haptics/react";

// inside Nav(), alongside `const [open, setOpen] = useState(false);`:
const { trigger, cancel } = useWebHaptics();
```

```tsx
<button
  type="button"
  aria-expanded={open}
  aria-controls="mobile-nav"
  aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
  onClick={() => {
    cancel();
    trigger("selection");
    setOpen((prev) => !prev);
  }}
  className="text-foreground md:hidden"
>
```

## Repo conventions to follow

- Import `useWebHaptics` from `"web-haptics/react"` (not the vanilla `WebHaptics` class — this is a React app throughout).
- Call `useWebHaptics()` once per component that needs it (`useLevel`, `App`, `Nav` each get their own — the library has no shared Provider requirement, per its README).

## Steps

1. `src/hooks/useLevel.ts`: add the `useWebHaptics` import and hook call, then replace the `togglePaw` function body with the target shown above.
2. `src/App.tsx`: add the `useWebHaptics` import and hook call inside `App()`, then update the `<Switch>` and `<Button>` handlers as shown.
3. `src/components/Nav.tsx`: add the `useWebHaptics` import and hook call inside `Nav()`, then update the hamburger `<button>`'s `onClick` as shown.

## Boundaries

- Do NOT add a shared/wrapper hook around `useWebHaptics()` — three direct call sites is not enough duplication to justify an abstraction (rung 2 of the ladder: reuse what exists; there is nothing to extract yet).
- Do NOT change the `setErrors` functional-updater shape in `useLevel.ts` — see the "Why this shape" note above.
- Do NOT gate haptics behind a settings toggle or feature flag — `web-haptics` already no-ops silently on desktop and iOS Safari (no Vibration API support), so no manual guard is needed (confirmed in this project's own memory, `GLRN-133`).
- Do NOT add haptics to the pawn-marker drag (`Grid.tsx`'s `onSetMarker` path) — that fires on every cell crossed during a drag stroke (100+ times per stroke); a vibration per cell would be intrusive, not feedback.
- If any of the three current-code excerpts above don't match what's in the file (accounting for the "Ordering note" if plans 002–004 already ran), STOP and report instead of improvising.

## Verification

- **Mechanical**: `pnpm build` and `pnpm lint` both pass.
- **Feel check** (requires a real Android Chrome device or emulator — the Vibration API doesn't fire on desktop or iOS Safari, which is expected, not a bug):
  - Place a correct pawn → short single tap (`selection`).
  - Place an incorrect pawn (not the final one) → short single tap (`warning`, distinct from `selection`).
  - Trigger a win → the 2-tap `success` pattern, not `selection`.
  - Trigger a loss (exhaust the error budget) → the 3-tap `error` pattern, not `warning`.
  - Rapidly tap several cells in succession → no missed vibrations (this is exactly what `cancel()` before `trigger()` prevents, per `GLRN-070`).
  - Toggle "Aide" and open/close the mobile nav → each gives a light `selection` tap.
  - On desktop/iOS Safari: confirm zero errors in the console (the library no-ops silently, it must not throw).
- **Done when**: all of the above hold, `useWebHaptics.isSupported` behavior is unaffected (no manual support-checking code was added, per Boundaries), and no console errors appear on any platform.
