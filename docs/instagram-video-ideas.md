# Idées de vidéos Instagram — brainstorm + plan d'action

Contraintes retenues :

- **Vibe** : chill, zen, douce — pas de facecam, pas de ton compétitif/urgent
- **Musique** : lofi (sauf format qui met en avant l'ambient player du jeu lui-même)
- **Format** : Reels Insta, 9:16
- **Watermark** : logo de l'app visible à l'écran (voir variantes testées ci-dessous)
- **Rythme de publication** : aucun imposé — phase de test du skill hyperframes

Objectif : plusieurs formats distincts pour ne pas tourner en boucle sur le même gimmick.

---

## Lore directeur — état d'esprit

Lore canonique du jeu (`src/components/WelcomeDialog.tsx`) :

> **Bienvenue à Pawzzle**
> Dans ce village, chaque chat a son quartier préféré et déteste avoir un voisin
> trop collé. Aide chacun à trouver sa place, sans jamais croiser la moustache
> d'un autre.
> Un chat par couleur, par ligne, par colonne. Zéro contact, même du bout de la
> patte.

Ce lore doit être la boussole de toutes les vidéos, pas un texte d'onboarding
qu'on oublie une fois le contenu produit :

- Le sujet d'une vidéo n'est jamais "un puzzle qu'on résout" mais **un chat qui
  cherche sa rue tranquille dans son quartier, sans déranger personne**. Poser
  un chat = le faire _s'installer_, pas _cocher une case_.
- Les régions colorées de la grille = les **quartiers du village**. Le format
  Palette/couleurs doit se filmer comme la découverte du plan du village, pas
  comme une palette abstraite.
- Mot-clé permanent : **respect de l'espace** — jamais deux chats collés. Ça
  tombe bien, c'est déjà le langage naturel d'une vibe zen (calme, distance
  respectée, pas de friction).
- Tout texte visible (hook, fin de vidéo) doit piocher dans ce vocabulaire —
  "trouve sa rue", "son quartier", "zéro contact" — jamais du jargon type
  "score", "niveau", "défi" qui romprait le ton cosy.

---

## Constat après stress-test (Rodin)

Les 8 idées initiales ne sont pas 8 contenus distincts : 6 d'entre elles sont la même
matière première (le gameplay qui se résout) filmée sous des cadrages/vitesses
différents. Reclassées en familles honnêtes :

### Famille A — Captures gameplay (variations de cadrage/rythme d'une même source)

| Format             | Concept visuel (cadré par le lore)                                                                            | Musique                              | Durée           |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------- |
| Solve satisfaisant | Résolution complète d'une grille, zéro texte — un village qui trouve son calme, chat après chat               | Lofi calme, boucle discrète          | 15-20s          |
| Solve with me      | Rythme lent façon study-with-me — on regarde le village s'installer sans se presser                           | Lofi type "rainy day"                | 30-45s          |
| Boucle hypnotique  | Un village qui se peuple puis se réinitialise en fondu, pensé pour tourner en loop                            | Lofi ambiant, sans début/fin marqués | 8-12s en boucle |
| Palette/couleurs   | Zoom lent sur les quartiers colorés du village (identité Atelier Feutrine), comme si on en découvrait le plan | Lofi doux, tons chauds               | 10-15s          |
| Time-lapse         | Grille vide → village qui se peuple tranquillement, accéléré façon stop-motion                                | Lofi doux                            | 10-15s          |

### Famille B — Contenus réellement distincts

| Format                 | Concept visuel (cadré par le lore)                                                                                                  | Musique                             | Durée  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------ |
| Macro pose de pattes   | Gros plan sur un chat qui s'installe enfin dans sa rue, sans frôler personne — quasi-ASMR sans voix                                 | Lofi + sons du jeu mixés en avant   | 10-15s |
| Lecteur ambiant du jeu | Met en avant l'AmbientPlayer intégré — le village a même son ambiance sonore propre, différenciateur vs les autres clones de Queens | Musique du jeu, pas de lofi externe | 15-20s |
| Lifestyle + écran      | Téléphone posé sur un bureau (plante, café, carnet) — un coin tranquille qui fait écho au village lui-même                          | Lofi                                | 15-25s |

### Écartées, avec correction

- **Comparaison Queens** : pas abandonnée — reformulée en version chill (split-screen
  silencieux, "si tu aimes chercher ta place tranquille, tu vas aimer ça", sans ton
  compétitif). Capte le public le plus qualifié. À tester en 2e vague.
- Speedrun/défi chrono, POV perte de vie : toujours écartés — le lore n'a aucune
  tension, ces formats iraient à rebours de l'esprit "village calme".
- Making-of génération procédurale : écarté, public de niche (dev), pas prioritaire.

---

## Plan d'action

### Vague 1 — premiers tests hyperframes (couvre les 2 familles)

| Ordre | Format                           | Pourquoi en premier                                                                  |
| ----- | -------------------------------- | ------------------------------------------------------------------------------------ |
| 1     | Solve satisfaisant (Famille A)   | Baseline la plus simple à produire, sert de référence de rétention                   |
| 2     | Macro pose de pattes (Famille B) | Contenu vraiment distinct, teste si le sensoriel retient mieux que le gameplay large |
| 3     | Lifestyle + écran (Famille B)    | Teste une production différente (mise en scène) vs pur screen capture                |

### Vague 2 — une fois la vague 1 observée

- Comparaison Queens (version chill reformulée) — capte le public qualifié
- 1-2 autres formats de la Famille A (pour varier le cadrage sans dupliquer l'effort de tournage)

### Vague 3 — contenu de rétention (pas d'acquisition)

- Lecteur ambiant du jeu — à publier une fois que quelques vidéos ont déjà établi ce qu'est le jeu, jamais en post d'ouverture

---

## Vidéo lore — repositionnée en vidéo d'accueil in-app

Cette vidéo (`videos/pawzzle-village-lore/`) n'est finalement plus destinée à
Instagram : elle sert de vidéo d'accueil affichée in-app au premier lancement
pour un nouveau joueur (à la place ou en complément de `WelcomeDialog.tsx`).
Les contraintes de zones mortes Reels ne s'appliquent donc plus — le
storyboard ci-dessous reste la référence de contenu/timing, mais le layout a
été recentré sur le canvas plein (1080×1920) plutôt que sur le bandeau de
sécurité Instagram.

## Vidéo lore — post d'ouverture (storyboard d'origine, contenu inchangé)

Format à part (pas une variation Famille A/B) : un mini-explainer qui pose le village
avant que les clips gameplay chill n'aient un sens. Prévu en post d'ouverture/épinglé.

**Titre** : Le village de Pawzzle
**Durée** : ~22s · Reels 9:16 · pas de facecam, pas de voix

| Plan | Durée  | Visuel                                                                                                                             | Texte à l'écran                                                                         | Son                                            |
| ---- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1    | 0-3s   | Macro ambigu : gros plan plein cadre sur une case squircle colorée (hook reveal)                                                   | _(rien)_                                                                                | Lofi doux, fade in                             |
| 2    | 3-6s   | Pull-back progressif : on découvre la grille, les quartiers colorés apparaissent un par un comme un plan de village qui se dessine | "Dans ce village," (typo Atelier Feutrine)                                              | Lofi continue                                  |
| 3    | 6-10s  | Un chat (patte) apparaît et s'installe calmement dans une case                                                                     | "chaque chat a son quartier préféré"                                                    | Lofi + SFX de pose du jeu, en léger avant-plan |
| 4    | 10-14s | Deux cases adjacentes s'allument en glow chaud (pas rouge agressif) puis une patte se déplace vers une case correcte               | "et déteste avoir un voisin trop collé."                                                | Lofi                                           |
| 5    | 14-18s | Grille qui termine de se remplir organiquement, tous les chats installés, vue calme d'ensemble                                     | "Un chat par couleur, par ligne, par colonne.\nZéro contact, même du bout de la patte." | Lofi, léger crescendo doux                     |
| 6    | 18-22s | Grille complète stable                                                                                                             | Logo + "Pawzzle" en fondu, grand                                                        | Lofi fondu sortant                             |

**Watermark** : discret dès le plan 2 (une fois le contexte posé, pas dès la 1ère
frame pour ne pas griller le hook reveal), repris en grand logo+nom au plan 6 —
cohérent avec la règle "fin de vidéo" pour un format orienté acquisition.

À valider avant passage à hyperframes.

---

## Hook visuel — à tester

Zéro texte + zéro hook est un pari risqué pour un compte sans audience. Deux pistes
de hook compatibles avec la vibe chill et le lore (pas de texte criard, pas de compte
à rebours) :

1. **Hook par reveal** : la vidéo s'ouvre sur un macro ambigu (un carré de couleur
   plein cadre, texture squircle) puis un pull-back révèle qu'il s'agit d'un
   quartier du village. Micro-curiosité sans texte.
2. **Hook par titre doux** : une bribe du lore apparaît en fondu dans la 1ère
   seconde — ex. "chaque chat a son quartier..." — en typographie Atelier
   Feutrine, puis disparaît. Pas un hook agressif, juste de quoi ancrer
   l'univers avant que le swipe n'arrive.

**Test proposé** : produire 2 versions du même format (ex : Solve satisfaisant) — une
avec hook reveal, une sans — et comparer.

## Watermark — variantes à tester

- **Discret permanent** : logo petit, faible opacité, coin de l'écran, toute la vidéo —
  réservé aux formats moodboard/lifestyle où l'effet de découverte compte
  (Palette/couleurs, Lifestyle + écran)
- **Fin de vidéo** : logo + nom du jeu clair, uniquement dans les 2-3 dernières
  secondes — pour les formats orientés acquisition directe (Solve satisfaisant,
  Solve with me, Time-lapse)

## Métrique de succès à suivre

Sans ça, la "phase de test" ne débouche sur aucune décision. À observer sur Instagram
Insights pour départager les formats après quelques publications :

- Taux de rétention à 3s (le hook fonctionne ou pas)
- Taux de complétion de la vidéo
- Taux de rewatch/saves
