# GladiArena - Plan d'évolution vers un faux MMORPG crédible

> **Document de design produit - Lead Game Designer**
> Version 1.0 | Priorité : Early Game First

---

## BLOC 1 — Diagnostic produit

### 1.1 État actuel de la base

La base technique contient déjà une architecture solide pour un RPG :

| Composant | État | Problème |
|-----------|------|----------|
| Classes | ✅ Complet | Tier system excellent, mais pas de display de progression |
| Zones | ✅ 8 zones (5 normales + 3 cachées) | Pas de hub central, pas de map |
| Ennemis | ✅ 85 ennemis | Pas de boss publics, pas d'état partagé |
| Coffres | ✅ 27 coffres | Pas de locks publics, pas de "premier découverte" |
| Tracking | ✅ 30+ trackers hidden | Tracker excellent mais pas exploités en UI |
| Guilde | 🔶 Partiel | Pas de chat, pas de buffs, pas de territory |
| Réputation | 🔶 Schéma seul | Pas d'implémentation |
| Titres | 🔶 Champ vide | Pas d'attribution |

### 1.2 Pourquoi le jeu ressemble aujourd'hui à "zones + monstres + coffres"

1. **Aucun lieu central** — Le joueur spawn, choisit une zone, fight, loot, et c'est tout. Il n'a aucune raison de revenir sur un lieu "central" ou de voir d'autres joueurs.

2. **Aucune persistance共享** — Les ennemis meurent et respawn individuellement. Il n'y a pas de:
   - Boss régionaux avec état public
   - Événements de zone
   - Premier kill enregistré
   - Coffres trouvés par d'autres

3. **Aucune visibilité sociale** — Les titres, la réputation, les achievements ne sont pas affichés. Le joueur ne voit pas que d'autres existent.

4. **Aucune conséquence sociale** — Pas de primes, pas de criminalité, pas de vendetta. Le PVP est仅限于 l'Arena.

5. **Aucune "chronique" du serveur** — Pas de journal des premiers: "Premier joueur à découvrir la Tombe Antique", "Premier kill du Dragon Juvénile", etc.

### 1.3 Les illusions MMORPG à créer en premier

Pour donner une sensation de MMORPG, il faut:

1. **Illusion de monde partagé** — Le joueur doit voir que d'autres existent et influencent le monde
2. **Illusion de persistance** — Le monde change visiblement (boss killed, chests looted, zones verrouillées)
3. **Illusion de progression sociale** — Titres, réputation, rang dans les leaderboards
4. **Illusion d'exploration** — Zones cachées, secrets, découvertes publiques
5. **Illusion de rivalité** — Primes, classements, "premier à..."

### 1.4 Trous critiques à corriger dès l'early game

| Trou | Impact rétention | Priorité |
|------|------------------|----------|
| Pas de hub/ville | Le joueur n'a pas de "chez lui", pas de rencontre | 🔴 Critique |
| Pas de titres | Pas de statut visible, pas de reconnaissance | 🔴 Critique |
| Pas de "premier" / chronicles | Pas de record dAccomplissement public | 🔴 Critique |
| Pas de shop/échange | Pas de raison de chercher de l'or | 🟡 Moyen |
| Pas de Guilde utile | Pas de raison de socialiser | 🟡 Moyen |

---

## BLOC 2 — Priorisation early game / mid game

### Matrice de priorisation

| Feature | Classification | Rention J1-J7 | Identité MMORPG | Coût | Dépendances |
|---------|---------------|---------------|-----------------|------|-------------|
| **Ville hub + carte** | Indispensable early | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Faible | Aucune |
| **First clears + Chroniques** | Indispensable early | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Faible | Ville hub |
| **Titres + Display** | Indispensable early | ⭐⭐⭐ | ⭐⭐⭐⭐ | Faible | Aucune |
| **Influence / Réputation locale** | Très importante early | ⭐⭐ | ⭐⭐⭐ | Moyen | Ville hub, Titres |
| **Primes / Criminalité** | Transition early-mid | ⭐⭐ | ⭐⭐⭐⭐ | Moyen | Réputation, Titres |
| **Guilde utile** | Transition early-mid | ⭐⭐⭐ | ⭐⭐⭐⭐ | Élevé | Ville hub, Chat |
| **Boss publics régionaux** | Mid game | ⭐⭐ | ⭐⭐⭐ | Moyen | Zones, Chroniques |
| **Objets spéciaux transformants** | Mid game | ⭐⭐ | ⭐⭐⭐ | Moyen | Coffres existants |
| **Événements de zone** | Mid game | ⭐⭐ | ⭐⭐⭐ | Élevé | Boss publics |
| **Territoire / Stronghold** | Long terme | ⭐ | ⭐⭐ | Élevé | Guilde, Boss |

