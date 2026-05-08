import * as cheerio from 'cheerio'
import { writeFileSync } from 'fs'
import { join } from 'path'

interface Station {
  id: string
  bom_id: string
  name: string
  state: string
  latitude: number
  longitude: number
}

const BOM_TIDES_URL = 'https://www.bom.gov.au/australia/tides/'
const BOM_PRINT_URL = 'https://www.bom.gov.au/australia/tides/print.php'
const BOM_SITES_URL = 'https://www.bom.gov.au/australia/tides/tide_prediction_sites.json'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'

const MANUAL_COORDINATES = new Map<string, { latitude: number; longitude: number }>([
  ['QLD_TP099', { latitude: -18.4667, longitude: 146.8667 }],
  ['WA_TP029', { latitude: -12.8333, longitude: 128.4667 }],
  ['WA_TP049', { latitude: -30.3, longitude: 115.0333 }],
  ['WA_TP088', { latitude: -34.3333, longitude: 115.1667 }],
])

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.text()
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getStationIds(): Promise<{ bomId: string; state: string; listName: string }[]> {
  const html = await fetchPage(BOM_TIDES_URL)
  const $ = cheerio.load(html)
  const stationRefs = $('a.feature')
    .map((_, el) => ({
      bomId: $(el).attr('id'),
      listName: $(el).text().trim(),
    }))
    .get()
    .filter((ref): ref is { bomId: string; listName: string } => {
      return typeof ref.bomId === 'string' && /^[A-Z]{2,3}_TP\d+$/.test(ref.bomId)
    })

  const unique = new Map(stationRefs.map((ref) => [ref.bomId, ref]))
  return [...unique.values()].map(({ bomId, listName }) => ({
    bomId,
    listName,
    state: bomId.split('_')[0],
  }))
}

async function getStationCoordinates(): Promise<Map<string, { latitude: number; longitude: number }>> {
  const json = await fetchPage(BOM_SITES_URL)
  const geojson = JSON.parse(json) as {
    features: Array<{
      properties: { AAC: string; LAT?: number; LON?: number }
      geometry?: { coordinates?: [number, number] }
    }>
  }

  const coordinates = new Map<string, { latitude: number; longitude: number }>()

  for (const feature of geojson.features) {
    const bomId = feature.properties.AAC
    const longitude = feature.properties.LON ?? feature.geometry?.coordinates?.[0]
    const latitude = feature.properties.LAT ?? feature.geometry?.coordinates?.[1]

    if (!bomId || latitude == null || longitude == null) continue
    coordinates.set(bomId, { latitude, longitude })
  }

  for (const [bomId, coordinate] of MANUAL_COORDINATES) {
    coordinates.set(bomId, coordinate)
  }

  return coordinates
}

async function getStationName(bomId: string): Promise<string> {
  const html = await fetchPage(`${BOM_PRINT_URL}?aac=${bomId}&type=tide&days=1`)
  const $ = cheerio.load(html)
  const heading = $('h2.tide').text()
  const match = heading.match(/^(.+?),\s*[A-Z]{2,3}\s/)
  return match ? match[1].trim() : bomId
}

async function main() {
  console.error('Fetching BOM station list...')
  const stationRefs = await getStationIds()
  const coordinates = await getStationCoordinates()
  console.error(`Found ${stationRefs.length} stations`)

  const stations: Station[] = []

  for (let i = 0; i < stationRefs.length; i++) {
    const ref = stationRefs[i]
    console.error(`  [${i + 1}/${stationRefs.length}] ${ref.bomId}...`)

    try {
      const scrapedName = await getStationName(ref.bomId)
      const name = scrapedName === ref.bomId ? ref.listName : scrapedName
      const coordinate = coordinates.get(ref.bomId)
      if (!coordinate) throw new Error(`No coordinates found for ${ref.bomId}`)

      stations.push({
        id: ref.bomId.toLowerCase(),
        bom_id: ref.bomId,
        name,
        state: ref.state,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      })
    } catch (err) {
      console.error(`    SKIP: ${(err as Error).message}`)
    }

    if ((i + 1) % 5 === 0) await sleep(2000)
  }

  const outPath = join(process.cwd(), 'data', 'stations.json')
  writeFileSync(outPath, JSON.stringify(stations, null, 2))
  console.error(`\nWrote ${stations.length} stations to ${outPath}`)
  console.error('NOTE: latitude/longitude must be added manually or via geocoding.')
}

main().catch(console.error)
