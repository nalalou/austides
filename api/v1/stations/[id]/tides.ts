import type { VercelRequest, VercelResponse } from '@vercel/node'
import { findStation } from '../../_lib/stations'
import { fetchBomTides } from '../../_lib/bom'
import { generateRequestId, setCommonHeaders, setCacheHeaders, handleCors } from '../../_lib/headers'
import { checkRateLimit } from '../../_lib/rate-limit'
import { ApiError, formatError } from '../../_lib/errors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = generateRequestId()
  setCommonHeaders(res, requestId)

  if (req.method === 'OPTIONS') {
    handleCors(res)
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    const err = new ApiError(405, 'method_not_allowed', 'Only GET is supported.')
    return res.status(405).json(formatError(err))
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown'
  if (!checkRateLimit(ip, res)) {
    const err = new ApiError(429, 'rate_limit_exceeded', 'Too many requests. Try again later.')
    return res.status(429).json(formatError(err))
  }

  try {
    const stationId = req.query.id as string
    const station = findStation(stationId)

    if (!station) {
      const err = new ApiError(404, 'station_not_found', `No station found with ID '${stationId}'.`)
      return res.status(404).json(formatError(err))
    }

    const dateParam = req.query.date as string | undefined
    if (dateParam && !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      const err = new ApiError(422, 'invalid_date', `Date must be in YYYY-MM-DD format. Got '${dateParam}'.`)
      return res.status(422).json(formatError(err))
    }

    const predictions = await fetchBomTides(station.bom_id, dateParam)

    const etag = `"${Buffer.from(JSON.stringify(predictions)).toString('base64').slice(0, 16)}"`
    res.setHeader('ETag', etag)

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end()
    }

    setCacheHeaders(res, 3600)

    return res.status(200).json({
      object: 'tide_predictions',
      station_id: station.id,
      date: dateParam ?? new Date().toISOString().split('T')[0],
      data: predictions,
      source: 'Bureau of Meteorology, Australian Government',
    })
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.status).json(formatError(err))
    }
    const serverErr = new ApiError(500, 'internal_error', 'An unexpected error occurred.')
    return res.status(500).json(formatError(serverErr))
  }
}
