import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    const existingCharacter = await prisma.character.findUnique({
      where: { userId: session.userId }
    })

    if (existingCharacter) {
      return NextResponse.json({ error: 'Vous avez déjà un personnage' }, { status: 400 })
    }

    const { name, classId, originId } = await request.json()

    if (!name || !classId) {
      return NextResponse.json({ error: 'Nom et classe requis' }, { status: 400 })
    }

    const characterClass = await prisma.characterClass.findUnique({
      where: { id: classId }
    })

    if (!characterClass) {
      return NextResponse.json({ error: 'Classe invalide' }, { status: 400 })
    }

    // Get origin bonuses if provided
    let originBonuses = { goldBonus: 0, xpBonus: 0 }
    if (originId) {
      const origin = await prisma.origin.findUnique({ where: { id: originId } })
      if (origin) {
        originBonuses = JSON.parse(origin.bonuses || '{}')
      }
    }

    const character = await prisma.character.create({
      data: {
        userId: session.userId,
        name,
        classId,
        originId: originId || null,
        level: 1,
        xp: 0,
        xpToNextLevel: 50,
        currentHp: 120,
        maxHp: 120,
        gold: 100 + Math.floor(originBonuses.goldBonus || 0),
        unspentPoints: 5,
        stats: {
          create: {
            force: 12,
            agility: 12,
            vitality: 12,
            luck: 12
          }
        }
      },
      include: {
        stats: true,
        class: true,
        origin: true
      }
    })

    return NextResponse.json({ character })
  } catch (error: any) {
    console.error('Create character error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    const character = await prisma.character.findUnique({
      where: { userId: session.userId },
      include: {
        stats: true,
        class: true,
        origin: true,
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

    if (!character) {
      return NextResponse.json({ character: null })
    }

    const equippedItems = await prisma.item.findMany({
      where: {
        OR: [
          { id: character.equippedWeapon ?? '' },
          { id: character.equippedShield ?? '' },
          { id: character.equippedHelmet ?? '' },
          { id: character.equippedArmor ?? '' },
          { id: character.equippedLegs ?? '' },
          { id: character.equippedAccessory ?? '' }
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

    if (!character) {
      return NextResponse.json({ character: null })
    }

    const fullInventory = [...character.inventory, ...equippedInventoryItems]

    return NextResponse.json({ 
      character: { ...character, inventory: fullInventory } 
    })
  } catch (error: any) {
    console.error('Get character error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
