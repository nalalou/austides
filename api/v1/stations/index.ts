import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loadStations } from '../_lib/stations'
import { generateRequestId, setCommonHeaders, setCacheHeaders, handleCors } from '../_lib/headers'
import { checkRateLimit } from '../_lib/rate-limit'
import { ApiError, formatError } from '../_lib/errors'

export default function handler(req: VercelRequest, res: VercelResponse) {
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

  const stations = loadStations()

  setCacheHeaders(res, 86400)

  return res.status(200).json({
    object: 'list',
    data: stations.map((s) => ({
      object: 'station',
      id: s.id,
      name: s.name,
      state: s.state,
      latitude: s.latitude,
      longitude: s.longitude,
    })),
    count: stations.length,
  })
}
