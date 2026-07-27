---
message: "Pawzzle est un village calme où chaque chat cherche sa rue, sans jamais déranger son voisin"
aspect: 1080x1920
language: fr
mode: autonomous
---

# Le village de Pawzzle

Reel de 31.6s, 5 sous-compositions (`compositions/scene12.html`, `scene3.html`, `scene4.html`,
`scene5.html`, `scene6.html`), orchestrées par `index.html`. Board réel généré par
`src/lib/engine/generator.ts` (`generateLevel(6,"square")`), figé une fois. Icônes réelles du
jeu (`lucide-react` `PawPrint` / `X`). Musique d'ambiance réelle du jeu (`public/sounds/ambient/`)

- SFX ponctuels réels (`paw_correct.mp3` / `paw_incorrect.mp3`) mixés par-dessus, synchronisés sur
  le moment où chaque élément est visuellement établi. Aucun watermark (supprimé). Grille, textes et
  lockup final tous recentrés sur le canvas plein 1080×1920 (vidéo d'accueil in-app, plus de
  contrainte Instagram Reels) — voir Notes.

## Frame 1

- status: outline
- src: compositions/scene12.html
- window: 0.0–7.0s (fusion des plans 1+2 d'origine — une seule sous-composition, une seule
  caméra continue, pas de cut entre le macro et la révélation)
- type: hook + reveal
- citation: `sine-wave-loop` (rules-index.md) sur `cam.scale` — respiration lente pendant le
  hold macro ; `viewport-change` (rules-index.md), forme extrême (4-12×) — pull-back continu
  d'un seul `.world` wrapper, du macro punché (S0=5, réduit depuis 9 pour que le bord/l'ombre du
  squircle restent lisibles) jusqu'à la grille 1× ; `spring-pop-entrance` (calm settle) pour le
  wash région-par-région (blobs réels, pas des colonnes) et pour l'entrée/sortie du texte.
- beat: Gros plan sur une case squircle (bord visible + ombre douce — lisible comme case de jeu,
  pas comme aplat abstrait), respiration légère, PUIS un dézoom continu (même timeline, même
  wrapper caméra) révèle la grille 6×6 réelle. Les 6 quartiers (régions organiques du vrai
  générateur) s'allument un par un. Texte Fredoka, fondu d'entrée (4.0s) → tenue pleine 1.8s →
  fondu de sortie + léger glissé (6.4-6.8s) : "Dans ce village,".

## Frame 2

- status: outline
- src: compositions/scene3.html
- window: 7.0–12.0s
- type: feature_showcase
- citation: `spring-pop-entrance` (rules-index.md), variante calm settle, sans overshoot.
- beat: Grille réelle (régions organiques, cases bordées/ombrées) + première patte (icône
  `PawPrint` exacte de lucide-react) qui se pose case (0,2), jaune — cellule réelle de la
  solution générée. SFX `paw_correct.mp3` synchronisé sur l'atterrissage (1.1s, proche de la fin
  du tween d'entrée 0.5-1.3s), pas sur son déclenchement. Texte : entrée (1.5s) → tenue 2.2s →
  sortie fondu+glissé (4.3-4.7s) : "chaque chat a son quartier préféré".

## Frame 3

- status: outline
- src: compositions/scene4.html
- window: 12.0–18.5s
- type: feature_showcase
- citation: `ambient-glow-bloom` (rules-index.md), hero-bloom, `GLOW_PEAK_OPACITY` 0.30, ambré —
  jamais rouge ; icône `X` exacte de lucide-react (recolorée en ambré-brun, pas le rouge
  `--destructive` du jeu — ce beat reste doux, pas une alerte) posée sur les 2 cases interdites ;
  `nudge-curve` (rules-index.md) pour le glissement vertical lent-rapide-lent de la 2ᵉ patte.
