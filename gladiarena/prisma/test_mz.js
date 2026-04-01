const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const db = new Database(dbPath)

const sql = `INSERT INTO MicroZone (id, zoneId, name, description, type, dangerLevel, rotationGroup, isActive, enemyTypes, enemyCount, isElite, hasChest, chestRarity, isHiddenChest, chestUnlockHint, hasSecret, secretType, secretHint, secretAction, canSpawnBoss, bossName, bossLevel, bossHp, bossAttack, bossDefense, bossDamage, bossLoot, bossSpawnChance, isMicroDungeon, microDungeonEntry, microDungeonRooms, microDungeonDifficulty, baseDamageType, hasCorruption, corruptionType, visitOrder)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

const qmarks = (sql.match(/\?/g) || []).length
console.log('Question marks:', qmarks)

const stmt = db.prepare(sql)
const params = [
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
  null,
  0,
  0,
  'physical',
  0,
  null,
  1
]

console.log('Params:', params.length)

try {
  stmt.run(...params)
  console.log('✅ Success')
  db.exec("DELETE FROM MicroZone WHERE id = 'mz_test'")
} catch(e) {
  console.log('❌ Error:', e.message)
}

db.close()