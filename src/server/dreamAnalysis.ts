import type { DreamAnalysis } from '../types/dream'

export const dreamAnalysisSchema = {
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

export const analyzeDreamPrompt = `You analyze personal dream journal entries.

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
- Return all human-facing strings in the same language as the dream text.
- If the dream text is in Russian, write summary, tone, labels, meanings, places, characters, and themes in Russian.
- Keep summary to one or two sentences.
- Keep meanings grounded in the dream text.`

type OpenAiResponse = {
  output_text?: unknown
  output?: Array<{
    content?: Array<{ type?: string; text?: string }>
  }>
}

export type AnalyzeDreamBody = {
  text?: unknown
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export function isDreamAnalysis(value: unknown): value is DreamAnalysis {
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

export function createLocalAnalysis(text: string): DreamAnalysis {
  const words = text.toLowerCase()
  const isRussian = /[а-яё]/i.test(text)
  const calm = words.includes('light') || words.includes('warm') ? 66 : 42
  const unease =
    words.includes('lost') || words.includes('dark') || words.includes('water')
      ? 62
      : 38

  if (isRussian) {
    const russianCalm = words.includes('свет') || words.includes('тепл') ? 66 : 42
    const russianUnease =
      words.includes('потер') ||
      words.includes('темн') ||
      words.includes('вода') ||
      words.includes('воде')
        ? 62
        : 38

    return {
      characters: words.includes('кто-то') || words.includes('кто то')
        ? ['безымянное присутствие']
        : [],
      emotions: [
        { label: 'любопытство', intensity: 68 },
        { label: 'тревога', intensity: russianUnease },
        { label: 'спокойствие', intensity: russianCalm },
      ],
      places: ['внутренний порог'],
      recurringThemes: ['переход', 'ориентация', 'личная память'],
      summary:
        'Сон проходит через заряженную внутреннюю сцену, соединяя память, неопределенность и поиск ориентира.',
      symbols: [
        {
          label: 'проход',
          meaning:
            'Точка перехода, где сновидец движется от одного состояния понимания к другому.',
        },
        {
          label: 'свет',
          meaning:
            'Небольшой источник ясности или эмоционального тепла внутри неопределенной обстановки.',
        },
      ],
      tone: 'тихий, рефлексивный и немного незавершенный',
    }
  }

  return {
    characters: words.includes('someone') ? ['unnamed presence'] : [],
    emotions: [
      { label: 'curiosity', intensity: 68 },
      { label: 'unease', intensity: unease },
      { label: 'calm', intensity: calm },
    ],
    places: ['interior threshold'],
    recurringThemes: ['transition', 'orientation', 'private memory'],
    summary:
      'The dream moves through a charged interior scene, holding together memory, uncertainty, and a search for orientation.',
    symbols: [
      {
        label: 'passage',
        meaning:
          'A transition point where the dreamer moves from one state of knowing to another.',
      },
      {
        label: 'light',
        meaning:
          'A small source of clarity or emotional warmth inside an uncertain setting.',
      },
    ],
    tone: 'quiet, reflective, and slightly unresolved',
  }
}

function extractResponseText(response: OpenAiResponse) {
  if (typeof response.output_text === 'string') {
    return response.output_text
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === 'output_text')?.text ?? ''
  )
}

export async function requestDreamAnalysis(text: string) {
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
      input: `Dream text:\n${text}`,
      instructions: analyzeDreamPrompt,
      model: process.env.OPENAI_MODEL ?? 'gpt-5-mini',
      text: {
        format: {
          name: 'dream_analysis',
          schema: dreamAnalysisSchema,
          strict: true,
          type: 'json_schema',
        },
      },
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || 'LLM request failed.')
  }

  const data = (await response.json()) as OpenAiResponse
  const outputText = extractResponseText(data)
  const parsed = JSON.parse(outputText) as unknown

  if (!isDreamAnalysis(parsed)) {
    throw new Error('LLM returned JSON that does not match DreamAnalysis.')
  }

  return parsed
}

export async function analyzeDreamRequestBody(body: AnalyzeDreamBody) {
  if (typeof body.text !== 'string' || !body.text.trim()) {
    return {
      payload: { error: 'Dream text is required.' },
      statusCode: 400,
    }
  }

  const analysis = await requestDreamAnalysis(body.text.trim())

  return {
    payload: { analysis },
    statusCode: 200,
  }
}
