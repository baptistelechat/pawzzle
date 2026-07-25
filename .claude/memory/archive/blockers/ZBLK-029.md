---
id: ZBLK-029
type: blocker
date: 2026-07-25
tags: [scope-creep, testing, miscommunication, workflow, pawzzle]
---

# ZBLK-029 — Harnais de test non demandé : 12 min sur 20

| Friction                                                                                                                                                                                                                                                                                                                                                            | Cause réelle                                                                                                                                                                                                                                                   | Solution                                                                                                                                                                                                                                                                        | Statut |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| « comment tester que tu n'as rien cassé ? » traité comme une demande de tests automatisés : installation de `jsdom` + `@testing-library/react` et écriture de 12 tests, ~12 min sur 20. Trois relances de Baptiste ont été nécessaires (« pourquoi 20 min pour ça ? », « je ne t'ai jamais demandé de faire des tests unitaires ! », « c'est une perte de temps »). | Question lue au sens élargi (« comment vérifier ») au lieu du sens visé (« quelles actions dois-je faire, moi »). Aucune question posée avant d'ajouter 2 devDeps et une infra de test, alors que la vérif manuelle du bug principal prend 10 s à deux doigts. | Réponse reformulée en tableau action → résultat attendu, avec mention explicite de ce qui n'est pas vérifiable à la main. Règle enregistrée en mémoire auto de projet et en GLRN-236. Tests finalement conservés sur décision de Baptiste ([BDR-037](../../decisions/BDR-037.md)). | résolu |

## Références

- [BDR-037](../../decisions/BDR-037.md) — arbitrage final sur le sort de l'infra produite
- voir aussi GLRN-236 (global) — pattern généralisé de lecture de la demande
