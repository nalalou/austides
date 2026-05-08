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

  it('has usable coordinates for major stations', () => {
    const stationIds = [
      'nsw_tp007',
      'qld_tp003',
      'vic_tp003',
      'sa_tp001',
      'wa_tp015',
      'tas_tp001',
      'nt_tp001',
    ]

    for (const id of stationIds) {
      const station = findStation(id)
      expect(station, `${id} should exist`).not.toBeNull()
      expect(station!.latitude, `${id} latitude should not be a placeholder`).not.toBe(0)
      expect(station!.longitude, `${id} longitude should not be a placeholder`).not.toBe(0)
    }
  })

  it('has usable coordinates for every station', () => {
    const stations = loadStations()

    for (const station of stations) {
      expect(station.latitude, `${station.id} latitude should not be a placeholder`).not.toBe(0)
      expect(station.longitude, `${station.id} longitude should not be a placeholder`).not.toBe(0)
    }
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
