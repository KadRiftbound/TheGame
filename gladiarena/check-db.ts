import Database from 'better-sqlite3'
import path from 'path'

const db = new Database(path.join(process.cwd(), 'prisma', 'dev.db'))

console.log('=== Item Bases ===')
const bases = db.prepare('SELECT * FROM ItemBase').all() as any[]
console.log('Count:', bases.length)
if (bases.length > 0) {
  console.log('Sample:', bases[0])
}

console.log('\n=== Item Rarities ===')
const rarities = db.prepare('SELECT * FROM ItemRarity').all() as any[]
console.log('Count:', rarities.length)
console.log(rarities)

console.log('\n=== Item Prefixes ===')
const prefixes = db.prepare('SELECT * FROM ItemPrefix').all() as any[]
console.log('Count:', prefixes.length)

console.log('\n=== Item Suffixes ===')
const suffixes = db.prepare('SELECT * FROM ItemSuffix').all() as any[]
console.log('Count:', suffixes.length)

console.log('\n=== Items (dropped) ===')
const items = db.prepare('SELECT * FROM Item').all() as any[]
console.log('Count:', items.length)
if (items.length > 0) {
  console.log('Sample:', items[0])
}

db.close()
