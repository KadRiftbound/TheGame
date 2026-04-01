# GLADIARENA - SYSTÈME DE CLASSES COMPLET
## Document de Design Système v1.0

---

## BLOC 1 — VISION ET PHILOSOPHIE

### Fantasy du Système

Le système de classes de GladiArena incarne une philosophie RPG old-school où **le voyage vaut autant que la destination**. Un joueur qui choisit "Guerrier" au début ne sait pas encore qu'il pourrait, via des choix étranges et des sacrifices, devenir **Héritier du Dragon Déchu** — une classe unique au serveur, puissante mais qui consume son humanité.

La fantasy centrale : **le monde vous observe**. Vos actes, vos refus, vos morts, vos fidélités — tout est noté. Certaines portes ne s'ouvrent qu'à ceux qui ont accompli des choses absurdes.

### Ce que ressent le joueur normal
- "J'ai choisi Voleur, c'est simple et efficace"
- "Je comprends mes compétences, je monte en level"
- "À niveau 15, je peux évoluer vers Assassin"
- "Le jeu est lisible, je progresse"

### Ce que ressent le joueur explorateur
- "J'ai trouvé une zone cachée en mourant 3 fois"
- "Un PNJ m'a donné un indice cryptique"
- "En refusant cette récompense, quelque chose a changé"
- "Il y a des classes que personne n'a encore trouvées"

### Ce que ressent le joueur qui découvre une classe cachée
- "Attends... c'est quoi cette classe?"
- "Je dois mourir dans une crypte? C'est absurde."
- "Personne ne va croire que j'ai cette classe."
- "Le serveur a changé quand je l'ai obtenue."

### Pourquoi ce système est meilleur qu'un système classique
- Les classes ne sont pas des "builds" mais des **identités**
- Les conditions cachées créent des **rumeurs serveur** — les joueurs parlent entre eux
- Les contreparties créent des **compromis intéressants**, pas juste des chiffres
- Les classes uniques créent des **moments légendaires** (un joueur Obtient la Classe)
- Les choix irréversibles donnent du **poids** aux décisions

---

## BLOC 2 — ARCHITECTURE GÉNÉRALE

### Hiérarchie des Classes

```
ORIGINE (choisie à la création)
    ↓
CLASSE DE BASE (choisie au niveau 1-5)
    ↓
SPÉCIALISATION (débloquée au niveau 15-20 + conditions visibles)
    ↓
CLASSE RARE / LÉGENDAIRE / UNIQUE / MAUDITE
    (débloquée via exploration, comportement, sacrifice)
```

### Couches Détaillées

#### A. Origine (4 choix)
L'origine n'est pas une classe. C'est un **angle de départ** qui :
- Donne un passif minor
- Influence certains déblocages futurs
- Crée de la différenciation early-game
- Prépare des synergies ou antagonismes avec certaines classes

#### B. Classe de Base (4 choix)
Les fondations. Simples, fortes, compréhensibles.
- Guerrier, Voleur, Mage, Prêtre
- **Définitives** — ne peuvent pas être changées

#### C. Spécialisation (12 visibles)
Le tronc "normal" du jeu.
- 3 spécialisations par classe de base
- Débloqué via niveau + épreuve visible
- **Modifiable** (1 gratuit, puis coût gold/rituel)

#### D. Classes Rares/Légendaires/Uniques/Maudites
Le sel du système.
- **Rares (Rang B)**: Semi-cachées, conditions étranges
- **Légendaires (Rang A)**: Très difficiles, souvent liées au monde
- **Uniques (Rang S)**: 1 ou quelques-unes par serveur/saison
- **Maudites**: Puissantes mais avec conséquences majeures

### Transitions et Dépendances

```
Origine → Classe Base: Toujours possible
Classe Base → Spécialisation: Niveau + épreuve de classe
Spécialisation → Classe Rare: Comportement + exploration
Classe Rare → Classe Légendaire: Sacrifice + conditions majeures
Classe Légendaire → Classe Unique: Relique + rituel unique
```

### Classes Incompatibles

| Classe A | Classe B | Raison |
|-----------|----------|--------|
| Hiérophante | Exorciste Noir | Incompatibilité morale |
| Oracle Aveugle | Tisseur de Destin | Vision contradictoire |
| Porteur de la Flamme | Bain de Pureté | Contamination |
| Exécuteur Sans Nom | Chevalier de l'Ordre | Réputation antagoniste |
| Gardien des Tombes | Purificateur | Rôle opposé |

### Règles de Changement de Classe

| Type | Modifiable | Coût |
|------|------------|------|
| Origine | Non | - |
| Classe Base | Non | - |
| Spécialisation | Oui (1x gratuit) | 5000 gold après |
| Classe Rare | Très difficile | Rituel rare + perte de progression |
| Classe Légendaire | Presque impossible | Objet unique + sacrifice |
| Classe Unique | Irréversible | Perte permanente |

---

## BLOC 3 — TABLEAU COMPLET DE LA HIÉRARCHIE

### Origines (4)