### Justification des classements

**Indispensable early (Top 3):**
1. **Ville hub + carte** — C'est le lieu de rendez-vous social. Sans ça, pas de MMORPG.
2. **First clears + Chroniques** — Donne une raison de jouer: être "premier"
3. **Titres** — La reconnaissance sociale est le premier moteur de rétention

**Très importante early:**
4. **Réputation locale** — Crée de lattachment aux lieux, prépare les primes

**Transition early-mid:**
5. **Primes/Criminalité** — Dépend de la réputation, ajoute de la rivalité
6. **Guilde utile** — Dépend de tout le reste, moteur social majeur

**Mid game:**
7. Boss publics, Objets transformants, Événements — Tout ce qui donne du contenu de groupe sans groupe

---

## BLOC 3 — Top 5 absolu à implémenter d'abord

### Choix final: Les 5 features prioritaires

1. **Ville hub + Carte du monde + Voyage rapide** (LA feature sociale centrale)
2. **Système de Titres + Display public** (Reconnaissance instantanée)
3. **Chroniques du serveur / First clears** (Competition et records)
4. **Réputation locale + NPCs de faction** (Implication dans le monde)
5. **Primes & Criminalité légère** (Rivalité et consequence sociale)

### Pourquoi ce top 5 est stratégique

| Feature | Impact onboarding | Sentiment "MMORPG" | Prépare |
|---------|-------------------|-------------------|---------|
| Ville hub | Le joueur a un "chez lui" | voit les autres, discute | Tout le reste |
| Titres | Fierté immédiate | Statut visible | Réputation, primes |
| Chroniques | Objectif clair | Le monde a une histoire | Boss publics |
| Réputation | Implication story | Le monde me reconnaît | Primes, guilde |
| Primes | Rivalité | Je peux être hunté | PvP, territoire |

### Ce que voit le joueur (aperçu)

- **Jour 1:** Il spawn → découvre la ville → voit les autres joueurs → choisit un titre → explore la carte → trouve sa première zone
- **Jour 2:** Il voit les chroniques "Premier à tuer X" → veut être premier → explore les zones cachées → gagne un titre
- **Jour 3:** Il gagne de la réputation → debloque des shops → voit des primes actives → peut en mettre sur d'autres
- **Jour 7:** Il a une guilde, des rivals, des cibles de primes

---

## BLOC 4 — Plan par feature prioritaire

### Feature 1: Ville hub + Carte du monde + Voyage

**Nom:** La Cité des Arènes

**But produit:** Créer le lieu central où tous les joueurs se retrouvent, échangent, et prepavent leurs expeditions.

**Fantasy joueur:** "Je retourne à la Cité après chaque expedition. C'est mon chez-moi. Là je vois qui est en ligne, je choisis où aller, je rencontre des alliés."

**Première apparition:** Dès la création de personnage (spawn dans la ville)

**Boucle joueur:**
1. Retourne en ville après combat
2. Voit la carte des zones
3. Achète/vend, parle aux NPCs
4. Voyage vers une zone
5. Revient -> repeat

**Récompenses:**
- Accès aux marchands (or -> items)
- Accès aux NPCs de faction (réputation)
- Tableau des primes actives
- Tableau des chroniques
- Voyage rapide (pas de grind de déplacement)

**Impact social:**
- Tableau "Joueurs en ligne" (anonymisé par titre)
- Chat de ville (voir les conversations)
- Présence visible des autres

**Impact monde persistant:**
- Coffres de la ville (quotidiens)
- NPCs avec état de réputation
- Events spéciaux dans la ville

**Intérêt early game:** 🔴 CRITIQUE - Sans ville, pas de hub social, pas de MMORPG

**Intérêt mid game:** ⭐⭐⭐⭐ - Hub pour les primes, guilde, voyages

**Dépendances:** Aucune (base)

**Version MVP:**
- 1 vue "Ville" avec:
  - Carte des 8 zones (cliquable pour voyager)
  - 3 marchands (arme, armure, consommable)
  - 3 NPCs faction (Guerrier, Mage, Assassin - pour réputation)
  - Tableau des Chroniclies (top 10 premiers)
  - Voyage instantané vers zone sélectionnée
- Pas de chat complet (simplement indicator de présence)

**Version V2:**
- Ajout du chat de ville
- Coffre quotidien de la ville
- PNJs avec quêtes simples
- Voyage vers positions spécifiques (ville <-> zones)

