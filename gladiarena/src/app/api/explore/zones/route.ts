import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const searchParams = request.nextUrl.searchParams
    const zoneId = searchParams.get('zoneId')
    
    if (!token || !zoneId) {
      return NextResponse.json({ error: 'Token and zoneId required' }, { status: 400 })
    }
    
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    })
    
    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }
    
    const character = await prisma.character.findUnique({
      where: { userId: session.userId }
    })
    
    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }
    
    // Get all micro-zones for this zone
    const microZones = await prisma.microZone.findMany({
      where: { zoneId },
      orderBy: { visitOrder: 'asc' }
    })
    
    // Get or create zone state
    let zoneState = await prisma.characterZoneState.findUnique({
      where: {
        characterId_zoneId: {
          characterId: character.id,
          zoneId
        }
      }
    })
    
    if (!zoneState) {
      // Create initial state with rotation based on time
      const rotationGroup = (Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % 5) + 1
      zoneState = await prisma.characterZoneState.create({
        data: {
          characterId: character.id,
          zoneId,
          currentRotation: rotationGroup
        }
      })
    }
    
    // Filter active micro-zones (rotation group 0 = always active, or matches current rotation)
    const activeMicroZones = microZones.filter(mz => 
      mz.rotationGroup === 0 || mz.rotationGroup === zoneState.currentRotation
    )
    
    // Parse visited micro-zones
    const visitedMicroZones = JSON.parse(zoneState.visitedMicroZones || '[]')
    const discoveredSecrets = JSON.parse(zoneState.discoveredSecrets || '[]')
    const foundChests = JSON.parse(zoneState.foundChests || '[]')
    
    // Enrich micro-zone data with player state
    const enrichedMicroZones = activeMicroZones.map(mz => ({
      id: mz.id,
      name: mz.name,
      slug: mz.slug,
      description: mz.description,
      type: mz.type,
      dangerLevel: mz.dangerLevel,
      rotationGroup: mz.rotationGroup,
      positionX: mz.positionX,
      positionY: mz.positionY,
      connections: JSON.parse(mz.connections || '[]'),
      enemyTypes: JSON.parse(mz.enemyTypes || '[]'),
      enemyCount: mz.enemyCount,
      isElite: mz.isElite,
      hasChest: mz.hasChest && !foundChests.includes(mz.id),
      chestRarity: mz.chestRarity,
      isHiddenChest: mz.isHiddenChest,
      chestUnlockHint: mz.chestUnlockHint,
      hasSecret: mz.hasSecret && !discoveredSecrets.includes(mz.id),
      secretType: mz.secretType,
      secretHint: mz.secretHint,
      secretAction: mz.secretAction,
      canSpawnBoss: mz.canSpawnBoss,
      bossName: mz.bossName,
      bossLevel: mz.bossLevel,
      bossSpawnChance: mz.bossSpawnChance,
      isMicroDungeon: mz.isMicroDungeon,
      microDungeonRooms: mz.microDungeonRooms,
      microDungeonDifficulty: mz.microDungeonDifficulty,
      baseDamageType: mz.baseDamageType,
      hasCorruption: mz.hasCorruption,
      corruptionType: mz.corruptionType,
      isVisited: visitedMicroZones.includes(mz.name)
    }))
    
    return NextResponse.json({
      zoneId,
      rotation: zoneState.currentRotation,
      visitCount: zoneState.visitCount,
      microZones: enrichedMicroZones,
      stats: {
        totalVisited: visitedMicroZones.length,
        secretsFound: discoveredSecrets.length,
        chestsOpened: foundChests.length
      }
    })
  } catch (error: any) {
    console.error('Explore zones API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