| ID | Nom | Passif | Bonus Early | Prépare |
|----|-----|--------|-------------|---------|
| orphan | Orphelin des Rues | Vol (5%) | +10% gold early | Voleur, Assassin |
| novice | Ancien Novice | Affinité Sacrée (5%) | +10% healing | Prêtre, Clerc |
| mercenary | Mercenaire | Survie (5%) | +10% défense | Guerrier, Gardien |
| scholar | Érudit Ruiné | Savoir (5%) | +15% XP livres | Mage, Arcaniste |

### Classes de Base (4)

| ID | Nom | Rang | Fantaisy | Style |
|----|-----|------|----------|-------|
| warrior | Guerrier | A | Tank, duel, endurance | Défensif |
| thief | Voleur | A | Critique, esquive, poison | Aggressive敏捷 |
| mage | Mage | A | Burst, zone, contrôle | Offensif fragile |
| priest | Prêtre | A | Soins, buffs, malédictions | Support |

### Spécialisations (12)

#### Guerrier → 3 spécialisations

| ID | Nom | Rang | Condition | Style |
|----|-----|------|-----------|-------|
| bretteur | Bretteur | A | Niveau 15 + épreuve de lame | Duel, précision |
| guardian | Gardien | A | Niveau 15 + épreuve de fer | Tank pur |
| berserker | Berserker | A | Niveau 15 + épreuve de rage | Burst, risque |

#### Voleur → 3 spécialisations

| ID | Nom | Rang | Condition | Style |
|----|-----|------|-----------|-------|
| assassin | Assassin | A | Niveau 15 + épreuve d'ombre | Lethality |
| scout | Éclaireur | A | Niveau 15 + épreuve de野外 | Exploration |
| saboteur | Saboteur | A | Niveau 15 + épreuve de feu | Contrôle, pièges |

#### Mage → 3 spécialisations

| ID | Nom | Rang | Condition | Style |
|----|-----|------|-----------|-------|
| pyromancer | Pyromancien | A | Niveau 15 + épreuve de feu | Burst feu |
| arcanist | Arcaniste | A | Niveau 15 + épreuve d'arcane | Zone, contrôle |
| summoner | Invocateur | A | Niveau 15 + épreuve de pacte | Summons |

#### Prêtre → 3 spécialisations

| ID | Nom | Rang | Condition | Style |
|----|-----|------|-----------|-------|
| war_cleric | Clerc de Guerre | A | Niveau 15 + épreuve de foi | Hybride combat |
| hierophant | Hiérophante | A | Niveau 15 + épreuve sacrée | Buffs, buffs majeurs |
| exorcist | Exorciste | A | Niveau 15 + épreuve de foi noire | Anti-undead, malédictions |

### Classes Rares (12)

| ID | Nom | Rang | Prérequis Principal | Axe |
|----|-----|------|---------------------|-----|
| storm_thief | Voleur Tempête | B | 10000 gold accumulé | Vol, foudre |
| cave_walker | Rôdeur du Caveau | B | 50 coffres ouverts | Exploration |
| blood_marker | Marqueur de Sang | B | 20 exécutions | Duel |
| blind_oracle | Oracle Aveugle | B | Refuser 3 conseils | Prédiction |
| ash_pilgrim | Pèlerin des Cendres | B | Volcan sans armure | Survie feu |
| grave_warden | Veilleur du Tombeau | B | 10 explorations tombes | Anti-mort |
| flame_warden | Rempart des Cendres | B | 5 combats impossibles survécus | Survie |
| red_gladiator | Gladiateur Rouge | B | 50 combats arène | Arène |
| breach_scribe | Scribe des Brèches | B | 20 ruines explorées | Portails |
| void_mage | Mage du Néant | B | 10 morts en dimension | Void |
| crimson_confessor | Confesseur Écarlate | B | 5 péchés confessés | Sang |
| iron_monk | Moine de Fer | B | 10 combats sans armure | Corps |

### Classes Légendaires (6)

| ID | Nom | Rang | Condition Unique | Pouvoir |
|----|-----|------|-----------------|---------|
| ruin_walker | Marcheur des Ruines | A+ | 20 explorations, ruines spéciales | Voir passages cachés |
| death_dancer | Danse-lame du Néant | A+ | 3 morts en Faille de l'Ombre | Lames dimensionnelles |
| white_necro | Nécromancien Blanc | A+ | 5 morts, zone spécifique | Résurrection lumière |
| siege_breaker | Briseur de Siège | A+ | 10 guildes vaincues | Anti-guilde |
| lament_carrier | Porte-Lamentation | A+ | Relique maudite 7 jours | Lamentations |
| shade_duelist | Duelliste de l'Ombre | A+ | 100 duels sans armure | Duel absolu |

### Classes Uniques (4) — 1 PAR SERVEUR

| ID | Nom | Rang | Condition Mythique | Contrepartie |
|----|-----|------|-------------------|-------------|
| fallen_dragon | Héritier du Dragon Déchu | S | Oeuf noir + serment | Fire breath, -70% healing, prix x3 |
| broken_destiny | Tisseur de Destin Brisé | S | Fil brisé + fil tissé | Rewind turn, dual reality |
| nameless_executor | Exécuteur Sans Nom | S | 5擂台 + trahison | Duel monstrous, interdit en ville |
| first_flame | Porteur de la Première Flamme | S | Ténèbres absolues + flamme | Magie surpuissante, interdit eau sacrée |

### Classes Maudites (4) — ACCESSIBLES VIA CORRUPTION