**Coût technique:** Faible (~2-3 jours)

**Risque principal:** Ne pas faire assez simple au début. Éviter:
- Pas de map géographique complexe
- Pas de multiples villes au début
- Pas de housing

---

### Feature 2: Système de Titres + Display public

**Nom:** Honneur & Gloire

**But produit:** Donner une identité visible à chaque joueur, créer de la reconnaissance sociale et de la fierté.

**Fantasy joueur:** "Je suis 'Premier Explorateur des Carrières'. Les autres me voient et savent que j'ai accompli quelque chose."

**Première apparition:** Dès le level 5 (premier titre automatique)

**Boucle joueur:**
1. Accomplit une action spécifique (tue boss, découvre zone, gagne combat)
2. Gagne un titre automatiquement
3. Le titre s'affiche à côté de son nom partout
4. D'autres joueurs voient ce titre

**Récompenses:**
- Titre automatiquement ajouté à la liste
- Affichage permanent (nom + titre dans tous les contexts)

**Impact social:**
- Les autres voient mon titre et savent ce que j'ai fait
- Competition pour les titres rares
- Titre devient identifiant social

**Impact monde persistant:**
- Les titres sont tieds aux Chroniclies (premier à X = titre)
- Certains titres sont temporairement monopolisables

**Intérêt early game:** 🔴 CRITIQUE - Donne une raison de jouer ("gagner un titre")

**Intérêt mid game:** ⭐⭐⭐⭐ - Titres de guilde, de prime, de réputation

**Dépendances:** Chroniclies (Feature 3) pour certains titres

**Version MVP:**
- 15-20 titres automatiques basés sur:
  - Level (Level 10, Level 20...)
  - Boss (Premier kill de chaque boss)
  - Zone (Première découverte de chaque zone cachée)
  - Combat (10 victoires, 50 victoires, 100 victoires...)
  - Or (Premier à 1000g, 10000g...)
- Affichage simple: [Nom] - [Titre]
- Pas de choix de titre (automatique)

**Version V2:**
- Titre sélectionnable parmis ceux gagnés
- Titres de faction (réputation)
- Titres temporaires (saison)
- Titre de guilde

**Coût technique:** Faible (~1-2 jours)

**Risque principal:**
- Trop de titres disponibles = dilution
- Titres trop facile = pas de valeur
- **ÉVITER: permettre aux joueurs de choisir leur titre librement sans l'avoir méritế**

---

### Feature 3: Chroniques du serveur / First clears

**Nom:** Les Chroniques des Arènes

**But produit:** Créer un journal public des accomplissements, donner des records à battre, créer de la competition.

**Fantasy joueur:** "Je suis le PREMIER à avoir tué le Dragon Juvénile. Mon nom est dans les Chroniques pour toujours."

**Première apparition:** Au premier combat dans une zone

**Boucle joueur:**
1. Tue un enemy avec un record (premier kill, plus de dmg, etc.)
2. L'événement est enregistré
3. Apparaît dans les Chroniques
4. Tous les joueurs peuvent voir

**Récompenses:**
- Titre automatique (pour "premier")
- Fierté personnelle
-激励 d'autres joueurs

**Impact social:**
- Competition pour être "premier"
- Les nouveaux veulent rejoindre les anciens
- Hiérarchie visible des accomplissements

**Impact monde persistant:**
- Les records sont permanents
- Certains records peuvent être battus
- Crée une "histoire" du serveur

**Intérêt early game:** 🔴 CRITIQUE - Donne un objectif clair: être premier

**Intérêt mid game:** ⭐⭐⭐⭐ - Plus de records, plus de competition

**Dépendances:** Ville hub (pour afficher les chroniques)

**Version MVP:**
- 3 types de records:
  - "Premier à tuer [Enemy Boss]"
  - "Premier à découvrir [Zone cachée]"
  - "Premier à ouvrir [Coffre rare/légendaire]"
- Tableau des 20 derniers records
- Format: [Date] [Joueur] [Action] [Zone]

**Version V2:**
- Plus de types de records (plus de dmg, plus de kills en une session)
- Leaderboards par zone
- Records de guilde (premier boss de guilde)
- "Histoire du serveur" (compilation mensuelle)

**Coût technique:** Faible (~1 jour)

**Risque principal:**
- Les records sont trop easy = pas de valeur
- Pas de "premier" après quelques jours = plus de motivation
- **ÉVITER: faire des records impossibles ou trop fáciles**

---

### Feature 4: Réputation locale + NPCs de faction

**Nom:** Factions & Influence

**But produit:** Créer un lien entre le joueur et le monde, donner des rewards pour des actions spécifiques, preparer le système de primes.

