import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const FACTIONS = {
  BLADES: { id: 'les_lames', name: 'Les Lames', icon: '⚔️', desc: 'Guerriers et défenseurs', color: 'red' },
  SHADOWS: { id: 'les_ombres', name: 'Les Ombres', icon: '🗡️', desc: 'Voleurs et assassins', color: 'purple' },
  SANCTUARY: { id: 'le_sanctuaire', name: 'Le Sanctuaire', icon: '✨', desc: 'Mages et prêtres', color: 'blue' },
}

const RANKS = [
  { name: 'Inconnu', min: 0, max: 99 },
  { name: 'Connu', min: 100, max: 499 },
  { name: 'Honoré', min: 500, max: 1999 },
  { name: 'Légende', min: 2000, max: 999999 },
]

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    let characterId = null
    if (token) {
      const session = await prisma.session.findUnique({
        where: { token },
      })
      if (session && session.expiresAt > new Date()) {
        const char = await prisma.character.findUnique({
          where: { userId: session.userId },
          select: { id: true }
        })
        characterId = char?.id
      }
    }

    const allFactions: { id: string; name: string; icon: string; desc: string; color: string; characterReputation: number; rank: string }[] = Object.values(FACTIONS).map(f => ({
      ...f,
      characterReputation: 0,
      rank: 'Inconnu',
    }))

    if (characterId) {
      const reputations = await prisma.reputation.findMany({
        where: { characterId }
      })

      const repMap = new Map(reputations.map(r => [r.factionId, r]))

      for (const faction of allFactions) {
        const rep = repMap.get(faction.id)
        if (rep) {
          const rankInfo = RANKS.find(r => rep.value >= r.min && rep.value <= r.max)
          faction.characterReputation = rep.value
          faction.rank = rankInfo?.name || 'Inconnu'
        }
      }
    }

    return NextResponse.json({ factions: allFactions })

  } catch (error: any) {
    console.error('Factions API error:', error)
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

    const character = await prisma.character.findUnique({
      where: { userId: session.userId }
    })

    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    const { action, factionId, amount } = await request.json()

    if (action === 'add_reputation') {
      if (!factionId || !amount) {
        return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
      }

      const validFactions = Object.values(FACTIONS).map(f => f.id)
      if (!validFactions.includes(factionId)) {
        return NextResponse.json({ error: 'Faction invalide' }, { status: 400 })
      }

      const existing = await prisma.reputation.findUnique({
        where: {
          characterId_factionId: {
            characterId: character.id,
            factionId
          }
        }
      })

      if (existing) {
        await prisma.reputation.update({
          where: { id: existing.id },
          data: { value: existing.value + amount }
        })
      } else {
        await prisma.reputation.create({
          data: {
            characterId: character.id,
            factionId,
            value: amount,
            rank: 'Inconnu'
          }
        })
      }

      return NextResponse.json({ success: true, message: `Réputation +${amount}` })
    }

    if (action === 'get_discount') {
      if (!factionId) {
        return NextResponse.json({ error: 'Faction manquante' }, { status: 400 })
      }

      const rep = await prisma.reputation.findUnique({
        where: {
          characterId_factionId: {
            characterId: character.id,
            factionId
          }
        }
      })

      const rankInfo = RANKS.find(r => (rep?.value || 0) >= r.min && (rep?.value || 0) <= r.max)
      const discount = rankInfo ? (RANKS.indexOf(rankInfo) * 5) : 0

      return NextResponse.json({ discount, rank: rankInfo?.name || 'Inconnu' })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })

  } catch (error: any) {
    console.error('Factions API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
