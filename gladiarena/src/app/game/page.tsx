'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import WorldMap from '@/components/WorldMap'
import CityMap from '@/components/CityMap'
import ZoneMap from '@/components/ZoneMap'
import GameSocialPanel from '@/components/GameSocialPanel'

interface Item {
  id: string
  baseItemId: string
  rarityId: string
  finalStats: string
  itemLevel: number
  baseItem: { id: string; name: string; type: string }
  rarity: { id: string; name: string; color: string }
  prefix?: { id: string; name: string } | null
  suffix?: { id: string; name: string } | null
}

interface InventoryItem {
  id: string
  itemId: string
  slot: number
  quantity: number
  item: Item
}

interface Character {
  id: string
  name: string
  level: number
  xp: number
  xpToNextLevel: number
  currentHp: number
  maxHp: number
  gold: number
  unspentPoints: number
  corruptionLevel: number
  fatigue: number
  wounds: string
  currentZoneId?: string | null
  currentCityId?: string | null
  currentMount?: string | null
  mountSpeedBonus?: number
  equippedWeapon?: string | null
  equippedShield?: string | null
  equippedHelmet?: string | null
  equippedArmor?: string | null
  equippedLegs?: string | null
  equippedAccessory?: string | null
  class: { name: string; icon: string }
  stats: { force: number; agility: number; vitality: number; luck: number }
  inventory: InventoryItem[]
  titles?: string
}

interface CityData {
  playerCount: number
  cityName: string
  cityDescription: string
  zones: { 
    id: string; 
    name: string; 
    description: string;
    minLevel: number; 
    maxLevel: number; 
    difficulty: string; 
    isHidden: boolean;
    baseDamageType: string;
    environmentalHazard: boolean;
    hasCorruption: boolean;
    healAvailability: number;
    trapDensity: number;
    goldMultiplier: number;
    itemDropRate: number;
    xpMultiplier: number;
    travelTimeSeconds: number;
    worldX: number;
    worldY: number;
    isHub: boolean;
    nearestSafePoint: string | null;
    microZones?: { id: string; name: string; type: string; dangerLevel: number; rotationGroup: number }[];
    profile?: {
      riskScore: number
      dangers: string[]
      prepRecommendations: string[]
      healRating: string
      profileName: string
      badges: string[]
    }
  }[]
  merchants: { id: string; name: string; type: string; description: string; icon: string; inventory: any[] }[]
}

interface Zone {
  id: string
  name: string
  minLevel: number
  maxLevel: number
  difficulty: string
  description: string
  enemies?: any[]
  treasureChests?: any[]
  baseDamageType?: string
  environmentalHazard?: boolean
  hasCorruption?: boolean
  healAvailability?: number
  trapDensity?: number
  goldMultiplier?: number
  itemDropRate?: number
  xpMultiplier?: number
  travelTimeSeconds?: number
  isHub?: boolean
  nearestSafePoint?: string | null
  microZones?: { id: string; name: string; type: string; dangerLevel: number; rotationGroup: number }[]
  profile?: {
    riskScore: number
    dangers: string[]
    prepRecommendations: string[]
    healRating: string
    profileName: string
    badges: string[]
  }
}

interface CombatResult {
  victory: boolean
  replay: any[]
  rewards: { xp: number; gold: number; leveledUp: boolean; items?: any[] }
  character: Character
}

interface Quest {
  id: string
  name: string
  description: string
  type: string
  conditions: any
  rewards: any
  progress: { currentProgress: number; target: number; completed: boolean; claimed: boolean } | null
}

