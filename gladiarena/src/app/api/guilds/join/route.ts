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
      where: { userId: session.userId },
      include: { guildMember: true }
    })

    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    if (character.guildMember) {
      return NextResponse.json({ error: 'Vous êtes déjà dans une guilde' }, { status: 400 })
    }

    const { guildId } = await request.json()

    if (!guildId) {
      return NextResponse.json({ error: 'ID de guilde requis' }, { status: 400 })
    }

    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
      include: { members: true }
    })

    if (!guild) {
      return NextResponse.json({ error: 'Guilde non trouvée' }, { status: 404 })
    }

    if (guild.members.length >= 50) {
      return NextResponse.json({ error: 'La guilde est pleine' }, { status: 400 })
    }

    await prisma.guildMember.create({
      data: {
        guildId,
        characterId: character.id,
        role: 'member'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Join guild error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de rejoindre la guilde' },
      { status: 500 }
    )
  }
}
