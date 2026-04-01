import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const session = await prisma.session.findUnique({
      where: { token }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    const character = await prisma.character.findUnique({
      where: { userId: session.userId }
    })

    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    const quests = await prisma.quest.findMany({
      where: { isActive: true },
      orderBy: { type: 'asc' }
    })

    const questProgress = await prisma.questProgress.findMany({
      where: { characterId: character.id }
    })

    const progressMap = new Map(questProgress.map(p => [p.questId, p]))

    const questsWithProgress = quests.map(quest => {
      const progress = progressMap.get(quest.id)
      const conditions = JSON.parse(quest.conditions || '{}')
      const rewards = JSON.parse(quest.rewards || '{}')
      
      return {
        ...quest,
        conditions,
        rewards,
        progress: progress ? {
          currentProgress: progress.currentProgress,
          target: progress.target,
          completed: progress.completed,
          claimed: progress.claimed
        } : null
      }
    })

    return NextResponse.json({ quests: questsWithProgress })
  } catch (error) {
    console.error('Quests error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des quêtes' },
      { status: 500 }
    )
  }
}
