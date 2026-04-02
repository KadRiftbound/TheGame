import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌲 Seed: Configuration des micro-zones')
  
  // Lister toutes les zones
  const zones = await prisma.zone.findMany({
    take: 10,
    select: { id: true, name: true }
  })
  
  console.log('Zones existantes:')
  zones.forEach(z => console.log(`  - ${z.name} (${z.id})`))
  
  if (zones.length === 0) {
    console.log('\nAucune zone!')
    return
  }
  
  // Prendre la première zone comme exemple
  const zone = zones[0]
  console.log(`\nUsing zone: ${zone.name}`)
  
  // Récupérer les micro-zones existantes
  const microZones = await prisma.microZone.findMany({
    where: { zoneId: zone.id },
    orderBy: { visitOrder: 'asc' }
  })
  
  console.log(`${microZones.length} micro-zones existantes`)
  
  if (microZones.length === 0) {
    console.log('Aucune micro-zone, création...')
    
    const mzData = [
      { name: 'Clairière d\'entrée', slug: 'entree', description: 'L\'entrée de la forêt, une clairière baignée de lumière.', type: 'forest', dangerLevel: 1, positionX: 0.5, positionY: 0.15, connections: '[]', enemyTypes: '["lapin","ecureuil"]', hasChest: false, hasSecret: false },
      { name: 'Bosquet ancien', slug: 'bosquet', description: 'Des arbres anciens projettent des ombres mystérieuses.', type: 'forest', dangerLevel: 2, positionX: 0.3, positionY: 0.35, connections: '[]', enemyTypes: '["loup","renard"]', hasChest: true, chestRarity: 'common', hasSecret: false },
      { name: 'Ruines oubliées', slug: 'ruines', description: 'Des anciennes ruines émergent de la végétation.', type: 'ruins', dangerLevel: 3, positionX: 0.7, positionY: 0.35, connections: '[]', enemyTypes: '["squelette","gobelin"]', hasChest: true, chestRarity: 'uncommon', hasSecret: true, secretType: 'hidden_room', secretHint: 'Examinez les murs...' },
      { name: 'Etang silencieux', slug: 'etang', description: 'Un étang paisible où les prédateurs se cachent.', type: 'forest', dangerLevel: 2, positionX: 0.4, positionY: 0.6, connections: '[]', enemyTypes: '["serpent","grenouille"]', hasChest: false, hasSecret: false },
      { name: 'Colline dominante', slug: 'colline', description: 'La colline offre une vue sur toute la région.', type: 'forest', dangerLevel: 4, positionX: 0.6, positionY: 0.75, connections: '[]', enemyTypes: '["loup_alpha","ours"]', hasChest: true, chestRarity: 'rare', hasSecret: false, canSpawnBoss: true, bossName: 'Garde ancien', bossLevel: 8, bossHp: 200, bossAttack: 25, bossDefense: 10 },
    ]
    
    for (let i = 0; i < mzData.length; i++) {
      const mz = mzData[i]
      await prisma.microZone.create({
        data: { ...mz, zoneId: zone.id, visitOrder: i }
      })
    }
  }
  
  // Mettre à jour les connexions
  const updatedMZ = await prisma.microZone.findMany({
    where: { zoneId: zone.id },
    orderBy: { visitOrder: 'asc' }
  })
  
  console.log('\nMise à jour des connexions...')
  
  // Connexions pour 5 micro-zones en ligne
  const connections = [
    ['2', '3'],
    ['1', '4'],
    ['1', '5'],
    ['2', '5'],
    ['3', '4']
  ]
  
  const positions = [
    { positionX: 0.5, positionY: 0.15 },
    { positionX: 0.25, positionY: 0.4 },
    { positionX: 0.75, positionY: 0.4 },
    { positionX: 0.35, positionY: 0.7 },
    { positionX: 0.65, positionY: 0.7 },
  ]
  
  for (let i = 0; i < updatedMZ.length; i++) {
    const mz = updatedMZ[i]
    // Récupérer les IDs des micro-zones connectées
    const connIds = connections[i]?.map(j => updatedMZ[parseInt(j)-1]?.id).filter(Boolean) || []
    
    await prisma.microZone.update({
      where: { id: mz.id },
      data: {
        connections: JSON.stringify(connIds),
        positionX: positions[i].positionX,
        positionY: positions[i].positionY,
        slug: `mz_${i+1}`
      }
    })
  }
  
  // Afficher le résultat
  const finalMZ = await prisma.microZone.findMany({
    where: { zoneId: zone.id },
    select: { id: true, name: true, positionX: true, positionY: true, connections: true }
  })
  
  console.log('\n✅ Micro-zones configurées:')
  finalMZ.forEach(mz => {
    const conns = JSON.parse(mz.connections)
    console.log(`  ${mz.name}: pos(${mz.positionX.toFixed(2)}, ${mz.positionY.toFixed(2)}) → ${conns.length} connexions`)
  })
  
  console.log('\nTerminé!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())