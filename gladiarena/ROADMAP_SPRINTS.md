# GladiArena — Roadmap d'implémentation (S1/S2/S3)

> Objectif: transformer la base actuelle en expérience MMORPG-like lisible, addictive et mesurable.

## Principes de planification

- **Priorité 1**: boucle joueur claire (ville → préparation → expédition → retour)
- **Priorité 2**: motivation sociale visible (titres, chroniques, réputation)
- **Priorité 3**: itération rapide via instrumentation produit

---

## Sprint S1 (1 semaine) — Stabilisation de la boucle core

### Résultat attendu
Une session de 10-15 minutes est compréhensible sans tutoriel: le joueur sait quoi faire, pourquoi, et ce qu'il a gagné.

### Backlog Frontend

1. **Refactor de la page `/game` en sections modulaires**
   - Extraire des sections (ou composants) dédiées:
     - `GameCityPanel`
     - `GameCombatPanel`
     - `GameProgressPanel`
     - `GameSocialPanel`
   - But: réduire la complexité cognitive et accélérer les futures itérations.

2. **Barre de progression toujours visible**
   - Afficher en permanence:
     - niveau/XP
     - titre actif
     - objectif quotidien simple (ex: “1 record chronique aujourd'hui”).

3. **Amélioration lisibilité des retours action**
   - Sur combat/exploration: un bloc de résumé standardisé (XP, or, loot, progression quête, impact réputation).

### Backlog Backend

1. **Standardiser les réponses API gameplay**
   - Normaliser les payloads retour (format commun `success`, `summary`, `rewards`, `updates`).

2. **Titres: nettoyage et cohérence des définitions**
   - Corriger les incohérences d'IDs/naming et harmoniser les libellés.

### Backlog Game Design

1. **3 objectifs quotidiens MVP**
   - Exemples:
     - “Terminer 2 expéditions”
     - “Découvrir 1 micro-zone”
     - “Faire 1 action de faction”

### Critères d'acceptation S1

- Le joueur peut enchaîner la boucle complète en < 3 clics depuis la ville.
- Les gains de session sont visibles en un seul endroit.
- Aucune incohérence de titres/labels critiques.

---

## Sprint S2 (1-2 semaines) — Illusion MMORPG tangible

### Résultat attendu
Le joueur ressent un monde “partagé” et veut revenir pour battre des records et afficher son statut.

### Backlog Frontend

1. **Écran Chroniques enrichi**
   - Filtres: `Boss`, `Exploration`, `Coffres`
   - Périodes: `24h`, `7j`, `Tout`
   - Mise en avant des “premiers” récents.

2. **Hub ville orienté préparation**
   - Panneau “Prépare ton run”:
     - danger zone
     - recommandations
     - marchand pertinent
     - temps de trajet.

3. **Affichage social minimal**
   - Badge de titre visible dans les zones clés de l'UI.
   - Encart “activité récente du serveur” (3 derniers événements).

### Backlog Backend

1. **Chroniques: endpoints de classement temporel**
   - Ajout de paramètres robustes (`type`, `window`, `limit`) + tri optimisé.

2. **Réputation/factions: payload explicite**
   - Retourner “avant/après” + rang + prochain palier.

3. **Primes: statuts normalisés**
   - `active`, `claimed`, `expired`, `cancelled` pour simplifier l'UI.

### Backlog Game Design

1. **Récompenses de statut**
   - Titre/insigne pour records hebdomadaires.

2. **Conflits légers entre factions**
   - Bonus/malus temporaires simples par ville/zone.

### Critères d'acceptation S2

- Les chroniques deviennent une destination de navigation principale.
- Le joueur comprend immédiatement l'impact réputation/primes.
- Le hub ville donne une vraie sensation de “base d'opérations”.

---

## Sprint S3 (2 semaines) — Rétention & pilotage produit

### Résultat attendu
Le jeu est piloté par métriques et non intuition seule; les boucles hebdo sont en place.

### Backlog Data / Produit

1. **Instrumentation d'événements produit**
   - Tracer au minimum:
     - `session_start`
     - `expedition_started`
     - `expedition_finished`
     - `title_unlocked`
     - `chronicle_first_recorded`
     - `faction_reputation_changed`

2. **KPI dashboard MVP**
   - J1, J3, J7
   - temps vers 1er titre
   - taux de retour après 1er record chronique

3. **Expérimentation A/B légère**
   - Variante A: call-to-action centré chroniques
   - Variante B: call-to-action centré réputation

### Backlog Gameplay

1. **Boucles hebdomadaires**
   - Défis reset hebdo avec récompense de statut.

2. **Classements saisonniers simplifiés**
   - Top explorateurs / top chasseurs / top réputation.

### Critères d'acceptation S3

- Les KPI de rétention sont visibles et exploitables.
- Au moins 1 boucle hebdo live.
- Capacité à prioriser S4 sur données réelles.

---

## Risques & mitigation

- **Risque**: complexité front trop centralisée.
  - **Mitigation**: extraction modulaire dès S1.

- **Risque**: features sociales présentes mais peu lisibles.
  - **Mitigation**: surfaces UI dédiées + wording clair.

- **Risque**: accumulation de features sans impact mesuré.
  - **Mitigation**: instrumentation S3 obligatoire.

---

## Définition de Done globale

- Le joueur comprend en < 2 minutes la boucle principale.
- Le joueur voit son statut social évoluer (titres/chroniques/réputation).
- L'équipe peut prioriser le prochain sprint avec des métriques fiables.
