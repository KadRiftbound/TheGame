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

    const healAmount = Math.floor(character.maxHp * 0.5)
    const healCost = Math.floor(character.maxHp * 0.1)

    if (character.currentHp >= character.maxHp) {
      return NextResponse.json({ error: 'HP déjà au maximum' }, { status: 400 })
    }

    if (character.gold < healCost) {
      return NextResponse.json({ error: 'Or insuffisant' }, { status: 400 })
    }

    const updatedCharacter = await prisma.character.update({
      where: { id: character.id },
      data: {
        currentHp: Math.min(character.currentHp + healAmount, character.maxHp),
        gold: character.gold - healCost
      },
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
          { id: updatedCharacter.equippedWeapon ?? '' },
          { id: updatedCharacter.equippedShield ?? '' },
          { id: updatedCharacter.equippedHelmet ?? '' },
          { id: updatedCharacter.equippedArmor ?? '' },
          { id: updatedCharacter.equippedLegs ?? '' },
          { id: updatedCharacter.equippedAccessory ?? '' }
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
      character: { ...updatedCharacter, inventory: [...updatedCharacter.inventory, ...equippedInventoryItems] },
      healed: healAmount
    })
  } catch (error) {
    console.error('Heal error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du repos' },
      { status: 500 }
    )
  }
}
