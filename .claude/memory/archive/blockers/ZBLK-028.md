---
id: ZBLK-028
type: blocker
date: 2026-07-25
tags:
  [pnpm, trust-policy, supply-chain, workbox, babel, false-positive, pawzzle]
---

# ZBLK-028 — `pnpm add` bloqué 2× par `trustPolicy: no-downgrade`

| Friction                                                                                                                                                                     | Cause réelle                                                                                                                                                                                                                                                                                                                                                                                                                     | Solution                                                                                                                                                                                                                                                                                                                                                                               | Statut |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `pnpm add -D jsdom @testing-library/react` échoue 2 fois d'affilée sur `ERR_PNPM_TRUST_DOWNGRADE` (« possible package takeover »), sur des paquets que personne n'a choisis. | `trustPolicy: no-downgrade`, ajouté à la session précédente, refuse une version dont la preuve de publication est plus faible qu'une version antérieure. Les 2 fautifs — `@trickfilm400/rollup-plugin-off-main-thread@3.0.0-pre1` puis `semver@6.3.1` — sont transitifs de workbox-build → `@babel/preset-env` et antérieurs aux provenance attestations. Tous deux **déjà dans le lockfile et déjà embarqués dans les builds**. | Install faite avec la politique temporairement commentée, puis `pnpm install --frozen-lockfile` revérifié vert **avec** la politique réactivée → la CI/Vercel n'est pas concernée. Échappatoire pérenne retenue : `pnpm add <pkg> --trust-policy=none` (flag vérifié réellement supporté, pnpm rejetant les options inconnues). Exclusion permanente via `trustPolicyExclude` écartée. | résolu |

## Références

- voir aussi GBDR-007 et GLRN-234 (globaux) — décision de conserver la politique, et comportement mesuré du garde-fou
