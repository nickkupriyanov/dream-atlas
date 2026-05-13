import {
  analyzeDreamRequestBody,
  type AnalyzeDreamBody,
} from '../src/server/dreamAnalysis'

export const config = {
  runtime: 'nodejs',
}

type VercelRequest = {
  body?: unknown
  method?: string
}

type VercelResponse = {
  status: (statusCode: number) => VercelResponse
  json: (payload: unknown) => void
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed.' })
    return
  }

  try {
    const body =
      typeof request.body === 'string'
        ? (JSON.parse(request.body || '{}') as AnalyzeDreamBody)
        : (request.body as AnalyzeDreamBody)
    const result = await analyzeDreamRequestBody(body ?? {})

    response.status(result.statusCode).json(result.payload)
  } catch (error) {
    console.error('Dream analysis API failed', {
      error: error instanceof Error ? error.message : error,
      hasBody: Boolean(request.body),
      method: request.method,
    })

    response.status(500).json({
      error:
        error instanceof Error ? error.message : 'Unable to analyze dream.',
    })
  }
}
