---
id: ZBLK-007
type: blocker
date: 2026-07-21
tags: [pwa, vite-pwa-assets-generator, apple-touch-icon, padding, resizeOptions]
---

# ZBLK-007 — Icône Apple Touch avec fond blanc parasite

| Friction                                                                                                                                                                                                                         | Cause réelle                                                                                                                                                                                                                                                                                                                                                                                                               | Solution                                                                                                                                                                                           | Statut |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `apple-touch-icon-180x180.png` généré avec un padding blanc visible autour de l'icône (fond crème parasite) au lieu du fond corail attendu, alors que le `maskable-icon-512x512.png` avait déjà été corrigé de ce même problème. | `@vite-pwa/assets-generator` applique par défaut un padding 30% + fond blanc forcé au preset `apple`, pas seulement à `maskable` — la config initiale de `pwa-assets.config.ts` ne couvrait que `maskable.resizeOptions.background`. Confirmé en lisant `node_modules/@vite-pwa/assets-generator/dist/chunks/instructions-resolver.mjs` (`background: size.resizeOptions?.background ?? (size.dark ? "black" : "white")`). | Ajout de `apple: { sizes: [180], resizeOptions: { background: "#ff8a65" } }` dans `pwa-assets.config.ts`, régénération via `pnpm generate-pwa-assets`, vérifié visuellement (fond corail correct). | résolu |

## Références

- [BDR-009](../../decisions/BDR-009.md) — identité visuelle dont ce logo fait partie
- Pattern déjà documenté en mémoire globale sous GLRN-206 (padding differs par preset, couvre déjà `apple`) — aucune nouvelle entrée globale créée, cette session reste full local sur demande de Baptiste.
