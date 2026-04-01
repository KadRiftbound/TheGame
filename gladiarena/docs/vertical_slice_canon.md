# SLICE VERTICALE — DOCUMENT CANON V2

## 1. VILLE DE DÉPART CANON

### Identité

| Champ | Valeur |
|-------|--------|
| **Nom** | Bastion de Fer |
| **Surnom** | La Forge du Seuil |
| **Fantasy** | Ville-frontière industrielle, sombre, resistente. Bâtie autour de forges massives au bord d'un territoire minier rongé par une corruption ancienne. |

### Structure — 4 Quartiers

```
[PORTE NORD] ─────► [PLACE CENTRALE]
                      ▲ ▲ ▲
               [STATUE] [FONTAINE] [PNJ]
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
[QUARTIER      [QUARTIER     [HAUTES TOURS]
 OUVRIER]     MARCHAND]
- Taverne     - Marchands  - Guilde des Forgerons
- Forgeron    - Banquier   - Chroniques
- Auberge     - Voyage     - Quêtes
```

**Place Centrale** (spawn, orientation, statue du Premier Forgeron, fontaine noircie)  
**Quartier Ouvrier** (soin, craft, repos, PNJ quête)  
**Quartier Marchand** (commerce, voyage, banker)  
**Hautes Tours** (guildes, chroniques, contrats, titres)

### Services

| Service | Lieu | Fonction |
|---------|------|----------|
| Soin (taverne) | Quartier Ouvrier | Restauration, quêtes |
| Forgeron | Quartier Ouvrier | Craft, réparation |
| Auberge | Quartier Ouvrier | Repos, save |
| Marchands | Quartier Marchand | Achat/vente équipements |
| Banquier | Quartier Marchand | Stockage |
| Voyage | Quartier Marchand | Terminal de voyage |
| Guilde | Hautes Tours | Réputation, progression |
| Chroniques | Hautes Tours | Titres, accomplissements |

---

## 2. ZONES DE JEU CANON

### Vue d'ensemble

| Zone | Niveaux | Type | Micro-zones | Danger |
|------|---------|------|--------------|--------|
| **Carrières Noires** | 1-10 | Proche | 6 | Moyen |
| **Anciens Puits** | 5-15 | Intermédiaire | 5 | Élevé |
| **Forges des Cendres** | 8-18 | Intermédiaire | 5 | Élevé |
| **Galeries Souterraines** | 12-25 | Dangereuse | 5 | Très élevé |

### 2.1 LES CARRIÈRES NOIRES (Zone proche)

**Description** : Les anciennes mines de fer au nord de la ville. Kobolds pillards et mineurs corrompus rôdent dans les galeries.

| # | Micro-zone | Danger | Description |
|---|------------|--------|-------------|
| 1 | Campement Externe | Faible | Camp de kobolds, feux qui fument |
| 2 | Chemin des Déblais | Faible | Route bordée de charrettes abandonnées |
| 3 | Halle des Travaux | Moyen | Grande halle désaffectée, mineurs corrompus |
| 4 | La Veine Sèche | Moyen+ | Galerie avec minerai lumineux, coffre caché |
| 5 | Le Puits Abandonné | Moyen+ | Puits descendant dans l'obscurité |
| 6 | Galerie Profonde | Élevé | Repaire des kobolds, boss Krag le Brûle-Puits |

### 2.2 LES ANCIENS PUITS (Zone intermédiaire)

**Description** : Les puits les plus anciens de la mine, abandonnés depuis des décennies. Quelque chose y vit encore.

| # | Micro-zone | Danger | Description |
|---|------------|--------|-------------|
| 1 | L'Entrée Obstruée | Moyen | Entrée partiellement effondrée |
| 2 | La Grande Caisse | Moyen | Salle avec caisses de minerai abandonné |
| 3 | Le Reverdir | Élevé | Zone où la corruption perce dans les murs |
| 4 | La Galerie Effondrée | Élevé | Tunnel dangereux mais court |
| 5 | Le Fond du Puits | Très élevé | Le fond du vieux puits, obscurité totale |

### 2.3 LES FORGES DES CENDRES (Zone intermédiaire)

**Description** : Les forges anciennes où l'on brûlait les mineurs corrompus. La chaleur est insupportable et les spectres hantent les fours.

