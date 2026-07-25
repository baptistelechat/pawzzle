---
id: ZBLK-008
type: blocker
date: 2026-07-21
tags:
  [
    framer-motion,
    animatepresence,
    debugging,
    misdiagnosis,
    worker,
    race-condition,
  ]
---

# ZBLK-008 — "Nouvelle partie" bloqué indéfiniment : diagnostic initial erroné avant la vraie cause

| Friction                                                                                                                                                                                                                                                                                           | Cause réelle                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Solution                                                                                                                                                                                                                                                                                                                                                                                                                 | Statut |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Cliquer "Nouvelle partie" bloquait le spinner indéfiniment. Signalé par Baptiste comme "spécifique mobile" ; premier fix (try/catch + retry dans le Worker sur l'hypothèse "le générateur échoue parfois") appliqué et déclaré résolu — Baptiste a rapporté "aucun changement" après re-test réel. | Le bug était en fait reproductible à 100% en Chrome headless dès le premier essai (donc pas mobile-spécifique) : `AnimatePresence mode="wait"` dans `App.tsx` recevait un 3ᵉ changement d'enfants (le worker répond en quelques ms, plus vite que la transition 150-300ms) avant d'avoir fini de résoudre le 2ᵉ — son état interne ne récupérait jamais. `setLevel`/`setStatus("playing")` s'exécutaient bien (confirmé par logs), mais le DOM ne remontait jamais le contenu. | Instrumentation temporaire (`console.log` dans `useLevel.ts`) pour confirmer que la couche données fonctionnait, puis vérification directe du DOM (`document.querySelectorAll`) montrant le contenu absent malgré un state correct — a pointé vers la couche animation plutôt que la couche worker. Fix : `mode="wait"` → `mode="popLayout"` dans `App.tsx`. Testé 9 relances rapides consécutives sans échec après fix. | résolu |

## Références

- [LRN-009](../../learnings/LRN-009.md) — le pattern générique extrait de ce blocage
- [LRN-008](../../learnings/LRN-008.md) — le fix worker appliqué en premier (bonne pratique, mais pas la vraie cause)
- [003-grid-entrance-transition](../../../../docs/plans/003-grid-entrance-transition.md) — plan où le `mode="wait"` avait été introduit puis corrigé

> ⚠️ Ce fix (`mode="popLayout"`) a évité le blocage total, mais n'a pas réglé le fond : la même classe de bug a resurgi (animation invisible, sans blocage cette fois) — voir [ZBLK-009](ZBLK-009.md) et [LRN-011](../../learnings/LRN-011.md).
