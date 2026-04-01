'use client'

import { useState } from 'react'

interface POI {
  id: string
  name: string
  type: 'merchant' | 'npc' | 'portal' | 'building'
  x: number
  y: number
  description?: string
}

interface CityMapProps {
  cityName: string
  pois: POI[]
  onSelectPOI: (poi: POI) => void
}

export default function CityMap({ cityName, pois, onSelectPOI }: CityMapProps) {
  const [hoveredPOI, setHoveredPOI] = useState<POI | null>(null)

  const getPOIIcon = (type: string) => {
    switch (type) {
      case 'merchant': return '🏪'
      case 'npc': return '👤'
      case 'portal': return '🚪'
      case 'building': return '🏛️'
      default: return '📍'
    }
  }

  const getPOIColor = (type: string) => {
    switch (type) {
      case 'merchant': return 'bg-amber-500'
      case 'npc': return 'bg-blue-500'
      case 'portal': return 'bg-purple-500'
      case 'building': return 'bg-gray-500'
      default: return 'bg-white'
    }
  }

  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-xl overflow-hidden border-2 border-amber-900/50">
      <div className="absolute inset-0 bg-cover bg-center" 
        style={{ 
          backgroundImage: "url('/images/maps/bastion_fer_city.png')",
          filter: 'brightness(0.8) contrast(1.1)'
        }} 
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full border border-amber-600">
        <span className="text-amber-400 font-bold">{cityName}</span>
      </div>

      {pois.map((poi) => (
        <div
          key={poi.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ top: `${poi.y}%`, left: `${poi.x}%` }}
          onMouseEnter={() => setHoveredPOI(poi)}
          onMouseLeave={() => setHoveredPOI(null)}
          onClick={() => onSelectPOI(poi)}
        >
          <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all ${
            getPOIColor(poi.type)
          } ${hoveredPOI?.id === poi.id ? 'scale-125' : 'scale-100'}`}>
            <span className="text-lg">{getPOIIcon(poi.type)}</span>
          </div>
          
          <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-40 bg-black/90 border border-gray-700 rounded-lg p-2 transition-opacity ${
            hoveredPOI?.id === poi.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <div className="font-bold text-amber-400 text-sm">{poi.name}</div>
            {poi.description && (
              <div className="text-xs text-gray-400 mt-1">{poi.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}