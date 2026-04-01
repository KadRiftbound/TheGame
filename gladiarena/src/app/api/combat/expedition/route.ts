import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

// Import tracker functions
async function trackAction(characterId: string, action: string, zoneId?: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/classes/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterId,
        action: 'track',
        trackerType: action,
        zoneId
      })
    })
    return response.json()
  } catch (error) {
    console.error('Tracker error:', error)
    return null
  }
}

interface CombatStats {
  maxHp: number
  attack: number
  defense: number
  agility: number
  critChance: number
  dodgeChance: number
}

interface CombatAction {
  actor: string
  target: string
  actorName: string
  targetName: string
  type: 'attack' | 'crit' | 'dodge' | 'death' | 'victory'
  damage?: number
  description: string
}

function calculateCombatStats(character: any, equippedItems: any[] = []): CombatStats & { resistances: Record<string, number> } {
  // Use new base stats + investments
  const baseStr = (character.baseStrength || 10) + (character.strengthInvested || 0)
  const baseAgi = (character.baseAgility || 10) + (character.agilityInvested || 0)
  const baseVit = (character.baseVitality || 10) + (character.vitalityInvested || 0)
  const baseLuck = (character.baseLuck || 10) + (character.luckInvested || 0)
  
  const classBonus = JSON.parse(character.class.baseBonuses || '{}')
  
  // Calculate base resistances from equipment
  let resistances: Record<string, number> = {
    physical: 0,
    fire: 0,
    ice: 0,
    poison: 0,
    chaos: 0
  }
  
  for (const item of equippedItems) {
    const itemStats = JSON.parse(item.finalStats || '{}')
    if (itemStats.resistance) {
      for (const [resist, value] of Object.entries(itemStats.resistance)) {
        resistances[resist] = (resistances[resist] || 0) + (value as number)
      }
    }
  }
  
  const baseHp = 100 + (baseVit * 15)
  const baseAttack = baseStr * 3
  const baseDefense = baseVit * 2 + baseAgi
  
  return {
    maxHp: Math.floor(baseHp + (classBonus.hp || 0)),
    attack: Math.floor(baseAttack + (classBonus.attack || 0)),
    defense: Math.floor(baseDefense + (classBonus.defense || 0)),
    agility: baseAgi,
    critChance: (baseAgi * 0.5 + baseLuck) / 100,
    dodgeChance: baseAgi / 150,
    resistances
  }
}

