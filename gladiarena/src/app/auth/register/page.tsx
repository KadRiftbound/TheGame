'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CharacterClass {
  id: string
  name: string
  description: string
  icon: string
  tier: string
}

interface Origin {
  id: string
  name: string
  description: string
  icon: string
  bonuses: string
}

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [characterName, setCharacterName] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedOrigin, setSelectedOrigin] = useState('')
  const [classes, setClasses] = useState<CharacterClass[]>([])
  const [origins, setOrigins] = useState<Origin[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      fetch('/api/classes?forCreation=true').then(res => res.json()),
      fetch('/api/classes', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_origins' })
      }).then(res => res.json())
    ]).then(([classesData, originsData]) => {
      setClasses(classesData.classes || [])
      setOrigins(originsData.origins || [])
      setLoadingData(false)
    }).catch(err => {
      console.error('Error loading data:', err)
      setLoadingData(false)
    })
  }, [])

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur d\'inscription')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setStep(2)
    } catch (err) {
      setError('Erreur d\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const handleCharacterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass || !characterName) {
      setError('Veuillez sélectionner une classe et un nom')
      return
    }
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      const res = await fetch('/api/character', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: characterName, 
          classId: selectedClass,
          originId: selectedOrigin || null
        })
      })

      const data = await res.json()

      console.log('Character creation response:', data)

      if (!res.ok) {
        setError(data.error || 'Erreur de création')
        return
      }

      router.push('/game')
    } catch (err) {
      setError('Erreur de création du personnage')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
        <h1 className="text-3xl font-bold text-amber-500 mb-2 text-center">GladiArena</h1>
        <p className="text-gray-400 text-center mb-8">
          {step === 1 ? 'Créer un compte' : 'Créer ton gladiateur'}
        </p>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Nom d'utilisateur</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                required
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Continuer'}
            </button>
          </form>
        ) : loadingData ? (
          <div className="text-center py-8 text-gray-400">Chargement...</div>
        ) : classes.length === 0 ? (
          <div className="text-center py-8 text-red-400">Aucune classe disponible</div>
        ) : (
          <form onSubmit={handleCharacterSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Nom de ton gladiateur</label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                required
                minLength={2}
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-4">Choisir ton origine</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {origins.map((origin) => {
                  const bonuses = JSON.parse(origin.bonuses || '{}')
                  return (
                    <button
                      key={origin.id}
                      type="button"
                      onClick={() => setSelectedOrigin(origin.id)}
                      className={`p-3 rounded-lg border-2 transition ${
                        selectedOrigin === origin.id
                          ? 'border-purple-500 bg-purple-900/30'
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{origin.icon}</div>
                      <div className="text-white font-bold text-sm">{origin.name}</div>
                      <div className="text-gray-400 text-xs mt-1">
                        {Object.entries(bonuses).map(([k, v]) => `${k}: +${v}`).join(', ')}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-4">Choisir ta classe</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClass(cls.id)}
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedClass === cls.id
                        ? 'border-amber-500 bg-amber-900/30'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-4xl mb-2">{cls.icon}</div>
                    <div className="text-white font-bold">{cls.name}</div>
                    <div className="text-gray-400 text-sm mt-1">{cls.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedClass}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Commencer l\'aventure'}
            </button>
          </form>
        )}

        <p className="text-gray-400 text-center mt-6">
          Déjà un compte ?{' '}
          <a href="/auth/login" className="text-amber-500 hover:text-amber-400">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  )
}
