import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {
  analyzeDreamRequestBody,
  type AnalyzeDreamBody,
} from './src/server/dreamAnalysis'

function readRequestBody(request: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = ''

    request.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(payload))
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'dream-analysis-api',
      configureServer(server) {
        server.middlewares.use('/api/analyze-dream', async (request, response) => {
          if (request.method !== 'POST') {
            sendJson(response, 405, { error: 'Method not allowed.' })
            return
          }

          try {
            const rawBody = await readRequestBody(request)
            const body = JSON.parse(rawBody || '{}') as AnalyzeDreamBody
            const result = await analyzeDreamRequestBody(body)

            sendJson(response, result.statusCode, result.payload)
          } catch (error) {
            sendJson(response, 500, {
              error:
                error instanceof Error
                  ? error.message
                  : 'Unable to analyze dream.',
            })
          }
        })
      },
    },
  ],
})
