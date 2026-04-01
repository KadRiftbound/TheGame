import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Curses and Blessings definitions
const CURSES: Record<string, {
  name: string
  description: string
  effect: Record<string, number>
  hint: string
}> = {
  weakness: {
    name: 'Faiblesse Acise',
    description: 'Votre corps est affaibli par une malédiction ancienne.',
    effect: { attack: -20, defense: -10 },
    hint: '"Vous sentez un froid glacial vous envahir..."'
  },
  hunger: {
    name: 'Faim Eternelle',
    description: 'La faim vous ronge. Vous ne pouvez pas heal naturellement.',
    effect: { healingReceived: -50, maxHp: -30 },
    hint: '"Votre estomac crie. Il n\'y a pas de nourriture ici."'
  },
  darkness: {
    name: 'Toucher des Ténèbres',
    description: 'Les ténèbres vous ont marqué. Vous voyez moins bien.',
    effect: { critChance: -15, dodge: -10 },
    hint: '"L\'obscurité vous suit. Elle vous connaît maintenant."'
  },
  greed: {
    name: 'Malediction de l\'Or',
    description: 'L\'or vous corrompt. Vous perdez de l\'or au combat.',
    effect: { goldFind: -50 },
    hint: '"L\'or brille. Puis il disparaît entre vos doigts."'
  },
  isolation: {
    name: 'Isolement',
    description: 'Vous êtes maudit. Les autres vous fuient.',
    effect: { guildBonus: -75, partyBonus: -50 },
    hint: '"Personne ne vous regarde. C\'est peut-être mieux ainsi."'
  }
}

const BLESSINGS: Record<string, {
  name: string
  description: string
  effect: Record<string, number>
  hint: string
  cost: number
}> = {
  strength: {
    name: 'Bénédiction de Force',
    description: 'Les dieux ont augmenté votre force.',
    effect: { attack: 15 },
    hint: '"Une chaleur divine envahit vos muscles."',
    cost: 1000
  },
  protection: {
    name: 'Bouclier Sacré',
    description: 'Une protection divine vous entoure.',
    effect: { defense: 15, damageReceived: -10 },
    hint: '"Vous sentez une présence protectrice."',
    cost: 1000
  },
  swiftness: {
    name: 'Grace du Vent',
    description: 'Le vent vous porte plus vite.',
    effect: { dodge: 15, agility: 10 },
    hint: '"Vos pas deviennent plus légers."',
    cost: 1200
  },
  fortune: {
    name: 'Faveur de Fortuna',
    description: 'La chance vous sourit.',
    effect: { luck: 20, critChance: 10 },
    hint: '"Les dés roulent en votre faveur."',
    cost: 1500
  },
  life: {
    name: 'Essence Vitale',
    description: 'Votre vie est prolongée.',
    effect: { maxHp: 50, healingReceived: 20 },
    hint: '"Votre cœur bat plus fort. Plus longtemps."',
    cost: 2000
  }
}

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
      where: { userId: session.userId }
    })

    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    const curses = JSON.parse(character.curses || '[]')
    const blessings = JSON.parse(character.blessings || '[]')

    // Get active curses and blessings
    const activeCurses = curses.map((c: string) => ({
      id: c,
      ...CURSES[c]
    })).filter((c: any) => c.name)

    const activeBlessings = blessings.map((b: string) => ({
      id: b,
      ...BLESSINGS[b]
    })).filter((b: any) => b.name)

    // Calculate combined effects
    const totalEffects: Record<string, number> = {}
    activeCurses.forEach((c: any) => {
      Object.entries(c.effect).forEach(([key, val]) => {
        totalEffects[key] = (totalEffects[key] || 0) + (val as number)
      })
    })
    activeBlessings.forEach((b: any) => {
      Object.entries(b.effect).forEach(([key, val]) => {
        totalEffects[key] = (totalEffects[key] || 0) + (val as number)
      })
    })

    // Get available curses/blessings (not yet active)
    const availableCurses = Object.entries(CURSES)
      .filter(([id]) => !curses.includes(id))
      .map(([id, data]) => ({ id, ...data }))

    const availableBlessings = Object.entries(BLESSINGS)
      .filter(([id]) => !blessings.includes(id))
      .map(([id, data]) => ({ id, ...data }))

    return NextResponse.json({
      activeCurses,
      activeBlessings,
      totalEffects,
      availableCurses,
      availableBlessings,
      gold: character.gold
    })
  } catch (error) {
    console.error('Fate error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du destin' },
      { status: 500 }
    )
  }
}

// POST - Gain or remove curse/blessing
export async function POST(request: NextRequest) {
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
      where: { userId: session.userId }
    })

    if (!character) {
      return NextResponse.json({ error: 'Personnage non trouvé' }, { status: 404 })
    }

    const { action, curseId, blessingId } = await request.json()
    const curses = JSON.parse(character.curses || '[]')
    const blessings = JSON.parse(character.blessings || '[]')

    // Gain a curse (usually from secret actions)
    if (action === 'gain_curse' && curseId) {
      if (curses.includes(curseId)) {
        return NextResponse.json({ error: 'Déjà maudit' }, { status: 400 })
      }
      
      curses.push(curseId)
      await prisma.character.update({
        where: { id: character.id },
        data: { curses: JSON.stringify(curses) }
      })

      const curse = CURSES[curseId]
      return NextResponse.json({
        success: true,
        message: curse ? `Vous êtes maudit: ${curse.name}` : 'Une force obscure vous envahit...',
        hint: curse?.hint || ''
      })
    }

    // Remove a curse (usually through a quest)
    if (action === 'remove_curse' && curseId) {
      const idx = curses.indexOf(curseId)
      if (idx === -1) {
        return NextResponse.json({ error: 'Pas maudit' }, { status: 400 })
      }
      
      curses.splice(idx, 1)
      await prisma.character.update({
        where: { id: character.id },
        data: { curses: JSON.stringify(curses) }
      })

      const curse = CURSES[curseId]
      return NextResponse.json({
        success: true,
        message: curse ? `La malédiction ${curse.name} a été levée!` : 'Les ténèbres se retirent...'
      })
    }

    // Gain a blessing (usually purchasable at temples)
    if (action === 'gain_blessing' && blessingId) {
      if (blessings.includes(blessingId)) {
        return NextResponse.json({ error: 'Déjà béni' }, { status: 400 })
      }
      
      const blessing = BLESSINGS[blessingId]
      if (!blessing) {
        return NextResponse.json({ error: 'Bénédiction non trouvée' }, { status: 404 })
      }
      
      if (character.gold < blessing.cost) {
        return NextResponse.json({ error: 'Or insuffisant' }, { status: 400 })
      }

      blessings.push(blessingId)
      await prisma.character.update({
        where: { id: character.id },
        data: { 
          curses: JSON.stringify(curses),
          gold: character.gold - blessing.cost
        }
      })

      return NextResponse.json({
        success: true,
        message: `Vous êtes béni: ${blessing.name}`,
        hint: blessing.hint
      })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    console.error('Fate action error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'action' },
      { status: 500 }
    )
  }
}
