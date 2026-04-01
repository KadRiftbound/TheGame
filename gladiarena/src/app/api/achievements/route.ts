import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'Premier Sang', description: 'Vaincre ton premier ennemi', icon: '⚔️', reward: 50, type: 'victories', target: 1 },
  { id: 'warrior_10', name: 'Guerrier', description: 'Vaincre 10 ennemis', icon: '🗡️', reward: 100, type: 'victories', target: 10 },
  { id: 'warrior_50', name: 'Veteran', description: 'Vaincre 50 ennemis', icon: '⚔️', reward: 250, type: 'victories', target: 50 },
  { id: 'warrior_100', name: 'Champion', description: 'Vaincre 100 ennemis', icon: '🏆', reward: 500, type: 'victories', target: 100 },
  { id: 'level_5', name: 'Aventurier', description: 'Atteindre le niveau 5', icon: '⭐', reward: 100, type: 'level', target: 5 },
  { id: 'level_10', name: 'Combattant', description: 'Atteindre le niveau 10', icon: '⭐', reward: 200, type: 'level', target: 10 },
  { id: 'level_20', name: 'Heros', description: 'Atteindre le niveau 20', icon: '🌟', reward: 500, type: 'level', target: 20 },
  { id: 'rich_1000', name: 'Petite Fortune', description: 'Accumuler 1000 or', icon: '💰', reward: 50, type: 'gold', target: 1000 },
  { id: 'rich_5000', name: 'Marchand', description: 'Accumuler 5000 or', icon: '💰', reward: 150, type: 'gold', target: 5000 },
  { id: 'rich_10000', name: 'Riche', description: 'Accumuler 10000 or', icon: '👑', reward: 300, type: 'gold', target: 10000 },
  { id: 'first_rare', name: 'Chanceux', description: 'Obtenir un item Rare', icon: '💎', reward: 100, type: 'rarity', target: 1, rarity: 'rare' },
  { id: 'first_epic', name: 'Elite', description: 'Obtenir un item Epique', icon: '💜', reward: 250, type: 'rarity', target: 1, rarity: 'epic' },
  { id: 'first_legendary', name: 'Legendaire', description: 'Obtenir un item Legendaire', icon: '🔥', reward: 500, type: 'rarity', target: 1, rarity: 'legendary' },
  { id: 'equipped_all', name: 'Equipe', description: 'Equiper tous les slots', icon: '🛡️', reward: 150, type: 'equipped', target: 6 },
  { id: 'crafter', name: 'Artisan', description: 'Fabriquer 5 items', icon: '🔨', reward: 100, type: 'crafted', target: 5 },
]

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
      include: { inventory: { include: { item: { include: { rarity: true } } } } }
    })

    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    const equippedSlots = [
      character.equippedWeapon,
      character.equippedShield,
      character.equippedHelmet,
      character.equippedArmor,
      character.equippedLegs,
      character.equippedAccessory
    ].filter(Boolean).length

    const rarityItems = character.inventory.filter(i => i.item?.rarity?.id)
    const rareItems = rarityItems.filter(i => i.item.rarity.id === 'rare').length
    const epicItems = rarityItems.filter(i => i.item.rarity.id === 'epic').length
    const legendaryItems = rarityItems.filter(i => i.item.rarity.id === 'legendary').length
    const craftedItems = character.inventory.filter(i => i.item?.source === 'craft').length

    const getProgress = (achievement: typeof ACHIEVEMENTS[0]) => {
      switch (achievement.type) {
        case 'victories': return character.victories
        case 'level': return character.level
        case 'gold': return character.gold
        case 'equipped': return equippedSlots
        case 'crafted': return character.craftCount
        case 'rarity':
          if (achievement.rarity === 'rare') return rareItems
          if (achievement.rarity === 'epic') return epicItems
          if (achievement.rarity === 'legendary') return legendaryItems
          return 0
        default: return 0
      }
    }

    const achievements = ACHIEVEMENTS.map(achievement => {
      const currentProgress = getProgress(achievement)
      const earned = currentProgress >= achievement.target
      return { 
        ...achievement, 
        earned, 
        currentProgress,
        progress: Math.min(100, (currentProgress / achievement.target) * 100)
      }
    })

    return NextResponse.json({ 
      achievements,
      stats: {
        victories: character.victories,
        level: character.level,
        gold: character.gold,
        craftedItems: character.craftCount,
        equippedSlots
      }
    })
  } catch (error) {
    console.error('Achievements error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des achievements' },
      { status: 500 }
    )
  }
}
