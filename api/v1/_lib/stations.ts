import stationsData from '../../../data/stations.json'

export interface Station {
  id: string
  bom_id: string
  name: string
  state: string
  latitude: number
  longitude: number
}

const stations: Station[] = stationsData as Station[]

export function loadStations(): Station[] {
  return stations
}

export function findStation(id: string): Station | null {
  const stations = loadStations()
  return stations.find((s) => s.id === id) ?? null
}
