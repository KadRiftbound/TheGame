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
      where: { userId: session.userId },
      include: { guildMember: { include: { guild: true } } }
    })

    const guilds = await prisma.guild.findMany({
      orderBy: { level: 'desc' },
      take: 20,
      include: {
        members: {
          include: {
            character: {
              select: { name: true, level: true }
            }
          },
          orderBy: { role: 'asc' }
        }
      }
    })

    return NextResponse.json({ 
      guilds,
      playerGuild: character?.guildMember?.guild || null,
      playerRole: character?.guildMember?.role || null
    })
  } catch (error) {
    console.error('Guilds error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des guildes' },
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

    const { guildName } = await request.json()

    if (!guildName || guildName.length < 3 || guildName.length > 30) {
      return NextResponse.json({ error: 'Nom de guilde invalide (3-30 caractères)' }, { status: 400 })
    }

    if (character.gold < 1000) {
      return NextResponse.json({ error: 'Il faut 1000 or pour créer une guilde' }, { status: 400 })
    }

    const existingGuild = await prisma.guild.findUnique({
      where: { name: guildName }
    })

    if (existingGuild) {
      return NextResponse.json({ error: 'Ce nom de guilde est déjà pris' }, { status: 400 })
    }

    const guild = await prisma.guild.create({
      data: {
        name: guildName,
        leaderId: character.id,
        gold: 0
      }
    })

    await prisma.guildMember.create({
      data: {
        guildId: guild.id,
        characterId: character.id,
        role: 'leader'
      }
    })

    await prisma.character.update({
      where: { id: character.id },
      data: { gold: character.gold - 1000 }
    })

    return NextResponse.json({ guild, success: true })
  } catch (error) {
    console.error('Create guild error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la guilde' },
      { status: 500 }
    )
  }
}
