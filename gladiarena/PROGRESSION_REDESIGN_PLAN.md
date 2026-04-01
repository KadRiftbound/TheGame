# GladiArena - Refonte de la Progression et du Système de Jeu

> **Document de Design Système - Progression & Économie**
> Version 1.0 | Priorité: Refonte Complète

---

## BLOC 1 — Diagnostic de Refonte

### 1.1 Pourquoi l'ancien modèle centré niveau/énergie/stats est problématique

| Problème | Impact | Cause racine |
|----------|--------|--------------|
| Level = Verrou | Le joueur est bloqué s'il n'a pas le niveau | Level minimum sur les zones |
| Level = Puissance | Plus de level = plus fort de façon linéaire | Stats liées au niveau |
| Énergie = Farm limité | Le joueur arrête de jouer quand énergie vide | Système d'énergie abstrait |
| Stats par level up | Progression automatique et linéaire | Distribution de points à chaque niveau |
| Pas de conséquence | Risque nul = pas de tension | Les zones sont juste des "level caps" |

**结论**: Le jeu actuel est un RPG classique avec level gating, pas un MMORPG dangereux.

### 1.2 Pourquoi le nouveau modèle sert mieux un faux MMORPG web

| Bénéfice | Mécanisme | Sentiment joueur |
|----------|-----------|------------------|
| Monde ouvert | Toutes zones accessibles | "Je peux aller partout si je veux" |
| Préparation > Level | Dangers basés sur composition, pas level | "Je dois être malin, pas juste grind" |
| Attrition | Les PV sont la vraie ressource | "Je dois gérer mes soins, pas mon énergie" |
| Économie = Progression | Stats achetable avec or | "Je choisis comment progresser" |
| Multi-couches | Équipement + titre + réputation + reliques | "Chaque système compte" |

### 1.3 Systèmes existants impactés

| Système | Statut après refonte | Action requise |
|---------|---------------------|----------------|
| Zones (level min) | 🔴 Supprimer | Modifier API zones, UI |
| Personnage (level) | 🟡 Garder mais changer rôle | Rework affichage, формула XP |
| Stats (force, etc.) | 🟡 Garder mais +achetable | Ajouter shop de stats |
| Énergie | 🔴 Supprimer | Remplacer par système PV |
| Combat | 🟡 Adapter | Ajouter résistances, types |
| Inventaire/Équipement | 🟢 Garder | Aucune action |
| Titres | 🟢 Garder | Aucune action |
| Réputation | 🟢 Garder | Aucune action |
| Factions | 🟢 Garder | Ajouter bonus de zone |

### 1.4 Risques produit/UX

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Joueur se sent puni | Haute | Tutoriel, signaux clairs, recovers easy |
| Plus de grind nécessaire | Moyenne | сделать préparation rewarding |
| Économie cassée (riches win) | Moyenne | Limites, rendements décroissants |
| Confusion UX | Haute | UI clara, tooltips, signals visuels |
| Migration douloureux | Haute | Phases, backward compatibility |

### 1.5 Bénéfices attendus

| Horizon | Bénéfice |
|---------|----------|
| Early (J1-J7) | Découverte, expérimentation, choix |
| Mid (J7-J30) | Multi-couches, spécialisation, guilde |
| Long (J30+) | Puissance variée, économie riche, World first |

---

## BLOC 2 — Principes Fondamentaux à Respecter

### 2.1 Règles de Design (Contrat)

```
RÈGLE #1: Niveau = Indicateur, pas Puissance
────────────────────────────────────────────
- Affiche la "xpérience" du joueur
- NE donne PAS de bonus de stats automatique
- NE verrou PLUS le contenu
- Sert pour: signaux visuels, prérequis secondaires, lisibilité

RÈGLE #2: Toutes Zones Accessibles
──────────────────────────────────
- Pas de level minimum pour entrer
- Voyage prend du temps réel
- Danger = composition + attrition, pas "trop fort pour vous"
- Le joueur peut tenter toute zone s'il accepte le risque

RÈGLE #3: Difficulté Réelle des Zones
───────────────────────────────────────
- Chaque zone a une identity de danger
- Paramètres: composition, résistances, statuts, attrition
- Punit les builds inadaptés
- Récompense la préparation

RÈGLE #4: Attrition par PV
───────────────────────────
- Les PV sont la vraie ressource limitante
- Soins = récupération, pas farm infini
- Le joueur prudent gagne plus longtemps

RÈGLE #5: Économie = Moteur de Progression
───────────────────────────────────────────
- Stats augmentables via or
- Créer des sinks monétaires forts
- Permet des arbitrages de build

RÈGLE #6: Multi-Couches de Puissance
────────────────────────────────────
- Équipement + Affixes + Reliques + Titres + Réputation + Bénédictions + ...
- La puissance vient d'un ensemble, pas d'une seule source
```

---

## BLOC 3 — Refonte du Système de Niveau

### 3.1 À quoi sert encore le niveau

| Fonction | Description | Raison |
|----------|-------------|--------|
| Signal visuel | Affiche "Nv. 15" pour que les autres voient votre progression | Lisibilité sociale |
| Palier de déblocage | Certains titres/classes/bénédictions nécessitent un niveau minimum | Progression cohérente |
| Calcul de difficulté | Zone "Nv. 推荐 20" comme signal, pas verrou | Aider le joueur |
| Tier des items | Item level basé sur level du joueur | Équipement approprié |

