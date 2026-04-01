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

    const inventory = await prisma.inventoryItem.findMany({
      where: { characterId: character.id },
      include: {
        item: {
          include: {
            baseItem: true,
            prefix: true,
            suffix: true,
            rarity: true
          }
        }
      },
      orderBy: { slot: 'asc' }
    })

    return NextResponse.json({ inventory })
  } catch (error) {
    console.error('Get inventory error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'inventaire' },
      { status: 500 }
    )
  }
}
