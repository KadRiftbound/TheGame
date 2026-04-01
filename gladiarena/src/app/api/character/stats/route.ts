import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
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
      where: { userId: session.userId },
      include: { stats: true }
    })

    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    if (!character.stats) {
      return NextResponse.json({ error: 'Stats non trouvées' }, { status: 404 })
    }

    if (character.unspentPoints <= 0) {
      return NextResponse.json({ error: 'Pas de points disponibles' }, { status: 400 })
    }

    const { stat, action } = await request.json()

    if (!['force', 'agility', 'vitality', 'luck'].includes(stat)) {
      return NextResponse.json({ error: 'Stat invalide' }, { status: 400 })
    }

    if (action === 'add') {
      const updatedStats = await prisma.characterStats.update({
        where: { characterId: character.id },
        data: {
          [stat]: { increment: 1 }
        }
      })

      await prisma.character.update({
        where: { id: character.id },
        data: {
          unspentPoints: { decrement: 1 },
          maxHp: character.stats.vitality + (stat === 'vitality' ? 10 : 0) + 100
        }
      })

      const updatedCharacter = await prisma.character.findUnique({
        where: { id: character.id },
        include: { stats: true, class: true }
      })

      return NextResponse.json({ character: updatedCharacter })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (error) {
    console.error('Stats update error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
