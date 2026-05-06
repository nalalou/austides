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
const UA = 'austides-scraper/1.0 (https://github.com/austides/austides)'

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.text()
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getStationIds(): Promise<{ bomId: string; state: string }[]> {
  const html = await fetchPage(BOM_TIDES_URL)
  const ids = [...html.matchAll(/([A-Z]{2,3}_TP\d+)/g)].map((m) => m[1])
  const unique = [...new Set(ids)]
  return unique.map((bomId) => ({
    bomId,
    state: bomId.split('_')[0],
  }))
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
  console.error(`Found ${stationRefs.length} stations`)

  const stations: Station[] = []

  for (let i = 0; i < stationRefs.length; i++) {
    const ref = stationRefs[i]
    console.error(`  [${i + 1}/${stationRefs.length}] ${ref.bomId}...`)

    try {
      const name = await getStationName(ref.bomId)
      stations.push({
        id: ref.bomId.toLowerCase(),
        bom_id: ref.bomId,
        name,
        state: ref.state,
        latitude: 0,
        longitude: 0,
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
