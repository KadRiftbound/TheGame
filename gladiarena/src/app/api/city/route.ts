import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ZoneProfile {
  riskScore: number
  dangers: string[]
  prepRecommendations: string[]
  healRating: string
  profileName: string
  badges: string[]
}

interface ZoneVisibility {
  isVisible: boolean
  complexity: 'simple' | 'intermediaire' | 'complexe'
  unmetConditions: string[]
}

function evaluateSecretZoneVisibility(
  condition: string | null,
  character: any,
  zoneVisitCountByZoneId: Map<string, number>
): ZoneVisibility {
  if (!condition) {
    return { isVisible: true, complexity: 'simple', unmetConditions: [] }
  }

  const unmetConditions: string[] = []
  let checks = 0

  const raw = condition.trim()
  if (raw.startsWith('title:')) {
    checks++
    const titleId = raw.replace('title:', '').trim()
    const titles = JSON.parse(character?.titles || '[]')
    if (!titles.includes(titleId)) unmetConditions.push(`titre ${titleId}`)
  } else if (raw.startsWith('level>=')) {
    checks++
    const minLevel = Number(raw.replace('level>=', '').trim())
    if ((character?.level || 1) < minLevel) unmetConditions.push(`niveau ${minLevel}`)
  } else if (raw.startsWith('zone_visits:')) {
    checks += 2
    const [, payload] = raw.split(':')
    const [zoneId, countStr] = (payload || '').split(':')
    const targetCount = Number(countStr || 1)
    const visits = zoneVisitCountByZoneId.get(zoneId) || 0
    if (!zoneId || visits < targetCount) unmetConditions.push(`visites ${zoneId || 'zone'} x${targetCount}`)
  } else if (raw.startsWith('secret:')) {
    checks++
    const secretFlag = raw.replace('secret:', '').trim()
    const flags = JSON.parse(character?.secretFlags || '[]')
    if (!flags.includes(secretFlag)) unmetConditions.push(`secret ${secretFlag}`)
  } else {
    checks += 3
    unmetConditions.push(raw)
  }

  const complexity: ZoneVisibility['complexity'] =
    checks <= 1 ? 'simple' : checks <= 3 ? 'intermediaire' : 'complexe'

  return {
    isVisible: unmetConditions.length === 0,
    complexity,
    unmetConditions,
  }
}

function evaluateZoneVisibility(
  zone: { isHidden: boolean; unlockCondition?: string | null },
  character: any,
  zoneVisitCountByZoneId: Map<string, number>
): ZoneVisibility {
  if (!zone.isHidden) {
    return { isVisible: true, complexity: 'simple', unmetConditions: [] }
  }

  if (!zone.unlockCondition) {
    return { isVisible: false, complexity: 'simple', unmetConditions: ['condition inconnue'] }
  }

  let conditions: any
  try {
    conditions = JSON.parse(zone.unlockCondition)
  } catch {
    return { isVisible: false, complexity: 'complexe', unmetConditions: ['condition invalide'] }
  }

  const unmetConditions: string[] = []
  let checks = 0

  if (conditions.minLevel) {
    checks++
    if ((character?.level || 1) < conditions.minLevel) {
      unmetConditions.push(`niveau ${conditions.minLevel}`)
    }
  }

  if (conditions.minVictories) {
    checks++
    if ((character?.victories || 0) < conditions.minVictories) {
      unmetConditions.push(`${conditions.minVictories} victoires`)
    }
  }

  if (conditions.requiresTitle) {
    checks++
    const titles = JSON.parse(character?.titles || '[]')
    if (!titles.includes(conditions.requiresTitle)) {
      unmetConditions.push(`titre ${conditions.requiresTitle}`)
    }
  }

  if (conditions.requiresSecretFlag) {
    checks++
    const flags = JSON.parse(character?.secretFlags || '[]')
    if (!flags.includes(conditions.requiresSecretFlag)) {
      unmetConditions.push(`secret ${conditions.requiresSecretFlag}`)
    }
  }

  if (conditions.zoneVisits?.zoneId && conditions.zoneVisits?.count) {
    checks++
    const visitCount = zoneVisitCountByZoneId.get(conditions.zoneVisits.zoneId) || 0
    if (visitCount < conditions.zoneVisits.count) {
      unmetConditions.push(`${conditions.zoneVisits.count} visites (${conditions.zoneVisits.zoneId})`)
    }
  }

  if (conditions.currentZoneId) {
    checks++
    if (character?.currentZoneId !== conditions.currentZoneId) {
      unmetConditions.push(`être dans ${conditions.currentZoneId}`)
    }
  }

  const complexity: ZoneVisibility['complexity'] =
    checks <= 1 ? 'simple' : checks <= 3 ? 'intermediaire' : 'complexe'

  return {
    isVisible: unmetConditions.length === 0,
    complexity,
    unmetConditions,
  }
}