### 3.2 À quoi il ne sert plus

| Ancienne fonction | Nouvelle fonction |
|--------------------|-------------------|
| +Stats à chaque level | Statsachetables via or |
| Verrou de zone | Voyage libre, danger réel |
| Puissance linéaire | Multi-couches |
| Source principale de difficulté | Difficulté via composition/attrition |

### 3.3 Nouveau système XP/Level

```
FORMULE XP POUR MONTER DE NIVEAU:
================================
xpToNextLevel = 50 * (niveau ^ 1.5)

Niveau 1 → 2:   50 XP
Niveau 5 → 6:   279 XP  
Niveau 10 → 11: 790 XP
Niveau 20 → 21: 4472 XP
Niveau 30 → 31: 13891 XP

COMBAT REWARDS:
==============
- XP会根据敌人类型和危险程度变化
- Boss: +50% XP bonus
- Zone dangereuse: +25% XP bonus
- Victoire sans soin: +10% XP bonus (prudent)

MONTÉE DE NIVEAU:
=================
- +5% HP max (minor)
- +1 point de titre possible (pour display social)
- Pas de stats automatiques
```

### 3.4 Articulation niveau / autres systèmes

```
PUISSANCE TOTALE = Σ(
  Stats de base (achetables),
  Équipement + affixes,
  Bonus de classe,
  Bonus de titre,
  Bonus de réputation,
  Bonus de relique,
  Bonus d'événement,
  Bonus de bénédiction
)

Le niveau N'EST PLUS dans cette formule!
```

---

## BLOC 4 — Système de Zones Accessibles mais Dangereuses

### 4.1 Paramètres de danger d'une zone

```typescript
interface ZoneDangerProfile {
  // Composition敌人
  enemyCount: number,        // Nombre moyen d'ennemis
  eliteRatio: number,        // Ratio d'élites (0-1)
  bossPresent: boolean,
  spawnRate: number,        // Vitesse de respawn
  
  // Dangers systémiques
  damageType: DamageType,    // Physical, Fire, Ice, Poison, Chaos
  hasEnvironmentalHazards: boolean,
  hasCorruption: boolean,    // Corruption progressive
  hasSwarmEncounters: boolean,
  
  // Attrition
  healingAvailable: number,  // 0-100 (ressources de soin disponibles)
  enemyAggroRange: number,   // Distance d'aggro
  trapDensity: number,        // 0-10
  
  // Rewards
  goldMultiplier: number,     // 0.5 - 3.0
  itemDropRate: number,       // 0.01 - 0.5
  rareLootChance: number,    // 0.001 - 0.1
}
```

### 4.2 Familles de menaces

```
TYPES DE MENACES:
=================

1. MASSÉS (Swarm)
   - Zone: Marais, Forêt
   - Danger: Beaucoup de faibles
   - Contre: AOE, zone damage
   - Attrition: Progressive

2. PUISSANTS (Elite)
   - Zone: Volcan, Tombe
   - Danger: Few but strong
   - Contre: Burst, esquive
   - Attrition: Concentrée

3. TYPIQUES (Mixed)
   - Zone: Carrières
   - Danger: Mixte
   - Contre: Adaptable
   - Attrition: Variable

4. SPIRITUELS (Undead/Demons)
   - Zone: Ombre, Cathédrale
   - Danger: Type spécifique
   - Contre: Résistances nécessaires
   - Attrition: Continue

5. AMBIANTS (Environmental)
   - Zone: Volcan, Ruines
   - Danger: Environment
   - Contre: Buffs spéciaux
   - Attrition: Continue
```

### 4.3 Résistances et vulnérabilités

```typescript
// Système de résistances
interface ResistanceProfile {
  physical: number,   // -50 à +50
  fire: number,
  ice: number,
  poison: number,
  chaos: number,
  healing: number,    // Bonus/malus au healing reçu
}

// Exemples:
// - Lava Zone: Fire +30, Poison +20, Healing -30
// - Swamp: Poison +40, Physical -10
// - Shadow Realm: Chaos +50, Fire -30
// - Holy Site: Healing +50, Chaos -40
```

### 4.4 Système de punition/récompense

```
LOGIQUE DE DIFFICULTÉ:
======================

SI build.adapté ET préparation ET stratégie_alors
  → Récompenses complètes (gold, items, XP bonus)
  → Risque faible de blessures
  
SINON SI joueur.tente_quand_même ALORS
  → Dégâts subis élevés
  → Blessures possibles
  → Coût de retour élevé
  → Peut mourir et tout perdre (items?)

RÉCOMPENSE PAR ZONE:
====================
Carrières: Récompense starter, risque faible
Marais: Récompense moderate, risque moderate  
Forêt: Récompense bonne, risque bon
Volcan: Récompense excellente, risque très élevé
Tombe: Récompense légendaire, risque extrême
```

### 4.5 Signaux au joueur (pas de level lock)

