import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Secret unlock conditions
const SECRET_CONDITIONS: Record<string, {
  hint: string
  check: (character: any) => { unlocked: boolean; progress: number; target: number }
}> = {
  danse_lame_neant: {
    hint: '"Celui qui meurt trois fois dans l\'ombre trouve la lumière noire"',
    check: (char) => ({
      unlocked: char.deathsInSecretZone >= 3 && char.secretFlags.includes('zone_ombre_visited'),
      progress: Math.min(char.deathsInSecretZone, 3),
      target: 3
    })
  },
  voleur_tempete: {
    hint: '"Les sacs les plus lourds attirent les griffes les plus rapides"',
    check: (char) => ({
      unlocked: char.gold >= 10000,
      progress: Math.min(char.gold, 10000),
      target: 10000
    })
  },
  pelgrin_cendres: {
    hint: '"Approche le volcan. Pas trop près. Mais pas trop loin non plus."',
    check: (char) => ({
      unlocked: char.explorationsNoCombat >= 5 && char.secretFlags.includes('volcan_explored_no_armor'),
      progress: char.explorationsNoCombat,
      target: 5
    })
  },
  oracle_aveugle: {
    hint: '"Refuse le premier conseil qu\'on te donne. Puis le deuxième. Le troisième, écoute-le."',
    check: (char) => ({
      unlocked: char.sacredChoicesRefused >= 2,
      progress: Math.min(char.sacredChoicesRefused, 2),
      target: 2
    })
  },
  necromancien_blanc: {
    hint: '"Seuls ceux qui ont touché la mort peuvent l\'appeler à revenir"',
    check: (char) => ({
      unlocked: char.deathsInSecretZone >= 5,
      progress: Math.min(char.deathsInSecretZone, 5),
      target: 5
    })
  },
  gardien_tombes: {
    hint: '"Dans le silence des tombeaux, seul le gardien entend les murmures"',
    check: (char) => ({
      unlocked: char.explorationsNoCombat >= 10 && char.secretFlags.includes('zone_tombe_explored'),
      progress: Math.min(char.explorationsNoCombat, 10),
      target: 10
    })
  },
  moine_fer: {
    hint: '"Combat sans armure dans la zone où l\'on meurt"',
    check: (char) => ({
      unlocked: char.explorationsNoCombat >= 3 && char.secretFlags.includes('no_armor_victory'),
      progress: Math.min(char.explorationsNoCombat, 3),
      target: 3
    })
  },
  // Unique classes
  heritier_dragon: {
    hint: '"L\'oeuf noir au fond du volcan. Personne ne l\'a jamais rapporté."',
    check: (char) => ({
      unlocked: char.secretFlags.includes('black_egg_found') && char.level >= 40,
      progress: char.secretFlags.includes('black_egg_found') ? 1 : 0,
      target: 1
    })
  },
  marcheur_ruines: {
    hint: '"Trouve ce que les autres ne cherchent pas"',
    check: (char) => ({
      unlocked: char.explorationsNoCombat >= 20 && char.secretFlags.includes('zone_ruines_explored'),
      progress: Math.min(char.explorationsNoCombat, 20),
      target: 20
    })
  },
  executeur: {
    hint: '"Tue celui qui ne le mérite pas. Puis tous ceux qui le méritent."',
    check: (char) => ({
      unlocked: char.betrayalsCommitted >= 5,
      progress: Math.min(char.betrayalsCommitted, 5),
      target: 5
    })
  },
  porteur_flamme: {
    hint: '"Dans les ténèbres absolues, rallume ce qui fut éteint"',
    check: (char) => ({
      unlocked: char.forbiddenKnowledge >= 10 && char.secretFlags.includes('first_flame_found'),
      progress: Math.min(char.forbiddenKnowledge, 10),
      target: 10
    })
  },
  tisseur_destins: {
    hint: '"Brise le fil. Tisse-en un nouveau. Les deux existent maintenant."',
    check: (char) => ({
      unlocked: char.secretFlags.includes('thread_broken') && char.secretFlags.includes('thread_woven'),
      progress: (char.secretFlags.includes('thread_broken') ? 1 : 0) + (char.secretFlags.includes('thread_woven') ? 1 : 0),
      target: 2
    })
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

    const secretFlags = JSON.parse(character.secretFlags || '[]')
    
    // Get all secret classes
    const secretClasses = await prisma.characterClass.findMany({
      where: { 
        isSecret: true,
        tier: { in: ['rare', 'unique'] }
      }
    })

    const secrets = secretClasses.map(cls => {
      const condition = SECRET_CONDITIONS[cls.id]
      if (!condition) {
        return {
          id: cls.id,
          name: cls.name,
          description: cls.description,
          tier: cls.tier,
          hint: cls.unlockHint,
          unlocked: false,
          progress: 0,
          target: 1
        }
      }
      
      const status = condition.check({ ...character, secretFlags })
      return {
        id: cls.id,
        name: cls.name,
        description: cls.description,
        tier: cls.tier,
        hint: status.unlocked ? cls.unlockHint : condition.hint,
        unlocked: status.unlocked,
        progress: status.progress,
        target: status.target
      }
    })

    // Get available advanced classes - only show compatible ones
    const baseClassId = character.classId
    const classPrereqs: Record<string, string[]> = {
      'guerrier': ['paladin', 'gardien'],
      'voleur': ['assassin', 'ranger'],
      'mage': ['sorcier', 'fleau'],
      'pretre': ['pretre_lumiere', 'pretre_ombre']
    }
    
    const allowedAdvanced = classPrereqs[baseClassId] || []
    
    const advancedClasses = await prisma.characterClass.findMany({
      where: { 
        tier: 'advanced',
        id: { in: allowedAdvanced }
      }
    })

    // Check if character can unlock advanced classes
    const canUnlockAdvanced = character.level >= 15

    // Get server unique items
    const serverUniques = await prisma.serverUniqueItem.findMany()

    // Get discovered secrets
    const discoveries = await prisma.discovery.findMany({
      where: { characterId: character.id }
    })

    return NextResponse.json({
      secrets,
      advancedClasses: advancedClasses.map(cls => ({
        id: cls.id,
        name: cls.name,
        description: cls.description,
        canUnlock: canUnlockAdvanced
      })),
      serverUniques: serverUniques.map(item => ({
        id: item.id,
        name: item.name,
        claimed: !!item.ownerId,
        claimedBy: item.ownerId
      })),
      discoveries: discoveries.map(d => ({
        type: d.type,
        discoveryId: d.discoveryId,
        name: d.name
      })),
      stats: {
        level: character.level,
        gold: character.gold,
        victories: character.victories,
        deaths: character.deathsInSecretZone,
        explorationsNoCombat: character.explorationsNoCombat,
        secretFlags
      }
    })
  } catch (error) {
    console.error('Secrets error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des secrets' },
      { status: 500 }
    )
  }
}

