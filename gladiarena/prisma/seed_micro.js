const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const db = new Database(dbPath)

console.log('🌱 Adding micro-zones V2...')

db.exec('DELETE FROM MicroZone')

const insertSQL = `
INSERT INTO MicroZone (id, zoneId, name, description, type, dangerLevel, rotationGroup, isActive, enemyTypes, enemyCount, isElite, hasChest, chestRarity, isHiddenChest, chestUnlockHint, hasSecret, secretType, secretHint, secretAction, canSpawnBoss, bossName, bossLevel, bossHp, bossAttack, bossDefense, bossDamage, bossLoot, bossSpawnChance, isMicroDungeon, microDungeonEntry, microDungeonRooms, microDungeonDifficulty, baseDamageType, hasCorruption, corruptionType, visitOrder) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

const stmt = db.prepare(insertSQL)

const stmts = [
  ['mz_plage_1', 'zone_plage_naufrages', 'Ancien Requin', 'Un requin mort echoue', 'beach', 2, 0, 1, '["crab", "rat"]', 2, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 1],
  ['mz_plage_2', 'zone_plage_naufrages', 'Crique des Mouettes', 'Une crique frequente par des mouettes', 'beach', 1, 1, 1, '["bird"]', 1, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 2],
  ['mz_plage_3', 'zone_plage_naufrages', 'Rocher de la Tortue', 'Un rocher ou les tortues se reposent', 'beach', 1, 2, 1, '["crab"]', 1, 0, 1, 'uncommon', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 3],
  ['mz_plage_4', 'zone_plage_naufrages', 'Cote Etoilee', 'Une cote ou les etoiles se reflechissent', 'beach', 2, 3, 1, '["crab", "rat"]', 2, 0, 0, 'common', 1, 'Compte les etoiles', 1, 'interaction', 'Cherche les etoiles', 'compter_etoiles', 0, null, null, null, null, null, null, 0.1, 0, 0, null, 0, 0, 'physical', 0, null, 4],
  ['mz_plage_5', 'zone_plage_naufrages', 'Dune Isolee', 'Une dune strategisee', 'desert', 1, 4, 1, '["scorpion"]', 1, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 5],
  ['mz_quais_1', 'zone_quais_brume', 'Entrepot Delaisser', 'Un entrepot abandonne', 'ruins', 2, 0, 1, '["rat", "thief"]', 2, 0, 1, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 1],
  ['mz_quais_2', 'zone_quais_brume', 'Ponton Effondre', 'Un ponton qui menace de s effondrer', 'plain', 1, 1, 1, '["rat"]', 1, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 2],
  ['mz_quais_3', 'zone_quais_brume', 'Cale Humide', 'Une cale pleine d eau stagnante', 'swamp', 2, 2, 1, '["rat", "eel"]', 2, 0, 0, 'common', 0, null, 1, 'interaction', 'Ecoute l eau', 'ecouter_eau', 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'water', 0, 'sel', 3],
  ['mz_quais_4', 'zone_quais_brume', 'Phare Oublie', 'Un phare qui ne fonctionne plus', 'ruins', 2, 3, 1, '["thief"]', 1, 1, 1, 'rare', 0, null, 0, 'hint', null, null, 1, 'Voleur Fantome', 15, 150, 20, 5, 'physical', '{"item":"ring_shadow","gold":100,"xp":150}', 0.15, 0, null, 0, 0, 'physical', 0, null, 4],
  ['mz_quais_5', 'zone_quais_brume', 'Rivage Secret', 'Un rivage cache par la brume', 'beach', 1, 4, 1, '["crab"]', 1, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 5],
  ['mz_fosse_1', 'zone_fosse_crabs', 'Rocher des Crabes', 'Un rocher infeste de crabs', 'cave', 3, 0, 1, '["crab_giant"]', 2, 0, 1, 'uncommon', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 1],
  ['mz_fosse_2', 'zone_fosse_crabs', 'Lagune Profonde', 'Une lagune ou les plus grands crabs resident', 'plain', 3, 1, 1, '["crab", "crab_giant"]', 3, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'water', 0, 'sel', 2],
  ['mz_fosse_3', 'zone_fosse_crabs', 'Cavernes Sous-marines', 'Des cavernes accessibles a maree basse', 'cave', 3, 2, 1, '["eel", "crab_giant"]', 2, 1, 1, 'rare', 0, null, 0, 'hint', null, null, 1, 'Anaconda des Profondeurs', 20, 200, 25, 8, 'water', '{"item":"trident_coral","gold":200,"xp":250}', 0.2, 0, null, 0, 0, 'water', 0, 'sel', 3],
  ['mz_fosse_4', 'zone_fosse_crabs', 'Plage des Coquillages', 'Une plage couverte de coquillages', 'beach', 2, 3, 1, '["crab"]', 2, 0, 0, 'common', 0, null, 1, 'rare_spawn', 'Compte les coquillages', 'compte_coquillages', 0, null, null, null, null, null, null, 0.08, 0, 0, null, 0, 0, 'physical', 0, null, 4],
  ['mz_fosse_5', 'zone_fosse_crabs', 'Sentier des Pinces', 'Un chemin borde de pinces de crab', 'plain', 2, 4, 1, '["crab"]', 2, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'physical', 0, null, 5],
  ['mz_lisieres_1', 'zone_lisieres_mort', 'Bordure Empoisonnee', 'Les premiers arbres de la foret', 'forest', 2, 0, 1, '["wolf", "snake"]', 2, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'poison', 1, 'vegetale', 1],
  ['mz_lisieres_2', 'zone_lisieres_mort', 'Fosse de Brouillard', 'Une fosse pleine de brouillard mortel', 'swamp', 3, 1, 1, '["frog", "snake"]', 2, 0, 1, 'uncommon', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'poison', 1, 'vegetale', 2],
  ['mz_lisieres_3', 'zone_lisieres_mort', 'Pont de Bois', 'Un ponton de bois qui traverse un marais', 'forest', 2, 2, 1, '["wolf"]', 2, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'poison', 1, 'vegetale', 3],
  ['mz_lisieres_4', 'zone_lisieres_mort', 'Clearing aux Fleurs', 'Une clairiere aux fleurs etranges', 'forest', 2, 3, 1, '["frog"]', 1, 0, 1, 'rare', 1, 'Sent les fleurs', 1, 'interaction', 'Sent les fleurs', 'sentir_fleurs', 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'poison', 1, 'vegetale', 4],
  ['mz_lisieres_5', 'zone_lisieres_mort', 'Riviere Verte', 'Une riviere a l eau verde toxique', 'swamp', 3, 4, 1, '["snake", "frog"]', 3, 0, 0, 'common', 0, null, 0, 'hint', null, null, 0, null, null, null, null, null, null, 0, 0, 0, null, 0, 0, 'poison', 1, 'vegetale', 5],
  ['mz_secret_cave_1', 'zone_fosse_crabs', 'Grotte Cachee', 'Une entree secrete dans la roche', 'cave', 4, 0, 1, '["crab_giant", "eel"]', 3, 1, 1, 'epic', 0, null, 1, 'hidden_room', 'Cherche une roche particuliere', 'tourner_roche', 1, 'Gardien des Profondeurs', 25, 400, 35, 15, 'chaos', '{"item":"relic_shell_legend","gold":500,"xp":500}', 0.25, 1, 'tourner_roche', 3, 3, 'chaos', 1, 'arcane', 10],
]

console.log('Expected columns: 36')
stmts.forEach((row, i) => {
  console.log(`Row ${i+1} (${row[0]}): ${row.length} values`)
})

let success = 0
let failed = 0

for (const args of stmts) {
  try {
    stmt.run(...args)
    success++
  } catch(e) {
    console.error('Error:', e.message, '- ID:', args[0], '- Count:', args.length)
    failed++
  }
}

console.log('✅ Micro-zones V2 created:', success, 'failed:', failed)
db.close()
