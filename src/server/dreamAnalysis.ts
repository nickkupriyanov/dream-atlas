import type { DreamAnalysis } from '../types/dream'

export const timewebAgentPrompt = `Ты анализируешь личные записи снов для приложения Dream Atlas.

Твоя задача: бережно и ясно структурировать сон, не выдавая интерпретации за факт.

Верни строго JSON без markdown, без пояснений до или после JSON, без тройных кавычек и без комментариев.

JSON должен точно соответствовать форме:
{
  "summary": string,
  "tone": string,
  "emotions": { "label": string, "intensity": number }[],
  "symbols": { "label": string, "meaning": string }[],
  "places": string[],
  "characters": string[],
  "recurringThemes": string[]
}

Правила:
- Все строки пиши на том же языке, что и текст сна.
- Если сон написан по-русски, весь ответ должен быть по-русски.
- Если сон написан по-английски, весь ответ должен быть по-английски.
- summary: 1-2 предложения, кратко и по существу.
- tone: короткая формулировка эмоционального тона сна.
- emotions: 2-5 эмоций с intensity от 0 до 100.
- symbols: 1-6 символов или образов, для каждого дай краткое grounded-meaning объяснение только по содержанию сна.
- places: перечисли значимые места из сна.
- characters: перечисли людей, существ или присутствия из сна.
- recurringThemes: перечисли повторяющиеся мотивы или темы, которые действительно следуют из текста.
- Не ставь диагнозы.
- Не делай медицинских, психиатрических или терапевтических заключений.
- Не предсказывай будущее.
- Не выдумывай детали, которых нет в тексте сна.
- Если данных мало, возвращай короткие массивы, но сохраняй все поля.
- Если что-то не упомянуто, возвращай пустой массив для соответствующего поля.`

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

export function extractJsonObject(text: string) {
  let depth = 0
  let startIndex = -1
  let inString = false
  let escaped = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]

    if (escaped) {
      escaped = false
      continue
    }

    if (character === '\\') {
      escaped = true
      continue
    }

    if (character === '"') {
      inString = !inString
      continue
    }

    if (inString) {
      continue
    }

    if (character === '{') {
      if (depth === 0) {
        startIndex = index
      }
      depth += 1
      continue
    }

    if (character === '}') {
      depth -= 1

      if (depth === 0 && startIndex >= 0) {
        return text.slice(startIndex, index + 1)
      }
    }
  }

  return text.trim()
}

function buildTimewebAgentMessage(text: string) {
  return `Текст сна:\n${text}\n\nВерни только JSON по заданной структуре.`
}

export async function requestDreamAnalysis(text: string) {
  const apiKey = process.env.TIMEWEB_AGENT_TOKEN
  const baseUrl = process.env.TIMEWEB_OPENAI_BASE_URL

  if (!baseUrl || !apiKey) {
    return createLocalAnalysis(text)
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'timeweb-agent',
      max_tokens: 1400,
      temperature: 0.2,
      top_p: 0.9,
      stream: false,
      messages: [
        {
          role: 'system',
          content: timewebAgentPrompt,
        },
        {
          role: 'user',
          content: buildTimewebAgentMessage(text),
        },
      ],
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || 'LLM request failed.')
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: unknown
      }
    }>
  }
  const content = data.choices?.[0]?.message?.content

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Timeweb Agent returned an empty response.')
  }

  const parsed = JSON.parse(extractJsonObject(content)) as unknown

  if (!isDreamAnalysis(parsed)) {
    throw new Error('Timeweb Agent returned JSON that does not match DreamAnalysis.')
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
