import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ZoneNode {
  id: string
  name: string
  worldX: number
  worldY: number
  travelTimeSeconds: number
  isHub: boolean
  difficulty: string
  baseDamageType?: string
  hasCorruption?: boolean
  trapDensity?: number
}

interface TravelCalculationResult {
  from: string
  to: string
  path: { zone: string; baseTime: number; adjustedTime: number; risk: number }[]
  baseTotalMinutes: number
  adjustedTotalMinutes: number
  totalRisk: number
  ambushChance: string
  expectedDamagePerAmbush: number
  speedBonus: { source: string; percent: number }[]
  advice: string
  events?: TravelEventOccurrence[]
}

interface TravelEvent {
  id: string
  type: 'dangerous' | 'neutral' | 'positive' | 'rare'
  text: string
  weight: number
  requirements?: {
    minTravelTime?: number
    zoneHasCorruption?: boolean
    zoneHasTraps?: boolean
    minCorruption?: number
  }
}

interface TravelEventOccurrence {
  eventId: string
  type: string
  text: string
  outcome: {
    damage?: number
    healing?: number
    goldChange?: number
    corruption?: number
    wound?: boolean
    loot?: { name: string; rarity: string }
    choice?: { options: { id: string; text: string }[] }
    secret?: string
  }
}

const TRAVEL_EVENTS: TravelEvent[] = [
  // === DANGEREUX ===
  {
    id: 'ambush_bandits',
    type: 'dangerous',
    text: "Des bandits vous tendent une embuscade sur la route!",
    weight: 10,
    requirements: { minTravelTime: 120 }
  },
  {
    id: 'trap_snare',
    type: 'dangerous',
    text: "Vous tombez dans un piège abandonne!",
    weight: 8,
    requirements: { zoneHasTraps: true }
  },
  {
    id: 'wild_beast',
    type: 'dangerous',
    text: "Une créature sauvage surgit des buissons!",
    weight: 6
  },
  {
    id: 'corrupted_mist',
    type: 'dangerous',
    text: "Une brume corrompue vous enveloppe...",
    weight: 5,
    requirements: { zoneHasCorruption: true }
  },
  {
    id: 'road_collapse',
    type: 'dangerous',
    text: "La route s'effondre devant vous! Vous devez faire un detour dangereux.",
    weight: 4
  },

  // === NEUTRE ===
  {
    id: 'wandering_merchant',
    type: 'neutral',
    text: "Un marchand ambulant vous salue.",
    weight: 12
  },
  {
    id: 'old_ruins',
    type: 'neutral',
    text: "Vous apercevez des ruines anciennes.",
    weight: 8
  },
  {
    id: 'fellow_adventurer',
    type: 'neutral',
    text: "Un autre gladiateur traverse la route.",
    weight: 10
  },
  {
    id: 'strange_sounds',
    type: 'neutral',
    text: "Vous entendez des sons étrange dans la forêt.",
    weight: 6
  },

  // === POSITIF ===
  {
    id: 'hidden_chest',
    type: 'positive',
    text: "Vous trouvez un coffre caché dans les buissons!",
    weight: 6
  },
  {
    id: 'herbalist',
    type: 'positive',
    text: "Un herboriste vous offre des plantes heals.",
    weight: 5
  },
  {
    id: 'shortcut',
    type: 'positive',
    text: "Vous découvres un raccourci à travers la forêt!",
    weight: 4
  },
  {
    id: 'rest_stop',
    type: 'positive',
    text: "Vous trouvez un endroit paisible pour vous reposer.",
    weight: 5
  },

  // === RARE ===
  {
    id: 'secret_cultist',
    type: 'rare',
    text: "Un cultiste du néant vous approche, murmurant des paroles interdites...",
    weight: 2,
    requirements: { minCorruption: 30 }
  },
  {
    id: 'ancient_guardian',
    type: 'rare',
    text: "Un gardien ancien émerge des ruines!",
    weight: 2
  },
  {
    id: 'lost_caravan',
    type: 'rare',
    text: "Vous trouvez une caravane pillée... les bandits sont partis mais le butin reste.",
    weight: 3
  }
]

