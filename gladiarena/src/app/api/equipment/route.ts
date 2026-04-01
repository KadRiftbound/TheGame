import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const session = await prisma.session.findUnique({
      where: { token }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    const character = await prisma.character.findUnique({
      where: { userId: session.userId }
    })

    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    const { inventoryItemId, action, itemId: directItemId } = await request.json()

    if ((!inventoryItemId && !directItemId) || !action) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 })
    }

    let inventoryItem = null
    let itemToEquip = null

    if (inventoryItemId?.startsWith('equipped-')) {
      const actualItemId = inventoryItemId.replace('equipped-', '')
      itemToEquip = await prisma.item.findUnique({
        where: { id: actualItemId },
        include: { baseItem: true }
      })
      if (!itemToEquip) {
        return NextResponse.json({ error: 'Item non trouvé' }, { status: 404 })
      }
    } else {
      inventoryItem = await prisma.inventoryItem.findUnique({
        where: { id: inventoryItemId },
        include: { item: { include: { baseItem: true } } }
      })

      if (!inventoryItem || inventoryItem.characterId !== character.id) {
        return NextResponse.json({ error: 'Item non trouvé' }, { status: 404 })
      }
      itemToEquip = inventoryItem.item
    }

    const itemType = itemToEquip.baseItem.type
    const slotMap: Record<string, string> = {
      'weapon': 'equippedWeapon',
      'shield': 'equippedShield',
      'helmet': 'equippedHelmet',
      'armor': 'equippedArmor',
      'legs': 'equippedLegs',
      'accessory': 'equippedAccessory'
    }

    const equipSlot = slotMap[itemType]
    if (!equipSlot) {
      return NextResponse.json({ error: 'Type d\'item non équipable' }, { status: 400 })
    }

    if (action === 'equip') {
      const currentEquippedId = character[equipSlot as keyof typeof character] as string | null
      
      if (currentEquippedId) {
        const currentEquipped = await prisma.item.findUnique({
          where: { id: currentEquippedId }
        })
        
        if (currentEquipped) {
          const slots = await prisma.inventoryItem.findMany({
            where: { characterId: character.id },
            orderBy: { slot: 'desc' }
          })
          const nextSlot = slots.length > 0 ? slots[0].slot + 1 : 0
          
          await prisma.inventoryItem.create({
            data: {
              characterId: character.id,
              itemId: currentEquippedId,
              slot: nextSlot
            }
          })
        }
      }

      await prisma.inventoryItem.delete({
        where: { id: inventoryItemId }
      })

      await prisma.character.update({
        where: { id: character.id },
        data: { [equipSlot]: itemToEquip.id }
      })

    } else if (action === 'unequip') {
      const slots = await prisma.inventoryItem.findMany({
        where: { characterId: character.id },
        orderBy: { slot: 'desc' }
      })
      const nextSlot = slots.length > 0 ? slots[0].slot + 1 : 0

      const itemIdToAdd = itemToEquip.id

      await prisma.inventoryItem.create({
        data: {
          characterId: character.id,
          itemId: itemIdToAdd,
          slot: nextSlot
        }
      })

      await prisma.character.update({
        where: { id: character.id },
        data: { [equipSlot]: null }
      })
    }

    const updatedCharacter = await prisma.character.findUnique({
      where: { id: character.id },
      include: {
        stats: true,
        class: true,
        inventory: {
          include: { 
            item: { 
              include: { 
                baseItem: true,
                rarity: true,
                prefix: true,
                suffix: true
              } 
            } 
          },
          orderBy: { slot: 'asc' }
        }
      }
    })

    const equippedItems = await prisma.item.findMany({
      where: {
        OR: [
          { id: updatedCharacter!.equippedWeapon ?? '' },
          { id: updatedCharacter!.equippedShield ?? '' },
          { id: updatedCharacter!.equippedHelmet ?? '' },
          { id: updatedCharacter!.equippedArmor ?? '' },
          { id: updatedCharacter!.equippedLegs ?? '' },
          { id: updatedCharacter!.equippedAccessory ?? '' }
        ].filter(i => i.id !== '')
      },
      include: {
        baseItem: true,
        rarity: true,
        prefix: true,
        suffix: true
      }
    })

    const equippedInventoryItems = equippedItems.map((item, index) => ({
      id: `equipped-${item.id}`,
      itemId: item.id,
      slot: -1 - index,
      item
    }))

    return NextResponse.json({ 
      character: { ...updatedCharacter, inventory: [...updatedCharacter!.inventory, ...equippedInventoryItems] } 
    })
  } catch (error) {
    console.error('Equip error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'équipement' },
      { status: 500 }
    )
  }
}
