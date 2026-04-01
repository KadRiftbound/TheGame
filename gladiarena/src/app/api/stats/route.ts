import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const STAT_CONFIG = {
  strength: { name: 'Force', icon: '⚔️', baseCost: 100, multiplier: 1.15, maxPoints: 50 },
  agility: { name: 'Agilité', icon: '🏹', baseCost: 100, multiplier: 1.15, maxPoints: 50 },
  vitality: { name: 'Vitalité', icon: '❤️', baseCost: 100, multiplier: 1.15, maxPoints: 50 },
  luck: { name: 'Chance', icon: '🍀', baseCost: 100, multiplier: 1.15, maxPoints: 50 },
}

function calculateStatCost(statName: string, currentPoints: number): number {
  const config = STAT_CONFIG[statName as keyof typeof STAT_CONFIG]
  if (!config) return 0
  return Math.floor(config.baseCost * Math.pow(config.multiplier, currentPoints))
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const session = await prisma.session.findUnique({
      where: { token },
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

    const stats = {
      strength: {
        name: 'Force',
        icon: '⚔️',
        value: character.baseStrength + character.strengthInvested,
        base: character.baseStrength,
        invested: character.strengthInvested,
        cost: calculateStatCost('strength', character.strengthInvested),
        maxPoints: STAT_CONFIG.strength.maxPoints,
        description: 'Augmente les dégâts d\'attaque'
      },
      agility: {
        name: 'Agilité',
        icon: '🏹',
        value: character.baseAgility + character.agilityInvested,
        base: character.baseAgility,
        invested: character.agilityInvested,
        cost: calculateStatCost('agility', character.agilityInvested),
        maxPoints: STAT_CONFIG.agility.maxPoints,
        description: 'Augmente l\'esquive et le critique'
      },
      vitality: {
        name: 'Vitalité',
        icon: '❤️',
        value: character.baseVitality + character.vitalityInvested,
        base: character.baseVitality,
        invested: character.vitalityInvested,
        cost: calculateStatCost('vitality', character.vitalityInvested),
        maxPoints: STAT_CONFIG.vitality.maxPoints,
        description: 'Augmente les PV max et la défense'
      },
      luck: {
        name: 'Chance',
        icon: '🍀',
        value: character.baseLuck + character.luckInvested,
        base: character.baseLuck,
        invested: character.luckInvested,
        cost: calculateStatCost('luck', character.luckInvested),
        maxPoints: STAT_CONFIG.luck.maxPoints,
        description: 'Augmente les chances de loot et critique'
      }
    }

    return NextResponse.json({
      stats,
      availableGold: character.gold
    })

  } catch (error: any) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
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
      where: { token },
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

    const { action, statName, amount } = await request.json()

    if (action === 'invest') {
      if (!statName || !STAT_CONFIG[statName as keyof typeof STAT_CONFIG]) {
        return NextResponse.json({ error: 'Stat invalide' }, { status: 400 })
      }

      const currentInvested = {
        strength: character.strengthInvested,
        agility: character.agilityInvested,
        vitality: character.vitalityInvested,
        luck: character.luckInvested
      }[statName as keyof typeof STAT_CONFIG] as number || 0

      const maxPoints = STAT_CONFIG[statName as keyof typeof STAT_CONFIG].maxPoints
      if (currentInvested >= maxPoints) {
        return NextResponse.json({ error: `Maximum de points atteint pour ${statName}` }, { status: 400 })
      }

      const cost = calculateStatCost(statName, currentInvested)
      if (character.gold < cost) {
        return NextResponse.json({ error: `Or insuffisant (il faut ${cost} or)` }, { status: 400 })
      }

      const updateData: Record<string, any> = {
        gold: character.gold - cost
      }

      switch (statName) {
        case 'strength':
          updateData.strengthInvested = currentInvested + 1
          updateData.baseStrength = character.baseStrength + 1
          break
        case 'agility':
          updateData.agilityInvested = currentInvested + 1
          updateData.baseAgility = character.baseAgility + 1
          break
        case 'vitality':
          updateData.vitalityInvested = currentInvested + 1
          updateData.baseVitality = character.baseVitality + 1
          // Also update max HP
          updateData.maxHp = character.maxHp + 15
          updateData.currentHp = Math.min(character.currentHp + 15, character.maxHp + 15)
          break
        case 'luck':
          updateData.luckInvested = currentInvested + 1
          updateData.baseLuck = character.baseLuck + 1
          break
      }

      await prisma.character.update({
        where: { id: character.id },
        data: updateData
      })

      const newCost = calculateStatCost(statName, currentInvested + 1)

      return NextResponse.json({
        success: true,
        message: `+1 ${STAT_CONFIG[statName as keyof typeof STAT_CONFIG].name}! Il reste ${maxPoints - currentInvested - 1} points disponibles.`,
        newCost,
        newInvested: currentInvested + 1,
        newValue: character[statName === 'strength' ? 'baseStrength' : statName === 'agility' ? 'baseAgility' : statName === 'vitality' ? 'baseVitality' : 'baseLuck'] + currentInvested + 1
      })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })

  } catch (error: any) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