function resolveEvent(event: TravelEvent, character: any, zone: ZoneNode | null): TravelEventOccurrence {
  const outcome: any = {}
  const rand = Math.random()

  switch (event.id) {
    case 'ambush_bandits':
      outcome.damage = Math.floor((character.maxHp || 100) * 0.15)
      outcome.wound = rand < 0.2
      break

    case 'trap_snare':
      outcome.damage = Math.floor((character.maxHp || 100) * 0.1)
      break

    case 'wild_beast':
      outcome.damage = Math.floor((character.maxHp || 100) * 0.2)
      break

    case 'corrupted_mist':
      outcome.corruption = 10
      outcome.damage = Math.floor((character.maxHp || 100) * 0.1)
      break

    case 'road_collapse':
      outcome.damage = Math.floor((character.maxHp || 100) * 0.12)
      break

    case 'wandering_merchant':
      outcome.secret = 'Vous avez croisé un marchand ambulant. Cherchez-le en ville.'
      break

    case 'old_ruins':
      outcome.secret = 'Ruines anciennes découvertes. Peut-être un secret à trouver...'
      break

    case 'fellow_adventurer':
      outcome.secret = 'Un autre joueur vous a croisé. Le monde semble plus vivant.'
      break

    case 'hidden_chest':
      outcome.goldChange = Math.floor(Math.random() * 50) + 20
      if (rand < 0.3) {
        outcome.loot = { name: 'Gemme', rarity: 'uncommon' }
      }
      break

    case 'herbalist':
      outcome.healing = Math.floor((character.maxHp || 100) * 0.3)
      break

    case 'shortcut':
      outcome.secret = 'Raccourci découvert! Le prochain voyage sera plus court.'
      break

    case 'rest_stop':
      outcome.healing = Math.floor((character.maxHp || 100) * 0.15)
      break

    case 'secret_cultist':
      outcome.choice = {
        options: [
          { id: 'join', text: 'Écouter le cultiste' },
          { id: 'fight', text: 'Combattre' },
          { id: 'flee', text: 'Fuir' }
        ]
      }
      break

    case 'ancient_guardian':
      outcome.damage = Math.floor((character.maxHp || 100) * 0.25)
      if (rand < 0.5) {
        outcome.loot = { name: 'Artefact ancien', rarity: 'rare' }
      }
      break

    case 'lost_caravan':
      outcome.goldChange = Math.floor(Math.random() * 100) + 50
      break

    default:
      outcome.damage = Math.floor((character.maxHp || 100) * 0.1)
  }

  return {
    eventId: event.id,
    type: event.type,
    text: event.text,
    outcome
  }
}

function selectTravelEvent(character: any, zone: ZoneNode | null): TravelEvent {
  const corruption = character.corruptionLevel || 0
  const fatigue = character.fatigue || 0
  const titles = JSON.parse(character.titles || '[]')

  let pool = [...TRAVEL_EVENTS]

  // Filter by requirements
  pool = pool.filter(e => {
    if (e.requirements?.minTravelTime && (!zone || (zone.travelTimeSeconds || 300) < e.requirements.minTravelTime)) return false
    if (e.requirements?.zoneHasCorruption && !zone?.hasCorruption) return false
    if (e.requirements?.minCorruption && corruption < e.requirements.minCorruption) return false
    return true
  })

  // Adjust weights by context
  const weights = pool.map(e => {
    let w = e.weight

    if (e.type === 'dangerous') {
      if (fatigue > 60) w *= 1.5
      if (corruption > 50) w *= 1.3
    }

    if (e.type === 'positive') {
      if (titles.includes('Voyageur Expérimenté')) w *= 1.3
    }

    if (e.type === 'rare' && corruption < 30) w *= 0.5

    return w
  })

  // Weighted random
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight

  for (let i = 0; i < pool.length; i++) {
    random -= weights[i]
    if (random <= 0) return pool[i]
  }

  return pool[0]
}

function calculateTravelSpeed(agility: number, mountBonus: number, titles: string[]): number {
  let speedPercent = 0

  const agilityBonus = Math.max(0, Math.floor((agility - 10) / 5))
  speedPercent += agilityBonus

  speedPercent += mountBonus

  if (titles.includes('Voyageur Expérimenté')) speedPercent += 10
  if (titles.includes('Coureur des Arènes')) speedPercent += 15
  if (titles.includes('Messager')) speedPercent += 20

  return speedPercent
}

function getDifficultyRisk(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 1
    case 'normal': return 2
    case 'hard': return 4
    case 'secret': return 6
    default: return 2
  }
}

function generateTravelAdvice(pathDetails: { risk: number }[], totalRisk: number, speedBonus: number): string {
  if (pathDetails.length === 0) {
    return 'Vous êtes déjà à destination.'
  }

  let advice = ''
  if (speedBonus > 20) {
    advice = 'Avec votre rapidité, le voyage sera bien plus court. '
  } else if (speedBonus > 10) {
    advice = 'Votre agilité vous permet de voyager plus vite. '
  }

  const hasDangerous = pathDetails.some(p => p.risk >= 4)
  const hasHard = pathDetails.some(p => p.risk >= 2)

  if (totalRisk >= 8) {
    return advice + 'Voyage dangereux! Apportez des potions et préparez-vous au combat.'
  }
  if (hasDangerous) {
    return advice + 'Traversez des zones dangereuses. Résistances recommandées.'
  }
  if (hasHard) {
    return advice + 'Voyage modérément risqué. Provisions conseillées.'
  }

  return advice + 'Voyage relativement sûr.'
}