- beat: Les cases (0,3) et (1,2) — adjacentes à la fois entre elles et à la 1ère patte (0,2) —
  s'allument d'un glow ambré ET affichent l'icône `X` réelle du jeu (zone interdite concrète, pas
  seulement suggérée). SFX `paw_incorrect.mp3` synchronisé à 0.95s, une fois le glow et le X
  visuellement établis (pas au tout début de leur fondu d'entrée). Une 2ᵉ patte apparaît en hover
  sur cette zone puis glisse d'une case vers le bas, jusqu'à sa vraie case solution (2,3),
  violette, non adjacente — atterrissage marqué par `paw_correct.mp3` à 2.21s (fin exacte du
  glissement). Le glow et le X s'effacent une fois le choix fait. Texte : entrée (3.0s) → tenue
  2.2s → sortie (5.8-6.2s) : "et déteste avoir un voisin trop collé."

## Frame 4

- status: outline
- src: compositions/scene5.html
- window: 18.5–27.1s (allongée de 7.3s à 8.6s — texte le plus long de la vidéo, tenue prioritaire
  sur un chiffre de durée cible)
- type: benefit_highlight
- citation: `spring-pop-entrance` (rules-index.md), calm settle, arrivées étalées organiquement
  (Adapt délibéré, hors du stagger ≤0.5s standard — remplissage progressif, pas un seul beat).
- beat: Les 2 pattes précédentes restent visibles ; les 4 pattes restantes (icônes `PawPrint`
  réelles) apparaissent une à une aux 4 cases restantes de la vraie solution — (1,5) rouge,
  (3,1) rose, (4,4) bleu, (5,0) vert — aucune ne touche sa voisine, même en diagonale. Chaque
  atterrissage marqué par `paw_correct.mp3`, synchronisé ~0.5s après le début de chaque pop
  (proche de la fin du tween de 0.6s), pas à son déclenchement. Texte sur 2 lignes distinctes
  (pas de `<br>`), formant un seul bloc : entrée (3.6-3.8s) → tenue 3.6-3.7s (la plus longue de la
  vidéo) → sortie ensemble (7.9-8.3s) : "Un chat par couleur, par ligne, par colonne." / "Zéro
  contact, même du bout de la patte."

## Frame 5

- status: outline
- src: compositions/scene6.html
- window: 27.1–31.6s
- type: branding
- citation: `titlecard-reveal` (blueprints-index.md), rôle Brand_Outro — Adapt : lockup logo +
  mot "Pawzzle" spring-settle-and-hold (`spring-pop-entrance`, calm settle) + respiration légère
  du lockup tenu (`sine-wave-loop`, amplitude basse) — pas de sortie, tenu jusqu'à la dernière image.
- beat: Grille complète (6 pattes réelles, board réel) et stable, assombrie sous un scrim. Le logo
  (icon.svg) + le mot "Pawzzle" (Fredoka) apparaissent en grand, centrés au canvas plein, en
  un seul mouvement calme (scale 0.92→1 + fondu), puis tiennent la pose avec une respiration à
  peine perceptible.

## Notes de composition

- Board réel : `generateLevel(6,"square")` exécuté via un runner `tsx` (copie fidèle, import
  paths seuls modifiés, zéro logique changée) dans `src/lib/engine/`. 25 générations réelles
  échantillonnées, la mieux répartie retenue (spread de taille de région minimal) — même logique
  qu'un choix de meilleure photo réelle parmi plusieurs prises, pas une fabrication. Régions :
  `[[2,4,1,4,4,0],[2,4,4,4,4,0],[2,2,4,4,0,0],[2,5,5,0,0,0],[2,5,5,5,3,0],[2,2,5,5,0,0]]`,
  solution `(0,2),(1,5),(2,3),(3,1),(4,4),(5,0)` — vérifiée sans aucune adjacence (roi comprise).
- Icônes : `lucide-react` `PawPrint`/`X` (v1.25.0), nœuds SVG exacts extraits du package,
  reconstruits en `<svg>` inline — jamais redessinés à la main.
- Musique : `alex-morgan-calm-chillout-541036.mp3`, piste réelle de `public/sounds/ambient/`,
  copiée telle quelle, fondus in/out sur la piste racine.
- SFX : `paw_correct.mp3` / `paw_incorrect.mp3`, fichiers réels de `public/sounds/` (pas
  `ambient/`, qui est la musique de fond), copiés tels quels, mixés par-dessus l'ambiance sur des
  pistes dédiées (jamais à sa place). Chaque SFX est calé sur le moment où l'élément visuel qu'il
  accompagne est établi (fin de tween/settle), jamais sur son déclenchement — un premier passage
  jouait tout trop tôt.
- Watermark : supprimé sur demande explicite. Plus aucun élément persistant en coin d'écran.
- Layout plein canvas 1080×1920 : cette vidéo sert désormais d'écran d'accueil in-app (premier
  lancement du jeu), la contrainte de zones mortes Instagram Reels ne s'applique plus. Grille à
  `top:460px` (partagée par les 5 scènes, légèrement au-dessus du centre réel du canvas pour
  laisser respirer le texte en dessous), légendes à `top:1390px` (plans 1-2-3-4) et `top:1360px`
  (plan 5, 2 lignes, remonté pour compenser la hauteur du bloc de texte supplémentaire), lockup
  final centré sur `top:960px` (centre vertical exact du canvas plein, pas un centre de bandeau).
