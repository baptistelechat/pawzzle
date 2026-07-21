---
id: ZBLK-004
type: blocker
date: 2026-07-21
tags: [dblclick, double-tap, ux, iteration]
---

# ZBLK-004 — Geste double-tap fiable : 3 itérations nécessaires

| Friction                                                                                                                                              | Cause réelle                                                                                                                                                                                                                                                                                                                                                                                                                                 | Solution                                                                                                                    | Statut |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------ |
| Le geste double-tap pour poser un animal a été signalé cassé par Baptiste à 2 reprises, alors que les tests via agent-browser passaient à chaque fois | (1) `onDoubleClick` natif ne se déclenche pas toujours de façon fiable en usage réel — remplacé par une détection manuelle par chronométrage (`performance.now()`, fenêtre 300ms) ; (2) cette détection manuelle appliquait le marqueur d'aide immédiatement au 1er tap, créant un flash visible avant que le 2e tap ne pose l'animal — corrigé en retardant l'application du marqueur de 300ms, annulée si un 2e tap arrive dans la fenêtre | Détection manuelle par timing + marqueur différé/annulable au lieu d'appliqué immédiatement, voir GLRN-212 (entrée globale) | résolu |

## Références

- [BDR-006](../../decisions/BDR-006.md) — modèle d'interaction ayant motivé ce geste
- Voir aussi GLRN-212 (entrée globale — détection manuelle du double-clic)