```
UI ACTUELLE → NOUVELLE UI:
==========================

AVANT: "Les Carrieres (Niv 1-10)"  ❌ Level lock
APRÈS:  "Les Carrieres" + Indicateur visuel:
        - ⚔️ Risque: Faible
        - 💰 Butin: Standard
        - 🔥 Danger: None
        - 📍 Distance: Proche (5 min)
        
NOUVEAUX INDICATEURS VISUELS:
=============================
• Zone verte: Risque faible pour build générique
• Zone jaune: Risque modéré, préparation recommandée  
• Zone orange: Risque élevé, build spécialisé requis
• Zone rouge: Risque extrême, préparation advanced requise
• Zone noire: Zone maudite, corruption possible

SANS BLOQUAGE - Juste des INDICES!
```

---

## BLOC 5 — Voyage et Accessibilité Totale

### 5.1 Système de voyage

```typescript
interface TravelSystem {
  // Temps de base par zone (en secondes)
  baseTravelTime: number,    // 60 secondes base
  
  // Facteurs
  distanceWeight: number,     // 10 sec par zone adjacente
  dangerWeight: number,     // +30 sec si zone dangereuse traversé
  mountBonus: number,        // -25% temps avec monture
  titleBonus: number,        // -10% avec titre "Voyageur"
  guildBonus: number,        // -15% avec guilde niveau 3+
  
  // Routes alternatives
  shortcuts: [
    { from: 'carrieres', to: 'marais', time: 60, unlockedBy: 'title:explorateur' }
  ],
  
  // Risques de voyage
  randomEncounterChance: number, // 0.1 (10%) par voyage
  ambushDamage: number,           // 10-30 HP si encounter
}
```

### 5.2 Stations et relayages

```
STATIONS DE VOYAGE:
==================

🏠 CITÉ DES ARÈNES (Hub central)
├── Toutes les zones accessibles
├── Soins gratuits
├── Marchands
└── Voyage instantané au hub

🏕️ CAMPS (Intermediate)
├── Chaque 2 zones
├── Soins basiques (50% HP)
├── Point de repos
└── Réduit le temps de voyage suivant

⛪ SANCTUAIRE (Zone-specific)
├── Dans chaque zone
├── Soins complets gratuits (1x par zone)
├── Résurrection si mort
└── Buff temporaire (zone-specific)

🏰 AVANT-POSTE (Guildes niveau 2+)
├── owned by guild
├── Téléportation guilde
├── Réduction coût voyage
└── Stockage d'urgence
```

### 5.3 Événements pendant le voyage

```
ÉVÉNEMENTS DE VOYAGE:
====================

COMMUNS (60%):
- Rencontre marchant ambulant
-发现 petit coffre (10-30 gold)
- 其他玩家 (signal social)

PEU COMMUNS (25%):
- Embuscade (combat 1v1 rapide)
- Piège àossaisses (dégâts + perte temps)
- Animal mountable (future monture)

RARES (10%):
- PNJ quest giver
- Coffre caché (rare item)
- Portal vers zone secrète

TRÈS RARES (5%):
- Boss de route (rewarding)
- Marchand légendaire (items uniques)
- Événement de guilde (si guild)
```

### 5.4 Coût du voyage

```
LOGIQUE DE COÛT:
===============

TEMPS: baseTravel + distance + danger + randomEvents
RISQUE: combat optionnel pendant voyage
ATTRITION: 5-15 HP par voyage (sans monture)

PRÉPARATION DU VOYAGE:
======================
• Avant de partir: Vérifier provisions
• Soins: Avoir des potions
• Résistances: Adapter selon zones traversées
• Planification: Choisir route la plus sûre OU la plus rapide
• Économie: Le voyage coûte en temps ET en risques

LIVREUR PEUT:
- Mourir en voyage (si très malchanceux)
- Perdre du temps
- Gagner des ressources (si préparés)
```

---

## BLOC 6 — Système d'Attrition par PV, Blessures et Soins

### 6.1 Différents types de dégât

```typescript
interface DamageTypes {
  // Dégâts normaux
  standard: {
    description: "Dégâts de combat classiques",
    recovery: "Récupération normale",
    tracking: "currentHp"
  },
  
  // Blessures (persistent)
  wound: {
    description: "Blessure grave qui limite HP max",
    effect: "-10% HP max temporaire",
    recovery: "Soin en ville (24h) ou PNJ healer",
    tracking: "wounds[]",
    maxWounds: 3
  },
  
  // Traumatismes (persistent)
  trauma: {
    description: "Effet psychologique - stats réduites",
    effect: "-5% toutes stats",
    recovery: "Sanctuaire (48h) ou rituel",
    tracking: "traumas[]",
    maxTraumas: 2
  },
  
  // Corruption (very persistent)
  corruption: {
    description: "Ténèbres，累计",
    effect: "+dégâts reçus, -soins reçus, risques spéciaux",
    recovery: "Purification (coûteuse)",
    tracking: "corruptionLevel (0-100)",
    threshold: 50 // au-delà: effets négatifs
  },
  
  // Fatigue (temporary)
  fatigue: {
    description: "Épuisement - loot réduit",
    effect: "-20% drop rate",
    recovery: "Repos (1h) ou dormir",
    tracking: "fatigueLevel (0-100)"
  }
}
```

### 6.2 Récupération

