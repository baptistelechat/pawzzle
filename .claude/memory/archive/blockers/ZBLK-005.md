---
id: ZBLK-005
type: blocker
date: 2026-07-21
tags: [csp, validation, dead-end, diagnostic, queens]
---

# ZBLK-005 — Partie perdue malgré une solution logique existante, diagnostic requis

| Friction                                                                                                                                                                                                                           | Cause réelle                                                                                                                                                                                                                                                                                                                                                                                                      | Solution                                                                                                                                                                                                                                                                               | Statut |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Baptiste a perdu une partie (budget d'erreur épuisé) en tentant de placer un animal dans une région, et pensait la configuration insoluble. Une résolution par force brute a confirmé qu'une solution unique existait bel et bien. | `useLevel.ts` gelait chaque pion comme valide/invalide au moment de sa pose, sans jamais recalculer les violations rétroactivement. Un pion posé plus tôt (région "rose") était localement valide (aucun conflit à cet instant) mais n'appartenait pas à la solution unique — resté verrouillé (non retirable), il consommait la seule ligne restante pour une autre région, la rendant irrémédiablement bloquée. | Diagnostic confirmé par lecture du code (`rules.ts`, `useLevel.ts`) : la validation ne compare jamais au `level.solution` pré-calculé, seulement aux règles de conflit entre pions posés. A motivé le remplacement du mécanisme de validation ([BDR-008](../../decisions/BDR-008.md)). | résolu |

## Références

- [BDR-008](../../decisions/BDR-008.md) — nouveau mécanisme de validation
- [LRN-003](../../learnings/LRN-003.md) — pattern généralisé
- [BDR-007](../../decisions/BDR-007.md) — mécanisme initial à l'origine du blocage