| ID | Nom | Rang | Condition | Prix |
|----|-----|------|-----------|------|
| shadow_blood | Sang de l'Ombre | C | 10 Meurtres de joueurs | Impossible de reroll |
| soul_eater | Mangeur d'Âmes | C | 50 mobs sacrés tués | Perte d'XP permanente |
| plague_bringer | Porteur de Peste | C | 100 poison kills | Bannissement de certaines zones |
| oath_breaker | Briseur de Serment | C | 5 serments brisés | Aucune guilde ne vous accepte |

---

## BLOC 4 — FICHES DÉTAILLÉES DES CLASSES

### Fiche Standard

```yaml
nom: string
rang: A | B | A+ | S | C
fantasy: string
rôle: string
style: string

condition_de_deblocage:
  visible: string | null
  caché: string | null
  mythique: string | null

prerequis:
  visible: list
  caché: list

compatibilites: list
incompatibilites: list

competences:
  passif_base:
    nom: string
    effet: string
  
  actif_1:
    nom: string
    cooldown: int
    effet: string
  
  actif_2:
    nom: string
    cooldown: int
    effet: string
  
  actif_3:
    nom: string
    cooldown: int
    effet: string
  
  passif_evolutif_1:
    nom: string
    niveau_unlock: int
    effet: string
  
  passif_evolutif_2:
    nom: string
    niveau_unlock: int
    effet: string
  
  competence_signature:
    nom: string
    niveau_unlock: int
    effet: string

contrepartie:
  permanente: string
  sociale: string
  limitation: string

associations:
  reliques: list
  zones: list
  factions: list

potentiel:
  pve: int (1-5)
  pvp: int (1-5)
  exploration: int (1-5)
  social: int (1-5)

difficulté: Débutant | Intermédiaire | Avancé | Expert
```

---

### FICHES DÉTAILLÉES

#### CLASSE DE BASE : GUERRIER

```yaml
nom: Guerrier
rang: A
fantasy: Soldat aguerri, maître du duel et de l'endurance
rôle: Tank, Off-tank, Dueliste
style: Défensif mais constant

condition_de_deblocage:
  visible: "Choisi à la création du personnage"
  caché: null
  mythique: null

competences:
  passif_base: "Endurance du Soldat — +10% HP, +5% défense"
  actif_1: "Coup de Bouclier (CD: 3) — Étourdit 1 tour"
  actif_2: "Provocation (CD: 5) — Force l'ennemi à vous attaquer"
  actif_3: "Riposte (CD: 4) — Contre-attaque automatique après avoir reçu un coup"
  passif_evolutif_1: "Peau de Fer (niv 10) — +5% réduction de dégâts"
  passif_evolutif_2: "Colère du Batailleur (niv 20) — +10% dégâts quand HP < 50%"
  competence_signature: "Mur de Fer (niv 30) — immunité aux dégâts pendant 1 tour, 10min CD"

contrepartie:
  permanente: "Lent en combat, mobilité faible"
  sociale: "Perçu comme "boring" par certains"
  limitation: "Peu de burst damage"

potentiel:
  pve: 4
  pvp: 3
  exploration: 2
  social: 3

difficulté: Débutant
```

---

#### CLASSE DE BASE : VOLEUR

```yaml
nom: Voleur
rang: A
fantasy: Shadow operative, expert en poison et en openers
rôle: Assassin, Contrôleur
style: Aggressive, opportuniste

condition_de_deblocage:
  visible: "Choisi à la création"
  caché: null
  mythique: null

competences:
  passif_base: "Ombre Vivante — +15% esquive, +10% critique"
  actif_1: "Poison Lent (CD: 3) — Dégâts sur 3 tours"
  actif_2: "Attaque Sournoise (CD: 2) — +50% dégâts si premier coup"
  actif_3: "Fuite (CD: 6) — Quitte le combat sans perte"
  passif_evolutif_1: "Doigts Agiles (niv 10) — +5% vol de gold"
  passif_evolutif_2: "Létalité (niv 20) — +15% dégâts critiques"
  competence_signature: "Assassinat (niv 30) — Tue instantly si HP < 20%, 30min CD"

contrepartie:
  permanente: "HP de base bas, défense très faible"
  sociale: "Réputation "criminel" passive"
  limitation: "Inefficace en combat prolongé"

potentiel:
  pve: 3
  pvp: 5
  exploration: 4
  social: 2

difficulté: Intermédiaire
```

---

#### CLASSE RARE : VOLEUR TEMPÊTE