export default function GamePage() {
  const [character, setCharacter] = useState<Character | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [quests, setQuests] = useState<Quest[]>([])
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [combatResult, setCombatResult] = useState<CombatResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [combatLoading, setCombatLoading] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'city' | 'fight' | 'explore' | 'dungeon' | 'inventory' | 'equipment' | 'quests' | 'craft' | 'achievements' | 'destiny' | 'titles' | 'chronicles' | 'factions' | 'bounties' | 'stats'>('city')
  const [craftingRecipes, setCraftingRecipes] = useState<any[]>([])
  const [crafting, setCrafting] = useState(false)
  const [selectedEnemy, setSelectedEnemy] = useState<any>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [secrets, setSecrets] = useState<any[]>([])
  const [fate, setFate] = useState<any>(null)
  const [mapMode, setMapMode] = useState<'city' | 'world'>('world')
  const [cityLayer, setCityLayer] = useState<'hub' | 'travel'>('hub')
  const [selectedPOI, setSelectedPOI] = useState<any>(null)
  const [advancedClasses, setAdvancedClasses] = useState<any[]>([])
  const [serverUniques, setServerUniques] = useState<any[]>([])
  const [expandedZone, setExpandedZone] = useState<string | null>(null)
  const [cityData, setCityData] = useState<CityData | null>(null)
  const [titles, setTitles] = useState<any[]>([])
  const [allTitles, setAllTitles] = useState<any[]>([])
  const [chronicles, setChronicles] = useState<any[]>([])
  const [factions, setFactions] = useState<any[]>([])
  const [bounties, setBounties] = useState<any[]>([])
  const [playerStats, setPlayerStats] = useState<any>(null)
  const [microZones, setMicroZones] = useState<any[]>([])
  const [exploringZone, setExploringZone] = useState<any>(null)
  const [currentMicroZone, setCurrentMicroZone] = useState<any>(null)
  const [isLocalTraveling, setIsLocalTraveling] = useState(false)
  const [localTravelProgress, setLocalTravelProgress] = useState(0)
  const [localTravelTarget, setLocalTravelTarget] = useState<any>(null)
  const [localTravelStartTime, setLocalTravelStartTime] = useState(0)
  const [localTravelDuration, setLocalTravelDuration] = useState(0)
  const [dungeons, setDungeons] = useState<any[]>([])
  const [selectedDungeon, setSelectedDungeon] = useState<any>(null)
  const [dungeonState, setDungeonState] = useState<any>(null)
  const [inDungeon, setInDungeon] = useState(false)
  const [isTraveling, setIsTraveling] = useState(false)
  const [travelProgress, setTravelProgress] = useState(0)
  const [travelingToZone, setTravelingToZone] = useState<any>(null)
  const [travelStartTime, setTravelStartTime] = useState(0)
  const [travelDuration, setTravelDuration] = useState(0)
  const [isReturningFromDeath, setIsReturningFromDeath] = useState(false)
  const router = useRouter()

  const fetchQuests = async (token: string) => {
    try {
      const res = await fetch('/api/quests', { headers: { 'Authorization': `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setQuests(data.quests || [])
      }
    } catch (err) { console.error('Failed to fetch quests:', err) }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }

    fetch('/api/character', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        console.log('Character API response:', data)
        if (!data.character) { 
          router.push('/auth/register'); 
          return 
        }
        setCharacter(data.character)
      })
      .catch(err => {
        console.error('Character fetch error:', err)
        router.push('/auth/login')
      })

    fetch('/api/zones').then(res => res.json()).then(data => setZones(data.zones || []))
    fetch('/api/city').then(res => res.json()).then(data => setCityData(data))
    fetch('/api/quests', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => setQuests(data.quests || [])).catch(() => {})
    fetch('/api/titles', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => {
      setTitles(data.titles || [])
      setAllTitles(data.allTitles || [])
    }).catch(() => {})
    fetch('/api/chronicles').then(res => res.json()).then(data => setChronicles(data.records || [])).catch(() => {})
    fetch('/api/factions', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => setFactions(data.factions || [])).catch(() => {})
    fetch('/api/bounties').then(res => res.json()).then(data => setBounties(data.bounties || [])).catch(() => {})
    fetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => setPlayerStats(data.stats || null)).catch(() => {})
    
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (activeTab === 'craft') {
      const token = localStorage.getItem('token')
      if (token) {
        fetch('/api/crafting', { headers: { 'Authorization': `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => setCraftingRecipes(data.recipes || []))
      }
    }
    if (activeTab === 'achievements') {
      const token = localStorage.getItem('token')
      if (token) {
        fetch('/api/achievements', { headers: { 'Authorization': `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => setAchievements(data.achievements || []))
      }
    }
    if (activeTab === 'destiny') {
      const token = localStorage.getItem('token')
      if (token) {
        Promise.all([
          fetch('/api/secrets', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
          fetch('/api/fate', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json())
        ]).then(([secretsData, fateData]) => {
          setSecrets(secretsData.secrets || [])
          setAdvancedClasses(secretsData.advancedClasses || [])
          setServerUniques(secretsData.serverUniques || [])
          setFate(fateData)
        })
      }
    }
    if (activeTab === 'titles') {
      const token = localStorage.getItem('token')
      if (token) {
        fetch('/api/titles', { headers: { 'Authorization': `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => {
            setTitles(data.titles || [])
            setAllTitles(data.allTitles || [])
          })
      }
    }
    if (activeTab === 'chronicles') {
      fetch('/api/chronicles')
        .then(res => res.json())
        .then(data => setChronicles(data.records || []))
    }
    if (activeTab === 'factions') {
      const token = localStorage.getItem('token')
      if (token) {
        fetch('/api/factions', { headers: { 'Authorization': `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => setFactions(data.factions || []))
      }
    }
    if (activeTab === 'bounties') {
      fetch('/api/bounties')
        .then(res => res.json())
        .then(data => setBounties(data.bounties || []))
    }
    if (activeTab === 'stats') {
      const token = localStorage.getItem('token')
      if (token) {
        fetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` } })
          .then(res => res.json())
          .then(data => setPlayerStats(data.stats))
      }
    }
  }, [activeTab])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  // Travel timer effect
  useEffect(() => {
    if (!isTraveling) return
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - travelStartTime
      const progress = Math.min(elapsed / travelDuration, 1)
      setTravelProgress(progress)
      
      if (progress >= 1) {
        setIsTraveling(false)
        setIsReturningFromDeath(false)
        setActiveTab('fight')
        setTravelingToZone(null)
        setTravelProgress(0)
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [isTraveling, travelStartTime, travelDuration])

  // Local travel timer effect
  useEffect(() => {
    if (!isLocalTraveling) return
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - localTravelStartTime
      const progress = Math.min(elapsed / localTravelDuration, 1)
      setLocalTravelProgress(progress)
      
      if (progress >= 1) {
        setIsLocalTraveling(false)
        setCurrentMicroZone(localTravelTarget)
        setLocalTravelTarget(null)
        setLocalTravelProgress(0)
        // Rafraîchir les données de la zone
        handleExplore(exploringZone)
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [isLocalTraveling, localTravelStartTime, localTravelDuration, localTravelTarget, exploringZone])

  const handleCombat = async (zone: Zone) => {
    const token = localStorage.getItem('token')
    if (!token || !character) return

    setSelectedZone(zone)
    setCombatLoading(true)
    setCombatResult(null)

    try {
      const res = await fetch('/api/combat/expedition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ zoneId: zone.id })
      })

const data = await res.json()
        if (res.ok) {
          setCombatResult(data)
          setCharacter(data.character)
          fetchQuests(token)
          fetch('/api/chronicles').then(res => res.json()).then(d => setChronicles(d.records || [])).catch(() => {})
        }
    } catch (err) { console.error('Combat error:', err) }
    finally { setCombatLoading(false) }
  }

  const handleEquip = async (inventoryItemId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ inventoryItemId, action: 'equip' })
      })
      if (res.ok) {
        const data = await res.json()
        setCharacter(data.character)
      }
    } catch (err) { console.error('Equip error:', err) }
  }

  const handleUnequip = async (inventoryItemId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ inventoryItemId, action: 'unequip' })
      })
      if (res.ok) {
        const data = await res.json()
        setCharacter(data.character)
      }
    } catch (err) { console.error('Unequip error:', err) }
  }

  const handleSell = async (inventoryItemId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch('/api/inventory/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ inventoryItemId })
      })
      if (res.ok) {
        const data = await res.json()
        setCharacter(data.character)
      }
    } catch (err) { console.error('Sell error:', err) }
  }

  const handleExplore = async (zone: any) => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    try {
      const res = await fetch(`/api/explore/zones?zoneId=${zone.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setExploringZone(zone)
        setMicroZones(data.microZones || [])
        // Set first micro-zone as current when entering a zone
        if (data.microZones && data.microZones.length > 0) {
          setCurrentMicroZone(data.microZones[0])
        }
      }
    } catch (err) { console.error('Explore error:', err) }
  }

  const handleVisitMicroZone = async (microZone: any, action: string = 'explore') => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    try {
      const res = await fetch('/api/explore/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ microZoneId: microZone.id, action })
      })
      const data = await res.json()
      if (res.ok) {
        if (data.encounter?.type === 'combat') {
          alert(`Rencontre: ${data.encounter.enemy.name} (Nv. ${data.encounter.enemy.level})`)
        }
        if (data.secret?.discovered) {
          alert(`Secret découvert: ${microZone.name}!`)
        }
        if (data.chest?.opened) {
          alert(`Coffre ouvert: +${data.chest.goldReward} gold!`)
        }
        handleExplore(exploringZone)
      }
    } catch (err) { console.error('Visit error:', err) }
  }

  const handleEnterDungeon = async (dungeon: any) => {
    const token = localStorage.getItem('token')
    if (!token) return
    
    try {
      const res = await fetch('/api/dungeon', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setDungeons(data.dungeons || [])
      }
    } catch (err) { console.error('Dungeon fetch error:', err) }
    
    const res = await fetch('/api/dungeon/progression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ dungeonId: dungeon.id, action: 'enter' })
    })
    const data = await res.json()
    if (res.ok) {
      setSelectedDungeon(dungeon)
      setInDungeon(true)
      if (data.room) {
        setDungeonState({ currentRoom: data.room, message: data.message })
      }
    }
  }

  const handleDungeonProgress = async (choice?: string) => {
    const token = localStorage.getItem('token')
    if (!token || !selectedDungeon) return
    
    const res = await fetch('/api/dungeon/progression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ dungeonId: selectedDungeon.id, action: 'progress', choice })
    })
    const data = await res.json()
    if (res.ok) {
      if (data.room) {
        setDungeonState({ currentRoom: data.room, bossInfo: data.bossInfo })
      }
      if (data.complete) {
        alert(`Donjon terminé! Récompenses: ${data.rewards.gold} gold, ${data.rewards.xp} XP`)
        setInDungeon(false)
        setSelectedDungeon(null)
      }
    }
  }

  const handleDungeonLeave = async () => {
    const token = localStorage.getItem('token')
    if (!token || !selectedDungeon) return
    
    const res = await fetch('/api/dungeon/progression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ dungeonId: selectedDungeon.id, action: 'leave' })
    })
    if (res.ok) {
      setInDungeon(false)
      setSelectedDungeon(null)
      setDungeonState(null)
    }
  }

  const handleDungeonRest = async () => {
    const token = localStorage.getItem('token')
    if (!token || !selectedDungeon) return
    
    const res = await fetch('/api/dungeon/progression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ dungeonId: selectedDungeon.id, action: 'rest' })
    })
    const data = await res.json()
    if (res.ok) {
      alert(`Repos: +${data.healAmount} HP (${data.newHp}/${data.maxHp})`)
      fetch('/api/character', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => r.json())
        .then(c => setCharacter(c.character))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-amber-500 text-2xl animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (!character) return null

  const hpPercent = (character.currentHp / character.maxHp) * 100
  const xpPercent = (character.xp / character.xpToNextLevel) * 100

  const getItemDisplayName = (item: Item) => {
    const prefix = item.prefix?.name || ''
    const baseName = item.baseItem.name
    const suffix = item.suffix?.name || ''
    return `${prefix} ${baseName} ${suffix}`.trim()
  }

  const equippedItems = character.inventory?.filter((i: any) => i.slot < 0) || []
  const getEquippedInSlot = (slotType: string) => {
    const slotKey = `equipped${slotType.charAt(0).toUpperCase() + slotType.slice(1)}` as keyof Character
    const equippedItemId = character[slotKey] as string | null
    return character.inventory?.find(i => i.itemId === equippedItemId)
  }

  const getMerchantItems = (poiId: string) => {
    const merchantsData: Record<string, any[]> = {
      'taverne': [
        { id: '1', name: 'Potion de Soin', desc: 'Restaure 50 HP', cost: 50 },
        { id: '2', name: 'Potion dexp', desc: '+100 XP', cost: 100 },
        { id: '3', name: 'Rations', desc: 'Nourriture pour monture', cost: 25 },
      ],
      'forgeron': [
        { id: '4', name: 'Épée en Fer', desc: 'Attaque +5', cost: 200 },
        { id: '5', name: 'Bouclier Bois', desc: 'Défense +3', cost: 150 },
        { id: '6', name: 'Casque Cuir', desc: 'Défense +2', cost: 100 },
      ],
      'apothicaire': [
        { id: '7', name: 'Antidote', desc: 'Guérit poison', cost: 75 },
        { id: '8', name: 'Potion Force', desc: '+10% force 5min', cost: 150 },
        { id: '9', name: 'Herbe Médicinale', desc: 'Soin +25', cost: 30 },
      ],
      'marchand': [
        { id: '10', name: 'Gemme', desc: 'Objet rare', cost: 500 },
        { id: '11', name: 'Carte', desc: 'Révele zone', cost: 300 },
        { id: '12', name: 'Coffre', desc: 'Objet aléatoire', cost: 250 },
      ],
    }
    return merchantsData[poiId] || []
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{character.class.icon}</div>
          <div>
            <div className="font-bold">{character.name}</div>
            <div className="text-amber-400 text-xs">Nv. {character.level} • {character.class.name}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span>❤️</span>
            <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 transition-all" style={{ width: `${hpPercent}%` }} />
            </div>
            <span className="text-gray-400">{character.currentHp}/{character.maxHp}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span>⭐</span>
            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${xpPercent}%` }} />
            </div>
            <span className="text-gray-400">{character.xp}/{character.xpToNextLevel}</span>
          </div>
          
          <div className="text-yellow-400 font-bold">💰 {character.gold}</div>
          
          {character.currentMount && character.currentMount !== 'none' && (
            <div className="text-blue-400 text-sm flex items-center gap-1">
              🐎 {character.currentMount === 'horse' ? 'Cheval' : 
                 character.currentMount === 'raptor' ? 'Raptor' :
                 character.currentMount === 'wyvern' ? 'Wyvern' :
                 character.currentMount === 'griffon' ? 'Griffon' :
                 character.currentMount === 'drake' ? 'Drake' : character.currentMount}
              <span className="text-xs text-green-400">+{character.mountSpeedBonus}%</span>
            </div>
          )}
          
          {character.unspentPoints > 0 && (
            <button onClick={() => setShowStatsModal(true)} className="px-3 py-1 bg-amber-600 hover:bg-amber-500 rounded font-bold text-sm">
              +{character.unspentPoints}
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => router.push('/profile')} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm">Profil</button>
          <button onClick={handleLogout} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm">Déconnexion</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Navigation */}
        <div className="w-64 bg-gray-900/50 border-r border-gray-800 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('city')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'city' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">🏰</span>
              <span>Cité</span>
              {cityData && cityData.playerCount > 0 && (
                <span className="ml-auto text-xs text-green-400">{cityData.playerCount}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'explore' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">🧭</span>
              <span>Explorer</span>
            </button>
            <button
              onClick={() => setActiveTab('dungeon')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'dungeon' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">🏭</span>
              <span>Donjons</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'inventory' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">🎒</span>
              <span>Inventaire</span>
              <span className="ml-auto bg-gray-700 px-2 py-0.5 rounded text-xs">{character.inventory?.filter((i: any) => i.slot >= 0).length || 0}</span>
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'equipment' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">🛡️</span>
              <span>Équipement</span>
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'quests' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">📜</span>
              <span>Quêtes</span>
              {quests.filter(q => q.progress?.completed && !q.progress?.claimed).length > 0 && (
                <span className="ml-auto bg-green-600 px-2 py-0.5 rounded text-xs animate-pulse">
                  {quests.filter(q => q.progress?.completed && !q.progress?.claimed).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('craft')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'craft' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">🔨</span>
              <span>Crafting</span>
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'achievements' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">🏅</span>
              <span>Succès</span>
              {achievements.filter(a => a.earned).length > 0 && (
                <span className="ml-auto bg-yellow-600 px-2 py-0.5 rounded text-xs">
                  {achievements.filter(a => a.earned).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('destiny')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'destiny' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">✨</span>
              <span>Destin</span>
              {secrets.filter(s => s.unlocked).length > 0 && (
                <span className="ml-auto bg-purple-600 px-2 py-0.5 rounded text-xs">
                  {secrets.filter(s => s.unlocked).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('titles')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'titles' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">🏆</span>
              <span>Titres</span>
              {titles.length > 0 && (
                <span className="ml-auto bg-amber-600 px-2 py-0.5 rounded text-xs">
                  {titles.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('chronicles')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'chronicles' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">📜</span>
              <span>Chroniques</span>
              {chronicles.length > 0 && (
                <span className="ml-auto bg-amber-600 px-2 py-0.5 rounded text-xs">
                  {chronicles.length}
                </span>
              )}
            </button>
<button
              onClick={() => setActiveTab('factions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'factions' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">⚔️</span>
              <span>Factions</span>
              {factions.filter(f => f.characterReputation > 0).length > 0 && (
                <span className="ml-auto bg-green-600 px-2 py-0.5 rounded text-xs">
                  {factions.filter(f => f.characterReputation > 0).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('bounties')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'bounties' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">💰</span>
              <span>Primes</span>
              {bounties.length > 0 && (
                <span className="ml-auto bg-red-600 px-2 py-0.5 rounded text-xs">
                  {bounties.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'stats' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">📊</span>
              <span>Stats</span>
            </button>
          </nav>
        </div>

        {/* Main Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          {/* City Tab - Map as dominant, contextual merchants */}
          {activeTab === 'city' && (
            <div className="h-full flex flex-col">
              {/* Minimal header - tooltip style */}
              <div className="mb-4 flex items-center justify-between px-4">
                <div>
                  <h1 className="text-2xl font-bold text-amber-400">{cityData?.cityName || 'Bastion de Fer'}</h1>
                  <p className="text-xs text-gray-500">{cityData?.playerCount || 0} joueurs en ligne</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setCityLayer('hub'); setMapMode('city') }}
                    className={`px-3 py-1 rounded text-sm font-bold ${cityLayer === 'hub' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                  >
                    🏰 Cité
                  </button>
                  <button
                    onClick={() => { setCityLayer('travel'); setMapMode('world'); setActiveTab('explore') }}
                    className={`px-3 py-1 rounded text-sm font-bold ${cityLayer === 'travel' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                  >
                    🗺️ Zones
                  </button>
                </div>
              </div>

              {/* MAP - Full space, dominant visual */}
              <div className="flex-1 p-4 pt-0">
                {cityLayer === 'travel' ? (
                  <WorldMap 
                    zones={cityData?.zones?.map(z => ({
                      id: z.id,
                      name: z.name,
                      slug: z.id,
                      minLevel: z.minLevel,
                      maxLevel: z.maxLevel,
                      difficulty: z.difficulty,
                      description: z.description,
                      worldX: z.worldX || 0,
                      worldY: z.worldY || 0
                    })) || []}
                    onSelectZone={(zone) => {
                      const found = cityData?.zones?.find(z => z.id === zone.id)
                      if (found) {
                        // Distance-based travel time (max 40s)
                        const cityX = 50, cityY = 80
                        const zoneX = found.worldX || 50
                        const zoneY = found.worldY || 50
                        const distance = Math.sqrt(Math.pow(zoneX - cityX, 2) + Math.pow(zoneY - cityY, 2))
                        const maxDistance = 100
                        const travelTime = Math.max(10000, Math.min(40000, Math.round((distance / maxDistance) * 40000)))
                        setTravelingToZone(found)
                        setTravelDuration(travelTime)
                        setTravelStartTime(Date.now())
                        setIsTraveling(true)
                        setTravelProgress(0)
                      }
                    }}
                  />
                ) : (
                  <CityMap 
                    cityName={cityData?.cityName || 'Bastion de Fer'}
                    pois={[
                      { id: 'taverne', name: 'La Taverne du Coin', type: 'merchant', x: 30, y: 45, description: 'Un endroit chaleureux pour se reposer' },
                      { id: 'forgeron', name: 'La Forge du Seuil', type: 'merchant', x: 65, y: 35, description: 'Armes et armures' },
                      { id: 'apothicaire', name: "L'Apothicaire", type: 'merchant', x: 45, y: 65, description: 'Potions et remèdes' },
                      { id: 'marchand', name: 'Le Grand Marché', type: 'merchant', x: 75, y: 60, description: 'Articles divers' },
                    ]}
                    onSelectPOI={(poi) => {
                      if (poi.type === 'merchant') {
                        setSelectedPOI(poi)
                      } else {
                        alert(`${poi.name}: ${poi.description}`)
                      }
                    }}
                  />
                )}
              </div>

              {/* Contextual merchants panel - only when POI clicked */}
              {cityLayer === 'hub' && selectedPOI && (
                <div className="p-4 pt-0">
                  <div className="p-4 bg-gray-900/90 rounded-xl border border-amber-600/50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-amber-400 text-lg">{selectedPOI.name}</h3>
                      <button onClick={() => setSelectedPOI(null)} className="text-gray-500 hover:text-white">✕</button>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">{selectedPOI.description}</p>
                    <div className="space-y-2">
                      {getMerchantItems(selectedPOI.id).map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-800/80 rounded p-2">
                          <div>
                            <div className="font-bold text-amber-400">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.desc}</div>
                          </div>
                          <button className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-sm font-bold">
                            {item.cost} 💰
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fight Tab (Zone View) */}
          {activeTab === 'fight' && (
            <div className="max-w-4xl mx-auto">
              {/* Quick Stats */}
              <div className="mb-6 bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{character.class.icon}</span>
                      <div>
                        <div className="font-bold">{character.name}</div>
                        <div className="text-amber-400 text-sm">Niveau {character.level}</div>
                        {character.corruptionLevel > 0 && (
                          <div className="text-xs text-red-400">🔮 Corruption: {character.corruptionLevel}%</div>
                        )}
                        {character.fatigue > 50 && (
                          <div className="text-xs text-yellow-400">😫 Fatigue: {character.fatigue}%</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-red-400">❤️</span>
                      <span className="text-sm mr-1">{character.currentHp}/{character.maxHp}</span>
                      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 transition-all" style={{ width: `${hpPercent}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(character.currentHp < character.maxHp || character.corruptionLevel > 0 || character.fatigue > 0) && (
                      <button 
                        onClick={async () => {
                          const token = localStorage.getItem('token')
                          if (!token) return
                          const res = await fetch('/api/heal', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ action: 'heal' })
                          })
                          if (res.ok) {
                            const data = await res.json()
                            alert(data.message)
                            fetch('/api/character', { headers: { 'Authorization': `Bearer ${token}` } })
                              .then(r => r.json())
                              .then(c => setCharacter(c.character))
                          }
                        }}
                        className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded-lg text-sm font-bold transition"
                      >
                        Soin gratuit
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-4 text-gray-300">🚩 Zones d'Aventure</h2>
               
              {/* Return to City Button */}
              <div className="mb-4 flex justify-end">
                <button 
                  onClick={async () => {
                    const token = localStorage.getItem('token')
                    if (!token) return
                    const zone = zones.find(z => z.id === character.currentZoneId)
                    const time = (zone?.travelTimeSeconds || 180) * 1000
                    setIsTraveling(true)
                    setTravelDuration(time)
                    setTravelStartTime(Date.now())
                    setTravelingToZone(null)
                    setTravelProgress(0)
                    await fetch('/api/travel', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ action: 'return_to_city' })
                    })
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold"
                >
                  🏰 Retour à la Cité
                </button>
              </div>
               
              {/* Zones Grid - Arena Style */}
              <div className="space-y-3">
                {zones.map(zone => {
                  // All zones accessible - danger is real, not level-locked
                  const canEnter = true
                  const isNext = zones.filter(z => character.level >= z.minLevel).length === zones.indexOf(zone) + 1
                  const hasHighRisk = zone.profile && zone.profile.riskScore >= 7
                  const hasMediumRisk = zone.profile && zone.profile.riskScore >= 4
                  
                  return (
                    <div
                      key={zone.id}
                      className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                        hasHighRisk 
                          ? 'border-red-800/70 bg-gradient-to-r from-red-950/30 to-gray-900 hover:border-red-600 cursor-pointer' 
                          : hasMediumRisk
                            ? 'border-orange-700/70 bg-gradient-to-r from-orange-950/20 to-gray-900 hover:border-orange-500 cursor-pointer'
                            : canEnter 
                              ? isNext
                                ? 'border-amber-500/70 bg-gradient-to-r from-amber-900/30 to-gray-900 hover:border-amber-400 cursor-pointer' 
                                : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 cursor-pointer'
                              : 'border-gray-800 bg-gray-900/30 opacity-60 cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (!combatLoading) {
                          setExpandedZone(expandedZone === zone.id ? null : zone.id)
                        }
                      }}
                    >
                      <div className="flex items-center p-4">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mr-4 ${
                          zone.difficulty === 'easy' ? 'bg-green-900/50' :
                          zone.difficulty === 'normal' ? 'bg-yellow-900/50' :
                          zone.difficulty === 'hard' ? 'bg-red-900/50' :
                          'bg-purple-900/50'
                        }`}>
                          {zone.difficulty === 'easy' ? '🌿' :
                           zone.difficulty === 'normal' ? '⚔️' :
                           zone.difficulty === 'hard' ? '💀' : '🔮'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg">{zone.name}</h3>
                            {zone.profile?.profileName && (
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                                {zone.profile.profileName}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              zone.difficulty === 'easy' ? 'bg-green-900/50 text-green-300' :
                              zone.difficulty === 'normal' ? 'bg-yellow-900/50 text-yellow-300' :
                              zone.difficulty === 'hard' ? 'bg-red-900/50 text-red-300' :
                              'bg-purple-900/50 text-purple-300'
                            }`}>
                              {zone.difficulty === 'easy' ? 'Facile' :
                               zone.difficulty === 'normal' ? 'Normal' :
                               zone.difficulty === 'hard' ? 'Difficile' : 'Secret'}
                            </span>
                            {zone.profile && (
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                zone.profile.riskScore >= 7 ? 'bg-red-900/70 text-red-300' :
                                zone.profile.riskScore >= 4 ? 'bg-orange-900/70 text-orange-300' :
                                'bg-green-900/70 text-green-300'
                              }`}>
                                Risque: {zone.profile.riskScore}/10
                              </span>
                            )}
                            {isNext && canEnter && (
                              <span className="text-xs px-2 py-0.5 rounded bg-amber-600/50 text-amber-300 animate-pulse">
                                Recommandé
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs mt-1">{zone.description}</p>
                          <p className="text-gray-400 text-sm mt-1">
                            Niveaux {zone.minLevel}-{zone.maxLevel} • {zone.enemies?.length || 0} ennemis • {zone.treasureChests?.length || 0} coffres
                          </p>
                          {expandedZone === zone.id && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              {zone.profile && (
                                <div className="mb-2 flex flex-wrap gap-1">
                                  {zone.profile.badges.map((badge: string) => (
                                    <span key={badge} className={`text-xs px-2 py-0.5 rounded ${
                                      badge === 'corruption' ? 'bg-purple-900/70 text-purple-300' :
                                      badge === 'pièges' ? 'bg-orange-900/70 text-orange-300' :
                                      badge === 'fire' ? 'bg-red-900/70 text-red-300' :
                                      badge === 'ice' ? 'bg-cyan-900/70 text-cyan-300' :
                                      badge === 'poison' ? 'bg-green-900/70 text-green-300' :
                                      badge === 'chaos' ? 'bg-pink-900/70 text-pink-300' :
                                      badge === 'danger' ? 'bg-yellow-900/70 text-yellow-300' :
                                      badge === 'soins_rares' ? 'bg-red-800/70 text-red-300' :
                                      'bg-gray-700 text-gray-300'
                                    }`}>
                                      {badge === 'corruption' ? '⚰️ Corruption' :
                                       badge === 'pièges' ? '🪤 Pièges' :
                                       badge === 'fire' ? '🔥 Feu' :
                                       badge === 'ice' ? '❄️ Glace' :
                                       badge === 'poison' ? '☠️ Poison' :
                                       badge === 'chaos' ? '🌀 Chaos' :
                                       badge === 'danger' ? '⚠️ Danger' :
                                       badge === 'soins_rares' ? '💊 Soins Rares' :
                                       badge}
                                    </span>
                                  ))}
                                  {zone.profile.prepRecommendations.length > 0 && (
                                    <div className="mt-2 text-xs text-gray-400">
                                      <span className="font-bold text-amber-400">Préparez: </span>
                                      {zone.profile.prepRecommendations.join(', ')}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="mb-2">
                                <span className="text-xs font-bold text-purple-400">👹 Enemies:</span>
                                <div className="text-xs text-gray-400 mt-1">
                                  {zone.enemies?.slice(0, 5).map((e: any) => e.name).join(', ')}
                                  {(zone.enemies?.length || 0) > 5 && `... (+${(zone.enemies?.length || 0) - 5} more)`}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-bold text-amber-400">🎁 Coffres:</span>
                                <div className="text-xs text-gray-400 mt-1">
                                  {zone.treasureChests?.map((c: any) => c.name).join(', ') || 'Aucun'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {!combatLoading && (
                          <div className="ml-4 flex flex-col gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCombat(zone) }}
                              className={`px-6 py-3 rounded-xl font-bold transition ${
                                hasHighRisk 
                                  ? 'bg-red-700 hover:bg-red-600' 
                                  : hasMediumRisk
                                    ? 'bg-orange-700 hover:bg-orange-600'
                                    : 'bg-amber-600 hover:bg-amber-500'
                              }`}
                            >
                              {hasHighRisk ? '⚠️ Danger!' : hasMediumRisk ? '⚡ Risque!' : '⚔️ Combattre'}
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation()
                                await handleExplore(zone)
                                setActiveTab('explore')
                              }}
                              className="px-4 py-2 rounded-lg bg-green-700 hover:bg-green-600 font-bold text-sm"
                            >
                              🧭 Sous-zones
                            </button>
                          </div>
                        )}
                        {combatLoading && (
                          <div className="ml-4 px-6 py-3 bg-amber-700 rounded-xl font-bold animate-pulse">
                            ⏳ Combat...
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Explore Tab - World Map + Micro-zones */}
          {activeTab === 'explore' && (
            <div className="h-full flex flex-col">
              {!exploringZone ? (
                <>
                  {/* Header with back to city option */}
                  <div className="mb-4 flex items-center justify-between px-4">
                    <div>
                      <h1 className="text-2xl font-bold text-green-400">🧭 Explorer</h1>
                      <p className="text-xs text-gray-500">Choisissez une zone pour voyager</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('city')}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                    >
                      ← Cité
                    </button>
                  </div>

                  {/* World Map - Full space */}
                  <div className="flex-1 p-4 pt-0">
                    <WorldMap 
                      zones={cityData?.zones?.map(z => ({
                        id: z.id,
                        name: z.name,
                        slug: z.id,
                        minLevel: z.minLevel,
                        maxLevel: z.maxLevel,
                        difficulty: z.difficulty,
                        description: z.description,
                        worldX: z.worldX || 0,
                        worldY: z.worldY || 0
                      })) || []}
                      onSelectZone={(zone) => {
                        const found = cityData?.zones?.find(z => z.id === zone.id)
                        if (found) {
                          // Distance-based travel time (max 40s)
                          const cityX = 50, cityY = 80
                          const zoneX = found.worldX || 50
                          const zoneY = found.worldY || 50
                          const distance = Math.sqrt(Math.pow(zoneX - cityX, 2) + Math.pow(zoneY - cityY, 2))
                          const maxDistance = 100
                          const travelTime = Math.max(10000, Math.min(40000, Math.round((distance / maxDistance) * 40000)))
                          setTravelingToZone(found)
                          setTravelDuration(travelTime)
                          setTravelStartTime(Date.now())
                          setIsTraveling(true)
                          setTravelProgress(0)
                        }
                      }}
                    />
                  </div>

                  {/* Travel hint */}
                  <div className="p-4 bg-gray-900/50 border-t border-gray-700">
                    <p className="text-sm text-gray-400 text-center">
                      💡 Temps de voyage: 10-40 secondes selon la distance
                    </p>
                  </div>
                </>
              ) : (
                /* Micro-zones View within a zone */
                <div className="h-full flex flex-col">
                  <div className="mb-4 flex items-center justify-between px-4">
                    <div>
                      <h1 className="text-2xl font-bold text-green-400">{exploringZone.name}</h1>
                      <p className="text-xs text-gray-500">Cliquez sur une zone pour combatte</p>
                    </div>
                    <button 
                      onClick={() => {
                        setExploringZone(null)
                        setActiveTab('city')
                        setCityLayer('hub')
                      }}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                    >
                      ← Retour Cité
                    </button>
                  </div>

                  {/* Zone Map - Full space */}
                  <div className="flex-1 p-4 pt-0">
                    <ZoneMap 
                      zoneName={exploringZone.name}
                      microZones={microZones}
                      currentMicroZoneId={currentMicroZone?.id || null}
                      onSelect={(mz) => {
                        if (mz.id === currentMicroZone?.id) {
                          // Already here - explore this micro-zone
                          handleVisitMicroZone(mz, 'explore')
                        } else {
                          // Travel to another micro-zone
                          const currentMZ = currentMicroZone || microZones[0]
                          const distance = Math.sqrt(
                            Math.pow((mz.positionX || 0.5) - (currentMZ?.positionX || 0.5), 2) +
                            Math.pow((mz.positionY || 0.5) - (currentMZ?.positionY || 0.5), 2)
                          )
                          const travelTime = Math.max(3000, Math.min(15000, Math.round(distance * 15000)))
                          setLocalTravelTarget(mz)
                          setLocalTravelStartTime(Date.now())
                          setLocalTravelDuration(travelTime)
                          setIsLocalTraveling(true)
                        }
                      }}
                    />
                  </div>

                  {/* Local travel hint */}
                  <div className="p-4 bg-gray-900/50 border-t border-gray-700">
                    <p className="text-sm text-gray-400 text-center">
                      💡 Voyage entre micro-zones: ~5-15 secondes
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dungeon Tab */}
          {activeTab === 'dungeon' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-300">🏭 Donjons</h2>
              
              {!inDungeon ? (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm mb-4">Choisissez un donjon pour explorer ses salles.</p>
                  {dungeons.length === 0 ? (
                    <button 
                      onClick={async () => {
                        const token = localStorage.getItem('token')
                        if (!token) return
                        const res = await fetch('/api/dungeon', { headers: { 'Authorization': `Bearer ${token}` } })
                        const data = await res.json()
                        if (res.ok) setDungeons(data.dungeons || [])
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold"
                    >
                      Charger les donjons
                    </button>
                  ) : (
                    dungeons.map(dungeon => (
                      <div 
                        key={dungeon.id}
                        className="flex items-center p-4 rounded-xl border-2 border-gray-700 bg-gray-900/50 hover:border-red-500 cursor-pointer"
                      >
                        <div className="text-3xl mr-4">🏭</div>
                        <div className="flex-1">
                          <div className="font-bold text-lg">{dungeon.name}</div>
                          <div className="text-gray-500 text-sm">{dungeon.description}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              dungeon.type === 'standard' ? 'bg-green-900/50 text-green-300' :
                              dungeon.type === 'avance' ? 'bg-yellow-900/50 text-yellow-300' :
                              'bg-purple-900/50 text-purple-300'
                            }`}>
                              {dungeon.type === 'standard' ? 'Standard' : dungeon.type === 'avance' ? 'Avancé' : 'Spécial'}
                            </span>
                            <span className="text-xs text-gray-500">Nv. {dungeon.level}</span>
                            <span className="text-xs text-gray-500">{dungeon.roomCount} salles</span>
                            {dungeon.hasBoss && <span className="text-xs text-red-400">👹 Boss</span>}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleEnterDungeon(dungeon)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold"
                        >
                          Entrer
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Dungeon View */
                <div>
                  <button 
                    onClick={() => { setInDungeon(false); setSelectedDungeon(null); }}
                    className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold"
                  >
                    ← Quitter le donjon
                  </button>
                  
                  <div className="bg-red-900/30 rounded-xl p-4 mb-4 border border-red-700">
                    <h3 className="text-lg font-bold text-red-400">{selectedDungeon?.name}</h3>
                    <p className="text-gray-400 text-sm">{selectedDungeon?.description}</p>
                  </div>
                  
                  {dungeonState?.currentRoom && (
                    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                      <h4 className="text-xl font-bold text-amber-400 mb-2">
                        {dungeonState.currentRoom.name}
                      </h4>
                      <p className="text-gray-400 mb-4">{dungeonState.currentRoom.description}</p>
                      
                      {/* Room type-specific UI */}
                      {dungeonState.currentRoom.type === 'combat' && (
                        <div className="mb-4">
                          <div className="text-sm text-red-400 mb-2">Combat imminent!</div>
                          <button className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold">
                            ⚔️ Combattre
                          </button>
                        </div>
                      )}
                      
                      {dungeonState.currentRoom.type === 'choice' && (
                        <div className="mb-4 space-y-2">
                          <div className="text-sm text-amber-400">{dungeonState.currentRoom.choiceText}</div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleDungeonProgress('A')}
                              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold"
                            >
                              {dungeonState.currentRoom.choiceA}
                            </button>
                            <button 
                              onClick={() => handleDungeonProgress('B')}
                              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold"
                            >
                              {dungeonState.currentRoom.choiceB}
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {dungeonState.currentRoom.type === 'treasure' && (
                        <div className="mb-4">
                          <div className="text-sm text-amber-400 mb-2">Salle au trésor!</div>
                          <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold">
                            🎁 Ouvrir les coffres
                          </button>
                        </div>
                      )}
                      
                      {dungeonState.currentRoom.type === 'rest' && (
                        <div className="mb-4">
                          <div className="text-sm text-green-400 mb-2">Point de repos - Soins disponibles</div>
                          <button 
                            onClick={handleDungeonRest}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold"
                          >
                            💤 Se reposer (+{dungeonState.currentRoom.healAmount} HP)
                          </button>
                        </div>
                      )}
                      
                      {dungeonState.currentRoom.type === 'boss' && (
                        <div className="mb-4">
                          {dungeonState.bossInfo && (
                            <div className="bg-red-900/50 rounded-lg p-3 mb-3">
                              <div className="font-bold text-red-400 text-lg">{dungeonState.bossInfo.name}</div>
                              <div className="text-sm text-gray-400">
                                HP: {dungeonState.bossInfo.hp} • ATK: {dungeonState.bossInfo.attack} • DEF: {dungeonState.bossInfo.defense}
                              </div>
                            </div>
                          )}
                          <button className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg font-bold">
                            👹 Affronter le boss
                          </button>
                        </div>
                      )}
                      
                      {dungeonState.currentRoom.isExit && (
                        <div className="mb-4">
                          <div className="text-sm text-green-400 mb-2">{dungeonState.currentRoom.exitText}</div>
                          <button 
                            onClick={handleDungeonLeave}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold"
                          >
                            ✅ Quitter le donjon
                          </button>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <button 
                          onClick={handleDungeonLeave}
                          className="text-sm text-gray-500 hover:text-gray-400"
                        >
                          🔙 Abandonner le donjon
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Inventaire</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(!character.inventory || character.inventory.filter((i: any) => i.slot >= 0).length === 0) ? (
                  <div className="col-span-4 text-center py-16 text-gray-500">
                    <div className="text-6xl mb-4">🎒</div>
                    <p className="text-lg">Aucun item</p>
                    <p className="text-sm mt-2">Combattez pour trouver du loot!</p>
                  </div>
                ) : (
                  character.inventory.filter((i: any) => i.slot >= 0).map((invItem: any) => (
                    <div
                      key={invItem.id}
                      className="bg-gray-800 rounded-xl p-4 border-2 transition-all hover:scale-105"
                      style={{ borderColor: invItem.item.rarity.color }}
                    >
                      <div className="text-center mb-2">
                        <span className="text-3xl">
                          {invItem.item.baseItem.type === 'weapon' ? '⚔️' :
                           invItem.item.baseItem.type === 'shield' ? '🛡️' :
                           invItem.item.baseItem.type === 'helmet' ? '⛑️' :
                           invItem.item.baseItem.type === 'armor' ? '🎽' :
                           invItem.item.baseItem.type === 'legs' ? '👖' : '💍'}
                        </span>
                      </div>
                      <div className="text-center font-bold text-sm mb-1" style={{ color: invItem.item.rarity.color }}>
                        {getItemDisplayName(invItem.item)}
                      </div>
                      <div className="text-center text-gray-500 text-xs mb-2">Nv. {invItem.item.itemLevel}</div>
                      <div className="text-xs space-y-1 mb-3">
                        {Object.entries(JSON.parse(invItem.item.finalStats || '{}')).map(([stat, val]: [string, any]) => (
                          <div key={stat} className="text-green-400">+{val} {stat}</div>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEquip(invItem.id)} className="flex-1 py-1.5 bg-green-600 hover:bg-green-500 rounded text-xs font-bold">
                          Équiper
                        </button>
                        <button onClick={() => handleSell(invItem.id)} className="px-2 py-1.5 bg-red-600/80 hover:bg-red-500 rounded text-xs font-bold">
                          💰
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Équipement</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                {['weapon', 'shield', 'helmet', 'armor', 'legs', 'accessory'].map(slot => {
                  const equipped = getEquippedInSlot(slot)
                  const names: Record<string, string> = { weapon: 'Arme', shield: 'Bouclier', helmet: 'Casque', armor: 'Armure', legs: 'Jambières', accessory: 'Accessoire' }
                  const icons: Record<string, string> = { weapon: '⚔️', shield: '🛡️', helmet: '⛑️', armor: '🎽', legs: '👖', accessory: '💍' }
                  
                  return (
                    <div key={slot} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <div className="text-center mb-2">
                        <div className="text-3xl">{icons[slot]}</div>
                        <div className="text-gray-400 text-sm">{names[slot]}</div>
                      </div>
                      {equipped ? (
                        <div className="text-center">
                          <div className="font-bold text-sm" style={{ color: equipped.item.rarity.color }}>
                            {getItemDisplayName(equipped.item)}
                          </div>
                          <div className="text-xs text-green-400 mt-1">
                            {Object.entries(JSON.parse(equipped.item.finalStats || '{}')).map(([stat, val]: [string, any]) => (
                              <div key={stat}>+{val} {stat}</div>
                            ))}
                          </div>
                          <button onClick={() => handleUnequip(equipped.id)} className="mt-2 w-full py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                            Retirer
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-600 text-sm">Vide</div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Stats Summary */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="font-bold mb-4">Stats Totaux</h3>
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl">⚔️</div>
                    <div className="text-xl font-bold text-red-400">{Math.floor(character.stats.force * 3)}</div>
                    <div className="text-xs text-gray-500">Attaque</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl">🛡️</div>
                    <div className="text-xl font-bold text-blue-400">{Math.floor(character.stats.vitality * 2 + character.stats.agility)}</div>
                    <div className="text-xs text-gray-500">Défense</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl">❤️</div>
                    <div className="text-xl font-bold text-green-400">{character.maxHp}</div>
                    <div className="text-xs text-gray-500">HP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl">💥</div>
                    <div className="text-xl font-bold text-yellow-400">{((character.stats.agility * 0.5 + character.stats.luck) / 100 * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">Critique</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl">💨</div>
                    <div className="text-xl font-bold text-cyan-400">{(character.stats.agility / 150 * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">Esquive</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quests Tab */}
          {activeTab === 'quests' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Quêtes</h2>
              
              <div className="space-y-4">
                {quests.filter(q => q.type === 'daily').length > 0 && (
                  <div>
                    <h3 className="text-sm text-gray-400 uppercase mb-3">Quêtes Quotidiennes</h3>
                    {quests.filter(q => q.type === 'daily').map(quest => (
                      <div key={quest.id} className="bg-gray-800 rounded-xl p-4 mb-3 border border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold">{quest.name}</div>
                            <div className="text-sm text-gray-400">{quest.description}</div>
                          </div>
                          <div className="text-sm">
                            {quest.rewards.gold && <span className="text-yellow-400 mr-2">💰{quest.rewards.gold}</span>}
                            {quest.rewards.xp && <span className="text-amber-400">⭐{quest.rewards.xp}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 transition-all"
                              style={{ width: `${Math.min(100, ((quest.progress?.currentProgress || 0) / quest.conditions.count) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-400">{quest.progress?.currentProgress || 0}/{quest.conditions.count}</span>
                          {quest.progress?.completed && !quest.progress?.claimed && (
                            <button className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm font-bold">
                              Réclamer
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Crafting Tab */}
          {activeTab === 'craft' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🔨 Crafting</h2>
                <div className="text-yellow-400 font-bold text-lg">💰 {character.gold}</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {craftingRecipes.length === 0 ? (
                  <div className="col-span-2 text-center py-16 text-gray-500">
                    <div className="text-6xl mb-4">🔨</div>
                    <p className="text-lg">Aucun craft disponible</p>
                    <p className="text-sm mt-2">Montez en niveau pour débloquer des recettes!</p>
                  </div>
                ) : (
                  craftingRecipes.map((recipe: any, index: number) => (
                    <div 
                      key={index}
                      className={`bg-gray-900/50 rounded-xl p-5 border-2 transition-all ${
                        character.gold >= recipe.cost 
                          ? 'border-gray-700 hover:border-amber-500 cursor-pointer' 
                          : 'border-gray-800 opacity-60'
                      }`}
                      onClick={() => {
                        if (character.gold < recipe.cost) return
                        setCrafting(true)
                        const token = localStorage.getItem('token')
                        if (!token) return
                        fetch('/api/crafting', {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token 
                          },
                          body: JSON.stringify({ recipeIndex: index })
                        }).then(res => res.json())
                          .then(data => {
                            if (data.success) {
                              alert('Craft reussi! ' + data.item.name)
                              fetch('/api/character', { headers: { 'Authorization': 'Bearer ' + token } })
                                .then(res => res.json())
                                .then(charData => setCharacter(charData.character))
                              setCrafting(false)
                            } else {
                              alert(data.error)
                              setCrafting(false)
                            }
                          })
                      }}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                          recipe.type === 'weapon' ? 'bg-red-900/50' :
                          recipe.type === 'shield' ? 'bg-blue-900/50' :
                          recipe.type === 'helmet' ? 'bg-yellow-900/50' :
                          recipe.type === 'armor' ? 'bg-green-900/50' :
                          recipe.type === 'legs' ? 'bg-purple-900/50' :
                          'bg-pink-900/50'
                        }`}>
                          {recipe.type === 'weapon' ? '⚔️' :
                           recipe.type === 'shield' ? '🛡️' :
                           recipe.type === 'helmet' ? '⛑️' :
                           recipe.type === 'armor' ? '🎽' :
                           recipe.type === 'legs' ? '👖' : '💍'}
                        </div>
                        <div>
                          <div className="font-bold text-lg capitalize">{recipe.type}</div>
                          <div className="text-amber-400 text-sm">Niveau {recipe.level}</div>
                        </div>
                      </div>
                      <div className="text-sm space-y-1 mb-4">
                        {Object.entries(recipe.stats).map(([stat, val]: [string, any]) => (
                          <div key={stat} className="text-green-400">+{val} {stat}</div>
                        ))}
                      </div>
                      <div className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                        character.gold >= recipe.cost ? 'bg-yellow-900/30' : 'bg-gray-800'
                      }`}>
                        <span className="text-gray-400">Coût</span>
                        <span className={`font-bold ${character.gold >= recipe.cost ? 'text-yellow-400' : 'text-red-400'}`}>
                          💰 {recipe.cost}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {crafting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-amber-400 font-bold">Craft en cours...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🏅 Succès</h2>
                <div className="text-amber-400 font-bold">
                  {achievements.filter(a => a.earned).length} / {achievements.length}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`rounded-xl p-5 border-2 transition-all ${
                      achievement.earned 
                        ? 'bg-gradient-to-br from-amber-900/30 to-gray-900 border-amber-500/50' 
                        : 'bg-gray-900/50 border-gray-800 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                        achievement.earned ? 'bg-amber-600/30' : 'bg-gray-800'
                      }`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`font-bold ${achievement.earned ? 'text-amber-400' : 'text-gray-400'}`}>
                            {achievement.name}
                          </div>
                          {achievement.earned && (
                            <span className="text-green-400">✓</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">{achievement.description}</div>
                        
                        {!achievement.earned && (
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progression</span>
                              <span>{achievement.currentProgress || 0} / {achievement.target}</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-500 transition-all"
                                style={{ width: `${achievement.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Récompense</span>
                          <span className="text-yellow-400 font-bold">💰 {achievement.reward}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Destiny Tab */}
          {activeTab === 'destiny' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">✨ Destin</h2>

              {/* Current Class */}
              <div className="bg-gradient-to-r from-purple-900/30 to-gray-900 rounded-xl p-6 border border-purple-500/30 mb-6">
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">{character.class.icon || '⚔️'}</div>
                  <div className="text-xl font-bold text-purple-400">{character.class.name}</div>
                  <div className="text-gray-400 text-sm mt-1">
                    Niveau {character.level} • {fate?.stats?.victories || 0} victoires
                  </div>
                </div>
              </div>

              {/* Advanced Classes */}
              {character.level >= 15 && advancedClasses.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-purple-400 mb-4">⭐ Évolution de Classe</h3>
                  <p className="text-gray-500 text-sm mb-4">Atteignez le niveau 15 pour évoluer</p>
                  <div className="grid grid-cols-2 gap-4">
                    {advancedClasses.map(cls => (
                      <div key={cls.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                        <div className="font-bold mb-1">{cls.name}</div>
                        <div className="text-sm text-gray-400 mb-3">{cls.description}</div>
                        <button
                          onClick={async () => {
                            const token = localStorage.getItem('token')
                            if (!token) return
                            const res = await fetch('/api/secrets', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ action: 'unlock_advanced', classId: cls.id })
                            })
                            const data = await res.json()
                            if (data.success) {
                              alert(data.message)
                              window.location.reload()
                            } else {
                              alert(data.error)
                            }
                          }}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded font-bold text-sm"
                        >
                          Évoluer vers {cls.name}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Secret Classes */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-red-400 mb-4">🔮 Classes Secrètes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {secrets.filter(s => s.tier === 'rare').map(secret => (
                    <div
                      key={secret.id}
                      className={`rounded-xl p-4 border-2 ${
                        secret.unlocked 
                          ? 'bg-gradient-to-br from-red-900/40 to-gray-900 border-red-500/50' 
                          : 'bg-gray-900/50 border-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          secret.unlocked ? 'bg-red-600/30' : 'bg-gray-800'
                        }`}>
                          ✨
                        </div>
                        <div>
                          <div className={`font-bold ${secret.unlocked ? 'text-red-400' : ''}`}>
                            {secret.name}
                          </div>
                          <div className="text-xs text-gray-500">Classe Rare</div>
                        </div>
                        {secret.unlocked && (
                          <span className="ml-auto bg-green-600 px-2 py-1 rounded text-xs font-bold">DÉCOUVERT</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 mb-3">{secret.description}</div>
                      
                      {!secret.unlocked && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1 italic">{secret.hint}</div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progression</span>
                            <span>{secret.progress} / {secret.target}</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500 transition-all"
                              style={{ width: `${(secret.progress / secret.target) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {secret.unlocked && (
                        <button
                          onClick={async () => {
                            const token = localStorage.getItem('token')
                            if (!token) return
                            if (!confirm(`Devenir ${secret.name}? Cette action est irréversible.`)) return
                            const res = await fetch('/api/secrets', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ action: 'unlock_class', classId: secret.id })
                            })
                            const data = await res.json()
                            if (data.success) {
                              alert(data.message)
                              window.location.reload()
                            } else {
                              alert(data.error)
                            }
                          }}
                          className="w-full py-2 bg-red-600 hover:bg-red-500 rounded font-bold text-sm"
                        >
                          Acquérir cette classe
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Unique Classes */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-yellow-400 mb-4">👑 Classes Uniques (1 par serveur)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {secrets.filter(s => s.tier === 'unique').map(secret => (
                    <div
                      key={secret.id}
                      className={`rounded-xl p-4 border-2 ${
                        secret.unlocked 
                          ? 'bg-gradient-to-br from-yellow-900/40 to-gray-900 border-yellow-500/50' 
                          : 'bg-gray-900/50 border-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          secret.unlocked ? 'bg-yellow-600/30' : 'bg-gray-800'
                        }`}>
                          👑
                        </div>
                        <div>
                          <div className={`font-bold ${secret.unlocked ? 'text-yellow-400' : ''}`}>
                            {secret.name}
                          </div>
                          <div className="text-xs text-gray-500">Unique au serveur</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-3">{secret.description}</div>
                      
                      {!secret.unlocked && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1 italic">{secret.hint}</div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progression</span>
                            <span>{secret.progress} / {secret.target}</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-500 transition-all"
                              style={{ width: `${(secret.progress / secret.target) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {secret.unlocked && (
                        <button
                          onClick={async () => {
                            const token = localStorage.getItem('token')
                            if (!token) return
                            if (!confirm(`Claimer ${secret.name}? Cette classe ne peut être obtenue qu'une seule fois sur le serveur!`)) return
                            const res = await fetch('/api/secrets', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ action: 'unlock_class', classId: secret.id })
                            })
                            const data = await res.json()
                            if (data.success) {
                              alert(data.message)
                              window.location.reload()
                            } else {
                              alert(data.error)
                            }
                          }}
                          className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-bold text-sm animate-pulse"
                        >
                          Claimer cette classe unique
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Server Uniques */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-pink-400 mb-4">🌟 Objets Mythiques du Serveur</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serverUniques.map(item => (
                    <div
                      key={item.id}
                      className={`rounded-xl p-4 border-2 ${
                        item.claimed 
                          ? 'bg-gradient-to-br from-pink-900/40 to-gray-900 border-pink-500/50' 
                          : 'bg-gray-900/50 border-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-pink-900/30">
                          {item.icon || '✨'}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-pink-400">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            {item.claimed ? 'Réclamé' : 'Non réclamé'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curses & Blessings */}
              {fate && (
                <div>
                  <h3 className="text-lg font-bold text-gray-400 mb-4">⚡ Destin Actif</h3>
                  
                  {fate.activeCurses && fate.activeCurses.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm text-red-400 mb-2">Maledictions</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {fate.activeCurses.map((curse: any) => (
                          <div key={curse.id} className="bg-red-900/20 rounded-lg p-3 border border-red-800">
                            <div className="font-bold text-red-400">{curse.name}</div>
                            <div className="text-sm text-gray-400">{curse.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {fate.activeBlessings && fate.activeBlessings.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm text-green-400 mb-2">Bénédictions</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {fate.activeBlessings.map((blessing: any) => (
                          <div key={blessing.id} className="bg-green-900/20 rounded-lg p-3 border border-green-800">
                            <div className="font-bold text-green-400">{blessing.name}</div>
                            <div className="text-sm text-gray-400">{blessing.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!fate.activeCurses || fate.activeCurses.length === 0) && 
                   (!fate.activeBlessings || fate.activeBlessings.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">⚡</div>
                      <p>Votre destin est entre vos mains...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Social Tabs */}
          {activeTab === 'titles' && (
            <GameSocialPanel
              mode="titles"
              titles={titles}
              allTitles={allTitles}
              chronicles={chronicles}
            />
          )}

          {activeTab === 'chronicles' && (
            <GameSocialPanel
              mode="chronicles"
              titles={titles}
              allTitles={allTitles}
              chronicles={chronicles}
            />
          )}

          {/* Factions Tab */}
          {activeTab === 'factions' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">⚔️ Factions</h2>
                <div className="text-amber-400 font-bold">
                  {factions.filter(f => f.characterRepputation > 0).length} rejointes
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {factions.map(faction => (
                  <div
                    key={faction.id}
                    className={`rounded-xl p-6 border-2 transition-all ${
                      faction.characterRepputation > 0
                        ? faction.color === 'red' ? 'bg-red-900/30 border-red-500/50' :
                          faction.color === 'purple' ? 'bg-purple-900/30 border-purple-500/50' :
                          'bg-blue-900/30 border-blue-500/50'
                        : 'bg-gray-900/50 border-gray-800'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <div className={`text-5xl mb-2 ${
                        faction.color === 'red' ? 'text-red-400' :
                        faction.color === 'purple' ? 'text-purple-400' :
                        'text-blue-400'
                      }`}>{faction.icon}</div>
                      <div className="font-bold text-xl">{faction.name}</div>
                      <div className="text-sm text-gray-500">{faction.desc}</div>
                    </div>

                    {faction.characterRepputation > 0 ? (
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          faction.color === 'red' ? 'text-red-400' :
                          faction.color === 'purple' ? 'text-purple-400' :
                          'text-blue-400'
                        }`}>{faction.characterRepputation}</div>
                        <div className="text-xs text-gray-500">réputation</div>
                        <div className="mt-2 px-3 py-1 bg-gray-800 rounded text-sm font-bold">
                          Rang: {faction.rank}
                        </div>
                        <div className="mt-2 text-xs text-green-400">
                          Réduction: {Math.min(20, Math.floor((faction.characterRepputation || 0) / 100) * 5)}%
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-gray-500 text-sm mb-3">Non rejoint</div>
                        <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold">
                          Rejoindre
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                <h3 className="font-bold mb-2">Comment gagner de la réputation:</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>⚔️ <span className="text-red-400">Les Lames</span>: Vaincre des boss (+10)</li>
                  <li>🗡️ <span className="text-purple-400">Les Ombres</span>: Voler avec succès (+5)</li>
                  <li>✨ <span className="text-blue-400">Le Sanctuaire</span>: Découvrir des secrets (+10)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Bounties Tab */}
          {activeTab === 'bounties' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">💰 Primes</h2>
                <div className="text-amber-400 font-bold">
                  {bounties.length} actives
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 mb-6">
                <h3 className="font-bold mb-3">Mettre une prime</h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Nom du joueur"
                    className="flex-1 px-4 py-2 bg-gray-800 rounded border border-gray-700"
                    id="bounty-target"
                  />
                  <input 
                    type="number" 
                    placeholder="Montant"
                    className="w-24 px-4 py-2 bg-gray-800 rounded border border-gray-700"
                    id="bounty-amount"
                    min="100"
                  />
                  <button 
                    onClick={async () => {
                      const token = localStorage.getItem('token')
                      if (!token) return
                      const targetInput = document.getElementById('bounty-target') as HTMLInputElement
                      const amountInput = document.getElementById('bounty-amount') as HTMLInputElement
                      const targetName = targetInput.value
                      const amount = parseInt(amountInput.value)
                      
                      if (!targetName || !amount || amount < 100) {
                        alert('Montant minimum: 100 or')
                        return
                      }
                      
                      const res = await fetch('/api/bounties', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ action: 'place_bounty', targetName, amount })
                      })
                      const data = await res.json()
                      if (res.ok) {
                        alert(data.message)
                        targetInput.value = ''
                        amountInput.value = ''
                        fetch('/api/bounties').then(r => r.json()).then(d => setBounties(d.bounties || []))
                      } else {
                        alert(data.error)
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded font-bold"
                  >
                    Poster
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Les primes expirent après 24 heures</p>
              </div>

              <div className="space-y-3">
                {bounties.map(bounty => (
                  <div key={bounty.id} className="bg-gray-900/50 rounded-xl p-4 border border-red-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-red-900/50 flex items-center justify-center text-2xl">🎯</div>
                        <div>
                          <div className="font-bold text-red-400">{bounty.targetName}</div>
                          <div className="text-sm text-gray-400">Par {bounty.placerName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-400">💰 {bounty.amount}</div>
                        <div className="text-xs text-gray-500">
                          Expire: {new Date(bounty.expiresAt).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {bounties.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <div className="text-6xl mb-4">💰</div>
                  <p className="text-lg">Aucune prime active</p>
                  <p className="text-sm mt-2">Soyez le premier à mettre une prime!</p>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">📊 Statistiques</h2>
                <div className="text-yellow-400 font-bold">💰 {character?.gold || 0}</div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 mb-6">
                <p className="text-gray-400 text-sm mb-4">
                  Investissez votre or pour augmenter vos statistiques de base. Les coûts augmentent à chaque point acheté.
                </p>
                <div className="text-xs text-gray-500">
                  💡 <span className="italic">Le niveau n'est qu'un indicateur - vos choix et votre équipement font votre vraie force.</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {playerStats && Object.entries(playerStats).map(([key, stat]: [string, any]) => (
                  <div key={key} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <div className="text-center mb-3">
                      <div className="text-3xl mb-1">{stat.icon}</div>
                      <div className="font-bold">{stat.name}</div>
                      <div className="text-xs text-gray-500">{stat.description}</div>
                    </div>
                    <div className="text-center mb-3">
                      <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
                      <div className="text-xs text-gray-500">Valeur totale (Base: {stat.base} + Investi: {stat.invested})</div>
                    </div>
                    {stat.invested < stat.maxPoints ? (
                      <button
                        onClick={async () => {
                          const token = localStorage.getItem('token')
                          if (!token) return
                          const res = await fetch('/api/stats', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ action: 'invest', statName: key })
                          })
                          const data = await res.json()
                          if (res.ok) {
                            alert(data.message)
                            fetch('/api/character', { headers: { 'Authorization': `Bearer ${token}` } })
                              .then(r => r.json())
                              .then(c => setCharacter(c.character))
                            fetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` } })
                              .then(r => r.json())
                              .then(d => setPlayerStats(d.stats))
                          } else {
                            alert(data.error)
                          }
                        }}
                        className={`w-full py-2 rounded font-bold text-sm ${
                          (character?.gold || 0) >= stat.cost 
                            ? 'bg-green-600 hover:bg-green-500' 
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={(character?.gold || 0) < stat.cost}
                      >
                        {stat.cost} 💰
                      </button>
                    ) : (
                      <div className="text-center py-2 bg-gray-800 rounded text-xs text-gray-500">
                        Maximum atteint
                      </div>
                    )}
                    <div className="text-center text-xs text-gray-500 mt-2">
                      {stat.maxPoints - stat.invested} points restants
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Combat Result Modal */}
      {combatResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-lg w-full border border-gray-700 animate-scale-in">
            <div className={`text-center mb-6 ${combatResult.victory ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`text-6xl mb-2 ${combatResult.victory ? 'animate-bounce' : 'animate-shake'}`}>
                {combatResult.victory ? '🏆' : '💀'}
              </div>
              <h2 className="text-3xl font-bold">{combatResult.victory ? 'Victoire!' : 'Défaite'}</h2>
            </div>

            <div className="bg-gray-950 rounded-xl p-4 max-h-48 overflow-y-auto mb-6 space-y-1 text-sm">
              {combatResult.replay.map((action: any, i: number) => (
                <div key={i} className={`${
                  action.type === 'crit' ? 'text-yellow-400' :
                  action.type === 'dodge' ? 'text-blue-400' :
                  action.type === 'death' ? 'text-red-400' :
                  action.type === 'victory' ? 'text-green-400 font-bold' : 'text-gray-300'
                }`}>
                  {action.description} {action.damage && <span className="font-bold">-{action.damage}</span>}
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl">⭐</div>
                <div className="text-xl font-bold text-amber-400">+{combatResult.rewards.xp}</div>
                <div className="text-xs text-gray-500">XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">💰</div>
                <div className="text-xl font-bold text-yellow-400">+{combatResult.rewards.gold}</div>
                <div className="text-xs text-gray-500">Or</div>
              </div>
              {combatResult.rewards.leveledUp && (
                <div className="text-center text-green-400">
                  <div className="text-2xl">🚀</div>
                  <div className="text-xl font-bold">Level Up!</div>
                </div>
              )}
            </div>

            {combatResult.rewards.items && combatResult.rewards.items.length > 0 && (
              <div className="mb-6">
                <div className="text-center text-purple-400 font-bold mb-2">🎁 Loot</div>
                {combatResult.rewards.items.map((item: any, i: number) => (
                  <div key={i} className="text-center" style={{ color: item.rarityColor }}>
                    {item.name}
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={() => {
                if (!combatResult.victory) {
                  const zone = zones.find(z => z.id === character.currentZoneId)
                  const time = ((zone?.travelTimeSeconds || 180) * 1000) * 2
                  setCombatResult(null)
                  setIsTraveling(true)
                  setIsReturningFromDeath(true)
                  setTravelDuration(time)
                  setTravelStartTime(Date.now())
                  setTravelingToZone(null)
                  setTravelProgress(0)
                } else {
                  setCombatResult(null)
                }
              }} 
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* Travel Modal */}
      {isTraveling && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-2xl border border-amber-600 max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-4">
              {isReturningFromDeath ? '💀 Retour au camp...' : '🚶 Voyage en cours'}
            </h2>
            
            <div className="mb-2 text-center text-amber-400 font-bold">
              {travelingToZone?.name || (isReturningFromDeath ? 'Vers la cité...' : 'En route')}
            </div>
            
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-amber-600 transition-all duration-100"
                style={{ width: `${travelProgress * 100}%` }}
              />
            </div>
            
            <div className="text-center text-gray-400">
              {Math.ceil((travelDuration * (1 - travelProgress)) / 1000)}s restantes
            </div>
            
            <button
              onClick={() => {
                setIsTraveling(false)
                setActiveTab('city')
                setIsReturningFromDeath(false)
              }}
              className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            >
              Annuler (retour ville)
            </button>
          </div>
        </div>
      )}

      {/* Local Travel Modal */}
      {isLocalTraveling && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl border border-green-600 max-w-sm w-full">
            <h2 className="text-xl font-bold text-center mb-2 text-green-400">
              🏃 Déplacement local
            </h2>
            
            <div className="mb-2 text-center text-amber-300 font-bold">
              Vers: {localTravelTarget?.name || '...'}
            </div>
            
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-green-600 transition-all duration-100"
                style={{ width: `${localTravelProgress * 100}%` }}
              />
            </div>
            
            <div className="text-center text-gray-400 text-sm">
              {Math.ceil((localTravelDuration * (1 - localTravelProgress)) / 1000)}s
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-center">Distribuer les Points</h3>
            <p className="text-center text-gray-400 mb-4">{character.unspentPoints} points disponibles</p>
            
            <div className="space-y-2">
              {[
                { key: 'force', name: 'Force', icon: '⚔️' },
                { key: 'agility', name: 'Agilité', icon: '🏃' },
                { key: 'vitality', name: 'Vitalité', icon: '❤️' },
                { key: 'luck', name: 'Chance', icon: '🍀' },
              ].map(stat => (
                <button
                  key={stat.key}
                  disabled={character.unspentPoints <= 0}
                  onClick={async () => {
                    const token = localStorage.getItem('token')
                    if (!token || character.unspentPoints <= 0) return
                    const res = await fetch('/api/character/stats', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ stat: stat.key, action: 'add' })
                    })
                    if (res.ok) {
                      const data = await res.json()
                      setCharacter(data.character)
                    }
                  }}
                  className="w-full flex justify-between items-center p-3 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50"
                >
                  <span>{stat.icon} {stat.name}</span>
                  <span className="font-bold">{character.stats[stat.key as keyof typeof character.stats]}</span>
                </button>
              ))}
            </div>

            <button onClick={() => setShowStatsModal(false)} className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
