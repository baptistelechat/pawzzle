# Brief projet — Pawzzle (jeu de puzzle logique)

**Domaine retenu :** pawzzle.vercel.app

> ⚠️ Note de contexte : 6 jeux existants portent déjà ce nom sur les stores (Pawzzle: Roll & Merge, Pawzzle: Jigsaw Puzzle, Pawzzle Garden, Pawzzle: Animal Match Puzzle, Pawzzle Combo, Pawzzle Quest). Risque jugé acceptable car la distribution prévue passe par PWA + réseaux sociaux dev, pas par la recherche organique sur les stores. Décision finale de Baptiste après arbitrage. À vérifier avant lancement : disponibilité des handles réseaux sociaux (Instagram/X/GitHub) sous "pawzzle" ou variante proche.

> Document de cadrage issu d'une session de brainstorm avec Claude, à transmettre à Claude Code pour l'implémentation. Ce fichier doit être complété/affiné au fil du développement.

---

## 1. Origine du projet

Inspiré du jeu **Queens** (LinkedIn / Puzzle communautaire) : une grille où il faut placer un élément unique par ligne, colonne et région colorée, sans contact entre deux éléments adjacents. L'objectif est de proposer une expérience différenciante, pas un reskin.

---

## 2. Stack technique retenue

| Composant | Choix | Justification |
|---|---|---|
| Frontend | **Vite + React + TypeScript** | Projet SPA pur, pas besoin de SSR pour le jeu lui-même |
| Style | Tailwind + shadcn/ui | Cohérent avec les habitudes de dev existantes |
| Backend/DB | **Supabase** (Free tier) | Auth, DB Postgres, Edge Functions — suffisant pour le besoin (500k invocations Edge Functions/mois, 50k MAU) |
| SEO | À traiter séparément du jeu (voir section 5) | Le jeu = état d'application, pas une page à indexer |
| Format de distribution | **PWA** | Zéro installation, cross-device, évite les contraintes App Store (commission, review, guidelines) |
| Hébergement | Vercel (Hobby/free tant que non-commercial) | Attention : ToS Vercel interdit l'usage commercial sur Hobby plan |

### Point de vigilance Supabase Free tier
- Pause automatique du projet après 7 jours d'inactivité (à surveiller si lancement public avec creux d'activité)
- 500 000 invocations Edge Functions/mois, 500 Mo DB, 50 000 MAU — largement suffisant pour un lancement