```
SYSTÈME DE RÉCUPÉRATION:
========================

NATURELLE (hors combat):
- +2 HP / minute
- Trop lent pour farm

VILLE (Cité):
- Soin complet gratuit
- Retire toutes fatigues
- Reset wounds si repos long (8h)

SANCTUAIRE (dans chaque zone):
- Soin complet gratuit 1x
- Retirer 1 wound
- Buff de zone (30 min)

AUBERGE (villes + camps):
- Prix: 50-200 gold
- Soin complet + buff repos
- Retire fatigue

POTIONS:
- Petite: +30 HP (25 gold)
- Moyenne: +75 HP (75 gold)  
- Grande: +150 HP (200 gold)
- Anti-poison: Soin poison (50 gold)

PNJ GUÉRisseur:
- Prix: 10 gold par wound
- Queue d'attente possible

SANCTUAIRE MAUDIT:
- Soin mais corruption +10
- Choix difficile: survivre maintenant ou risquer plus tard
```

### 6.3 Distinguer joueur prudent vs gourmand

```
SIGNEAUX UI:
============

JOUEUR PRudent (soigne régulièrement):
✅ Barres HP toujours vertes
✅ Voyage avec provisions
✅ Retour en ville avant danger
✅ Statut: "En forme" 🟢

JOUEUR GOURMAND (push trop loin):
⚠️ HP toujours bas
⚠️ Risque de mort
⚠️ Risque de wounds
⚠️ Statut: "Blessé" 🟡 ou "Critique" 🔴

MORT DU JOUEUR:
===============
- Respawn au dernier sanctuaire
- Perte: 10% gold portés (min 10)
- Cooldown: 30 secondes
- Si zona dangereuse: perte supplémentaire
```

### 6.4 Système de préparation comme moteur économique

```
CYCLE DE PRÉPARATION:
====================

AVANT EXPÉDITION:
1. Vérifier équipements (résistances)
2. Acheter potions
3. Vérifier HP
4. Calculer risques
5. Choisir destination accordingly

PENDANT:
- Gérer HP vs gains
- Savoir quand partir
- Utiliser provisions

APRÈS:
- Retour sécurisé ou risqué
- Soins si nécessaire
- Réparation équipements

CE SYSTÈME CRÉE:
- Demande de potions (économie)
- Demande de services de healer (économie)
- Utilité des sanctuaires (traffic)
- Valeur des resist items (commerce)
- Utilité des mounts/travel items (commerce)
```

---

## BLOC 7 — Système d'Investissement des Statistiques via Monnaie

### 7.1 Stats augmentables

```typescript
interface BaseStatInvestment {
  stat: 'force' | 'agility' | 'vitality' | 'luck',
  
  // Coût par point (croissant)
  baseCost: number,           // 100 gold pour premier point
  costMultiplier: number,    // 1.2x par palier
  
  // Paliers
  maxPurchasable: number,     // Maximum: 50 points
  softCap: number,            // Rendement décroissant: 30 points
  
  // Prix par palier (exemple)
  tiers: [
    { points: 10, totalCost: 1000 },
    { points: 20, totalCost: 3500 },
    { points: 30, totalCost: 8000 },
    { points: 40, totalCost: 18000 },
    { points: 50, totalCost: 45000 }
  ]
}
```

### 7.2 Stats restantes non-achetable ou semi-achetable

```
STATS ACHETABLES (via or):
==========================
• Force (Attack)
• Agilité (Dodge, Crit)
• Vitalité (HP, Defense)
• Chance (Loot, Crit)

STATS SEMI-ACHETABLES:
======================
• Résistances (certaines via équipements uniquement)
• Capacité de heals (via réputation)

STATS NON-ACHETABLES:
====================
• Compétences de classe (unlock par niveau)
• Slots d'équipement
• Capacités spéciales
```

### 7.3 Masters et services

```
MAÎTRES DE STATS (dans la Cité):
================================

⚔️ MAÎTRE D'ARMES (Force)
├── Local: Quartier des guerriers
├── Service: +1 Force
├── Coût: Croissant (100 → 5000)
└── Réputation requise: Les Lames Honauté

🏹 MAÎTRE DES OMBRES (Agilité)  
├── Local: Place du marché
├── Service: +1 Agilité
├── Coût: Croissant
└── Réputation requise: Les Ombres Connu

🛡️ MAÎTRE DU BOUCLIER (Vitalité)
├── Local: Caserne
├── Service: +1 Vitalité
├── Coût: Croissant
└── Réputation requise: Les Lames Connu

🍀 MAÎTRE DE LA FORTUNE (Chance)
├── Local: Temple de la chance
├── Service: +1 Chance
├── Coût: Croissant
└── Réputation requise: Le Sanctuaire Connu
```

### 7.4 Système de coûts et sinks

```
LOGIQUE DE COÛTS:
=================

Pour chaque stat: Coût = Base × (1.15 ^ pointsAchetés)

Example Force:
- Point 1: 100 gold
- Point 10: 281 gold (total: 1900)
- Point 20: 791 gold (total: 7900)
- Point 30: 2226 gold (total: 22000)

SOMME DES 4 STATS → 50 POINTS MAX:
==================================
Coût total maximum: ~45,000 gold

POUR COMPARAISON:
- Boss Volcano: ~400 gold par kill
- Farm 1h zone mid: ~2000 gold
- Objet légendaire: 1000-3000 gold

DÉEQUILIBRE:
- Early game: Achetable facilement
- Mid game: Choix à faire (stat vs equip)
- Late game: Sink massif pour min-maxers

CRÉATION DE SINKS:
==================
- Stats permanentes (pas de reset)
- Équipement réparer
- Consommables
- Soins
- Voyages
- Téléportations
```

