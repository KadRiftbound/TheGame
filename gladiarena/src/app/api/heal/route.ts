import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const session = await prisma.session.findUnique({
      where: { token },
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

    const { action } = await request.json()

    // HEAL - Full heal in city (free)
    if (action === 'heal') {
      const updated = await prisma.character.update({
        where: { id: character.id },
        data: {
          currentHp: character.maxHp,
          fatigue: 0
        }
      })
      return NextResponse.json({ 
        success: true, 
        message: 'Vous êtes maintenant en pleine santé!',
        currentHp: updated.currentHp,
        maxHp: updated.maxHp
      })
    }

    // HEAL_WOUNDS - Remove wounds (costs gold)
    if (action === 'heal_wounds') {
      const wounds = JSON.parse(character.wounds || '[]')
      if (wounds.length === 0) {
        return NextResponse.json({ error: 'Aucune blessure à guérir' }, { status: 400 })
      }

      const cost = 50 * wounds.length
      if (character.gold < cost) {
        return NextResponse.json({ error: `Or insuffisant (il faut ${cost} or)` }, { status: 400 })
      }

      const updated = await prisma.character.update({
        where: { id: character.id },
        data: {
          gold: character.gold - cost,
          wounds: '[]'
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: `Blessures guéries pour ${cost} or!`,
        goldSpent: cost
      })
    }

    // PURIFY - Remove corruption
    if (action === 'purify') {
      const corruption = character.corruptionLevel || 0
      if (corruption <= 0) {
        return NextResponse.json({ error: 'Pas de corruption à purifier' }, { status: 400 })
      }

      const cost = Math.floor(corruption * 2) // 2 gold per corruption point
      if (character.gold < cost) {
        return NextResponse.json({ error: `Or insuffisant (il faut ${cost} or)` }, { status: 400 })
      }

      const updated = await prisma.character.update({
        where: { id: character.id },
        data: {
          gold: character.gold - cost,
          corruptionLevel: 0
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: `Corruption purifiée pour ${cost} or!`,
        goldSpent: cost
      })
    }

    // REST - Recover fatigue
    if (action === 'rest') {
      const fatigue = character.fatigue || 0
      if (fatigue <= 0) {
        return NextResponse.json({ error: 'Pas de fatigue à récupérer' }, { status: 400 })
      }

      const cost = Math.floor(fatigue / 10) // 1 gold per 10 fatigue
      const updated = await prisma.character.update({
        where: { id: character.id },
        data: {
          gold: Math.max(0, character.gold - cost),
          fatigue: 0
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: `Repos effectué pour ${cost} or!`,
        goldSpent: cost
      })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })

  } catch (error: any) {
    console.error('Heal API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