```yaml
nom: Voleur Tempête
rang: B
fantasy: Le voleur qui vole si vite qu'il semble être une tempête. Il prend tout, y compris le destin.
rôle: Glass cannon, Voluer ultime
style: Ultra-aggressive, haute mobilité

condition_de_deblocage:
  visible: null
  caché: "Accumuler 10,000 gold total sur le personnage (tracké silencieusement)"
  mythique: "Variante: Mourir avec exactement 9,999 gold"

competences:
  passif_base: "Tempête de Gold — +50% gold trouvé, vole 5% du gold ennemi"
  actif_1: "Griffe de Foudre (CD: 2) — Dégâts + stun"
  actif_2: "Cyclone (CD: 5) — Attaque tous les ennemis pendant 2 tours"
  actif_3: "Vol Absolu (CD: 8) — vole 20% du gold max de l'ennemi"
  passif_evolutif_1: "Foudre Constante (niv 10) — +10% vitesse d'attaque"
  passif_evolutif_2: "Or Infini (niv 20) — Gold cap augmenté de 50%"
  competence_signature: "Tempête du Dragon d'Or (niv 30) — Vol 50% gold à TOUS les ennemis de guilde, 1h CD"

contrepartie:
  permanente: "-30% défense de base"
  sociale: "TOUS les marchands vous haïssent (prix x2)"
  limitation: "Ne peut pas Equiper de bouclier"

associations:
  reliques: ["Anneau du Commerce Noir"]
  zones: ["Grandes fortunes"]
  factions: ["Guilde des Marchands (ennemi)"]

potentiel:
  pve: 4
  pvp: 5
  exploration: 3
  social: 1

difficulté: Avancé
```

---

#### CLASSE UNIQUE : HÉRITIER DU DRAGON DÉCHU

```yaml
nom: Héritier du Dragon Déchu
rang: S
fantasy: Le dernier sang du dragon coule dans ses veines. Il peut cracher du feu mais cela consume son humanité.
rôle: Burst absolute, anti-tank
style: glass cannon extremo

condition_de_deblocage:
  visible: null
  caché: "Trouver l'Oeuf Noir au fond du volcan"
  mythique: "Apporter l'Oeuf à un NPC caché dans les ruines, sans armure, après avoir tué 3 dragons"

competences:
  passif_base: "Sang Dragon — +60% attaque, +30% HP, immunité feu"
  actif_1: "Souffle de Feu (CD: 3) — Dégâts de zone massifs"
  actif_2: "Griffes Dragon (CD: 2) — +100% dégâts pendant 2 tours"
  actif_3: "Vol (CD: 10) — Fuite garantie + regen 25% HP"
  passif_evolutif_1: "Peau d'Écailles (niv 10) — +20% défense"
  passif_evolutif_2: "Colère du Dragon (niv 20) — +25% dégâts critiques"
  competence_signature: "Transformation Dragon (niv 30) — Devient dragon pour 3 tours, 2h CD"

contrepartie:
  permanente: "Healing reçu réduit de 70%"
  sociale: "Interdit de دخول معظم المدن الرئيسية"
  limitation: "Prix x3 chez tous les marchands"

associations:
  reliques: ["Oeuf Noir du Volcan", "Écailles du Dernier Dragon"]
  zones: [" volcan (accès special)"]
  factions: ["Ordre des Dragon Slayers (ennemi mortel)"]

potentiel:
  pve: 5
  pvp: 4
  exploration: 3
  social: 1

difficulté: Expert
```

---

## BLOC 5 — SYSTÈME DE DÉBLOCAGE ET TRACKERS CACHÉS

### Niveaux de Déblocage

#### Niveau 1: VISIBLE
- Niveau requis
- Or requis
- Objets requis
- Épreuve de classe (visible)
- Boss de classe vaincu

**Exemples:**
- "Atteignez le niveau 15" → spécialisations
- "Vaincre le Maître de la Lame" → Bretteur
- "Apporter 3 Lingots de Fer" → forgeron

#### Niveau 2: CACHÉ
- Comportements trackés
- Choix spécifiques
- Exploration de zones
- Réputation

**Exemples:**
- "Accumuler 10,000 gold" → Voleur Tempête
- "Explorer 50 zones différentes" → Rôdeur du Caveau
- "Vaincre 20 boss sans équipement" → Moine de Fer
- "Avoir 100% réputation sacrée" → Hiéro­phante

#### Niveau 3: MYTHIQUE
- Conditions absurdes
- Combinaison d'actions
- Événements RNG
- Temporalité

**Exemples:**
- "Mourir exactement 3 fois dans la Faille de l'Ombre" → Danse-lame du Néant
- "Finir un donjon en portant une relique maudite pendant 7 jours" → Porte-Lamentation
- "Refuser 3 offrandes sacrées, puis accepter la 4ème" → Oracle Aveugle
- "Être banni de 3 villes, puis y retourner sans armure" → Moine de Fer

---

### Tracker de Comportement Invisible

| Tracker | Type | Description | Increment | Decay | Visible |
|---------|------|-------------|-----------|-------|---------|
| `deathsInZone_X` | int | Deaths dans zone X | +1 per death | none | No |
| `bossesSpared` | int | Boss non tués | +1 per spare | none | No |
| `goldAccumulated` | int | Total gold ever owned | +X per gain | none | No |
| `fleeCount` | int | Nombre de fuites | +1 per flee | none | No |
| `pvpKills` | int | Joueurs tués | +1 per kill | -1 per death | No |
| `corruptionLevel` | int | Niveau de corruption | +X per evil act | -1 per good act | Partial |
| `purityLevel` | int | Niveau de pureté | +X per good act | -1 per evil act | Partial |
| `chestsOpened` | int | Coffres ouverts | +1 per chest | none | No |
| `ruinsExplored` | int | Ruines explorées | +1 per ruin | none | No |
| `holyItemsDestroyed` | int | Objets sacrés détruits | +1 per destroy | none | No |
| `cursedItemsHeld` | int | Jours avec objet maudit | +1 per day | none | No |
| `timeNoGuild` | int | Jours sans guilde | +1 per day | -1 on join | No |
| `oathsSworn` | int | Serments prononcés | +1 per oath | -5 per break | No |
| `sacrificesMade` | int | Sacrifices effectués | +1 per sacrifice | none | No |
| `refusedRewards` | int | Récompenses refusées | +1 per refuse | none | No |
| `poisonKills` | int | Tue avec poison | +1 per kill | none | No |
| `underdogWins` | int | Victoires en infériorité | +1 per win | none | No |
| `secretsFound` | int | Secrets découverts | +1 per secret | none | No |
| `guildBetrayals` | int | Trahisons de guilde | +1 per betrayal | none | No |
| `relicDistanceTraveled` | int | km avec relique équipés | +X per travel | none | No |

