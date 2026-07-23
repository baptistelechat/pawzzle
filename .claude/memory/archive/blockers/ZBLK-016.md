---
id: ZBLK-016
type: blocker
date: 2026-07-23
tags:
  [
    web-audio,
    ambient,
    fade,
    requestanimationframe,
    play-promise,
    debugging,
    agent-browser,
  ]
---

# ZBLK-016 — Piste suivante silencieuse après transition naturelle (fade-in jamais audible)

| Friction                                                                                                                                                                 | Cause réelle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Solution                                                                                                                                                                                  | Statut |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Après la fin naturelle d'une piste d'ambiance, la piste suivante démarre bien (le temps affiché avance) mais reste totalement silencieuse — le volume ne remonte jamais. | `fadeVolumeTo()` était appelé juste après `ambient.play()` dans `loadAmbientTrack`, sans attendre sa résolution : la boucle `requestAnimationFrame` du fondu est bien planifiée mais son callback ne se déclenche jamais tant que la lecture n'a pas réellement démarré. Un `setTimeout(fn, 0)` pour découpler du call stack synchrone de l'événement `ended` a été testé et n'a pas suffi. Diagnostiqué en direct via `agent-browser` (exposition temporaire de l'`<audio>` sur `window`, `eval --stdin` en boucle pour sonder volume/currentTime, `console.log` temporaires dans `fadeVolumeTo`/`loadAmbientTrack`/l'event `ended`) plutôt que deviné depuis le code. | Attendre la résolution de la promesse `.play()` avant de lancer le fondu : `ambient.play().then(() => fadeVolumeTo(...))` au lieu d'un appel synchrone juste après `void ambient.play()`. | résolu |

## Références

- [LRN-018](../../learnings/LRN-018.md) — pattern généralisé (tout `<audio>`/`<video>` avec fondu `requestAnimationFrame`)
- [BDR-017](../../decisions/BDR-017.md) — architecture son ambiance `<audio>` natif
