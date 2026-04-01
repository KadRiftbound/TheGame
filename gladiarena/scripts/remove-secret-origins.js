import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  const secretIds = [
    'origin_roi_mort',
    'origin_destin',
    'origin_neant',
    'origin_espion',
    'origin_profondeurs',
    'origin_aube',
    'origin_heritier'
  ]
  
  for (const id of secretIds) {
    await prisma.origin.delete({ where: { id } }).catch(() => {})
    console.log(`🗑️ Supprimé: ${id}`)
  }
  
  const count = await prisma.origin.count()
  console.log(`\n✨ ${count} origines restantes`)
}

main().catch(console.error).finally(() => prisma.$disconnect())