| # | Micro-zone | Danger | Description |
|---|------------|--------|-------------|
| 1 | Les Hauts Fourneaux | Élevé | Anciens fours encore actifs, golems de lave |
| 2 | La Galerie des Cendres | Élevé | Couloir plein de cendres et de ruines |
| 3 | Le Creuset | Très élevé | Cœur des forges, boss Gardien des Cendres |
| 4 | La Salle des Épées | Élevé | Salle pleine d'armes plantées |
| 5 | La Cheminée Centrale | Très élevé | Conduit vers la surface, sortie secrète |

### 2.4 LES GALERIES SOUTERRAINES (Zone dangereuse)

**Description** : Un réseau de galeries oubliées sous les Carrières. L'obscurité est totale et quelque chose de bien plus ancien que les kobolds y dort.

| # | Micro-zone | Danger | Description |
|---|------------|--------|-------------|
| 1 | L'Entrecroisement | Très élevé | Intersection de multiples galeries |
| 2 | La Chambre de l'Écho | Très élevé | Salle où le son résonne, secret rare |
| 3 | Le Puits Sans Fond | Très élevé | Puits descendant plus profond que tout |
| 4 | La Nécropole Oubliée | Extrême | Crypte de tombes, boss Comte des Mines |
| 5 | La Sortie Secrète | Très élevé | Sortie cachée vers zone inconnue |

---

## 3. DONJON

### Galeries du Premier Puits (Standard, Niveau 10)

| Salle | Index | Type | Description |
|-------|-------|------|-------------|
| Entrée | 0 | Combat | Gardien kobold |
| La Bifurcation | 1 | Choix | Forge vs Ténèbres |
| La Forge Brûlante | 2A | Combat + Coffre | Mineurs corrompus |
| Les Ténèbres | 2B | Combat | Spectres |
| Chambre du Premier Forgeron | 4 | Boss | Premier Forgeron Déchu (HP:450) |

---

## 4. ZONES SECRÈTES

| Secret | Condition | Niveau | Danger |
|--------|-----------|--------|--------|
| **Crypte de la Première Forge** | Titre: Forgeron Élite | 10 | Élevé |
| **Le Passage Oublié** | Chance aléatoire | 15 | Très élevé |

---

## 5. PROGRESSION DU JOUEUR

### Phase 1 (0-15 min) — Orientation
- Ville: Place Centrale → Quartier Ouvrier → Quartier Marchand
- Sortie vers Carrières Noires via Porte Nord

### Phase 2 (15-45 min) — Apprentissage
- Carrières Noires zones 1-3
- Retour en ville pour vendre/équiper
- Comprendre l'attrition

### Phase 3 (45-90 min) — Engagement
- Carrières Noires zones 4-6
- Galerie Profonde (micro-donjon)
- Premier boss: Krag le Brûle-Puits

### Phase 4 (90+ min) — Extension
- Anciens Puits (niveau 5+)
- Forges des Cendres (niveau 8+)
- Galeries Souterraines (niveau 12+)
- Donjon: Galeries du Premier Puits

---

## 6. DIRECTION VISUELLE

### Palette

| Couleur | Usage | Émotion |
|---------|-------|--------|
| Gris anthracite | Murs, pavement | Dur, industriel |
| Orange forge | Forges, flammes | Chaleur, danger |
| Brun suie | Bois, cuir | Artisanal, usé |
| Bleu froid | Acier, ombres | Métallique, distant |
| Noir | Corruption, ombres | Mystère, menace |

### Shots image prioritaires

1. **Place Centrale de jour** — Statue, fontaine noircie, forges en arrière-plan
2. **Quartier Ouvrier au crépuscule** — Forges actives, lumière orange
3. **Porte Nord vers les Carrières** — Seuil ville/sécurité
4. **Carrières Noires — Vue d'ensemble** — Toutes les 6 zones
5. **Anciens Puits — Le Reverdir** — Corruption visible
6. **Forges des Cendres — Le Creuset** — Feu et danger
7. **Galeries Souterraines — La Nécropole** — Horreur
8. **Donjon — Chambre du Boss** — Premier forgeron déchu

---

*Document canon v2 — Complete*