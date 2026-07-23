---
id: ZBLK-015
type: blocker
date: 2026-07-23
tags:
  [
    ui,
    motion,
    layout-animation,
    popover,
    base-ui,
    ambient-player,
    simplification,
    pawzzle,
  ]
---

# ZBLK-015 — Itérations UI ambient player (largeur pilule, mute via slider) sans résultat satisfaisant

| Friction                                                                                                                                                                                                                                                                                                                                                                                                                                   | Cause réelle                                                                                                                                                                                                                                                                                                                                   | Solution                                                                                                                                                                                                                                                                      | Statut |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Plusieurs tentatives successives pour améliorer le mini-player `AmbientPlayer` (Pawzzle) : animer la largeur de la pilule au changement de piste (`layout`, `layout="position"`, `mode="popLayout"` vs `"wait"`) et ajouter un popover volume au survol du bouton mute — aucune n'a produit d'amélioration perceptible côté utilisateur ("aucun changement" signalé), plus un bug où déplacer le slider de volume réactivait le son coupé. | Complexité d'animation de layout imbriquée sous-estimée (Motion `layout`/`popLayout` avec plusieurs enfants non-`layout` autour, timing de fade/délai difficile à caler) — cf. [LRN-016](../../learnings/LRN-016.md). Le popover Base UI combinant ouverture au survol et clic-pour-mute sur le même élément créait des interactions ambiguës. | Abandon de l'animation de largeur dynamique (largeur fixée sur celle de la grille de jeu) et retrait complet du popover volume — mute simple au clic conservé, réglage fin du volume reporté à un futur menu "Son / Vibration" dédié ([BDR-021](../../decisions/BDR-021.md)). | résolu |

## Références

- [BDR-021](../../decisions/BDR-021.md) — décision finale (largeur fixe, popover retiré)
- [LRN-016](../../learnings/LRN-016.md) — piège Motion `layout="position"` identifié pendant ces itérations
