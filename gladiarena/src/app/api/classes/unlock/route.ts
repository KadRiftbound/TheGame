import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const TRACKER_TYPES: Record<string, string> = {
  DEATHS_IN_ZONE: 'deaths_in_zone',
  SUCCESSFUL_STEALS: 'successful_steals',
  FLED_COMBAT: 'fled_combat',
  WON_FLED_COMBAT: 'won_fled_combat',
  PVP_DEFEATS: 'pvp_defeats',
  REFUSED_OFFERS: 'refused_offers',
  SACRED_CHOICES_REFUSED: 'sacred_choices_refused',
  BETRAYALS_COMMITTED: 'betrayals_committed',
  EXPLORATIONS_NO_COMBAT: 'explorations_no_combat',
  HIDDEN_ZONES_VISITED: 'hidden_zones_visited',
  SECRET_CHESTS_FOUND: 'secret_chests_found',
  BOSS_KILLED: 'boss_killed',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { characterId, action, trackerType, zoneId, value } = body
    
    if (!characterId) {
      return NextResponse.json({ error: 'Character ID required' }, { status: 400 })
    }

    if (action === 'track') {
      const amount = value || 1
      const updateData: Record<string, number> = {}
      
      const fieldMap: Record<string, string> = {
        [TRACKER_TYPES.SUCCESSFUL_STEALS]: 'successfulSteals',
        [TRACKER_TYPES.FLED_COMBAT]: 'fledCombat',
        [TRACKER_TYPES.WON_FLED_COMBAT]: 'wonFledCombat',
        [TRACKER_TYPES.PVP_DEFEATS]: 'pvpDefeats',
        [TRACKER_TYPES.REFUSED_OFFERS]: 'offersRefused',
        [TRACKER_TYPES.SACRED_CHOICES_REFUSED]: 'sacredChoicesRefused',
        [TRACKER_TYPES.BETRAYALS_COMMITTED]: 'betrayalsCommitted',
        [TRACKER_TYPES.EXPLORATIONS_NO_COMBAT]: 'explorationsNoCombat',
        [TRACKER_TYPES.HIDDEN_ZONES_VISITED]: 'hiddenZonesVisited',
        [TRACKER_TYPES.SECRET_CHESTS_FOUND]: 'secretChestsFound',
        [TRACKER_TYPES.BOSS_KILLED]: 'bossKilled',
      }
      
      const field = fieldMap[trackerType]
      if (field) {
        updateData[field] = amount
      }
      
      if (trackerType === TRACKER_TYPES.DEATHS_IN_ZONE && zoneId) {
        const zoneFieldMap: Record<string, string> = {
          'zone_ombre': 'deathsInOmbre',
          'zone_volcan': 'deathsInVolcan',
          'zone_tombe': 'deathsInTombe',
        }
        const zoneField = zoneFieldMap[zoneId] || 'deathsInSecretZone'
        updateData[zoneField] = amount
      }
      
      if (Object.keys(updateData).length > 0) {
        const updates: Record<string, any> = {}
        for (const [key, val] of Object.entries(updateData)) {
          updates[key] = { increment: val }
        }
        await prisma.character.update({
          where: { id: characterId },
          data: updates,
        })
      }
      
      return NextResponse.json({ success: true, trackerType, amount })
    }
    
    if (action === 'check') {
      const character = await prisma.character.findUnique({
        where: { id: characterId },
        select: {
          classId: true,
          level: true,
          gold: true,
          successfulSteals: true,
          deathsInSecretZone: true,
          deathsInOmbre: true,
          secretFlags: true,
          explorationsNoCombat: true,
        }
      })
      
      if (!character) {
        return NextResponse.json({ error: 'Character not found' }, { status: 404 })
      }
      
      const secretFlags = JSON.parse(character.secretFlags || '[]')
      
      const unlockedClasses: string[] = []
      
      const conditions: Record<string, (c: any) => boolean> = {
        danse_lame_neant: (c) => c.deathsInOmbre >= 3,
        voleur_tempete: (c) => c.gold >= 10000 && c.successfulSteals >= 50,
        moine_fer: (c) => secretFlags.includes('no_armor_victory'),
        heritier_dragon: (c) => secretFlags.includes('black_egg_found') && c.level >= 40,
      }
      
      for (const [classId, checkFn] of Object.entries(conditions)) {
        if (checkFn(character)) {
          unlockedClasses.push(classId)
        }
      }
      
      return NextResponse.json({ success: true, unlockedClasses })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Trackers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const characterId = searchParams.get('characterId')
    
    if (!characterId) {
      return NextResponse.json({ error: 'Character ID required' }, { status: 400 })
    }
    
    const unlocks = await prisma.classUnlockEvent.findMany({
      where: { characterId },
      orderBy: { unlockedAt: 'desc' },
    })
    
    return NextResponse.json({ success: true, unlocks })
  } catch (error) {
    console.error('Get unlocks API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}