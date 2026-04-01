import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.user.deleteMany()
  await prisma.character.deleteMany()
  console.log('All users and characters deleted')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())