function generateLoot(zoneId: string, characterLevel: number) {
  const rarities = ['common', 'common', 'common', 'uncommon', 'uncommon', 'rare']
  const rarity = rarities[Math.floor(Math.random() * rarities.length)]
  
  return { rarity }
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
      where: { userId: session.userId },
      include: { stats: true, class: true }
    })

    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    const { zoneId } = await request.json()

    if (!zoneId) {
      return NextResponse.json({ error: 'Zone requise' }, { status: 400 })
    }

    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: { enemies: true }
    })

    if (!zone) {
      return NextResponse.json({ error: 'Zone non trouvée' }, { status: 404 })
    }

    // NO LEVEL CHECK - All zones accessible, danger is real
    // Player can attempt any zone if they accept the risk

    const zoneDanger = {
      baseDamageType: zone.baseDamageType || 'physical',
      goldMultiplier: zone.goldMultiplier || 1.0,
      xpMultiplier: zone.xpMultiplier || 1.0,
      itemDropRate: zone.itemDropRate || 0.1,
      hasCorruption: zone.hasCorruption || false,
      difficulty: zone.difficulty || 'normal'
    }

    const difficultyBonus = {
      easy: 0.8,
      normal: 1.0,
      hard: 1.3,
      secret: 1.6
    }[zoneDanger.difficulty] || 1.0

    const totalWeight = zone.enemies.reduce((sum, e) => sum + e.spawnWeight, 0)
    let random = Math.random() * totalWeight
    let selectedEnemy = zone.enemies[0]
    
    const playerStats = calculateCombatStats(character)
    playerStats.maxHp = character.maxHp

    const enemyStats = {
      maxHp: selectedEnemy.hp,
      attack: selectedEnemy.attack + Math.floor(character.level * 0.5),
      defense: selectedEnemy.defense + Math.floor(character.level * 0.3),
      agility: 8 + selectedEnemy.level,
      critChance: 0.03,
      dodgeChance: 0.03
    }

    let playerHp = playerStats.maxHp
    let enemyHp = enemyStats.maxHp
    const replay: CombatAction[] = []

    let round = 1
    const maxRounds = 50

    while (playerHp > 0 && enemyHp > 0 && round <= maxRounds) {
      const playerFirst = playerStats.agility >= enemyStats.agility
      
      let currentPlayerHp = playerHp
      let currentEnemyHp = enemyHp

      const firstAttacks = () => {
        const attacker = playerFirst ? { ...playerStats, name: character.name, id: character.id } : { ...enemyStats, name: selectedEnemy.name, id: selectedEnemy.id }
        const defender = playerFirst ? { ...enemyStats, name: selectedEnemy.name, id: selectedEnemy.id } : { ...playerStats, name: character.name, id: character.id }
        let [attackerHp, defenderHp] = playerFirst ? [currentPlayerHp, currentEnemyHp] : [currentEnemyHp, currentPlayerHp]
        
        const isDodge = Math.random() < defender.dodgeChance
        if (isDodge) {
          replay.push({
            actor: attacker.id,
            target: defender.id,
            actorName: attacker.name,
            targetName: defender.name,
            type: 'dodge',
            description: `${defender.name} esquive l'attaque de ${attacker.name}!`
          })
        } else {
          let damage = Math.max(3, attacker.attack - defender.defense * 0.4)
          damage = Math.floor(damage * (0.9 + Math.random() * 0.2))
          const isCrit = Math.random() < attacker.critChance
          if (isCrit) damage = Math.floor(damage * 1.5)
          
          defenderHp -= damage
          replay.push({
            actor: attacker.id,
            target: defender.id,
            actorName: attacker.name,
            targetName: defender.name,
            type: isCrit ? 'crit' : 'attack',
            damage,
            description: isCrit 
              ? `${attacker.name} assène un coup CRITIQUE pour ${damage} dégâts!`
              : `${attacker.name} frappe ${defender.name} pour ${damage} dégâts`
          })
        }
        
        if (defenderHp <= 0) {
          replay.push({
            actor: attacker.id,
            target: defender.id,
            actorName: attacker.name,
            targetName: defender.name,
            type: 'death',
            description: `${defender.name} est vaincu!`
          })
          if (playerFirst) {
            playerHp = currentPlayerHp
            enemyHp = defenderHp
          } else {
            playerHp = defenderHp
            enemyHp = currentEnemyHp
          }
          return true
        }
        
        if (playerFirst) {
          currentEnemyHp = defenderHp
        } else {
          currentPlayerHp = defenderHp
        }
        return false
      }

      const secondAttacks = () => {
        const attacker = playerFirst ? { ...enemyStats, name: selectedEnemy.name, id: selectedEnemy.id } : { ...playerStats, name: character.name, id: character.id }
        const defender = playerFirst ? { ...playerStats, name: character.name, id: character.id } : { ...enemyStats, name: selectedEnemy.name, id: selectedEnemy.id }
        let [attackerHp, defenderHp] = playerFirst ? [currentEnemyHp, currentPlayerHp] : [currentPlayerHp, currentEnemyHp]
        
        const isDodge = Math.random() < defender.dodgeChance
        if (isDodge) {
          replay.push({
            actor: attacker.id,
            target: defender.id,
            actorName: attacker.name,
            targetName: defender.name,
            type: 'dodge',
            description: `${defender.name} esquive l'attaque de ${attacker.name}!`
          })
        } else {
          let damage = Math.max(3, attacker.attack - defender.defense * 0.4)
          damage = Math.floor(damage * (0.9 + Math.random() * 0.2))
          const isCrit = Math.random() < attacker.critChance
          if (isCrit) damage = Math.floor(damage * 1.5)
          
          defenderHp -= damage
          replay.push({
            actor: attacker.id,
            target: defender.id,
            actorName: attacker.name,
            targetName: defender.name,
            type: isCrit ? 'crit' : 'attack',
            damage,
            description: isCrit 
              ? `${attacker.name} assène un coup CRITIQUE pour ${damage} dégâts!`
              : `${attacker.name} frappe ${defender.name} pour ${damage} dégâts`
          })
        }
        
        if (defenderHp <= 0) {
          replay.push({
            actor: attacker.id,
            target: defender.id,
            actorName: attacker.name,
            targetName: defender.name,
            type: 'death',
            description: `${defender.name} est vaincu!`
          })
          if (playerFirst) {
            playerHp = defenderHp
            enemyHp = currentEnemyHp
          } else {
            playerHp = currentPlayerHp
            enemyHp = defenderHp
          }
          return true
        }
        
        if (playerFirst) {
          currentPlayerHp = defenderHp
        } else {
          currentEnemyHp = defenderHp
        }
        return false
      }

      const dead = firstAttacks()
      if (dead) break
      
      const dead2 = secondAttacks()
      if (dead2) break

      round++
    }

    const playerWon = enemyHp <= 0
    const xpGained = playerWon ? selectedEnemy.xpReward : Math.floor(selectedEnemy.xpReward / 4)
    const goldGained = playerWon ? selectedEnemy.goldReward : Math.floor(selectedEnemy.goldReward / 4)

    // Apply zone multipliers
    const xpMultiplier = (character.level <= 3 ? 2.0 : character.level <= 6 ? 1.7 : character.level <= 10 ? 1.4 : 1.2) * zoneDanger.xpMultiplier * difficultyBonus
    const goldMultiplier = (character.level <= 3 ? 1.5 : 1) * zoneDanger.goldMultiplier
    
    const xpGainedWithBonus = Math.floor(xpGained * xpMultiplier)
    const goldGainedWithBonus = Math.floor(goldGained * goldMultiplier)

    // WOUND SYSTEM - Chance to get wounded on defeat or in hard zones
    let wounds = JSON.parse(character.wounds || '[]')
    let corruption = character.corruptionLevel || 0
    
    if (!playerWon && Math.random() < 0.3) {
      // 30% chance to get a wound on defeat
      const woundTypes = ['fracture', 'contusion', 'entaille', 'ecrasement']
      const wound = woundTypes[Math.floor(Math.random() * woundTypes.length)]
      wounds.push({ type: wound, zone: zone.name, duration: Date.now() + 24 * 60 * 60 * 1000 })
      wounds = wounds.slice(-3) // Max 3 wounds
    }

    // Corruption in dangerous zones
    if (zoneDanger.hasCorruption && playerWon && Math.random() < 0.2) {
      corruption = Math.min(100, corruption + 5)
    }

    let newXp = character.xp + xpGainedWithBonus
    let newLevel = character.level
    let newXpToNextLevel = character.xpToNextLevel
    let newUnspentPoints = character.unspentPoints
    let newMaxHp = character.maxHp

    if (newXp >= newXpToNextLevel) {
      newLevel++
      newXp = newXp - newXpToNextLevel
      const xpCurve = newLevel <= 5 ? 1.3 : newLevel <= 10 ? 1.35 : newLevel <= 20 ? 1.4 : 1.5
      newXpToNextLevel = Math.floor(newXpToNextLevel * xpCurve)
      newUnspentPoints += 3
      newMaxHp += 15
    }

    const updatedCharacter = await prisma.character.update({
      where: { id: character.id },
      data: {
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newXpToNextLevel,
        unspentPoints: newUnspentPoints,
        maxHp: newMaxHp,
        currentHp: Math.min(playerHp > 0 ? playerHp : 1, newMaxHp),
        gold: character.gold + goldGainedWithBonus,
        victories: playerWon ? character.victories + 1 : character.victories,
        defeats: !playerWon ? character.defeats + 1 : character.defeats,
        wounds: JSON.stringify(wounds),
        corruptionLevel: corruption
      },
      include: { 
        stats: true, 
        class: true,
        inventory: {
          include: { 
            item: { 
              include: { 
                baseItem: true,
                rarity: true,
                prefix: true,
                suffix: true
              } 
            } 
          },
          orderBy: { slot: 'asc' }
        }
      }
    })

    // Track combat results for class unlock system
    if (!playerWon) {
      await trackAction(character.id, 'deaths_in_zone', zoneId)
      if (newLevel > character.level) {
        await trackAction(character.id, 'level_up')
      }
    } else if (selectedEnemy.isBoss) {
      await trackAction(character.id, 'boss_killed', zoneId)
      
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chronicles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'record',
            recordType: 'BOSS_KILL',
            zoneId: zoneId,
            targetId: selectedEnemy.id
          })
        })
      } catch (e) {
        console.error('Chronicle error:', e)
      }

      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/factions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add_reputation',
            factionId: 'les_lames',
            amount: 10
          })
        })
      } catch (e) {
        console.error('Faction error:', e)
      }
    }

    const equippedItems = await prisma.item.findMany({
      where: {
        OR: [
          { id: updatedCharacter.equippedWeapon ?? '' },
          { id: updatedCharacter.equippedShield ?? '' },
          { id: updatedCharacter.equippedHelmet ?? '' },
          { id: updatedCharacter.equippedArmor ?? '' },
          { id: updatedCharacter.equippedLegs ?? '' },
          { id: updatedCharacter.equippedAccessory ?? '' }
        ].filter(i => i.id !== '')
      },
      include: {
        baseItem: true,
        rarity: true,
        prefix: true,
        suffix: true
      }
    })

    if (playerWon) {
      const quests = await prisma.quest.findMany({
        where: { 
          isActive: true,
          type: 'daily',
          conditions: {
            contains: zone.id
          }
        }
      })

      for (const quest of quests) {
        const conditions = JSON.parse(quest.conditions || '{}')
        if (conditions.type === 'combat' && conditions.zone === zone.id) {
          const existingProgress = await prisma.questProgress.findUnique({
            where: {
              characterId_questId: {
                characterId: character.id,
                questId: quest.id
              }
            }
          })

          if (existingProgress && !existingProgress.completed) {
            const newProgress = existingProgress.currentProgress + 1
            await prisma.questProgress.update({
              where: { id: existingProgress.id },
              data: {
                currentProgress: newProgress,
                completed: newProgress >= conditions.count
              }
            })
          } else if (!existingProgress) {
            await prisma.questProgress.create({
              data: {
                characterId: character.id,
                questId: quest.id,
                currentProgress: 1,
                target: conditions.count,
                completed: 1 >= conditions.count
              }
            })
          }
        }
      }
    }

    const equippedInventoryItems = equippedItems.map((item, index) => ({
      id: `equipped-${item.id}`,
      itemId: item.id,
      slot: -1 - index,
      item
    }))

    let lootItems: any[] = []
    
    if (playerWon && Math.random() < 0.7) {
      const rarities = await prisma.itemRarity.findMany()
      const baseItems = await prisma.itemBase.findMany({
        where: { levelReq: { lte: character.level + 5 } }
      })
      
      if (baseItems.length > 0) {
        const randomBase = baseItems[Math.floor(Math.random() * baseItems.length)]
        const levelRange = Math.max(1, selectedEnemy.level - 2)
        
        const roll = Math.random()
        let selectedRarity = rarities.find(r => r.id === 'common')!
        let cumProb = 0
        for (const rarity of rarities) {
          cumProb += rarity.dropRate
          if (roll < cumProb) {
            selectedRarity = rarity
            break
          }
        }
        
        const prefixes = await prisma.itemPrefix.findMany()
        const suffixes = await prisma.itemSuffix.findMany()
        
        const prefix = prefixes.length > 0 && Math.random() < 0.4 
          ? prefixes[Math.floor(Math.random() * prefixes.length)] 
          : null
        const suffix = suffixes.length > 0 && Math.random() < 0.3
          ? suffixes[Math.floor(Math.random() * suffixes.length)]
          : null
        
        const baseStats = JSON.parse(randomBase.baseStats)
        const prefixBonuses = prefix ? JSON.parse(prefix.bonuses) : {}
        const suffixBonuses = suffix ? JSON.parse(suffix.bonuses) : {}
        const rarityBonus = JSON.parse(selectedRarity.bonusStats || '{}')
        
        const finalStats = {
          ...baseStats,
          ...prefixBonuses,
          ...suffixBonuses,
          ...rarityBonus
        }
        
        const itemLevel = levelRange + Math.floor(Math.random() * 3)
        
        const newItem = await prisma.item.create({
          data: {
            baseItemId: randomBase.id,
            prefixId: prefix?.id,
            suffixId: suffix?.id,
            rarityId: selectedRarity.id,
            finalStats: JSON.stringify(finalStats),
            itemLevel,
            source: 'drop',
            droppedBy: selectedEnemy.id
          }
        })
        
        const inventorySlots = await prisma.inventoryItem.findMany({
          where: { characterId: character.id },
          orderBy: { slot: 'desc' }
        })
        const nextSlot = inventorySlots.length > 0 ? inventorySlots[0].slot + 1 : 0
        
        await prisma.inventoryItem.create({
          data: {
            characterId: character.id,
            itemId: newItem.id,
            slot: nextSlot
          }
        })
        
        const prefixName = prefix ? `${prefix.name} ` : ''
        const suffixName = suffix ? ` ${suffix.name}` : ''
        lootItems.push({
          id: newItem.id,
          name: `${prefixName}${randomBase.name}${suffixName}`,
          type: randomBase.type,
          rarity: selectedRarity.name,
          rarityColor: selectedRarity.color,
          level: itemLevel,
          stats: finalStats
        })
      }
    }

    replay.push({
      actor: character.id,
      target: selectedEnemy.id,
      actorName: character.name,
      targetName: selectedEnemy.name,
      type: 'victory',
      description: playerWon 
        ? `${character.name} est victorieux! +${xpGainedWithBonus} XP, +${goldGainedWithBonus} or`
        : `${character.name} a fui... +${xpGainedWithBonus} XP, +${goldGainedWithBonus} or`
    })

    return NextResponse.json({
      victory: playerWon,
      replay,
      rewards: {
        xp: xpGainedWithBonus,
        gold: goldGainedWithBonus,
        leveledUp: newLevel > character.level,
        items: lootItems
      },
      character: { ...updatedCharacter, inventory: [...updatedCharacter.inventory, ...equippedInventoryItems] }
    })
  } catch (error) {
    console.error('Combat error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du combat' },
      { status: 500 }
    )
  }
}
