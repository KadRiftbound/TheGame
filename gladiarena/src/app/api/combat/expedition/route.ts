import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
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
      include: { stats: true, class: true }
    })
    
    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    const { zoneId, enemyName, enemyLevel, enemyHp, enemyAttack, enemyDefense, isElite } = await request.json()

    // If custom enemy provided (from micro-zone), use it directly
    if (enemyName && enemyLevel) {
      // Get equipped items
      const equippedItems = await prisma.item.findMany({
        where: {
          id: {
            in: [
              character.equippedWeapon,
              character.equippedShield,
              character.equippedHelmet,
              character.equippedArmor,
              character.equippedLegs,
              character.equippedAccessory
            ].filter((id): id is string => id !== null)
          }
        }
      })
      
      // Calculate player stats
      const baseStr = (character.baseStrength || 10) + (character.strengthInvested || 0)
      const baseAgi = (character.baseAgility || 10) + (character.agilityInvested || 0)
      const baseVit = (character.baseVitality || 10) + (character.vitalityInvested || 0)
      const baseLuck = (character.baseLuck || 10) + (character.luckInvested || 0)
      
      const playerMaxHp = 100 + (baseVit * 15)
      const playerAttack = baseStr * 3
      const playerDefense = baseVit * 2 + baseAgi
      const playerAgility = baseAgi
      
      const enemyAttackVal = enemyAttack || 10
      const enemyDefenseVal = enemyDefense || 5
      
      let playerCurrentHp = playerMaxHp
      let enemyCurrentHp = enemyHp || 100
      
      const replay: any[] = []
      let victory = false
      
      for (let round = 1; round <= 50; round++) {
        const playerFirst = playerAgility >= (8 + enemyLevel)
        
        if (playerFirst) {
          // Player attacks first
          const dmg = Math.max(1, Math.floor(playerAttack * (0.9 + Math.random() * 0.2) - enemyDefenseVal * 0.4))
          enemyCurrentHp -= dmg
          replay.push({ type: 'attack', damage: dmg, description: `${character.name} frappe ${enemyName} pour ${dmg} dégâts` })
          
          if (enemyCurrentHp <= 0) {
            victory = true
            replay.push({ type: 'victory', description: 'Victoire!' })
            break
          }
          
          // Enemy attacks
          const enemyDmg = Math.max(1, Math.floor(enemyAttackVal * (0.9 + Math.random() * 0.2) - playerDefense * 0.4))
          playerCurrentHp -= enemyDmg
          replay.push({ type: 'attack', damage: enemyDmg, description: `${enemyName} frappe ${character.name} pour ${enemyDmg} dégâts` })
          
          if (playerCurrentHp <= 0) {
            replay.push({ type: 'death', description: 'Défaite!' })
            break
          }
        } else {
          // Enemy attacks first
          const enemyDmg = Math.max(1, Math.floor(enemyAttackVal * (0.9 + Math.random() * 0.2) - playerDefense * 0.4))
          playerCurrentHp -= enemyDmg
          replay.push({ type: 'attack', damage: enemyDmg, description: `${enemyName} frappe ${character.name} pour ${enemyDmg} dégâts` })
          
          if (playerCurrentHp <= 0) {
            replay.push({ type: 'death', description: 'Défaite!' })
            break
          }
          
          // Player attacks
          const dmg = Math.max(1, Math.floor(playerAttack * (0.9 + Math.random() * 0.2) - enemyDefenseVal * 0.4))
          enemyCurrentHp -= dmg
          replay.push({ type: 'attack', damage: dmg, description: `${character.name} frappe ${enemyName} pour ${dmg} dégâts` })
          
          if (enemyCurrentHp <= 0) {
            victory = true
            replay.push({ type: 'victory', description: 'Victoire!' })
            break
          }
        }
      }
      
      // Calculate rewards
      const xpReward = victory ? Math.floor((enemyLevel * 10 + 20) * (isElite ? 2 : 1)) : 0
      const goldReward = victory ? Math.floor((enemyLevel * 5 + 10) * (isElite ? 2 : 1)) : 0
      
      // Update character
      if (victory) {
        await prisma.character.update({
          where: { id: character.id },
          data: {
            xp: character.xp + xpReward,
            gold: character.gold + goldReward,
            currentHp: playerCurrentHp
          }
        })
        
        // Check level up
        const xpToNextLevel = character.level * 100 + 100
        let leveledUp = false
        if (character.xp + xpReward >= xpToNextLevel) {
          await prisma.character.update({
            where: { id: character.id },
            data: {
              level: character.level + 1,
              unspentPoints: character.unspentPoints + 3,
              maxHp: playerMaxHp + 10,
              currentHp: playerMaxHp + 10
            }
          })
          leveledUp = true
        }
        
        // Get updated character
        const updatedCharacter = await prisma.character.findUnique({
          where: { id: character.id },
          include: { stats: true, class: true }
        })
        
        return NextResponse.json({
          victory: true,
          replay,
          rewards: { xp: xpReward, gold: goldReward, items: [], leveledUp },
          character: updatedCharacter
        })
      } else {
        // Update HP on defeat
        await prisma.character.update({
          where: { id: character.id },
          data: { currentHp: 1 }
        })
        
        return NextResponse.json({
          victory: false,
          replay,
          rewards: { xp: 0, gold: 0, items: [], leveledUp: false },
          character
        })
      }
    }

    // Original expedition logic - require zoneId
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

    // Simple expedition combat
    const selectedEnemy = zone.enemies[0]
    if (!selectedEnemy) {
      return NextResponse.json({ error: 'Aucun ennemi dans cette zone' }, { status: 400 })
    }

    // Calculate stats
    const baseStr = (character.baseStrength || 10) + (character.strengthInvested || 0)
    const baseAgi = (character.baseAgility || 10) + (character.agilityInvested || 0)
    const baseVit = (character.baseVitality || 10) + (character.vitalityInvested || 0)
    
    const playerMaxHp = character.maxHp
    const playerAttack = baseStr * 3
    const playerDefense = baseVit * 2 + baseAgi
    const playerAgility = baseAgi
    
    const enemyAttackVal = selectedEnemy.attack + Math.floor(character.level * 0.5)
    const enemyDefenseVal = selectedEnemy.defense + Math.floor(character.level * 0.3)
    
    let playerCurrentHp = playerMaxHp
    let enemyCurrentHp = selectedEnemy.hp
    
    const replay: any[] = []
    let victory = false
    
    for (let round = 1; round <= 50; round++) {
      const playerFirst = playerAgility >= (8 + selectedEnemy.level)
      
      if (playerFirst) {
        const dmg = Math.max(1, Math.floor(playerAttack * (0.9 + Math.random() * 0.2) - enemyDefenseVal * 0.4))
        enemyCurrentHp -= dmg
        replay.push({ type: 'attack', damage: dmg, description: `${character.name} frappe pour ${dmg} dégâts` })
        
        if (enemyCurrentHp <= 0) { victory = true; break }
        
        const enemyDmg = Math.max(1, Math.floor(enemyAttackVal * (0.9 + Math.random() * 0.2) - playerDefense * 0.4))
        playerCurrentHp -= enemyDmg
        replay.push({ type: 'attack', damage: enemyDmg, description: `${selectedEnemy.name} frappe pour ${enemyDmg} dégâts` })
        
        if (playerCurrentHp <= 0) { break }
      } else {
        const enemyDmg = Math.max(1, Math.floor(enemyAttackVal * (0.9 + Math.random() * 0.2) - playerDefense * 0.4))
        playerCurrentHp -= enemyDmg
        replay.push({ type: 'attack', damage: enemyDmg, description: `${selectedEnemy.name} frappe pour ${enemyDmg} dégâts` })
        
        if (playerCurrentHp <= 0) { break }
        
        const dmg = Math.max(1, Math.floor(playerAttack * (0.9 + Math.random() * 0.2) - enemyDefenseVal * 0.4))
        enemyCurrentHp -= dmg
        replay.push({ type: 'attack', damage: dmg, description: `${character.name} frappe pour ${dmg} dégâts` })
        
        if (enemyCurrentHp <= 0) { victory = true; break }
      }
    }
    
    if (victory) {
      const xpReward = Math.floor((selectedEnemy.level * 10 + 20) * (zone.xpMultiplier || 1))
      const goldReward = Math.floor((selectedEnemy.goldReward || 10) * (zone.goldMultiplier || 1))
      
      await prisma.character.update({
        where: { id: character.id },
        data: {
          xp: character.xp + xpReward,
          gold: character.gold + goldReward,
          currentHp: playerCurrentHp
        }
      })
      
      const updatedCharacter = await prisma.character.findUnique({
        where: { id: character.id },
        include: { stats: true, class: true }
      })
      
      return NextResponse.json({
        victory: true,
        replay: [...replay, { type: 'victory', description: 'Victoire!' }],
        rewards: { xp: xpReward, gold: goldReward, items: [], leveledUp: false },
        character: updatedCharacter
      })
    } else {
      await prisma.character.update({
        where: { id: character.id },
        data: { currentHp: 1 }
      })
      
      return NextResponse.json({
        victory: false,
        replay: [...replay, { type: 'death', description: 'Défaite!' }],
        rewards: { xp: 0, gold: 0, items: [], leveledUp: false },
        character
      })
    }
  } catch (error: any) {
    console.error('Combat error:', error)
    return NextResponse.json({ error: `Erreur: ${error?.message || error}` }, { status: 500 })
  }
}