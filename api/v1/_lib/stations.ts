import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

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
  // Try multiple paths — Vercel's cwd differs from local dev
  const paths = [
    join(process.cwd(), 'data', 'stations.json'),
    join(process.cwd(), '..', '..', '..', 'data', 'stations.json'),
  ]
  for (const p of paths) {
    try {
      const raw = readFileSync(p, 'utf-8')
      cached = JSON.parse(raw) as Station[]
      return cached
    } catch {}
  }
  throw new Error('Could not load stations.json')
}

export function findStation(id: string): Station | null {
  const stations = loadStations()
  return stations.find((s) => s.id === id) ?? null
}
