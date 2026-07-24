---
id: ZBLK-020
type: blocker
date: 2026-07-24
tags: [web-audio, ambient, mobile, android, settimeout, misdiagnosis, pawzzle]
---

# ZBLK-020 — Musique de piste suivante inaudible sur mobile (Android), diagnostic initial erroné (iOS Safari)

| Friction                                                                                                                                                                                                                                                             | Cause réelle                                                                                                                                                                                                                                                                                                                                                                                                                                           | Solution                                                                                                                                                                                          | Statut |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Baptiste a signalé que la musique d'ambiance restait muette au changement de piste sur mobile uniquement (bouton suivant/précédent), reproduit sur le build Vercel de la branche `development` — le temps affiché dans la pill avançait normalement, sans aucun son. | Diagnostic initial erroné : attribué à la règle iOS Safari de perte du geste utilisateur sur un `.play()` différé (GLRN-222, mémoire globale) — invalidé par Baptiste, l'appareil de test étant Android, pas iOS. Le mécanisme exact du délai reste non confirmé (voir [LRN-019](../../learnings/LRN-019.md)), mais la suppression du `setTimeout` de 300ms avant le swap de piste (`goToAmbientTrack` dans `src/lib/sounds.ts`) a résolu le problème. | `loadAmbientTrack` appelé directement (synchrone, même tick que le clic) au lieu d'être différé de 300ms via `window.setTimeout` — confirmé fonctionnel par Baptiste après test réel sur Android. | résolu |

## Références

- [LRN-019](../../learnings/LRN-019.md) — pattern extrait (symptôme + fix), mécanisme exact non confirmé
- [LRN-018](../../learnings/LRN-018.md) — symptôme identique, cause différente (session précédente)
- [BDR-017](../../decisions/BDR-017.md) — architecture son ambiance
