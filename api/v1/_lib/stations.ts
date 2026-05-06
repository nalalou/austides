import { readFileSync } from 'fs'
import { join } from 'path'

export interface Station {
  id: string
  bom_id: string
  name: string
  state: string
  latitude: number
  longitude: number
}

let cached: Station[] | null = null

export function loadStations(): Station[] {
  if (cached) return cached
  const filePath = join(process.cwd(), 'data', 'stations.json')
  const raw = readFileSync(filePath, 'utf-8')
  cached = JSON.parse(raw) as Station[]
  return cached
}

export function findStation(id: string): Station | null {
  const stations = loadStations()
  return stations.find((s) => s.id === id) ?? null
}