---

### Exemples de Combinaisons de Déblocage

#### Danse-lame du Néant
```
TRACKERS REQUIS:
- deathsInZone_FailleOmbre >= 3
- weaponsChanged <= 1
- sacredChoicesRefused >= 1

EVENTS REQUIS:
- mourir dans la Faille de l'Ombre (zone cachée)
- Pas cambiar d'arme pendant 10 niveaux

HINT: "Celui qui meurt trois fois dans l'ombre trouve la lumière noire"
```

#### Oracle Aveugle
```
TRACKERS REQUIS:
- refusedRewards >= 3
- adviceIgnored >= 5
- secretsFound >= 10

EVENTS REQUIS:
- Refuser 3 récompenses normales
- Ignorer 5 conseils de PNJ
- Trouver 10 secrets

HINT: "Refuse le premier conseil qu'on te donne. Puis le deuxième. Le troisième, écoute-le."
```

#### Héritier du Dragon
```
TRACKERS REQUIS:
- dragonsKilled >= 3
- cursedItemsHeld >= 30 (7 jours)
- goldAccumulated >= 50000

EVENTS REQUIS:
- Tuer 3 dragons
- Porter l'Oeuf Noir pendant 7 jours
- Être extrêmement riche

OBJET REQUIS:
- Oeuf Noir (drop rate 0.1% au fond du volcan)

HINT: "L'oeuf noir au fond du volcan. Personne ne l'a jamais rapporté."
```

---

## BLOC 6 — MODÈLE DE DONNÉES ET PSEUDO-CODE

### Structure de Données Principale

```typescript
// Enums
enum ClassTier {
  BASE = "base",           // Classes de base
  SPECIALIZATION = "spec",  // Spécialisations
  RARE = "rare",           // Classes rares (Rang B)
  LEGENDARY = "legendary",  // Classes légendaires (Rang A+)
  UNIQUE = "unique",       // Classes uniques (Rang S)
  CURSED = "cursed"        // Classes maudites (Rang C)
}

enum OriginType {
  ORPHAN = "orphan",
  NOVICE = "novice", 
  MERCENARY = "mercenary",
  SCHOLAR = "scholar"
}

enum UnlockVisibility {
  VISIBLE = "visible",
  HIDDEN = "hidden",
  MYTHICAL = "mythical"
}

// ClassDefinition
interface ClassDefinition {
  id: string;
  name: string;
  tier: ClassTier;
  baseClassId: string | null;  // Pour spécialisations
  fantasy: string;
  role: string;
  style: string;
  
  // Compétences
  passiveBase: Skill;
  actives: Skill[];
  passivesEvo: Skill[];
  signatureSkill: Skill;
  
  // Débloquer
  unlockVisibility: UnlockVisibility;
  levelRequired: number | null;
  goldRequired: number | null;
  prerequisiteClasses: string[];
  prerequisiteItems: string[];
  prerequisiteQuests: string[];
  
  // Contreparties
  permanentEffects: Effect[];
  socialEffects: SocialEffect[];
  lockedZones: string[];
  lockedMerchants: string[];
  
  // Stats mods
  statModifiers: {
    hp: number;
    attack: number;
    defense: number;
    crit: number;
    dodge: number;
    speed: number;
  };
  
  // Max par serveur (pour uniques)
  maxPerServer: number | null;
  currentServerCount: number;
  
  // Assets
  icon: string;
  description: string;
  loreText: string;
}

// HiddenTracker
interface HiddenTracker {
  characterId: string;
  trackers: {
    [trackerId: string]: number;
  };
  flags: string[];
  timestamps: {
    [trackerId: string]: Date;
  };
}

// UnlockCondition
interface UnlockCondition {
  classId: string;
  conditions: {
    type: 'stat' | 'item' | 'quest' | 'behavior' | 'combination' | 'event';
    operator: 'AND' | 'OR' | 'XOR';
    requirements: {
      id: string;
      operator: '>=' | '<=' | '==' | '!=' | 'contains';
      value: any;
      visible: boolean;
    }[];
  };
  hint: string | null;
  hiddenHint: string | null;
}

// PlayerChoiceFlag
interface PlayerChoiceFlag {
  characterId: string;
  choices: {
    [choiceId: string]: {
      made: boolean;
      timestamp: Date;
      consequences: string[];
      lockedPaths: string[];  // Classes rendues inaccessibles
      openedPaths: string[];  // Classes rendues accessibles
    };
  };
}
```

### Modèle SQL (Prisma)

