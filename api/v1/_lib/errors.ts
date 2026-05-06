const DOCS_BASE = 'https://github.com/austides/austides/blob/main/docs/errors.md'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

export function formatError(err: ApiError) {
  return {
    error: {
      status: err.status,
      code: err.code,
      message: err.message,
      doc_url: `${DOCS_BASE}#${err.code}`,
    },
  }
}
