---
id: ZBLK-023
type: blocker
date: 2026-07-25
tags:
  [
    pwa,
    beforeinstallprompt,
    race-condition,
    index-html,
    service-worker,
    devtools,
    pawzzle,
  ]
---

# ZBLK-023 — Bouton d'installation PWA invisible malgré manifest et service worker valides

| Friction                                                                                                                                                                                                                                                         | Cause réelle                                                                                                                                                                                                                                                                                                          | Solution                                                                                                                                                                                                                                | Statut |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `InstallButton` (repris du pattern ifecho) ne s'affichait jamais sur Chrome/Edge desktop, alors que le panneau DevTools "Appli" confirmait un manifest valide et un service worker activé, et que l'icône native d'install apparaissait dans la barre d'adresse. | L'icône native d'install (omnibox) est gérée par le navigateur indépendamment du JS — sa présence ne prouve pas que `beforeinstallprompt` a été capté côté React. Le `useEffect` du hook posait son `addEventListener` après le montage React, trop tard si le navigateur émettait l'event plus tôt (race condition). | Capturer l'event au plus tôt via un `<script>` inline dans `index.html` (avant le bundle React), stocké sur `window.__deferredInstallPrompt` ; le hook `useInstallPrompt` relit cette valeur en `useState` lazy initializer au montage. | résolu |

## Références

- voir aussi GLRN-136 (global) — enrichi de ce pattern
