import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const activeBounties = await prisma.bounty.findMany({
      where: {
        expiresAt: { gt: new Date() },
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const playerIds = [...new Set(activeBounties.map(b => b.targetId).concat(activeBounties.map(b => b.placerId)))]
    const players = await prisma.character.findMany({
      where: { id: { in: playerIds } },
      select: { id: true, name: true }
    })
    const playerMap = new Map(players.map(p => [p.id, p.name]))

    const formatted = activeBounties.map(b => ({
      id: b.id,
      targetName: playerMap.get(b.targetId) || 'Inconnu',
      placerName: playerMap.get(b.placerId) || 'Anonyme',
      amount: b.amount,
      expiresAt: b.expiresAt
    }))

    return NextResponse.json({ bounties: formatted })

  } catch (error: any) {
    console.error('Bounties API error:', error)
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

    const placer = await prisma.character.findUnique({
      where: { userId: session.userId }
    })

    if (!placer) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    const { action, targetName, amount } = await request.json()

    if (action === 'place_bounty') {
      if (!targetName || !amount || amount < 100) {
        return NextResponse.json({ error: 'Montant minimum: 100 or' }, { status: 400 })
      }

      if (placer.gold < amount) {
        return NextResponse.json({ error: 'Or insuffisant' }, { status: 400 })
      }

      const target = await prisma.character.findFirst({
        where: { name: targetName }
      })

      if (!target) {
        return NextResponse.json({ error: 'Joueur introuvable' }, { status: 404 })
      }

      if (target.id === placer.id) {
        return NextResponse.json({ error: 'Impossible de se mettre une prime sur soi-même' }, { status: 400 })
      }

      await prisma.character.update({
        where: { id: placer.id },
        data: { gold: placer.gold - amount }
      })

      const bounty = await prisma.bounty.create({
        data: {
          targetId: target.id,
          placerId: placer.id,
          amount,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      })

      return NextResponse.json({ success: true, message: `Prime de ${amount} or mise sur ${target.name}`, bounty })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })

  } catch (error: any) {
    console.error('Bounties API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