**Fantasy joueur:** "Je suis connu des Guerriers de la Cité. Ils me font des remise. Ils me confient des contrats."

**Première apparition:** Level 10+ (quand le joueur revient en ville)

**Boucle joueur:**
1. Effectue des actions dans une zone
2. Gagne de la réputation avec la faction liée
3. Monte en rang (Neutral -> Friendly -> Honored -> Revered)
4. Débloque des rewards à chaque rang

**Récompenses:**
- Réductions chez les marchands (5%/10%/15%/20%)
- Accès à des items exclusifs
- Titres de faction
- Debloque les primes

**Impact social:**
- Les autres voient mon rang de faction
- Competition pour les ranks
- Faction devient identity

**Impact monde persistant:**
- Factions ont des "ennemies" (autres factions)
- Possible guerre de faction (late game)

**Intérêt early game:** ⭐⭐⭐ - Ajoute de la profondeur rapidement

**Intérêt mid game:** ⭐⭐⭐⭐ - Central pour les primes et les guildes

**Dépendances:** Ville hub, Titres

**Version MVP:**
- 3 factions:
  - **Les Lames** (Guerrier/Paladin) - combat dans les zones easy
  - **Les Ombres** (Voleur/Assassin) - kills, vols
  - **Le Sanctuaire** (Mage/Prêtre) - exploration, secrets
- 4 rangs: Neutral, Connu, Honoré, Legend
- Actions trackables:
  - Tuer ennemis (Lames)
  - Voler avec succès (Ombres)
  - Découvrir des zones/secrets (Sanctuaire)
- Réductions commerciales simples

**Version V2:**
- Quêtes de faction quotidiennes
- Items de faction exclusifs
- Émissaires dans les zones
- Guerre de faction (si enough players)

**Coût technique:** Moyen (~3-4 jours)

