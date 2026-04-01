import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const searchParams = request.nextUrl.searchParams
    const dungeonId = searchParams.get('dungeonId')
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
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
    
    // Get all dungeons or a specific one
    let dungeons
    if (dungeonId) {
      const dungeon = await prisma.dungeon.findUnique({
        where: { id: dungeonId },
        include: {
          rooms: {
            orderBy: { roomIndex: 'asc' }
          },
          city: {
            select: { id: true, name: true }
          }
        }
      })
      
      if (!dungeon) {
        return NextResponse.json({ error: 'Donjon non trouvé' }, { status: 404 })
      }
      
      // Get dungeon state if exists
      const dungeonState = await prisma.characterDungeonState.findUnique({
        where: {
          characterId_dungeonId: {
            characterId: character.id,
            dungeonId
          }
        }
      })
      
      return NextResponse.json({
        dungeon: {
          id: dungeon.id,
          name: dungeon.name,
          description: dungeon.description,
          type: dungeon.type,
          level: dungeon.level,
          difficulty: dungeon.difficulty,
          roomCount: dungeon.roomCount,
          hasBoss: dungeon.hasBoss,
          bossName: dungeon.bossName,
          city: dungeon.city
        },
        rooms: dungeon.rooms.map(room => ({
          id: room.id,
          roomIndex: room.roomIndex,
          name: room.name,
          description: room.description,
          type: room.type,
          hasChest: room.hasChest,
          chestRarity: room.chestRarity,
          isRestPoint: room.isRestPoint,
          isBoss: room.isBoss,
          isExit: room.isExit,
          choiceText: room.choiceText,
          choiceA: room.choiceA,
          choiceB: room.choiceB
        })),
        state: dungeonState ? {
          currentRoomIndex: dungeonState.currentRoomIndex,
          visitedRooms: JSON.parse(dungeonState.visitedRooms || '[]'),
          isComplete: dungeonState.isComplete,
          isFailed: dungeonState.isFailed,
          isAbandoned: dungeonState.isAbandoned,
          goldEarned: dungeonState.goldEarned,
          xpEarned: dungeonState.xpEarned,
          bossDefeated: dungeonState.bossDefeated
        } : null
      })
    }
    
    // Get all dungeons for the character's current city
    if (!character.currentCityId) {
      return NextResponse.json({ error: 'Aucune ville définie' }, { status: 400 })
    }
    
    dungeons = await prisma.dungeon.findMany({
      where: { cityId: character.currentCityId },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        level: true,
        difficulty: true,
        roomCount: true,
        hasBoss: true,
        bossName: true
      },
      orderBy: { level: 'asc' }
    })
    
    return NextResponse.json({ dungeons })
  } catch (error: any) {
    console.error('Dungeon API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
