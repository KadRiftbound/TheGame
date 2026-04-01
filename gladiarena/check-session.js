import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Test avec le token stocké dans le localStorage
  const testToken = 'Y21uZnd2ZG4yMDA5ZTY4dXlwc2wyMmw1bToxNzc1MDQwMzc0OTUz'
  
  const session = await prisma.session.findUnique({
    where: { token: testToken },
    include: { user: true }
  })
  
  console.log('Session:', session ? 'Valide' : 'Invalide')
  
  if (session) {
    console.log('Expires:', session.expiresAt)
    console.log('Expired:', session.expiresAt < new Date())
    
    const character = await prisma.character.findUnique({
      where: { userId: session.userId }
    })
    console.log('Character:', character ? character.name : 'Aucun')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())