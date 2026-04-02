export interface CharacterTitleSnapshot {
  id: string
  level: number
  victories: number
  defeats: number
  gold: number
  bossKilled: number
  explorationsNoCombat: number
  secretChestsFound: number
  successfulSteals: number
  fledCombat: number
  deathsInSecretZone: number
  titles: string
}

export interface TitleDefinition {
  id: string
  name: string
  icon: string
  condition: (character: CharacterTitleSnapshot) => boolean
}

export const TITLE_DEFINITIONS: TitleDefinition[] = [
  { id: 'novice', name: 'Novice', condition: (c) => c.level >= 1, icon: '🌱' },
  { id: 'combatant', name: 'Combattant', condition: (c) => c.victories >= 5, icon: '⚔️' },
  { id: 'veteran', name: 'Vétéran', condition: (c) => c.victories >= 25, icon: '🛡️' },
  { id: 'habitant', name: 'Habitué', condition: (c) => c.victories >= 50, icon: '🎖️' },
  { id: 'gladiateur', name: 'Gladiateur', condition: (c) => c.victories >= 100, icon: '🏆' },
  { id: 'champion', name: 'Champion', condition: (c) => c.victories >= 250, icon: '👑' },
  { id: 'legende', name: 'Légende', condition: (c) => c.victories >= 500, icon: '⭐' },
  { id: 'level_10', name: 'Niv 10', condition: (c) => c.level >= 10, icon: '🔟' },
  { id: 'level_20', name: 'Niv 20', condition: (c) => c.level >= 20, icon: '2️⃣0️⃣' },
  { id: 'level_30', name: 'Niv 30', condition: (c) => c.level >= 30, icon: '3️⃣0️⃣' },
  { id: 'level_40', name: 'Niv 40', condition: (c) => c.level >= 40, icon: '4️⃣0️⃣' },
  { id: 'explorateur', name: 'Explorateur', condition: (c) => c.explorationsNoCombat >= 10, icon: '🗺️' },
  { id: 'chasseur', name: 'Chasseur', condition: (c) => c.bossKilled >= 1, icon: '💀' },
  { id: 'tueur', name: 'Tueur de Dragons', condition: (c) => c.bossKilled >= 5, icon: '🐉' },
  { id: 'riche', name: 'Riche', condition: (c) => c.gold >= 1000, icon: '💰' },
  { id: 'millionnaire', name: 'Millionnaire', condition: (c) => c.gold >= 10000, icon: '🪙' },
  { id: 'voleur', name: 'Voleur', condition: (c) => c.successfulSteals >= 10, icon: '🗝️' },
  { id: 'fuyard', name: 'Fuyard', condition: (c) => c.fledCombat >= 10, icon: '🏃' },
  { id: 'survivant', name: 'Survivant', condition: (c) => c.deathsInSecretZone >= 3, icon: '💀' },
  { id: 'collectionneur', name: 'Collectionneur', condition: (c) => c.secretChestsFound >= 5, icon: '📦' },
]

const LEGACY_TITLE_ID_MAP: Record<string, string> = {
  'm millionaire': 'millionnaire',
}

const VALID_TITLE_IDS = new Set(TITLE_DEFINITIONS.map((title) => title.id))

export function parseUnlockedTitleIds(rawTitles: string): string[] {
  try {
    const parsed = JSON.parse(rawTitles)
    if (!Array.isArray(parsed)) return []

    const normalized = parsed
      .filter((id): id is string => typeof id === 'string')
      .map((id) => LEGACY_TITLE_ID_MAP[id] ?? id)
      .filter((id) => VALID_TITLE_IDS.has(id))

    return [...new Set(normalized)]
  } catch {
    return []
  }
}

export function sortTitleIdsByDefinitionOrder(titleIds: string[]): string[] {
  const input = new Set(titleIds)
  return TITLE_DEFINITIONS.map((title) => title.id).filter((id) => input.has(id))
}
