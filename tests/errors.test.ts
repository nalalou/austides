import { describe, it, expect } from 'vitest'
import { ApiError, formatError } from '../api/v1/_lib/errors'

describe('ApiError', () => {
  it('creates an error with all fields', () => {
    const err = new ApiError(404, 'station_not_found', "No station found with ID 'xyz'.")
    expect(err.status).toBe(404)
    expect(err.code).toBe('station_not_found')
    expect(err.message).toBe("No station found with ID 'xyz'.")
  })
})

describe('formatError', () => {
  it('formats error as JSON response body', () => {
    const err = new ApiError(404, 'station_not_found', "No station found with ID 'xyz'.")
    const body = formatError(err)
    expect(body).toEqual({
      error: {
        status: 404,
        code: 'station_not_found',
        message: "No station found with ID 'xyz'.",
        doc_url: 'https://github.com/austides/austides/blob/main/docs/errors.md#station_not_found',
      },
    })
  })

  it('generates doc_url from error code', () => {
    const err = new ApiError(422, 'invalid_date', 'Bad date.')
    const body = formatError(err)
    expect(body.error.doc_url).toBe(
      'https://github.com/austides/austides/blob/main/docs/errors.md#invalid_date'
    )
  })
})
