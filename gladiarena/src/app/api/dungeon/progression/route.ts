import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const body = await request.json()
    const { dungeonId, action, choice, roomId } = body
    
    if (!token || !dungeonId) {
      return NextResponse.json({ error: 'Token and dungeonId required' }, { status: 400 })
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
    
    const dungeon = await prisma.dungeon.findUnique({
      where: { id: dungeonId },
      include: {
        rooms: { orderBy: { roomIndex: 'asc' } }
      }
    })
    
    if (!dungeon) {
      return NextResponse.json({ error: 'Donjon non trouvé' }, { status: 404 })
    }
    
    // Get or create dungeon state
    let dungeonState = await prisma.characterDungeonState.findUnique({
      where: {
        characterId_dungeonId: {
          characterId: character.id,
          dungeonId
        }
      }
    })
    
    // Handle entering a new dungeon
    if (action === 'enter') {
      if (dungeonState && !dungeonState.isAbandoned && !dungeonState.isComplete) {
        // Resume existing session
        return NextResponse.json({
          message: 'Reprise du donjon',
          state: {
            currentRoomIndex: dungeonState.currentRoomIndex,
            visitedRooms: JSON.parse(dungeonState.visitedRooms || '[]')
          }
        })
      }
      
      // Create new dungeon state
      dungeonState = await prisma.characterDungeonState.create({
        data: {
          characterId: character.id,
          dungeonId,
          currentRoomIndex: 0,
          visitedRooms: JSON.stringify([])
        }
      })
      
      const firstRoom = dungeon.rooms.find(r => r.roomIndex === 0)
      
      return NextResponse.json({
        message: 'Entrée dans le donjon',
        entered: true,
        room: firstRoom ? {
          id: firstRoom.id,
          name: firstRoom.name,
          description: firstRoom.description,
          type: firstRoom.type,
          enemies: JSON.parse(firstRoom.enemies || '[]'),
          enemyCount: firstRoom.enemyCount,
          hasChest: firstRoom.hasChest,
          hasElite: firstRoom.hasElite
        } : null
      })
    }
    
    if (!dungeonState) {
      return NextResponse.json({ error: 'Pas dans un donjon. Utilisez action=enter d\'abord.' }, { status: 400 })
    }
    
    if (dungeonState.isComplete || dungeonState.isAbandoned) {
      return NextResponse.json({ error: 'Session de donjon terminée. Entrez à nouveau.' }, { status: 400 })
    }
    
    // Handle progression
    if (action === 'progress') {
      const visitedRooms = JSON.parse(dungeonState.visitedRooms || '[]')
      const roomHistory = JSON.parse(dungeonState.roomHistory || '[]')
      
      // Determine next room based on choice
      let nextRoomIndex = dungeonState.currentRoomIndex + 1
      let chosenRoomId = roomId
      
      if (choice === 'A' || choice === 'B') {
        const currentRoom = dungeon.rooms.find(r => r.roomIndex === dungeonState.currentRoomIndex)
        if (currentRoom) {
          chosenRoomId = choice === 'A' ? currentRoom.roomAId : currentRoom.roomBId
          roomHistory.push({
            roomId: currentRoom.id,
            choice,
            result: 'progress'
          })
        }
      }
      
      // Check for detour (hidden path)
      if (choice === 'detour' || choice === 'secret') {
        const currentRoom = dungeon.rooms.find(r => r.roomIndex === dungeonState.currentRoomIndex)
        // In a full implementation, this would find a secret room connected to current room
        // For now, we just add a bonus
        if (currentRoom?.choiceText?.includes('détour') || currentRoom?.choiceText?.includes('secret')) {
          const bonusGold = 25 + Math.floor(Math.random() * 25)
          const bonusXp = 50 + Math.floor(Math.random() * 50)
          
          await prisma.characterDungeonState.update({
            where: { id: dungeonState.id },
            data: {
              goldEarned: dungeonState.goldEarned + bonusGold,
              xpEarned: dungeonState.xpEarned + bonusXp
            }
          })
          
          return NextResponse.json({
            detour: true,
            bonus: { gold: bonusGold, xp: bonusXp },
            message: 'Vous avez trouvé un chemin secret!'
          })
        }
      }
      
      // Find the next room
      let nextRoom: any = null
      
      if (chosenRoomId) {
        nextRoom = dungeon.rooms.find(r => r.id === chosenRoomId)
        nextRoomIndex = nextRoom?.roomIndex ?? nextRoomIndex
      } else {
        nextRoom = dungeon.rooms.find(r => r.roomIndex === nextRoomIndex)
      }
      
      if (!nextRoom) {
        // Dungeon completed or dead end
        await prisma.characterDungeonState.update({
          where: { id: dungeonState.id },
          data: {
            isComplete: true,
            completedAt: new Date()
          }
        })
        
        return NextResponse.json({
          message: 'Donjon terminé!',
          complete: true,
          rewards: {
            gold: dungeonState.goldEarned,
            xp: dungeonState.xpEarned
          }
        })
      }
      
      // Update state
      if (!visitedRooms.includes(nextRoom.id)) {
        visitedRooms.push(nextRoom.id)
      }
      
      await prisma.characterDungeonState.update({
        where: { id: dungeonState.id },
        data: {
          currentRoomIndex: nextRoomIndex,
          visitedRooms: JSON.stringify(visitedRooms),
          roomHistory: JSON.stringify(roomHistory)
        }
      })
      
      // Check for alternate exit
      const hasAlternateExit = nextRoom.type === 'choice' && nextRoom.isExit
      
      return NextResponse.json({
        room: {
          id: nextRoom.id,
          name: nextRoom.name,
          description: nextRoom.description,
          type: nextRoom.type,
          enemies: JSON.parse(nextRoom.enemies || '[]'),
          enemyCount: nextRoom.enemyCount,
          hasElite: nextRoom.hasElite,
          hasChest: nextRoom.hasChest,
          chestRarity: nextRoom.chestRarity,
          minGold: nextRoom.minGold,
          maxGold: nextRoom.maxGold,
          isRestPoint: nextRoom.isRestPoint,
          healAmount: nextRoom.healAmount,
          isBoss: nextRoom.isBoss,
          isExit: nextRoom.isExit,
          exitText: nextRoom.exitText,
          choiceText: nextRoom.choiceText,
          choiceA: nextRoom.choiceA,
          choiceB: nextRoom.choiceB
        },
        bossInfo: nextRoom.isBoss ? {
          name: nextRoom.bossName,
          hp: nextRoom.bossHp,
          attack: nextRoom.bossAttack,
          defense: nextRoom.bossDefense,
          damage: nextRoom.bossDamage,
          loot: JSON.parse(nextRoom.bossLoot || '{}')
        } : null,
        exploration: {
          visitedCount: visitedRooms.length,
          totalRooms: dungeon.rooms.length,
          hasAlternateExit
        }
      })
    }
    
    // Handle leaving/abandoning
    if (action === 'leave' || action === 'abandon') {
      await prisma.characterDungeonState.update({
        where: { id: dungeonState.id },
        data: {
          isAbandoned: true,
          completedAt: new Date()
        }
      })
      
      return NextResponse.json({
        message: 'Vous quittez le donjon',
        rewards: {
          gold: dungeonState.goldEarned,
          xp: dungeonState.xpEarned
        }
      })
    }
    
    // Handle rest at rest point
    if (action === 'rest') {
      const currentRoom = dungeon.rooms.find(r => r.roomIndex === dungeonState.currentRoomIndex)
      
      if (!currentRoom?.isRestPoint) {
        return NextResponse.json({ error: 'Pas de point de repos ici' }, { status: 400 })
      }
      
      const healAmount = currentRoom.healAmount || 20
      const newHp = Math.min(character.currentHp + healAmount, character.maxHp)
      
      await prisma.character.update({
        where: { id: character.id },
        data: { currentHp: newHp }
      })
      
      return NextResponse.json({
        rested: true,
        healAmount,
        newHp,
        maxHp: character.maxHp
      })
    }
    
    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error: any) {
    console.error('Dungeon progression API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
