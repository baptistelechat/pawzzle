---
id: ZBLK-002
type: blocker
date: 2026-07-21
tags: [shadcn, cli, init, non-interactive, troubleshooting]
---

# ZBLK-002 — `shadcn init` bloqué 3x en mode non-interactif

| Friction                                                                                                   | Cause réelle                                                                                                                                                            | Solution                                                                                                     | Statut |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------ |
| `pnpm dlx shadcn@latest init --yes` a échoué/bloqué 3 fois de suite en tentant de tourner sans interaction | `-b neutral` invalide (le flag `-b` sélectionne la librairie de composants, pas la couleur de base) ; `--yes` ne couvre pas les prompts "component library" et "preset" | Lancer directement `init --yes -b base -p nova` — voir GLRN-209 en mémoire globale pour le pattern générique | résolu |

## Références

- [BDR-003](../../decisions/BDR-003.md) — décision de style shadcn issue de ce même init
