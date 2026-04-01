import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const TITLE_DEFINITIONS = [
  { id: 'novice', name: 'Novice', condition: (c: any) => c.level >= 1, icon: '🌱' },
  { id: 'combatant', name: 'Combattant', condition: (c: any) => c.victories >= 5, icon: '⚔️' },
  { id: 'veteran', name: 'Vétéran', condition: (c: any) => c.victories >= 25, icon: '🛡️' },
  { id: 'habitant', name: 'Habitué', condition: (c: any) => c.victories >= 50, icon: '🎖️' },
  { id: 'gladiateur', name: 'Gladiateur', condition: (c: any) => c.victories >= 100, icon: '🏆' },
  { id: 'champion', name: 'Champion', condition: (c: any) => c.victories >= 250, icon: '👑' },
  { id: 'legende', name: 'Légende', condition: (c: any) => c.victories >= 500, icon: '⭐' },
  { id: 'level_10', name: 'Niv 10', condition: (c: any) => c.level >= 10, icon: '🔟' },
  { id: 'level_20', name: 'Niv 20', condition: (c: any) => c.level >= 20, icon: '2️⃣0️⃣' },
  { id: 'level_30', name: 'Niv 30', condition: (c: any) => c.level >= 30, icon: '3️⃣0️⃣' },
  { id: 'level_40', name: 'Niv 40', condition: (c: any) => c.level >= 40, icon: '4️⃣0️⃣' },
  { id: 'explorateur', name: 'Explorateur', condition: (c: any) => c.explorationsNoCombat >= 10, icon: '🗺️' },
  { id: 'chasseur', name: 'Chasseur', condition: (c: any) => c.bossKilled >= 1, icon: '💀' },
  { id: 'tueur', name: 'Tueur de Dragons', condition: (c: any) => c.bossKilled >= 5, icon: '🐉' },
  { id: 'riche', name: 'Richel', condition: (c: any) => c.gold >= 1000, icon: '💰' },
  { id: 'm millionaire', name: 'Millionnaire', condition: (c: any) => c.gold >= 10000, icon: '🪙' },
  { id: 'voleur', name: 'Voleur', condition: (c: any) => c.successfulSteals >= 10, icon: '🗝️' },
  { id: 'fuyard', name: 'Fuyard', condition: (c: any) => c.fledCombat >= 10, icon: '🏃' },
  { id: 'survivant', name: 'Survivant', condition: (c: any) => c.deathsInSecretZone >= 3, icon: '💀' },
  { id: 'collectionneur', name: 'Collectionneur', condition: (c: any) => c.secretChestsFound >= 5, icon: '📦' },
]

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

    const character = await prisma.character.findUnique({
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

    const titlesArray: string[] = JSON.parse(character.titles || '[]')
    
    const availableTitles = TITLE_DEFINITIONS.filter(t => t.condition(character))
    const newTitles = availableTitles.filter(t => !titlesArray.includes(t.id))
    
    if (newTitles.length > 0) {
      const updatedTitles = [...titlesArray, ...newTitles.map(t => t.id)]
      await prisma.character.update({
        where: { id: character.id },
        data: { titles: JSON.stringify(updatedTitles) }
      })
      titlesArray.push(...newTitles.map(t => t.id))
    }

    const titlesWithDetails = TITLE_DEFINITIONS
      .filter(t => titlesArray.includes(t.id))
      .map(t => ({ id: t.id, name: t.name, icon: t.icon }))

    return NextResponse.json({ 
      titles: titlesWithDetails,
      allTitles: TITLE_DEFINITIONS.map(t => ({ 
        id: t.id, 
        name: t.name, 
        icon: t.icon,
        earned: titlesArray.includes(t.id)
      }))
    })

  } catch (error: any) {
    console.error('Titles error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
