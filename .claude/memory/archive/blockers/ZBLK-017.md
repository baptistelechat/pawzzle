---
id: ZBLK-017
type: blocker
date: 2026-07-24
tags: [ux, long-press, drag, gesture, slide-threshold, regression, pawzzle]
---

# ZBLK-017 — Cercle de progression encore visible pendant un glisser, malgré le fix seuil de ZBLK-014

| Friction                                                                                                                                                                                                                       | Cause réelle                                                                                                                                                                                                                                                                                                          | Solution                                                                                                                                                                                                                    | Statut |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Baptiste a signalé que le cercle de progression de l'appui long restait visible pendant un glisser réel sur la grille — alors que [ZBLK-014](ZBLK-014.md) avait déjà « résolu » ce problème avec un seuil de distance de 10px. | Le seuil de 10px de [ZBLK-014](ZBLK-014.md) servait à la fois à annuler l'appui long ET à cacher le cercle — suffisant pour empêcher la pose accidentelle d'un animal, mais trop tolérant pour empêcher le flash visuel du cercle : un glisser lent pouvait rester sous 10px pendant les 120ms du délai d'apparition. | Ajout d'un second seuil dédié, plus petit (`RING_CANCEL_THRESHOLD_PX = 4`), qui cache uniquement le cercle sans toucher au seuil de 10px qui annule réellement l'appui long — les deux mécanismes sont désormais découplés. | résolu |

## Références

- [ZBLK-014](ZBLK-014.md) — fix initial insuffisant, même symptôme
- [BDR-019](../../decisions/BDR-019.md) — décision du cercle de progression