### Point de vigilance Vercel Hobby
- Gratuit mais réservé à l'usage **non-commercial** (pas de pub, pas d'achat in-app tant qu'on reste sur ce plan)
- Cap dur (pas d'overage payant) : au-delà des limites, le déploiement est mis en pause jusqu'au cycle suivant

---

## 3. SEO — stratégie retenue

Le jeu n'a pas besoin d'être indexé (c'est un état d'application, pas une page). Seules les pages "vitrine" (accueil, règles, à propos) ont un enjeu SEO.

**Options envisagées, à trancher au moment du dev de la LP :**

| Option | Avantage | Inconvénient |
|---|---|---|
| `vite-plugin-seo-prerender` | Reste 100% dans l'écosystème Vite | Solution moins mature/standard |
| React Router v7 (Framework Mode) avec pré-rendu au build | Solution officielle, bien documentée, Lighthouse 99+ possible | Nécessite une migration du routing |
| Astro pour la LP + Vite pour l'app | Meilleur outil pour du contenu statique | **Oblige à gérer 2 hébergements séparés** (LP statique + app SPA) |

**Décision à prendre plus tard** — pas bloquant pour le MVP. Le jeu (app) se développe et se teste indépendamment de la LP.

---

## 4. Concept de gameplay — mécaniques retenues

### 4.0 Scope du MVP réel (priorité absolue avant toute innovation)

Le tout premier MVP est volontairement **un clone du jeu de référence, sans aucune innovation** : grille carrée classique, un animal par ligne, un par colonne, un par couleur/région. Aucune forme exotique, aucune contrainte échecs. L'objectif de cette étape est de valider le moteur de règles et l'algorithme de génération (voir section 6) sur le cas le plus simple possible, avant d'ajouter la moindre complexité visuelle ou mécanique.

**Condition de victoire (MVP)** : tous les animaux sont placés correctement selon les 3 règles → niveau gagné.

Les mécaniques différenciantes (formes non carrées, contraintes échecs) ne sont ajoutées qu'une fois ce socle validé et fonctionnel — voir 4.1.

### 4.1 Top 3 mécaniques différenciantes retenues (à prototyper après le socle du MVP)

1. **Formes de grille non carrées** (en pixel art / cases carrées assemblées) : hexagone, cercle, triangle, etc. — casse la lecture visuelle classique du puzzle sans changer la logique de base. Fort potentiel pour du contenu réseaux sociaux (visuellement différenciant, facile à montrer en capture/vidéo).

2. **Contraintes inspirées des mouvements d'échecs** : au lieu du simple "pas de contact", on interdit un déplacement selon un pattern (diagonale interdite façon fou, mouvement en L interdit façon cavalier, ligne horizontale/verticale interdite façon tour, combinaison façon dame, etc.).
   - **Nomenclature retenue : décrire le mouvement, jamais le nom de la pièce.** Ex: "interdit en diagonale" plutôt que "comme le fou". Plus universel (pas besoin de connaître les échecs), et ça renforce l'apprentissage du pattern plutôt que du vocabulaire.
   - ⚠️ **Piège d'onboarding identifié et écarté** : surligner en jeu les cases interdites par la contrainte casse la mécanique cœur — le joueur n'a plus qu'à cliquer sur les cases non surlignées, ce qui annule tout l'intérêt de réflexion du puzzle.
   - **Solution retenue à la place** : un niveau-tutoriel dédié en début de partie qui explique la règle une seule fois (animation), sans aide permanente affichée pendant le jeu réel.

3. Combinaison des deux (ex: grille hexagonale + contrainte cavalier) pour des niveaux inédits.

### 4.2 Pistes étudiées mais NON retenues pour le MVP (à garder en note pour itérations futures)

- Chats/animaux spéciaux avec règles individuelles (ex: un animal qui interdit 2 cases au lieu d'1 autour de lui) — risque d'ajouter une couche de complexité supplémentaire pouvant perdre des utilisateurs en V1.
- Fusion de couleurs (2 régions adjacentes remplies fusionnent leur contrainte) — mécanique dynamique intéressante, à re-creuser après validation du MVP.
- Brouillard progressif (régions révélées progressivement) — dimension de déduction incrémentale intéressante, non prioritaire pour la V1.
- Chats qui se déplacent en L façon cavalier (redondant avec la contrainte échecs retenue en point 2, à fusionner conceptuellement).

---

## 5. Positionnement / différenciation

### Ce qui NE marche PAS comme argument principal
- Le reskin animalier seul (couleurs → animaux) n'est pas différenciant : Queens a déjà l'avantage de la distribution native (intégré à LinkedIn, des millions d'utilisateurs captifs).

### Arguments de différenciation retenus

| Argument | Statut | Formulation retenue |
|---|---|---|
| Formes de grille + contraintes échecs | 🟢 Argument produit principal | "Un jeu qui change de forme et de règle à chaque niveau, pas la répétition infinie d'une seule mécanique" |
| Entraînement indirect aux échecs | 🟡 Argument secondaire (niche) | Pont marketing vers la communauté échecs, sans promesse de bénéfice cognitif prouvé |
| No pub / gratuit | 🟡 Argument de confiance, pas de gameplay | À utiliser mais répondre d'abord à la question du modèle de financement si le jeu scale |
| Angle "pause logique" | 🟢 Argument fort et honnête | **Ne pas dire** "entraîne ton cerveau" (risque légal — voir note ci-dessous) mais "une pause logique plutôt qu'un scroll passif" |

### ⚠️ Note légale importante — Claims santé/cognitifs
Lumosity (application de brain-training) a été condamnée en 2016 à payer 2 millions de dollars à la FTC (États-Unis) pour avoir fait des affirmations non prouvées scientifiquement sur l'amélioration des performances cognitives et la prévention du déclin lié à l'âge.

**Conséquence pour ce projet** : ne jamais affirmer un bénéfice cognitif prouvé ("entraîne ton cerveau", "améliore ta logique", "prévient le déclin cognitif"). Rester sur un positionnement d'**usage** ("une pause logique plutôt qu'un scroll passif sur les réseaux") plutôt que de **bénéfice médical/cognitif**.

### Insight utilisateur validé (à garder comme fil rouge du design)
> "Ça permet de prendre une pause quand je suis aux WC au lieu d'être sur TikTok."

→ Conséquence produit directe : viser des **sessions courtes (2-5 minutes par niveau)**, pas des niveaux qui demandent 20 minutes de concentration. Le format doit coller à ce moment d'usage réel.

---

## 6. Génération de niveaux — mécanique retenue

**Niveaux illimités, génération procédurale côté client.**

Principe : générer une grille candidate (forme + régions colorées + contrainte de mouvement) → vérifier qu'elle admet **une solution unique** → si invalide (0 ou plusieurs solutions), régénérer jusqu'à obtenir un niveau validé comme "sain".

**Point technique à anticiper** : la vérification d'unicité de solution (backtracking / CSP) peut devenir coûteuse en calcul selon la taille de grille et la complexité des contraintes combinées (formes non carrées + mouvements échecs). Pour éviter de bloquer le thread principal et geler l'UI pendant la génération :
- Faire tourner le solveur/générateur dans un **Web Worker**, invisible pour l'utilisateur.
- Prévoir un indicateur de chargement léger si la génération dépasse quelques dizaines de ms (cas des grilles complexes).

---

## 7. Distribution / découverte

- **Canal principal retenu** : réseaux sociaux dev (LinkedIn, X/Twitter, Bluesky) où Baptiste est déjà présent en tant que développeur.
  - Réaliste pour du feedback et une première communauté de niche (autres devs, early adopters).
  - ⚠️ Ne pas s'attendre à une croissance virale de masse par ce canal — c'est un point de départ, pas une stratégie de scale.
- **Pas d'App Store** : cohérent avec le choix PWA.
- Canal à envisager plus tard si besoin de volume : contenu vidéo court (TikTok/Reels) montrant le gameplay des formes de grille non carrées, visuellement très partageable.

---

## 8. Plan de validation (approche retenue)

**Priorité absolue : MVP centré sur la grille/gameplay, avant tout développement de landing page.**

1. Prototyper la mécanique de grille (formes non carrées + contraintes échecs) — valider que c'est fun avant d'aller plus loin.
2. Tester sur un petit groupe (entourage) pour confirmer que c'est plus engageant que Queens standard.
3. Une fois le gameplay validé : développer la PWA complète (progression, sauvegarde Supabase).
4. Seulement après : travailler la landing page et la stratégie SEO (section 3).

---

## 9. Questions ouvertes / à trancher plus tard

- [ ] Modèle de financement si le jeu scale au-delà des quotas gratuits (Supabase/Vercel Pro) — pas de pub/paiement in-app au lancement ; si scale, communiquer ouvertement sur le besoin de financement le moment venu
- [ ] Choix final de l'outil SEO pour la LP (vite-plugin-seo-prerender vs React Router v7 Framework Mode vs Astro séparé)
- [x] Nom de marque : **Pawzzle** — décision finale de Baptiste. Risque de confusion accepté vu la stratégie de distribution (PWA + réseaux dev, pas de recherche organique store). Reste à vérifier : dispo des handles réseaux sociaux.
- [x] Mécanisme "croquettes" clarifié : **budget d'erreur** (nombre limité d'erreurs autorisées avant échec du niveau), pas un système d'indice/hint. Décision actée le {date de cette session}.
- [x] Nombre de niveaux : **illimité**, génération procédurale côté client (voir section 6 — mécanique de génération)
- [ ] Courbe de progression (fréquence d'introduction de nouvelles formes/contraintes)
