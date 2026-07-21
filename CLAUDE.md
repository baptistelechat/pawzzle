## 💻 Pawzzle

Jeu de puzzle logique inspiré de Queens (LinkedIn) : placer un élément unique par ligne, colonne et région colorée, sans contact entre deux éléments adjacents. Distribution prévue en PWA, hors stores.

### Stack technique

- **Langage** : TypeScript
- **Framework** : Vite + React (SPA pure, pas de SSR)
- **Styling** : Tailwind CSS + shadcn/ui
- **Base de données** : Supabase (Postgres, Auth, Edge Functions — free tier)
- **Déploiement** : Vercel (plan Hobby, usage non-commercial tant que le jeu n'est pas monétisé)

### Architecture

Le jeu est un état d'application (pas de contenu à indexer) ; les pages vitrine (accueil, règles, à propos) ont un enjeu SEO séparé, stratégie à trancher plus tard (React Router v7 pré-rendu, ou Astro pour la LP).

### Conventions importantes

- MVP volontairement minimal : clone strict de Queens (grille carrée, 3 règles de base) avant toute innovation de gameplay — objectif : valider moteur de règles + algorithme de génération.
- Vigilance plan Free/Hobby : pause Supabase après 7j d'inactivité, cap dur Vercel sans overage payant.