### 7.5 Équilibre vertical vs équipement

```
LOGIQUE D'ÉQUILIBRE:
====================

STAT ACHETÉE → 1 point = +3 ATK (par exemple)
ITEM RARE → +10-20 ATK

Donc:
- Statsachetables: 20% de la puissance
- Équipement: 60% de la puissance  
- Bonus divers: 20% de la puissance

RÉSULTAT:
- Un nouveau peut égaler un veteran avec le bon stuff
- Mais le veteran a plus d'options (plus de stats + stuff)
- Preparation > grind
```

---

## BLOC 8 — Sources Secondaires de Puissance

### 8.1 Taxonomie des bonus

```
SOURCES DE PUISSANCE:
======================

1. PERMANENTS (toujours actifs)
├── Équipement (arme, armure, accessories)
├── Statistiquesachetées (or → stats)
├── Titres (victoires, boss kills, etc.)
├── Réputation (factions)
├── Classe + sous-classe
└── Reliques (personnelles)

2. TEMPORAIRES (durée limitée)
├── Bénédictions (sanctuaire: 30 min)
├── Parchemins (consommables)
├── Buffs de guilde (si guilde)
├── Potions (effets actifs)
└── Corruption (negative)

3. SOCIAUX (reposent sur d'autres)
├── Bonus de guilde
├── Buffs de PNJ (réputation)
├── Co-op bonus (si group)
└── Protection de territory (si guilde)

4. EXPLORATOIRES (trouvés/explorés)
├── Coffres rares
├── Reliques de zone
├── Objets événementiels
├── Secrets découverts
└── Cartes/tracés découverts

5. VISIBLES vs CACHÉS
├── Visibles: Équipement, stats, réputation
├── Caches: Reliques, secrets, bonus hidden
└── Ratio: 70% visibles, 30% caches
```

### 8.2 couches par phase de jeu

```
EARLY GAME (Niv 1-10):
======================
Sources principales:
✅ Équipement basique (drops)
✅ Statsachetables (or facile à gagner)
✅ Titres de victoire
✅ Réputation basique

Mid GAME (Niv 10-25):
=====================
Sources principales:
✅ Équipement rare/epic
✅ Stats plus élevées
✅ Titres avancés
✅ Réputation honored
✅ Reliques communes
✅ Sets d'équipements

LATE GAME (Niv 25+):
====================
Sources principales:
✅ Équipement légendaire/mythique
✅ Reliques puissantes
✅ Titres rares/légendaires
✅ Réputation légende
✅ Classes secrètes
✅ Objets uniques de boss
✅ Bonus d events
```

### 8.3 Sources inspirées de Conviction

```
SOURCES TYPE "CONVICTION":
===========================

LIVRES:
├── +5% damage type spécifique
├── Compétences cachées
└── Lore bonus

PACTES:
├── Échanger puissance contre drawback
├── Bonus de zone spécifique
└── Corruption optionnelle

ARTEFACTS:
├── Effets uniques
├── Set complète bonus
└── Stats extraordinaires

TOMBEAUX:
├── Respawn special
├── Buff posthumne
└── Legacy bonus (après mort)

MAÎTRES:
├── Entraînement spécial
├── Compétences avancées
└── Styles de combat alternatifs
```

---

## BLOC 9 — Implémentation Technique Réaliste

### 9.1 Structures de données

```prisma
// NOUVEAU SCHEMA - Extraits clés

model Character {
  // === IDENTITÉ ===
  id          String @id
  name        String
  level       Int    @default(1)
  xp          Int    @default(0)
  
  // === SANTE & ATTRITION ===
  currentHp   Int    @default(100)
  maxHp       Int    @default(100)
  wounds      String @default("[]")      // JSON: [{type, zone, duration}]
  traumas     String @default("[]")
  corruption  Int    @default(0)         // 0-100
  fatigue     Int    @default(0)         // 0-100
  
  // === STATS ACHETABLES ===
  baseStrength    Int @default(10)     // Achetable via or
  baseAgility     Int @default(10)
  baseVitality    Int @default(10)
  baseLuck        Int @default(10)
  
  // Stats investies (nombre de points achetés)
  strengthInvested   Int @default(0)
  agilityInvested    Int @default(0)
  vitalityInvested   Int @default(0)
  luckInvested       Int @default(0)
  
  // === AUTRES ===
  gold          Int  @default(50)
  // ... (autres champs existants)
}

model Zone {
  id          String @id
  name        String
  
  // === PARAMÈTRES DE DANGER ===
  baseDamageType    String @default("physical")  // physical, fire, ice, poison, chaos
  environmentalHazard Boolean @default(false)
  hasCorruption     Boolean @default(false)
  healAvailability Int     @default(50)           // 0-100
  enemyAggroRange   Int     @default(10)          // tiles
  trapDensity       Int     @default(0)          // 0-10
  
  // === REWARDS ===
  goldMultiplier    Float  @default(1.0)
  itemDropRate     Float  @default(0.1)
  rareLootChance   Float  @default(0.01)
  xpMultiplier     Float  @default(1.0)
  
  // === VOYAGE ===
  travelTimeSeconds Int   @default(300)    // 5 min base
  isHub             Boolean @default(false)
  nearestSafePoint String?              // Zone ID
}

model CharacterStatInvestment {
  id              String @id
  characterId     String
  stat            String // force, agility, vitality, luck
  pointsSpent     Int    @default(0)
  totalSpent      Int    @default(0)     // gold total dépensé
  
  @@unique([characterId, stat])
}

model TravelEvent {
  id              String @id
  characterId     String
  fromZone        String
  toZone          String
  durationSeconds Int
  wasAmbushed     Boolean @default(false)
  damageTaken     Int     @default(0)
  lootGained      Int     @default(0)
  createdAt       DateTime @default(now())
}

model ZoneBuff {
  id          String @id
  characterId String
  zoneId      String
  type        String // blessing, buff, debuff
  value       Float
  expiresAt   DateTime
  
  @@unique([characterId, zoneId, type])
}
```

