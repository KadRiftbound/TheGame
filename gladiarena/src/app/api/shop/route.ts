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
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    const character = await prisma.character.findUnique({
      where: { userId: session.userId }
    })

    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    const { action, merchantId, itemId, mountType, speedBonus } = await request.json()

    if (action === 'buy') {
      // Handle mount purchase differently
      if (merchantId === 'merchant_mounts') {
        const MOUNT_ITEMS: Record<string, { id: string; name: string; cost: number; speedBonus: number; stats: Record<string, number>; levelReq: number }[]> = {
          merchant_mounts: [
            { id: 'mount_horse', name: 'Cheval de Guerre', cost: 500, speedBonus: 15, stats: { defense: 5, hp: 20 }, levelReq: 5 },
            { id: 'mount_raptor', name: 'Raptor des Plaines', cost: 1200, speedBonus: 20, stats: { attack: 10, agility: 5 }, levelReq: 10 },
            { id: 'mount_wyvern', name: 'Wyvern', cost: 3500, speedBonus: 30, stats: { attack: 15, hp: 30 }, levelReq: 20 },
            { id: 'mount_griffon', name: 'Griffon', cost: 8000, speedBonus: 40, stats: { attack: 20, defense: 15, hp: 40 }, levelReq: 30 },
            { id: 'mount_drake', name: 'Drake de Combat', cost: 15000, speedBonus: 50, stats: { attack: 25, hp: 50, fireResist: 25 }, levelReq: 40 }
          ]
        }

        const mountItem = MOUNT_ITEMS[merchantId]?.find(m => m.id === itemId)
        if (!mountItem) {
          return NextResponse.json({ error: 'Monture invalide' }, { status: 400 })
        }

        if (character.level < mountItem.levelReq) {
          return NextResponse.json({ error: `Niveau ${mountItem.levelReq} requis pour cette monture` }, { status: 400 })
        }

        if (character.gold < mountItem.cost) {
          return NextResponse.json({ error: `Or insuffisant (il vous faut ${mountItem.cost} or)` }, { status: 400 })
        }

        // Determine mount type from ID
        const typeMap: Record<string, string> = {
          'mount_horse': 'horse',
          'mount_raptor': 'raptor',
          'mount_wyvern': 'wyvern',
          'mount_griffon': 'griffon',
          'mount_drake': 'drake'
        }

        // Update character with mount
        await prisma.character.update({
          where: { id: character.id },
          data: { 
            gold: character.gold - mountItem.cost,
            currentMount: typeMap[itemId] || itemId,
            mountSpeedBonus: mountItem.speedBonus
          }
        })

        return NextResponse.json({
          success: true,
          message: `Monture acquise: ${mountItem.name}! Vitesse de voyage +${mountItem.speedBonus}%`,
          mount: {
            name: mountItem.name,
            type: typeMap[itemId],
            speedBonus: mountItem.speedBonus
          }
        })
      }

      const SHOP_ITEMS: Record<string, { id: string; name: string; cost: number; stats: Record<string, number>; type: string }[]> = {
        merchant_weapons: [
          { id: 'sword_iron', name: 'Glaive de fer', cost: 100, stats: { attack: 15 }, type: 'weapon' },
          { id: 'sword_steel', name: 'Glaive d\'acier', cost: 300, stats: { attack: 30 }, type: 'weapon' },
          { id: 'sword_legend', name: 'Glaive Légendaire', cost: 1000, stats: { attack: 75 }, type: 'weapon' }
        ],
        merchant_armor: [
          { id: 'armor_iron', name: 'Armure de fer', cost: 120, stats: { defense: 10, hp: 20 }, type: 'armor' },
          { id: 'armor_steel', name: 'Armure d\'acier', cost: 350, stats: { defense: 25, hp: 50 }, type: 'armor' },
          { id: 'armor_legend', name: 'Armure Légendaire', cost: 1200, stats: { defense: 60, hp: 120 }, type: 'armor' }
        ],
        merchant_potions: [
          { id: 'potion_health', name: 'Potion de Soin', cost: 25, stats: { heal: 50 }, type: 'consumable' },
          { id: 'potion_stamina', name: 'Potion d\'Endurance', cost: 30, stats: { energy: 50 }, type: 'consumable' }
        ]
      }

      const merchantItems = SHOP_ITEMS[merchantId]
      if (!merchantItems) {
        return NextResponse.json({ error: 'Marchand invalide' }, { status: 400 })
      }

      const item = merchantItems.find(i => i.id === itemId)
      if (!item) {
        return NextResponse.json({ error: 'Item invalide' }, { status: 400 })
      }

      let finalCost = item.cost
      const reputation = await prisma.reputation.findUnique({
        where: { characterId_factionId: { characterId: character.id, factionId: 'les_lames' } }
      })
      
      const repValue = reputation?.value || 0
      const discount = Math.min(20, Math.floor(repValue / 100) * 5)
      finalCost = Math.floor(item.cost * (1 - discount / 100))

      if (character.gold < finalCost) {
        return NextResponse.json({ error: `Or insuffisant (il vous faut ${finalCost} or)` }, { status: 400 })
      }

      const baseItem = await prisma.itemBase.findFirst({ where: { name: { contains: item.name.split(' ')[0] } } })
      let itemToCreate

      if (baseItem) {
        const rarity = await prisma.itemRarity.findFirst({ where: { name: 'common' } })
        itemToCreate = await prisma.item.create({
          data: {
            baseItemId: baseItem.id,
            rarityId: rarity?.id || 'common',
            finalStats: JSON.stringify(item.stats),
            itemLevel: character.level
          }
        })
      } else {
        const baseItemNew = await prisma.itemBase.create({
          data: {
            id: item.id,
            name: item.name,
            type: item.type,
            baseStats: JSON.stringify(item.stats),
            levelReq: Math.max(1, character.level - 5)
          }
        })
        const rarity = await prisma.itemRarity.findFirst({ where: { name: 'common' } })
        itemToCreate = await prisma.item.create({
          data: {
            baseItemId: baseItemNew.id,
            rarityId: rarity?.id || 'common',
            finalStats: JSON.stringify(item.stats),
            itemLevel: character.level
          }
        })
      }

      const maxSlot = await prisma.inventoryItem.aggregate({
        where: { characterId: character.id },
        _max: { slot: true }
      })
      const nextSlot = (maxSlot._max.slot || 0) + 1

      await prisma.inventoryItem.create({
        data: {
          characterId: character.id,
          itemId: itemToCreate.id,
          slot: nextSlot
        }
      })

      await prisma.character.update({
        where: { id: character.id },
        data: { gold: character.gold - finalCost }
      })

      return NextResponse.json({ 
        success: true, 
        message: `Acheté: ${item.name} pour ${finalCost} or`,
        item: itemToCreate,
        discount
      })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })

  } catch (error: any) {
    console.error('Shop API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
