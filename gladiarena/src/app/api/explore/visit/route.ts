import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const body = await request.json()
    const { microZoneId, action } = body
    
    if (!token || !microZoneId) {
      return NextResponse.json({ error: 'Token and microZoneId required' }, { status: 400 })
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
      where: { id: microZoneId }
    })
    
    if (!microZone) {
      return NextResponse.json({ error: 'Micro-zone non trouvée' }, { status: 404 })
    }
    
    // Get or create zone state
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
    
    const visitedMicroZones = JSON.parse(zoneState.visitedMicroZones || '[]')
    const discoveredSecrets = JSON.parse(zoneState.discoveredSecrets || '[]')
    const foundChests = JSON.parse(zoneState.foundChests || '[]')
    
    // Mark as visited
    if (!visitedMicroZones.includes(microZone.name)) {
      visitedMicroZones.push(microZone.name)
    }
    
    let result: any = {
      microZone: {
        id: microZone.id,
        name: microZone.name,
        description: microZone.description,
        type: microZone.type,
        dangerLevel: microZone.dangerLevel,
        enemyTypes: JSON.parse(microZone.enemyTypes || '[]')
      },
      visited: true
    }
    
    // Handle actions
    if (action === 'explore') {
      const encounterChance = Math.random()
      
      // Check for boss spawn first (if micro-zone can spawn boss)
      if (microZone.canSpawnBoss && Math.random() < (microZone.bossSpawnChance || 0.05)) {
        result.encounter = {
          type: 'boss',
          boss: {
            name: microZone.bossName,
            level: microZone.bossLevel,
            hp: microZone.bossHp,
            attack: microZone.bossAttack,
            defense: microZone.bossDefense,
            damage: microZone.bossDamage,
            loot: microZone.bossLoot ? JSON.parse(microZone.bossLoot) : null
          }
        }
      } else if (encounterChance < 0.4) {
        // Combat encounter (40% chance)
        const enemyTypes = JSON.parse(microZone.enemyTypes || '[]')
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)]
        const zoneDifficulty = microZone.dangerLevel * 2
        const isElite = microZone.isElite || Math.random() < 0.1
        
        result.encounter = {
          type: 'combat',
          enemy: {
            name: enemyType,
            level: character.level + Math.floor(Math.random() * 3) + (isElite ? 2 : 0),
            hp: (30 + (zoneDifficulty * 10)) * (isElite ? 1.5 : 1),
            attack: (5 + zoneDifficulty) * (isElite ? 1.3 : 1),
            defense: (2 + Math.floor(zoneDifficulty / 2)) * (isElite ? 1.2 : 1),
            isElite
          }
        }
      } else if (encounterChance < 0.5 && microZone.hasSecret) {
        // Secret discovered
        if (!discoveredSecrets.includes(microZone.id)) {
          discoveredSecrets.push(microZone.id)
          result.encounter = {
            type: 'secret',
            secretFound: true,
            secretType: microZone.secretType,
            hint: microZone.secretHint,
            action: microZone.secretAction
          }
        }
      } else if (encounterChance < 0.55 && microZone.hasChest && !foundChests.includes(microZone.id)) {
        // Chest found
        result.encounter = {
          type: 'chest',
          chestFound: true,
          rarity: microZone.chestRarity,
          isHidden: microZone.isHiddenChest,
          hint: microZone.chestUnlockHint
        }
      } else if (microZone.isMicroDungeon && !zoneState.discoveredSecrets.includes('microdungeon:' + microZone.id)) {
        // Micro-dungeon discovered
        result.encounter = {
          type: 'microDungeon',
          microDungeon: {
            name: microZone.name,
            rooms: microZone.microDungeonRooms,
            difficulty: microZone.microDungeonDifficulty,
            entry: microZone.microDungeonEntry
          }
        }
      }
    }
    
    if (action === 'openChest' && microZone.hasChest) {
      const isAlreadyOpened = foundChests.includes(microZone.id)
      
      if (!isAlreadyOpened) {
        // Check for hidden chest - may need secret action
        if (microZone.isHiddenChest && action !== 'openChest') {
          result.chest = { 
            opened: false, 
            locked: true,
            hint: microZone.chestUnlockHint,
            message: 'Ce coffre est caché - trouvez comment l\'ouvrir'
          }
        } else {
          foundChests.push(microZone.id)
          
          const chestRarity = microZone.chestRarity
          const baseGold = microZone.dangerLevel * 20 + Math.floor(Math.random() * 30)
          const goldReward = baseGold * (chestRarity === 'epic' ? 2 : chestRarity === 'legendary' ? 3 : 1)
          
          result.chest = {
            opened: true,
            goldReward,
            rarity: chestRarity,
            items: []
          }
          
          // Update character gold
          await prisma.character.update({
            where: { id: character.id },
            data: { gold: character.gold + goldReward }
          })
        }
      } else {
        result.chest = { opened: false, message: 'Coffre déjà ouvert' }
      }
    }
    
    if (action === 'discoverSecret' && microZone.hasSecret) {
      if (!discoveredSecrets.includes(microZone.id)) {
        discoveredSecrets.push(microZone.id)
        
        result.secret = {
          discovered: true,
          hint: microZone.secretHint,
          bonus: {
            secretFind: 10
          }
        }
      }
    }
    
    // Update zone state
    await prisma.characterZoneState.update({
      where: { id: zoneState.id },
      data: {
        visitedMicroZones: JSON.stringify(visitedMicroZones),
        discoveredSecrets: JSON.stringify(discoveredSecrets),
        foundChests: JSON.stringify(foundChests),
        visitCount: zoneState.visitCount + 1,
        lastVisitAt: new Date()
      }
    })
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Explore visit API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