### 9.2 Calcul de statistiques finales

```typescript
// Pseudo-code: Calcul des stats finales du joueur

function calculateFinalStats(character: Character): CombatStats {
  // 1. Stats de base (achetables + base)
  const baseStr = character.baseStrength + character.strengthInvested
  const baseAgi = character.baseAgility + character.agilityInvested
  const baseVit = character.baseVitality + character.vitalityInvested
  const baseLuck = character.baseLuck + character.luckInvested
  
  // 2. Bonus d'équipement
  const equip = getEquippedItems(character)
  let equipBonus = { str: 0, agi: 0, vit: 0, luck: 0, atk: 0, def: 0 }
  for (item of equip) {
    const stats = JSON.parse(item.finalStats)
    for (stat of ['str', 'agi', 'vit', 'luck', 'atk', 'def']) {
      equipBonus[stat] += stats[stat] || 0
    }
  }
  
  // 3. Bonus de titre
  const titles = JSON.parse(character.titles || '[]')
  let titleBonus = calculateTitleBonuses(titles)
  
  // 4. Bonus de réputation
  const rep = getReputations(character)
  let repBonus = calculateRepBonuses(rep)
  
  // 5. Reliques
  const relics = getRelics(character)
  let relicBonus = calculateRelicBonuses(relics)
  
  // 6. Modificateurs de zone (buffs temporaires)
  const zoneBuffs = getZoneBuffs(character)
  let zoneBonus = calculateZoneBuffs(zoneBuffs)
  
  // 7. Blessures et effets
  const woundPenalty = calculateWoundPenalty(character.wounds)
  const corruptionPenalty = calculateCorruptionPenalty(character.corruption)
  
  // 8. Résistances finales
  const finalResistances = calculateResistances(
    character.class,
    equip, 
    zoneBuffs,
    corruptionPenalty
  )
  
  // CALCUL FINAL
  return {
    attack: (baseStr * 3) + equipBonus.atk + titleBonus.atk + repBonus.atk,
    defense: (baseVit * 2 + baseAgi) + equipBonus.def + titleBonus.def + repBonus.def,
    hp: (baseVit * 15) + equipBonus.hp + titleBonus.hp + repBonus.hp,
    critChance: (baseAgi * 0.5 + baseLuck) / 100 + titleBonus.crit + repBonus.crit,
    dodge: baseAgi / 150 + titleBonus.dodge + repBonus.dodge,
    luck: baseLuck + titleBonus.luck + repBonus.luck,
    ...finalResistances,
    // Apply penalties
    attack: attack * (1 - corruptionPenalty.attackPenalty),
    healingReceived: healingReceived * (1 - corruptionPenalty.healingPenalty)
  }
}
```

### 9.3 Calcul de danger de zone et survie

```typescript
// Pseudo-code: Calcul si un joueur peut survivre dans une zone

function calculateZoneSurvival(character: Character, zone: Zone): SurvivalAssessment {
  const stats = calculateFinalStats(character)
  const zoneProfile = getZoneDangerProfile(zone)
  
  // Calcul des dégats reçus attendus par combat
  const expectedDamage = calculateExpectedDamage(stats, zoneProfile)
  
  // Calcul des soins disponibles
  const healingAvailable = calculateHealingPotential(
    character.inventory,
    character.gold,
    zoneProfile.healAvailability,
    character.currentHp
  )
  
  // Calcul de la durée de survie
  const turnsSurvivable = healingAvailable / expectedDamage
  
  // Calcul des risques
  const risks = {
    deathChance: calculateDeathChance(stats, zoneProfile),
    woundChance: calculateWoundChance(stats, zoneProfile),
    corruptionRisk: zoneProfile.hasCorruption ? calculateCorruptionRisk(character) : 0,
    trapRisk: zoneProfile.trapDensity * 0.1,
    ambushRisk: 0.1 // 10% par voyage
  }
  
  // Recommandation
  let recommendation: 'safe' | 'risky' | 'dangerous' | 'suicide'
  if (risks.deathChance < 0.05 && turnsSurvivable > 10) {
    recommendation = 'safe'
  } else if (risks.deathChance < 0.2 && turnsSurvivable > 5) {
    recommendation = 'risky'
  } else if (risks.deathChance < 0.5) {
    recommendation = 'dangerous'
  } else {
    recommendation = 'suicide'
  }
  
  return {
    recommendation,
    turnsSurvivable,
    expectedDamagePerTurn: expectedDamage,
    healingAvailable,
    risks,
    preparationAdvice: generateAdvice(stats, zoneProfile)
  }
}

// Exemple de advice généré:
// "Zone recommandée: Volcan"
// "Danger: Élevé - Build spécialisé requis"
// "Conseils: Résistances feu +50% nécessaires, apportez 10+ potions"
// "Alternative: Forêt (plus safe) pour farm d'or avant Volcan"
```

