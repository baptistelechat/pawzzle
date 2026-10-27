---
id: ZBLK-037
type: blocker
date: 2026-07-25
summary: "Pull-to-refresh cassé, 2 diagnostics erronés avant la vraie cause"
tags: [pull-to-refresh, css, overflow, misdiagnosis, mobile, pawzzle]
status: résolu
---

# ZBLK-037 — Pull-to-refresh cassé, 2 diagnostics erronés avant la vraie cause

**Friction** : Le pull-to-refresh ne fonctionnait plus sur mobile après le verrou anti-scroll ([BDR-041](../../decisions/BDR-041.md)). Premier fix (retirer `overscroll-behavior: none`) sans effet. Deuxième hypothèse, affirmée avec trop de confiance ("ce n'est pas `overflow:hidden`"), également fausse après vérification par recherche — Baptiste a explicitement demandé une confirmation avant d'aller plus loin.

**Cause réelle** : `overflow:hidden` sur `html`/`body` se propage au scroller racine du viewport (règle CSS de propagation, voir GLRN-246) — tue le pull-to-refresh indépendamment d'`overscroll-behavior`.

**Solution** : Verrou déplacé sur `#root` ([BDR-046](../../decisions/BDR-046.md)), qui n'est ni `html` ni `body` donc ne propage pas.

## Références

- [BDR-046](../../decisions/BDR-046.md) — le fix
- [BDR-041](../../decisions/BDR-041.md) — le verrou d'origine, amendé
- voir aussi GLRN-246 (mémoire globale)
