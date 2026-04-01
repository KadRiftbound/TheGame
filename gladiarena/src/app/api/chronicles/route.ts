import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const RECORD_TYPES = {
  BOSS_KILL: 'BOSS_KILL',
  ZONE_DISCOVERY: 'ZONE_DISCOVERY',
  CHEST_OPEN: 'CHEST_OPEN',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20')

    const whereClause: any = {}
    if (type) {
      whereClause.type = type
    }

    const records = await prisma.serverRecord.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: limit,
    })

    const playerIds = [...new Set(records.map(r => r.playerId))]
    const zoneIds = [...new Set(records.map(r => r.zoneId).filter((id): id is string => id !== null))]
    const targetIds = [...new Set(records.map(r => r.targetId).filter((id): id is string => id !== null))]

    const [players, zones, targets] = await Promise.all([
      prisma.character.findMany({ where: { id: { in: playerIds } }, select: { id: true, name: true } }),
      prisma.zone.findMany({ where: { id: { in: zoneIds } }, select: { id: true, name: true } }),
      prisma.zoneEnemy.findMany({ where: { id: { in: targetIds } }, select: { id: true, name: true } })
    ])

    const playerMap = new Map(players.map(p => [p.id, p.name]))
    const zoneMap = new Map(zones.map(z => [z.id, z.name]))
    const targetMap = new Map(targets.map(t => [t.id, t.name]))

    const formattedRecords = records.map(r => ({
      id: r.id,
      type: r.type,
      playerName: playerMap.get(r.playerId) || 'Inconnu',
      targetName: r.targetId ? targetMap.get(r.targetId) || null : null,
      zoneName: r.zoneId ? zoneMap.get(r.zoneId) || null : null,
      timestamp: r.timestamp
    }))

    return NextResponse.json({ records: formattedRecords })

  } catch (error: any) {
    console.error('Chronicles API error:', error)
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
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    const { action, recordType, zoneId, targetId } = await request.json()
    const character = await prisma.character.findUnique({
      where: { userId: session.userId }
    })

    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    if (action === 'record') {
      const existingRecord = await prisma.serverRecord.findFirst({
        where: { 
          type: recordType,
          targetId: targetId,
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })

      if (existingRecord) {
        return NextResponse.json({ 
          success: true, 
          isFirst: false,
          message: 'Enregistré mais pas le premier' 
        })
      }

      const record = await prisma.serverRecord.create({
        data: {
          type: recordType,
          playerId: character.id,
          targetId: targetId,
          zoneId: zoneId,
          timestamp: new Date()
        }
      })

      return NextResponse.json({ 
        success: true, 
        isFirst: true,
        message: 'PREMIER! Votre nom sera inscrit dans les Chroniques!',
        record
      })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })

  } catch (error: any) {
    console.error('Chronicles API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
