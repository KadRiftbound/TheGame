const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  const titles = await prisma.title.findMany({
    orderBy: { name: 'asc' }
  })
  
  console.log('=== ' + titles.length + ' TITRES ===\n')
  
  titles.forEach(t => {
    console.log('* ' + t.name + ' [' + t.type + ']')
    if (t.description) console.log('  ' + t.description)
    console.log('  Bonus: ' + t.bonus)
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())