function calculateZoneProfile(zone: any): ZoneProfile {
  const dangers: string[] = []
  const prepRecommendations: string[] = []
  let riskScore = zone.dangerScore || 0

  const damageType = zone.baseDamageType || 'physical'
  if (damageType !== 'physical') {
    dangers.push(damageType)
    const resistNames: Record<string, string> = {
      fire: 'Feu',
      ice: 'Glace',
      poison: 'Poison',
      chaos: 'Chaos',
      water: 'Eau'
    }
    prepRecommendations.push(`Résistance ${resistNames[damageType] || damageType}`)
  }

  if (zone.hasCorruption) {
    dangers.push('corruption')
    prepRecommendations.push('Purification')
  }

  if (zone.environmentalHazard) {
    dangers.push('danger environnemental')
  }

  const healRating = (zone.healAvailability || 50) <= 25 ? 'rare' 
                   : (zone.healAvailability || 50) <= 50 ? 'limité' 
                   : 'abondant'

  if (healRating === 'rare') {
    prepRecommendations.push('Potions de Soin')
  } else if (healRating === 'limité') {
    prepRecommendations.push('Provisions')
  }

  const badges: string[] = []
  if (zone.hasCorruption) badges.push('corruption')
  if (damageType !== 'physical') badges.push(damageType)
  if (zone.environmentalHazard) badges.push('danger')
  if (healRating === 'rare') badges.push('soins_rares')
  
  // Add zone type badge
  if (zone.zoneType === 'dangereuse') badges.push('danger')
  if (zone.zoneType === 'intermediaire') badges.push('intermediaire')

  const profileName = generateProfileName(dangers, zone.difficulty, zone.zoneType)

  return {
    riskScore,
    dangers,
    prepRecommendations,
    healRating,
    profileName,
    badges
  }
}

