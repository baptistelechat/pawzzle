---
id: ZBLK-026
type: blocker
date: 2026-07-25
summary: "Icône du bouton d'install iOS signalée différente (cache SW confirmé)"
tags: [pwa, service-worker, cache, icon-sizing, install-button, pawzzle]
status: résolu
---

# ZBLK-026 — Icône du bouton d'installation iOS signalée toujours de taille différente

**Friction** : Après la centralisation `size-5` dans `button.tsx` ([BDR-031](../../decisions/BDR-031.md)), Baptiste a signalé que l'icône du bouton d'install en mode iOS restait visuellement différente de ses voisins.

**Cause réelle** : Confirmée : cache du service worker PWA (`registerType: autoUpdate`), pas un défaut de code. Le rendu attendu (`Share`/`Download` sans classe explicite, résolu via `twMerge`) est bien identique dans les deux cas.

**Solution** : Vérifié le 2026-07-25 sur Chrome desktop avec un user agent iOS forcé (donc hors service worker de l'installation précédente) : l'icône est de la même taille que ses voisines. Rien à corriger.