function findPath(zones: ZoneNode[], startId: string, endId: string): ZoneNode[] {
  if (startId === endId) return [zones.find(z => z.id === startId)!]
  
  const visited = new Set<string>()
  const queue: { zone: ZoneNode; path: ZoneNode[] }[] = []
  
  const start = zones.find(z => z.id === startId)
  if (!start) return []
  
  queue.push({ zone: start, path: [start] })
  visited.add(startId)

  while (queue.length > 0) {
    const { zone, path } = queue.shift()!
    
    if (zone.id === endId) {
      return path
    }

    const neighbors = getZoneNeighbors(zones, zone)
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id)
        queue.push({ zone: neighbor, path: [...path, neighbor] })
      }
    }
  }

  return []
}

function getZoneNeighbors(zones: ZoneNode[], current: ZoneNode): ZoneNode[] {
  return zones.filter(z => {
    if (z.id === current.id) return false
    const distance = Math.sqrt(Math.pow(z.worldX - current.worldX, 2) + Math.pow(z.worldY - current.worldY, 2))
    return distance <= 2
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fromZone = searchParams.get('from')
    const toZone = searchParams.get('to')
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    let agility = 10
    let mountBonus = 0
    let titles: string[] = []

    if (token) {
      try {
        const session = await prisma.session.findUnique({
          where: { token },
          include: { user: true }
        })
        
        if (session && session.expiresAt > new Date()) {
          const character = await prisma.character.findUnique({
            where: { userId: session.userId },
            select: {
              baseAgility: true,
              agilityInvested: true,
              titles: true,
              currentMount: true,
              mountSpeedBonus: true
            }
          })

          if (character) {
            agility = (character.baseAgility || 10) + (character.agilityInvested || 0)
            titles = JSON.parse(character.titles || '[]')
            
            if (character.currentMount && character.currentMount !== 'none') {
              mountBonus = character.mountSpeedBonus || 0
            }
          }
        }
      } catch (e) {
        console.error('Error fetching character for travel:', e)
      }
    }

    const zones = await prisma.zone.findMany({
      select: {
        id: true,
        name: true,
        worldX: true,
        worldY: true,
        travelTimeSeconds: true,
        isHub: true,
        difficulty: true,
        baseDamageType: true,
        hasCorruption: true,
        trapDensity: true
      }
    })

    const cityZone: ZoneNode = {
      id: 'city',
      name: 'Cité des Arènes',
      worldX: 0,
      worldY: 0,
      travelTimeSeconds: 0,
      isHub: true,
      difficulty: 'hub',
      baseDamageType: 'physical',
      hasCorruption: false,
      trapDensity: 0
    }

    const allZones: ZoneNode[] = [cityZone, ...zones.map(z => ({
      id: z.id,
      name: z.name,
      worldX: z.worldX,
      worldY: z.worldY,
      travelTimeSeconds: z.travelTimeSeconds,
      isHub: z.isHub,
      difficulty: z.difficulty,
      baseDamageType: z.baseDamageType,
      hasCorruption: z.hasCorruption,
      trapDensity: z.trapDensity || 0
    }))]

    if (!fromZone || !toZone) {
      return NextResponse.json({
        zones: allZones.map(z => ({
          id: z.id,
          name: z.name,
          isHub: z.isHub,
          travelTimeSeconds: z.travelTimeSeconds,
          difficulty: z.difficulty,
          baseDamageType: z.baseDamageType,
          hasCorruption: z.hasCorruption,
          trapDensity: z.trapDensity || 0
        })),
        message: 'Specify ?from=zoneId&to=zoneId to calculate travel'
      })
    }

    const from = allZones.find(z => z.id === fromZone) || allZones.find(z => z.id === 'city')
    const to = allZones.find(z => z.id === toZone)

    if (!from || !to) {
      return NextResponse.json({ error: 'Zone invalide' }, { status: 400 })
    }

    const path = findPath(allZones, from.id, to.id)
    if (!path) {
      return NextResponse.json({ error: 'Aucun chemin trouvé' }, { status: 404 })
    }

    const speedBonusPercent = calculateTravelSpeed(agility, mountBonus, titles)
    const speedMultiplier = 1 - (speedBonusPercent / 100)

    const speedBonuses: { source: string; percent: number }[] = []
    
    const agilityBonus = Math.max(0, Math.floor((agility - 10) / 5))
    if (agilityBonus > 0) {
      speedBonuses.push({ source: 'Agilité', percent: agilityBonus })
    }
    if (mountBonus > 0) {
      speedBonuses.push({ source: 'Monture', percent: mountBonus })
    }
    titles.forEach(title => {
      if (title === 'Voyageur Expérimenté') speedBonuses.push({ source: 'Titre: Voyageur Expérimenté', percent: 10 })
      if (title === 'Coureur des Arènes') speedBonuses.push({ source: 'Titre: Coureur des Arènes', percent: 15 })
      if (title === 'Messager') speedBonuses.push({ source: 'Titre: Messager', percent: 20 })
    })

    let baseTotalTime = 0
    let totalRisk = 0
    const pathDetails: { zone: string; baseTime: number; adjustedTime: number; risk: number }[] = []

    for (let i = 0; i < path.length; i++) {
      const zone = path[i]
      
      let zoneTime = 0
      let zoneRisk = 0

      if (!zone.isHub) {
        zoneTime = zone.travelTimeSeconds || 300
        zoneRisk = getDifficultyRisk(zone.difficulty)
      }

      baseTotalTime += zoneTime
      totalRisk += zoneRisk

      if (!zone.isHub) {
        const adjustedTime = Math.round(zoneTime * speedMultiplier)
        pathDetails.push({
          zone: zone.name,
          baseTime: Math.round(zoneTime / 60),
          adjustedTime: Math.round(adjustedTime / 60),
          risk: zoneRisk
        })
      }
    }

    const adjustedTotalTime = Math.round(baseTotalTime * speedMultiplier)
    const ambushChance = Math.min(0.15, path.length * 0.03)
    const expectedDamage = Math.round(totalRisk * 10)

    const result: TravelCalculationResult = {
      from: from.name,
      to: to.name,
      path: pathDetails,
      baseTotalMinutes: Math.round(baseTotalTime / 60),
      adjustedTotalMinutes: Math.round(adjustedTotalTime / 60),
      totalRisk,
      ambushChance: Math.round(ambushChance * 100) + '%',
      expectedDamagePerAmbush: expectedDamage,
      speedBonus: speedBonuses,
      advice: generateTravelAdvice(pathDetails, totalRisk, speedBonusPercent)
    }

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Travel API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}

// POST: Generate travel events for a trip
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const { fromZone, toZone } = await request.json()

    if (!fromZone || !toZone) {
      return NextResponse.json({ error: 'Zones requises' }, { status: 400 })
    }

    let character = null

    if (token) {
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true }
      })

      if (session && session.expiresAt > new Date()) {
        character = await prisma.character.findUnique({
          where: { userId: session.userId }
        })
      }
    }

    const zones = await prisma.zone.findMany({
      select: {
        id: true,
        name: true,
        worldX: true,
        worldY: true,
        travelTimeSeconds: true,
        isHub: true,
        difficulty: true,
        baseDamageType: true,
        hasCorruption: true,
        trapDensity: true
      }
    })

    const cityZone: ZoneNode = {
      id: 'city',
      name: 'Cité des Arènes',
      worldX: 0,
      worldY: 0,
      travelTimeSeconds: 0,
      isHub: true,
      difficulty: 'hub',
      baseDamageType: 'physical',
      hasCorruption: false,
      trapDensity: 0
    }

    const allZones: ZoneNode[] = [cityZone, ...zones]
    const path = findPath(allZones, fromZone, toZone)

    if (!path || path.length === 0) {
      return NextResponse.json({ error: 'Aucun chemin trouvé' }, { status: 404 })
    }

    const totalTravelTime = path.reduce((sum, z) => sum + (z.travelTimeSeconds || 300), 0)
    const eventCount = Math.min(4, Math.floor(totalTravelTime / 180))

    const events: TravelEventOccurrence[] = []

    for (let i = 0; i < eventCount; i++) {
      const zoneIndex = Math.min(Math.floor((i + 1) / eventCount * path.length), path.length - 1)
      const zone = path[zoneIndex]

      const event = selectTravelEvent(character, zone)
      const occurrence = resolveEvent(event, character, zone)
      events.push(occurrence)

      if (character && occurrence.outcome.damage) {
        const currentHpValue: number = character.currentHp || 100
        const damageAmount: number = occurrence.outcome.damage
        const newHpValue: number = currentHpValue - damageAmount
        character = await prisma.character.update({
          where: { id: character.id },
          data: {
            currentHp: Math.max(0, newHpValue),
            corruptionLevel: Math.min(100, (character.corruptionLevel || 0) + (occurrence.outcome.corruption || 0))
          }
        })
      }
    }

    return NextResponse.json({
      events,
      summary: {
        totalEvents: events.length,
        dangerous: events.filter(e => e.type === 'dangerous').length,
        positive: events.filter(e => e.type === 'positive').length,
        neutral: events.filter(e => e.type === 'neutral').length,
        rare: events.filter(e => e.type === 'rare').length
      }
    })

  } catch (error: any) {
    console.error('Travel events API error:', error)
    return NextResponse.json(
      { error: `Erreur: ${error?.message || error}` },
      { status: 500 }
    )
  }
}