function generateProfileName(dangers: string[], difficulty: string, zoneType?: string): string {
  if (dangers.includes('corruption')) return 'Zone Corrompue'
  if (dangers.includes('fire') && dangers.includes('corruption')) return 'Volcan Ardent'
  if (dangers.includes('poison')) return 'Terre Empoisonnée'
  if (dangers.includes('ice')) return 'Toundra Glaciale'
  if (dangers.includes('chaos')) return 'Territoire du Chaos'
  if (dangers.includes('water')) return 'Profondeurs Aquatiques'
  
  if (zoneType === 'dangereuse') return 'Zone Dangereuse'
  if (zoneType === 'intermediaire') return 'Zone Intermédiaire'
  if (zoneType === 'proche') return 'Zone Proche'
   
  const diffNames: Record<string, string> = {
    easy: 'Territoire Sûr',
    normal: 'Zone de Chasse',
    hard: 'Zone Hostile',
    secret: 'Territoire Secret'
  }
  return diffNames[difficulty] || 'Zone de Chasse'
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    let userId = null
    if (token) {
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true }
      })
      if (session && session.expiresAt > new Date()) {
        userId = session.userId
      }
    }
    
    const playerCount = await prisma.user.count()
    
    const character = userId ? await prisma.character.findUnique({
      where: { userId },
      select: {
        id: true,
        currentZoneId: true,
        currentCityId: true,
        level: true,
        victories: true,
        titles: true,
        secretFlags: true
      }
    }) : null

    // Get the current city - default to first city if none set
    let currentCityId = character?.currentCityId
    if (!currentCityId) {
      const firstCity = await prisma.city.findFirst({ orderBy: { orderIndex: 'asc' } })
      currentCityId = firstCity?.id
    }

    // Get zones for the current city (or all zones if no cityId is set yet)
    let zonesData
    if (currentCityId) {
      zonesData = await prisma.zone.findMany({
        where: { cityId: currentCityId },
        select: {
          id: true,
          name: true,
          slug: true,
          minLevel: true,
          maxLevel: true,
          difficulty: true,
          description: true,
          isHidden: true,
          unlockCondition: true,
          hiddenRoute: true,
          zoneType: true,
          dangerScore: true,
          baseDamageType: true,
          environmentalHazard: true,
          hasCorruption: true,
          healAvailability: true,
          enemyAggroRange: true,
          rareLootChance: true,
          corruptionType: true,
          cityId: true,
          microZones: {
            select: {
              id: true,
              name: true,
              type: true,
              dangerLevel: true,
              rotationGroup: true
            }
          }
        },
        orderBy: { dangerScore: 'asc' }
      })
    } else {
      // No city set - get all zones as fallback
      zonesData = await prisma.zone.findMany({
        take: 20,
        select: {
          id: true,
          name: true,
          slug: true,
          minLevel: true,
          maxLevel: true,
          difficulty: true,
          description: true,
          isHidden: true,
          unlockCondition: true,
          hiddenRoute: true,
          zoneType: true,
          dangerScore: true,
          baseDamageType: true,
          environmentalHazard: true,
          hasCorruption: true,
          healAvailability: true,
          enemyAggroRange: true,
          rareLootChance: true,
          corruptionType: true,
          cityId: true,
        },
        orderBy: { dangerScore: 'asc' }
      })
    }

    const zoneVisitCountByZoneId = new Map<string, number>()
    if (character?.id) {
      const zoneStates = await prisma.characterZoneState.findMany({
        where: { characterId: character.id },
        select: { zoneId: true, visitCount: true }
      })
      for (const s of zoneStates) zoneVisitCountByZoneId.set(s.zoneId, s.visitCount)
    }

    const zones = zonesData.map(zone => {
      const visibility = evaluateZoneVisibility(zone, character, zoneVisitCountByZoneId)
      const maskedZoneName = zone.isHidden && !visibility.isVisible ? 'Zone inconnue' : zone.name
      const maskedDescription = zone.isHidden && !visibility.isVisible
        ? zone.hiddenRoute || 'Cette zone reste voilée. Continuez à explorer pour la révéler.'
        : zone.description

      return {
        ...zone,
        name: maskedZoneName,
        description: maskedDescription,
        isVisible: visibility.isVisible,
        visibilityComplexity: visibility.complexity,
        visibilityMissing: visibility.unmetConditions,
        profile: calculateZoneProfile(zone)
      }
    })

    // Get current city info
    const currentCity = currentCityId ? await prisma.city.findUnique({
      where: { id: currentCityId },
      include: { faction: true }
    }) : null

    const allCities = await prisma.city.findMany({
      orderBy: { orderIndex: 'asc' },
      select: { id: true, name: true, slug: true, theme: true, dangerProfile: true }
    })

    const rawSecretZones = currentCityId ? await prisma.secretZone.findMany({
      where: { cityId: currentCityId },
      orderBy: [{ level: 'asc' }, { dangerScore: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        discoveryType: true,
        condition: true,
        isDiscovered: true,
        level: true,
        dangerScore: true
      }
    }) : []

    const secretZones = rawSecretZones.map((secretZone) => {
      const visibility = evaluateSecretZoneVisibility(secretZone.condition, character, zoneVisitCountByZoneId)
      return {
        ...secretZone,
        isVisible: secretZone.isDiscovered || visibility.isVisible,
        visibilityComplexity: visibility.complexity,
        visibilityMissing: visibility.unmetConditions
      }
    })

    const merchants = [
      {
        id: 'merchant_weapons',
        name: 'Armurier',
        type: 'weapon',
        description: 'Achète et vend des armes',
        icon: '⚔️',
        inventory: [
          { id: 'sword_iron', name: 'Glaive de fer', cost: 100, stats: { attack: 15 } },
          { id: 'sword_steel', name: 'Glaive d\'acier', cost: 300, stats: { attack: 30 } },
          { id: 'sword_legend', name: 'Glaive Légendaire', cost: 1000, stats: { attack: 75 } }
        ]
      },
      {
        id: 'merchant_armor',
        name: 'Forgeron',
        type: 'armor',
        description: 'Armures et protections',
        icon: '🛡️',
        inventory: [
          { id: 'armor_iron', name: 'Armure de fer', cost: 120, stats: { defense: 10, hp: 20 } },
          { id: 'armor_steel', name: 'Armure d\'acier', cost: 350, stats: { defense: 25, hp: 50 } },
          { id: 'armor_legend', name: 'Armure Légendaire', cost: 1200, stats: { defense: 60, hp: 120 } }
        ]
      },
      {
        id: 'merchant_resistance',
        name: 'Enchantisseur',
        type: 'accessory',
        description: 'Amulettes et anneaux de résistance',
        icon: '💍',
        inventory: [
          { id: 'amulet_fire', name: 'Amulette de Feu', cost: 200, stats: { resistance: { fire: 15 } } },
          { id: 'amulet_ice', name: 'Amulette de Givre', cost: 200, stats: { resistance: { ice: 15 } } },
          { id: 'amulet_poison', name: 'Amulette de Poison', cost: 200, stats: { resistance: { poison: 15 } } },
          { id: 'amulet_chaos', name: 'Amulette du Chaos', cost: 500, stats: { resistance: { chaos: 25 } } },
          { id: 'ring_protection', name: 'Anneau de Protection', cost: 400, stats: { defense: 15, resistance: { physical: 10 } } }
        ]
      },
      {
        id: 'merchant_mounts',
        name: 'Éleveur de Montures',
        type: 'mount',
        description: 'Chevaux et créatures pour voyager plus vite',
        icon: '🐎',
        inventory: [
          { id: 'mount_horse', name: 'Cheval de Guerre', cost: 500, speedBonus: 15, stats: { defense: 5, hp: 20 }, levelReq: 5 },
          { id: 'mount_raptor', name: 'Raptor des Plaines', cost: 1200, speedBonus: 20, stats: { attack: 10, agility: 5 }, levelReq: 10 },
          { id: 'mount_wyvern', name: 'Wyvern', cost: 3500, speedBonus: 30, stats: { attack: 15, hp: 30 }, levelReq: 20 },
          { id: 'mount_griffon', name: 'Griffon', cost: 8000, speedBonus: 40, stats: { attack: 20, defense: 15, hp: 40 }, levelReq: 30 },
          { id: 'mount_drake', name: 'Drake de Combat', cost: 15000, speedBonus: 50, stats: { attack: 25, hp: 50, fireResist: 25 }, levelReq: 40 }
        ]
      },
      {
        id: 'merchant_potions',
        name: 'Alchimiste',
        type: 'potion',
        description: 'Potions et consommables',
        icon: '🧪',
        inventory: [
          { id: 'potion_health', name: 'Potion de Soin', cost: 25, stats: { heal: 50 } },
          { id: 'potion_stamina', name: 'Potion d\'Endurance', cost: 30, stats: { energy: 50 } }
        ]
      }
    ]

    return NextResponse.json({
      playerCount,
      zones,
      merchants,
      currentCity: currentCity ? {
        id: currentCity.id,
        name: currentCity.name,
        slug: currentCity.slug,
        description: currentCity.description,
        theme: currentCity.theme,
        function: currentCity.function,
        dangerProfile: currentCity.dangerProfile,
        dominantDamage: currentCity.dominantDamage,
        usefulResistance: currentCity.usefulResistance,
        levelMin: currentCity.levelMin,
        levelMax: currentCity.levelMax,
        cityBonuses: getCityBonuses(currentCity),
        citySpecials: getCitySpecials(currentCity),
      } : null,
      allCities,
      secretZones,
      cityName: currentCity?.name || 'Cité des Arènes',
      cityDescription: currentCity?.description || 'Le cœur de l\'activité des.gladiateurs.',
      character: character
    })
  } catch (error: any) {
    console.error('City API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}

function getCityBonuses(city: any): { name: string; description: string; bonus: number }[] {
  const bonuses: { name: string; description: string; bonus: number }[] = []
  
  if (city.function === 'commerce') {
    bonuses.push({ name: 'Rabais Commercial', description: 'Prix marchands réduits de 10%', bonus: 10 })
  }
  if (city.function === 'combat') {
    bonuses.push({ name: 'Expérience de Combat', description: '+15% XP en combat', bonus: 15 })
  }
  if (city.function === 'craft') {
    bonuses.push({ name: 'Artisanat Accru', description: '+20% objets craftés', bonus: 20 })
  }
  if (city.function === 'secret') {
    bonuses.push({ name: 'Découverte Secrète', description: '+25% chances de secrets', bonus: 25 })
  }
  
  if (city.theme === 'maritime') {
    bonuses.push({ name: 'Domaine Maritime', description: 'Réduction dégâts eau 15%', bonus: 15 })
  }
  if (city.theme === 'forest') {
    bonuses.push({ name: 'Forêt Ancestrale', description: 'Réduction dégâts poison 15%', bonus: 15 })
  }
  if (city.theme === 'mountain') {
    bonuses.push({ name: 'Force Volcanique', description: 'Réduction dégâts feu 15%', bonus: 15 })
  }
  if (city.theme === 'desert') {
    bonuses.push({ name: 'Chaleur du Désert', description: 'Résistance feu +20%', bonus: 20 })
  }
  if (city.theme === 'ice') {
    bonuses.push({ name: 'Froid Éternel', description: 'Résistance glace +20%', bonus: 20 })
  }
  if (city.theme === 'island') {
    bonuses.push({ name: 'Mystère des Brumes', description: 'Découverte secrète +15%', bonus: 15 })
  }
  
  return bonuses
}

function getCitySpecials(city: any): { type: string; name: string; description: string; requirement?: string }[] {
  const specials: { type: string; name: string; description: string; requirement?: string }[] = []
  
  if (city.function === 'commerce') {
    specials.push({ type: 'vendor', name: 'Marchand Rare', description: 'Vend des objets uniques', requirement: 'level 15' })
  }
  if (city.function === 'combat') {
    specials.push({ type: 'arena', name: 'Arène des Champions', description: 'Combats PvP renforcés' })
  }
  if (city.function === 'craft') {
    specials.push({ type: 'craft', name: 'Atelier de Maître', description: 'Crafting avancé' })
  }
  if (city.function === 'secret') {
    specials.push({ type: 'secret', name: 'Sanctuaire Caché', description: 'Quêtes secrètes disponibles', requirement: ' Niveau 20' })
  }
  
  if (city.dominantDamage === 'fire') {
    specials.push({ type: 'resist', name: 'Bain de Feu', description: 'Réduit résistance feu de 25%', requirement: 'level 10' })
  }
  if (city.dominantDamage === 'poison') {
    specials.push({ type: 'resist', name: 'Herboristerie', description: 'Antidotes à prix réduit' })
  }
  if (city.dominantDamage === 'chaos') {
    specials.push({ type: 'secret', name: 'Pacte des Ombres', description: 'CHOIX: Pouvoir sombre ou lumière', requirement: ' Corruption 30+' })
  }
  if (city.dominantDamage === 'ice') {
    specials.push({ type: 'resist', name: 'Crypte Glacée', description: 'Objets de glace disponibles' })
  }
  
  if (city.dangerProfile === 'extreme') {
    specials.push({ type: 'challenge', name: 'Défi Extrem', description: 'Zones danger extrême déverrouillées' })
  }
  
  return specials
}
