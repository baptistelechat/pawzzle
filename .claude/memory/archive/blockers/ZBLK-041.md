---
id: ZBLK-041
type: blocker
date: 2026-07-26
tags: [framer-motion, animatepresence, animation, ux, pawzzle]
---

# ZBLK-041 — Animation de grille jouée deux fois après l'ajout du skeleton

| Friction                                                                                                                                                                                                               | Cause réelle                                                                                                                                                                                                                                                                                                                                                                               | Solution                                                                                                                                                                                                                                                                                                            | Statut |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Baptiste a signalé que l'animation en cascade (pop + échelle par case) semblait jouer deux fois lors d'une régénération : une fois en disparaissant vers le skeleton, une fois en apparaissant sur la nouvelle grille. | Chaque case (`m.button`) avait son propre `exit` avec le même stagger que son `initial`/`animate`. Framer Motion propage le contexte `AnimatePresence` à tous les composants motion descendants même à travers un composant React intermédiaire non-motion (`Grid`) — donc l'exit de l'ancienne grille rejouait la même cascade, en sens inverse, juste avant que la nouvelle ne l'entame. | Retiré l'`exit` par case ; ajouté un `m.div` englobant avec seulement `exit={{opacity:0}}` (fondu simple, sans stagger) pour la sortie de toute la grille en bloc. `GridSkeleton` reçoit le même traitement (fondu simple en entrée/sortie). La cascade par case ne joue plus qu'à l'apparition de la vraie grille. | résolu |

## Références

- [BDR-055](../../decisions/BDR-055.md) — la décision corrigée par ce fix
- voir aussi GLRN-250 (mémoire globale) — le mécanisme Framer Motion en cause