// POST - Attempt to unlock a secret
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

    const { action, classId } = await request.json()
    const secretFlags = JSON.parse(character.secretFlags || '[]')

    // Handle class unlock
    if (action === 'unlock_class' && classId) {
      const targetClass = await prisma.characterClass.findUnique({
        where: { id: classId }
      })

      if (!targetClass) {
        return NextResponse.json({ error: 'Classe non trouvée' }, { status: 404 })
      }

      const condition = SECRET_CONDITIONS[classId]
      if (!condition) {
        return NextResponse.json({ error: 'Cette classe n\'a pas de conditions cachées' }, { status: 400 })
      }

      const status = condition.check({ ...character, secretFlags })
      if (!status.unlocked) {
        return NextResponse.json({ 
          error: 'Conditions non remplies',
          hint: condition.hint,
          progress: status.progress,
          target: status.target
        }, { status: 403 })
      }

      // Check if class is unique and already taken
      if (targetClass.tier === 'unique') {
        const existingOwner = await prisma.character.findFirst({
          where: { classId: classId }
        })

        if (existingOwner) {
          return NextResponse.json({ error: 'Cette classe unique a déjà été réclamée' }, { status: 403 })
        }
      }

      // Unlock the class
      const updated = await prisma.character.update({
        where: { id: character.id },
        data: { classId: classId }
      })

      // Record discovery
      await prisma.discovery.create({
        data: {
          characterId: character.id,
          type: 'class',
          discoveryId: classId,
          name: targetClass.name,
          hint: targetClass.unlockHint
        }
      })

      return NextResponse.json({
        success: true,
        message: `Vous êtes maintenant un ${targetClass.name}!`,
        newClass: {
          id: targetClass.id,
          name: targetClass.name,
          description: targetClass.description,
          icon: targetClass.icon
        }
      })
    }

    // Handle advanced class unlock
    if (action === 'unlock_advanced' && classId) {
      if (character.level < 15) {
        return NextResponse.json({ error: 'Niveau 15 requis' }, { status: 403 })
      }

      const targetClass = await prisma.characterClass.findFirst({
        where: { id: classId, tier: 'advanced' }
      })

      if (!targetClass) {
        return NextResponse.json({ error: 'Classe avancée non trouvée' }, { status: 404 })
      }

      const updated = await prisma.character.update({
        where: { id: character.id },
        data: { classId: classId }
      })

      return NextResponse.json({
        success: true,
        message: `Vous êtes maintenant un ${targetClass.name}!`,
        newClass: {
          id: targetClass.id,
          name: targetClass.name,
          description: targetClass.description,
          icon: targetClass.icon
        }
      })
    }

    // Record a secret flag
    if (action === 'flag' && classId) {
      if (!secretFlags.includes(classId)) {
        secretFlags.push(classId)
        await prisma.character.update({
          where: { id: character.id },
          data: { secretFlags: JSON.stringify(secretFlags) }
        })
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    console.error('Secrets action error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'action secrète' },
      { status: 500 }
    )
  }
}
