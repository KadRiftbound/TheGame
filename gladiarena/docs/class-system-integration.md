# SYSTÈME DE CLASSES - INTÉGRATION MONDE, GUILDES ET UX

Ce document décrit comment le système de classes s'intègre avec l'écosystème du jeu : zones secrètes, factions, guildes, reliques, et feedback joueur.

---

## 1. INTÉGRATION MONDE

### 1.1 Zones secrètes et zones cachées

Le monde contient des zones qui ne sont pas visibles sur la carte principale. Elles se débloquent via des conditions spécifiques.

| Zone | Localisation | Condition déblocage | Classes accessibles |
|------|-------------|---------------------|---------------------|
| Faille de l'Ombre | (5, 1) - coordonneesCachees | Mourir 3 fois dans n'importe quelle zone | Danse-lame du Néant |
| Cathédrale Effondree | (1, 1) - zoneCachee | Explorer la Foret Sacree de nuit | Oracle Aveugle |
| Ruines Oubliees | (2, 1) - zoneCachee | Trouver 10 coffres secrets | Marcheur des Ruines |
| Néant Entre Deux | (3, 1) - zoneCachee | Avoir 90% fire resist | Porteur de la Première Flamme |
| Tombeau Antique | (4, 0) - visible but hidden | Niveau 40+, défaite du boss | Gardien des Tombes |

**Mécaniques de decouverte:**
- Les zones secrètes NE SONT PAS visibles sur la carte
- Quand un joueur découvre une zone secrete → notification
- La zone devient accessible pour TOUS les joueurs (mais les conditions restent secrete)
- Lesmonde génère des "rumeurs" dans le chat quand une zone secrete est découverte

### 1.2 Sanctuaires

Les sanctuaires sont des points speciaux dans le monde où les joueurs peuvent:
- Boudier pour obtenir des classes rares
- Faire des offrandes pour modifier leur alignment
- Schercher des conseils (condition pour Oracle Aveugle)

| Sanctuaire | Zone | Classes liées |
|------------|------|---------------|
| Sanctuaire de l'Ombre | Faille de l'Ombre | Danse-lame du Néant |
| Autel de la Lumière | Cathédrale Effondree | Oracle Aveugle, Nécromancien Blanc |
| Crypte des Rois | Tombeau Antique | Gardien des Tombes |
|Creux du Dragon | Volcan | Héritier du Dragon |

### 1.3 Reliques et objets uniques

Les reliques sont des objets specials qui peuvent debloquer des classes ou modifier leur pouvoir.

| Relique | Effet | Condition trouver |
|---------|-------|-------------------|
| Oeuf noir du Dragon | Déclenche la quete de l'Héritier du Dragon | Zone secrete du volcan |
| Livre de la 13e Voie | Déclenche Tisseur de Destin | Bibliothèque cachee (zone 5+) |
| Masque du Roi Voleur | Permet Voleur Tempête boosté | Coffre legendary zone 3+ |
| Coeur de Cendre | Active le mode "berserker" | Boss du volcan (drop rare) |

---

## 2. SYSTÈME DE FACTION ET RÉPUTATION

### 2.1 Factions principales

| Faction | Rôle | Classes favorisées | Réputation nécessaire |
|---------|------|-------------------|---------------------|
| Ordre du Soleil | Guerriers sacrés | Paladin, Sacricole | +50 |
| Guilde des Voleurs | Criminalité | Voleur Tempête, Assassin | +30 criminel |
| Confrérie des Mages | Arcanes | Sorcier, Elementaliste | +40 |
| Les Exilés | Rejetés du système | Classes maudites | -50通用 |
| Cercle des Morts | Nécromancie | Nécromancien Blanc, Gardien | +30 |

### 2.2 Système d'alignment

Chaque personnage a trois axes invisibles:

| Axis | Description | Range | Effet |
|------|-------------|-------|-------|
| Corruption | Tendance au mal | -100 a +100 | +100: Acces aux classes obscure |
| Pureté | Tendance au bien | -100 a +100 | +80: Acces aux classes sacrées |
| Chaos | Imprévisibilité | -100 a +100 | +60: Acces aux classes uniques |

**Calcul de l'alignment:**
- Tuer un monstre: +1 pureté
- Tuer un joueur innocent: +30 corruption
- Refuser une offrande: +5 pureté
- Voler: +10 corruption
- Aider un joueur en difficulté: +5 pureté
- Trahir un allié: +20 chaos

---

## 3. SYSTÈME DE GUILDES

### 3.1 Classes spécifiques aux guildes

Certaines classes ne peuvent être obtenues qu'en tant que leader d'une guilde:

