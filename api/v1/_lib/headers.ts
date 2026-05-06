import { randomBytes } from 'crypto'
import type { VercelResponse } from '@vercel/node'

export function generateRequestId(): string {
  return `req_${randomBytes(12).toString('hex')}`
}

export function setCommonHeaders(res: VercelResponse, requestId: string): void {
  res.setHeader('X-Request-Id', requestId)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
}

export function setCacheHeaders(res: VercelResponse, maxAge: number): void {
  res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}`)
}

export function handleCors(res: VercelResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '86400')
  return true
}
