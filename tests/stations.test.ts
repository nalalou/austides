import { describe, it, expect } from 'vitest'
import { loadStations, findStation } from '../api/v1/_lib/stations'

describe('loadStations', () => {
  it('loads stations from data file', () => {
    const stations = loadStations()
    expect(stations.length).toBeGreaterThan(0)
    expect(stations[0]).toHaveProperty('id')
    expect(stations[0]).toHaveProperty('bom_id')
    expect(stations[0]).toHaveProperty('name')
    expect(stations[0]).toHaveProperty('state')
    expect(stations[0]).toHaveProperty('latitude')
    expect(stations[0]).toHaveProperty('longitude')
  })
})

describe('findStation', () => {
  it('finds a station by lowercase id', () => {
    const station = findStation('nsw_tp007')
    expect(station).not.toBeNull()
    expect(station!.name).toBe('Sydney (Fort Denison)')
  })

  it('returns null for unknown id', () => {
    const station = findStation('xyz_tp999')
    expect(station).toBeNull()
  })
})
