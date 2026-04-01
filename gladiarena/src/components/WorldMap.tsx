'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Zone {
  id: string
  name: string
  slug: string
  minLevel: number
  maxLevel: number
  difficulty: string
  description: string
  worldX: number
  worldY: number
}

interface WorldMapProps {
  zones: Zone[]
  currentCityId?: string
  onSelectZone: (zone: Zone) => void
}

export default function WorldMap({ zones, currentCityId, onSelectZone }: WorldMapProps) {
  const [hoveredZone, setHoveredZone] = useState<Zone | null>(null)

  // Position zones on the map based on worldX/worldY
  const getZonePosition = (zone: Zone) => {
    // Map coordinates to percentage positions on the image
    // Adjust these values based on actual image layout
    const positions: Record<string, { top: string; left: string }> = {
      'zone_carrieres_noires': { top: '35%', left: '50%' },
      'zone_anciens_puits': { top: '40%', left: '70%' },
      'zone_forges_cendres': { top: '40%', left: '30%' },
      'zone_galeries_souterraines': { top: '60%', left: '50%' },
    }
    return positions[zone.id] || { top: '50%', left: '50%' }
  }

  const getZoneColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'normal': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      case 'secret': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-xl overflow-hidden border-2 border-amber-900/50">
      {/* Map Background - using the generated cartography image */}
      <div className="absolute inset-0 bg-cover bg-center" 
        style={{ 
          backgroundImage: "url('/images/maps/bastion_fer_world.png')",
          filter: 'brightness(0.7) contrast(1.1)'
        }} 
      />
      
      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* City marker (Bastion de Fer) */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
        style={{ top: '85%', left: '50%' }}
      >
        <div className="w-8 h-8 bg-amber-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
          <span className="text-lg">🏰</span>
        </div>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-xs font-bold text-amber-400 whitespace-nowrap bg-black/70 px-2 py-1 rounded">
          Bastion de Fer
        </div>
      </div>

      {/* Zone markers */}
      {zones.map((zone) => {
        const pos = getZonePosition(zone)
        const isHovered = hoveredZone?.id === zone.id
        
        return (
          <div
            key={zone.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ top: pos.top, left: pos.left }}
            onMouseEnter={() => setHoveredZone(zone)}
            onMouseLeave={() => setHoveredZone(null)}
            onClick={() => onSelectZone(zone)}
          >
            {/* Zone marker */}
            <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all ${
              getZoneColor(zone.difficulty)
            } ${isHovered ? 'scale-125' : 'scale-100'}`}>
              <span className="text-xs">📍</span>
            </div>
            
            {/* Zone tooltip on hover */}
            <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-48 bg-black/90 border border-gray-700 rounded-lg p-3 transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
              <div className="font-bold text-amber-400 text-sm">{zone.name}</div>
              <div className="text-xs text-gray-400 mt-1">Nv. {zone.minLevel}-{zone.maxLevel}</div>
              <div className={`text-xs mt-1 px-2 py-0.5 rounded inline-block ${
                zone.difficulty === 'easy' ? 'bg-green-900 text-green-300' :
                zone.difficulty === 'normal' ? 'bg-yellow-900 text-yellow-300' :
                zone.difficulty === 'hard' ? 'bg-red-900 text-red-300' :
                'bg-purple-900 text-purple-300'
              }`}>
                {zone.difficulty === 'easy' ? 'Facile' :
                 zone.difficulty === 'normal' ? 'Normal' :
                 zone.difficulty === 'hard' ? 'Difficile' : 'Secret'}
              </div>
              <div className="text-xs text-gray-500 mt-2 line-clamp-2">{zone.description}</div>
            </div>
          </div>
        )
      })}

      {/* Compass decoration */}
      <div className="absolute bottom-4 right-4 w-16 h-16 bg-black/50 rounded-full flex items-center justify-center border border-amber-700">
        <span className="text-2xl">🧭</span>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-black/60 rounded-lg p-3 border border-gray-700">
        <div className="text-xs font-bold text-gray-400 mb-2">Légende</div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-300">Facile</span>
        </div>
        <div className="flex items-center gap-2 text-xs mt-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-300">Normal</span>
        </div>
        <div className="flex items-center gap-2 text-xs mt-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-300">Difficile</span>
        </div>
        <div className="flex items-center gap-2 text-xs mt-1">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-gray-300">Secret</span>
        </div>
      </div>
    </div>
  )
}