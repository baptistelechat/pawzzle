---
id: ZBLK-014
type: blocker
date: 2026-07-23
tags: [ux, long-press, drag, gesture, pointer-events, slide-threshold]
---

# ZBLK-014 — Cercle de chargement encore visible pendant un glisser malgré le délai d'apparition

| Friction                                                                                                                                                                                                                                          | Cause réelle                                                                                                                                                                                                                                                                                                 | Solution                                                                                                                                                                                                                                                                   | Statut |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Après ajout d'un délai de 120ms avant l'apparition du cercle de progression (pour éviter qu'il flashe sur un simple tap), Baptiste a signalé qu'il restait encore visible pendant un glisser — 2 itérations nécessaires pour identifier pourquoi. | L'annulation de l'appui long ne se déclenchait qu'au **changement de case** et uniquement en mode `help` — un glisser lent pouvait dépasser les 120ms de délai tout en restant dans la case de départ (finger/curseur pas encore sorti de la case), et le mécanisme n'existait pas du tout hors mode `help`. | Ajout d'un seuil de distance en pixels (`SLIDE_THRESHOLD_PX = 10`) sur le déplacement réel du pointeur depuis `pointerdown`, indépendant de `help` et du changement de case — annule immédiatement l'appui long (et cache le cercle) dès qu'un vrai mouvement est détecté. | résolu |

## Références

- [BDR-019](../../decisions/BDR-019.md) — décision du cercle de progression
- [LRN-015](../../learnings/LRN-015.md) — pattern généralisé (seuil de distance > franchissement de case)
