---
id: ZBLK-036
type: blocker
date: 2026-07-25
tags: [agent-browser, headless-testing, drag, swipe, cdp, manual-verification]
---

# ZBLK-036 — Simulation drag/swipe/wheel headless échouée après plusieurs tentatives

| Friction                                                                                                                                                                                                                                                                                      | Cause réelle                                                                                                                                                                                                       | Solution                                                                                                                                                                                                            | Statut |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Vérifier automatiquement le swipe tactile puis le drag souris du carrousel de règles via `agent-browser` (mouse wheel, mouse down/move/up, puis dispatch `MouseEvent` natif en `eval`) — aucune des 3 approches n'a déclenché de façon fiable le comportement attendu, sans erreur explicite. | Les événements synthétiques CDP (et même le dispatch DOM direct) ne reproduisent pas fidèlement un geste de scroll/drag réel dans ce sandbox — limite de l'outillage headless, pas un bug de l'application testée. | Abandon de la vérification automatisée pour ce type de geste précis ; bascule sur relecture de code (pattern standard mousedown/mousemove/mouseup, lint/build verts) + demande de confirmation manuelle à Baptiste. | résolu |

## Références

- [LRN-031](../../learnings/LRN-031.md) — simuler un swipe/drag/wheel via CDP headless est peu fiable
- [BDR-045](../../decisions/BDR-045.md) — agent-browser fonctionne sauf simulation de gestes
