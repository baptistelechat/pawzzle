---
id: ZBLK-010
type: blocker
date: 2026-07-21
summary: "`ffmpeg-static` : binaire non téléchargé, build script ignoré par pnpm"
tags: [pnpm, ffmpeg-static, onlybuiltdependencies, postinstall, build-script]
status: résolu
---

# ZBLK-010 — `pnpm add ffmpeg-static` : binaire non téléchargé (build script ignoré)

**Friction** : Après `pnpm add -D ffmpeg-static`, le binaire `ffmpeg.exe` était absent — `pnpm approve-builds` interactif impossible en session non-interactive, `pnpm rebuild` silencieux sans effet.

**Cause réelle** : pnpm bloque par défaut les scripts postinstall pour raison de sécurité (voir GLRN-135) ; le package doit être explicitement autorisé au niveau workspace.

**Solution** : Ajout de `ffmpeg-static` à `onlyBuiltDependencies` dans `pnpm-workspace.yaml`, puis `pnpm install` — binaire téléchargé, testé (round-trip `.wav`→`.mp3`).

## Références

- [BDR-016](../../decisions/BDR-016.md) — décision d'outillage à l'origine de ce blocage
