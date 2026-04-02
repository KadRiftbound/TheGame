import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  CharacterTitleSnapshot,
  parseUnlockedTitleIds,
  sortTitleIdsByDefinitionOrder,
  TITLE_DEFINITIONS,
} from '@/lib/titles'

export async function GET(request: NextRequest) {
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

    const character: CharacterTitleSnapshot | null = await prisma.character.findUnique({
      where: { userId: session.userId },
      select: {
        id: true,
        level: true,
        victories: true,
        defeats: true,
        gold: true,
        bossKilled: true,
        explorationsNoCombat: true,
        secretChestsFound: true,
        successfulSteals: true,
        fledCombat: true,
        deathsInSecretZone: true,
        titles: true
      }
    })

    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    const unlockedTitleIds = parseUnlockedTitleIds(character.titles || '[]')
    
    const availableTitles = TITLE_DEFINITIONS.filter(t => t.condition(character))
    const newTitles = availableTitles.filter(t => !unlockedTitleIds.includes(t.id))
    
    if (newTitles.length > 0) {
      const updatedTitles = sortTitleIdsByDefinitionOrder([...unlockedTitleIds, ...newTitles.map(t => t.id)])
      await prisma.character.update({
        where: { id: character.id },
        data: { titles: JSON.stringify(updatedTitles) }
      })
      unlockedTitleIds.splice(0, unlockedTitleIds.length, ...updatedTitles)
    }

    const titlesWithDetails = TITLE_DEFINITIONS
      .filter(t => unlockedTitleIds.includes(t.id))
      .map(t => ({ id: t.id, name: t.name, icon: t.icon }))

    return NextResponse.json({ 
      titles: titlesWithDetails,
      allTitles: TITLE_DEFINITIONS.map(t => ({ 
        id: t.id, 
        name: t.name, 
        icon: t.icon,
        earned: unlockedTitleIds.includes(t.id)
      })),
      summary: {
        unlockedCount: unlockedTitleIds.length,
        availableCount: TITLE_DEFINITIONS.length,
        newlyUnlockedCount: newTitles.length
      }
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Titles error:', error)
    return NextResponse.json(
      { error: `Erreur: ${message}` },
      { status: 500 }
    )
  }
}
