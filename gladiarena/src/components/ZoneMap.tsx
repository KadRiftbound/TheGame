interface MicroZone {
  id: string
  name: string
  description?: string
  dangerLevel: number
  type: string
  positionX?: number
  positionY?: number
  connections?: string[]
  hasChest?: boolean
  hasSecret?: boolean
  canSpawnBoss?: boolean
  isVisited?: boolean
  isCurrent?: boolean
  isAccessible?: boolean
}

interface ZoneMapProps {
  zoneName: string
  microZones: MicroZone[]
  onSelect: (mz: MicroZone) => void
  currentMicroZoneId?: string | null
}

export default function ZoneMap({ zoneName, microZones, onSelect, currentMicroZoneId }: ZoneMapProps) {
  const getDangerColor = (level: number, isCurrent: boolean, isAccessible: boolean) => {
    if (isCurrent) return 'bg-amber-500 ring-4 ring-amber-300'
    if (!isAccessible) return 'bg-gray-600 opacity-50'
    if (level <= 2) return 'bg-green-500'
    if (level <= 3) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getIcon = (mz: MicroZone) => {
    if (mz.canSpawnBoss) return '👹'
    if (mz.hasChest && mz.hasSecret) return '🎁'
    if (mz.hasSecret) return '🔮'
    if (mz.hasChest) return '🎁'
    return '📍'
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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-2 rounded-full border border-amber-600 z-10">
        <span className="text-amber-400 font-bold">{zoneName}</span>
      </div>
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {microZones.map(mz => {
          if (!mz.connections || mz.connections.length === 0) return null
          
          const isFromCurrent = mz.id === currentMicroZoneId
          
          return mz.connections.map(connId => {
            const connectedMZ = microZones.find(m => m.id === connId)
            if (!connectedMZ || !connectedMZ.positionX || !connectedMZ.positionY) return null
            
            const isConnectedToCurrent = connId === currentMicroZoneId
            const isLineActive = isFromCurrent || isConnectedToCurrent
            
            return (
              <line
                key={`${mz.id}-${connId}`}
                x1={`${(mz.positionX || 0.5) * 100}%`}
                y1={`${(mz.positionY || 0.5) * 100}%`}
                x2={`${connectedMZ.positionX! * 100}%`}
                y2={`${connectedMZ.positionY! * 100}%`}
                stroke={isLineActive ? '#22c55e' : '#4b5563'}
                strokeWidth={isLineActive ? 3 : 2}
                strokeDasharray={isLineActive ? '0' : '8,4'}
                opacity={isLineActive ? 0.8 : 0.4}
              />
            )
          })
        })}
      </svg>
      
      {/* Micro-zone points */}
      {microZones.map((mz, index) => {
        const posX = mz.positionX !== undefined ? mz.positionX * 100 : undefined
        const posY = mz.positionY !== undefined ? mz.positionY * 100 : undefined
        
        const isCurrent = mz.id === currentMicroZoneId
        const currentMZ = microZones.find(m => m.id === currentMicroZoneId)
        const currentConnections = currentMZ?.connections || []
        const isAccessible = isCurrent || currentConnections.includes(mz.id)
        
        return (
          <div
            key={mz.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all ${
              isAccessible ? 'hover:scale-110' : 'cursor-not-allowed'
            }`}
            style={{
              top: posY !== undefined ? `${posY}%` : `${20 + index * 12}%`,
              left: posX !== undefined ? `${posX}%` : `${30 + (index % 3) * 20}%`
            }}
            onClick={() => isAccessible && onSelect(mz)}
          >
            <div className={`w-12 h-12 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all ${
              getDangerColor(mz.dangerLevel, isCurrent, isAccessible)
            }`}>
              <span className="text-xl">{getIcon(mz)}</span>
            </div>
            
            <div className="absolute top-14 left-1/2 -translate-x-1/2 w-48 bg-black/90 border border-gray-700 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="font-bold text-amber-400 text-sm text-center">{mz.name}</div>
              {isCurrent && (
                <div className="text-xs text-amber-300 text-center font-bold">📍 Position actuelle</div>
              )}
              {!isCurrent && !isAccessible && (
                <div className="text-xs text-gray-500 text-center">Inaccessible</div>
              )}
              <div className="text-xs text-gray-400 text-center mt-1">
                Danger: {mz.dangerLevel}/5
              </div>
              <div className="flex justify-center gap-2 mt-1">
                {mz.hasChest && <span className="text-amber-400">🎁</span>}
                {mz.hasSecret && <span className="text-purple-400">🔮</span>}
                {mz.canSpawnBoss && <span className="text-red-400">👹</span>}
              </div>
              {mz.description && (
                <div className="text-xs text-gray-500 text-center mt-2 italic">
                  {mz.description.substring(0, 50)}...
                </div>
              )}
            </div>
          </div>
        )
      })}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/60 rounded-lg p-3 border border-gray-700">
        <div className="text-xs font-bold text-gray-400 mb-2">Légende</div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-gray-300">Actuelle</span>
        </div>
        <div className="flex items-center gap-2 text-xs mt-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-300">Accessible</span>
        </div>
        <div className="flex items-center gap-2 text-xs mt-1">
          <div className="w-3 h-3 rounded-full bg-gray-600"></div>
          <span className="text-gray-300">Bloquée</span>
        </div>
        <div className="border-t border-gray-600 mt-2 pt-2">
          <div className="flex items-center gap-2 text-xs">
            <span>🎁</span>
            <span className="text-gray-300">Coffre</span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-1">
            <span>🔮</span>
            <span className="text-gray-300">Secret</span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-1">
            <span>👹</span>
            <span className="text-gray-300">Boss</span>
          </div>
        </div>
      </div>
    </div>
  )
}