```prisma
model ClassDefinition {
  id            String   @id @default(cuid())
  name          String   @unique
  tier          String   // base, spec, rare, legendary, unique, cursed
  baseClassId   String?
  fantasy       String
  role          String
  style         String
  
  icon          String?
  description   String
  loreText      String?
  
  // Compétences JSON
  skills        String   @default("[]")  // Array de Skill
  passiveBase   String   @default("{}")
  signatureSkill String  @default("{}")
  
  // Débloquer
  unlockVisibility String @default("visible")
  levelRequired    Int?
  goldRequired     Int?
  maxPerServer     Int?
  
  // Stats
  statModifiers   String  @default("{}")
  permanentEffects String @default("[]")
  
  // Relations
  baseClass      ClassDefinition? @relation("ClassEvolution", fields: [baseClassId], references: [id])
  evolutions     ClassDefinition[] @relation("ClassEvolution")
  characters     Character[]
  unlockConditions UnlockCondition[]
}

model UnlockCondition {
  id          String   @id @default(cuid())
  classId     String
  class       ClassDefinition @relation(fields: [classId], references: [id])
  
  conditionType String  // stat, item, quest, behavior, combination, event
  operator      String  // AND, OR, XOR
  
  requirements  String  @default("[]")  // JSON array
  
  hint          String?
  hiddenHint    String?
  
  isActive     Boolean @default(true)
}

model CharacterHiddenState {
  id              String   @id @default(cuid())
  characterId     String   @unique
  character       Character @relation(fields: [characterId], references: [id])
  
  // Trackers
  deathsInZone    String   @default("{}")  // JSON: {zoneId: count}
  bossesSpared    Int      @default(0)
  goldAccumulated Int      @default(0)
  fleeCount       Int      @default(0)
  pvpKills        Int      @default(0)
  corruptionLevel Int      @default(0)
  purityLevel     Int      @default(0)
  chestsOpened    Int      @default(0)
  ruinsExplored   Int      @default(0)
  timeNoGuild     Int      @default(0)
  oathsSworn      Int      @default(0)
  oathsBroken     Int      @default(0)
  sacrificesMade  Int      @default(0)
  refusedRewards  Int      @default(0)
  poisonKills     Int      @default(0)
  underdogWins    Int      @default(0)
  secretsFound    Int      @default(0)
  guildBetrayals  Int      @default(0)
  
  // Flags
  flags           String   @default("[]")  // Array of flag strings
  lockedClasses   String   @default("[]")  // Classes rendues inaccessibles
  unlockedClasses String   @default("[]")  // Classes débloquées
  
  // Special state
  cursedItemsHeld Int     @default(0)  // Days with cursed item
  relicDistance   Int     @default(0)  // Distance traveled with relic
  
  // Timestamps for temporal conditions
  lastUpdated     DateTime @default(now())
  specialDates    String   @default("{}")  // {eventType: timestamp}
}

model CharacterClassHistory {
  id              String   @id @default(cuid())
  characterId     String
  character       Character @relation(fields: [characterId], references: [id])
  
  classId        String
  acquiredAt     DateTime @default(now())
  source         String   // initial, evolution, unlock, rare, legendary, unique
  isCurrent      Boolean  @default(true)
  
  // Pour uniques - irréversible
  isPermanent    Boolean  @default(false)
}
```

### Pseudo-Code: Logique de Déblocage

