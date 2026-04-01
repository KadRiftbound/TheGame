'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Guild {
  id: string
  name: string
  level: number
  gold: number
  description?: string
  members: {
    id: string
    role: string
    character: {
      name: string
      level: number
    }
  }[]
  _count: {
    members: number
  }
}

export default function GuildsPage() {
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [playerGuild, setPlayerGuild] = useState<Guild | null>(null)
  const [playerRole, setPlayerRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newGuildName, setNewGuildName] = useState('')
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  const fetchGuilds = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    try {
      const res = await fetch('/api/guilds', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setGuilds(data.guilds)
      setPlayerGuild(data.playerGuild)
      setPlayerRole(data.playerRole)
    } catch (err) {
      console.error('Failed to fetch guilds:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuilds()
  }, [router])

  const handleCreateGuild = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setCreating(true)
    try {
      const res = await fetch('/api/guilds', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ guildName: newGuildName })
      })
      const data = await res.json()
      
      if (res.ok) {
        setShowCreate(false)
        setNewGuildName('')
        fetchGuilds()
      } else {
        alert(data.error)
      }
    } catch (err) {
      console.error('Create guild error:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleJoinGuild = async (guildId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('/api/guilds/join', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ guildId })
      })
      const data = await res.json()
      
      if (res.ok) {
        fetchGuilds()
      } else {
        alert(data.error)
      }
    } catch (err) {
      console.error('Join guild error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-amber-500 text-xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-850 to-gray-900 text-white pb-20">
      <header className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 border-b-2 border-amber-600/30 p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => router.push('/game')}
            className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition"
          >
            ← Retour
          </button>
          <h1 className="font-bold text-xl text-white">🏰 Guildes</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {playerGuild ? (
          <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 rounded-2xl p-6 border border-amber-600/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-amber-400">{playerGuild.name}</h2>
                <p className="text-gray-400">Niveau {playerGuild.level} • {playerRole}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">💰 {playerGuild.gold}</div>
                <div className="text-gray-500 text-sm">Or de guilde</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>👥</span> Membres ({playerGuild.members.length})
              </h3>
              <div className="space-y-2">
                {playerGuild.members.map(member => (
                  <div key={member.id} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        member.role === 'leader' ? 'bg-amber-600' : 
                        member.role === 'officer' ? 'bg-blue-600' : 'bg-gray-600'
                      }`}>
                        {member.role === 'leader' ? '👑' : member.role === 'officer' ? '⭐' : '🎖️'}
                      </div>
                      <div>
                        <div className="font-bold">{member.character.name}</div>
                        <div className="text-xs text-gray-400">Niveau {member.character.level}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      member.role === 'leader' ? 'bg-amber-900/50 text-amber-400' :
                      member.role === 'officer' ? 'bg-blue-900/50 text-blue-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {member.role === 'leader' ? 'Chef' : member.role === 'officer' ? 'Officier' : 'Membre'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-2xl p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🏰</div>
              <h2 className="text-xl font-bold mb-2">Rejoignez une guilde</h2>
              <p className="text-gray-400">Les guildes offrent des bonus et un sentiment d'appartenance</p>
            </div>
            
            {!showCreate ? (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-xl font-bold text-white transition-all hover:scale-105"
              >
                + Créer une guilde (1000 💰)
              </button>
            ) : (
              <div className="bg-gray-900/50 rounded-xl p-4">
                <h3 className="font-bold mb-3">Nom de la guilde</h3>
                <input
                  type="text"
                  value={newGuildName}
                  onChange={(e) => setNewGuildName(e.target.value)}
                  placeholder="Entrez le nom..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-3 focus:outline-none focus:border-amber-500"
                  maxLength={30}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateGuild}
                    disabled={creating || newGuildName.length < 3}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-lg font-bold transition"
                  >
                    {creating ? 'Création...' : 'Créer'}
                  </button>
                  <button
                    onClick={() => { setShowCreate(false); setNewGuildName('') }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-200">🏆 Classement des Guildes</h2>
          <div className="space-y-3">
            {guilds.map((guild, index) => (
              <div 
                key={guild.id}
                className={`bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-4 border ${
                  index === 0 ? 'border-yellow-500/50' :
                  index === 1 ? 'border-gray-400/50' :
                  index === 2 ? 'border-amber-700/50' :
                  'border-gray-700'
                } animate-slide-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-600 text-yellow-100' :
                      index === 1 ? 'bg-gray-400 text-gray-900' :
                      index === 2 ? 'bg-amber-700 text-amber-100' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{guild.name}</h3>
                      <p className="text-gray-400 text-sm">Niveau {guild.level} • {guild._count?.members || guild.members.length} membres</p>
                    </div>
                  </div>
                  {!playerGuild && (
                    <button
                      onClick={() => handleJoinGuild(guild.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-sm transition-all hover:scale-105"
                    >
                      Rejoindre
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
