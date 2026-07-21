---
id: ZBLK-006
type: blocker
date: 2026-07-21
tags: [react, state, completion-check, regression, useLevel]
---

# ZBLK-006 — Régression : faux "Niveau réussi", pion invalide non retiré compté

| Friction                                                                                                                                                                                                                                        | Cause réelle                                                                                                                                                                                                                           | Solution                                                                                                                                                 | Statut |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Immédiatement après le déploiement de [BDR-008](../../decisions/BDR-008.md), un niveau a été déclaré "réussi" alors qu'une colonne entière n'avait aucun animal correct — un pion invalide (rouge) était resté sur le plateau sans être retiré. | La condition de victoire testait `next.length === level.solution.length` sur le tableau brut des pions posés, qui incluait le pion invalide non retiré. 5 pions corrects + 1 pion invalide = 6 = taille de la solution → faux positif. | Filtrer sur le flag de validité avant de comparer la longueur : `next.filter((p) => !p.invalid).length === level.solution.length` (`useLevel.ts:68-70`). | résolu |

## Références

- [BDR-008](../../decisions/BDR-008.md) — décision ayant introduit la régression
- voir aussi GLRN-216 (pattern généralisé, mémoire globale)
