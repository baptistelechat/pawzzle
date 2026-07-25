---
id: ZBLK-035
type: blocker
date: 2026-07-25
tags: [layout, height-100, root, css, react, pawzzle]
---

# ZBLK-035 — Chaîne `height:100%` cassée à `#root` : l'app n'occupait plus l'écran

| Friction                                                                                                                                                                                                                                   | Cause réelle                                                                                                                                                                                                                                                                                                                                                                      | Solution                                                                                                                                                     | Statut |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Juste après avoir verrouillé `html`/`body` en `height:100%` + `overflow:hidden` ([BDR-041](../../decisions/BDR-041.md)), Baptiste a signalé un grand espace vide sous le lecteur ambiant — l'app n'occupait plus tout l'espace disponible. | La règle `height:100%` avait été posée sur `html` et `body`, mais pas sur `<div id="root">` (le point de montage React). Une hauteur en pourcentage dont le parent a une hauteur indéfinie retombe en `auto` : le `h-full` posé sur la racine d'`App.tsx` n'avait donc rien de fiable à quoi se raccrocher, et le contenu gardait sa taille naturelle au lieu de remplir l'écran. | Ajouter `#root` à la règle (`html, body, #root { height: 100%; }`) pour que la chaîne de pourcentages soit ininterrompue jusqu'au composant racine de l'app. | résolu |

## Références

- [BDR-041](../../decisions/BDR-041.md) — la décision qui inclut ce correctif
