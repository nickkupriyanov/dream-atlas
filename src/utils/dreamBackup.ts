import type {
  DreamAnalysis,
  DreamEntry,
  SymbolFeedbackStatus,
} from '../types/dream'

const blankAnalysis: DreamAnalysis = {
  characters: [],
  emotions: [
    { label: 'quiet', intensity: 24 },
    { label: 'unclear', intensity: 18 },
  ],
  places: [],
  recurringThemes: [],
  summary: 'Add the dream, then run analysis to surface its first patterns.',
  symbols: [],
  tone: 'unread',
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

function normalizeSymbolLabel(label: string) {
  return label.trim().toLowerCase()
}

function readSymbolFeedback(value: unknown) {
  if (!isRecord(value)) {
    return {}
  }

  return Object.entries(value).reduce<Record<string, SymbolFeedbackStatus>>(
    (feedback, [label, status]) => {
      const normalizedLabel = normalizeSymbolLabel(label)

      if (
        normalizedLabel &&
        (status === 'personal' ||
          status === 'questionable' ||
          status === 'wrong')
      ) {
        feedback[normalizedLabel] = status
      }

      return feedback
    },
    {},
  )
}

function readAnalysis(value: unknown): DreamAnalysis {
  const source = isRecord(value) ? value : {}
  const emotions = Array.isArray(source.emotions)
    ? source.emotions.flatMap((emotion) => {
        if (typeof emotion === 'string') {
          return [{ label: emotion, intensity: 50 }]
        }

        if (!isRecord(emotion) || typeof emotion.label !== 'string') {
          return []
        }

        return [
          {
            intensity:
              typeof emotion.intensity === 'number'
                ? Math.max(0, Math.min(100, emotion.intensity))
                : 50,
            label: emotion.label,
          },
        ]
      })
    : blankAnalysis.emotions
  const symbols = Array.isArray(source.symbols)
    ? source.symbols.flatMap((symbol) => {
        if (typeof symbol === 'string') {
          return [{ label: symbol, meaning: 'Meaning not assigned yet.' }]
        }

        if (!isRecord(symbol) || typeof symbol.label !== 'string') {
          return []
        }

        return [
          {
            label: symbol.label,
            meaning: readString(symbol.meaning, 'Meaning not assigned yet.'),
          },
        ]
      })
    : []

  return {
    characters: readStringArray(source.characters),
    emotions,
    places: readStringArray(source.places),
    recurringThemes: readStringArray(source.recurringThemes),
    summary: readString(source.summary, blankAnalysis.summary),
    symbols,
    tone: readString(source.tone, blankAnalysis.tone),
  }
}

export function normalizeDreamEntry(value: unknown, index = 0): DreamEntry {
  const source = isRecord(value) ? value : {}
  const now = Date.now().toString(36)
  const id = readString(source.id, `dream-import-${now}-${index}`)

  return {
    analysis: readAnalysis(source.analysis ?? source.insights),
    date: readString(source.date, ''),
    id,
    mood: readString(source.mood, 'unlabeled'),
    reflectionNotes: readString(source.reflectionNotes, ''),
    symbolFeedback: readSymbolFeedback(source.symbolFeedback),
    text: readString(source.text, ''),
    time: readString(source.time, ''),
    title: readString(source.title, 'Untitled Dream'),
  }
}

export function parseDreamBackup(value: unknown): DreamEntry[] {
  const dreams = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.dreams)
      ? value.dreams
      : null

  if (!dreams) {
    throw new Error('Backup must be a Dream Atlas export or an array of dreams.')
  }

  const normalizedDreams = dreams.map((dream, index) =>
    normalizeDreamEntry(dream, index),
  )

  if (normalizedDreams.length === 0) {
    throw new Error('Backup does not contain any dreams.')
  }

  return normalizedDreams
}

export function createDreamJsonBackup(dreams: DreamEntry[]) {
  return JSON.stringify(
    {
      app: 'dream-atlas',
      exportedAt: new Date().toISOString(),
      version: 1,
      dreams,
    },
    null,
    2,
  )
}

export function createDreamMarkdownBackup(dreams: DreamEntry[]) {
  const sections = dreams.map((dream) => {
    const symbols = dream.analysis.symbols
      .map((symbol) => `- ${symbol.label}: ${symbol.meaning}`)
      .join('\n')
    const emotions = dream.analysis.emotions
      .map((emotion) => `- ${emotion.label}: ${emotion.intensity}%`)
      .join('\n')

    return [
      `## ${dream.title || 'Untitled Dream'}`,
      '',
      `Date: ${dream.date || 'unlabeled'}`,
      `Time: ${dream.time || 'unlabeled'}`,
      `Mood: ${dream.mood || 'unlabeled'}`,
      dream.reflectionNotes ? `Reflection notes: ${dream.reflectionNotes}` : '',
      '',
      dream.text || '_No text recorded._',
      '',
      '### Analysis',
      '',
      `Summary: ${dream.analysis.summary}`,
      `Tone: ${dream.analysis.tone}`,
      '',
      '#### Emotions',
      emotions || '- Not detected yet',
      '',
      '#### Symbols',
      symbols || '- Not detected yet',
      '',
      `Places: ${dream.analysis.places.join(', ') || 'Not detected yet'}`,
      `Characters: ${
        dream.analysis.characters.join(', ') || 'Not detected yet'
      }`,
      `Themes: ${
        dream.analysis.recurringThemes.join(', ') || 'Not detected yet'
      }`,
    ].join('\n')
  })

  return [
    '# Dream Atlas Export',
    '',
    `Exported: ${new Date().toISOString()}`,
    `Dreams: ${dreams.length}`,
    '',
    ...sections,
  ].join('\n')
}

export function downloadTextFile(
  filename: string,
  contents: string,
  type: string,
) {
  const blob = new Blob([contents], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