### 9.4 Logique d'attrition et voyage

```typescript
// Voyage: Calcul du temps et risques

function calculateTravel(fromZoneId: string, toZoneId: string, character: Character): TravelResult {
  const zones = getZonePath(fromZoneId, toZoneId) // Plus court chemin
  let totalTime = 0
  let totalRisk = 0
  let events: TravelEvent[] = []
  
  for (zone of zones) {
    totalTime += zone.travelTimeSeconds
    
    // Random encounter (10% chance per zone)
    if (Math.random() < 0.1) {
      totalTime += 30 // Combat time
      totalRisk += zone.dangerLevel * 0.1
      
      const damage = calculateAmbushDamage(zone, character)
      character.currentHp -= damage
      
      events.push({
        type: 'ambush',
        zone: zone.name,
        damage
      })
    }
  }
  
  // Modificateurs
  if (character.hasMount) totalTime *= 0.75
  if (character.hasTitle('voyageur')) totalTime *= 0.90
  
  // Final
  return {
    totalSeconds: totalTime,
    totalMinutes: Math.round(totalTime / 60),
    risk: totalRisk,
    events,
    hpLost: events.reduce((sum, e) => sum + e.damage, 0)
  }
}
```

---

## BLOC 10 — Plan de Migration depuis l'Existant

### 10.1 Systèmes à modifier

| Système | Action | Priorité | Risque |
|---------|--------|----------|--------|
| Zones (level min) | Supprimer | 🔴 Haute | Faible |
| Character.level | Garder, changer rôle | 🔴 Haute | Faible |
| Stats (force, etc.) | Ajouter investissables | 🟡 Moyenne | Moyen |
| Énergie | Supprimer | 🔴 Haute | Moyen |
| Combat (dégâts) | Ajouter résistances | 🟡 Moyenne | Moyen |
| Voyage | Nouveau système | 🔴 Haute | Moyen |
| Blessures | Nouveau système | 🟡 Moyenne | Élevé |
| Soins | Refaire logique | 🟡 Moyenne | Faible |

### 10.2 Migration de l'énergie existante

```
AVANT: ÉNERGIE
==============
- maxEnergy: 100
- energyRegen: 5/min
- Dépenser énergie = limiter farm

APRÈS: ATTRITION PV
==================
- Supprimer le champ energy
- Garder maxHp/currentHp mais rework

TRANSITION:
===========
- Phase 1: Ajouter nouveau système d'attrition
- Phase 2: Les deux systèmes fonctionnent
- Phase 3: Supprimer énergie progressivement
- Phase 4: Système attr uniquement

DURANT LA TRANSITION:
- Les joueurs gardent leur maxEnergy (inutilisé mais affiché)
- Nouveau système d'attrition s'ajoute
- Les deux comptabilisent pour les restrictions
```

### 10.3 Migration des personnages existants

```
TRANSITION CHARACTERS:
=====================

1. Stats existantes:
   - Conserver valeurs actuelles
   - Ajouter champs "invested" à 0
   - Ajouter option d'acheter plus

2. Level:
   - Garder tel quel
   - Mais +stats par level = désactivé
   - Ajouter "points de niveau" non utilisés: 0

3. Équipement:
   - Garder tel quel
   - Recalcul selon nouveau système

4.XP:
   - Garder tel quel
   - Adapter formule si nécessaire

5. Titres:
   - Garder tel quel (inchangé)
```

### 10.4 Phases de déploiement recommandées

```
FEUILLE DE ROUTE MIGRATION:
===========================

PHASE 1: FONDATIONS (Sprint 1-2)
--------------------------------
✅ Ajouter nouveaux champs au schema
✅ Supprimer level min zones
✅ Ajouter système de travel
✅ Créer UI travel (map, temps)

PHASE 2: ATTRITION (Sprint 3)
-----------------------------
✅ Implémenter système de wounds
✅ Implémenter système de corruption
✅ Ajouter healed UI (sanctuaires, auberges)
✅ Ajouter résistances zones

PHASE 3: ÉCONOMIE (Sprint 4)
----------------------------
✅ Ajouter shop de stats
✅ Ajouter coût croissant
✅ Ajouter UI investissements
✅ Ajouter maestros/PNJ

PHASE 4: BALANCING (Sprint 5)
------------------------------
✅ Recalcul difficultés zones
✅ Ajuster rewards zones
✅ Ajouter nouveaux indicators danger
✅ Tester early/mid/late game

PHASE 5: NETTOYAGE (Sprint 6)
------------------------------
✅ Supprimer énergie progressivement
✅ Finaliser UI/UX
✅ Ajouter tooltips explicatifs
✅ Documentation joueur
✅ Monitoring et ajustements
```

