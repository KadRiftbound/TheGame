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
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    const { cityId } = await request.json()

    if (!cityId) {
      return NextResponse.json({ error: 'ID de ville requis' }, { status: 400 })
    }

    // Verify city exists
    const city = await prisma.city.findUnique({
      where: { id: cityId }
    })

    if (!city) {
      return NextResponse.json({ error: 'Ville non trouvée' }, { status: 404 })
    }

    // Update character
    await prisma.character.update({
      where: { userId: session.userId },
      data: { currentCityId: cityId }
    })

    return NextResponse.json({
      success: true,
      message: `Vous êtes maintenant à ${city.name}`,
      city: {
        id: city.id,
        name: city.name,
        slug: city.slug
      }
    })
  } catch (error: any) {
    console.error('Change city error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
