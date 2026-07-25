# Animation & haptics plans — Phase 4

Source: `find-animation-opportunities` sweep (2026-07-21), 4 findings selected by the user + haptic feedback explored on request. All plans stamped at commit `20223ee`.

| #                                        | Title                                             | Severity    | Depends on                    | Status |
| ---------------------------------------- | ------------------------------------------------- | ----------- | ----------------------------- | ------ |
| [001](001-motion-lazy-setup.md)          | Install `motion`, centralize easing/spring tokens | N/A (infra) | —                             | DONE   |
| [002](002-status-win-loss-transition.md) | Crossfade status text, delight pop on win         | HIGH        | 001                           | DONE   |
| [003](003-grid-entrance-transition.md)   | Fade in level content over the loading spinner    | MEDIUM      | 001, 002                      | DONE   |
| [004](004-nav-mobile-menu.md)            | Grow mobile nav menu from its trigger             | MEDIUM      | 001                           | DONE   |
| [005](005-pawn-placement-pop.md)         | Subtle pop on pawn placement                      | LOW         | 001                           | DONE   |
| [006](006-haptic-feedback.md)            | Haptic feedback — game loop + secondary UI        | HIGH        | none (independent of 001–005) | DONE   |

## Recommended execution order

1. **001** first — every other motion plan imports `src/lib/motion.ts` and needs `motion` installed.
2. **002 before 003** — both edit the same JSX region of `src/App.tsx`; 003's "current code" excerpt assumes 002 has already landed.
3. **004** and **005** — independent of everything else and of each other; can run in any order, or in parallel with 002/003 in separate passes since they touch different files (`Nav.tsx`, `Grid.tsx`).
4. **006** — fully independent of the `motion` work (uses `web-haptics`, already installed). Its `src/App.tsx`/`Nav.tsx` excerpts are written against the pre-002/003/004 code; if those already ran, locate the same handlers (`onCheckedChange={setHelp}`, `onClick={newLevel}`, `onClick={() => setOpen((prev) => !prev)}`) instead of trusting line numbers. Recommended last, purely to minimize merge friction with 002–004's edits to the same files.

Net order: **001 → 002 → 003 → 004 → 005 → 006**.

## Notes

- No `--ease-*` CSS custom properties were added — all four motion plans consume JS constants from `src/lib/motion.ts` (`EASE_OUT`, `EASE_DRAWER`, `SPRING_BOUNCE`), since nothing in this batch animates via plain CSS transitions.
- `LazyMotion` uses `domAnimation`, not `domMax` — none of these plans use the `layout` prop. If a future plan needs `layout`, swap to `domMax` first (see `GLRN-175` in the project's own memory).
- The high-frequency interactions rejected in the original `find-animation-opportunities` audit (marker drag, marker toggle, error counter text) are **not** touched by any plan here, and 005/006 explicitly call out staying out of that scope.
