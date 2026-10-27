---
id: ZBLK-003
type: blocker
date: 2026-07-21
summary: "unplugin-turbo-console : clic \"ouvrir éditeur\" jamais fonctionnel"
tags: [vite, unplugin-turbo-console, devtools, troubleshooting, abandoned]
status: résolu
---

# ZBLK-003 — unplugin-turbo-console : clic "ouvrir éditeur" jamais fonctionnel

**Friction** : Le lien cliquable "🔦 ouvrir dans l'éditeur" généré par `unplugin-turbo-console` dans la console navigateur n'ouvrait jamais VS Code, quel que soit le protocole (HTTP/HTTPS)

**Cause réelle** : Non identifiée avec certitude. 3 hypothèses testées successivement : (1) race condition au cold-start sur le port du mini-serveur local du plugin (port `undefined`) — corrigée en attendant le démarrage complet ; (2) mixed-content HTTPS (mkcert) bloquant le `fetch`/`WebSocket` du plugin vers son serveur local en `http://`/`ws://` — infirmée en repassant en HTTP par défaut, aucun changement observé ; (3) popup blocker Chrome empêchant l'ouverture d'un nouvel onglet déclenchée par script depuis un clic sur lien auto-détecté en console — vérifié, aucune icône de popup bloqué visible, aucun effet

**Solution** : Plugin retiré (`pnpm remove unplugin-turbo-console`), `vite-plugin-mkcert` remis actif par défaut sur `pnpm dev` (le split `dev`/`dev:https` n'avait plus d'utilité une fois le plugin abandonné)

## Références

- [BDR-005](../../decisions/BDR-005.md) — plugins Vite DX retenus pour le sandbox
