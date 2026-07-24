---
id: ZBLK-022
type: blocker
date: 2026-07-24
tags:
  [
    pawcounter,
    framer-motion,
    animatepresence,
    initial-false,
    inheritance,
    pawzzle,
  ]
---

# ZBLK-022 — Animation d'entrée du PawCounter absente au relancement malgré une structure AnimatePresence correcte

| Friction                                                                                                                                                                                                                                                                                                                               | Cause réelle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Solution                                                                                                                                               | Statut |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Une fois le doublon DOM corrigé ([ZBLK-021](ZBLK-021.md)), `PawCounter` remontait proprement sur "Nouvelle partie" mais sans jouer son animation d'entrée (scale+fade) — ni sur l'icône, ni sur le chiffre, ni sur `/6`, alors que la structure `AnimatePresence` semblait identique à celle de `HeartsRow`, qui animait correctement. | Aucune de ces `AnimatePresence` imbriquées (icône, chiffre) ne fixait explicitement sa propre valeur de `initial` — l'ANCÊTRE (`AnimatePresence initial={false}` du panneau de statut dans `App.tsx`) propage ce `false` via contexte à tout `motion`/`AnimatePresence` imbriqué qui ne définit pas explicitement le sien, même sans jamais l'avoir écrit localement (généralisé en GLRN-231 global). Vérifié par échantillonnage `requestAnimationFrame` de `opacity`/`transform` en direct dans le navigateur (agent-browser). | `initial` (true) explicite sur chaque `AnimatePresence` imbriquée du composant (icône, chiffre, `/6`), rompant l'héritage silencieux depuis l'ancêtre. | résolu |

## Références

- voir aussi GLRN-231 (global) — pattern générique extrait (héritage `initial`)
- [LRN-012](../../learnings/LRN-012.md) — pattern proche mais distinct (copie explicite par réflexe, pas héritage silencieux)
- [BDR-024](../../decisions/BDR-024.md) — décision issue de ce blocage
