---
id: ZBLK-018
type: blocker
date: 2026-07-24
tags:
  [framer-motion, debugging, heart-shake, animate-prop, agent-browser, pawzzle]
---

# ZBLK-018 — Tremblement du dernier cœur invisible malgré un code apparemment correct

| Friction                                                                                                                                                                                                                               | Cause réelle                                                                                                                                                                                                                                                                                                                                                      | Solution                                                                                                                   | Statut |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ |
| Le tremblement continu demandé sur le dernier cœur restant (`HeartsRow`) ne s'affichait jamais, malgré une logique apparemment correcte (`isLastHeart` calculé juste, confirmé via un attribut `data-debug-*` temporaire dans le DOM). | `animate={undefined}` sur l'état « pas le dernier cœur » empêchait framer-motion de détecter le changement vers l'objet de keyframes une fois `isLastHeart` devenu vrai sur un rendu ultérieur — confirmé par échantillonnage direct de `getComputedStyle(el).transform` via `agent-browser eval`, resté figé à `"none"` en boucle. Voir aussi GLRN-228 (global). | Toujours passer un objet `animate` défini (`{ scale: 1 }` au repos, keyframes sinon) au lieu d'`undefined` sur cette prop. | résolu |
