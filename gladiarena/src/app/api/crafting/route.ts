import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CRAFTING_RECIPES = [
  { type: 'weapon', level: 5, cost: 100, stats: { attack: 12 } },
  { type: 'weapon', level: 10, cost: 250, stats: { attack: 20 } },
  { type: 'weapon', level: 15, cost: 500, stats: { attack: 30, critChance: 3 } },
  { type: 'weapon', level: 20, cost: 1000, stats: { attack: 45, critChance: 5 } },
  { type: 'shield', level: 5, cost: 100, stats: { defense: 8 } },
  { type: 'shield', level: 10, cost: 250, stats: { defense: 15, hp: 20 } },
  { type: 'shield', level: 15, cost: 500, stats: { defense: 25, hp: 40 } },
  { type: 'shield', level: 20, cost: 1000, stats: { defense: 40, hp: 80 } },
  { type: 'helmet', level: 5, cost: 80, stats: { defense: 5, hp: 15 } },
  { type: 'helmet', level: 10, cost: 200, stats: { defense: 10, hp: 30 } },
  { type: 'helmet', level: 15, cost: 400, stats: { defense: 18, hp: 50 } },
  { type: 'helmet', level: 20, cost: 800, stats: { defense: 28, hp: 90 } },
  { type: 'armor', level: 5, cost: 100, stats: { defense: 8, hp: 20 } },
  { type: 'armor', level: 10, cost: 250, stats: { defense: 18, hp: 45 } },
  { type: 'armor', level: 15, cost: 500, stats: { defense: 30, hp: 75 } },
  { type: 'armor', level: 20, cost: 1000, stats: { defense: 48, hp: 130 } },
  { type: 'legs', level: 5, cost: 80, stats: { defense: 4, agility: 5 } },
  { type: 'legs', level: 10, cost: 200, stats: { defense: 8, agility: 10 } },
  { type: 'legs', level: 15, cost: 400, stats: { defense: 14, agility: 18 } },
  { type: 'legs', level: 20, cost: 800, stats: { defense: 22, agility: 28 } },
  { type: 'accessory', level: 5, cost: 100, stats: { attack: 5, luck: 3 } },
  { type: 'accessory', level: 10, cost: 250, stats: { attack: 10, luck: 8 } },
  { type: 'accessory', level: 15, cost: 500, stats: { attack: 18, luck: 15, critChance: 2 } },
  { type: 'accessory', level: 20, cost: 1000, stats: { attack: 28, luck: 25, critChance: 5 } },
]

export async function GET(request: NextRequest) {
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

    const availableRecipes = CRAFTING_RECIPES.filter(r => r.level <= character.level)

    return NextResponse.json({ 
      recipes: availableRecipes,
      playerGold: character.gold,
      playerLevel: character.level
    })
  } catch (error) {
    console.error('Crafting error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des recettes' },
      { status: 500 }
    )
  }
}

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

    const { recipeIndex } = await request.json()

    const recipe = CRAFTING_RECIPES[recipeIndex]
    if (!recipe) {
      return NextResponse.json({ error: 'Recette invalide' }, { status: 400 })
    }

    if (recipe.level > character.level) {
      return NextResponse.json({ error: `Niveau ${recipe.level} requis` }, { status: 400 })
    }

    if (character.gold < recipe.cost) {
      return NextResponse.json({ error: 'Or insuffisant' }, { status: 400 })
    }

    const baseItem = await prisma.itemBase.findFirst({
      where: { 
        type: recipe.type,
        levelReq: { lte: recipe.level }
      },
      orderBy: { levelReq: 'desc' }
    })

    if (!baseItem) {
      return NextResponse.json({ error: 'Item base non trouvé' }, { status: 500 })
    }

    const rarity = await prisma.itemRarity.findFirst({
      where: { id: 'common' }
    })

    const newItem = await prisma.item.create({
      data: {
        baseItemId: baseItem.id,
        rarityId: rarity?.id || 'common',
        finalStats: JSON.stringify(recipe.stats),
        itemLevel: recipe.level,
        source: 'craft',
        craftedBy: character.id
      }
    })

    const inventorySlots = await prisma.inventoryItem.findMany({
      where: { characterId: character.id },
      orderBy: { slot: 'desc' }
    })
    const nextSlot = inventorySlots.length > 0 ? inventorySlots[0].slot + 1 : 0

    await prisma.inventoryItem.create({
      data: {
        characterId: character.id,
        itemId: newItem.id,
        slot: nextSlot
      }
    })

    await prisma.character.update({
      where: { id: character.id },
      data: { 
        gold: character.gold - recipe.cost,
        craftCount: character.craftCount + 1
      }
    })

    return NextResponse.json({
      success: true,
      item: {
        id: newItem.id,
        name: baseItem.name,
        type: baseItem.type,
        level: recipe.level,
        stats: recipe.stats
      }
    })
  } catch (error) {
    console.error('Crafting error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du craft' },
      { status: 500 }
    )
  }
}
