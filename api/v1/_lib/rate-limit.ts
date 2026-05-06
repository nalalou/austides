import type { VercelResponse } from '@vercel/node'

const WINDOW_MS = 60_000
const MAX_REQUESTS = 100

const windows = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(ip: string, res: VercelResponse): boolean {
  const now = Date.now()
  let entry = windows.get(ip)

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    windows.set(ip, entry)
  }

  entry.count++

  const resetEpoch = Math.floor(entry.resetAt / 1000)
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS.toString())
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - entry.count).toString())
  res.setHeader('X-RateLimit-Reset', resetEpoch.toString())

  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    res.setHeader('Retry-After', retryAfter.toString())
    return false
  }

  return true
}

// Cleanup happens lazily in checkRateLimit — no setInterval needed in serverless
