import { describe, it, expect } from 'vitest'
import { parseBomHtml } from '../api/v1/_lib/bom'

const FIXTURE_HTML = `
<h2 class="tide">Sydney (Fort Denison), NSW &nbsp;&ndash;&nbsp; May 2026</h2>
<div class="tide-day first-day">
<h3>Wed 6 May</h3>
  <table cellpadding="0" cellspacing="0" summary="Times and Heights">
  <tbody>
    <tr>
      <th rowspan="2" class="instance low-tide">Low</th>
      <td data-time-utc="2026-05-06T20:09:00Z" class="localtime low-tide">8:09 pm</td>
    </tr>
    <tr>
      <td class="height low-tide">0.65 m</td>
    </tr>
    <tr>
      <th rowspan="2" class="instance high-tide">High</th>
      <td data-time-utc="2026-05-07T02:03:00Z" class="localtime high-tide">2:03 am</td>
    </tr>
    <tr>
      <td class="height high-tide">1.25 m</td>
    </tr>
    <tr>
      <th rowspan="2" class="instance low-tide">Low</th>
      <td data-time-utc="2026-05-07T07:17:00Z" class="localtime low-tide">7:17 am</td>
    </tr>
    <tr>
      <td class="height low-tide">0.82 m</td>
    </tr>
    <tr>
      <th rowspan="2" class="instance high-tide">High</th>
      <td data-time-utc="2026-05-07T13:56:00Z" class="localtime high-tide">1:56 pm</td>
    </tr>
    <tr>
      <td class="height high-tide">1.64 m</td>
    </tr>
  </tbody>
  </table>
</div>
`

describe('parseBomHtml', () => {
  it('extracts tide predictions from BOM HTML', () => {
    const tides = parseBomHtml(FIXTURE_HTML)
    expect(tides).toHaveLength(4)
  })

  it('extracts correct time values as ISO 8601 UTC', () => {
    const tides = parseBomHtml(FIXTURE_HTML)
    expect(tides[0].time).toBe('2026-05-06T20:09:00Z')
    expect(tides[1].time).toBe('2026-05-07T02:03:00Z')
  })

  it('extracts correct height values in metres', () => {
    const tides = parseBomHtml(FIXTURE_HTML)
    expect(tides[0].height_m).toBe(0.65)
    expect(tides[1].height_m).toBe(1.25)
    expect(tides[3].height_m).toBe(1.64)
  })

  it('extracts correct tide type (high/low)', () => {
    const tides = parseBomHtml(FIXTURE_HTML)
    expect(tides[0].type).toBe('low')
    expect(tides[1].type).toBe('high')
    expect(tides[2].type).toBe('low')
    expect(tides[3].type).toBe('high')
  })

  it('returns empty array for empty/invalid HTML', () => {
    expect(parseBomHtml('')).toEqual([])
    expect(parseBomHtml('<html><body></body></html>')).toEqual([])
  })
})
