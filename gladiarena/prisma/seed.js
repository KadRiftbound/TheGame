import 'dotenv/config'
import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const db = new Database(dbPath)

// INSERT statements
const insertOrigin = db.prepare(`
  INSERT OR REPLACE INTO Origin (id, name, description, icon, bonuses, isSecret) 
  VALUES (?, ?, ?, ?, ?, ?)
`)

const insertClass = db.prepare(`
  INSERT OR REPLACE INTO CharacterClass (id, name, description, icon, baseBonuses, tier, category, role, unlockHint, unlockCondition, prerequisites, isSecret, maxPerServer, primaryStrength, weakness, costToUnlock, specialAbility, forbiddenCombos) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

// ... (need to add all INSERT statements)

function runMicroZone(...args) {
  insertMicroZone.run(...args)
}

function runDungeonRoom(...args) {
  insertDungeonRoom.run(...args)
}

async function seed() {
  console.log('🌱 Seeding database...')
  
  db.exec('PRAGMA foreign_keys = OFF')
  
  db.exec('DELETE FROM ZoneEnemy')
  db.exec('DELETE FROM Quest')
  db.exec('DELETE FROM Zone')
  db.exec('DELETE FROM MicroZone')
  db.exec('DELETE FROM DungeonRoom')
  db.exec('DELETE FROM ItemSuffix')
  db.exec('DELETE FROM ItemPrefix')
  db.exec('DELETE FROM ItemBase')
  db.exec('DELETE FROM ItemRarity')
  db.exec('DELETE FROM CharacterClass')
  db.exec('DELETE FROM Origin')
  db.exec('DELETE FROM ServerUniqueItem')
  db.exec('DELETE FROM Dungeon')
  db.exec('DELETE FROM SecretZone')
  db.exec('DELETE FROM SafePoint')
  db.exec('DELETE FROM Title')
  db.exec('DELETE FROM City')
  db.exec('DELETE FROM Faction')

  // ===== ORIGINS =====
  insertOrigin.run('origin_orphelin', 'Orphelin des rues', 'S\'est débrouillé seul dans les ruelles.', '🏚️', '{"goldBonus": 10, "stealChance": 5}', 0)
  insertOrigin.run('origin_novice', 'Ancien novice', 'A fui un temple avant ses voeux.', '⛪', '{"xpBonus": 10, "healingPower": 5}', 0)
  insertOrigin.run('origin_mercenaire', 'Mercenaire', 'A combattu pour quiconque payait.', '⚔️', '{"attack": 10, "damageBonus": 5}', 0)
  insertOrigin.run('origin_erudit', 'Érudit ruiné', 'A tout perdu en cherchant des connaissances.', '📜', '{"secretFind": 15, "critChance": 5}', 0)

  // ===== BASE CLASSES =====
  insertClass.run('guerrier', 'Guerrier', 'Combattant robuste. Maîtrise les armes et le bouclier.', '⚔️', '{"attack": 10, "defense": 10, "hp": 10}', 'base', 'warrior', 'tank', null, '{"level": 1}', '{"origin": ["origin_mercenaire", "origin_orphelin"]}', 0, null, 'ATK+DEF+HP +10%', 'Pas de spécialisation extrême', null, 'Coup puissant', null)
  insertClass.run('voleur', 'Voleur', 'Expert en discrétion. Frappe vite et vole.', '🗡️', '{"agility": 15, "dodge": 10, "critChance": 10}', 'base', 'rogue', 'dps', null, '{"level": 1}', '{"origin": ["origin_orphelin", "origin_erudit"]}', 0, null, 'AGI+CRIT +15%', 'Faible défense', null, 'Furtivité', null)
  insertClass.run('mage', 'Mage', 'Maître des arts occultes. Puissant mais fragile.', '🔮', '{"attack": 20, "critChance": 5, "hp": -15}', 'base', 'mage', 'dps', null, '{"level": 1}', '{"origin": ["origin_erudit", "origin_novice"]}', 0, null, 'ATK +20%', 'HP -15%', null, 'Boule de feu', null)
  insertClass.run('pretre', 'Prêtre', 'Serviteur du divin. Peut heal et protéger.', '✨', '{"hp": 15, "healingPower": 10, "defense": 5}', 'base', 'priest', 'healer', null, '{"level": 1}', '{"origin": ["origin_novice", "origin_mercenaire"]}', 0, null, 'HP+HEAL +15%', 'DPS limité', null, 'Bénédiction', null)

  // ===== ADVANCED CLASSES =====
  insertClass.run('assassin', 'Assassin', 'Expert en lethalité. Crits massifs.', '🗡️', '{"critChance": 35, "critDamage": 50, "attack": 15, "dodge": 15}', 'advanced', 'rogue', 'dps', 'Niveau 15+', '{"level": 15, "class": "voleur"}', '{"class": "voleur", "level": 15}', 0, null, 'CRIT +35%', 'Très fragile', null, 'Coup mortel', null)
  insertClass.run('paladin', 'Paladin', 'Chevalier saint. Défenseur né.', '⚜️', '{"defense": 25, "hp": 30, "healingPower": 20}', 'advanced', 'warrior', 'tank', 'Niveau 15+', '{"level": 15, "class": "guerrier"}', '{"class": "guerrier", "level": 15}', 0, null, 'DEF+HP +30%', 'DPS moyen', null, 'Aura sacrée', '["assassin"]')
  insertClass.run('sorcier', 'Sorcier', 'Mage destructeur. Puissant mais fragile.', '🔮', '{"attack": 30, "critChance": 15, "hp": -20}', 'advanced', 'mage', 'dps', 'Niveau 15+', '{"level": 15, "class": "mage"}', '{"class": "mage", "level": 15}', 0, null, 'ATK +30%', 'HP -20%', null, 'Boule de feu', null)
  insertClass.run('ranger', 'Ranger', 'Archer sauvage. Esquive et distance.', '🏹', '{"attack": 18, "dodge": 20, "critChance": 15}', 'advanced', 'rogue', 'dps', 'Niveau 15+', '{"level": 15, "class": "voleur"}', '{"class": "voleur", "level": 15}', 0, null, 'DODGE +20%', 'Pas de tank', null, 'Tir rapide', null)
  insertClass.run('gardien', 'Gardien', 'Mur vivant. Provoke les ennemis.', '🏰', '{"defense": 40, "hp": 50, "attack": -10}', 'advanced', 'warrior', 'tank', 'Niveau 20+', '{"level": 20, "class": "guerrier"}', '{"class": "guerrier", "level": 20}', 0, null, 'DEF+HP +50%', 'ATK -10%', null, 'Mur de fer', null)
  insertClass.run('fleau', 'Fléau', 'Destruction massive. Dégâts de zone.', '💥', '{"attack": 35, "areaDamage": 50, "defense": -15}', 'advanced', 'mage', 'dps', 'Niveau 20+', '{"level": 20, "class": "mage"}', '{"class": "mage", "level": 20}', 0, null, 'ATK+AOE +50%', 'DEF -15%', null, 'Tempête', null)
  insertClass.run('pretre_lumiere', 'Prêtre de la Lumière', 'Serviteur de la lumière sacrée. Guérisseur puissant.', '☀️', '{"healingPower": 35, "hp": 25, "defense": 15, "attack": -10}', 'advanced', 'priest', 'healer', 'Niveau 15+', '{"level": 15, "class": "pretre"}', '{"class": "pretre", "level": 15}', 0, null, 'HEAL +35%, DEF +15%', 'ATK -10%', null, 'Rayon de Soleil', null)
  insertClass.run('pretre_ombre', 'Prêtre de l\'Ombre', 'Serviteur des ténèbres. Puissance obscure.', '🌙', '{"attack": 25, "critChance": 20, "healingPower": 15, "hp": -10}', 'advanced', 'priest', 'dps', 'Niveau 15+', '{"level": 15, "class": "pretre"}', '{"class": "pretre", "level": 15}', 0, null, 'ATK +25%, CRIT +20%', 'HP -10%', null, 'Flasque d\'Ombre', null)

  // ===== RARE CLASSES =====
  insertClass.run('danse_lame_neant', 'Danse-lame du Néant', 'Une lame qui coupe entre les dimensions.', '🌑', '{"attack": 40, "critChance": 25, "critDamage": 75, "dodge": 20, "hp": -10}', 'rare', 'rogue', 'dps', '"Meurs trois fois dans l\'ombre"', '{"deathsInZone": {"zone": "zone_ombre", "count": 3}}', '{"level": 15}', 1, null, 'ATK+CRIT +40%', 'HP -10%', 'Ne peut pas fuir', 'Lame dimensionnelle', '["paladin", "gardien"]')
  insertClass.run('voleur_tempete', 'Voleur Tempête', 'La foudre dance entre ses doigts.', '⚡', '{"critChance": 30, "dodge": 35, "attack": 25, "goldBonus": 50}', 'rare', 'rogue', 'utility', '"Les sacs les plus lourds..."', '{"gold": 10000, "successfulSteals": 50}', '{"level": 10}', 1, null, 'GOLD+STEAL +50%', 'Prix Marchand +50%', 'Réputation de voleur', 'Vol de destin', null)
  insertClass.run('pelgrin_cendres', 'Pèlerin des Cendres', 'Il a traversé le feu.', '🔥', '{"hp": 50, "defense": 20, "fireResist": 75, "healingReceived": -50}', 'rare', 'warrior', 'tank', '"Approche le volcan..."', '{"exploreNoArmor": {"zone": "zone_volcan"}}', '{"level": 25}', 1, null, 'FIRE RESIST +75%', 'Healing -50%', 'Vulnérabilité aux soins', 'Cendres vivantes', null)
  insertClass.run('oracle_aveugle', 'Oracle Aveugle', 'Il voit tout sauf la lumière.', '👁️', '{"critChance": 25, "healingPower": 40, "dodge": 25, "foresight": 15}', 'rare', 'priest', 'utility', '"Refuse le premier conseil..."', '{"refusedOffers": 3}', '{"level": 20}', 1, null, 'FORESIGHT +15%', 'Ne peut pas porter d\'arme', 'Perte des armes', 'Vision du futur', null)
  insertClass.run('necromancien_blanc', 'Nécromancien Blanc', 'Il montre le chemin vers la lumière.', '💀', '{"hp": 60, "healingPower": 50, "defense": 25, "summonLight": 1}', 'rare', 'priest', 'healer', '"Ceux qui ont touché la mort..."', '{"deathAndResurrection": true}', '{"level": 30}', 1, null, 'HEAL+SUMMON +50%', 'Prix villes +30%', 'Statut de mort-vivant', 'Lumière éternelle', null)
  insertClass.run('gardien_tombes', 'Gardien des Tombes Royales', 'Les morts lui obéissent.', '👑', '{"hp": 100, "defense": 40, "summonDead": 1, "healingReceived": -30}', 'rare', 'warrior', 'tank', '"Dans le silence des tombeaux..."', '{"zoneVisits": {"zone": "zone_tombe", "count": 20}}', '{"level": 35}', 1, null, 'HP+SUMMON +100%', 'Healing-30%', 'XP réduit', 'Commandement', null)
  insertClass.run('moine_fer', 'Moine de Fer', 'Son corps est son arme.', '🙏', '{"hp": 40, "attack": 35, "critChance": 20, "dodge": 15, "noArmorPenalty": 1}', 'rare', 'hybrid', 'dps', '"Combat sans armure..."', '{"defeatNoArmor": 10}', '{"level": 15}', 1, null, 'ATK +35%', 'Vulnérable magie', 'Faiblesse magique', 'Poing d\'acier', null)
  insertClass.run('chasseur_ombre', 'Chasseur d\'Ombre', 'Il disparaît avant qu\'on ne le touche.', '🌫️', '{"dodge": 50, "critChance": 20, "fleeBonus": 100, "lootReduction": -50}', 'rare', 'rogue', 'utility', '"Ceux qui fuient survive..."', '{"successfulFlees": 100}', '{"level": 20}', 1, null, 'FLEE+DODGE +100%', 'Pas de loot', 'Pauvreté', 'Fil de l\'ombre', null)

  // ===== UNIQUE CLASSES =====
  insertClass.run('heritier_dragon', 'Héritier du Dragon Déchu', 'Le sang du dragon coule dans ses veines.', '🐉', '{"attack": 60, "critChance": 30, "fireBreath": 1, "hp": 80, "healingReceived": -70}', 'unique', 'warrior', 'dps', '"L\'oeuf noir au fond du volcan"', '{"hiddenItem": "dragon_egg"}', '{"level": 40}', 1, 1, 'FIRE BREATH', 'Healing -70%', 'Consommation', 'Souffle de dragon', '["pretre", "paladin"]')
  insertClass.run('marcheur_ruines', 'Marcheur des Ruines', 'Il marche entre les mondes brisés.', '🏚️', '{"dodge": 40, "secretFind": 50, "attack": 30, "explorationBonus": 100}', 'unique', 'rogue', 'utility', '"Trouve ce que les autres ne cherchent pas"', '{"secretChestsFound": 20}', '{"level": 30}', 1, 1, 'SECRET +50%', 'Pas de combat', 'Aucune force', 'Vue des ruines', null)
  insertClass.run('executeur', 'Exécuteur Sans Nom', 'Son nom a été effacé. Sa sentence, jamais.', '💀', '{"attack": 80, "critChance": 40, "critDamage": 100, "cityAccess": 0}', 'unique', 'warrior', 'dps', '"Tue celui qui ne le mérite pas"', '{"betrayalsCommitted": 3, "pvpKillInnocent": 1}', '{"level": 35}', 1, 1, 'ATK+CRIT +80%', 'Pas de ville', 'Hors-la-loi', 'Exécution', '["paladin", "gardien"]')
  insertClass.run('porteur_flamme', 'Porteur de la Première Flamme', 'Il détient l\'étincelle qui a tout commencé.', '🔥', '{"attack": 70, "fireDamage": 50, "hp": -50, "burnAura": 1, "allResist": 50}', 'unique', 'mage', 'dps', '"Dans les ténèbres absolues..."', '{"zone": "zone_neant", "defeatBoss": true}', '{"level": 45}', 1, 1, 'FIRE+RESIST +50%', 'HP -50%', 'Consumption', 'Burn aura', null)
  insertClass.run('tisseur_destins', 'Tisseur de Destin Brisé', 'Il a vu tous les futurs.', '🕸️', '{"critChance": 35, "dodge": 30, "attack": 45, "rewindTurn": 1}', 'unique', 'hybrid', 'utility', '"Brise le fil..."', '{"discoveries": 50}', '{"level": 40}', 1, 1, 'REWIND 1x', 'Instabilité', 'Risque aléatoire', 'Tissage', null)

  // ===== CURSED CLASSES =====
  insertClass.run('esprit_damne', 'Esprit Damné', 'Son âme est liée à la mort.', '💀', '{"hp": -50, "defense": -20, "attack": 30, "deathPower": 50}', 'cursed', 'hybrid', 'utility', '"La mort n\'est qu\'un début..."', '{"deaths": 100}', '{"level": 1}', 1, null, 'DEATH POWER +50%', 'HP -50%', 'Affaiblissement', 'Lien mortel', null)
  insertClass.run('faucheur_maudit', 'Faucheur Maudit', 'Il a versé le sang innocent.', '☠️', '{"attack": 50, "critChance": 25, "hunted": 100, "defense": -30}', 'cursed', 'rogue', 'dps', '"Le sang des innocents..."', '{"pvpKillInnocent": 1}', '{"level": 20}', 1, null, 'ATK +50%', 'DEF -30%', 'Chasse permanent', 'Fauchaison', null)

  console.log('✅ Classes created')

  // ===== SERVER UNIQUE ITEMS =====
  insertServerUnique.run('mask_king_thief', 'Masque du Roi Voleur', '"Il fut roi avant d\'être voleur."', '👑', 'mythic', '{"fleeGuaranteed": 1, "goldFind": 100}')
  insertServerUnique.run('eye_catacomb', 'Oeil du Caveau Mort', '"Il voit ce qui dort."', '👁️', 'mythic', '{"hiddenChestFind": 1, "secretPassage": 1}')
  insertServerUnique.run('heart_ash', 'Coeur de Cendre', '"Il brûle de l\'intérieur."', '❤️‍🔥', 'mythic', '{"lowHpDamageBonus": 40, "burnOnHit": 1}')
  insertServerUnique.run('book_13th_path', 'Livre de la 13e Voie', '"La 13e voie n\'existe pas."', '📖', 'mythic', '{"secretSubclass": 1}')

  console.log('✅ Server Unique Items created')

  // ===== ITEM RARITIES =====
  insertRarity.run('common', 'Commun', '#9d9d9d', 1.0, '{}', 0.50)
  insertRarity.run('uncommon', 'Non commun', '#ffffff', 1.2, '{"critChance": 5}', 0.30)
  insertRarity.run('rare', 'Rare', '#0070dd', 1.5, '{"critChance": 10, "attack": 5}', 0.15)
  insertRarity.run('epic', 'Epique', '#a335ee', 2.0, '{"critChance": 15, "attack": 10}', 0.04)
  insertRarity.run('legendary', 'Legendaire', '#ff8000', 3.0, '{"critChance": 20, "attack": 15}', 0.009)
  insertRarity.run('mythic', 'Mythique', '#ff55ff', 5.0, '{"allStats": 15}', 0.001)
  console.log('✅ Rarities created')

  // ===== ITEM BASES =====
  const items = [
    ['sword_basic', 'Glaive', 'weapon', '{"attack": 10}', 1, null, null],
    ['sword_iron', 'Glaive de fer', 'weapon', '{"attack": 15}', 5, null, null],
    ['shield_wood', 'Bouclier de bois', 'shield', '{"defense": 5}', 1, null, null],
    ['helmet_leather', 'Casque de cuir', 'helmet', '{"defense": 3, "hp": 10}', 1, null, null],
    ['armor_leather', 'Armure de cuir', 'armor', '{"defense": 5, "hp": 15}', 1, null, null],
    ['legs_leather', 'Jambieres de cuir', 'legs', '{"defense": 2, "agility": 3}', 1, null, null],
    ['ring_basic', 'Anneau de fer', 'accessory', '{"attack": 3, "luck": 2}', 1, null, null],
  ]
  for (const item of items) insertItemBase.run(...item)

  // ===== MOUNTS =====
  const mounts = [
    ['mount_horse', 'Cheval de Guerre', 'mount', '{"defense": 5, "hp": 20}', 5, 'horse', 15],
    ['mount_raptor', 'Raptor des Plaines', 'mount', '{"attack": 10, "agility": 5}', 10, 'raptor', 20],
    ['mount_wyvern', 'Wyvern', 'mount', '{"attack": 15, "hp": 30}', 20, 'wyvern', 30],
    ['mount_griffon', 'Griffon', 'mount', '{"attack": 20, "defense": 15, "hp": 40}', 30, 'griffon', 40],
    ['mount_drake', 'Drake de Combat', 'mount', '{"attack": 25, "hp": 50, "fireResist": 25}', 40, 'drake', 50],
  ]
  for (const mount of mounts) insertItemBase.run(...mount)
  console.log('✅ Item bases and mounts created')

  // ===== PREFIXES =====
  const prefixes = [
    ['prefix_mortel', 'Mortel', '{"attack": 5}', 'common'],
    ['prefix_sanglant', 'Sanglant', '{"critChance": 3}', 'uncommon'],
    ['prefix_ardent', 'Ardent', '{"attack": 8}', 'rare'],
  ]
  for (const p of prefixes) insertPrefix.run(...p)
  console.log('✅ Prefixes created')

  // ===== SUFFIXES =====
  const suffixes = [
    ['suffix_gladiateur', 'du Gladiateur', '{"attack": 3, "critChance": 2}', 'common'],
    ['suffix_veteran', 'du Veteran', '{"attack": 6, "defense": 3}', 'uncommon'],
  ]
  for (const s of suffixes) insertSuffix.run(...s)
  console.log('✅ Suffixes created')

  // ===== FACTIONS =====
  const now = new Date().toISOString()
  insertFaction.run('faction_crimson_tide', 'Guilde de la Marée Cramoisie', 'La guilde des marins et pirates', null, 100, now, now)
  insertFaction.run('faction_circle_herbs', 'Cercle des Herboristes', 'Maîtres des poisons et soins naturels', null, 100, now, now)
  insertFaction.run('faction_brotherhood_forge', 'Confrérie de la Forge', 'Forgerons et guerriers du feu', null, 100, now, now)
  insertFaction.run('faction_explorers', 'Guilde des Explorateurs', 'Chercheurs de ruines et trésor', null, 100, now, now)
  insertFaction.run('faction_order_ice', 'Ordre des Glaces', 'Gardiens du froid éternel', null, 100, now, now)
  insertFaction.run('faction_brume_fraternity', 'Fraternité de la Brume', 'Protecteurs des secrets', null, 100, now, now)
  console.log('✅ Factions created')

  // ===== CITIES =====
  insertCity.run('city_port_victoire', 'Port-Victoire', 'port-victoire', 'Un port marchand branlant où la brume ne lève jamais complètement. Le point de départ de toute aventure.', 'maritime', 'commerce', 1, 15, 'faible', 'physical', 'physical', 1, 0, 'faction_crimson_tide', now, now)
  insertCity.run('city_foret_eau_mort', 'Forêt d\'Eau-Morte', 'foret-eau-morte', 'Une forêt marécageuse où les eaux sont stagnantes et la corruption végétationlle rôde.', 'forest', 'combat', 15, 30, 'moyen', 'poison', 'poison', 1, 1, 'faction_circle_herbs', now, now)
  insertCity.run('city_montagnes_rouges', 'Montagnes Rouges', 'montagnes-rouges', 'Des volcans actifs crachant leur colère. La chaleur y est insupportable.', 'mountain', 'craft', 25, 40, 'eleve', 'fire', 'fire', 1, 2, 'faction_brotherhood_forge', now, now)
  insertCity.run('city_desert_sable_rouge', 'Désert de Sable Rouge', 'desert-sable-rouge', 'Un désert brûlant avec des ruines antiques émergentes du sable.', 'desert', 'secret', 35, 50, 'extreme', 'fire', 'fire', 1, 3, 'faction_explorers', now, now)
  insertCity.run('city_colles_glaces', 'Collines des Glaces', 'colles-glaces', 'Des montagnes éternellement gelées. Le froid yTue aussi surely.', 'ice', 'combat', 45, 60, 'extreme', 'ice', 'ice', 1, 4, 'faction_order_ice', now, now)
  insertCity.run('city_iles_brumantes', 'Îles Brumantes', 'iles-brumantes', 'Des îles thérapeut喷雾ées dans une brume permanente. Les secrets s\'y perdent.', 'island', 'secret', 50, 70, 'extreme', 'chaos', 'chaos', 1, 5, 'faction_brume_fraternity', now, now)
  console.log('✅ Cities created')

  // ===== SAFE POINTS =====
  insertSafePoint.run('sp_port_victoire', 'Port-Victoire', 'sanctuaire', 'city_port_victoire', 1, 1, 1, 1, 0, now, now)
  insertSafePoint.run('sp_plage_naufrages', 'Plage des Naufrages', 'avantposte', 'city_port_victoire', 1, 0, 1, 1, 1, now, now)
  insertSafePoint.run('sp_foret_eau_mort', 'Sanctuaire de la Forêt', 'sanctuaire', 'city_foret_eau_mort', 1, 1, 1, 1, 0, now, now)
  insertSafePoint.run('sp_lisieres_mort', 'Les Lisières', 'avantposte', 'city_foret_eau_mort', 1, 0, 1, 1, 1, now, now)
  insertSafePoint.run('sp_montagnes_rouges', 'La Forge', 'sanctuaire', 'city_montagnes_rouges', 1, 1, 1, 1, 0, now, now)
  insertSafePoint.run('sp_pentes_cendres', 'Pentes des Cendres', 'avantposte', 'city_montagnes_rouges', 1, 0, 1, 1, 1, now, now)
  insertSafePoint.run('sp_desert', 'Oasis du Voyageur', 'sanctuaire', 'city_desert_sable_rouge', 1, 0, 1, 1, 0, now, now)
  insertSafePoint.run('sp_colles_glaces', 'Refuge Glacial', 'sanctuaire', 'city_colles_glaces', 1, 1, 1, 1, 0, now, now)
  insertSafePoint.run('sp_iles_brumantes', 'Phare de la Brume', 'sanctuaire', 'city_iles_brumantes', 1, 1, 1, 1, 0, now, now)
  console.log('✅ Safe Points created')

  // ===== ZONES - PORT-VICTOIRE =====
  insertZone.run('zone_plage_naufrages', 'Plage des Naufrages', 'plage-naufrages', 'city_port_victoire', 0, 0, 1, 10, 'easy', 'Les plages jonchées d\'épaves. Les crabs et les rats règnent en maîtres.', 0, 'proche', 2, 'physical', 0, 0, 80, 10, 0.01, null)
  insertZone.run('zone_quais_brume', 'Quais de la Brume', 'quais-brume', 'city_port_victoire', 1, 0, 1, 12, 'easy', 'Des quais délabrés où la brume cache les activités louches.', 0, 'proche', 3, 'physical', 0, 0, 75, 10, 0.01, null)
  insertZone.run('zone_fosse_crabs', 'Fosse aux Crabes', 'fosse-crabs', 'city_port_victoire', 2, 0, 5, 15, 'normal', 'Une crique où des crabs gérminaux ont élu domicile.', 0, 'proche', 4, 'physical', 0, 0, 70, 12, 0.02, null)
  insertZone.run('zone_cotes_profondeurs', 'Côtes des Profondeurs', 'cotes-profondeurs', 'city_port_victoire', 3, 0, 10, 20, 'normal', 'Des côtes rocheuses où la marée révèle des secrets.', 0, 'intermediaire', 5, 'physical', 0, 0, 60, 14, 0.03, null)
  insertZone.run('zone_ile_mouettes', 'Île aux Mouettes', 'ile-mouettes', 'city_port_victoire', 4, 0, 12, 22, 'normal', 'Une île couverte de mouettes agressives.', 0, 'intermediaire', 6, 'physical', 0, 0, 55, 15, 0.03, null)
  insertZone.run('zone_recif_requin', 'Récif du Requin', 'recif-requin', 'city_port_victoire', 5, 0, 15, 25, 'hard', 'Un récif où les requins patrouillent.', 0, 'dangereuse', 7, 'physical', 0, 0, 45, 18, 0.04, null)
  insertZone.run('zone_abysses_mer', 'Abysses de la Mer', 'abysses-mer', 'city_port_victoire', 6, 0, 18, 28, 'hard', 'Les profondeurs où la lumière ne pénètre pas.', 0, 'dangereuse', 8, 'water', 0, 1, 35, 20, 0.05, 'sel')
  console.log('✅ Port-Victoire zones created')

  // ===== ZONES - FORET D'EAU-MORTE =====
  insertZone.run('zone_lisieres_mort', 'Lisières de la Mort', 'lisieres-mort', 'city_foret_eau_mort', 0, 1, 12, 22, 'normal', 'Les bords de la forêt empoisonnée.', 0, 'proche', 4, 'poison', 0, 1, 60, 12, 0.02, 'vegetale')
  insertZone.run('zone_marais_grenouilles', 'Marais aux Grenouilles', 'marais-grenouilles', 'city_foret_eau_mort', 1, 1, 14, 24, 'normal', 'Un marais grouillant de grenouilles géantes.', 0, 'proche', 5, 'poison', 0, 1, 55, 14, 0.02, 'vegetale')
  insertZone.run('zone_sentier_sangsues', 'Sentier des Sangsues', 'sentier-sangsues', 'city_foret_eau_mort', 2, 1, 16, 26, 'normal', 'Un sentier infesté de sangsues.', 0, 'proche', 5, 'poison', 0, 1, 50, 15, 0.03, 'vegetale')
  insertZone.run('zone_tourbiere_serpents', 'Tourbière des Serpents', 'tourbiere-serpents', 'city_foret_eau_mort', 3, 1, 18, 28, 'hard', 'Une tourbière où les serpents sont rois.', 0, 'intermediaire', 6, 'poison', 0, 1, 45, 16, 0.03, 'vegetale')
  insertZone.run('zone_fosse_boue', 'Fosse de Boue', 'fosse-boue', 'city_foret_eau_mort', 4, 1, 20, 30, 'hard', 'Une fosse de boue profonde et collante.', 0, 'intermediaire', 7, 'poison', 0, 1, 40, 18, 0.04, 'vegetale')
  insertZone.run('zone_coeur_marais', 'Coeur du Marais', 'coeur-marais', 'city_foret_eau_mort', 5, 1, 22, 32, 'hard', 'Le cœur de la corruption végétationlle.', 0, 'dangereuse', 8, 'poison', 1, 1, 30, 20, 0.05, 'vegetale')
  console.log('✅ Forêt d\'Eau-Morte zones created')

  // ===== ZONES - MONTAGNES ROUGES =====
  insertZone.run('zone_pentes_cendres', 'Pentes de Cendres', 'pentes-cendres', 'city_montagnes_rouges', 0, 2, 22, 32, 'hard', 'Les pentes volcaniques couvertes de cendres.', 0, 'proche', 6, 'fire', 1, 0, 50, 16, 0.03, null)
  insertZone.run('zone_gorges_fer', 'Gorges du Fer', 'gorges-fer', 'city_montagnes_rouges', 1, 2, 25, 35, 'hard', 'Des gorges où les nains forgent leurs armes.', 0, 'proche', 7, 'physical', 0, 0, 45, 18, 0.03, null)
  insertZone.run('zone_champs_lave', 'Champs de Lave', 'champs-lave', 'city_montagnes_rouges', 2, 2, 28, 38, 'hard', 'Des champs de lave solidifiée.', 0, 'proche', 7, 'fire', 1, 0, 40, 18, 0.04, null)
  insertZone.run('zone_val_flammes', 'Val des Flammes', 'val-flammes', 'city_montagnes_rouges', 3, 2, 30, 40, 'hard', 'Une vallée où les flammes dansent.', 0, 'intermediaire', 8, 'fire', 1, 0, 35, 20, 0.04, null)
  insertZone.run('zone_mine_nains', 'Mine des Nains', 'mine-nains', 'city_montagnes_rouges', 4, 2, 32, 42, 'hard', 'Une mine abandonnée par les nains.', 0, 'intermediaire', 8, 'fire', 0, 0, 30, 20, 0.04, null)
  insertZone.run('zone_sommet_volcan', 'Sommet du Volcan', 'sommet-volcan', 'city_montagnes_rouges', 5, 2, 35, 45, 'hard', 'Le sommet où le magma coule.', 0, 'dangereuse', 9, 'fire', 1, 1, 20, 22, 0.05, null)
  console.log('✅ Montagnes Rouges zones created')

  // ===== ZONES - DESERT DE SABLE ROUGE =====
  insertZone.run('zone_oasis_voyageurs', 'Oasis des Voyageurs', 'oasis-voyageurs', 'city_desert_sable_rouge', 0, 3, 32, 42, 'hard', 'Une oasis fréquentée par les caravanes.', 0, 'proche', 7, 'fire', 1, 0, 45, 18, 0.03, null)
  insertZone.run('zone_dunes_sable', 'Dunes de Sable', 'dunes-sable', 'city_desert_sable_rouge', 1, 3, 35, 45, 'hard', 'Des dunes à perte de vue.', 0, 'proche', 8, 'fire', 1, 0, 40, 20, 0.04, null)
  insertZone.run('zone_ruines_empire', 'Ruines d\'Empire', 'ruines-empire', 'city_desert_sable_rouge', 2, 3, 38, 48, 'hard', 'Les ruines d\'un empire oublié.', 0, 'proche', 8, 'arcane', 0, 0, 35, 20, 0.04, null)
  insertZone.run('zone_canyon_os', 'Canyon des Os', 'canyon-os', 'city_desert_sable_rouge', 3, 3, 40, 50, 'hard', 'Un canyon tapissé d\'ossements.', 0, 'intermediaire', 9, 'physical', 0, 0, 30, 22, 0.04, null)
  insertZone.run('zone_ville_fantome', 'Ville Fantôme', 'ville-fantome', 'city_desert_sable_rouge', 4, 3, 42, 52, 'hard', 'Une ville abandonnée hantée.', 0, 'intermediaire', 9, 'arcane', 0, 1, 25, 24, 0.05, 'arcane')
  insertZone.run('zone_tempete_sable', 'Tempête de Sable', 'tempete-sable', 'city_desert_sable_rouge', 5, 3, 45, 55, 'hard', 'Une tempête de sable mortelle.', 0, 'dangereuse', 10, 'fire', 1, 0, 15, 25, 0.05, null)
  console.log('✅ Désert de Sable Rouge zones created')

  // ===== ZONES - COLLINES DES GLACES =====
  insertZone.run('zone_pass_enneige', 'Pass Enneigé', 'pass-enneige', 'city_colles_glaces', 0, 4, 42, 52, 'hard', 'Un passage enneigé dangereux.', 0, 'proche', 8, 'ice', 1, 0, 40, 20, 0.04, null)
  insertZone.run('zone_village_abandonne', 'Village Abandonné', 'village-abandonne', 'city_colles_glaces', 1, 4, 45, 55, 'hard', 'Un village gelé depuis des siècles.', 0, 'proche', 8, 'ice', 0, 1, 35, 22, 0.04, null)
  insertZone.run('zone_glacier_externe', 'Glacier Externe', 'glacier-externe', 'city_colles_glaces', 2, 4, 48, 58, 'hard', 'Les langues glaciaires externes.', 0, 'proche', 9, 'ice', 1, 0, 30, 24, 0.05, null)
  insertZone.run('zone_cime_gelee', 'Cime Gelée', 'cime-gelee', 'city_colles_glaces', 3, 4, 50, 60, 'hard', 'Le sommet gelé à mort.', 0, 'intermediaire', 9, 'ice', 1, 1, 25, 25, 0.05, null)
  insertZone.run('zone_grotte_golems', 'Grotte des Golems', 'grotte-golems', 'city_colles_glaces', 4, 4, 52, 62, 'hard', 'Une grotte remplie de golems de glace.', 0, 'intermediaire', 10, 'ice', 0, 0, 20, 26, 0.05, null)
  insertZone.run('zone_sommet_eternel', 'Sommet Éternel', 'sommet-eternel', 'city_colles_glaces', 5, 4, 55, 65, 'hard', 'Le summum du froid éternel.', 0, 'dangereuse', 10, 'ice', 1, 1, 10, 28, 0.06, null)
  console.log('✅ Collines des Glaces zones created')

  // ===== ZONES - ÎLES BRUMANTES =====
  insertZone.run('zone_plage_brume', 'Plage de Brume', 'plage-brume', 'city_iles_brumantes', 0, 5, 48, 58, 'hard', 'Une plage thérapeutisée dans la brume.', 0, 'proche', 8, 'physical', 0, 1, 40, 22, 0.04, null)
  insertZone.run('zone_village_pecheurs', 'Village des Pêcheurs', 'village-pecheurs', 'city_iles_brumantes', 1, 5, 50, 60, 'hard', 'Un village de pêcheurs étranges.', 0, 'proche', 9, 'physical', 0, 0, 35, 24, 0.04, null)
  insertZone.run('zone_phare_oublie', 'Phare Oublié', 'phare-oublie', 'city_iles_brumantes', 2, 5, 52, 62, 'hard', 'Un phare qui ne guide plus.', 0, 'proche', 9, 'chaos', 0, 1, 30, 24, 0.05, null)
  insertZone.run('zone_foret_brume', 'Forêt de la Brume', 'foret-brume', 'city_iles_brumantes', 3, 5, 55, 65, 'hard', 'Une forêt où la brume cache ses secrets.', 0, 'intermediaire', 9, 'chaos', 0, 1, 25, 26, 0.05, null)
  insertZone.run('zone_ruines_mysterieuses', 'Ruines Mystérieuses', 'ruines-mysterieuses', 'city_iles_brumantes', 4, 5, 58, 68, 'hard', 'Des ruines d\'origine inconnue.', 0, 'intermediaire', 10, 'chaos', 0, 0, 20, 28, 0.05, null)
  insertZone.run('zone_centre_brume', 'Centre de la Brume', 'centre-brume', 'city_iles_brumantes', 5, 5, 60, 70, 'hard', 'Le centre où la brume est plus dense.', 0, 'dangereuse', 10, 'chaos', 1, 1, 10, 30, 0.06, 'arcane')
  console.log('✅ Îles Brumantes zones created')

  // ===== DUNGEONS =====
  insertDungeon.run('dungeon_epave_titan', 'Épave du Titan', 'epave-titan', 'L\'épave d\'un titan échoué. Des crabs mutants et des esprits.', 'city_port_victoire', 'standard', 10, 4, 3, 1, 'Crabe Titan', 'physical', 500, 'dungeon_epave_titan', now, now)
  insertDungeon.run('dungeon_temple_coral', 'Temple de Corail', 'temple-coral', 'Un temple sous-marin fait de corail. Le boss est une sirène.', 'city_port_victoire', 'avance', 18, 6, 4, 1, 'Reine des Profondeurs', 'water', 800, 'dungeon_temple_coral', now, now)
  insertDungeon.run('dungeon_ruines_reine', 'Ruines de la Reine', 'ruines-reine', 'Les ruines d\'une reine des marais.', 'city_foret_eau_mort', 'standard', 22, 5, 3, 1, 'Reine des Serpents', 'poison', 600, 'dungeon_ruines_reine', now, now)
  insertDungeon.run('dungeon_forteresse_vase', 'Forteresse des Vases', 'forteresse-vase', 'Une forteresse construite dans la vase.', 'city_foret_eau_mort', 'avance', 28, 7, 4, 1, 'Maître des Tourbières', 'poison', 900, 'dungeon_forteresse_vase', now, now)
  insertDungeon.run('dungeon_forgeron_chaos', 'Forgeron du Chaos', 'forgeron-chaos', 'Une forge maudite par le chaos.', 'city_montagnes_rouges', 'standard', 32, 6, 3, 1, 'Maître Forgeron', 'fire', 700, 'dungeon_forgeron_chaos', now, now)
  insertDungeon.run('dungeon_coeur_magma', 'Coeur du Magma', 'coeur-magma', 'Le cœur du volcan où le magma coule.', 'city_montagnes_rouges', 'special', 40, 9, 5, 1, 'Dragon Ardents', 'fire', 1200, 'dungeon_coeur_magma', now, now)
  insertDungeon.run('dungeon_tombe_rois', 'Tombeau des Rois', 'tombe-rois', 'Le tombeau des anciens rois du désert.', 'city_desert_sable_rouge', 'standard', 42, 7, 4, 1, 'Garde Éternel', 'physical', 800, 'dungeon_tombe_rois', now, now)
  insertDungeon.run('dungeon_pyramide_interdite', 'Pyramide Interdite', 'pyramide-interdite', 'Une pyramide où l\'on n\'entre pas.', 'city_desert_sable_rouge', 'special', 50, 10, 5, 1, 'Sultan des Sables', 'arcane', 1500, 'dungeon_pyramide_interdite', now, now)
  insertDungeon.run('dungeon_crypte_ancetres', 'Crypte des Ancêtres', 'crypte-ancetres', 'Une crypte gelée depuis des siècles.', 'city_colles_glaces', 'standard', 50, 8, 4, 1, 'Roi des Glaces', 'ice', 900, 'dungeon_crypte_ancetres', now, now)
  insertDungeon.run('dungeon_trone_roi_gele', 'Trône du Roi Gelé', 'trone-roi-gele', 'Le trône du roi qui gèle tout.', 'city_colles_glaces', 'special', 60, 10, 5, 1, 'Roi Éternel', 'ice', 1600, 'dungeon_trone_roi_gele', now, now)
  insertDungeon.run('dungeon_temple_submerge', 'Temple Submergé', 'temple-submerge', 'Un temple englouti dans la brume.', 'city_iles_brumantes', 'standard', 55, 8, 4, 1, 'Gardien des Flots', 'chaos', 1000, 'dungeon_temple_submerge', now, now)
  insertDungeon.run('dungeon_labyrinthe_brume', 'Labyrinthe de Brume', 'labyrinthe-brume', 'Un labyrinthe qui change avec la brume.', 'city_iles_brumantes', 'special', 65, 10, 5, 1, 'Maître du Voile', 'chaos', 1800, 'dungeon_labyrinthe_brume', now, now)
  console.log('✅ Dungeons created')

  // ===== SECRET ZONES =====
  insertSecretZone.run('sz_antre_contrebandier', 'Antre du Contrebandier', 'Une cache secrète utilisée par les contrebandiers.', 'city_port_victoire', 'chance', null, 10, 5, now, now)
  insertSecretZone.run('sz_cache_pirates', 'Cache des Pirates', 'Le trésor caché d\'un ancien pirate.', 'city_port_victoire', 'condition', 'title:captain_killer', 15, 7, now, now)
  insertSecretZone.run('sz_sanctuaire_herbieres', 'Sanctuaire des Herbières', 'Un sanctuaire caché des herboristes.', 'city_foret_eau_mort', 'chance', null, 20, 6, now, now)
  insertSecretZone.run('sz_temple_cache', 'Temple Caché des Herbes', 'Un temple secrets sous la forêt.', 'city_foret_eau_mort', 'quete', 'quest:herbalist_secret', 25, 8, now, now)
  insertSecretZone.run('sz_forge_cachee_nains', 'Forge Cachée des Nains', 'Une forge secrète des nains.', 'city_montagnes_rouges', 'chance', null, 30, 7, now, now)
  insertSecretZone.run('sz_tresor_dragon', 'Trésor du Dragon', 'Le trésor amassé par le dragon.', 'city_montagnes_rouges', 'condition', 'title:dragon_slayer', 40, 10, now, now)
  insertSecretZone.run('sz_oasis_cachee', 'Oasis Cachée', 'Une oasis que seuls les initiés connaissent.', 'city_desert_sable_rouge', 'chance', null, 35, 6, now, now)
  insertSecretZone.run('sz_bibliotheque_enterree', 'Bibliothèque Ensevelie', 'Une bibliothèque antique sous le sable.', 'city_desert_sable_rouge', 'event', null, 45, 9, now, now)
  insertSecretZone.run('sz_sanctuaire_phoenix', 'Sanctuaire du Phoenix de Glace', 'Un sanctuaire où le phoenix de glace règne.', 'city_colles_glaces', 'chance', null, 50, 8, now, now)
  insertSecretZone.run('sz_cache_esprits', 'Cache des Esprits', 'Une cache où les esprits хранят leurs secrets.', 'city_colles_glaces', 'condition', 'title:spirit_whisperer', 55, 10, now, now)
  insertSecretZone.run('sz_ile_cachee', 'L\'Île Cachée', 'Une île qui n\'apparaît que dans la brume.', 'city_iles_brumantes', 'event', null, 60, 9, now, now)
  insertSecretZone.run('sz_tresor_navigateurs', 'Le Trésor des Navigateurs', 'Le trésor perdu des navigateurs.', 'city_iles_brumantes', 'condition', 'title:master_navigator', 65, 10, now, now)
  console.log('✅ Secret Zones created')

  // ===== QUESTS =====
  insertQuest.run('quest_port_1', 'Nettoyage des Quais', 'Vaincre 5 ennemis aux quais', 'daily', 'city_port_victoire', '{"type": "combat", "zone": "zone_quais_brume", "count": 5}', '{"gold": 50, "xp": 100}', 0)
  insertQuest.run('quest_port_2', 'Chasse aux Crabes', 'Vaincre le Crabe Géant', 'daily', 'city_port_victoire', '{"type": "boss", "zone": "zone_fosse_crabs", "boss": "Crabe Géant"}', '{"gold": 100, "xp": 200}', 0)
  insertQuest.run('quest_foret_1', 'Racines Éliminées', 'Vaincre 5 ennemis dans les marais', 'daily', 'city_foret_eau_mort', '{"type": "combat", "zone": "zone_marais_grenouilles", "count": 5}', '{"gold": 80, "xp": 150}', 0)
  insertQuest.run('quest_montagne_1', 'Cendres Froides', 'Vaincre 5 ennemis dans les pentes', 'daily', 'city_montagnes_rouges', '{"type": "combat", "zone": "zone_pentes_cendres", "count": 5}', '{"gold": 120, "xp": 250}', 0)
  insertQuest.run('quest_desert_1', 'Chaleur Survivie', 'Vaincre 5 ennemis dans le désert', 'daily', 'city_desert_sable_rouge', '{"type": "combat", "zone": "zone_dunes_sable", "count": 5}', '{"gold": 150, "xp": 300}', 0)
  insertQuest.run('quest_glace_1', 'Froid Extreme', 'Vaincre 5 ennemis dans les collines', 'daily', 'city_colles_glaces', '{"type": "combat", "zone": "zone_pass_enneige", "count": 5}', '{"gold": 180, "xp": 350}', 0)
  insertQuest.run('quest_iles_1', 'Brume Mystérieuse', 'Explorer les îles', 'daily', 'city_iles_brumantes', '{"type": "exploration", "zone": "zone_foret_brume", "count": 1}', '{"gold": 200, "xp": 400}', 0)
  console.log('✅ Quests created')

  db.exec('PRAGMA foreign_keys = ON')
  
  // ===== MICRO-ZONES V2 FOR TEST ZONES =====
  // Port-Victoire: Plage des Naufrages (biome: beach)
  runMicroZone('mz_plage_1', 'zone_plage_naufrages', 'Ancien Requin', 'Un requin mort échoué', 'beach', 2, 0, 1, '["crab", "rat"]', 2, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'physical', 0, null, 1, null)
  runMicroZone('mz_plage_2', 'zone_plage_naufrages', 'Crique des Mouettes', 'Une crique fréquentée par des mouettes', 'beach', 1, 1, 1, '["bird"]', 1, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'physical', 0, null, 2, null)
  runMicroZone('mz_plage_3', 'zone_plage_naufrages', 'Rocher de la Tortue', 'Un rocher où les tortues se reposent', 'beach', 1, 2, 1, '["crab"]', 1, 0, 1, 'uncommon', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'physical', 0, null, 3, null)
  runMicroZone('mz_plage_4', 'zone_plage_naufrages', 'Côte Étoilée', 'Une côte où les étoiles se reflètent', 'beach', 2, 3, 1, '["crab", "rat"]', 2, 0, 0, 'common', 1, 'Compte les étoiles', 1, 'interaction', 'Cherche les étoiles', 'compter_etoiles', 0, null, null, null, null, null, null, 0.1, 0, null, 0, 0, 'physical', 0, null, 4, null)
  runMicroZone('mz_plage_5', 'zone_plage_naufrages', 'Dune Isolée', 'Une dune thérapeutisée', 'desert', 1, 4, 1, '["scorpion"]', 1, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'physical', 0, null, 5, null)
  
  // Port-Victoire: Quais de la Brume (biome: ruins/swamp)
  runMicroZone('mz_quais_1', 'zone_quais_brume', 'Entrepôt Délaissé', 'Un entrepôt abandonné', 'ruins', 2, 0, 1, '["rat", "thief"]', 2, 0, 1, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'physical', 0, null, 1, null)
  runMicroZone('mz_quais_2', 'zone_quais_brume', 'Ponton Effondré', 'Un ponton qui menace de s\'effondrer', 'plain', 1, 1, 1, '["rat"]', 1, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'physical', 0, null, 2, null)
  runMicroZone('mz_quais_3', 'zone_quais_brume', 'Cale Humide', 'Une cale pleine d\'eau stagnante', 'swamp', 2, 2, 1, '["rat", "eel"]', 2, 0, 0, 'common', 0, null, 1, 'interaction', 'Écoute l\'eau', 'ecouter_eau', 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'water', 0, 'sel', 3, null)
  runMicroZone('mz_quais_4', 'zone_quais_brume', 'Phare Oublié', 'Un phare qui ne fonctionne plus', 'ruins', 2, 3, 1, '["thief"]', 1, 1, 1, 'rare', 0, null, 0, 'hint', null, null, 1, 'Voleur Fantôme', 15, 150, 20, 5, 'physical', '{"item":"ring_shadow","gold":100,"xp":150}', 0.15, 0, null, 0, 0, 'physical', 0, null, 4, null)
  runMicroZone('mz_quais_5', 'zone_quais_brume', 'Rivage Secret', 'Un rivage caché par la brume', 'beach', 1, 4, 1, '["crab"]', 1, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'physical', 0, null, 5, null)
  
  // Port-Victoire: Fosse aux Crabes (biome: cave/beach - boss zone)
  runMicroZone('mz_fosse_1', 'zone_fosse_crabs', 'Rocher des Crabes', 'Un rocher infesté de crabs', 'cave', 3, 0, 1, '["crab_giant"]', 2, 0, 1, 'uncommon', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'physical', 0, null, 1, null)
  runMicroZone('mz_fosse_2', 'zone_fosse_crabs', 'Lagune Profonde', 'Une lagune où les plus grands crabs résident', 'plain', 3, 1, 1, '["crab", "crab_giant"]', 3, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'water', 0, 'sel', 2, null)
  runMicroZone('mz_fosse_3', 'zone_fosse_crabs', 'Cavernes Sous-marines', 'Des cavernes accessibles à marée basse', 'cave', 3, 2, 1, '["eel", "crab_giant"]', 2, 1, 1, 'rare', 0, null, 0, 'hint', null, null, 1, 'Anaconda des Profondeurs', 20, 200, 25, 8, 'water', '{"item":"trident_coral","gold":200,"xp":250}', 0.2, 0, null, 0, 0, 'water', 0, 'sel', 3, null)
  runMicroZone('mz_fosse_4', 'zone_fosse_crabs', 'Plage des Coquillages', 'Une plage couverte de coquillages', 'beach', 2, 3, 1, '["crab"]', 2, 0, 0, 'common', 0, null, 1, 'rare_spawn', 'Compte les coquillages', 'compte_coquillages', 0, null, null, null, null, null, null, 0.08, 0, null, 0, 0, 'physical', 0, null, 4, null)
  runMicroZone('mz_fosse_5', 'zone_fosse_crabs', 'Sentier des Pinces', 'Un chemin bordé de pinces de crab', 'plain', 2, 4, 1, '["crab"]', 2, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'physical', 0, null, 5, null)
  
  // Forêt d'Eau-Morte: Lisières de la Mort (biome: forest/swamp - corruption zone)
  runMicroZone('mz_lisieres_1', 'zone_lisieres_mort', 'Bordure Empoisonnée', 'Les premiers arbres de la forêt', 'forest', 2, 0, 1, '["wolf", "snake"]', 2, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'poison', 1, 'vegetale', 1, null)
  runMicroZone('mz_lisieres_2', 'zone_lisieres_mort', 'Fosse de Brouillard', 'Une fosse pleine de brouillard mortel', 'swamp', 3, 1, 1, '["frog", "snake"]', 2, 0, 1, 'uncommon', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'poison', 1, 'vegetale', 2, null)
  runMicroZone('mz_lisieres_3', 'zone_lisieres_mort', 'Pont de Bois', 'Un ponton de bois qui traverse un marais', 'forest', 2, 2, 1, '["wolf"]', 2, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'poison', 1, 'vegetale', 3, null)
  runMicroZone('mz_lisieres_4', 'zone_lisieres_mort', 'Clearing aux Fleurs', 'Une clairière aux fleurs étranges', 'forest', 2, 3, 1, '["frog"]', 1, 0, 1, 'rare', 1, 'Sent les fleurs', 1, 'interaction', 'Sent les fleurs', 'sentir_fleurs', 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'poison', 1, 'vegetale', 4, null)
  runMicroZone('mz_lisieres_5', 'zone_lisieres_mort', 'Rivière Verte', 'Une rivière à l\'eau verde toxique', 'swamp', 3, 4, 1, '["snake", "frog"]', 3, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, null, 0, 0, 'poison', 1, 'vegetale', 5, null)
  
  // Micro-donjon secret example
  runMicroZone('mz_secret_cave_1', 'zone_fosse_crabs', 'Grotte Cachée', 'Une entrée secrete dans la roche', 'cave', 4, 0, 1, '["crab_giant", "eel"]', 3, 1, 1, 'epic', 0, null, 1, 'hidden_room', 'Cherche une roche particulière', 'tourner_roche', 1, 'Gardien des Profondeurs', 25, 400, 35, 15, 'chaos', '{"item":"relic_shell_legend","gold":500,"xp":500}', 0.25, 1, 'tourner_roche', 3, 3, 'chaos', 1, 'arcane', 10, null)
  
  console.log('✅ Micro-zones created')
  
  // ===== DUNGEON ROOMS FOR BRANCHING =====
  // Épave du Titan - Simple 3 room dungeon
  runDungeonRoom('dr_titan_1', 'dungeon_epave_titan', 0, 'Entrée de l\'Épave', 'L\'entrée de l\'épave du titan', 'combat', '[{"name":"Crab Mutant","level":10,"hp":50,"attack":8,"defense":2,"xpReward":30,"goldReward":15}]', 2, false, false, 'common', 10, 30, null, null, null, null, null, false, 20, false, null, null, null, null, null, null, false, null)
  runDungeonRoom('dr_titan_2', 'dungeon_epave_titan', 1, 'Cale Principale', 'La cale principale de l\'épave', 'choice', '[{"name":"Crab Soldat","level":11,"hp":60,"attack":10,"defense":3,"xpReward":40,"goldReward":20}]', 3, false, false, 'common', 15, 40, 'Le chemin se divise...', 'Continuer vers la salle du trésor', 'Aller vers la salle du boss', 'dr_titan_treasure', 'dr_titan_boss', false, 0, false, null, null, null, null, null, null, false, null)
  runDungeonRoom('dr_titan_treasure', 'dungeon_epave_titan', 2, 'Salle du Trésor', 'Une salle pleine de coffres', 'treasure', '[]', 0, false, true, 'rare', 50, 100, null, null, null, null, null, false, 0, false, null, null, null, null, null, null, true, 'Tu peux quitter l\'épave')
  runDungeonRoom('dr_titan_boss', 'dungeon_epave_titan', 3, 'Salle du Boss', 'Le Crabe Titan réside ici', 'boss', '[]', 0, true, false, 'epic', 0, 0, null, null, null, null, null, false, 0, true, 'Crabe Titan', 500, 20, 10, 'physical', '{"item":"relic_shell","gold":200,"xp":150}', false, null)
  
  // Temple de Corail - Advanced 4 room with branching
  runDungeonRoom('dr_coral_1', 'dungeon_temple_coral', 0, 'Entrée du Temple', 'L\'entrée du temple de corail', 'combat', '[{"name":"Poisson Soldat","level":18,"hp":80,"attack":15,"defense":5,"xpReward":50,"goldReward":25}]', 3, false, false, 'common', 20, 40, null, null, null, null, null, false, 25, false, null, null, null, null, null, null, false, null)
  runDungeonRoom('dr_coral_2', 'dungeon_temple_coral', 1, 'Jardin de Corail', 'Un jardin magnifique mais dangereux', 'combat', '[{"name":"Méduse","level":19,"hp":70,"attack":12,"defense":4,"xpReward":45,"goldReward":20}]', 2, false, false, 'uncommon', 15, 35, 'Deux passages:', 'Passage gauche (sombre)', 'Passage droit (lumineux)', 'dr_coral_left', 'dr_coral_right', false, 0, false, null, null, null, null, null, null, false, null)
  runDungeonRoom('dr_coral_left', 'dungeon_temple_coral', 2, 'Sanctuaire Obscur', 'Un sanctuaire dans l\'obscurité', 'combat', '[{"name":"Ombre des Profondeurs","level":20,"hp":90,"attack":18,"defense":6,"xpReward":60,"goldReward":30}]', 2, true, false, 'rare', 25, 50, null, null, null, null, null, false, 0, false, null, null, null, null, null, null, false, null)
  runDungeonRoom('dr_coral_right', 'dungeon_temple_coral', 2, 'Sanctuaire Lumineux', 'Un sanctuaire éclairé', 'rest', '[]', 0, false, true, 'uncommon', 30, 60, null, null, null, null, null, true, 50, false, null, null, null, null, null, null, false, null)
  runDungeonRoom('dr_coral_boss', 'dungeon_temple_coral', 3, 'Trône de la Reine', 'La Reine des Profondeurs', 'boss', '[]', 0, true, false, 'epic', 0, 0, null, null, null, null, null, false, 0, true, 'Reine des Profondeurs', 800, 25, 15, 'water', '{"item":"crown_coral","gold":300,"xp":250}', false, null)
  
  console.log('✅ Dungeon rooms created')
  
  console.log('🎉 Seeding completed!')
  console.log('')
  console.log('📜 WORLD STRUCTURE:')
  console.log('   6 Cities: Port-Victoire, Forêt d\'Eau-Morte, Montagnes Rouges, Désert de Sable Rouge, Collines des Glaces, Îles Brumantes')
  console.log('   Zones: ~40+ zones across all cities')
  console.log('   Dungeons: 12 dungeons (4 standard, 4 advanced, 4 special)')
  console.log('   Secret Zones: 12 secret zones')
  console.log('   Safe Points: 9 safe points')
  console.log('   Titles: 12 city-specific titles')
}

seed().catch(console.error).finally(() => db.close())
