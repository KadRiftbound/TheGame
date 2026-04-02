import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: microZoneId } = await params
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 })
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
    
    // Get the micro-zone
    const microZone = await prisma.microZone.findUnique({
      where: { id: microZoneId },
      include: { zone: true }
    })
    
    if (!microZone) {
      return NextResponse.json({ error: 'Micro-zone non trouvée' }, { status: 404 })
    }
    
    // Get zone state for this character
    let zoneState = await prisma.characterZoneState.findUnique({
      where: {
        characterId_zoneId: {
          characterId: character.id,
          zoneId: microZone.zoneId
        }
      }
    })
    
    if (!zoneState) {
      const rotationGroup = (Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % 5) + 1
      zoneState = await prisma.characterZoneState.create({
        data: {
          characterId: character.id,
          zoneId: microZone.zoneId,
          currentRotation: rotationGroup
        }
      })
    }
    
    // Parse state
    const visitedMicroZones = JSON.parse(zoneState.visitedMicroZones || '[]')
    const foundChests = JSON.parse(zoneState.foundChests || '[]')
    const discoveredSecrets = JSON.parse(zoneState.discoveredSecrets || '[]')
    const killedEnemies = JSON.parse(zoneState.killedEnemies || '[]')
    
    // Get connected micro-zones
    const connections = JSON.parse(microZone.connections || '[]')
    const connectedMicroZones = await prisma.microZone.findMany({
      where: { id: { in: connections } },
      select: {
        id: true,
        name: true,
        dangerLevel: true,
        positionX: true,
        positionY: true
      }
    })
    
    // Calculate travel times for connections
    const travelTimes = connectedMicroZones.map(cmz => {
      const distance = Math.sqrt(
        Math.pow((cmz.positionX || 0.5) - (microZone.positionX || 0.5), 2) +
        Math.pow((cmz.positionY || 0.5) - (microZone.positionY || 0.5), 2)
      )
      return {
        ...cmz,
        travelTime: Math.max(3000, Math.min(15000, Math.round(distance * 15000)))
      }
    })
    
    // Build enemies list based on killed enemies
    const enemyTypes = JSON.parse(microZone.enemyTypes || '[]')
    const enemies = []
    
    // Check if we have killed enemies for this micro-zone
    const mzKilledEnemies = killedEnemies.filter((e: any) => e.microZoneId === microZoneId)
    
    if (mzKilledEnemies.length < (microZone.enemyCount || 1)) {
      // Add enemies based on enemyTypes
      for (let i = 0; i < (microZone.enemyCount || 1) - mzKilledEnemies.length; i++) {
        const enemyType = enemyTypes[i % enemyTypes.length] || 'monstre'
        const isElite = i === 0 && microZone.isElite
        
        enemies.push({
          id: `${microZoneId}_enemy_${i}`,
          name: enemyType,
          type: enemyType,
          level: character.level + Math.floor(Math.random() * 2),
          hp: (30 + (microZone.dangerLevel * 10)) * (isElite ? 1.5 : 1),
          attack: (5 + microZone.dangerLevel) * (isElite ? 1.3 : 1),
          defense: (2 + Math.floor(microZone.dangerLevel / 2)) * (isElite ? 1.2 : 1),
          isElite,
          xpReward: (10 + microZone.dangerLevel * 5) * (isElite ? 2 : 1),
          goldReward: (5 + microZone.dangerLevel * 3) * (isElite ? 2 : 1)
        })
      }
    }
    
    // Build chests
    const chests = []
    if (microZone.hasChest && !foundChests.includes(microZoneId)) {
      chests.push({
        id: microZoneId,
        rarity: microZone.chestRarity,
        isHidden: microZone.isHiddenChest,
        isOpened: false,
        goldReward: microZone.dangerLevel * 20 + Math.floor(Math.random() * 30),
        difficulty: microZone.dangerLevel
      })
    }
    
    // Check for secrets
    const hasSecret = microZone.hasSecret && !discoveredSecrets.includes(microZoneId)
    
    // Build response
    return NextResponse.json({
      microZone: {
        id: microZone.id,
        name: microZone.name,
        description: microZone.description,
        type: microZone.type,
        dangerLevel: microZone.dangerLevel,
        positionX: microZone.positionX,
        positionY: microZone.positionY,
        connections: connections,
        baseDamageType: microZone.baseDamageType,
        hasCorruption: microZone.hasCorruption,
        corruptionType: microZone.corruptionType
      },
      zone: {
        id: microZone.zone.id,
        name: microZone.zone.name
      },
      enemies,
      chests,
      hasSecret: hasSecret ? {
        type: microZone.secretType,
        hint: microZone.secretHint,
        action: microZone.secretAction
      } : null,
      connectedMicroZones: travelTimes,
      isCurrentPosition: character.currentMicroZoneId === microZoneId,
      visited: visitedMicroZones.includes(microZone.name)
    })
  } catch (error: any) {
    console.error('Microzone API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}