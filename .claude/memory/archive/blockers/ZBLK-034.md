---
id: ZBLK-034
type: blocker
date: 2026-07-25
tags: [layout, overflow-hidden, scroll, dvh, pwa, css, pawzzle]
---

# ZBLK-034 — `overflow-hidden` sur un div descendant n'empêchait pas le scroll du document

| Friction                                                                                                                                                                                                                                                                              | Cause réelle                                                                                                                                                                                                                                                                                                                                                                                           | Solution                                                                                                                                                                 | Statut |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| [BDR-040](../../decisions/BDR-040.md) annonçait une garantie structurelle « zéro scroll » via `h-dvh overflow-hidden` sur la racine d'`App.tsx`. Baptiste a testé sur device : la pill du lecteur n'était visible qu'en scrollant vers le bas, en navigateur classique **et** en PWA. | `overflow-hidden` ne clippe que le contenu qui déborde de SA PROPRE boîte. Si cette boîte elle-même (`h-dvh`) calcule une hauteur supérieure à l'espace réellement visible (constaté en PWA standalone sur cet appareil), `<body>` — non contraint — devient simplement aussi grand que ce div surdimensionné, et le document scrolle pour l'atteindre. La garantie ne portait pas sur le bon élément. | Verrouiller `html`/`body` eux-mêmes (`height:100%` + `overflow:hidden`), indépendamment de toute valeur `dvh` calculée plus bas ([BDR-041](../../decisions/BDR-041.md)). | résolu |

## Références

- [BDR-041](../../decisions/BDR-041.md) — le verrou qui ferme réellement ce blocker
- [BDR-040](../../decisions/BDR-040.md) — la décision dont la garantie s'est révélée fausse
