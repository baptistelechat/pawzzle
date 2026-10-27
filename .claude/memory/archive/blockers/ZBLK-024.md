---
id: ZBLK-024
type: blocker
date: 2026-07-25
summary: "`willLose`/`placed` lus depuis closures figées en multi-touch (2 fixes en 2 passes)"
tags: [react, stale-closure, race-condition, multi-touch, long-press, useLevel, pawzzle]
status: résolu
---

# ZBLK-024 — `willLose`/`placed` lus depuis closures figées en multi-touch (2 fixes en 2 passes)

**Friction** : Une revue de code (`/code-review` en workflow) a confirmé un bug où deux placements invalides rapprochés pouvaient faire manquer la défaite — premier fix jugé suffisant. Baptiste a ensuite reproduit le bug persistant en test réel (deux doigts sur la même case → 2 erreurs comptées pour une seule pose).

**Cause réelle** : Refs singleton de suivi de l'appui long (`pressStart`, `longPressTimeout`) dans `useGridGestures.ts` : un second doigt sur une case écrase les refs du premier sans annuler son timer déjà lancé — les deux timers appellent `onTogglePaw` à quelques ms d'écart, avant que React n'ait re-rendu entre les deux. Le premier fix (`errorsRef`) couvrait `willLose`, mais la garde anti-doublon de `togglePaw` (`placed.find(...)`) lisait toujours `placed` par closure figée, laissant passer les deux appels.

**Solution** : `placedRef` ajouté en miroir synchrone de `placed`, même traitement que `errorsRef` (voir [BDR-034](../../decisions/BDR-034.md)) — vérifié par Baptiste en re-test multi-touch réel.

## Références

- [BDR-034](../../decisions/BDR-034.md) — décision de fix
- [LRN-024](../../learnings/LRN-024.md) — pattern généralisé
- [BDR-035](../../decisions/BDR-035.md) — cause racine identifiée à la session suivante (`clearLongPress()` au point d'étranglement) : les miroirs par ref traitaient les symptômes
