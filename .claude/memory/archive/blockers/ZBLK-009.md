---
id: ZBLK-009
type: blocker
date: 2026-07-21
tags:
  [
    framer-motion,
    animatepresence,
    key-prop,
    remount,
    initial-false,
    agent-browser,
    debugging,
  ]
---

# ZBLK-009 — Animation sortie/entrée grille invisible malgré `mode="wait"`, puis perte de l'entrée au 1er chargement

| Friction                                                                                                                                                                                                                                                                             | Cause réelle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Solution                                                                                                                                                                                                                                                                                                                                                                                                                                  | Statut |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| L'animation de sortie de la grille lors de "Nouvelle partie"/"Rejouer" restait invisible malgré le passage de `mode="popLayout"` (fix de [ZBLK-008](ZBLK-008.md)) à `mode="wait"` — puis, une fois corrigée, l'animation d'entrée disparaissait au tout premier chargement de l'app. | Deux causes distinctes découvertes en chaîne. **(1)** Le panneau `<m.div key="level">` gardait une clé statique — quand le Worker répond plus vite qu'un cycle de rendu peint, React ne montre jamais visiblement l'état `"loading"` intermédiaire : confirmé par `MutationObserver` (0 mutation DOM sur la grille) et échantillonnage d'opacité en `requestAnimationFrame` via agent-browser, **pas** par lecture de code — la grille ne remontait donc jamais, seules ses props changeaient ([LRN-011](../../learnings/LRN-011.md)). **(2)** Une fois fixé via un `levelId` dédié dans sa propre `AnimatePresence`, `initial={false}` (recopié de l'`AnimatePresence` parente) supprimait l'animation du tout premier rendu de cette instance — qui coïncidait avec le premier chargement réel de l'app ([LRN-012](../../learnings/LRN-012.md)). | `Grid` clé par `levelId` (voir [BDR-015](../../decisions/BDR-015.md)) dans une `AnimatePresence mode="wait"` dédiée, sans `initial={false}`. Vérifié par instrumentation réelle (agent-browser : `MutationObserver` + échantillonnage d'opacité rAF sur clic, puis `--init-script` + reload pour capturer le chargement à froid) — trace confirmant sortie 1→0 puis entrée 0→1 dans les deux cas ([LRN-014](../../learnings/LRN-014.md)). | résolu |

## Références

- [BDR-015](../../decisions/BDR-015.md) — décision de fix
- [LRN-011](../../learnings/LRN-011.md) — pattern clé statique jamais remontée
- [LRN-012](../../learnings/LRN-012.md) — pattern `initial={false}` scope par instance
- [LRN-014](../../learnings/LRN-014.md) — méthodologie de diagnostic employée
- [ZBLK-008](ZBLK-008.md) — occurrence précédente de la même classe de bug (blocage total, cette fois sans blocage mais animation absente)
