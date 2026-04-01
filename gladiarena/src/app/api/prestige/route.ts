import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PRESTIGE_ACHIEVEMENTS = [
  { id: 'boss_slayer', name: 'Tueur de Boss', description: 'Tuez 10 boss', requirement: 10, points: 100 },
  { id: 'secret_finder', name: 'Chercheur de Secrets', description: 'Découvrez 20 secrets', requirement: 20, points: 150 },
  { id: 'dungeon_master', name: 'Maître des Donjons', description: 'Complétez 5 donjons', requirement: 5, points: 100 },
  { id: 'treasure_hunter', name: 'Chasseur de Trésors', description: 'Ouvrez 30 coffres', requirement: 30, points: 75 },
  { id: 'explorer', name: 'Explorateur', description: 'Visitez 50 micro-zones', requirement: 50, points: 50 },
  { id: 'survivor', name: 'Survivant', description: 'Subirez 1000 damage', requirement: 1000, points: 25 },
  { id: 'corrupted', name: 'Corrompu', description: 'Atteignez 50 corruption', requirement: 50, points: 50 },
  { id: 'rich', name: 'Riche', description: 'Accumulez 10000 gold', requirement: 10000, points: 75 },
]

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 })
    }
    
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    })
    
    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }
    
    const character = await prisma.character.findUnique({
      where: { userId: session.userId },
      select: {
        id: true,
        name: true,
        bossKilled: true,
        secretChestsFound: true,
        bossSpared: true,
        hiddenZonesVisited: true,
        victories: true,
        defeats: true,
        gold: true,
        corruptionLevel: true,
        deathsInSecretZone: true,
        relicsCollected: true,
      }
    })
    
    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }
    
    const stats = {
      bossKills: character.bossKilled || 0,
      secretsFound: character.secretChestsFound || 0,
      hiddenZones: character.hiddenZonesVisited || 0,
      victories: character.victories || 0,
      defeats: character.defeats || 0,
      totalGold: character.gold || 0,
      maxCorruption: character.corruptionLevel || 0,
      relicsCollected: character.relicsCollected || 0,
    }
    
    let prestigePoints = 0
    const earnedAchievements: any[] = []
    const availableAchievements: any[] = []
    
    for (const achievement of PRESTIGE_ACHIEVEMENTS) {
      let currentValue = 0
      switch (achievement.id) {
        case 'boss_slayer': currentValue = stats.bossKills; break
        case 'secret_finder': currentValue = stats.secretsFound; break
        case 'dungeon_master': currentValue = stats.victories; break
        case 'treasure_hunter': currentValue = stats.secretsFound; break
        case 'explorer': currentValue = stats.hiddenZones; break
        case 'survivor': currentValue = (stats.defeats * 20); break
        case 'corrupted': currentValue = stats.maxCorruption; break
        case 'rich': currentValue = stats.totalGold; break
      }
      
      const progress = Math.min(100, Math.round((currentValue / achievement.requirement) * 100))
      
      if (currentValue >= achievement.requirement) {
        prestigePoints += achievement.points
        earnedAchievements.push({
          ...achievement,
          progress: 100,
          completed: true
        })
      } else {
        availableAchievements.push({
          ...achievement,
          currentValue,
          progress,
          completed: false
        })
      }
    }
    
    const tier = prestigePoints >= 500 ? 'Légende' 
               : prestigePoints >= 300 ? 'Héros'
               : prestigePoints >= 150 ? 'Champion'
               : prestigePoints >= 50 ? 'Aventurier'
               : 'Novice'
    
    return NextResponse.json({
      character: {
        name: character.name,
        level: 1,
      },
      stats,
      prestigePoints,
      tier,
      achievements: {
        earned: earnedAchievements,
        available: availableAchievements,
        totalPoints: prestigePoints,
        nextTierThreshold: getNextTierThreshold(tier)
      }
    })
  } catch (error: any) {
    console.error('Prestige API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}

function getNextTierThreshold(currentTier: string): number {
  const thresholds: Record<string, number> = {
    'Novice': 50,
    'Aventurier': 150,
    'Champion': 300,
    'Héros': 500,
    'Légende': 99999
  }
  return thresholds[currentTier] || 99999
}
