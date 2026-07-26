---
id: ZBLK-039
type: blocker
date: 2026-07-26
tags: [pnpm, trust-policy, supply-chain, workbox, pawzzle]
---

# ZBLK-039 — pnpm trustPolicy a bloqué la désinstallation de deps de test

| Friction                                                                                                                                                                                                                           | Cause réelle                                                                                                                                                                                                                                                                                                                                                                                                                 | Solution                                                                                                                                                                                                                                    | Statut |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `pnpm remove vitest @testing-library/react jsdom` puis `pnpm install` échouaient avec `ERR_PNPM_TRUST_DOWNGRADE`, sur un package (`@trickfilm400/rollup-plugin-off-main-thread`) totalement sans rapport avec les paquets retirés. | Toute ré-résolution du lockfile (pas seulement `pnpm add`) retraverse le sous-arbre `workbox-build` → `@babel/preset-env`, connu pour ses faux positifs de trust policy (déjà documenté dans `pnpm-workspace.yaml` et GBDR-007). Un premier `--trust-policy-exclude` a débloqué le premier paquet mais révélé un second bloqué juste derrière (`semver@6.3.1`), exactement le whack-a-mole anticipé par la doc du workspace. | Édition manuelle de `package.json` (retrait des 3 devDeps) puis `pnpm install --trust-policy-exclude "@trickfilm400/rollup-plugin-off-main-thread" --trust-policy-exclude "semver@6.3.1"` (deux exclusions chaînées en une seule commande). | résolu |

## Références

- voir aussi GBDR-007 (mémoire globale) — l'échappatoire déjà documentée pour ce faux positif
