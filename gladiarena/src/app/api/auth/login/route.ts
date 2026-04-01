import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Ensure character exists
    let character = await prisma.character.findUnique({
      where: { userId: user.id }
    })

    if (!character) {
      const defaultClass = await prisma.characterClass.findFirst({
        where: { tier: 'base' }
      })
      const defaultOrigin = await prisma.origin.findFirst()

      character = await prisma.character.create({
        data: {
          userId: user.id,
          name: user.username,
          classId: defaultClass?.id || 'guerrier',
          originId: defaultOrigin?.id || 'origin_orphelin',
        }
      })
    }

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}
