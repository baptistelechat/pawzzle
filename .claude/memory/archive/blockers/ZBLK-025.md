---
id: ZBLK-025
type: blocker
date: 2026-07-25
summary: "Titre qui saute au clic sur \"Nouvelle partie\""
tags: [animatepresence, layout-shift, framer-motion, loading-state, ui, pawzzle]
status: résolu
---

# ZBLK-025 — Le titre "saute" verticalement au clic sur "Nouvelle partie"

**Friction** : Chaque clic sur "Nouvelle partie" fait visiblement descendre puis remonter le titre en haut de l'app, un flash net signalé par Baptiste.

**Cause réelle** : La condition de l'`AnimatePresence` était `status === "loading" || !level` : une régénération démontait donc tout le bloc de jeu (statut+grille+boutons, ~500px) au profit d'un spinner de 32px, faisant se recentrer le parent `justify-center` (cf. [LRN-020](../../learnings/LRN-020.md)). Ajuster la hauteur du placeholder ne pouvait pas suffire — `mode="wait"` vide le slot entre la sortie et l'entrée.

**Solution** : Condition ramenée à `!level` : `level` reste en mémoire pendant la régénération, donc plus rien n'est démonté après le premier boot — seule la `Grid` se remonte via `levelId`, à taille constante. `displayStatus` (loading → playing) évite le flash du compteur et du label du bouton ; `status` brut reste la source de `disabled`, qui doit bloquer la grille pendant la génération.

## Références

- [LRN-020](../../learnings/LRN-020.md) — mécanisme de centrage en cause
