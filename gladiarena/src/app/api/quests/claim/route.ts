import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
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

    const { questId } = await request.json()

    if (!questId) {
      return NextResponse.json({ error: 'ID de quête requis' }, { status: 400 })
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId }
    })

    if (!quest) {
      return NextResponse.json({ error: 'Quête non trouvée' }, { status: 404 })
    }

    const questProgress = await prisma.questProgress.findUnique({
      where: {
        characterId_questId: {
          characterId: character.id,
          questId
        }
      }
    })

    if (!questProgress || !questProgress.completed || questProgress.claimed) {
      return NextResponse.json({ error: 'Récompenses non disponibles' }, { status: 400 })
    }

    const rewards = JSON.parse(quest.rewards || '{}')

    await prisma.questProgress.update({
      where: { id: questProgress.id },
      data: { claimed: true }
    })

    const updatedCharacter = await prisma.character.update({
      where: { id: character.id },
      data: {
        gold: character.gold + (rewards.gold || 0),
        xp: character.xp + (rewards.xp || 0)
      }
    })

    return NextResponse.json({
      success: true,
      rewards,
      character: updatedCharacter
    })
  } catch (error) {
    console.error('Claim error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réclamation' },
      { status: 500 }
    )
  }
}
