'use client'

import CityMap from '@/components/CityMap'
import WorldMap from '@/components/WorldMap'

interface WorldZone {
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

interface CityPOI {
  id: string
  name: string
  type: 'merchant' | 'npc' | 'portal' | 'building'
  x: number
  y: number
  description?: string
}

interface ZoneMapProps {
  mode: 'world' | 'city'
  zones: WorldZone[]
  cityName: string
  pois: CityPOI[]
  onSelectZone: (zone: WorldZone) => void
  onSelectPOI: (poi: CityPOI) => void
}

export default function ZoneMap({ mode, zones, cityName, pois, onSelectZone, onSelectPOI }: ZoneMapProps) {
  if (mode === 'world') {
    return <WorldMap zones={zones} onSelectZone={onSelectZone} />
  }

  return <CityMap cityName={cityName} pois={pois} onSelectPOI={onSelectPOI} />
}
