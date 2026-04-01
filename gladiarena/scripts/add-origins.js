import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

const origins = [
  // === SURVIE / DÉBROUILLE ===
  { id: 'origin_orphelin', name: 'Orphelin des rues', description: "A appris à survivre dans l'ombre des ruelles", icon: '🏚️', bonuses: { goldBonus: 5, stealChance: 3 }, isSecret: false },
  { id: 'origin_chasseur', name: 'Chasseur solitaire', description: 'Vit de la terre et du gibier depuis toujours', icon: '🏕️', bonuses: { resourceBonus: 10 }, isSecret: false },
  { id: 'origin_prisonnier', name: 'Ancien prisonnier', description: 'A survécu dans les geôles pendant des années', icon: '⛓️', bonuses: { fatigueResist: 15 }, isSecret: false },
  { id: 'origin_naufrage', name: 'Naufragé', description: 'A débarqué sur ces rivages sans rien', icon: '🪵', bonuses: { allStatsStart: 5, corruptionResist: -5 }, isSecret: false },
  { id: 'origin_mendiant', name: 'Mendiant informateur', description: 'Connaît tous les ragots de la ville', icon: '🐀', bonuses: { secretChance: 5 }, isSecret: false },
  { id: 'origin_pilleur_tombes', name: 'Pillard de sépultures', description: 'A pillé les tombes pour survivre', icon: '🪦', bonuses: { chestLoot: 10, secretChance: -5 }, isSecret: false },

  // === COMBAT / VIOLENCE ===
  { id: 'origin_mercenaire', name: 'Mercenaire', description: 'A combattu pour quiconque payait', icon: '⚔️', bonuses: { damageBonus: 5, defense: 3 }, isSecret: false },
  { id: 'origin_gladiateur', name: 'Gladiateur en fuite', description: 'A survécu dans les.arènes sanglantes', icon: '🩸', bonuses: { bossDamage: 10, damageTaken: 10 }, isSecret: false },
  { id: 'origin_chasseur_primes', name: 'Chasseur de primes', description: 'Vit de la tête des monstres', icon: '💀', bonuses: { monsterXp: 5, monsterGold: 5 }, isSecret: false },
  { id: 'origin_soldat', name: 'Ancien soldat', description: 'Connaît les formations et la discipline', icon: '🛡️', bonuses: { lowHpDefense: 10 }, isSecret: false },
  { id: 'origin_bourreau', name: 'Bourreau', description: 'A exécuté des centaines de victimes', icon: '🪓', bonuses: { critDamage: 5, healingReceived: -5 }, isSecret: false },

  // === SAVOIR / EXPLORATION ===
  { id: 'origin_erudit', name: 'Érudit ruiné', description: 'A tout perdu en cherchant des connaissances', icon: '📜', bonuses: { secretChance: 10, critChance: 3 }, isSecret: false },
  { id: 'origin_cartographe', name: 'Cartographe maudit', description: 'A dessiné des lieux interdits', icon: '🗺️', bonuses: { zoneAccess: 10 }, isSecret: false },
  { id: 'origin_archeologue', name: 'Archéologue amateur', description: 'Cherche les antiquités perdues', icon: '🏺', bonuses: { lootQuality: 5, rareItemChance: 5 }, isSecret: false },
  { id: 'origin_voyageur', name: 'Voyageur des routes', description: 'A vu beaucoup de terres et de peuples', icon: '🧭', bonuses: { allResist: 5, damage: -5 }, isSecret: false },
  { id: 'origin_compteur', name: 'Compteur de morts', description: 'A enterré des centaines de victimes', icon: '⚰️', bonuses: { dungeonXp: 5, dungeonLoot: -5 }, isSecret: false },

  // === CORRUPTION / MYSTIQUE ===
  { id: 'origin_exorciste', name: 'Exorciste déchu', description: 'A touché des forces interdites', icon: '👁️', bonuses: { chaosDamage: 5, corruptionReceived: 5 }, isSecret: false },
  { id: 'origin_pretre', name: 'Prêtre défroqué', description: 'A fui le temple avant ses vœux', icon: '⛪', bonuses: { healingReceived: 5, corruptionReceived: 5 }, isSecret: false },
  { id: 'origin_marchand_ames', name: 'Marchand d\'âmes', description: 'A trafiqué avec les forces obscures', icon: '🕯️', bonuses: { goldAll: 5, corruptionReceived: 5 }, isSecret: false },
  { id: 'origin_volcan', name: 'Fils du volcan', description: 'A survécu à l\'éruption du Mont Cendré', icon: '🌋', bonuses: { fireResist: 20, healingReceived: -10 }, isSecret: false },
  { id: 'origin_ruines', name: 'Gardien des ruines', description: 'A veillé sur les morts oubliés', icon: '🏛️', bonuses: { corruptionResist: 10, damage: -5 }, isSecret: false },

  // === OPPORTUNISTES / RISK-REWARD ===
  { id: 'origin_parieur', name: 'Parieur pathologique', description: 'Risque tout pour gagner', icon: '🎰', bonuses: { lowHpGold: 15, healthAbove75Gold: -10 }, isSecret: false },
  { id: 'origin_pillard', name: 'Pillard opportuniste', description: 'Ne refuse jamais un coffre', icon: '💰', bonuses: { chestLoot: 20, monsterDamage: -5 }, isSecret: false },
  { id: 'origin_traitre', name: 'Traître en fuite', description: 'A trahi tout le monde', icon: '🗡️', bonuses: { stealChance: 10, corruptionReceived: 10 }, isSecret: false },
  { id: 'origin_reliques', name: 'Chasseur de reliques', description: 'Recherche les objets maudits', icon: '💎', bonuses: { legendaryChance: 10, corruptionReceived: 10 }, isSecret: false },
  { id: 'origin_esclave', name: 'Esclave fugitif', description: 'A échappé à l\'impossible', icon: '🏃', bonuses: { moveSpeed: 15, defense: -10 }, isSecret: false },

  // === ORIGINES DÉBLOCABLES ===
  { id: 'origin_roi_mort', name: 'Main du roi mort', description: 'A servi un monarque détrôné', icon: '👑', bonuses: { titleDamage: 15, corruptionReceived: 5 }, isSecret: true },
  { id: 'origin_destin', name: 'Fils du destin', description: 'Enfant né sous une étoile特殊的', icon: '⭐', bonuses: { allStatsLevel20: 20 }, isSecret: true },
  { id: 'origin_neant', name: 'Rescapé du néant', description: 'Est revenu de l\'au-delà', icon: '🌑', bonuses: { resurrection: 1, maxHp: -20 }, isSecret: true },
  { id: 'origin_espion', name: 'Espion impérial', description: 'Agent d\'un empire disparu', icon: '🎭', bonuses: { secretChance: 10, corruptionReceived: 10 }, isSecret: true },
  { id: 'origin_profondeurs', name: 'Ami des profondeurs', description: 'Adopté par les créatures des souterrains', icon: '🦂', bonuses: { dungeonHeal: 20, corruptionReceived: 10 }, isSecret: true },
  { id: 'origin_aube', name: 'Veilleur de l\'aube', description: 'Dernier gardien de la lumière', icon: '🌅', bonuses: { corruptionResist: 15, damage: -15 }, isSecret: true },
  { id: 'origin_heritier', name: 'Héritier maudit', description: 'Porte le sang de l\'ancienne dynastie', icon: '🩸', bonuses: { allResist: 10, corruptionReceived: 15 }, isSecret: true },
]

async function main() {
  console.log('🌱 Ajout des origines...\n')
  
  for (const origin of origins) {
    if (origin.isSecret) {
      console.log(`⏭️ Ignoré (secret): ${origin.name}`)
      continue
    }
    await prisma.origin.upsert({
      where: { id: origin.id },
      update: {
        name: origin.name,
        description: origin.description,
        icon: origin.icon,
        bonuses: JSON.stringify(origin.bonuses),
        isSecret: false
      },
      create: {
        id: origin.id,
        name: origin.name,
        description: origin.description,
        icon: origin.icon,
        bonuses: JSON.stringify(origin.bonuses),
        isSecret: false
      }
    })
    console.log(`✅ ${origin.name}`)
  }
  
  const count = await prisma.origin.count({ where: { isSecret: false } })
  console.log(`\n✨ ${count} origines disponibles à la création!`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())