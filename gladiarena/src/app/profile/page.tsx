'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface CharacterStats {
  force: number
  agility: number
  vitality: number
  luck: number
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
  class: {
    name: string
    icon: string
    description: string
  }
  stats: CharacterStats
  createdAt: string
}

export default function ProfilePage() {
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    fetch('/api/character', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json())
      .then(data => {
        if (data.character) {
          setCharacter(data.character)
        }
        setLoading(false)
      })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-amber-500 text-xl">Chargement...</div>
      </div>
    )
  }

  if (!character) return null

  const equippedItems = character as any
  const stats = character.stats
  const xpPercent = (character.xp / character.xpToNextLevel) * 100
  const hpPercent = (character.currentHp / character.maxHp) * 100
  
  const totalStats = stats.force + stats.agility + stats.vitality + stats.luck
  const createdDate = new Date(character.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-850 to-gray-900 text-white pb-20">
      <header className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 border-b-2 border-amber-600/30 p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => router.push('/game')}
            className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition"
          >
            ← Retour
          </button>
          <h1 className="font-bold text-xl text-white">Profil</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Character Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-6 border border-gray-700 shadow-xl">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl flex items-center justify-center text-5xl shadow-lg border-4 border-amber-500/50">
              {character.class.icon}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{character.name}</h2>
              <p className="text-amber-400 font-medium">{character.class.name}</p>
              <p className="text-gray-400 text-sm mt-2">{character.class.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-900/50 rounded-xl p-4">
              <div className="text-3xl mb-1">⭐</div>
              <div className="text-2xl font-bold text-amber-400">{character.level}</div>
              <div className="text-xs text-gray-500">Niveau</div>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4">
              <div className="text-3xl mb-1">💰</div>
              <div className="text-2xl font-bold text-yellow-400">{character.gold.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Or</div>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4">
              <div className="text-3xl mb-1">📊</div>
              <div className="text-2xl font-bold text-green-400">{totalStats}</div>
              <div className="text-xs text-gray-500">Stats Total</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Progression XP</span>
              <span className="text-white">{character.xp} / {character.xpToNextLevel}</span>
            </div>
            <div className="h-4 bg-gray-700 rounded-xl overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 text-center text-gray-500 text-sm">
            Créé le {createdDate}
          </div>
        </div>

        {/* Stats Breakdown */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-6 border border-gray-700 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span> Stats
          </h3>

          <div className="space-y-4">
            {[
              { key: 'force', name: 'Force', value: stats.force, color: 'text-red-400', icon: '⚔️', desc: 'Augmente les dégâts d\'attaque' },
              { key: 'agility', name: 'Agilité', value: stats.agility, color: 'text-cyan-400', icon: '🏃', desc: 'Augmente l\'esquive et la vitesse' },
              { key: 'vitality', name: 'Vitalité', value: stats.vitality, color: 'text-green-400', icon: '❤️', desc: 'Augmente les HP et la défense' },
              { key: 'luck', name: 'Chance', value: stats.luck, color: 'text-purple-400', icon: '🍀', desc: 'Augmente les chances de critique' }
            ].map(stat => (
              <div key={stat.key} className="bg-gray-900/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <div className={`font-bold ${stat.color}`}>{stat.name}</div>
                      <div className="text-xs text-gray-500">{stat.desc}</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stat.color.replace('text-', 'bg-')} opacity-50 transition-all`}
                    style={{ width: `${(stat.value / 100) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Combat Stats */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-6 border border-gray-700 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">⚔️</span> Stats de Combat
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {(() => {
              const baseHp = Math.floor(100 + stats.vitality * 15)
              const attack = Math.floor(stats.force * 3)
              const defense = Math.floor(stats.vitality * 2 + stats.agility)
              const critChance = ((stats.agility * 0.5 + stats.luck) / 100 * 100).toFixed(1)
              const dodgeChance = (stats.agility / 150 * 100).toFixed(1)

              return (
                <>
                  <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                    <div className="text-gray-400 text-xs mb-1">❤️ HP Max</div>
                    <div className="text-2xl font-bold text-red-400">{character.maxHp}</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                    <div className="text-gray-400 text-xs mb-1">⚔️ Attaque</div>
                    <div className="text-2xl font-bold text-red-400">{attack}</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                    <div className="text-gray-400 text-xs mb-1">🛡️ Défense</div>
                    <div className="text-2xl font-bold text-blue-400">{defense}</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                    <div className="text-gray-400 text-xs mb-1">💨 Esquive</div>
                    <div className="text-2xl font-bold text-cyan-400">{dodgeChance}%</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                    <div className="text-gray-400 text-xs mb-1">💥 Critique</div>
                    <div className="text-2xl font-bold text-yellow-400">{critChance}%</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                    <div className="text-gray-400 text-xs mb-1">⚡ HP Actuel</div>
                    <div className="text-2xl font-bold text-green-400">{character.currentHp}</div>
                  </div>
                </>
              )
            })()}
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">HP</span>
              <span className="text-white">{character.currentHp} / {character.maxHp}</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-lg overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all ${
                  hpPercent > 50 ? 'bg-gradient-to-r from-green-600 to-green-500' : 
                  hpPercent > 25 ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' : 
                  'bg-gradient-to-r from-red-600 to-red-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
