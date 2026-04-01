const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const db = new Database(dbPath)

console.log('🏗️  Implémentation complète: Bastion de Fer')

const now = new Date().toISOString()

// ===== NETTOYAGE COMPLET =====
console.log('🧹 Nettoyage complet...')
db.exec("DELETE FROM DungeonRoom")
db.exec("DELETE FROM Dungeon")
db.exec("DELETE FROM Quest")
db.exec("DELETE FROM Title")
db.exec("DELETE FROM SafePoint")
db.exec("DELETE FROM SecretZone")
db.exec("DELETE FROM MicroZone")
db.exec("DELETE FROM Zone")
db.exec("DELETE FROM City")
console.log('✅ Nettoyage terminé')

// Force clear any cached state
db.pragma('foreign_keys = OFF')
db.pragma('foreign_keys = ON')

// ===== CITY =====
console.log('🏰 Création de Bastion de Fer...')
db.prepare(`INSERT INTO City (id, name, slug, description, theme, function, levelMin, levelMax, dangerProfile, dominantDamage, usefulResistance, isHub, orderIndex, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
  'city_bastion_fer', 'Bastion de Fer', 'bastion-de-fer', 'La Forge du Seuil. Une ville-frontière construite autour de ses forges massives.', 'mountain', 'craft', 1, 20, 'moyen', 'physical', 'physical', 1, 0, now, now
)
console.log('✅ Ville créée')

// ===== SAFE POINT =====
console.log('🏠 Création du Safe Point...')
db.prepare(`INSERT INTO SafePoint (id, name, type, cityId, hasVendor, hasCraft, hasHeal, travelPoint, orderIndex, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
  'sp_bastion_fer', 'Bastion de Fer', 'sanctuaire', 'city_bastion_fer', 1, 1, 1, 1, 0, now, now
)
console.log('✅ Safe Point créé')

// ===== INSERT MICRO-ZONE HELPER =====
const insertMZ = db.prepare(`
  INSERT INTO MicroZone (id, zoneId, name, description, type, dangerLevel, rotationGroup, isActive, enemyTypes, enemyCount, isElite, hasChest, chestRarity, isHiddenChest, chestUnlockHint, hasSecret, secretType, secretHint, secretAction, canSpawnBoss, bossName, bossLevel, bossHp, bossAttack, bossDefense, bossDamage, bossLoot, bossSpawnChance, isMicroDungeon, microDungeonEntry, microDungeonRooms, microDungeonDifficulty, baseDamageType, hasCorruption, corruptionType, visitOrder)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

// ===== ZONES & MICRO-ZONES =====

// --- CARRIERES NOIRES ---
console.log('⛏️  Création des Carrières Noires...')
db.prepare(`INSERT INTO Zone (id, name, slug, cityId, worldX, worldY, minLevel, maxLevel, difficulty, description, isHidden, zoneType, dangerScore, corruptionType, baseDamageType, environmentalHazard, hasCorruption, healAvailability, enemyAggroRange, rareLootChance, goldMultiplier, xpMultiplier, itemDropRate, trapDensity, travelTimeSeconds, isHub, nearestSafePoint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
  'zone_carrieres_noires', 'Carrières Noires', 'carrieres-noires', 'city_bastion_fer', 0, 0, 1, 10, 'normal', 'Les anciennes mines de fer.', 0, 'proche', 3, null, 'physical', 0, 0, 60, 10, 0.02, 1.0, 1.0, 1.0, 0.0, 180, 0, 'sp_bastion_fer'
)
insertMZ.run('mz_carrieres_1', 'zone_carrieres_noires', 'Campement Externe', 'Camp de kobolds.', 'plain', 1, 0, 1, '["kobold"]', 2, 0, 1, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 1)
insertMZ.run('mz_carrieres_2', 'zone_carrieres_noires', 'Chemin des Déblais', 'Route bordée de déblais.', 'plain', 1, 1, 1, '["rat", "scavenger"]', 2, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 2)
insertMZ.run('mz_carrieres_3', 'zone_carrieres_noires', 'Halle des Travaux', 'Grande halle désaffectée.', 'cave', 2, 2, 1, '["kobold", "corrupted_miner"]', 3, 0, 1, 'uncommon', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 3)
insertMZ.run('mz_carrieres_4', 'zone_carrieres_noires', 'La Veine Sèche', 'Galerie avec minerai lumineux.', 'cave', 2, 3, 1, '["crystal_golem"]', 2, 0, 0, 'common', 0, null, 1, 'rare_spawn', 'Cherche derrière éboulis', 'eboulis', 0, null, null, null, null, null, null, 0.08, 0, 0, null, 0, 0, 'physical', 1, 'arcane', 4)
insertMZ.run('mz_carrieres_5', 'zone_carrieres_noires', 'Le Puits Abandonné', 'Puits descendant dans lobscurité.', 'cave', 3, 4, 1, '["shadow_miner", "kobold"]', 2, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 1, 'arcane', 5)
insertMZ.run('mz_carrieres_6', 'zone_carrieres_noires', 'Galerie Profonde', 'Repaire des kobolds.', 'cave', 3, 0, 1, '["kobold", "kobold_warrior"]', 3, 1, 1, 'rare', 0, null, 0, 'hint', null, null, 1, 'Krag le Brûle-Puits', 8, 120, 15, 5, 'physical', '{"item":"pickaxe_corrupted","gold":80,"xp":100}', 0.25, 1, null, 3, 2, 'physical', 1, 'arcane', 6)
console.log('✅ Carrières Noires: 6 micro-zones')

// --- ANCIENS PUITS ---
console.log('🔻 Création des Anciens Puits...')
db.prepare(`INSERT INTO Zone (id, name, slug, cityId, worldX, worldY, minLevel, maxLevel, difficulty, description, isHidden, zoneType, dangerScore, corruptionType, baseDamageType, environmentalHazard, hasCorruption, healAvailability, enemyAggroRange, rareLootChance, goldMultiplier, xpMultiplier, itemDropRate, trapDensity, travelTimeSeconds, isHub, nearestSafePoint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
  'zone_anciens_puits', 'Anciens Puits', 'anciens-puits', 'city_bastion_fer', 1, 0, 5, 15, 'hard', 'Puits abandonnés depuis des décennies.', 0, 'intermediaire', 5, 'arcane', 'physical', 0, 1, 40, 12, 0.03, 1.2, 1.2, 1.0, 0.1, 300, 0, 'sp_bastion_fer'
)
const mz_anciens = [
  ['mz_anciens_1', 'zone_anciens_puits', 'LEntrée Obstruée', 'Entrée partiellement effondrée.', 'cave', 2, 0, 1, '["rat", "kobold"]', 2, 0, 1, 'uncommon', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 1],
  ['mz_anciens_2', 'zone_anciens_puits', 'La Grande Caisse', 'Salle avec caisses de minerai.', 'cave', 2, 1, 1, '["scavenger"]', 3, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 2],
  ['mz_anciens_3', 'zone_anciens_puits', 'Le Reverdir', 'Zone où la corruption perce.', 'cave', 3, 2, 1, '["corrupted_miner", "crystal_golem"]', 2, 0, 1, 'rare', 0, null, 1, 'interaction', 'Touche le mur', 'toucher_mur', 0, null, null, null, null, null, null, 0.1, 0, 0, null, 0, 1, 'arcane', 1, 'arcane', 3],
  ['mz_anciens_4', 'zone_anciens_puits', 'La Galerie Effondrée', 'Tunnel partiellement effondré.', 'cave', 3, 3, 1, '["rock_fall"]', 1, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 4],
  ['mz_anciens_5', 'zone_anciens_puits', 'Le Fond du Puits', 'Le fond du vieux puits.', 'cave', 4, 0, 1, '["shadow_miner", "kobold_warrior"]', 3, 1, 1, 'epic', 0, null, 0, 'hint', null, null, 1, 'Esprit du Premier Forgeron', 15, 250, 25, 10, 'arcane', '{"item":"hammer_spirit","gold":200,"xp":250}', 0.2, 0, null, 0, 0, 'arcane', 1, 'arcane', 5],
]
for (const mz of mz_anciens) insertMZ.run(...mz)
console.log('✅ Anciens Puits: 5 micro-zones')

// --- FORGES DES CENDRES ---
console.log('🔥 Création des Forges des Cendres...')
db.prepare(`INSERT INTO Zone (id, name, slug, cityId, worldX, worldY, minLevel, maxLevel, difficulty, description, isHidden, zoneType, dangerScore, corruptionType, baseDamageType, environmentalHazard, hasCorruption, healAvailability, enemyAggroRange, rareLootChance, goldMultiplier, xpMultiplier, itemDropRate, trapDensity, travelTimeSeconds, isHub, nearestSafePoint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
  'zone_forges_cendres', 'Forges des Cendres', 'forges-cendres', 'city_bastion_fer', 2, 0, 8, 18, 'hard', 'Forges où lon brûlait les corrompus.', 0, 'intermediaire', 6, 'fire', 'physical', 1, 1, 30, 14, 0.04, 1.3, 1.3, 1.0, 0.15, 240, 0, 'sp_bastion_fer'
)
const mz_forges = [
  ['mz_forges_1', 'zone_forges_cendres', 'Les Hauts Fourneaux', 'Anciens fours encore actifs.', 'cave', 3, 0, 1, '["lava_golem", "fire_elemental"]', 2, 0, 1, 'uncommon', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'fire', 1, 'fire', 1],
  ['mz_forges_2', 'zone_forges_cendres', 'La Galerie des Cendres', 'Couloir plein de cendres.', 'cave', 3, 1, 1, '["ash_spirit", "kobold"]', 2, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'fire', 1, 'fire', 2],
  ['mz_forges_3', 'zone_forges_cendres', 'Le Creuset', 'Le cœur des forges maudites.', 'cave', 4, 2, 1, '["demon_forge", "corrupted_miner"]', 3, 1, 1, 'rare', 0, null, 0, 'hint', null, null, 1, 'Le Gardien des Cendres', 18, 300, 30, 12, 'fire', '{"item":"hammer_ashes","gold":300,"xp":350}', 0.2, 0, null, 0, 0, 'fire', 1, 'fire', 3],
  ['mz_forges_4', 'zone_forges_cendres', 'La Salle des Épées', 'Salle pleine darmes plantées.', 'cave', 3, 3, 1, '["spectral_guard", "kobold_warrior"]', 2, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 4],
  ['mz_forges_5', 'zone_forges_cendres', 'La Cheminée Centrale', 'Conduit vers la surface.', 'cave', 4, 0, 1, '["root_creature", "fire_elemental"]', 2, 0, 1, 'epic', 0, null, 1, 'interaction', 'Grimpe les racines', 'grimper_racines', 0, null, null, null, null, null, null, 0.15, 0, 0, null, 0, 0, 'fire', 1, 'fire', 5],
]
for (const mz of mz_forges) insertMZ.run(...mz)
console.log('✅ Forges des Cendres: 5 micro-zones')

// --- GALERIES SOUTERRAINES ---
console.log('🌑 Création des Galeries Souterraines...')
db.prepare(`INSERT INTO Zone (id, name, slug, cityId, worldX, worldY, minLevel, maxLevel, difficulty, description, isHidden, zoneType, dangerScore, corruptionType, baseDamageType, environmentalHazard, hasCorruption, healAvailability, enemyAggroRange, rareLootChance, goldMultiplier, xpMultiplier, itemDropRate, trapDensity, travelTimeSeconds, isHub, nearestSafePoint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
  'zone_galeries_souterraines', 'Galeries Souterraines', 'galeries-souterraines', 'city_bastion_fer', 3, 0, 12, 25, 'hard', 'Réseau sous les Carrières. Quelque chose dort ici.', 0, 'dangereuse', 8, 'arcane', 'physical', 0, 1, 20, 16, 0.05, 1.5, 1.5, 1.0, 0.2, 360, 0, 'sp_bastion_fer'
)
const mz_galeries = [
  ['mz_galeries_1', 'zone_galeries_souterraines', 'LEntrecroisement', 'Intersection de galeries.', 'cave', 4, 0, 1, '["shadow_creature", "kobold"]', 3, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 1],
  ['mz_galeries_2', 'zone_galeries_souterraines', 'La Chambre de lÉcho', 'Salle où le son résonne.', 'cave', 4, 1, 1, '["echo_spirit"]', 2, 0, 1, 'rare', 0, null, 1, 'rare_spawn', 'Écoute les échos', 'ecouter_eco', 0, null, null, null, null, null, null, 0.1, 0, 0, null, 0, 0, 'arcane', 1, 'arcane', 2],
  ['mz_galeries_3', 'zone_galeries_souterraines', 'Le Puits Sans Fond', 'Puits descendant plus profond.', 'cave', 5, 2, 1, '["void_creature", "shadow_miner"]', 2, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'arcane', 1, 'arcane', 3],
  ['mz_galeries_4', 'zone_galeries_souterraines', 'La Nécropole Oubliée', 'Crypte de tombes anonymes.', 'cave', 5, 3, 1, '["undead_miner", "bone_wyrm"]', 3, 1, 1, 'epic', 0, null, 0, 'hint', null, null, 1, 'Le Comte des Mines', 22, 400, 35, 15, 'chaos', '{"item":"crown_bones","gold":400,"xp":450}', 0.25, 0, null, 0, 0, 'chaos', 1, 'arcane', 4],
  ['mz_galeries_5', 'zone_galeries_souterraines', 'La Sortie Secrète', 'Sortie cachée.', 'cave', 4, 0, 1, '["kobold_shaman", "shadow_creature"]', 2, 0, 0, 'common', 0, null, 1, 'hidden_room', 'Trouve la sortie', 'sortie_cachee', 0, null, null, null, null, null, null, 0.12, 0, 0, null, 0, 0, 'physical', 0, null, 5],
]
for (const mz of mz_galeries) insertMZ.run(...mz)
console.log('✅ Galeries Souterraines: 5 micro-zones')

// ===== DONJONS =====
console.log('🏰 Création du donjon...')
db.prepare(`INSERT INTO Dungeon (id, name, slug, description, cityId, type, level, difficulty, roomCount, hasBoss, bossName, bossDamage, bossHp, rewardItemId, chronicleKey, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
  'dungeon_galleries_premier_puits', 'Galeries du Premier Puits', 'galeries-premier-puits', 'Réseau sous les Anciens Puits.', 'city_bastion_fer', 'standard', 10, 4, 4, 1, 'Premier Forgeron Déchu', 'fire', 450, null, 'dungeon_galleries_premier_puits', now, now
)

// DONJON ROOMS - using direct exec to avoid JSON binding issues
db.exec("INSERT INTO DungeonRoom (id, dungeonId, roomIndex, name, description, type, enemies, enemyCount, hasElite, hasChest, chestRarity, minGold, maxGold, choiceText, choiceA, choiceB, roomAId, roomBId, isRestPoint, healAmount, isBoss, bossName, bossHp, bossAttack, bossDefense, bossDamage, bossLoot, isExit, exitText) VALUES ('dr_gpp_0', 'dungeon_galleries_premier_puits', 0, 'Entrée', 'Entrée des galeries.', 'combat', '[{\"name\":\"Gardien\",\"level\":10,\"hp\":60,\"attack\":12,\"defense\":4,\"xpReward\":40,\"goldReward\":20}]', 2, 0, 0, 'common', 15, 30, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL)")

db.exec("INSERT INTO DungeonRoom (id, dungeonId, roomIndex, name, description, type, enemies, enemyCount, hasElite, hasChest, chestRarity, minGold, maxGold, choiceText, choiceA, choiceB, roomAId, roomBId, isRestPoint, healAmount, isBoss, bossName, bossHp, bossAttack, bossDefense, bossDamage, bossLoot, isExit, exitText) VALUES ('dr_gpp_1', 'dungeon_galleries_premier_puits', 1, 'La Bifurcation', 'Le chemin se divise.', 'choice', '[{\"name\":\"Kobold Flamme\",\"level\":11,\"hp\":70,\"attack\":14,\"defense\":5,\"xpReward\":50,\"goldReward\":25}]', 2, 0, 0, 'common', 20, 40, 'Chemin se divise...', 'Vers la Forge', 'Vers lObscurité', 'dr_gpp_forge', 'dr_gpp_ombre', 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL)")

db.exec("INSERT INTO DungeonRoom (id, dungeonId, roomIndex, name, description, type, enemies, enemyCount, hasElite, hasChest, chestRarity, minGold, maxGold, choiceText, choiceA, choiceB, roomAId, roomBId, isRestPoint, healAmount, isBoss, bossName, bossHp, bossAttack, bossDefense, bossDamage, bossLoot, isExit, exitText) VALUES ('dr_gpp_forge', 'dungeon_galleries_premier_puits', 2, 'La Forge Brûlante', 'Forge encore active.', 'combat', '[{\"name\":\"Mineur Corrompu\",\"level\":12,\"hp\":80,\"attack\":16,\"defense\":6,\"xpReward\":60,\"goldReward\":30}]', 3, 0, 1, 'rare', 40, 80, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL)")

db.exec("INSERT INTO DungeonRoom (id, dungeonId, roomIndex, name, description, type, enemies, enemyCount, hasElite, hasChest, chestRarity, minGold, maxGold, choiceText, choiceA, choiceB, roomAId, roomBId, isRestPoint, healAmount, isBoss, bossName, bossHp, bossAttack, bossDefense, bossDamage, bossLoot, isExit, exitText) VALUES ('dr_gpp_ombre', 'dungeon_galleries_premier_puits', 3, 'Les Ténèbres', 'Galerie dans lobscurité.', 'combat', '[{\"name\":\"Spectre\",\"level\":12,\"hp\":60,\"attack\":20,\"defense\":2,\"xpReward\":70,\"goldReward\":35}]', 2, 1, 0, 'uncommon', 30, 50, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL)")

db.exec("INSERT INTO DungeonRoom (id, dungeonId, roomIndex, name, description, type, enemies, enemyCount, hasElite, hasChest, chestRarity, minGold, maxGold, choiceText, choiceA, choiceB, roomAId, roomBId, isRestPoint, healAmount, isBoss, bossName, bossHp, bossAttack, bossDefense, bossDamage, bossLoot, isExit, exitText) VALUES ('dr_gpp_boss', 'dungeon_galleries_premier_puits', 4, 'Chambre du Premier Forgeron', 'Le premier forgeron déchu.', 'boss', '[]', 0, 0, 1, 'epic', 0, 0, NULL, NULL, NULL, NULL, NULL, 0, 0, 1, 'Premier Forgeron Déchu', 450, 25, 15, 'fire', '{\"item\":\"relic_hammer_first\",\"gold\":250,\"xp\":300}', 0, NULL)")
console.log('✅ Donjon créé: 4 salles + boss')

// ===== ZONES SECRÈTES =====
console.log('🔐 Création des zones secrètes...')
db.prepare(`INSERT INTO SecretZone (id, name, description, cityId, discoveryType, condition, questId, rewardItemId, isDiscovered, level, dangerScore, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
  'sz_crypts_forge', 'Crypte de la Première Forge', 'Crypte sous les forges.', 'city_bastion_fer', 'condition', 'title:forgeron_elite', null, null, 0, 10, 6, now, now
)
db.prepare(`INSERT INTO SecretZone (id, name, description, cityId, discoveryType, condition, questId, rewardItemId, isDiscovered, level, dangerScore, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
  'sz_passage_oublie', 'Le Passage Oublié', 'Passage sous les Galeries.', 'city_bastion_fer', 'chance', null, null, null, 0, 15, 8, now, now
)
console.log('✅ 2 zones secrètes créées')

// ===== TITRES =====
console.log('📜 Création des titres...')
db.prepare("INSERT OR IGNORE INTO Title (id, name, description, type, bonus, rarity, cityId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run('title_miner_curieux', 'Curieux des Mines', 'A exploré les Carrières', 'exploration', '{"secretFind": 5}', 'common', 'city_bastion_fer', now, now)
db.prepare("INSERT OR IGNORE INTO Title (id, name, description, type, bonus, rarity, cityId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run('title_eboueur_carrieres', 'Éboueur des Carrières', 'A vaincu 10 ennemis', 'combat', '{"attack": 3}', 'common', 'city_bastion_fer', now, now)
db.prepare("INSERT OR IGNORE INTO Title (id, name, description, type, bonus, rarity, cityId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run('title_decouvreur_profondeurs', 'Découvreur des Profondeurs', 'A atteint le fond', 'exploration', '{"goldFind": 10}', 'uncommon', 'city_bastion_fer', now, now)
db.prepare("INSERT OR IGNORE INTO Title (id, name, description, type, bonus, rarity, cityId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run('title_forgeron_elite', 'Forgeron Élite', 'A maîtrisé la forge', 'craft', '{"craftQuality": 15}', 'rare', 'city_bastion_fer', now, now)
db.prepare("INSERT OR IGNORE INTO Title (id, name, description, type, bonus, rarity, cityId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run('title_champion_carrieres', 'Champion des Carrières', 'A vaincu Krag', 'combat', '{"attack": 10, "defense": 5}', 'rare', 'city_bastion_fer', now, now)
console.log('✅ 5 titres créés')

// ===== QUÊTES =====
console.log('⚔️  Création des quêtes...')
db.prepare("INSERT OR IGNORE INTO Quest (id, name, description, type, cityId, conditions, rewards, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run('quest_bastion_1', 'Nettoyage des Carrières', 'Vaincre 5 kobolds', 'daily', 'city_bastion_fer', '{"type": "combat", "zone": "zone_carrieres_noires", "count": 5}', '{"gold": 40, "xp": 80}', 1)
db.prepare("INSERT OR IGNORE INTO Quest (id, name, description, type, cityId, conditions, rewards, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run('quest_bastion_2', 'Le Chef des Carrières', 'Vaincre Krag', 'weekly', 'city_bastion_fer', '{"type": "boss", "zone": "zone_carrieres_noires", "boss": "Krag le Brûle-Puits"}', '{"gold": 120, "xp": 200}', 1)
db.prepare("INSERT OR IGNORE INTO Quest (id, name, description, type, cityId, conditions, rewards, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run('quest_bastion_3', 'Corruption Rampante', 'Vaincre 3 mineurs', 'daily', 'city_bastion_fer', '{"type": "combat", "zone": "zone_carrieres_noires", "enemy": "corrupted_miner", "count": 3}', '{"gold": 60, "xp": 120}', 1)
db.prepare("INSERT OR IGNORE INTO Quest (id, name, description, type, cityId, conditions, rewards, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run('quest_bastion_4', 'Exploration des Anciens Puits', 'Explorer les Anciens Puits', 'exploration', 'city_bastion_fer', '{"type": "exploration", "zone": "zone_anciens_puits", "count": 3}', '{"gold": 100, "xp": 180}', 1)
db.prepare("INSERT OR IGNORE INTO Quest (id, name, description, type, cityId, conditions, rewards, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run('quest_bastion_5', 'Les Forges Maudites', 'Explorer les Forges des Cendres', 'exploration', 'city_bastion_fer', '{"type": "exploration", "zone": "zone_forges_cendres", "count": 3}', '{"gold": 150, "xp": 250}', 1)
console.log('✅ 5 quêtes créées')

// ===== VÉRIFICATION =====
console.log('')
console.log('🔍 Vérification...')
const zones = db.prepare("SELECT COUNT(*) as c FROM Zone WHERE cityId = 'city_bastion_fer'").get()
const mzs = db.prepare("SELECT COUNT(*) as c FROM MicroZone WHERE zoneId LIKE 'zone_%'").get()
const quests = db.prepare("SELECT COUNT(*) as c FROM Quest WHERE cityId = 'city_bastion_fer'").get()
const titles = db.prepare("SELECT COUNT(*) as c FROM Title WHERE cityId = 'city_bastion_fer'").get()
const secrets = db.prepare("SELECT COUNT(*) as c FROM SecretZone WHERE cityId = 'city_bastion_fer'").get()
const dungeons = db.prepare("SELECT COUNT(*) as c FROM Dungeon WHERE cityId = 'city_bastion_fer'").get()

console.log(`   Zones: ${zones.c}`)
console.log(`   Micro-zones: ${mzs.c}`)
console.log(`   Donjons: ${dungeons.c}`)
console.log(`   Quêtes: ${quests.c}`)
console.log(`   Titres: ${titles.c}`)
console.log(`   Zones secrètes: ${secrets.c}`)

console.log('')
console.log('🎉 Implémentation complète terminée!')
console.log('')
console.log('📋 RÉSUMÉ BASTION DE FER:')
console.log('   Zones: 4 (Carrières Noires, Anciens Puits, Forges des Cendres, Galeries Souterraines)')
console.log('   Micro-zones: 21 total (6 + 5 + 5 + 5)')
console.log('   Donjons: 1 (Galeries du Premier Puits)')
console.log('   Zones secrètes: 2')
console.log('   Quêtes: 5')
console.log('   Titres: 5')

db.close()