| Classe | Condition | Bonus | Contrepartie |
|--------|-----------|-------|---------------|
| Empereur des Ombres | Etre #1 guilde niveau max | Summon massif de membres | Guilde devient cible de guerre |
| Architecte de Guilde | Construction 10 batiments | Bonus de guilde +50% | Ne peut pas rejoindre d'autre guilde |
| Héraut de la Guilde | 100 membres sous ses ordres | Communication étendue | Ne peut pas quitter la guilde |

### 3.2 Classes incompatibles avec les guildes

| Classe | Raison |
|--------|--------|
| Exécuteur Sans Nom | Hors-la-loi, ne peut pas créer/rejoindre guilde |
| Porteur de la Première Flamme | Consommation, ne peut pas se coordonner |
| Fantôme Errant | Ne peut pas être membre permanent |

---

## 4. INTÉGRATION COMBAT ET ARÈNE

### 4.1 Bonus de classe spécifiques au combat

| Classe | Bonus PvE | Bonus PvP | Faiblesse |
|--------|----------|-----------|-----------|
| Mirmillon | +20% DEF vs mobs | +10% survivabilité | -10% degats |
| Assassin | +50% CRIT vs mobs | +30% burst | -30% DEF |
| Danse-lame du Néant | +40% ATK | +25% execute | Cannot flee |
| Gardien | +100% aggro | - | -50% degats |
| Oracle Aveugle | +20% foresight | +15% dodge | Ne peut pas porter d'arme |

### 4.2 Arène et classement

- Le système de classes affecte le matchmaking
- Classes tank: matched contre plus de DPS
- Classes DPS: matched contre plus de tanks
- Classes rares: matched contre classes similaires

---

## 5. SYSTÈME D'EXPLORATION ET DÉCOUVERTE

### 5.1 Types de découverte

| Type | Description | Exemples |
|------|-------------|----------|
| Zone secrete | Nouvelle zone sur la carte | Faille de l'Ombre |
| Coffre cache | Objet dans une zone existante | Coffres dans les murs |
| PNJ cache | Personnage non-visible | Marchands noirs, devs secrets |
| Classe secrete | Classe non-affichée | Toutes les classes rares |
| Relique | Objet unique | Oeuf de dragon |
| Quete secrete | Quete non-listée | Défi du Moine |

### 5.2 Mécaniques de découverte

**Zones caches:**
- Appears after condition met (tracker value)
- Notification: "Vous sentez une présence..."
- Revealed on map after first visit

**Classes secretes:**
- Unlock hint appears at 50% progress
- Full reveal when 100% conditions met
- Player must take action to unlock

**Objets caches:**
- Some require specific class abilities
- Some require specific items (relics)
- Some are purely aléatoires

---

## 6. UX ET FEEDBACK JOUEUR

### 6.1 Ce que le joueur voit

**Interface visible (UI):**
- Menu classes: Base classes + Advanced (niveau 15+)
- Description courte de chaque classe
- Stats de base (ATK, DEF, HP, etc.)
- Barre de progression vers spécialisation

**Indicateurs visuels:**
- Icône de classe avec couleur selon rarete
- Badge "Secret" ou "?" pour classes cachees decouvertes
- Effet visuel spécial pour classes uniques

**Notifications:**
- "Une nouvelle voie s'offre à vous..." (classe debloque)
- "Vous sentez une présence..." (hint de classe secrete)
- "Les murmures des morts vous appellent..." (zone secrete trouvee)

### 6.2 Ce que le joueur ne voit pas

**Totalement cache:**
- Trackers de deblocage (compteurs)
- Progression exacte vers les classes secrete
- Conditions completes de deblocage
- Autres joueurs ayant debloqué des classes secrete
- Evenements server-side qui declenchent des opportunites

**Partiellement visible:**
- Hints cryptiques (ex: "Ceux qui meurent trois fois...")
- Zones inhabituelles sur la carte
- PNJs qui ne parlent qu'a certains types de personnages

### 6.3 Indices et suggestions

**Hints visuels:**
- Zones avec description inhabituelle
- PNJs avec dialogues varies selon classe
- Objets avec descriptions "Vous sentez qu'il y a plus..."

**Hints textuels (chat du jeu):**
- "On dit que dans lesCarrieres, certains ont trouvé..."
- "Un joueur aurait decouvert une tombe secrete..."
- "Les voleurs racontent qu'il y a un raccourci..."

**Indices de progression:**
- Systeme de "rumeur": Plus un joueur fait une action, plus les autres entendent parler
- Classement "decouvertes" anonymes dans le chat

### 6.4 Affichage des classes rares/uniques

**Sur le profil:**
- Icône speciale (bordure dorée pour legendary, noire pour maudit)
- Texte "Classe secrete" a la place de la description
- Compteur de personnages serveur avec cette classe (anonyme)

**Dans les combats:**
- Indicateur visuel special (effet de particules)
- La classe n'apparait pas dans le tooltip public

