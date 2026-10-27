---
id: ZBLK-030
type: blocker
date: 2026-07-25
summary: "Pill du lecteur radio invisible en prod mobile"
tags: [layout, mobile, viewport, ambient-player, footer, sticky, pawzzle]
status: résolu
---

# ZBLK-030 — Pill du lecteur radio invisible en prod mobile

**Friction** : La pill du lecteur ambiant ne s'affichait plus sur l'app en production sur mobile — mais réapparaissait après une rotation paysage puis retour portrait.

**Cause réelle** : Pas un problème d'état : rien dans l'app ne re-render sur un changement d'orientation, donc la pill était déjà montée avec son titre ([LRN-025](../../learnings/LRN-025.md)). Le bloc de jeu dépasse de quelques pixels la hauteur visible quand la barre d'URL mobile est déployée, faisant passer le `<footer>` sous la ligne de flottaison. La rotation replie la barre, ce qui rend ~60 px et suffit à le faire réapparaître.

**Solution** : `sticky bottom-0 z-10` sur le `<footer>` ([BDR-038](../../decisions/BDR-038.md)) : le lecteur reste épinglé au bas du viewport quelle que soit la hauteur du contenu. `pnpm lint` / `pnpm build` verts, comportement confirmé fonctionnel par Baptiste.

## Références

- [BDR-038](../../decisions/BDR-038.md) — décision d'épingler plutôt que de contraindre le contenu
- [LRN-025](../../learnings/LRN-025.md) — heuristique de diagnostic tirée du cas
