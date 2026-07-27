---
workflow: general-video
flow: automation
storyboard: no
message: "Pawzzle est un village calme où chaque chat cherche sa rue, sans jamais déranger son voisin"
destination: in-app-onboarding
aspect: 1080x1920
language: fr
length: 31.6s
---

## Intent

Vidéo d'accueil affichée in-app, au premier lancement du jeu pour un nouveau
joueur, pour Pawzzle, un puzzle logique inspiré de Queens (LinkedIn) : placer
un chat unique par ligne, colonne et quartier coloré, sans qu'aucun ne touche
son voisin. Vibe chill/zen/cosy de bout en bout — pas de facecam, pas de voix
off, aucun texte criard, aucune animation brusque. Le village se révèle
progressivement : un plan macro ambigu, un pull-back qui dévoile la grille,
puis les chats qui trouvent leur rue un par un, jusqu'au lockup de marque
final.

## Assets

- `public/icon.svg` (source) → `assets/images/icon.svg` — logo réel de l'app, réutilisé tel quel, jamais redessiné.
- `src/lib/engine/generator.ts` (`generateLevel(6,"square")`, exécuté réellement via un runner tsx)
  → board 6×6 figé (régions en blobs + solution), embarqué dans `compositions/scene{12,3,4,5,6}.html`.
- `lucide-react` (`PawPrint`, `X`, v1.25.0) → icônes exactes du jeu (voir `CellContent.tsx`),
  reconstruites en SVG inline à l'identique, jamais redessinées à la main.
- `public/sounds/ambient/alex-morgan-calm-chillout-541036.mp3` → `assets/alex-morgan-calm-chillout-541036.mp3`,
  piste réelle de la bibliothèque du jeu (ambiance de fond continue).
- `public/sounds/paw_correct.mp3` et `public/sounds/paw_incorrect.mp3` → copiés tels quels dans
  `assets/`, SFX ponctuels réels du jeu (pose correcte / pose invalide), mixés par-dessus l'ambiance.

## Customizations

- Aucune capability du menu companion — run automation, storyboard désactivé.

## Notes

- Identité visuelle strictement issue du code source du jeu (voir Notes ci-dessous), rien d'inventé :
  bg `#fff8f0`, fg `#4a3728`, primaire `#ff8a65`, secondaire `#ffe8d6`, accent vert `#7fb894`.
  6 régions pastel OKLCH espacées de 60° (30/90/150/210/270/330), converties en hex car le moteur
  de rendu ne supporte pas `oklch()` de façon fiable.
- Cases squircle : `border-radius: 28%` + `corner-shape: squircle` en progressive enhancement, fallback carré-arrondi.
- Typographie : Fredoka (titres/légendes/lockup), embarquée en `@font-face` local (woff2 téléchargé
  une fois, aucun fetch réseau au rendu) — pas dans la liste des 18 polices pré-bundlées du moteur.
  IBM Plex Sans avait été embarquée pour le watermark (voir ci-dessous) ; plus utilisée depuis sa
  suppression, laissée de côté (fichier `.woff2` encore présent dans `assets/fonts/` mais inutilisé).
- Musique : piste réelle du jeu (voir Assets), en continu, fondu in (0-1.5s) et fondu out (29.6-31.6s).
- SFX ponctuels réels mixés par-dessus l'ambiance (jamais à sa place) : `paw_correct.mp3` à chaque
  pose correcte (plans 3, 5, et fin de la 2ᵉ patte au plan 4), `paw_incorrect.mp3` au moment précis
  où le glow + la croix `X` apparaissent sur la case interdite (plan 4). Timing synchronisé sur le
  moment où l'élément est visuellement établi (fin du tween d'entrée), pas sur son déclenchement —
  un premier passage jouait les SFX trop tôt, dès le début de l'animation.
- Watermark de coin (logo + "Pawzzle") supprimé sur demande explicite — plus aucun élément
  persistant en coin d'écran.
- Plans 1 et 2 fusionnés en une seule sous-composition (`compositions/scene12.html`) pour un
  mouvement de caméra continu (pull-back), sans cut entre le macro et la révélation de la grille.
- Durée totale : 31.6s (5 sous-compositions : 0-7, 7-12, 12-18.5, 18.5-27.1, 27.1-31.6) — le plan 5
  (texte le plus long de la vidéo, 2 lignes de règles) a une tenue de texte allongée spécifiquement
  (~3.6s plein contre ~2.2s ailleurs), quitte à repousser la durée totale au-delà de 30.3s.
- Layout recentré sur le canvas plein 1080×1920 (plus de contrainte de zone morte Reels, la vidéo
  n'étant plus destinée à Instagram) : grille à `top:460px` (partagée par les 5 scènes, légèrement
  au-dessus du centre réel pour laisser respirer le texte en dessous), légendes à `top:1390px`
  (plans 1-2-3-4) et `top:1360px` (plan 5, 2 lignes, remonté pour compenser la hauteur du bloc de
  texte supplémentaire), lockup final centré sur `top:960px` (centre vertical exact du canvas).
