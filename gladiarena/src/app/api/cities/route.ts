import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        faction: true,
        zones: {
          select: {
            id: true,
            name: true,
            slug: true,
            zoneType: true,
            dangerScore: true,
            baseDamageType: true,
            minLevel: true,
            maxLevel: true,
          }
        },
        dungeons: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            level: true,
            difficulty: true,
          }
        },
        secretZones: {
          where: { isDiscovered: false },
          select: {
            id: true,
            name: true,
            discoveryType: true,
            dangerScore: true,
          }
        },
        safePoints: {
          select: {
            id: true,
            name: true,
            type: true,
            hasVendor: true,
            hasHeal: true,
          }
        },
        _count: {
          select: {
            zones: true,
            dungeons: true,
            secretZones: true,
          }
        }
      }
    })

    const citiesWithZoneCounts = cities.map(city => {
      const zoneCounts = {
        proche: city.zones.filter(z => z.zoneType === 'proche').length,
        intermediaire: city.zones.filter(z => z.zoneType === 'intermediaire').length,
        dangereuse: city.zones.filter(z => z.zoneType === 'dangereuse').length,
      }

      return {
        ...city,
        zoneCounts,
        zones: undefined,
      }
    })

    return NextResponse.json(citiesWithZoneCounts)
  } catch (error) {
    console.error('Cities GET error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des villes' },
      { status: 500 }
    )
  }
}
