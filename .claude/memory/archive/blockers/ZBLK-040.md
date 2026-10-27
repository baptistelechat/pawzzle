---
id: ZBLK-040
type: blocker
date: 2026-07-26
summary: "agent-browser ne pouvait pas ouvrir le serveur dev mkcert"
tags: [agent-browser, mkcert, https, headless, dev-server, pawzzle]
status: résolu
---

# ZBLK-040 — agent-browser ne pouvait pas ouvrir le serveur dev mkcert

**Friction** : `agent-browser open http://localhost:5183` échouait (`ERR_EMPTY_RESPONSE`), puis en HTTPS le navigateur headless restait bloqué sur une page blanche (timeout).

**Cause réelle** : Le serveur dev tourne en HTTPS via `vite-plugin-mkcert` (certificat auto-signé) — confirmé par `curl -k https://...` qui répondait correctement. Le navigateur headless piloté par agent-browser ne fait pas confiance à ce certificat comme le ferait un vrai navigateur système avec la CA mkcert installée.

**Solution** : Build (`vite build`) + servi statiquement en HTTP simple (`npx serve dist`) pour la vérification visuelle, au lieu du serveur dev HTTPS.

## Références

- voir aussi GLRN-251 (mémoire globale) — le pattern généralisé
