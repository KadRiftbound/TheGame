interface MicroZone {
  id: string
  name: string
  description?: string
  dangerLevel: number
  type: string
  hasChest?: boolean
  hasSecret?: boolean
  canSpawnBoss?: boolean
  isVisited?: boolean
}

interface ZoneMapProps {
  zoneName: string
  microZones: MicroZone[]
  onSelect: (mz: MicroZone) => void
}

const positions: Record<string, { top: string; left: string }> = {
  // Carrières Noires - 6 micro-zones
  'mz_carrieres_1': { top: '25%', left: '50%' },
  'mz_carrieres_2': { top: '35%', left: '30%' },
  'mz_carrieres_3': { top: '45%', left: '70%' },
  'mz_carrieres_4': { top: '55%', left: '40%' },
  'mz_carrieres_5': { top: '65%', left: '60%' },
  'mz_carrieres_6': { top: '75%', left: '50%' },
  // Anciens Puits - 5 micro-zones
  'mz_puits_1': { top: '30%', left: '50%' },
  'mz_puits_2': { top: '40%', left: '25%' },
  'mz_puits_3': { top: '50%', left: '75%' },
  'mz_puits_4': { top: '60%', left: '40%' },
  'mz_puits_5': { top: '70%', left: '60%' },
  // Forges des Cendres - 5 micro-zones
  'mz_forges_1': { top: '30%', left: '50%' },
  'mz_forges_2': { top: '40%', left: '20%' },
  'mz_forges_3': { top: '50%', left: '80%' },
  'mz_forges_4': { top: '60%', left: '35%' },
  'mz_forges_5': { top: '70%', left: '65%' },
  // Galeries Souterraines - 5 micro-zones
  'mz_galeries_1': { top: '25%', left: '50%' },
  'mz_galeries_2': { top: '40%', left: '30%' },
  'mz_galeries_3': { top: '50%', left: '70%' },
  'mz_galeries_4': { top: '65%', left: '45%' },
  'mz_galeries_5': { top: '75%', left: '55%' },
}

export default function ZoneMap({ zoneName, microZones, onSelect }: ZoneMapProps) {
  const getDangerColor = (level: number) => {
    if (level <= 2) return 'bg-green-500'
    if (level <= 3) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(gray 1px, transparent 1px), linear-gradient(90deg, gray 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Zone title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-2 rounded-full border border-amber-600">
        <span className="text-amber-400 font-bold">{zoneName}</span>
      </div>
      
      {/* Micro-zone points */}
      {microZones.map((mz, index) => {
        const pos = positions[mz.id] || { 
          top: `${20 + index * 12}%`, 
          left: `${30 + (index % 3) * 20}%` 
        }
        
        return (
          <div
            key={mz.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ top: pos.top, left: pos.left }}
            onClick={() => onSelect(mz)}
          >
            <div className={`w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all group-hover:scale-125 ${getDangerColor(mz.dangerLevel)}`}>
              <span className="text-lg">{mz.hasChest ? '🎁' : mz.hasSecret ? '🔮' : '📍'}</span>
            </div>
            
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-40 bg-black/90 border border-gray-700 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="font-bold text-amber-400 text-sm text-center">{mz.name}</div>
              <div className="text-xs text-gray-400 text-center mt-1">
                Danger: {mz.dangerLevel}/5
              </div>
              <div className="flex justify-center gap-2 mt-1">
                {mz.hasChest && <span className="text-amber-400">🎁</span>}
                {mz.hasSecret && <span className="text-purple-400">🔮</span>}
                {mz.canSpawnBoss && <span className="text-red-400">👹</span>}
              </div>
            </div>
          </div>
        )
      })}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/60 rounded-lg p-2 border border-gray-700">
        <div className="text-xs font-bold text-gray-400 mb-1">Danger</div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-300">Faible</span>
        </div>
        <div className="flex items-center gap-2 text-xs mt-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-300">Modéré</span>
        </div>
        <div className="flex items-center gap-2 text-xs mt-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-300">Élevé</span>
        </div>
      </div>
    </div>
  )
}