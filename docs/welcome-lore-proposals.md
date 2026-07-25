# Propositions de lore — modal de bienvenue

Contrainte : pas de thème "feutrine/couture" (forcerait une refonte visuelle). Le
thème doit coller au design déjà en place — chats, régions colorées, cases
squircle, palette pastel "Atelier Feutrine" — sans l'expliciter comme un
univers de fil et d'aiguille.

Choisis une direction (ou pioche une phrase dans plusieurs) : titre + lore
(2-4 phrases) + rappel des 3 règles en une ligne, à afficher au-dessus de
"Comment jouer" (gestes tap/appui long, section déjà en place).

---

## A — Village de chats

**Titre** : Bienvenue à Pawzzle

**Lore** : Dans ce village, chaque chat a sa couleur de quartier préférée —
et déteste avoir un voisin trop collé. Aide chacun à trouver sa propre rue,
sans jamais croiser la moustache d'un autre.

**Rappel règles** : Un chat par ligne, par colonne, par quartier coloré —
et jamais deux voisins.

**Ton** : cosy, un peu enfantin, sans emphase.

---

## B — Chasse au territoire (façon jeu de stratégie léger)

**Titre** : Chacun son territoire

**Lore** : 6 chats, 6 couleurs, une seule loi : pas de voisin direct. Place
chaque chat dans sa zone, sans jamais qu'il touche un autre — même du bout
de la patte.

**Rappel règles** : Un chat par ligne, par colonne, par couleur. Zéro contact.

**Ton** : punchy, direct, orienté "règle du jeu" plus que narratif.

---

## C — Conte très court

**Titre** : Il était une fois, six chats...

**Lore** : ...qui rêvaient chacun d'une couleur bien à eux. Mais les chats
sont fiers : jamais deux ne veulent se frôler. À toi de leur trouver une
place où chacun règne seul — sur sa ligne, sa colonne, sa couleur.

**Rappel règles** : Un par ligne. Un par colonne. Un par couleur. Jamais côte
à côte.

**Ton** : storybook, 3e personne, un peu plus long.

---

## D — Minimal / poétique

**Titre** : Pawzzle

**Lore** : Six chats. Six couleurs. Une seule règle : jamais l'un contre
l'autre. Trouve leur place.

**Rappel règles** : _(fondu dans le lore lui-même, pas de ligne séparée)_

**Ton** : très court, atmosphérique, laisse la section "Comment jouer" faire
le travail d'explication.

---

## E — Pas de lore, juste une intro friendly

**Titre** : Bienvenue dans Pawzzle 🐾

**Lore** : Place un chat par ligne, par colonne et par couleur — et ne
laisse jamais deux chats se toucher, même en diagonale. C'est tout le jeu.

**Rappel règles** : _(déjà inclus ci-dessus)_

**Ton** : zéro fiction, pure explication sympathique. Le plus proche de ce
qu'affichait `RulesDialog` déjà.

---

## Prochaine étape

Une fois une direction choisie (ou un mix), j'intègre le texte dans
`src/components/WelcomeDialog.tsx` à la place du paragraphe actuel.
