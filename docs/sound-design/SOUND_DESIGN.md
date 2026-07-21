# Sound Design — Phase 4

Liste des sons à trouver pour Pawzzle. Esthétique cible : "Atelier Feutrine" (chaud, tactile, feutre/bois/carton) — éviter les bips électroniques génériques.

## Sites à consulter

- [Kenney — UI Audio](https://kenney.nl/assets/ui-audio) — CC0, 50 sons UI
- [Kenney — Interface Sounds](https://kenney.nl/assets/interface-sounds) — CC0, 100 sons UI
- [Freesound.org](https://freesound.org) — filtrer licence **CC0** dans la recherche, pour les sons signature (mots-clés : "wood click", "felt pop", "toy chime", "marimba short")
- [Mixkit](https://mixkit.co/free-sound-effects/) — gratuit, sans compte, catégorie "Game"
- [Zapsplat](https://www.zapsplat.com) — gratuit avec compte, attribution requise sur plan gratuit

## Emplacement, nom, format

- **Dossier** : `public/sounds/` (asset statique, pas `src/assets/` — préchargement direct + cache PWA)
- **Nom de fichier** : identique à l'ID entre backticks ci-dessous, ex. `paw_correct` → `public/sounds/paw_correct.mp3`
- **Format** : `.mp3` (compatibilité iOS Safari via Web Audio API, `.ogg` mal supporté), mono 44.1kHz, < 50 Ko/fichier
- **Conversion/normalisation automatique** : dépose tous les fichiers bruts (`.mp3`, `.ogg`, `.wav`, `.flac`, `.m4a`, `.aiff`) dans `public/sounds/`, puis lance `pnpm sounds:normalize` — convertit chaque fichier non-mp3 en `.mp3` équivalent (mono, 44.1kHz) et réencode les `.mp3` déjà présents avec les mêmes réglages. Les fichiers sources non-mp3 ne sont pas supprimés automatiquement.

## Sons à trouver

### 🎮 Interactions de jeu

- [ ] `marker_add` — Tap → pose la croix d'aide. Pop doux et court, texture feutre/tissu, très discret.
- [ ] `marker_remove` — Tap → retire la croix d'aide. Même famille que `marker_add`, inversé.
- [ ] `paw_correct` — Double-tap → pose correcte de l'animal. Son signature, satisfaisant et chaleureux, chime court positif (xylophone/bois type marimba).
- [ ] `paw_incorrect` — Double-tap → pose en conflit (case verrouillée rouge). Négatif mais doux, non punitif — "boop" grave discret, pas de buzzer agressif.
- [ ] `drag_paint_tick` — Glisser sur une case pendant le tracé de marqueurs. Micro-tick très léger, pensé pour se répéter sans fatiguer.

### 🏆 Fin de partie

- [ ] `victory` — Grille complétée avec succès. Petite fanfare chaleureuse (1-2s), cohérente avec `paw_correct` mais plus riche.
- [ ] `game_over` — Budget d'erreur épuisé. Descendant, doux, ton "on retente" plutôt qu'"échec cuisant".
- [ ] `new_game` — Lancement d'une nouvelle grille. Petit whoosh/froissement léger (papier ou tissu).

### 🧭 UI générale

- [ ] `ui_click` — Clic générique (boutons, nav). Neutre et discret, texture bois/carton plutôt que plastique.
- [ ] `ui_toggle` — Toggle "Aide" ON/OFF. Clic mécanique léger, sensation de bascule physique.
- [ ] `menu_open` — Ouverture du menu hamburger ou d'un drawer. Whoosh doux.
- [ ] `menu_close` — Fermeture du menu hamburger ou d'un drawer. Même famille que `menu_open`, inversé.

## Stratégie

1. UI générique → pack Kenney (UI Audio + Interface Sounds) en priorité.
2. Sons signature (`paw_correct`, `victory`, `paw_incorrect`) → recherche manuelle ciblée sur Freesound si les packs ne conviennent pas.
