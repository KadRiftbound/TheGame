import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'
import path from 'path'

async function test() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  console.log('Testing item creation...')

  try {
    // Get a rarity
    const rarity = await prisma.itemRarity.findFirst()
    console.log('Rarity:', rarity)

    // Get a base item
    const baseItem = await prisma.itemBase.findFirst()
    console.log('Base item:', baseItem)

    if (rarity && baseItem) {
      // Create an item
      const newItem = await prisma.item.create({
        data: {
          baseItemId: baseItem.id,
          rarityId: rarity.id,
          finalStats: '{"attack": 10}',
          itemLevel: 1,
          source: 'test'
        }
      })
      console.log('Item created:', newItem)

      // Create inventory item
      const invItem = await prisma.inventoryItem.create({
        data: {
          characterId: 'test-character',
          itemId: newItem.id,
          slot: 0
        }
      })
      console.log('Inventory item created:', invItem)
    }

    console.log('Test PASSED!')
  } catch (error) {
    console.error('Test FAILED:', error)
  } finally {
    await prisma.$disconnect()
  }
}

test()
