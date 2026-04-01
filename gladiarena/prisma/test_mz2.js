const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const db = new Database(dbPath)

console.log('🏗️  Test: Insert micro-zone with exact 36 columns')

const stmt = db.prepare(`
  INSERT INTO MicroZone (id, zoneId, name, description, type, dangerLevel, rotationGroup, isActive, enemyTypes, enemyCount, isElite, hasChest, chestRarity, isHiddenChest, chestUnlockHint, hasSecret, secretType, secretHint, secretAction, canSpawnBoss, bossName, bossLevel, bossHp, bossAttack, bossDefense, bossDamage, bossLoot, bossSpawnChance, isMicroDungeon, microDungeonEntry, microDungeonRooms, microDungeonDifficulty, baseDamageType, hasCorruption, corruptionType, visitOrder) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

// Test with 36 params - exactly like seed_micro.js row 1
const testParams = [
  'mz_test',
  'zone_carrieres_noires',
  'Test',
  'Test desc',
  'plain',
  1,
  0,
  1,
  '["kobold"]',
  2,
  0,
  1,
  'common',
  0,
  null,
  0,
  'hint',
  null,
  null,
  0,
  null,
  null,
  null,
  null,
  null,
  null,
  0,
  0,
  0,
  null,
  0,
  0,
  'physical',
  0,
  null,
  1
]

console.log('Params count:', testParams.length)

try {
  stmt.run(...testParams)
  console.log('✅ Success!')
  db.exec("DELETE FROM MicroZone WHERE id = 'mz_test'")
} catch(e) {
  console.log('❌ Error:', e.message)
}

db.close()