**Risque principal:**
- Trop de grind pour monter en rang
- Factions trop complexes
- **ÉVITER: faire des actions de farm synonymes de réputation (le jouer doit sentir qu'il progresse naturellement)**

---

### Feature 5: Primes & Criminalité légère

**Nom:** Contrats & Chasses

**But produit:** Créer de la rivalité, des consequences sociales, et une raison de faire attention à sa réputation.

**Fantasy joueur:** "Quelqu'un a mis une prime sur ma tête. Je dois either payer ou hunter celui qui m'a viser."

**Première apparition:** Quand le joueur atteint le rang "Connu" dans une faction

**Boucle joueur:**
1. Effectue une action "criminelle" (tuer un joueur innocent, voler, etc.)
2. Un "contrat" peut être posé sur lui
3. D'autres joueurs peuvent accepter le contrat
4. Le chasseur est récompensé si il tue la cible
5. La cible peut payer pour lever la prime

**Récompenses:**
- Pour le chasseur: or + réputation
- Pour la cible: stress, mais aussi excitement
- Pour celui qui pose la prime: satisfaction

**Impact social:**
- Crée de la drama
- Les "criminels" deviennent des cibles
- Les "chasseurs" ont un role

**Impact monde persistant:**
- Primes visibles dans la ville
- "Liste des wanted"
- Criminal trackée publiquement

**Intérêt early game:** ⭐⭐ - Pas avant le mid game

**Intérêt mid game:** ⭐⭐⭐⭐⭐ - Moteur principal de rivalité

**Dépendances:** Réputation, Titres, Chroniques

**Version MVP:**
- Système léger:
  - Les joueurs peuvent mettre une prime sur un autre (coût: 1000g)
  - La prime expire après 24h
  - Anyone peut "accepter" (simplement: le premier à tuer la cible wins)
  - Pas de vraie "criminalité" - juste des primes optionnelles
- Tableau dans la ville: "Primes actives"

**Version V2:**
- vrai système de criminalité:
  - Tuer un "innocent" (player sans prime) = criminalité +1
  - Prime auto sur les criminels
  - Système de prison/ redemption
- Primes de guilde
- Primes internationales (tous les servers)

**Coût technique:** Moyen (~3 jours)

**Risque principal:**
- Abus (prime spam)
- Pas de enough players pour que ça marche
- **ÉVITER: implémenter un système trop complexe d'emblée. Commencer par des primes simples, volontaire.**

---

## BLOC 5 — Ordre d'implémentation recommandé

### Étape 1: Le Hub (Jours 1-3)

**Features:**
- Vue "Ville" avec carte des zones
- Voyage instantané zone <-> ville
- 3 marchands basiques
- Display "Joueurs en ligne" (simple counter)

**Pourquoi cet ordre:**
- C'est la foundation de tout le reste
- Sans hub, pas de Chroniclies, pas de primes, pas de rencontre sociale

**Ce que ça débloque:**
- Toutes les autres features peuvent être affichées dans la ville

**Gain immédiat:**
- Le joueur a un "chez lui"
- Il peut voir où aller
- Il a une raison de revenir

---

### Étape 2: Titres & Display (Jours 4-6)

**Features:**
- 15-20 titres automatiques
- Affichage [Nom] - [Titre] partout
- Pas de sélection (automatique)

**Pourquoi cet ordre:**
- Dépend de très peu de chose
- Ajoute immédiatement de l'identité

**Ce que ça débloque:**
- Prépare les titres de faction
- Prépare les Chroniclies

**Gain immédiat:**
- Le joueur a quelque chose à montrer
- Il veut gagner plus de titres
- Il voit les titres des autres

---

### Étape 3: Chroniques (Jours 7-9)

**Features:**
- 3 types de records (premier kill boss, découverte zone, ouverture coffre)
- Tableau des 20 derniers
- Titre automatique pour les "premiers"

**Pourquoi cet ordre:**
- Dépend de la ville (pour afficher)
- Dépend des titres (pour donner)

**Ce que ça débloque:**
- Competition entre joueurs
- Boss publics (plus tard)
- Histoire du serveur

**Gain immédiat:**
- Le joueur veut être "premier"
- Il a un objectif clair
- Il voit que d'autres jouent

---

### Étape 4: Réputation (Jours 10-14)

**Features:**
- 3 factions
- 4 rangs par faction
- Réductions commerciales
- Tracking des actions

**Pourquoi cet ordre:**
- Dépend de la ville (NPCs)
- Dépend des titres (pour les titres de faction)

**Ce que ça débloque:**
- Primes
- Quêtes de faction
- Guilde (préparation)

**Gain immédiat:**
- Le joueur a un reason d'agir dans certaines zones
- Il se sent "connecté" au monde
- Il a des rewards tangibles

---

### Étape 5: Primes (Jours 15-18)

**Features:**
- Système de prime simple (poser, expirée, gagner)
- Tableau des primes actives
- Pas de criminalité automatique

**Pourquoi cet ordre:**
- Dépend de la réputation (pour unlock)
- Dépend des Chroniclies (pour crédibilité)

**Ce que ça débloque:**
- PvP contexte
- Rivalité
- Territory (plus tard)

**Gain immédiat:**
- Le joueur peut créer de la competition
- Il y a une reason de PvP en dehors de l'Arena

---

## BLOC 6 — Implémentation simple mais solide

### Feature 1: Ville hub + Carte

**Logique backend:**
```
GET /api/city - Retourne:
  - zones: [{id, name, minLevel, difficulty, isUnlocked}]
  - merchants: [{id, name, type, inventory}]
  - playerCount: number
  - playerReputations: {faction: {rank, value}}
```

**État joueur:**
- `currentZoneId`: zone actuelle ou null (ville)
- `reputation`: {factionId: {rank, value}}
- `titles`: string[]

**Structure de données:**
```prisma
model Zone {
  id          String
  name        String
  worldX      Int
  worldY      Int
  minLevel    Int
  isUnlocked  Boolean  // default false, débloqué par niveau ou quête
  isHub       Boolean  // true pour la ville
}
```

**Événements:**
- Voyage: POST /api/travel {zoneId}
- Achat: POST /api/merchant/buy {itemId, quantity}
- Vente: POST /api/merchant/sell {inventorySlotId}

**UI:**
- Ville: 1 écran avec map cliquable, marchands, panel d'informations
- Zone: même combat, mais bouton "Retour Ville"

---

### Feature 2: Titres

**Logique backend:**
```typescript
const TITLE_RULES = [
  { id: 'level_10', condition: (p) => p.level >= 10, name: 'Combattant Expérimenté' },
  { id: 'first_boss', condition: (p) => p.firstBossKill !== null, name: 'Tueur de Dragons' },
  // ... 15-20 rules
]

function checkAndGrantTitles(player) {
  for each rule in TITLE_RULES:
    if rule.condition(player) AND !player.titles.includes(rule.id):
      player.titles.push(rule.id)
      notifyPlayer("Vous avez gagné le titre: " + rule.name)
}
```

**Affichage:**
- API retourne `character: {name, title, class}`
- Tous les displays utilisent ce format

**UI:**
- Panel "Mes Titres" dans le profile
- Tooltip sur hover du nom显示 titre complet

---

### Feature 3: Chroniques

**Logique backend:**
```typescript
// Premier kill boss
async function recordBossKill(playerId, enemyId, zoneId) {
  const enemy = await getEnemy(enemyId)
  if (!enemy.isBoss) return
  
  const existing = await prisma.serverRecord.findFirst({
    where: { type: 'BOSS_KILL', targetId: enemyId }
  })
  
  if (!existing) {
    await prisma.serverRecord.create({
      data: {
        type: 'BOSS_KILL',
        playerId,
        targetId: enemyId,
        zoneId,
        timestamp: new Date()
      }
    })
    // Grant title
    await grantTitle(playerId, 'first_kill_' + enemyId)
  }
}
```

**Stockage:**
```prisma
model ServerRecord {
  id        String   @id
  type      String   // BOSS_KILL, ZONE_DISCOVERY, CHEST_OPEN
  playerId  String
  targetId  String?  // enemy/zone/chest ID
  zoneId    String?
  timestamp DateTime @default(now())
}
```

**UI:**
- Tableau "Chroniques" dans la ville
- Affichage: Date | Joueur | Action | Lieu

---

### Feature 4: Réputation

**Logique backend:**
```typescript
const FACTION_ACTIONS = {
  'les_lames': {
    action: 'KILL_ENEMY',
    zones: ['zone_carrieres', 'zone_marais'],
    value: 1
  },
  'les_ombres': {
    action: 'STEAL_SUCCESS',
    value: 5
  },
  'le_sanctuaire': {
    action: 'DISCOVER_SECRET',
    value: 10
  }
}

async function addReputation(playerId, action, zoneId) {
  for factionId, config of FACTION_ACTIONS:
    if config.action === action:
      current = await getReputation(playerId, factionId)
      newValue = current.value + config.value
      
      // Check rank thresholds
      newRank = getRank(newValue) // Neutral -> Connu -> Honoré -> Legend
      
      await updateReputation(playerId, factionId, newValue, newRank)
}
```

**Rangs:**
- Neutral: 0-99
- Connu: 100-499
- Honoré: 500-1999
- Legend: 2000+

**UI:**
- NPCs de faction avec indicateur de rang
- Tooltip: "Réputation: Connu (150/500)"
- Réductions appliquées automatiquement dans les shops

---

### Feature 5: Primes

**Logique backend:**
```typescript
// Poser une prime
async function placeBounty(targetPlayerId, amount, placerPlayerId) {
  const placer = await getPlayer(placerPlayerId)
  if (placer.gold < amount) throw "Pas assez d'or"
  
  await db.updatePlayer(placerId, { gold: -amount })
  
  const bounty = await prisma.bounty.create({
    data: {
      targetId: targetPlayerId,
      placerId: placerPlayerId,
      amount,
      expiresAt: new Date(Date.now() + 24*60*60*1000)
    }
  })
}

// Accepter une prime (le premier à kill dans les 24h)
async function killTarget(targetId, killerId) {
  const bounty = await prisma.bounty.findFirst({
    where: { targetId, status: 'ACTIVE', expiresAt: { gt: new Date() } }
  })
  
  if (bounty) {
    await db.updatePlayer(killerId, { gold: +bounty.amount })
    await prisma.bounty.update(bounty.id, { 
      status: 'CLAIMED', 
      claimedBy: killerId,
      claimedAt: new Date()
    })
  }
}
```

**Stockage:**
```prisma
model Bounty {
  id          String   @id
  targetId    String
  placerId    String
  amount      Int
  status      String   @default("ACTIVE") // ACTIVE, CLAIMED, EXPIRED
  expiresAt   DateTime
  claimedAt   DateTime?
  claimedBy   String?
}
```

**UI:**
- Panel "Primes Actives" dans la ville
- "Mettre une prime" avec input de nom de cible + gold
- Notification quand prime claimée

---

## BLOC 7 — Early game concret

### Experience nouveau joueur (J0-J1)

**Minute 0-5: Création**
- Choix du nom, de l'Origine, de la Classe
- **APPEL À L'ACTION:** "Bienvenue dans GladiArena. Votre aventure commence."

**Minute 5-15: Découverte de la Ville**
- Spawn dans la Cité
- Voit la carte: "Les Carrieres (Niv 1-10)" | "Les Marais..."
- **PREMIÈRE IMPRESSION:** "Il y a plusieurs endroits à explorer"
- Panel "12 joueurs en ligne" - **ILLUSION: Je ne suis pas seul**

**Minute 15-30: Premier combat**
- Voyage vers "Les Carrieres"
- Fight premier enemy (Esclave Affaibli)
- Win -> XP + gold
- **NOTIFICATION:** "Vous avez gagné: +10 XP, +5 Or"

**Minute 30-45: Exploration**
- Explore la zone, trouve un coffre
- **NOTIFICATION:** "Coffre ouvert: +30 Or"
- Revient en ville
- Voit le tableau des Chroniclies:
  - "Hier: LÉGENDAR a découvert Les Marais"
  - "Hier: DarkWarrior a tué le Chef des Brigands"

**Minute 45-60: Objectif clair**
- Se dit: "Je veux être premier dans quelque chose"
- Retourne dans les Carrieres
- Tue plus d'ennemis
- **NOTIFICATION:** "Félicitations! Vous avez gagné le titre: 'Combattant' (5 victoires)"

**Fin J1:**
- Level 2-3
- Titre: "Combattant"
- A vu les Chroniclies
- Sait qu'il y a des zones plus dures

---

### Experience joueur дней 2-5

**Jour 2:**
- Retourne en ville
- Voit les NPCs de faction
- Choisit d'aider "Les Lames" en tuant des ennemis dans les Carrieres
- **NOTIFICATION:** "Réputation +1 avec Les Lames (Connu: 1/100)"
- Achète une arme au marchand (or gagné)

**Jour 3:**
- Continue à farm dans les Carrieres
- Monte au rang "Connu" chez Les Lames
- **RÉCOMPENSE:** "Remise 5% chez le marchand d'armes"
- Voit une prime active: "Prime sur JoueurX: 1000g"
- Se dit: "Intéressant..."

**Jour 4-5:**
- Débloque les Marais (level 10+)
- Voyage vers les Marais
- Tue le Troll des Hauteurs (premier boss)
- **CHRONIQUE:** "Joueur a tué le Troll des Hauteurs (PREMIER)"
- **TITRE:** "Tueur de Trolls"
- **NOTIFICATION:** "Vous êtes le PREMIER à avoir tué le Troll des Hauteurs!"

**Résultat après 5 jours:**
- Level ~12
- Réputation: Connu chez 1-2 factions
- Titres: Combattant, Tueur de Trolls
- A vu les Chroniclies
- Connaît le système de primes
- A acheté des équipements
- **SE SENT:** "Je suis dans un vrai jeu, avec d'autres joueurs, avec une histoire"

---

## BLOC 8 — Transition vers le mid game

### Ce que le mid game apporte

Le mid game (niveaux 20-40) doit être perçu comme l'évolution naturelle de l'early game:

| Early Game (1-19) | Mid Game (20-40) | Évolution |
|-------------------|------------------|------------|
| Farm zone solo | Zone à plusieurs (mêmes zones, plus de players) | Socialisation naturelle |
| Titres solos | Titres de guilde | Socialisation.group |
| Chroniclies perso | Chroniclies de guilde | Competition.group |
| Réputation individuelle | Primes, rivalités | Conflict.social |
| Boutique basique | Boutique de faction (items spéciaux) | Progression.perso |

### L'arche de transition

**Niveau 15:** Advanced class unlock
- Le joueur voit les autres avec leurs classes avancées
- **ILLUSION:** "D'autres progressent comme moi"

**Niveau 20:** Guilde unlock
- Le joueur peut créer/rejoindre une guilde
- **ILLUSION:** "Je ne suis plus seul"
- Fonctionnalités: Chat de guilde, Stats de guilde, Leaderboards

**Niveau 25:** Boss régional public
- Boss spawn toutes les X heures dans une zone
- **ILLUSION:** "On peut fight ensemble (ou voir les autres essayer)"
- Premier à tuer gets: Titre + Chroniclie + Récompense

**Niveau 30:** Primes actives
- Le joueur a assez de réputation pour voir/poser des primes
- **ILLUSION:** "Je peux être hunté"
- Fonctionnalités: Liste des wanted, Système de bounty

**Niveau 35:** Territory léger
- Les guildes peuvent claim un "point" dans une zone
- **ILLUSION:** "Ma guilde a un territory"
- Fonctionnalités: Buff de zone, Taxe sur loot

### Comment l'early game prépare naturellement

| Feature Early | Prépare Mid |
|--------------|-------------|
| Ville hub | Lieu de rencontre guilde |
| Titres | Titres de guilde (display) |
| Chroniclies | Chroniclies de guilde (compétition) |
| Réputation | Primes (système social) |
| Voyage | Territory (zones controlées) |

**Pas de rupture:** Le joueur continue d'utiliser la ville, les Chroniclies, la réputation - mais maintenant avec une dimension sociale/guilde.

---

## BLOC 9 — Recommandation finale

### 1. Les 3 features à implémenter IMMÉDIATEMENT

| # | Feature | Pourquoi |
|---|---------|----------|
| 1 | **Ville hub + Carte + Voyage** | Foundation de tout - sans ça, le jeu n'a pas de centre |
| 2 | **Système de Titres** | Donne de l'identité immédiatement, fort impact rétention |
| 3 | **Chroniclies / First clears** | Donne un objectif clair, crée de la competition, fait voir le monde comme partagé |

**Impact attendu:** En 1 semaine, le jeu passe de "zones + monstres" à "un monde avec d'autres joueurs, des records à battre, une identité"

---

### 2. Les 2 features à préparer en parallèle mais sortir plus tard

| # | Feature | Timing | Dépendance |
|---|---------|--------|------------|
| 1 | **Réputation + NPCs faction** | Sprint 2 | Ville hub, Titres |
| 2 | **Primes / Criminalité** | Sprint 3 | Réputation, Chroniclies |

**Pourquoi en parallèle:**
- Réputation: 3-4 jours, dépend de la ville et des titres
- Primes: 3 jours, mais peut être lancé une fois que Chroniclies et réputation sont en place
- On peut faire les designs de primes pendant l'implémentation de réputation

---

### 3. Les 3 erreurs à éviter ABSOLUMENT

1. **Vouloir tout faire en même temps**
   - Commencer par la ville, les titres, les Chroniclies - rien d'autre
   - Erreur: Implémenter les primes sansChroniclies (pas de crédibilité)

2. **Faire des systèmes trop complexes dès le début**
   - Erreur: 5 factions avec 10 rangs chacune, 50 quêtes par faction
   - Bon: 3 factions, 4 rangs simples, actions de farm = réputation

3. **Négliger l'interface de la ville**
   - Erreur: Ville = simple bouton "Voyager"
   - Bon: Ville = destination attractive, avec des NPCs, des informations, une vie sociale virtuelle

---

### 4. Roadmap recommandée sur 4 sprints

| Sprint | Durée | Features | Objectif |
|--------|-------|----------|----------|
| **Sprint 1** | 5 jours | Ville hub + Carte + Voyage | ✅ Fondations sociales |
| **Sprint 2** | 4 jours | Titres + Display | ✅ Identité du joueur |
| **Sprint 3** | 3 jours | Chroniclies | ✅ Competition & records |
| **Sprint 4** | 5 jours | Réputation + NPCs faction | ✅ Implication dans le monde |

**Total: ~17 jours (4 sprints) pour l'early game complet**

---

### 5. Stratégie pour faire croire que c'est un MMORPG vivant

**L'illusion principale:** *Le joueur ne doit pas se sentir seul*

| Élément | Technique d'illusion |
|---------|----------------------|
| **Presence des autres** | Counter "12 joueurs en ligne" +慢性lies (ils existent) |
| **Monde partagé** | Records publics (ils agissent) |
| **Progression visible** | Titres affichés (ils progressent) |
| **Rivalité** | Primes (ils peuvent se hunt) |
| **Communauté** | Chat de guilde + Chroniclies de guilde |

**Règle d'or:** Le joueur doit toujours sentir qu'il y a:
1. Quelqu'un qui a fait mieux (Chroniclies)
2. Quelqu'un qui peut le battre (primes)
3. Quelqu'un avec qui coopérer (guildes - later)

**En 3 semaines de développement, le jeu sera perçu comme un MMORPG avec:**
- Un hub social (la ville)
- Une identite personalisee (titres)
- Une competition permanente (Chroniclies)
- Un monde qui evolue (réputation + primes)

---

### Résumé Executif

```
SPRINT 1 (J1-J5): VILLE + CARTE
├── Vue "Cité des Arènes"
├── Carte cliquable (8 zones)
├── Voyage instantané
├── 3 marchands
└── Counter joueurs en ligne

SPRINT 2 (J6-J9): TITRES
├── 20 titres automatiques
├── Affichage [Nom] - [Titre]
└── Panel titres

SPRINT 3 (J10-J12): CHRONICULES
├── Tableau records (boss, zone, coffre)
├── Titre "Premier" automatique
└── 20 derniers événements

SPRINT 4 (J13-J17): RÉPUTATION
├── 3 factions
├── 4 rangs chacune
├── Réductions marchands
└── Tracking actions
```

**Prochaine étape:** Commencer par l'implémentation de la ville. C'est la feature la plus importante et la moins risquée.

---

*Document préparé pour GladiArena - Lead Game Designer*
*Priorité: On ne fait pas un "最大" jeu, on fait un jeu qui PARAIT huge.*
