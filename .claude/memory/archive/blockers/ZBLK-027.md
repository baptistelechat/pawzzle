---
id: ZBLK-027
type: blocker
date: 2026-07-25
tags: [eslint, rtk, npm-global, windows, tooling, misdiagnosis, pawzzle]
---

# ZBLK-027 — `pnpm lint` cassé par un ESLint global 9.9.0 capté par rtk

| Friction                                                                                                                                                                           | Cause réelle                                                                                                                                                                                                                                                                                                                                                                                                            | Solution                                                                                                                                                                        | Statut |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `pnpm lint` échoue avec `TypeError: Key "rules": Key "no-unassigned-vars": Could not find "no-unassigned-vars" in plugin "@"`, alors que le code est valide et que le build passe. | **Pas un bug du projet.** Le hook rtk réécrit `pnpm lint` (et `pnpm exec eslint …`) en `rtk lint`, qui résout eslint depuis le PATH global au lieu de `node_modules/.bin`. Un ESLint global 9.9.0 traînait dans `AppData\Roaming\npm\node_modules\eslint` ; la règle `no-unassigned-vars` du flat config n'existe qu'à partir d'ESLint 10 (le projet a bien 10.7.0 en local), d'où le crash au chargement de la config. | `npm uninstall -g eslint` (89 paquets retirés) → `pnpm lint` renvoie « No issues found », exit 0. Le global n'avait aucune utilité, chaque projet embarquant son propre eslint. | résolu |

## Notes

Premier diagnostic erroné : attribué à un simple masquage de PATH dans la résolution de `pnpm run`. C'était faux — `pnpm run` injecte `node_modules/.bin` en tête de PATH, donc un `pnpm lint` non intercepté aurait fonctionné. Le vecteur réel est la réécriture par le hook rtk, rendue visible seulement en lisant la commande réellement exécutée (`rtk lint --version`) dans la sortie de `TaskStop`. Baptiste n'avait jamais rencontré la panne parce que son workflow habituel (VS Code, `vite-plugin-checker` dans Vite) invoque le binaire local sans passer par rtk.

## Références

- [BDR-037](../../decisions/BDR-037.md) — session où le blocage a été rencontré, en validant les gates lint/test/build
