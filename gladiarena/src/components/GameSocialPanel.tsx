'use client'

interface TitleItem {
  id: string
  name: string
  icon: string
  earned: boolean
}

interface ChronicleRecord {
  id: string
  type: 'BOSS_KILL' | 'ZONE_DISCOVERY' | 'CHEST_OPEN' | string
  playerName: string
  targetName?: string | null
  zoneName?: string | null
  timestamp: string
}

interface GameSocialPanelProps {
  mode: 'titles' | 'chronicles'
  titles: Array<{ id: string; name: string; icon: string }>
  allTitles: TitleItem[]
  chronicles: ChronicleRecord[]
}

export default function GameSocialPanel({ mode, titles, allTitles, chronicles }: GameSocialPanelProps) {
  if (mode === 'titles') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🏆 Titres</h2>
          <div className="text-amber-400 font-bold">
            {titles.length} / {allTitles.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allTitles.map(title => (
            <div
              key={title.id}
              className={`rounded-xl p-4 border-2 transition-all ${
                title.earned 
                  ? 'bg-gradient-to-br from-amber-900/30 to-gray-900 border-amber-500/50' 
                  : 'bg-gray-900/50 border-gray-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  title.earned ? 'bg-amber-600/30' : 'bg-gray-800'
                }`}>
                  {title.icon}
                </div>
                <div>
                  <div className={`font-bold text-lg ${title.earned ? 'text-amber-400' : 'text-gray-400'}`}>
                    {title.name}
                  </div>
                  {title.earned && (
                    <span className="text-green-400 text-xs">✓ Obtenu</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {titles.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-lg">Aucun titre obtenu</p>
            <p className="text-sm mt-2">Combattez et accomplissez des hauts faits pour gagner des titres!</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">📜 Chroniques du Serveur</h2>
        <div className="text-amber-400 font-bold">
          {chronicles.length} événements
        </div>
      </div>

      <div className="space-y-3">
        {chronicles.map((record) => (
          <div key={record.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                  record.type === 'BOSS_KILL' ? 'bg-red-900/50' : 
                  record.type === 'ZONE_DISCOVERY' ? 'bg-purple-900/50' :
                  'bg-amber-900/50'
                }`}>
                  {record.type === 'BOSS_KILL' ? '💀' : 
                    record.type === 'ZONE_DISCOVERY' ? '🗺️' : '🎁'}
                </div>
                <div>
                  <div className="font-bold text-amber-400">{record.playerName}</div>
                  <div className="text-sm text-gray-400">
                    {record.type === 'BOSS_KILL' && `A vaincu ${record.targetName}`}
                    {record.type === 'ZONE_DISCOVERY' && `A découvert ${record.zoneName}`}
                    {record.type === 'CHEST_OPEN' && `A ouvert un coffre ${record.zoneName ? `dans ${record.zoneName}` : ''}`}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(record.timestamp).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {chronicles.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-6xl mb-4">📜</div>
          <p className="text-lg">Aucune entrée dans les Chroniques</p>
          <p className="text-sm mt-2">Soyez le premier à accomplir des hauts faits!</p>
        </div>
      )}
    </div>
  )
}
