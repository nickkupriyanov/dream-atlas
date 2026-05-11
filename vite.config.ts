import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const dreamAnalysisSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'summary',
    'tone',
    'emotions',
    'symbols',
    'places',
    'characters',
    'recurringThemes',
  ],
  properties: {
    summary: { type: 'string' },
    tone: { type: 'string' },
    emotions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'intensity'],
        properties: {
          label: { type: 'string' },
          intensity: { type: 'number', minimum: 0, maximum: 100 },
        },
      },
    },
    symbols: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'meaning'],
        properties: {
          label: { type: 'string' },
          meaning: { type: 'string' },
        },
      },
    },
    places: { type: 'array', items: { type: 'string' } },
    characters: { type: 'array', items: { type: 'string' } },
    recurringThemes: { type: 'array', items: { type: 'string' } },
  },
}

const analyzeDreamPrompt = `You analyze personal dream journal entries.

Return strictly valid JSON only. Do not include markdown, code fences, comments, prose outside JSON, or explanations.

The JSON object must match this TypeScript shape exactly:
{
  "summary": string,
  "tone": string,
  "emotions": { "label": string, "intensity": number }[],
  "symbols": { "label": string, "meaning": string }[],
  "places": string[],
  "characters": string[],
  "recurringThemes": string[]
}

Rules:
- intensity is a number from 0 to 100.
- Use concise, human labels.
- Keep summary to one or two sentences.
- Keep meanings grounded in the dream text.`

type DreamAnalysis = {
  summary: string
  tone: string
  emotions: { label: string; intensity: number }[]
  symbols: { label: string; meaning: string }[]
  places: string[]
  characters: string[]
  recurringThemes: string[]
}

type JsonBody = {
  text?: unknown
}

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

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isDreamAnalysis(value: unknown): value is DreamAnalysis {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<DreamAnalysis>

  return (
    typeof candidate.summary === 'string' &&
    typeof candidate.tone === 'string' &&
    Array.isArray(candidate.emotions) &&
    candidate.emotions.every(
      (emotion) =>
        typeof emotion.label === 'string' &&
        typeof emotion.intensity === 'number' &&
        emotion.intensity >= 0 &&
        emotion.intensity <= 100,
    ) &&
    Array.isArray(candidate.symbols) &&
    candidate.symbols.every(
      (symbol) =>
        typeof symbol.label === 'string' && typeof symbol.meaning === 'string',
    ) &&
    isStringArray(candidate.places) &&
    isStringArray(candidate.characters) &&
    isStringArray(candidate.recurringThemes)
  )
}

function createLocalAnalysis(text: string): DreamAnalysis {
  const words = text.toLowerCase()
  const calm = words.includes('light') || words.includes('warm') ? 66 : 42
  const unease =
    words.includes('lost') || words.includes('dark') || words.includes('water')
      ? 62
      : 38

  return {
    summary:
      'The dream moves through a charged interior scene, holding together memory, uncertainty, and a search for orientation.',
    tone: 'quiet, reflective, and slightly unresolved',
    emotions: [
      { label: 'curiosity', intensity: 68 },
      { label: 'unease', intensity: unease },
      { label: 'calm', intensity: calm },
    ],
    symbols: [
      {
        label: 'passage',
        meaning: 'A transition point where the dreamer moves from one state of knowing to another.',
      },
      {
        label: 'light',
        meaning: 'A small source of clarity or emotional warmth inside an uncertain setting.',
      },
    ],
    places: ['interior threshold'],
    characters: words.includes('someone') ? ['unnamed presence'] : [],
    recurringThemes: ['transition', 'orientation', 'private memory'],
  }
}

function extractResponseText(response: {
  output_text?: unknown
  output?: Array<{
    content?: Array<{ type?: string; text?: string }>
  }>
}) {
  if (typeof response.output_text === 'string') {
    return response.output_text
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === 'output_text')?.text ?? ''
  )
}

async function requestLlmAnalysis(text: string) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return createLocalAnalysis(text)
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-5-mini',
      instructions: analyzeDreamPrompt,
      input: `Dream text:\n${text}`,
      text: {
        format: {
          type: 'json_schema',
          name: 'dream_analysis',
          strict: true,
          schema: dreamAnalysisSchema,
        },
      },
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || 'LLM request failed.')
  }

  const data = (await response.json()) as Parameters<typeof extractResponseText>[0]
  const outputText = extractResponseText(data)
  const parsed = JSON.parse(outputText) as unknown

  if (!isDreamAnalysis(parsed)) {
    throw new Error('LLM returned JSON that does not match DreamAnalysis.')
  }

  return parsed
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
            const body = JSON.parse(rawBody || '{}') as JsonBody

            if (typeof body.text !== 'string' || !body.text.trim()) {
              sendJson(response, 400, {
                error: 'Dream text is required.',
              })
              return
            }

            const analysis = await requestLlmAnalysis(body.text.trim())
            sendJson(response, 200, { analysis })
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