```typescript
// Vérification des conditions de déblocage
function checkClassUnlock(character: Character, classId: string): UnlockResult {
  const classDef = getClassDefinition(classId);
  const conditions = getUnlockConditions(classId);
  const hiddenState = getHiddenState(character.id);
  
  // 1. Vérifier niveau minimum
  if (classDef.levelRequired && character.level < classDef.levelRequired) {
    return { unlocked: false, reason: 'level', progress: character.level / classDef.levelRequired };
  }
  
  // 2. Vérifier gold minimum
  if (classDef.goldRequired && character.totalGoldEarned < classDef.goldRequired) {
    return { unlocked: false, reason: 'gold', progress: character.totalGoldEarned / classDef.goldRequired };
  }
  
  // 3. Vérifier classes prérequises
  for (const prereq of classDef.prerequisiteClasses) {
    if (!hasClass(character, prereq)) {
      return { unlocked: false, reason: 'prereq', missing: prereq };
    }
  }
  
  // 4. Vérifier conditions cachées
  for (const condition of conditions) {
    const check = evaluateCondition(condition, hiddenState);
    if (!check.passed) {
      // Pour les classes mythiques, ne rien révéler
      if (classDef.unlockVisibility === 'mythical') {
        return { unlocked: false, reason: 'hidden', progress: check.progress };
      }
      return { unlocked: false, reason: condition.type, progress: check.progress };
    }
  }
  
  // 5. Vérifier incompatibilités
  for (const incompatible of classDef.incompatibleClasses) {
    if (hasClass(character, incompatible)) {
      return { unlocked: false, reason: 'incompatible', conflicting: incompatible };
    }
  }
  
  // 6. Pour classes uniques - vérifier si disponible
  if (classDef.tier === 'unique') {
    const currentCount = getServerClassCount(classId);
    if (currentCount >= classDef.maxPerServer) {
      return { unlocked: false, reason: 'server_full' };
    }
  }
  
  return { unlocked: true };
}

// Évaluation d'une condition complexe
function evaluateCondition(condition: UnlockCondition, state: HiddenState): CheckResult {
  const results = condition.requirements.map(req => {
    switch (req.type) {
      case 'stat':
        return checkStat(req.id, req.operator, req.value, state);
      case 'behavior':
        return checkBehavior(req.id, req.operator, req.value, state);
      case 'flag':
        return checkFlag(req.id, state);
      case 'item':
        return checkItem(req.id, state);
      case 'temporal':
        return checkTemporal(req.id, state);
      default:
        return { passed: false, progress: 0 };
    }
  });
  
  const allPassed = condition.operator === 'AND' 
    ? results.every(r => r.passed)
    : results.some(r => r.passed);
    
  const avgProgress = results.reduce((sum, r) => sum + r.progress, 0) / results.length;
  
  return { passed: allPassed, progress: avgProgress };
}

// Exemple: Check pour "Mourir 3 fois dans la Faille de l'Ombre"
function checkDeathsInSecretZone(zoneId: string, target: number, state: HiddenState): CheckResult {
  const deaths = state.deathsInZone[zoneId] || 0;
  return {
    passed: deaths >= target,
    progress: Math.min(100, (deaths / target) * 100),
    current: deaths,
    target: target
  };
}

// Déclenchement d'événement de déblocage
function onClassUnlock(character: Character, classId: string): void {
  const classDef = getClassDefinition(classId);
  
  // 1. Appliquer les effets permanents
  applyClassEffects(character, classDef);
  
  // 2. Fermer les classes incompatibles
  for (const incompatible of classDef.closesPaths) {
    lockClass(character.id, incompatible);
  }
  
  // 3. Ouvrir les classes compatibles
  for (const opened of classDef.opensPaths) {
    unlockClass(character.id, opened);
  }
  
  // 4. Logger pour admin
  logClassUnlock(character.id, classId);
  
  // 5. Notifier le joueur
  if (classDef.tier === 'unique') {
    notifyServer(character.name, classDef.name);
  } else if (classDef.tier === 'legendary') {
    notifyGuild(character.id, classDef.name);
  }
  
  // 6. Créer entrée historique
  saveClassHistory(character.id, classId, classDef.tier);
}
```

---

## BLOC 7 — UX / MONDE / GILDES / LIVE OPS

### Ce que le joueur voit

| Élément | Visible | Description |
|---------|---------|-------------|
| Classe actuelle | ✓ | Dans le profil |
| Spécialisations disponibles | ✓ | Menu après niveau atteint |
| Classe débloquable | ✓ | Notification + menu (si visible) |
| Progression spécialisation | ✓ | Barre de progression |
| Tracker de déblocage rare | ✗ | Jamais affiché |
| Hints pour classes cachées | ? | Uniquement via world elements |

### Ce que le joueur ne voit JAMAIS

- Les conditions exactes de déblocage
- Le fait qu'un tracker existe
- Les autres joueurs qui ont débloqué la classe
- Les probabilités de drop de reliques
- Les conditions des autres joueurs

### Comment suggérer l'existence de classes cachées

**Via le monde:**
- PNJ avec dialogues cryptiques: "J'ai connu quelqu'un qui pouvait... enfin, c'est du passé."
- Objets avec descriptions ambiguës: "On dit que porter ceci pendant 7 jours changea quelqu'un."
- Zones avec textes d'ambiance: "Des murmures parlent d'une lame qui coupe entre les dimensions."
- Boss qui prononcent des phrases spéciales à certains joueurs

**Via l'interface:**
- Icônes verrouillées avec "???" dans le menu classes
- Barre de progression mystérieuse sans label
- Notifications cryptiques: "Quelque chose a changé..."
- Titre du profil qui change subtilement

### Affichage d'une classe rare/unique

```
┌────────────────────────────────────────┐
│  ✨ DANSE-LAME DU NÉANT                │
│  ═══════════════════════════════════   │
│  Rang: ★★ Rare                        │
│                                        │
│  "Une lame qui ne devrait pas exister" │
│                                        │
│  ⚔️ +40 ATK  ❤️ -10 HP                 │
│  💨 +20 Esquive  ⚡ +30 Vitesse        │
│                                        │
│  Compétence Signature:                  │
│  Lames Dimensionnelles ( niv 30 )      │
│                                        │
│  ─────────────────────────────────    │
│  Contrepartie:                         │
│  ⚠️ Soins reçus -50%                   │
│  ⚠️ Ne peut pas entrer àLumière Sainte│
└────────────────────────────────────────┘
```

### Intégration Monde

| Zone | Classe Liée | Type d'Indice |
|------|-------------|---------------|
| Faille de l'Ombre | Danse-lame du Néant | Zone de mort |
| Cathédrale Effondrée | Oracle Aveugle | PNJ sourd |
| Ruines Oubliées | Marcheur des Ruines | Passages cachés |
| Volcan | Pèlerin des Cendres | Sans armure |
| Tombe Antique | Gardien des Tombes | Boss spécial |
| Gratte-ciel | Voleur Tempête | Coffres dorés |

### Intégration Guildes

