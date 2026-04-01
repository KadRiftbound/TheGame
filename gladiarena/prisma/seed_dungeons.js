const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const db = new Database(dbPath)

console.log('Creating dungeons with branches...')

const cities = db.prepare('SELECT id, name FROM City').all()
if (cities.length === 0) {
  console.log('No cities found!')
  db.close()
  process.exit(1)
}

const cityId = cities[0].id

db.exec('DELETE FROM DungeonRoom')
db.exec('DELETE FROM Dungeon')

db.prepare(`
  INSERT INTO Dungeon (id, name, slug, description, cityId, type, level, difficulty, roomCount, hasBoss, bossName, bossDamage, bossHp, createdAt, updatedAt) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`).run('dungeon_cabes', 'Cavernes des Crabes', 'cavernes-cabes', 'Les profondeurs regorgeant de crabs', cityId, 'standard', 5, 2, 7, 1, 'Roi Crab', 'physical', 150)

const insertRoom = db.prepare(`
  INSERT INTO DungeonRoom (id, dungeonId, roomIndex, name, description, type, enemies, enemyCount, hasElite, hasChest, chestRarity, minGold, maxGold, choiceText, choiceA, choiceB, roomAId, roomBId, isRestPoint, healAmount, isBoss, bossName, bossHp, bossAttack, bossDefense, bossDamage, bossLoot, isExit, exitText) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

// Use 0 for booleans, empty strings for texts
insertRoom.run('room_cabes_0', 'dungeon_cabes', 0, 'Entree des Cavernes', 'Une entree sombre et humide', 'combat', '["crab"]', 3, 0, 0, 'common', 10, 50, '', '', '', '', '', 0, 0, 0, '', 0, 0, 0, '', '', 0, '')
insertRoom.run('room_cabes_1', 'dungeon_cabes', 1, 'Galerie Principale', 'Une grande galerie', 'choice', '["crab", "crab_giant"]', 4, 0, 1, 'common', 50, 100, 'Vous voyez deux chemins', 'Continuer tout droit', 'Prendre le detour', 'room_cabes_2', 'room_cabes_3', 0, 0, 0, '', 0, 0, 0, '', '', 0, '')
insertRoom.run('room_cabes_2', 'dungeon_cabes', 2, 'Salle des Oeufs', 'Des centaines doeufs', 'combat', '["crab"]', 5, 1, 1, 'rare', 50, 100, '', '', '', '', '', 0, 0, 0, '', 0, 0, 0, '', '', 0, '')
insertRoom.run('room_cabes_3', 'dungeon_cabes', 3, 'Tunnel Cache', 'Un tunnel secret', 'treasure', '[]', 0, 0, 0, 'epic', 100, 200, 'Le tunnel continue...', '', '', '', '', 0, 0, 0, '', 0, 0, 0, '', '', 0, '')
insertRoom.run('room_cabes_4', 'dungeon_cabes', 4, 'Riviere Souterraine', 'Une riviere aux eaux troubles', 'choice', '["eel"]', 2, 0, 0, 'common', 10, 30, 'La riviere ou le mur?', 'Traverser', 'Suivre le mur', 'room_cabes_5', 'room_cabes_5b', 0, 0, 0, '', 0, 0, 0, '', '', 0, '')
insertRoom.run('room_cabes_5', 'dungeon_cabes', 5, 'Le Grand Bassin', 'Le bassin du Roi Crab', 'boss', '["crab_giant"]', 1, 1, 1, 'legendary', 200, 500, '', '', '', '', '', 0, 0, 1, 'Roi Crab', 150, 25, 10, 'physical', '', 0, '')
insertRoom.run('room_cabes_6', 'dungeon_cabes', 6, 'Sortie Secrete', 'La sortie secrete', 'exit', '[]', 0, 0, 0, 'common', 0, 0, '', '', '', '', '', 0, 0, 0, '', 0, 0, 0, '', '', 1, 'Vous avez trouve la sortie!')

console.log('Created: Cavernes des Crabes')

db.prepare(`
  INSERT INTO Dungeon (id, name, slug, description, cityId, type, level, difficulty, roomCount, hasBoss, bossName, bossDamage, bossHp, createdAt, updatedAt) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`).run('dungeon_tour_brume', 'Tour de la Brume', 'tour-brume', 'Une tour ancienne enveloppee de brume', cityId, 'avance', 10, 4, 5, 1, 'Voleur Fantome', 'chaos', 250)

insertRoom.run('room_brume_0', 'dungeon_tour_brume', 0, 'Hall d\'Entre', 'Un hall couvert de brume', 'combat', '["thief"]', 3, 0, 0, 'common', 10, 50, '', '', '', '', '', 0, 0, 0, '', 0, 0, 0, '', '', 0, '')
insertRoom.run('room_brume_1', 'dungeon_tour_brume', 1, 'Escalier en Spirale', 'Un escalier qui monte', 'choice', '["ghost"]', 2, 0, 0, 'common', 10, 30, 'Monter ou ascenseur?', 'Monter', 'Chercher ascenseur', 'room_brume_2', 'room_brume_2b', 0, 0, 0, '', 0, 0, 0, '', '', 0, '')
insertRoom.run('room_brume_2', 'dungeon_tour_brume', 2, 'Passage Secret', 'Un passage cache', 'treasure', '[]', 0, 0, 1, 'rare', 150, 300, 'Vous sentez une presence...', '', '', '', '', 0, 0, 0, '', 0, 0, 0, '', '', 0, '')
insertRoom.run('room_brume_3', 'dungeon_tour_brume', 3, 'Salle du Trone', 'Le trone de la tour', 'boss', '["boss_ghost"]', 1, 1, 1, 'epic', 300, 750, '', '', '', '', '', 0, 0, 1, 'Voleur Fantome', 250, 40, 15, 'chaos', '', 0, '')
insertRoom.run('room_brume_4', 'dungeon_tour_brume', 4, 'Balcon de la Tour', 'Vue sur la ville', 'exit', '[]', 0, 0, 0, 'common', 0, 0, '', '', '', '', '', 0, 0, 0, '', 0, 0, 0, '', '', 1, 'La liberation!')

console.log('Created: Tour de la Brume')
console.log('Done!')

db.close()