**Dans le chat:**
- Pas de display de la classe secrete
-只能是 "Classe: Inconnu" ou "Classe: Guerrier"

---

## 7. ÉVÉNEMENTS ET RUMEURS SERVER

### 7.1 Événements automatiques

| Événement | Déclencheur | Effet |
|-----------|-------------|-------|
| Premiere découverte de classe unique | Premier joueur | Announcement server |
| Zone secrete découverte | Premier joueur | Notification a tous |
| Classe legendary debloquee | Joueur | Message dans chat |
| Record de déconverte | Joueur | Classement serveur |

### 7.2 Rumeurs système

Les rumeurs sont des messages générés automatiquement dans le chat:

**Rumes generales:**
- "Quelqu'un aurait trouvé un raccourci dans lesMarais..."
- "On parle d'un nouveau type d'ennemi dans leVolcan..."
- "Un joueur aurait trouve une zone cachee..."

**Rumes specifiques (quand qq'un decoouvre):**
- "Un hero a decouvert la Faille de l'Ombre!"
- "On dit qu'un voleur a amasse une fortune..."
- "Les morts murmurent le nom de..."

### 7.3 Chat et interactions sociales

- Les classes secretes ne sont pas visibles dans les profils publics
- Seulement indication "Classe: Inconnu" ou "Classe: Secret"
- Les classes uniques ont un indicateur special mais pas de nom
- Possible de voir "Joueur tres special" si classe unique

---

## 8. LIVE OPS ET ADMINISTRATION

### 8.1 Outils admin

**Dashboard de gestion:**
- Voir nombre de chaque classe debloquee
- Voir liste des joueurs avec classes secretes
- Voir progression des trackers (anonymise)
- Ajouter/retirer manuellement des classes

**Contrôle des classes:**
- Activer/desactiver des classes pour maintenance
- Rotation saisonniere des classes uniques
- Ajout de nouvelles classes en live

**Équilibrage:**
- Ajuster les seuils de deblocage
- Nerfer/buff certaines classes
- Ajouter des contreparties

### 8.2 Événements spéciaux

| Type | Description | Impact classes |
|------|-------------|----------------|
| Saison thématique | Nouvel objectif de jeu | Nouvelles classes accessibles temporairement |
| Anniversaire serveur | Bonus特殊 | Boost progressionclasses secrete |
| Compétition serveur | Classement spécial | Classes bonus pour winners |
| Event weekend | Boost activity | Double chance de decoouvrir |

### 8.3 Monitoring

**Métriques a suivre:**
- Nombre de classes secretes debloquees par jour
- Temps moyen pour debloquer chaque classe
- Distribution des classes sur le serveur
- Nombre de "impossible" classes (jamais debloquees)

**Alertes:**
- Si une classe devient trop commune → adjust
- Si une classe est impossible → adjust
- Si exploitation detectée → ban

---

## 9. INTÉGRATION AVEC LE RESTE DU JEU

### 9.1 Écran personnage

- Affichage de la classe actuelle + origine
- Indicateur de progression vers specialisation
- Bouton "Changer de classe" (si eligible)
- Badge special pour classes secretes

### 9.2 Écran mission/exploration

- Zones cachees apparaissent commeDecouvrables
- Indicateur de progression secrete
- Missions speciales pour classes secretes

### 9.3 Écran donjon

- Bonus de certaines classes en donjon
- Synergies entre classes dans les groupes

### 9.4 Écran arène

- Matchmaking base sur la classe
- Bonus/malus selon classes

### 9.5 Écran guilde

- Classes специфические guilde (leader only)
- Statut de guilde affecte certaines classes
- Classes несовместимые avec guildes indicated

### 9.6 Écran marché

- Prix varies selon classe (Voleur Tempête, Exécuteur)
- Objets специфиiques classes affiche

---

## 10. GESTION DES ERREURS ET EXPLOITS

### 10.1 Prevention des exploits

**Anti-grind:**
- Les trackers sont проверяемы sur le long terme
- Impossible de farmer les conditions (ex: mort 100x)
- Les conditions combinent plusieurs facteurs

**Anti-bug:**
- Double-vérification des conditions
- Log de toutes les décisions de déblocage
- Possibilité de rollback manuel

**Anti-cheat:**
- Détection des patterns inhabituels
- Alerte admin si trop de déblocages rapides

### 10.2 Gestion des erreurs

- Si une classe est accidentellement assigned: rollback possible (admin)
- Si un joueur trouve un bug de conditions: reward + fix
- Si une classe devient trop puissante: hotfix possible

### 10.3 Communication

- Les players ne savent pas pourquoi ils ont recu une classe
- Message genérique: "Vous avez découvre une nouvelle voie!"
- Pas de details sur les conditions