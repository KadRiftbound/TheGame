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

    const { inventoryItemId, quantity = 1 } = await request.json()

    if (!inventoryItemId) {
      return NextResponse.json({ error: 'Item requis' }, { status: 400 })
    }

    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
      include: { item: true }
    })

    if (!inventoryItem || inventoryItem.characterId !== character.id) {
      return NextResponse.json({ error: 'Item non trouvé' }, { status: 404 })
    }

    const rarityMultiplier: Record<string, number> = {
      'common': 1,
      'uncommon': 2,
      'rare': 5,
      'epic': 15,
      'legendary': 50
    }

    const rarity = inventoryItem.item.rarityId
    const basePrice = 10 * (inventoryItem.item.itemLevel || 1)
    const sellPrice = basePrice * (rarityMultiplier[rarity] || 1) * quantity

    if (inventoryItem.quantity > quantity) {
      await prisma.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { quantity: { decrement: quantity } }
      })
    } else {
      await prisma.inventoryItem.delete({
        where: { id: inventoryItemId }
      })
    }

    await prisma.character.update({
      where: { id: character.id },
      data: { gold: { increment: sellPrice } }
    })

    const updatedCharacter = await prisma.character.findUnique({
      where: { id: character.id },
      include: {
        stats: true,
        class: true,
        inventory: {
          include: { item: { include: { baseItem: true, rarity: true, prefix: true, suffix: true } } },
          orderBy: { slot: 'asc' }
        }
      }
    })

    return NextResponse.json({ 
      character: updatedCharacter,
      soldPrice: sellPrice
    })
  } catch (error) {
    console.error('Sell error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vente' },
      { status: 500 }
    )
  }
}