### 10.5 Conservation des systèmes existants

```
GARDER TEL QUEL:
===============

✅ Classes (tier, bonuses)
✅ Origines
✅ Titres (système)
✅ Réputation (système)
✅ Guilde (système)
✅ Chroniques (système)
✅ Coffres et loot
✅ Inventaire/Équipement
✅ Quêtes
✅ Crafting
✅ Destin/Classes secrètes
```

---

## BLOC 11 — Recommandation Finale

### 11.1 Les 3 sous-systèmes à implémenter IMMÉDIATEMENT

| # | Sous-système | Pourquoi |
|---|--------------|----------|
| 1 | **Supprimer level min zones** | Plus de的限制, monde ouvert |
| 2 | **Refaire voyage avec temps réel** | Accessibilité totale + préparation |
| 3 | **Ajouter shop de stats achetable** | Économie = progression, nouveau sink |

### 11.2 Les 3 sous-systèmes juste après

| # | Sous-système | Pourquoi |
|---|--------------|----------|
| 1 | **Système de blessures/wounds** | Attrition, conséquences |
| 2 | **Résistances par zone** | Différenciation, build variety |
| 3 | **Indicateurs de danger visuels** | Lisibilité sans blocage |

### 11.3 Les 3 erreurs de design à éviter ABSOLUMENT

1. **Remettre le niveau comme source principale de puissance**
   - Erreur: Rajouter des stats au level up
   - Solution: Garder level = indicateur seulement

2. **Créer un système d'énergie "par derrière"**
   - Erreur: Remplacer énergie par une autre barre abstraite
   - Solution: Vraie attrition par PV avec récupération variée

3. **Rendre le jeu trop punitif trop vite**
   - Erreur: Zones impossibles sans stuff rare
   - Solution: Signaux clairs, chemins de progression

### 11.4 Roadmap par sprints

```
SPRINT 1: ZONES OUVERTES
========================
- Supprimer level min dans API zones
- Nouveau display zones (sans level lock)
- Indicator danger visuel (vert/orange/rouge)
- Test: toutes zones accessibles

SPRINT 2: SYSTÈME DE VOYAGE
============================
- Créer API travel avec calculs temps
- Ajouter camps et stations
- Événements voyage aléatoires
- UI: temps de voyage affiché

SPRINT 3: ATTRITION ET BLESSURES
=================================
- Système wounds (3 max, -10% HP)
- Système corruption (accumulation)
- UI indicateurs (wounds, fatigue)
- Sanctuaires avec heal 1x

SPRINT 4: SHOP DE STATS
=======================
- Créer API /api/stats/invest
- UI shop stats avec coûts croissants
- Ajouter PNJ maîtres
- Test équilibre early game

SPRINT 5: BALANCING ET TESTS
=============================
- Recalcul difficulty zones
- Ajuster rewards
- Tests complète gameplay
- Ajustements based on feedback

SPRINT 6: POLISH ET DOCUMENTATION
==================================
- Ajouter tooltips explicatifs
- Tutoriel transitions
- Monitor usage
- Documentation interne
```

### 11.5 Stratégie pour faire SENTIR au joueur

```
MESSAGES CLÉS À TRANSMETTRE:
============================

🎯 LEVEL = INDICATEUR, PAS PUISSANCE
"Votre niveau montre votre expérience. Vos choix et équipement font votre force."

🌍 MONDE OUVERT
"Vous pouvez aller partout. Chaque zone vous attend - si vous osez."

⚔️ PRÉPARATION > GRIND
"Un joueur malinbat un joueur qui farm. Préparez-vous bien."

💰 ÉCONOMIE = PROGRESSION
"Gagnez de l'or, investissez dans vos stats. L'or est utile."

🩸 ATTRITION PAR PV
"Gérez vos blessures. Retournez en ville. Le monde est dangereux."

📊 MULTI-COUCHES DE PUISSANCE
"Équipement, titres, réputation, reliques - tout compte."


UI TRANSMETTANT CES MESSAGES:
=============================

1. PAGE CITÉ:
- ✓ Bouton voyage avec temps affiché
- ✓ Warning si zone dangereuse ("Risque élevé")
- ✓ Shop stats visible avec prix

2. COMBAT:
- ✓ HP visible en premier
- ✓ Indicateur wounds si applicable
- ✓ "Coût du combat" affiché après

3. ZONES:
- ✓ Indicateur danger (vert/orange/rouge)
- ✓ Pas de "Niveau requis"
- ✓ "Préparez-vous: résistances recommandées"

4. INVENTAIRE:
- ✓ Stats finales agrégées affichées
- ✓ Breakdown (base + equip + titre + rep)

5. STATS:
- ✓ Bouton "Améliorer avec or"
- ✓ Coût affiché clairement
```

---

*Document préparé pour GladiArena - Lead Systems Designer*
*Prochaine étape: Valider cette direction et commencer Sprint 1*
