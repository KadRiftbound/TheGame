import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function calculateZoneProfile(zone: any): any {
  const dangers: string[] = []
  const prepRecommendations: string[] = []
  let riskScore = 0

  const damageType = zone.baseDamageType || 'physical'
  if (damageType !== 'physical') {
    dangers.push(damageType)
    const resistNames: Record<string, string> = {
      fire: 'Feu',
      ice: 'Glace',
      poison: 'Poison',
      chaos: 'Chaos'
    }
    prepRecommendations.push(`Résistance ${resistNames[damageType] || damageType}`)
    riskScore += 3
  }

  if (zone.hasCorruption) {
    dangers.push('corruption')
    prepRecommendations.push('Purification')
    riskScore += 4
  }

  if ((zone.trapDensity || 0) >= 7) {
    dangers.push('pièges denses')
    riskScore += 2
  } else if ((zone.trapDensity || 0) >= 4) {
    dangers.push('pièges')
    riskScore += 1
  }

  if (zone.environmentalHazard) {
    dangers.push('danger environnemental')
    riskScore += 2
  }

  const healRating = zone.healAvailability <= 25 ? 'rare' 
                   : zone.healAvailability <= 50 ? 'limité' 
                   : 'abondant'

  if (healRating === 'rare') {
    prepRecommendations.push('Potions de Soin')
    riskScore += 2
  }

  const badges: string[] = []
  if (zone.hasCorruption) badges.push('corruption')
  if ((zone.trapDensity || 0) >= 5) badges.push('pièges')
  if (damageType !== 'physical') badges.push(damageType)
  if (zone.environmentalHazard) badges.push('danger')
  if (healRating === 'rare') badges.push('soins_rares')

  const profileName = (() => {
    if (dangers.includes('corruption')) return 'Zone Corrompue'
    if (dangers.includes('fire') && dangers.includes('corruption')) return 'Volcan Ardent'
    if (dangers.includes('poison')) return 'Terre Empoisonnée'
    if (dangers.includes('ice')) return 'Toundra Glaciale'
    if (dangers.includes('chaos')) return 'Territoire du Chaos'
    if (dangers.includes('pièges denses')) return 'Labyrinthe Dangereux'
    const diffNames: Record<string, string> = {
      easy: 'Territoire Sûr',
      normal: 'Zone de Chasse',
      hard: 'Zone Hostile',
      secret: 'Territoire Secret'
    }
    return diffNames[zone.difficulty] || 'Zone de Chasse'
  })()

  return {
    riskScore,
    dangers,
    prepRecommendations,
    healRating,
    profileName,
    badges
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeHidden = searchParams.get('includeHidden') === 'true'
    
    const whereClause: any = {}
    if (!includeHidden) {
      whereClause.isHidden = false
    }
    
    const zonesData = await prisma.zone.findMany({
      where: whereClause,
      include: {
        enemies: {
          select: {
            id: true,
            name: true,
            level: true,
            hp: true,
            attack: true,
            defense: true,
            xpReward: true,
            goldReward: true,
            isElite: true,
            isBoss: true,
            enemyType: true
          }
        },
        treasureChests: {
          select: {
            id: true,
            name: true,
            description: true,
            rarity: true,
            isHidden: true,
            minGold: true,
            maxGold: true
          }
        }
      },
      orderBy: { minLevel: 'asc' }
    })

    const zones = zonesData.map(zone => ({
      ...zone,
      profile: calculateZoneProfile(zone)
    }))

    return NextResponse.json({ zones })
  } catch (error: any) {
    console.error('Get zones error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}`, zones: [] },
      { status: 500 }
    )
  }
}
