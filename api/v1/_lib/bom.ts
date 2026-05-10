import * as cheerio from 'cheerio'
import { ApiError } from './errors'

export interface TidePrediction {
  time: string
  height_m: number
  type: 'high' | 'low'
}

const BOM_BASE = 'https://www.bom.gov.au/australia/tides/print.php'

export function parseBomHtml(html: string): TidePrediction[] {
  const $ = cheerio.load(html)
  const predictions: TidePrediction[] = []

  $('td[data-time-utc]').each((_, el) => {
    const $el = $(el)
    const time = $el.attr('data-time-utc')
    if (!time) return

    const isHigh = $el.hasClass('high-tide')
    const isLow = $el.hasClass('low-tide')
    if (!isHigh && !isLow) return

    // Height is in the next <td> in the same row group
    const $heightTd = $el.parent().next('tr').find('td.height')
    const heightText = $heightTd.text().trim()
    const heightMatch = heightText.match(/([\d.]+)\s*m/)
    if (!heightMatch) return

    predictions.push({
      time,
      height_m: parseFloat(heightMatch[1]),
      type: isHigh ? 'high' : 'low',
    })
  })

  return predictions
}

export async function fetchBomTides(bomId: string, date?: string): Promise<TidePrediction[]> {
  const params = new URLSearchParams({
    aac: bomId,
    type: 'tide',
    days: '2',
  })

  if (date) {
    params.set('start_dt', date)
  }

  const url = `${BOM_BASE}?${params}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-AU,en;q=0.9',
    },
  })

  if (!res.ok) {
    throw new ApiError(503, 'upstream_unavailable', `BOM returned ${res.status}`)
  }

  const html = await res.text()
  const predictions = parseBomHtml(html)

  if (predictions.length === 0) {
    throw new ApiError(503, 'upstream_unavailable', 'BOM returned no tide data')
  }

  if (date) {
    const filtered = predictions.filter((p) => p.time.startsWith(date))
    if (filtered.length === 0) {
      throw new ApiError(404, 'no_data_for_date', `No tide data available for ${date}`)
    }
    return filtered
  }

  return predictions
}