| Classe | Condition Guild |
|--------|----------------|
| Stratège de Guerre | Guilde Top 3 pendant 30 jours |
| Traître Absolu | Quitter guilde après 1000 contributions |
| Chevalier de l'Ordre | Guilde en guerre victorieuse |
| Banni Vengeur | 30 jours sans guilde après bannissement |

### Live Ops

**Outils nécessaires:**

```typescript
// 1. Activation/Désactivation de classes
interface ClassToggle {
  classId: string;
  enabled: boolean;
  reason: string;
  adminOnly: boolean;
}

// 2. Rotation de classes uniques
interface UniqueRotation {
  classId: string;
  seasonId: string;
  maxPerSeason: number;
  resetOnSeasonEnd: boolean;
}

// 3. Journal d'obtention
interface ClassUnlockLog {
  timestamp: Date;
  characterId: string;
  characterName: string;
  classId: string;
  className: string;
  method: string;
  serverId: string;
}

// 4. Détection d'exploits
interface ExploitDetection {
  classId: string;
  conditions: string[];  // Conditions qui ne devraient pas être remplies ensemble
  checkFunction: string;  // Pseudo-code de la vérification
  severity: 'warning' | 'critical';
}

// 5. Buff/Nerf emergency
interface ClassBalance {
  classId: string;
  statModifiers: {...};
  cooldownModifiers: {...};
  active: boolean;
  reason: string;
  expiresAt: Date | null;
}
```

---

## BLOC 8 — CAS DE TEST, RISQUES, RECOMMANDATIONS

### Cas de Test

#### Joueur Standard
- Crée un personnage Guerrier
- Monte au niveau 20
- Débloque Bretteur
- **Vérifier:** Classe accessible, compétences fonctionnent, progression fluide

#### Joueur Explorateur
- Trouve zone cachée "Faille de l'Ombre"
- Meurt 3 fois dans la zone
- **Vérifier:** Classe Danse-lame apparaît, notification mystérieuse

#### Joueur Criminel
- Tue 50 joueurs en PVP
- Accumule corruptionLevel élevé
- **Vérifier:** Classes sacrées se ferment, classes maudites s'ouvrent

#### Joueur Solo Sans Guilde
- Reste 100 jours sans guilde
- **Vérifier:** Classe "Loup Solitaire" se débloque, classes de guilde inaccessibles

#### Joueur de Faction Sacrée
- Maintient pureté maximale pendant 50 jours
- Tue 100 undead
- **Vérifier:** Hiéro­phante + Exorciste accessibles, classes corrompues fermées

#### Joueur Corrompu
- Détruit 10 objets sacrés
- Tue 20 PNJ sacrés
- **Vérifier:** Classes maudites disponibles, classes sacrées fermées

#### Joueur à Conditions Contradictoires
- Accumule 10,000 gold (ouvre Voleur Tempête)
- Tue 50 undead (ferme classes darkness)
- **Vérifier:** Classes correctement assignées, conflits gérés

#### Joueur qui Abandonne une Classe Rare
- Obtient Voleur Tempête
- Veut retourner Assassin
- **Vérifier:** Option limitée, coût极高, confirmation required

#### Joueur qui Obtient Classe Unique
- Remplit conditions Héritier du Dragon
- **Vérifier:** Notification serveur, log admin,限1 par serveur enforced

#### Joueur qui Exploite
- Tente de modifier trackers via API
- Tente de dupliquer conditions
- **Vérifier:** Serveur rejects, logs captured, admin notified

### Risques et Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Exploit de trackers | Haute | Critique | Validation côté serveur, logs détaillés |
| Classe trop dominante | Moyenne | Équilibre | Buff/Nerf tools ready, seasonal resets |
| Multi-accounting pour classes uniques | Haute | Équilibre | IP tracking, character merge prevention |
| Joueur découragé par opacité | Haute | Rétention | Hints distribués, guides community |
| Classe impossible à obtenir | Moyenne | Engagement | Beta testing, ajustement des conditions |
| Rage quit après locked class | Moyenne | Rétention | Confirmation warnings, unlock alternatif |

### Recommandations de Production

**Phase 1 - MVP:**
- 4 classes de base
- 8 spécialisations
- 4 classes rares
- 1 classe unique
- 10 trackers de base

**Phase 2 - Enrichissement:**
- +4 classes rares
- +2 classes légendaires
- +1 classe unique
- +15 trackers
- Système de hints

**Phase 3 - Polish:**
- Classes maudites
- Système de saison
- Rotation de classes uniques
- Outils admin complets

**Métriques à Track:**
- Taux d'obtention classes rares
- Temps moyen pour spécialisation
- Corrélation between play style et class unlock
- Churn après locked class
- Engagement increase with class unlock

### Checklist de Lancement

- [ ] Toutes les classes implémentées avec compétences
- [ ] Tous les trackers fonctionnels
- [ ] Conditions de déblocage testées
- [ ] Contreparties appliquées
- [ ] Incompatibilités enforced
- [ ] Logs admin opérationnels
- [ ] Notifications joueurs functional
- [ ] Outils buff/nerf ready
- [ ] Documentation pour support
- [ ] Tests de charge sur système de déblocage
- [ ] Plan de communication pour rumeurs serveur
- [ ] Process de hotfix si classe trop dominante

---

*Document généré pour GladiArena v1.0*
*Lead Game Designer + Systems Designer*
*Ready for production handoff*
