---
id: ZBLK-044
type: blocker
date: 2026-07-27
summary: "Layout ligne difficulté/pattes/vies : 3 itérations avant stabilité"
tags: [layout, pawcounter, difficulty, centering, iteration, pawzzle]
status: résolu
---

# ZBLK-044 — Layout ligne difficulté/pattes/vies : 3 itérations avant stabilité

**Friction** : Changer le nombre total de pattes à trouver (6/8 vs 10, 1 vs 2 chiffres) faisait sauter toute la rangée (flammes+compteur+cœurs), car elle est centrée comme un bloc unique dont la largeur totale variait avec le nombre de chiffres.

**Cause réelle** : 3 tentatives ont chacune corrigé un symptôme sans traiter le bon niveau : (1) largeur réservée sur le texte seul, aligné à gauche → jitter corrigé mais rangée passée en `justify-between` sur toute la largeur de la grille pour compenser → rejeté par Baptiste, il voulait un groupe centré, pas ancré aux bords ; (2) retour à un groupe centré mais texte centré dans sa réserve → trou visible avant les cœurs, pointé du doigt par Baptiste ; (3) largeur réservée sur le GROUPE icône+texte entier avec `justify-center` → gap icône-texte enfin constant et aucun trou visible.

**Solution** : Voir [BDR-067](../../decisions/BDR-067.md) et [LRN-044](../../learnings/LRN-044.md).

## Références

- [BDR-067](../../decisions/BDR-067.md)
- [LRN-044](../../learnings/LRN-044.md)
