import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const city = await prisma.city.findUnique({
      where: { slug },
      include: {
        faction: true,
        zones: {
          orderBy: { dangerScore: 'asc' },
          include: {
            enemies: {
              select: {
                id: true,
                name: true,
                level: true,
                isElite: true,
                isBoss: true,
                enemyType: true,
              }
            },
            treasureChests: {
              select: {
                id: true,
                name: true,
                rarity: true,
                isHidden: true,
              }
            }
          }
        },
        dungeons: {
          orderBy: { difficulty: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            type: true,
            level: true,
            difficulty: true,
            roomCount: true,
            hasBoss: true,
            bossName: true,
            bossDamage: true,
          }
        },
        secretZones: {
          where: { isDiscovered: true },
          select: {
            id: true,
            name: true,
            description: true,
            dangerScore: true,
          }
        },
        safePoints: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            name: true,
            type: true,
            hasVendor: true,
            hasCraft: true,
            hasHeal: true,
            travelPoint: true,
          }
        },
        quests: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
          }
        }
      }
    })

    if (!city) {
      return NextResponse.json(
        { error: 'Ville non trouvée' },
        { status: 404 }
      )
    }

    // Group zones by type
    const zonesByType = {
      proche: city.zones.filter(z => z.zoneType === 'proche'),
      intermediaire: city.zones.filter(z => z.zoneType === 'intermediaire'),
      dangereuse: city.zones.filter(z => z.zoneType === 'dangereuse'),
    }

    // Calculate zone profiles
    const calculateProfile = (zones: typeof city.zones) => {
      if (zones.length === 0) return null
      
      const avgDanger = zones.reduce((sum, z) => sum + z.dangerScore, 0) / zones.length
      const damageTypes = [...new Set(zones.map(z => z.baseDamageType))]
      const hasCorruption = zones.some(z => z.hasCorruption)
      
      let profileName = city.name
      let riskLevel = avgDanger < 4 ? 'safe' : avgDanger < 7 ? 'medium' : 'high'
      
      if (damageTypes.includes('fire')) profileName = `🔥 ${profileName}`
      if (damageTypes.includes('poison')) profileName = `☠️ ${profileName}`
      if (damageTypes.includes('ice')) profileName = `❄️ ${profileName}`
      if (damageTypes.includes('chaos')) profileName = `🔮 ${profileName}`
      if (hasCorruption) profileName += ' (Corrompue)'
      
      const badges: string[] = []
      if (damageTypes.includes('fire')) badges.push('feu')
      if (damageTypes.includes('poison')) badges.push('poison')
      if (damageTypes.includes('ice')) badges.push('glace')
      if (damageTypes.includes('chaos')) badges.push('chaos')
      if (damageTypes.includes('water')) badges.push('eau')
      if (hasCorruption) badges.push('corruption')
      
      const prepRecommendations: string[] = []
      if (damageTypes.includes('fire')) prepRecommendations.push('Résistance feu recommandée')
      if (damageTypes.includes('poison')) prepRecommendations.push('Résistance poison recommandée')
      if (damageTypes.includes('ice')) prepRecommendations.push('Résistance glace recommandée')
      if (damageTypes.includes('chaos')) prepRecommendations.push('Résistance arcane recommandée')
      if (hasCorruption) prepRecommendations.push('Antidote requis')
      
      return {
        name: profileName,
        riskLevel,
        riskScore: Math.round(avgDanger * 10) / 10,
        badges,
        prepRecommendations,
        zoneCount: zones.length,
      }
    }

    return NextResponse.json({
      ...city,
      zonesByType,
      profiles: {
        proche: calculateProfile(zonesByType.proche),
        intermediaire: calculateProfile(zonesByType.intermediaire),
        dangereuses: calculateProfile(zonesByType.dangereuse),
      }
    })
  } catch (error) {
    console.error('City GET error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la ville' },
      { status: 500 }
    )
  }
}
