# Recherche skills — contenu social Instagram (carrousel + mini-vidéo)

Objectif à terme : générer du contenu Instagram (carrousels + mini-vidéos) avec
un skill capable de **proposer des idées** ET de **juger/noter le contenu**
avant publication. Recherche menée sur le web + skills.sh + CLI `npx skills
find`. Discussion à reprendre plus tard, rien d'installé pour l'instant.

Voir aussi `docs/instagram-video-ideas.md` (brainstorm de formats déjà produit,
indépendant de cette recherche de skill).

---

## Constat principal

**Aucun skill ne fait carrousel + mini-vidéo + proposition + jugement en un
seul package.** Le paysage se divise en deux familles distinctes :

1. Skills qui **génèrent réellement des visuels** (carrousel PNG, ou
   revendiquent couvrir les reels) — mais sans étape de jugement/critique.
2. Skills qui **proposent et jugent le texte** (idées, hooks, captions,
   scripts) — mais ne produisent aucun visuel.

Il faut donc combiner deux skills (ou un skill texte + les outils vidéo déjà
présents dans l'environnement).

---

## Recommandation retenue : suite Blotato

**`blotato-inc/blotato-skills`** — la seule suite trouvée qui répond
directement au besoin "proposer ET juger" :

| Skill             | Rôle                                                                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content-coach`   | Point d'entrée : de "j'ai rien à poster" → post planifié, orchestre les autres skills (brand-brief → ideation → post-writer → post-grader → post-scheduler) |
| `brand-brief`     | Capture la voix/marque une fois, réutilisée partout                                                                                                         |
| `post-writer`     | Rédige le post/caption/script adapté à la plateforme                                                                                                        |
| **`post-grader`** | 🔑 Juge le brouillon — note sur 10, liste précisément les 3 corrections à faire. Barème dur : 7=bon, 8=solide, 9=quasi parfait, 10=n'existe pas             |
| `repurpose`       | Transforme un article en une semaine de contenu multi-format                                                                                                |
| `viral-hooks`     | Bibliothèque de 100 frameworks d'accroche                                                                                                                   |
| `post-scheduler`  | Publication via Blotato (optionnel, MCP `mcp.blotato.com/mcp`)                                                                                              |

**Installation (plugin complet) :**

```
/plugin marketplace add Blotato-Inc/blotato-skills
/plugin install blotato@blotato-skills
```

**Ou install ciblé (2 skills seulement, propose + juge) :**

```
npx skills add https://github.com/blotato-inc/blotato-skills --skill content-coach
npx skills add https://github.com/blotato-inc/blotato-skills --skill post-grader
```

**Points positifs :**

- Aucune clé API requise pour proposer/juger (Blotato MCP optionnel, uniquement pour la planification auto)
- Audits sécurité **PASS** (Gen Agent Trust Hub, Socket, Snyk)
- Dépôt officiel de la société Blotato, 39 ⭐ GitHub

**⚠️ Point de vigilance :** seulement **2 installs** au moment de la recherche
(2026-07-28), skill vu pour la première fois il y a 12 jours — sous le seuil
de confiance habituel du protocole `/find-skills` (1K+ installs). Contrebalancé
par le fait que c'est un dépôt officiel d'un vendor niche, pas un skill
communautaire anonyme.

**Limite structurelle :** skills **texte uniquement** (idées, hooks, captions,
scripts) — pas de génération de visuels.

---

## Pour la partie visuelle

### Carrousel Instagram

**`marcolang/marketing-skills@instagram-carousel`** — meilleur candidat trouvé :

- Génère un HTML swipeable (cadre Instagram, viewport 420×525) puis exporte
  chaque slide en PNG 1080×1350 via Playwright
- **Aucune clé API** requise, tout en local (images converties en base64)
- Install : `npx -y skills add marcolang/marketing-skills --skill instagram-carousel --agent claude-code`

Alternatives écartées :

- `inferen-sh/skills@social-media-carousel` — nécessite un CLI externe payant (`inference.sh`)
- `eachlabs/skills@instagram-content-generation` — couverture floue (annonce reels/carrousels mais pas de preuve de génération réelle vs juste du formatage)
- `blitzreels/agent-skills@blitzreels-carousels-instagram` — wrapper léger (guidelines de zones mortes uniquement), 38 installs, audit "WARN" sur Gen Agent Trust Hub

### Mini-vidéo / Reels

**Aucun skill dédié trouvé qui génère réellement la vidéo** — les suites
comme `sergebulaev/instagram-skills` (9 skills : captions, hooks, hashtags,
planning) ne produisent que du texte ; le _Hook Extractor_ analyse des reels
viraux existants mais n'en crée pas.

→ Le projet a déjà **`hyperframes`** + **`media-use`** installés dans
l'environnement Claude Code, capables de produire de vraies vidéos (composition
HTML → rendu réel) en 9:16. Pas besoin d'un skill externe pour ça.

---

## Skills écartés (jugés hors-sujet ou moins pertinents)

- `postplusai/postplus-skills@instagram-content-benchmark` — analyse des
  comptes/contenus **concurrents** pour en extraire des patterns, ne juge pas
  le contenu qu'on veut soi-même publier
- `langchain-ai/deepagents@social-media` (2.3K installs, 26.9K ⭐) — généraliste,
  nécessite un agent chercheur en amont, pas de fonction de jugement ni de
  ciblage Instagram spécifique
- `svenja-dev/claude-code-skills@social-media-content` — LinkedIn uniquement
- `brianrwagner/ai-marketing-claude-code-skills@content-idea-generator` — bon
  mécanisme d'auto-critique (Phase 4/5) mais couvre LinkedIn/Twitter/newsletter,
  pas Instagram
- `coreyhaines31/marketingskills@social-content` — couvre Instagram nativement
  mais sans étape de jugement formalisée

---

## Prochaine étape (à la reprise)

1. Décider : installer `content-coach` + `post-grader` malgré le faible
   nombre d'installs, ou attendre que le skill mûrisse
2. Si installé : tester le flux complet sur un brouillon de post Pawzzle
   réel et voir si le barème de notation est pertinent pour le ton "chill/zen"
   du jeu (voir lore dans `docs/instagram-video-ideas.md`)
3. En parallèle, installer `marcolang/instagram-carousel` pour prototyper un
   premier carrousel (règles du jeu ou lore du village)
