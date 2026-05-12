import type { DreamEntry } from '../types/dream'
import { getDreamTitle } from './dreamSignature'

export type WeeklyDigest = {
  dreamCount: number
  dominantEmotion: string
  topSymbols: string[]
  topThemes: string[]
  note: string
}

export type SimilarDream = {
  id: string
  title: string
  date: string
  mood: string
  sharedSignals: string[]
  score: number
}

function normalizeLabel(label: string) {
  return label.trim().toLowerCase()
}

function countLabels(labels: string[]) {
  const counts = new Map<string, { count: number; label: string }>()

  labels.forEach((label) => {
    const normalized = normalizeLabel(label)

    if (!normalized) {
      return
    }

    const existing = counts.get(normalized)

    counts.set(normalized, {
      count: (existing?.count ?? 0) + 1,
      label: existing?.label ?? label.trim(),
    })
  })

  return [...counts.values()]
    .sort((first, second) =>
      second.count === first.count
        ? first.label.localeCompare(second.label)
        : second.count - first.count,
    )
    .map((item) => item.label)
}

function dreamSignals(dream: DreamEntry) {
  return [
    ...dream.analysis.symbols.map((symbol) => symbol.label),
    ...dream.analysis.recurringThemes,
    ...dream.analysis.places,
    ...dream.analysis.characters,
    ...dream.analysis.emotions.map((emotion) => emotion.label),
  ]
}

export function createWeeklyDigest(dreams: DreamEntry[]): WeeklyDigest {
  const recentDreams = dreams.slice(0, 7)
  const emotions = recentDreams.flatMap((dream) =>
    dream.analysis.emotions.map((emotion) => emotion.label),
  )
  const topThemes = countLabels(
    recentDreams.flatMap((dream) => dream.analysis.recurringThemes),
  ).slice(0, 3)
  const topSymbols = countLabels(
    recentDreams.flatMap((dream) =>
      dream.analysis.symbols.map((symbol) => symbol.label),
    ),
  ).slice(0, 3)
  const dominantEmotion = countLabels(emotions)[0] ?? 'unread'
  const motif =
    topThemes[0] ?? topSymbols[0] ?? dominantEmotion ?? 'quiet observation'

  return {
    dominantEmotion,
    dreamCount: recentDreams.length,
    note:
      recentDreams.length > 0
        ? `You may be circling ${motif}; ${dominantEmotion} shapes the emotional weather around it.`
        : 'No digest yet.',
    topSymbols,
    topThemes,
  }
}

export function findSimilarDreams(
  selectedDream: DreamEntry | undefined,
  dreams: DreamEntry[],
) {
  if (!selectedDream) {
    return []
  }

  const selectedSignals = new Set(dreamSignals(selectedDream).map(normalizeLabel))

  if (selectedSignals.size === 0) {
    return []
  }

  return dreams
    .filter((dream) => dream.id !== selectedDream.id)
    .map<SimilarDream>((dream) => {
      const sharedSignals = dreamSignals(dream).filter((signal) =>
        selectedSignals.has(normalizeLabel(signal)),
      )
      const uniqueSharedSignals = countLabels(sharedSignals)

      return {
        date: dream.date,
        id: dream.id,
        mood: dream.mood,
        score: uniqueSharedSignals.length,
        sharedSignals: uniqueSharedSignals,
        title: getDreamTitle(dream),
      }
    })
    .filter((dream) => dream.score > 0)
    .sort((first, second) =>
      second.score === first.score
        ? first.title.localeCompare(second.title)
        : second.score - first.score,
    )
    .slice(0, 3)
}
